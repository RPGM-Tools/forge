import OfflineNames from "../data/names-v5.json?url";

type Name = {
	type: string;
	text: string;
	gender: Gender;
	weight: number;
	position: "first" | "last";
}

type Type = {
	id: string;
	text: string;
}

let DATA: {
	names: Name[],
	types: Type[]
};

const INDEX: Map<string, { first: Name[], last: Name[] }> = new Map();
const GLOBAL = { first: [] as Name[], last: [] as Name[] };

function pickXRandomWeighted(arr: Name[], count: number) {
	let total = 0;
	for (const name of arr) total += name.weight;

	const result: Name[] = [];

	for (let i = 0; i < count; i++) {
		let random = Math.random() * total;
		let tries = 0;
		for (const name of arr) {
			random -= name.weight;
			if (random < name.weight) {
				if (result.some(n => n.text === name.text) && tries++ < 10) continue;
				result.push(name);
				break;
			}
		}
	}
	return result;
}

export async function generateOfflineNames(input: NamesOptions): Promise<ForgeResponse<Names>> {
	try {
		let {
			type,
			quantity,
			gender,
		} = input;

		// Initialize data
		if (!DATA) {
			DATA = await fetch(OfflineNames).then(res => res.json());
			for (const name of DATA.names) {
				const bucket = INDEX.get(name.type)
					?? INDEX.set(name.type, { first: [], last: [] }).get(name.type)!;
				bucket[name.position].push(name);
				GLOBAL[name.position].push(name);
			}
		}

		type = type.toLowerCase();

		const typeList = INDEX.get(type)?.["first"] ?? [];
		let baseList = typeList && typeList.length ? typeList : GLOBAL["first"];
		if (gender) {
			const filtered = baseList.filter(n => n.gender === gender);
			if (filtered.length) baseList = filtered;
		}

		const result = pickXRandomWeighted(baseList, quantity);

		return {
			success: true,
			output: result.map(n => n.text),
		}
	} catch {
		return {
			success: false,
			error: "Offline data could not be loaded"
		}
	}
}
