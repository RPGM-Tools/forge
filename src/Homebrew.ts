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
		this.input.schema.custom_name = this.input.schema.custom_name?.trim();
		return ""
	}

	typeString(type: "short" | "long" | "number" | "boolean"): string {
		switch (type) {
			case "number": return type;
			case "boolean": return type;
			case "short": return "two sentences"
			case "long": return "three paragraphs"
		}
	}

	prompt(): string {
		return [
			`Generate a(n) {${this.input.schema.name}}`,
			...this.input.language ? [`Generate everything in the {${this.input.language}} language`] : [],
			this.input.schema.custom_name ? `The name of the thing being generated is {${this.input.schema.custom_name}}`
				: `Generate the name for the {${this.input.schema.name}}`,
			this.input.system ? `Make sure your {${this.input.schema.name}} is compatible with {${this.input.system}} (a TTRPG system)`
				: `Make sure your {${this.input.schema.name}} isn't tied to a specific system (e.g. Dungeons & Dragons or Pathfinder)`,
			this.input.genre ? `Create the ${this.input.schema.name} in the {${this.input.genre}} genre` : "",
			"Fields:\n",
			this.input.schema.fields
				.map(f => `"${f.name}": (${this.typeString(f.type)}) = ${f.value === undefined || f.value === false ? "{generate}" : `"${f.value}"`}`)
				.join("\n")
		].join("\n");
	}

	async generate(forgeAuth: ForgeAuth): Promise<ForgeResponse<Homebrew>> {
		const schema: JSONSchema7 = {
			title: this.input.schema.name,
			type: "object",
			additionalProperties: false,
			properties: {
				name: {
					title: "Name",
					description: "The name of the thing being generated" + (this.input.schema.custom_name ? `, already specified: "${this.input.schema.custom_name}"` : ""),
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
					properties: Object.entries(this.input.schema.fields)
						.reduce((obj: { [key: string]: JSONSchema7Definition }, [, field]) => {
							obj[slugify(field.name)] = {
								"title": field.name,
								"description": field.description,
								"type": field.type === "short" || field.type === "long" ? "string" : field.type,
							}
							return obj
						}, {}),
					type: "object",
					required: this.input.schema.fields.map(f => slugify(f.name))
				}
			},
			required: ["name", "flavor_text", "fields"]
		}

		const body: HomebrewRequest = {
			prompt: this.prompt(),
			homebrew: schema,
		}

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
		} else if (response.status == 429) {
			return { success: false, error: "Your quota has been exceeded. Upgrade your plan to generate more homebrew!" }
		}
		const forgeResponse = await response.json() as ForgeResponse<HomebrewResponse>

		// We can cast this because it only contains an error
		if (!forgeResponse.success) return forgeResponse as ForgeResponse<Homebrew>

		this.output = {
			name: this.input.schema.name,
			custom_name: forgeResponse.output.name,
			flavor_text: forgeResponse.output.flavor_text,
			fields: []
		}

		// Regenerate the fields by matching the names
		for (const field of this.input.schema.fields) {
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
	}
}

function slugify(input: string): string {
	return input.replace(/[^a-zA-Z0-9-_]/g, "_").toLowerCase()
}
