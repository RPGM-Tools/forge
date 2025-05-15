import type { JSONSchema7, JSONSchema7Definition } from "json-schema";

export class ForgeHomebrew implements ForgeObject<HomebrewOptions, Homebrew> {
	input: HomebrewOptions;
	output?: Homebrew;

	private constructor(input: HomebrewOptions) {
		this.input = input
	}

	static fromOptions(input: HomebrewOptions): ForgeHomebrew {
		return new ForgeHomebrew(input);
	}

	validate(): string {
		return ""
	}

	typeString(type: "short" | "long" | "number" | "boolean"): string {
		switch (type) {
			case "number": return type;
			case "boolean": return type;
			case "short": return "one sentence"
			case "long": return "short paragraph"
		}
	}

	prompt(): string {
		return [
			`Generate a(n) ${this.input.name}`,
			... this.input.custom_name ? [`The name of the thing being generated is ${this.input.custom_name}`]
				: [`Generate the name for the ${this.input.name}`],
			"Fields:\n",
			this.input.fields
				.map(f => `"${f.name}": (${this.typeString(f.type)}) = ${f.value === undefined || f.value === false ? "{generate}" : `"${f.value}"`}`)
				.join("\n")
		].join("\n");
	}

	async generate(forgeAuth: ForgeAuth): Promise<ForgeResponse<Homebrew>> {
		const schema: JSONSchema7 = {
			title: this.input.name,
			type: "object",
			additionalProperties: false,
			properties: {
				name: {
					title: "Name",
					description: "The name of the thing being generated" + (this.input.custom_name ? `, already specified: ${this.input.custom_name}` : ""),
					type: "string"
				},
				flavor_text: {
					title: "Flavor Text",
					description: "A short hint/flavor/subtitle to display below the title",
					type: "string"
				},
				fields: {
					title: "Fields",
					description: "The various fields to generate content for",
					properties: Object.entries(this.input.fields)
						.reduce((obj: { [key: string]: JSONSchema7Definition }, [, field]) => {
							obj[slugify(field.name)] = {
								"title": field.name,
								"description": field.description,
								"type": field.type === "short" || field.type === "long" ? "string" : field.type,
							}
							return obj
						}, {}),
					type: "object",
					required: this.input.fields.map(f => slugify(f.name))
				}
			},
			required: ["name", "flavor_text", "fields"]
		}

		const body: HomebrewRequest = {
			prompt: this.prompt(),
			homebrew: schema,
		}

		try {
			const response = await fetch(__API_URL__ + "/forge/homebrew", {
				method: "POST",
				headers: {
					auth: forgeAuth.auth_token,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(body),
				signal: AbortSignal.timeout(10000)
			})
			if (response.status == 401) {
				return { success: false, error: "Wrong API key!" }
			}
			const forgeResponse = await response.json() as ForgeResponse<HomebrewResponse>

			// We can cast this because it only contains an error
			if (!forgeResponse.success) return forgeResponse as ForgeResponse<Homebrew>

			this.output = {
				name: this.input.name,
				custom_name: forgeResponse.output.name,
				flavor_text: forgeResponse.output.flavor_text,
				fields: []
			}

			// Regenerate the fields by matching the names
			for (const field of this.input.fields) {
				for (const [k, v] of Object.entries(forgeResponse.output.fields)) {
					if (slugify(field.name) === k) {
						// Type casting to make TS happy
						this.output.fields.push({
							...field,
							type: field.type as "short",
							value: v as string
						})
					}
				}
			}
			return { success: true, output: this.output }
		} catch (e) {
			return { success: false, error: "" }
		}
	}
}

function slugify(input: string): string {
	return input.replace(/[^a-zA-Z0-9-_]/g, "_").toLowerCase()
}
