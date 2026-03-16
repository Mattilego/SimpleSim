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
		SharedData.eventLoop.triggerListeners("applyAura", actor.id, { aura, sourceActor, duration, stacks, target: actor });
	}

	static applyAuraModifiers(aura, actor){
		const auraDef = aura.sourceActor.knownAuras[aura.id];
		auraDef.statsModified !== undefined && auraDef.statsModified.forEach((stat) => {
			if (auraDef.statRatingMultiplier !== undefined) {
				if (actor.statRatingMultipliers[stat] === undefined) {
					actor.statRatingMultipliers[stat] = 1;
				}
				actor.statRatingMultipliers[stat] *= typeOf(auraDef.statRatingMultiplier.compiled)==="function"?auraDef.statRatingMultiplier.compiled(SharedData, aura.sourceActor, aura):JSONEvaluator.evaluateValue(aura.sourceActor, auraDef.statRatingMultiplier);
			}
			if (auraDef.statEffectMultiplier !== undefined) {
				if (actor.statEffectMultipliers[stat] === undefined) {
					actor.statEffectMultipliers[stat] = 1;
				}
				actor.statEffectMultipliers[stat] *= typeOf(auraDef.statEffectMultiplier.compiled)==="function"?auraDef.statEffectMultiplier.compiled(SharedData, aura.sourceActor, aura):JSONEvaluator.evaluateValue(aura.sourceActor, auraDef.statEffectMultiplier);
			}
			if (auraDef.statRatingAddition !== undefined) {
				if (actor.statRatingAdditions[stat] === undefined) {
					actor.statRatingAdditions[stat] = 0;
				}
				actor.statRatingAdditions[stat] += typeOf(auraDef.statRatingAddition.compiled)==="function"?auraDef.statRatingAddition.compiled(SharedData, aura.sourceActor, aura):JSONEvaluator.evaluateValue(aura.sourceActor, auraDef.statRatingAddition);
			}
			if (auraDef.statEffectAddition !== undefined) {
				if (actor.statEffectAdditions[stat] === undefined) {
					actor.statEffectAdditions[stat] = 0;
				}
				actor.statEffectAdditions[stat] += typeOf(auraDef.statEffectAddition.compiled)==="function"?auraDef.statEffectAddition.compiled(SharedData, aura.sourceActor, aura):JSONEvaluator.evaluateValue(aura.sourceActor, auraDef.statEffectAddition);
			}
		});

		let typeMask = auraDef.typesModified.reduce((acc, type) => acc + SharedData.types.get(type), 0);

		for (let i = 0; i < 128; i++){
			if (typeMask & (1 << i)) {
				if (auraDef.damageDealtModifier !== undefined){
					actor.damageDealtModifiers[i] *= JSONEvaluator.evaluateValue(auraDef.damageDealtModifier);
				}
				if (auraDef.damageDealtAddition !== undefined){
					actor.damageDealtAdditions[i] += JSONEvaluator.evaluateValue(auraDef.damageDealtAddition);
				}
				if (auraDef.healingDoneModifier !== undefined){
					actor.healingDoneModifiers[i] *= JSONEvaluator.evaluateValue(auraDef.healingDoneModifier);
				}
				if (auraDef.healingDoneAddition !== undefined){
					actor.healingDoneAdditions[i] += JSONEvaluator.evaluateValue(auraDef.healingDoneAddition);
				}
				if (auraDef.damageTakenModifier !== undefined){
					actor.damageTakenModifiers[i] *= JSONEvaluator.evaluateValue(auraDef.damageTakenModifier);
				}
				if (auraDef.damageTakenAddition !== undefined){
					actor.damageTakenAdditions[i] += JSONEvaluator.evaluateValue(auraDef.damageTakenAddition);
				}
				if (auraDef.healingTakenModifier !== undefined){
					actor.healingTakenModifiers[i] *= JSONEvaluator.evaluateValue(auraDef.healingTakenModifier);
				}
				if (auraDef.healingTakenAddition !== undefined){
					actor.healingTakenAdditions[i] += JSONEvaluator.evaluateValue(auraDef.healingTakenAddition);
				}
			}
		}


	}

	static removeAuraModifiers(aura, actor){

	}
}
