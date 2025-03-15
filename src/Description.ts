export class ForgeDescription implements ForgeObject<DescriptionOptions, Description> {
	input: DescriptionOptions
	output?: Description

	private constructor(input: DescriptionOptions) {
		this.input = input
	}

	/**
	 * @param input - {@link DescriptionOptions} that created this ForgeObject
	 * @returns The created {@link ForgeObject}, note that the output still needs to be generated
	 */
	static fromOptions(input: DescriptionOptions): ForgeDescription {
		return new ForgeDescription(input)
	}

	validate(): string {
		// TODO: DescriptionOptions validation
		return ""
	}

	private prompt(): string {
		var prompt = ''
		prompt += `I would like a description for a(n) {${this.input.type}}.\n`
		switch (this.input.length) {
			case "short" as const:
				prompt += `The description should be a short blurb, up to 4 sentences.\n`
				break
			case "medium" as const:
				prompt += `The description should be short, up to 2 paragraphs of ~4 sentences each.\n`
				break
			case "extensive" as const:
				prompt += `The description should be long and detailed, up to 4 paragraphs of ~4 sentences each.\n`
				break
		}
		prompt += `Make the description have a style of {${this.input.style}}\n`
		if (this.input.name) {
			prompt += `The name of it is {${this.input.name}}\n`
		} else {
			prompt += `Come up with your own name for it!\n`
		}
		if (this.input.notes) {
			prompt += `Here are some additional notes: \n{${this.input.notes}}`
		}
		return prompt
	}

	async generate(forgeAuth: ForgeAuth): Promise<ForgeResponse<Description>> {
		const error = this.validate()
		if (error) {
			return { success: false, error }
		}

		const data: DescriptionRequest = {
			prompt: this.prompt()
		}

		try {
			const response = await fetch(__API_URL__ + "/forge/description", {
				method: "POST",
				headers: {
					auth: forgeAuth.auth_token,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(data),
				signal: AbortSignal.timeout(10000)
			})
			if (response.status == 401) {
				return { success: false, error: "Wrong API key!" }
			}
			const forgeResponse = await response.json() as ForgeResponse<Description>
			if (forgeResponse.success) {
				this.output = forgeResponse.output
			}
			return forgeResponse
		} catch (e) {
			return { success: false, error: "" }
		}
	}
}
