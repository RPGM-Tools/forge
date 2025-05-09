import fs from 'fs'

const filename = "./Homebrew.json";

const data = fs.readFileSync(filename, 'utf8');
const json = JSON.parse(data);

const newJson = [];

for (const [i, key] of Object.keys(json).entries()) {
	console.log(i, key)
	newJson[i] = {
		name: key,
		description: "",
		fields: json[key].map(t => ({
			name: t.field,
			type: t.dataType,
			description: t.description
		}))
	}
}

fs.writeFileSync("./Homebrew2.json", JSON.stringify(newJson, null, 2));
