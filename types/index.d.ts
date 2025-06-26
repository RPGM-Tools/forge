import { JSONSchema7 } from "json-schema"

declare global {
	/** The api endpoint that Forge should query for generating
	 *	- Should be set at build time */
	const __API_URL__: string

	type ForgeAuth = {
		auth_token: string
	}

	interface ForgeObject<I, O> {
		/** The input options used to create this ForgeObject */
		input: I
		/** The created content */
		output?: O
		/** Called to modify {@link input} in place 
		 * @returns {string} An error message if the input is invalid, should be shown to the user
		 */
		validate(): string
		/** Generate content from {@link input}, sets {@link output} to the result */
		generate(forgeAuth: ForgeAuth): Promise<ForgeResponse<O>>
	}

	type ForgeResponse<T> =
		| { success: true, output: T }
		| { success: false, error: string }

	type Names = string[]

	type Method = "ai" | "simple";
	type Gender = "male" | "female" | "neutral";

	type NamesOptions = {
		quantity: number
		method: Method
		type: string
		genre: string
		gender: Gender
		language: string
	}

	type NamesRequest = {
		prompt: string
	}

	type Description = string

	type DescriptionOptions = {
		name: string
		type: string
		genre: string
		length: "short" | "medium" | "extensive"
		system: string
		notes: string
		language: string
	}

	type DescriptionRequest = {
		prompt: string
	}

	type HomebrewSchema = {
		name: string
		custom_name: string | undefined
		fields: HomebrewField[]
	}

	type HomebrewOptions = {
		genre: string
		system: string
		language: string
		schema: HomebrewSchema
	}

	type HomebrewRequest = {
		prompt: string
		homebrew: JSONSchema7
	}

	type HomebrewResponse = {
		name: string
		flavor_text: string
		fields: { [key: string]: string | number | boolean }
	}

	type HomebrewField = {
		name: string
		description: string
	} & ({
		type: "short" | "long"
		value?: string
	} | {
		type: "boolean"
		value?: boolean
	} | {
		type: "number"
		value?: number
	})

	type Homebrew = {
		name: string
		custom_name: string
		flavor_text: string
		fields: HomebrewField[]
	}
}

export { }
