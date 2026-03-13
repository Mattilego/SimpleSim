import { AuraHandler } from "./AuraHandler.js"

export class SharedData {
	constructor() {}
	static actors = [];
	static eventLoop = null;
	static auraHandler = AuraHandler;
	static types = ["physical", "holy", "fire", "frost", "nature", "arcane", "shadow"];
	static ensureString(string){
		if (!this.strings.includes(string)){
			this.strings.push(string);
		}
	}
}
