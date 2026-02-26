import { SharedData } from "./SharedData.js";

export class Aura {
	constructor(id, duration, stacks, source, applicationEffects) {
		this.id = id;
		this.expirationTime = SharedData.time+duration;
		this.stacks = stacks;
		this.source = source;
		this.applicationEffects = applicationEffects;
	}

	set duration(duration){
		this.expirationTime = SharedData.time + duration;
	}

	get duration(){
		return this.expirationTime - SharedData.time;
	}
}