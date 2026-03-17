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
					SharedData.eventLoop.triggerListeners("applyAura", actor.id, { aura, sourceActor, duration, stacks, target: actor });
					return;
				case "pandemic":
					currentMatch.duration = Math.max(currentMatch.duration, Math.min(1.3 * sourceActor.knownAuras[aura].duration, currentMatch.duration + duration));
					SharedData.eventLoop.triggerListeners("applyAura", actor.id, { aura, sourceActor, duration, stacks, target: actor });
					return;
				case "overlap":
					modifiedAura = new Aura(aura, duration, stacks, sourceActor, actor.id);
					multimap.push(modifiedAura);
					break;
				case "stackRefresh":
					this.removeAuraModifiers(modifiedAura, actor);
					currentMatch.stacks = Math.min(currentMatch.stacks + stacks, sourceActor.knownAuras[aura].maxStacks);
					currentMatch.duration = Math.max(currentMatch.duration, duration);
					break;
				case "stackPandemic":
					this.removeAuraModifiers(modifiedAura, actor);
					currentMatch.stacks = Math.min(currentMatch.stacks + stacks, sourceActor.knownAuras[aura].maxStacks);
					currentMatch.duration = Math.max(currentMatch.duration, Math.min(1.3 * sourceActor.knownAuras[aura].duration, currentMatch.duration + duration));
					break;
			}
		} else {
			modifiedAura = new Aura(aura, duration, stacks, sourceActor, actor.id);
			multimap.push(modifiedAura);
		}
		this.applyAuraModifiers(modifiedAura, actor);
		SharedData.eventLoop.triggerListeners("applyAura", actor.id, { aura, sourceActor, duration, stacks, target: actor });
	}

	static applyAuraModifiers(aura, actor){
		const auraDef = aura.source.knownAuras[aura.id];
		if (auraDef.statsModified !== undefined){
			for (const stat of auraDef.statsModified) {
				if (auraDef.statRatingMultiplier !== undefined) {
					actor.statRatingMultipliers[stat] *= typeOf(auraDef.statRatingMultiplier.compiled)==="function"?auraDef.statRatingMultiplier.compiled(SharedData, aura.sourceActor, aura):JSONEvaluator.evaluateValue(aura.sourceActor, auraDef.statRatingMultiplier);
				}
				if (auraDef.statEffectMultiplier !== undefined) {
					actor.statEffectMultipliers[stat] *= typeOf(auraDef.statEffectMultiplier.compiled)==="function"?auraDef.statEffectMultiplier.compiled(SharedData, aura.sourceActor, aura):JSONEvaluator.evaluateValue(aura.sourceActor, auraDef.statEffectMultiplier);
				}
				if (auraDef.statRatingAddition !== undefined) {
					actor.statRatingAdditions[stat] += typeOf(auraDef.statRatingAddition.compiled)==="function"?auraDef.statRatingAddition.compiled(SharedData, aura.sourceActor, aura):JSONEvaluator.evaluateValue(aura.sourceActor, auraDef.statRatingAddition);
				}
				if (auraDef.statEffectAddition !== undefined) {
					actor.statEffectAdditions[stat] += typeOf(auraDef.statEffectAddition.compiled)==="function"?auraDef.statEffectAddition.compiled(SharedData, aura.sourceActor, aura):JSONEvaluator.evaluateValue(aura.sourceActor, auraDef.statEffectAddition);
				}
				if (auraDef.statRatingSpecialModifier !== undefined){
					actor.statRatingSpecialModifiers[stat].push(auraDef.statRatingSpecialModifier);
				}
				if (auraDef.statRatingSpecialAddition !== undefined){
					actor.statRatingSpecialAdditions[stat].push(auraDef.statRatingSpecialAddition);
				}
				if (auraDef.statEffectSpecialMultiplier !== undefined){
					actor.statEffectSpecialMultipliers[stat].push(auraDef.statEffectSpecialMultiplier);
				}
				if (auraDef.statEffectSpecialAddition !== undefined){
					actor.statEffectSpecialAdditions[stat].push(auraDef.statEffectSpecialAddition);
				}

			}
		}
		if (auraDef.typesModified !== undefined){
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
					if (auraDef.damageDealtSpecialModifier !== undefined){
						actor.damageDealtSpecialModifiers[i].push(auraDef.damageDealtSpecialModifier);
					}
					if (auraDef.damageDealtSpecialAddition !== undefined){
						actor.damageDealtSpecialAdditions[i].push(auraDef.damageDealtSpecialAddition);
					}
					if (auraDef.healingDoneSpecialModifier !== undefined){
						actor.healingDoneSpecialModifiers[i].push(auraDef.healingDoneSpecialModifier);
					}
					if (auraDef.healingDoneSpecialAddition !== undefined){
						actor.healingDoneSpecialAdditions[i].push(auraDef.healingDoneSpecialAddition);
					}
					if (auraDef.damageTakenSpecialModifier !== undefined){
						actor.damageTakenSpecialModifiers[i].push(auraDef.damageTakenSpecialModifier);
					}
					if (auraDef.damageTakenSpecialAddition !== undefined){
						actor.damageTakenSpecialAdditions[i].push(auraDef.damageTakenSpecialAddition);
					}
					if (auraDef.healingTakenSpecialModifier !== undefined){
						actor.healingTakenSpecialModifiers[i].push(auraDef.healingTakenSpecialModifier);
					}
					if (auraDef.healingTakenSpecialAddition !== undefined){
						actor.healingTakenSpecialAdditions[i].push(auraDef.healingTakenSpecialAddition);
					}
				}
			}
		}
	}

	static removeAuraModifiers(aura, actor) {
		const auraDef = aura.source.knownAuras[aura.id];
		if (!auraDef) return;

		// Helper to evaluate a modifier in the same way as applyAuraModifiers
		function evaluate(modifier) {
			if (modifier && modifier.compiled && typeof modifier.compiled === "function") {
				return modifier.compiled(SharedData, aura.source, aura);
			}
			return JSONEvaluator.evaluateValue(aura.source, modifier);
		}

		// --- Stats modifications ---
		if (auraDef.statsModified !== undefined) {
			for (const stat of auraDef.statsModified) {
				// Multipliers (undo by division)
				if (auraDef.statRatingMultiplier !== undefined) {
					const val = evaluate(auraDef.statRatingMultiplier);
					actor.statRatingMultipliers[stat] /= val;
				}
				if (auraDef.statEffectMultiplier !== undefined) {
					const val = evaluate(auraDef.statEffectMultiplier);
					actor.statEffectMultipliers[stat] /= val;
				}

				// Additions (undo by subtraction)
				if (auraDef.statRatingAddition !== undefined) {
					const val = evaluate(auraDef.statRatingAddition);
					actor.statRatingAdditions[stat] -= val;
				}
				if (auraDef.statEffectAddition !== undefined) {
					const val = evaluate(auraDef.statEffectAddition);
					actor.statEffectAdditions[stat] -= val;
				}

				if (auraDef.statRatingSpecialModifier !== undefined) {
					actor.statRatingSpecialModifiers[stat] = actor.statRatingSpecialModifiers[stat].filter(
						item => item !== auraDef.statRatingSpecialModifier
					);
				}
				if (auraDef.statRatingSpecialAddition !== undefined) {
					actor.statRatingSpecialAdditions[stat] = actor.statRatingSpecialAdditions[stat].filter(
						item => item !== auraDef.statRatingSpecialAddition
					);
				}
				if (auraDef.statEffectSpecialMultiplier !== undefined) {
					actor.statEffectSpecialMultipliers[stat] = actor.statEffectSpecialMultipliers[stat].filter(
						item => item !== auraDef.statEffectSpecialMultiplier
					);
				}
				if (auraDef.statEffectSpecialAddition !== undefined) {
					actor.statEffectSpecialAdditions[stat] = actor.statEffectSpecialAdditions[stat].filter(
						item => item !== auraDef.statEffectSpecialAddition
					);
				}
			}
		}

		// --- Type modifications ---
		if (auraDef.typesModified !== undefined) {
			const typeMask = auraDef.typesModified.reduce(
				(acc, type) => acc + SharedData.types.get(type), 0
			);

			const damageDealtModVal = auraDef.damageDealtModifier !== undefined ? evaluate(auraDef.damageDealtModifier) : null;
			const damageDealtAddVal = auraDef.damageDealtAddition !== undefined ? evaluate(auraDef.damageDealtAddition) : null;
			const healingDoneModVal = auraDef.healingDoneModifier !== undefined ? evaluate(auraDef.healingDoneModifier) : null;
			const healingDoneAddVal = auraDef.healingDoneAddition !== undefined ? evaluate(auraDef.healingDoneAddition) : null;
			const damageTakenModVal = auraDef.damageTakenModifier !== undefined ? evaluate(auraDef.damageTakenModifier) : null;
			const damageTakenAddVal = auraDef.damageTakenAddition !== undefined ? evaluate(auraDef.damageTakenAddition) : null;
			const healingTakenModVal = auraDef.healingTakenModifier !== undefined ? evaluate(auraDef.healingTakenModifier) : null;
			const healingTakenAddVal = auraDef.healingTakenAddition !== undefined ? evaluate(auraDef.healingTakenAddition) : null;

			for (let i = 0; i < 128; i++) {
				if (typeMask & (1 << i)) {
					if (damageDealtModVal !== null && actor.damageDealtModifiers[i] !== undefined) {
						actor.damageDealtModifiers[i] /= damageDealtModVal;
					}
					if (healingDoneModVal !== null && actor.healingDoneModifiers[i] !== undefined) {
						actor.healingDoneModifiers[i] /= healingDoneModVal;
					}
					if (damageTakenModVal !== null && actor.damageTakenModifiers[i] !== undefined) {
						actor.damageTakenModifiers[i] /= damageTakenModVal;
					}
					if (healingTakenModVal !== null && actor.healingTakenModifiers[i] !== undefined) {
						actor.healingTakenModifiers[i] /= healingTakenModVal;
					}

					// Additions (subtraction)
					if (damageDealtAddVal !== null && actor.damageDealtAdditions[i] !== undefined) {
						actor.damageDealtAdditions[i] -= damageDealtAddVal;
					}
					if (healingDoneAddVal !== null && actor.healingDoneAdditions[i] !== undefined) {
						actor.healingDoneAdditions[i] -= healingDoneAddVal;
					}
					if (damageTakenAddVal !== null && actor.damageTakenAdditions[i] !== undefined) {
						actor.damageTakenAdditions[i] -= damageTakenAddVal;
					}
					if (healingTakenAddVal !== null && actor.healingTakenAdditions[i] !== undefined) {
						actor.healingTakenAdditions[i] -= healingTakenAddVal;
					}

					if (auraDef.damageDealtSpecialModifier !== undefined && Array.isArray(actor.damageDealtSpecialModifiers[i])) {
						actor.damageDealtSpecialModifiers[i] = actor.damageDealtSpecialModifiers[i].filter(
							item => item !== auraDef.damageDealtSpecialModifier
						);
					}
					if (auraDef.damageDealtSpecialAddition !== undefined && Array.isArray(actor.damageDealtSpecialAdditions[i])) {
						actor.damageDealtSpecialAdditions[i] = actor.damageDealtSpecialAdditions[i].filter(
							item => item !== auraDef.damageDealtSpecialAddition
						);
					}
					if (auraDef.healingDoneSpecialModifier !== undefined && Array.isArray(actor.healingDoneSpecialModifiers[i])) {
						actor.healingDoneSpecialModifiers[i] = actor.healingDoneSpecialModifiers[i].filter(
							item => item !== auraDef.healingDoneSpecialModifier
						);
					}
					if (auraDef.healingDoneSpecialAddition !== undefined && Array.isArray(actor.healingDoneSpecialAdditions[i])) {
						actor.healingDoneSpecialAdditions[i] = actor.healingDoneSpecialAdditions[i].filter(
							item => item !== auraDef.healingDoneSpecialAddition
						);
					}
					if (auraDef.damageTakenSpecialModifier !== undefined && Array.isArray(actor.damageTakenSpecialModifiers[i])) {
						actor.damageTakenSpecialModifiers[i] = actor.damageTakenSpecialModifiers[i].filter(
							item => item !== auraDef.damageTakenSpecialModifier
						);
					}
					if (auraDef.damageTakenSpecialAddition !== undefined && Array.isArray(actor.damageTakenSpecialAdditions[i])) {
						actor.damageTakenSpecialAdditions[i] = actor.damageTakenSpecialAdditions[i].filter(
							item => item !== auraDef.damageTakenSpecialAddition
						);
					}
					if (auraDef.healingTakenSpecialModifier !== undefined && Array.isArray(actor.healingTakenSpecialModifiers[i])) {
						actor.healingTakenSpecialModifiers[i] = actor.healingTakenSpecialModifiers[i].filter(
							item => item !== auraDef.healingTakenSpecialModifier
						);
					}
					if (auraDef.healingTakenSpecialAddition !== undefined && Array.isArray(actor.healingTakenSpecialAdditions[i])) {
						actor.healingTakenSpecialAdditions[i] = actor.healingTakenSpecialAdditions[i].filter(
							item => item !== auraDef.healingTakenSpecialAddition
						);
					}
				}
			}
		}
	}
}
