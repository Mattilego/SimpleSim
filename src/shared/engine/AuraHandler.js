import { Aura } from "./Aura.js";
import { SharedData } from "./SharedData.js";
import { Log } from "./Log.js"

export class AuraHandler {
	static applyAura(actor, sourceActor, aura, duration, stacks) {
		let multimap = actor.auras.get(aura);
		if (multimap === undefined) {
			multimap = [];
			actor.auras.set(aura, multimap);
		}
		let modifiedAura = null;
		const currentMatch = multimap.find((b) => b.source === sourceActor);
		if (currentMatch !== undefined) {
			modifiedAura = currentMatch;
			switch (sourceActor.knownAuras[aura].reapplicationType) {
				case "refresh":
					currentMatch.duration = Math.max(currentMatch.duration, duration);
					break;
				case "pandemic":
					currentMatch.duration = Math.max(currentMatch.duration, Math.min(1.3 * sourceActor.knownAuras[aura].duration, currentMatch.duration + duration));
					break;
				case "overlap":
					multimap.push(new Aura(aura, duration, stacks, sourceActor, actor.id));
					break;
				case "stackRefresh":
					currentMatch.stacks = Math.min(currentMatch.stacks + stacks, sourceActor.knownAuras[aura].maxStacks);
					currentMatch.duration = Math.max(currentMatch.duration, duration);
					break;
				case "stackPandemic":
					currentMatch.stacks = Math.min(currentMatch.stacks + stacks, sourceActor.knownAuras[aura].maxStacks);
					currentMatch.duration = Math.max(currentMatch.duration, Math.min(1.3 * sourceActor.knownAuras[aura].duration, currentMatch.duration + duration));
					break;
			}
		} else {
			modifiedAura = new Aura(aura, duration, stacks, sourceActor, actor.id);
			multimap.push(modifiedAura);
		}
		SharedData.eventLoop.triggerListeners("applyAura", actor, { aura, sourceActor, duration, stacks });
	}
}
