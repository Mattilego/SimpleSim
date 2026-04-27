import { AuraHandler } from "./AuraHandler.js";

export class SharedData {
	constructor() {}
	static actors = [];
	static eventLoop = null;
	static auraHandler = AuraHandler;
	static types = new Map(["physical", "holy", "fire", "frost", "nature", "arcane", "shadow"].map((type, index) => [type, 2 ** index]));
	static ensureString(string) {
		if (!this.strings.includes(string)) {
			this.strings.push(string);
		}
	}

	static getTypeCombinationId(types) {
		if (typeof(types) === "number"){
			return types;
		}
		if (types === undefined || types[0] === "all" || types === "all") {
			return 2 ** 8 - 1;
		}
		let index = 0;
		for (let i = 0; i < types.length; i++) {
			index += SharedData.types.get(types[i]);
		}
		return index;
	}
}
