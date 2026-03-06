import { JSONEvaluator } from "./JSONEvaluator.js";
import { Log } from "./Log.js";

export class EventLoop {
	constructor(maxTime) {
		this.maxTime = maxTime;
		this.futureEvents = [];
		this.time = 0;
		this.listeners = {};
	}

	registerEvent(time, data) {
		let index = this.futureEvents.findIndex((event) => event.time > time);
		if (index === -1){
			index = this.futureEvents.length;
		}
		const event = { time, data };
		this.futureEvents.splice(index, 0, event);
		if(this.futureEvents.length > 1000){
			debugger;
		}
		return event;
	}

	processEvent() {
		const event = this.futureEvents.shift();
		this.time = event.time;
		if (this.time > this.maxTime) {
			this.futureEvents.length = 0;
			return;
		}
		const sourceActor = event.data.source;
		if (sourceActor == null) {
			this.handleSpecialEffect(event.data.effects);
		}
		const effects = event.data.effects;
		sourceActor.triggerEffects(effects, null, {}, event.data.name);
	}

	triggerListeners(type, target, data) {
		if (this.listeners[target] === undefined){
			return;
		}
		if (this.listeners[target][type] === undefined){
			return;
		}
		const handlers = this.listeners[target][type];
		for (const handler of handlers) {
			if (JSONEvaluator.evaluateValue(handler.source, handler.eventConditions, data)){
				handler.source.triggerEffects(handler.effects, null, data, data.name)
			}
		}
	}

	registerEventHandler(type, target, source, eventConditions, effects) {
		if (target === -1){
			target = source.id;
		}
		if (this.listeners[target] === undefined){
			this.listeners[target] = {};
		}
		if (this.listeners[target][type] === undefined) {
			this.listeners[target][type] = [];
		}
		this.listeners[target][type].push({source, eventConditions, effects});
	}
}
