import { Aura } from "./Aura.js";
import { SharedData } from "./SharedData.js";


export class AuraHandler {
	static applyAura(actor, sourceActor, aura, duration, stacks, isBuff) {
		let modifiedAura = null;
		if (actor[isBuff ? "buffs" : "debuffs"].some(b => b.id === aura && b.source === sourceActor)) {
			const currentMatch = actor[isBuff ? "buffs" : "debuffs"].find(b => b.id === aura && b.source === sourceActor);
			modifiedAura = currentMatch;
			switch (sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura].reapplicationType) {
				case "refresh":
					currentMatch.duration = Math.max(currentMatch.duration, duration);
					if (sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura].updateOnRefresh) {
						actor.resetRelevantCaches(sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura]);
					}
					break;
				case "pandemic":
					currentMatch.duration = Math.max(currentMatch.duration, Math.min(1.3 * sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura].duration, currentMatch.duration + duration));
					if (sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura].updateOnRefresh) {
						actor.resetRelevantCaches(sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura]);
					}
					break;
				case "overlap":
					actor[isBuff ? "buffs" : "debuffs"].push(new Aura(aura, duration, stacks, sourceActor));
					actor.resetRelevantCaches(sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura]);
					break;
				case "stackRefresh":
					currentMatch.stacks = Math.min(currentMatch.stacks + stacks, sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura].maxStacks);
					currentMatch.duration = Math.max(currentMatch.duration, duration);
					if (sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura].updateOnRefresh) {
						actor.resetRelevantCaches(sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura]);
					}
					break;
				case "stackPandemic":
					currentMatch.stacks = Math.min(currentMatch.stacks + stacks, sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura].maxStacks);
					currentMatch.duration = Math.max(currentMatch.duration, Math.min(1.3 * sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura].duration, currentMatch.duration + duration));
					if (sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura].updateOnRefresh) {
						actor.resetRelevantCaches(sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura]);
					}
					break;
			}
		} else {
			modifiedAura = new Aura(aura, duration, stacks, sourceActor)
			actor[isBuff ? "buffs" : "debuffs"].push(modifiedAura);
			SharedData.eventLoop.registerEvent(modifiedAura.expirationTime, {source: sourceActor, effects:[{type: isBuff ? "removeBuff" : "removeDebuff", id: aura, targetId: actor.id}]});
			actor.resetRelevantCaches(sourceActor[isBuff ? "knownBuffs" : "knownDebuffs"][aura]);
		}
		SharedData.eventLoop.triggerListeners(isBuff ? "applyBuff" : "applyDebuff", actor, {aura, sourceActor, duration, stacks});
	}

	static applyBuff(actor, sourceActor, buff, duration, stacks) {
		this.applyAura(actor, sourceActor, buff, duration, stacks, true);
	}

	static applyDebuff(actor, sourceActor, buff, duration, stacks) {
		this.applyAura(actor, sourceActor, buff, duration, stacks, false);
	}
}