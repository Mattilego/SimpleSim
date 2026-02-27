import { SharedData } from "./SharedData.js";

export class Aura {
	constructor(id, duration, stacks, source) {
		this.id = id;
		this.expirationTime = duration>0?SharedData.time+duration:Infinity;
		this.stacks = stacks;
		this.source = source;
		this.expirationEvent = null;
	}

	set duration(duration){
		this.expirationTime = SharedData.time + duration;
		if (this.expirationEvent === null){
			this.expirationEvent = SharedData.eventLoop.futureEvents.find((event) => event.time === this.expirationTime && event.data.source === this.source && event.data.effects[0].type === "removeBuff" && event.data.effects[0].id === this.id);
		}
		SharedData.eventLoop.futureEvents = SharedData.eventLoop.futureEvents.filter(event => event !== this.expirationEvent);
		this.expirationEvent = SharedData.eventLoop.registerEvent(this.expirationTime, this.expirationEvent.data);
	}

	get duration(){
		return this.expirationTime - SharedData.time;
	}
}