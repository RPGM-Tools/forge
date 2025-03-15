declare global {
	/** The api endpoint that Forge should query for generating
	 *	- Should be set at build time */
	const __API_URL__: string

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

	type ForgeAuth = {
		auth_token: string
	}

	type Names = {
		names: string[]
	}

	type NamesOptions = {
		quantity: number
		method: "ai" | "simple"
		type: string
		genre: string
		gender: string
	}

	type NamesRequest = {
		prompt: string
	}

	type Description = {
		description: string
	}

	type DescriptionOptions = {
		name: string
		type: string
		style: string
		length: "short" | "medium" | "extensive"
		notes: string
	}

	type DescriptionRequest = {
		prompt: string
	}

	type ForgeResponse<T> =
		| { success: true, output: T }
		| { success: false, error: string }
}

export { }
