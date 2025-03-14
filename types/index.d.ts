declare global {
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
}

export { }
