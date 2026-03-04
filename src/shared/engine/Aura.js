import { SharedData } from "./SharedData.js";

export class Aura {
	constructor(id, duration, stacks, source, isBuff, appliedOn) {
		this.id = id;
		this.expirationTime = duration > 0 ? SharedData.eventLoop.time + duration : Infinity;
		this.stacks = stacks;
		this.source = source;
		this.expirationEvent = { source: source, effects: [{ type: isBuff ? "removeBuff" : "removeDebuff", id: this.id, targetId: appliedOn }] };
		SharedData.eventLoop.registerEvent(this.expirationTime, this.expirationEvent);

	}

	set duration(duration) {
		this.expirationTime = SharedData.time + duration;
		SharedData.eventLoop.futureEvents = SharedData.eventLoop.futureEvents.filter((event) => event.data !== this.expirationEvent);
		this.expirationEvent = SharedData.eventLoop.registerEvent(this.expirationTime, this.expirationEvent.data);
	}

	get duration() {
		return this.expirationTime - SharedData.time;
	}
}
