import { AuraHandler } from "./AuraHandler.js"

export class SharedData {
	constructor() {}
	static actors = [];
	static eventLoop = null;
	static auraHandler = AuraHandler;
	static types = new Map(["physical", "holy", "fire", "frost", "nature", "arcane", "shadow"].map((type, index) => [type, 2**index]));
	static ensureString(string){
		if (!this.strings.includes(string)){
			this.strings.push(string);
		}
	}
}
