import { Aura } from "./Aura.js";
import { SharedData } from "./SharedData.js";
import { Log } from "./Log.js"

export class AuraHandler {
	static applyAura(actor, sourceActor, aura, duration, stacks) {
		let modifiedAura = null;
		if (actor.auras.some((b) => b.id === aura && b.source === sourceActor)) {
			const currentMatch = actor.auras.find((b) => b.id === aura && b.source === sourceActor);
			modifiedAura = currentMatch;
			switch (sourceActor.knownAuras[aura].reapplicationType) {
				case "refresh":
					currentMatch.duration = Math.max(currentMatch.duration, duration);
					break;
				case "pandemic":
					currentMatch.duration = Math.max(currentMatch.duration, Math.min(1.3 * sourceActor.knownAuras[aura].duration, currentMatch.duration + duration));
					break;
				case "overlap":
					actor.auras.push(new Aura(aura, duration, stacks, sourceActor, actor.id));
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
			actor.auras.push(modifiedAura);
		}
		SharedData.eventLoop.triggerListeners("applyAura", actor, { aura, sourceActor, duration, stacks });
	}
}
