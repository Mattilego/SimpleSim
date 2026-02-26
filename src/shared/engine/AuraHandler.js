import { Aura } from "./Aura.js";


export class AuraHandler {
	static applyBuff(actor, sourceActor, buff, duration, stacks) {
		if (actor.buffs.some(b => b.id === buff && b.source === sourceActor)) {
			const currentMatch = actor.buffs.find(b => b.id === buff && b.source === sourceActor);
			switch (sourceActor.knownBuffs[buff].reapplicationType) {
				case "refresh":
					currentMatch.duration = Math.max(currentMatch.duration, duration);
					if (sourceActor.knownBuffs[buff].updateOnRefresh) {
						actor.resetRelevantCaches(sourceActor.knownBuffs[buff]);
					}
					break;
				case "pandemic":
					currentMatch.duration = Math.max(currentMatch.duration, Math.min(1.3 * sourceActor.knownBuffs[buff].duration, currentMatch.duration + duration));
					if (sourceActor.knownBuffs[buff].updateOnRefresh) {
						actor.resetRelevantCaches(sourceActor.knownBuffs[buff]);
					}
					break;
				case "overlap":
					actor.buffs.push(new Aura(buff, duration, stacks, sourceActor));
					actor.resetRelevantCaches(sourceActor.knownBuffs[buff]);
					break;
				case "stackRefresh":
					currentMatch.stacks = Math.min(currentMatch.stacks + stacks, sourceActor.knownBuffs[buff].maxStacks);
					currentMatch.duration = Math.max(currentMatch.duration, duration);
					if (sourceActor.knownBuffs[buff].updateOnRefresh) {
						actor.resetRelevantCaches(sourceActor.knownBuffs[buff]);
					}
					break;
				case "stackPandemic":
					currentMatch.stacks = Math.min(currentMatch.stacks + stacks, sourceActor.knownBuffs[buff].maxStacks);
					currentMatch.duration = Math.max(currentMatch.duration, Math.min(1.3 * sourceActor.knownBuffs[buff].duration, currentMatch.duration + duration));
					if (sourceActor.knownBuffs[buff].updateOnRefresh) {
						actor.resetRelevantCaches(sourceActor.knownBuffs[buff]);
					}
					break;
			}
		} else {
			actor.buffs.push(new Aura(buff, duration, stacks, sourceActor));
			actor.resetRelevantCaches(sourceActor.knownBuffs[buff]);
		}
		if (sourceActor.knownBuffs[buff].applicationEffects) {
			actor.triggerEffects(sourceActor.knownBuffs[buff].applicationEffects);
		}
		SharedData.eventLoop.triggerListeners("applyBuff", actor, {buff, sourceActor, duration, stacks});
	}
}