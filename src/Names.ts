export class ForgeNames implements ForgeObject<NamesOptions, Names> {
	input: NamesOptions
	output?: Names

	private constructor(input: NamesOptions) {
		this.input = input
	}

	/**
	 * @param input - NamesOptions that created this ForgeObject
	 * @returns The created ForgeObject, note that the output still needs to be generated
	 */
	static fromOptions(input: NamesOptions): ForgeNames {
		return new ForgeNames(input)
	}

	private prompt(): string {
		return `Generate ${this.input.quantity} name(s) for a {${this.input.type}} in the {${this.input.genre}} genre.`
	}

	validate(): string {
		if (this.input.type === "")
			return "Type is empty!"
		if (this.input.genre === "")
			return "Genre is empty!"
		this.input.gender = this.input.gender.toLowerCase()
		return ""
	}

	async generate(forgeAuth: ForgeAuth): Promise<ForgeResponse<Names>> {
		const error = this.validate()
		if (error) {
			return { success: false, error }
		}

		const data: NamesRequest = {
			prompt: this.prompt()
		}

		try {
			const response = await fetch(__API_URL__ + "/forge/names", {
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
			const forgeResponse = await response.json() as ForgeResponse<Names>
			if (forgeResponse.success)
				this.output = forgeResponse.output
			return forgeResponse
		} catch (e) {
			return { success: false, error: "" }
		}
	}
}
