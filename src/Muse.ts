import { NamesOptions, DescriptionOptions, ImageOptions } from "./Types"
declare const __API_URL__: string

const ERROR_TEXT = "An error occured while generating!"

export type MuseError = string

export type MuseResponse<T> =
	| { success: true, output: T }
	| { success: false, error: string }

export abstract class MuseObject<I, O> {
	input: I
	output!: O
	protected abstract validate(): string
	abstract generate(): Promise<this | MuseError>

	constructor(input: I) {
		this.input = input
	}
}

export async function GenerateMuseObject(options: NamesOptions | DescriptionOptions | ImageOptions): Promise<MuseObject<any, any> | MuseError> {
	if (options instanceof NamesOptions)
		return await new MuseNames(options).generate()
	else if (options instanceof DescriptionOptions)
		return await new MuseDescription(options).generate()
	else
		return await new MuseImage(options).generate()
}

type Names = {
	names: string[]
}

export class MuseNames extends MuseObject<NamesOptions, Names> {
	constructor(input: NamesOptions) {
		super(input)
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

	async generate(): Promise<this | MuseError> {
		const error = this.validate()
		if (error) {
			return error
		}

		const data = {
			prompt: this.prompt()
		}

		try {
			const response = await fetch(__API_URL__ + "/muse/names", {
				method: "POST",
				headers: { auth: localStorage.getItem("auth") ?? "", },
				body: JSON.stringify(data),
				signal: AbortSignal.timeout(10000)
			})
			const museResponse = await response.json() as MuseResponse<Names>
			if (museResponse.success) {
				this.output = museResponse.output
				return this
			} else {
				return museResponse.error
			}
		} catch (e) {
			return ERROR_TEXT
		}
	}
}

type Description = {
	description: string
}

export class MuseDescription extends MuseObject<DescriptionOptions, Description> {
	constructor(input: DescriptionOptions) {
		super(input)
	}

	static async create(options: DescriptionOptions): Promise<MuseDescription | MuseError> {
		return await new MuseDescription(options).generate()
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

	async generate(): Promise<this | MuseError> {
		const error = this.validate()
		if (error) {
			return error
		}

		const data = {
			prompt: this.prompt()
		}

		try {
			const response = await fetch(__API_URL__ + "/muse/description", {
				method: "POST",
				headers: { auth: localStorage.getItem("auth") ?? "", },
				body: JSON.stringify(data),
				signal: AbortSignal.timeout(10000)
			})
			const museResponse = await response.json() as MuseResponse<Description>
			if (museResponse.success) {
				this.output = museResponse.output
				return this
			} else {
				return museResponse.error
			}
		} catch (e) {
			return ERROR_TEXT
		}
	}
}

type Image = {
	imageUrl: string
}

export class MuseImage extends MuseObject<ImageOptions, Image> {
	constructor(input: ImageOptions) {
		super(input)
	}

	protected validate(): string {
		return "Not implemented!"
	}

	async generate(): Promise<this | string> {
		const error = this.validate()
		if (error) {
			return error
		}
		return "Not implemented!"
	}
}
