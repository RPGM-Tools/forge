import { generateOfflineNames } from "./OfflineNames";

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
		let prompt = '';
		prompt += `Generate ${this.input.quantity} name(s) for a {${this.input.type}} in the {${this.input.genre}} genre.\n`;
		if (this.input.language) {
			prompt += `Generate in the {${this.input.language}} language.`;
		}
		return prompt;
	}

	validate(): string {
		if (this.input.type === "")
			return "Type is empty!"
		if (this.input.genre === "")
			return "Genre is empty!"
		if (this.input.gender === "male" || this.input.gender === "female" || this.input.gender === "nonbinary" || this.input.gender === "any")
			this.input.gender = this.input.gender
		else
			this.input.gender = "any"
		return ""
	}

	async generate(forgeAuth: ForgeAuth): Promise<ForgeResponse<Names>> {
		const error = this.validate()
		if (error) {
			return { success: false, error }
		}

		if (this.input.method === "simple") {
			return await generateOfflineNames(this.input);
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
			} else if (response.status == 429) {
				return { success: false, error: "Your quota has been exceeded. Upgrade your plan to generate more names!" }
			}
			const forgeResponse = await response.json() as ForgeResponse<Names>
			if (forgeResponse.success)
				this.output = forgeResponse.output
			return forgeResponse
		} catch (e) {
			return { success: false, error: "An error occured while generating!" }
		}
	}
}
