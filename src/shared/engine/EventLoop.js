import { JSONEvaluator } from "./JSONEvaluator.js";
import { Log } from "./Log.js";

export class EventLoop {
	constructor(maxTime) {
		this.maxTime = maxTime;
		this.futureEvents = [];
		this.time = 0;
		this.listeners = {};
		this.eventTypes = ["takeDamage", "dealDamage", "recieveHealing", "heal", "applyAura", "removeAura", "expireAura", "resourceChange", "parry", "dodge", "miss", "block", "abilityUse"];
	}

	binaryHeapInsert(heap, node) {
		heap.push(node);
		let index = heap.length - 1;
		while (index > 0) {
			const parentIndex = Math.floor((index - 1) / 2);
			if (heap[index].time >= heap[parentIndex].time) {
				break;
			}
			[heap[index], heap[parentIndex]] = [heap[parentIndex], heap[index]];
			index = parentIndex;
		}
	}

	binaryHeapRemove(heap, index) {
		const removed = heap[index];
		heap[index] = heap.pop();
		let index2 = index;
		while (index2 * 2 + 1 < heap.length) {
			let childIndex1 = index2 * 2 + 1;
			let childIndex2 = index2 * 2 + 2;
			let swapIndex = childIndex1;
			if (childIndex2 < heap.length && heap[childIndex2].time < heap[childIndex1].time) {
				swapIndex = childIndex2;
			}
			if (heap[index2].time <= heap[swapIndex].time) {
				break;
			}
			[heap[index2], heap[swapIndex]] = [heap[swapIndex], heap[index2]];
			index2 = swapIndex;
		}
		return removed;
	}

	registerEvent(time, data) {
		const event = { time, data, canceled: false };
		this.binaryHeapInsert(this.futureEvents, event);
		if (this.futureEvents.length > 10000) {
			//Sign of exponential event registering due to recursion
			debugger;
		}
		return event;
	}

	removeEvent(event) {
		if (event.canceled) {
			return;
		}
		event.canceled = true;
	}

	processEvent() {
		const event = this.binaryHeapRemove(this.futureEvents, 0);
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
		sourceActor.triggerEffects(effects, {}, event.data.name);
	}

	triggerListeners(type, target, data) {
		if (this.listeners[target] === undefined) {
			return;
		}
		if (this.listeners[target][type] === undefined) {
			return;
		}
		const handlers = this.listeners[target][type];
		for (const handler of handlers) {
			if (JSONEvaluator.evaluateValue(handler.source, handler.eventConditions, data)) {
				handler.source.triggerEffects(handler.effects, data, data.name);
			}
		}
	}

	registerEventHandler(type, target, source, eventConditions, effects) {
		if (target === -1) {
			target = source.id;
		}
		if (this.listeners[target] === undefined) {
			this.listeners[target] = {};
		}
		if (this.listeners[target][type] === undefined) {
			this.listeners[target][type] = [];
		}
		this.listeners[target][type].push({ source, eventConditions, effects });
	}
}
