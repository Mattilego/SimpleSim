import { APLReader } from "./APLReader.js";
import { AuraHandler } from "./AuraHandler.js";
import { JSONEvaluator } from "./JSONEvaluator.js";
import statCosts from "../../data/statCosts.json";

export class Actor {
	constructor (level, apl, stats = {}, talents, team = 0, abilities = {}, knownBuffs = {}, knownDebuffs = {}, shortcuts = []){
		this.level = level;
		this.stats = stats;
		this.statPercentageAdditions = {};
		this.talents = talents;
		this.abilities = abilities;
		this.apl = apl;
		this.knownBuffs = knownBuffs;
		this.knownDebuffs = knownDebuffs;
		this.buffs = [];
		this.debuffs = [];
		this.shortcuts = shortcuts;
		this.resources = {};
		this.cooldowns = {};
		this.team = team;
	}

	useAbility(){
		let [ability, targetId] = APLReader.parseAPL(this, SharedData.actors);
		console.log(ability);
		this.triggerEffects(ability.castEffects, targetId, SharedData.actors, SharedData.eventLoop);
		SharedData.eventLoop.registerEvent(SharedData.eventLoop.time+ability.GCD/this.stats.haste, {
			type: "checkAPL"
		});
	}
	
	triggerEffects(effects, targetId) {
		effects.forEach(effect => {
			switch (effect.type) {
				case "damage":
					// TODO: Implement damage logic
					break;
				case "heal":
					// TODO: Implement heal logic
					break;
				case "resource":
					// TODO: Implement resource logic
					break;
				case "buff":
					let target = SharedData.actors[targetId];
					if (!targetId) {
						target = this;
					}
					AuraHandler.applyBuff(target, this, effect.buff, effect.duration, JSONEvaluator.evaluateValue(this, effect.stacks, {}));
					break;
				case "debuff":
					// TODO: Implement debuff logic
					break;
				case "event":
					eventLoop.registerEvent(effect.time, {
						source: this,
						effects: effect.effects
					});
					break;
				case "checkAPL":
					this.useAbility();
					break;
				case "setResource":
					this.resources[effect.id] = JSONEvaluator.evaluateValue(this, effect.value, {});
					break;
				default:
					console.error(`Unknown effect type: ${effect.type}`);
			}
		})
	}

	processStats() {
		this.triggerEffects(this.abilities._initialize);
	}

	getStatEffect(stat) {
		return {
			crit: this.applyStatDR(this.getStat("crit")/statCosts.crit[Math.max(this.level,12)]),
			haste: this.applyStatDR(this.getStat("haste")/statCosts.haste[Math.max(this.level,12)]),
			mastery: this.applyStatDR(this.getStat("mastery")/statCosts.mastery[Math.max(this.level,12)]),
			versatility: this.applyStatDR(this.getStat("versatility")/statCosts.versatility[Math.max(this.level,12)]),
		}[stat];
	}

	getStat(stat) {
		if (stat === "mainWeaponSpeed") {
			return this.stats.mainWeaposSpeed/this.getStatEffect("haste");
		}
		return this.applyStatChanges(this.stats[stat], stat);
	}

	applyStatDR(rating) {
		if (rating <= 1.3) {
			return rating;
		} else if (rating <= 1.39) {
			return 1.3 + (rating - 1.3) * 0.9;
		} else if (rating <= 1.47) {
			return 1.3 + 0.09*0.9 + (rating-1.39) * 0.8;
		} else if (rating <= 1.54) {
			return 1.3 + 0.09*0.9 + 0.08*0.8 + (rating-1.47) * 0.7;
		} else if (rating <= 1.66) {
			return 1.3 + 0.09*0.9 + 0.08*0.8 + 0.07*0.7 + (rating-1.54) * 0.6;
		} else {
			return Math.min(2, 1.3 + 0.09*0.9 + 0.08*0.8 + 0.07*0.7 + 0.12*0.6 + (rating-1.66) * 0.5);
		}
	}

	getModifier(category, types){
		let mod = 1;
		const typesSet = new Set(types);
		this.buffs.forEach(buff => {
			if (buff.modifiers) {
				buff.modifiers.forEach(modifier => {
					if (modifier.category === category && modifier.types.some(type => typesSet.has(type))) {
						mod *= modifier.value;
					}
				})
			}
		});
		this.debuffs.forEach(debuff => {
			if (debuff.modifiers) {
				debuff.modifiers.forEach(modifier => {
					if (modifier.category === category && modifier.types.some(type => typesSet.has(type))) {
						mod *= modifier.value;
					}
				})
			}
		});
		return mod;
	}
	
	applyStatChanges(rating, stat) {
		let current = rating;
		const typesSet = new Set([stat]);
		this.buffs.forEach(buff => {
			if (buff.statModifiers) {
				if (buff.statModifiers[stat]) {
					current = JSONEvaluator.evaluateValue(this, buff.statModifiers[stat], {currentStat: current});
				}
			}
		});
		this.debuffs.forEach(debuff => {
			if (debuff.statModifiers) {
				if (debuff.statModifiers[stat]){
					current = JSONEvaluator.evaluateValue(this, debuff.statModifiers[stat], {currentStat: current});
				}
			}
		});
		return rating * mod;
	}
}