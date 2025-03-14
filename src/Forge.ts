declare const __API_URL__: string

const ERROR_TEXT = "An error occured while generating!"

export type ForgeResponse<T> =
	| { success: true, output: T }
	| { success: false, error: string }

export abstract class ForgeObject<I, O> {
	input: I
	output!: O
	protected abstract validate(): string
	/**
	 * Generates a ForgeResponse.
	 * Upon successful generation, {output} will be updated
	 * */
	abstract generate(): Promise<ForgeResponse<O>>

	constructor(input: I) {
		this.input = input
	}
}

export class ForgeNames extends ForgeObject<NamesOptions, Names> {
	private constructor(input: NamesOptions) {
		super(input)
	}

	static fromOptions(input: NamesOptions): ForgeNames {
		return new ForgeNames(input)
	}

	protected validate(): string {
		if (this.input.type === "")
			return "Type is empty!"
		if (this.input.genre === "")
			return "Genre is empty!"
		this.input.gender = this.input.gender.toLowerCase()
		return ""
	}

	private prompt(): string {
		return `Generate ${this.input.quantity} newline-separated random name(s) for a {${this.input.type}} in the {${this.input.genre}} genre.`
	}

	async generate(): Promise<ForgeResponse<Names>> {
		const error = this.validate()
		if (error) {
			return { success: false, error }
		}

		const data = {
			prompt: this.prompt()
		}

		try {
			const response = await fetch(__API_URL__ + "/forge/names", {
				method: "POST",
				headers: { auth: localStorage.getItem("auth") ?? "", },
				body: JSON.stringify(data),
				signal: AbortSignal.timeout(10000)
			})
			const forgeResponse = await response.json() as ForgeResponse<Names>
			if (forgeResponse.success)
				this.output = forgeResponse.output
			return forgeResponse
		} catch (e) {
			return { success: false, error: ERROR_TEXT }
		}
	}
}

export class ForgeDescription extends ForgeObject<DescriptionOptions, Description> {
	private constructor(input: DescriptionOptions) {
		super(input)
	}

	static fromOptions(input: DescriptionOptions): ForgeDescription {
		return new ForgeDescription(input)
	}

	protected validate(): string {
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

	async generate(): Promise<ForgeResponse<Description>> {
		const error = this.validate()
		if (error) {
			return { success: false, error }
		}

		const data = {
			prompt: this.prompt()
		}

		try {
			const response = await fetch(__API_URL__ + "/forge/description", {
				method: "POST",
				headers: { auth: localStorage.getItem("auth") ?? "", },
				body: JSON.stringify(data),
				signal: AbortSignal.timeout(10000)
			})
			const forgeResponse = await response.json() as ForgeResponse<Description>
			if (forgeResponse.success) {
				this.output = forgeResponse.output
			}
			return forgeResponse
		} catch (e) {
			return { success: false, error: ERROR_TEXT }
		}
	}
}
