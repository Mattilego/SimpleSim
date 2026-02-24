export class EventLoop {
	contructor(maxTime) {
		this.maxTime = maxTime;
		this.futureEvents = [];
		this.time = 0;
	}

	registerEvent(time, data) {
		if (time > this.maxTime) return;
		const index = this.futureEvents.findIndex(event => event.time > time);
		this.futureEvents.splice(index, 0, { time, data });
	}

	processEvent(actors) {
		const event = this.futureEvents.shift();
		this.time = event.time;
		const sourceActor = event.data.source;
		if (sourceActor == null) {
			this.handleSpecialEffect(event.data.effects);
		}
		const effects = event.data.effects;
		sourceActor.triggerEffects(effects, actors, this);
	}
}