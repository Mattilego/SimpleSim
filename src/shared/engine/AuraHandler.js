import { Aura } from "./Aura.js";
import { SharedData } from "./SharedData.js";
import { Log } from "./Log.js"

export class AuraHandler {
	static applyAura(actor, sourceActor, aura, duration, stacks, isBuff) {
		let modifiedAura = null;
		if (actor[isBuff ? "buffs" : "debuffs"].some((b) => b.id === aura && b.source === sourceActor)) {
			const currentMatch = actor[isBuff ? "buffs" : "debuffs"].find((b) => b.id === aura && b.source === sourceActor);
			modifiedAura = currentMatch;
			switch (sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura].reapplicationType) {
				case "refresh":
					currentMatch.duration = Math.max(currentMatch.duration, duration);
					break;
				case "pandemic":
					currentMatch.duration = Math.max(currentMatch.duration, Math.min(1.3 * sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura].duration, currentMatch.duration + duration));
					break;
				case "overlap":
					actor[isBuff ? "buffs" : "debuffs"].push(new Aura(aura, duration, stacks, sourceActor, isBuff, actor.id));
					break;
				case "stackRefresh":
					currentMatch.stacks = Math.min(currentMatch.stacks + stacks, sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura].maxStacks);
					currentMatch.duration = Math.max(currentMatch.duration, duration);
					break;
				case "stackPandemic":
					currentMatch.stacks = Math.min(currentMatch.stacks + stacks, sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura].maxStacks);
					currentMatch.duration = Math.max(currentMatch.duration, Math.min(1.3 * sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura].duration, currentMatch.duration + duration));
					break;
			}
		} else {
			modifiedAura = new Aura(aura, duration, stacks, sourceActor, isBuff, actor.id);
			actor[isBuff ? "buffs" : "debuffs"].push(modifiedAura);
		}
		SharedData.eventLoop.triggerListeners(isBuff ? "applyBuff" : "applyDebuff", actor, { aura, sourceActor, duration, stacks });
	}

	static applyBuff(actor, sourceActor, buff, duration, stacks) {
		this.applyAura(actor, sourceActor, buff, duration, stacks, true);
	}

	static applyDebuff(actor, sourceActor, debuff, duration, stacks) {
		this.applyAura(actor, sourceActor, debuff, duration, stacks, false);
	}
}
