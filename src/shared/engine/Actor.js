import { APLReader } from "./APLReader.js";
import { AuraHandler } from "./AuraHandler.js";
import { JSONEvaluator } from "./JSONEvaluator.js";
import { SharedData } from "./SharedData.js";
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
		this.statCache = {};
		this.modifierCache = {};
		this.team = team;
		this.stats.maxHp = 8*this.stats.stamina;
		this.resources.health = {
			max: this.stats.maxHp,
			current: this.stats.maxHp
		};
	}

	useAbility(){
		let [ability, targetId] = APLReader.parseAPL(this);
		console.log(ability);
		this.triggerEffects(ability.castEffects, targetId);
		SharedData.eventLoop.registerEvent(SharedData.eventLoop.time+ability.GCD/this.getStatEffect("haste"), {
			type: "checkAPL"
		});
	}
	
	triggerEffects(effects, abilityTarget) {
		effects.forEach(effect => {
			switch (effect.type) {
				case "damage":
					let targetId = -1;
					if (effect.targetId !== undefined && effect.targetId !== null) {
						targetId = JSONEvaluator.evaluateValue(this, effect.targetId, { abilityTarget: abilityTarget || JSONEvaluator.evaluateValue(this, this.defaultEnemyTarget(), {}) });
					} else {
						if (abilityTarget !== undefined && abilityTarget !== null) {
							targetId = abilityTarget;
						} else {
							targetId = JSONEvaluator.evaluateValue(this, this.defaultEnemyTarget(), {});
						}
					}
					let damage = JSONEvaluator.evaluateValue(this, effect.value, { targetId });
	
					// Apply multipliers (Versatility, Sanguine Ground, etc.)
					damage *= this.getStatEffect("versatility");
					damage *= this.getModifier("damageDone", effect.damageTypes);
					damage *= currentTarget.getModifier("damageTaken", effect.damageTypes);
	
					currentTarget.takeDamage(damage, effect.damageTypes, this);
					break;
				case "heal":
					targetId = -1;
					if (effect.targetId !== undefined && effect.targetId !== null) {
						targetId = JSONEvaluator.evaluateValue(this, effect.targetId, { abilityTarget: abilityTarget || JSONEvaluator.evaluateValue(this, this.defaultFriendlyTarget(), {}) });
					} else {
						if (abilityTarget !== undefined && abilityTarget !== null) {
							targetId = abilityTarget;
						} else {
							targetId = JSONEvaluator.evaluateValue(this, this.defaultFriendlyTarget(), {});
						}
					}
					break;
				case "buff":
					targetId = -1;
					if (effect.targetId !== undefined && effect.targetId !== null) {
						targetId = JSONEvaluator.evaluateValue(this, effect.targetId, { abilityTarget: abilityTarget || SharedData.actors.indexOf(this) });
					} else {
						if (abilityTarget !== undefined && abilityTarget !== null) {
							targetId = abilityTarget;
						} else {
							targetId = SharedData.actors.indexOf(this);
						}
					}
					let target = SharedData.actors[targetId];
					AuraHandler.applyBuff(target, this, effect.id, JSONEvaluator.evaluateValue(this, effect.duration, { targetId: targetId }), JSONEvaluator.evaluateValue(this, effect.stacks, { targetId: targetId }));
					break;
				case "debuff":
					targetId = -1;
					if (effect.targetId !== undefined && effect.targetId !== null) {
						targetId = JSONEvaluator.evaluateValue(this, effect.targetId, { abilityTarget: abilityTarget || JSONEvaluator.evaluateValue(this, this.defaultEnemyTarget(), {}) });
					} else {
						if (abilityTarget !== undefined && abilityTarget !== null) {
							targetId = abilityTarget;
						} else {
							targetId = JSONEvaluator.evaluateValue(this, this.defaultEnemyTarget(), {});
						}
					}
					target = SharedData.actors[targetId];
					AuraHandler.applyDebuff(target, this, effect.id, JSONEvaluator.evaluateValue(this, effect.duration, { targetId: targetId }), JSONEvaluator.evaluateValue(this, effect.stacks, { targetId: targetId }));
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
				case "useAbility":
					this.triggerEffects(this.abilities[effect.id].effects);
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
			haste: 1+this.applyStatDR(this.getStat("haste")/statCosts.haste[Math.max(this.level,12)]),
			mastery: this.applyStatDR(this.getStat("mastery")/statCosts.mastery[Math.max(this.level,12)]),
			versatility: this.applyStatDR(this.getStat("versatility")/statCosts.versatility[Math.max(this.level,12)]),
		}[stat];
	}

	getStat(stat) {
		if (stat === "mainWeaponSpeed") {
			return this.stats.mainWeaponSpeed/this.getStatEffect("haste");
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
		let cacheKey = types.sort().join(",")
		if (modifierCache[category][cacheKey]) {
			return modifierCache[category][cacheKey];
		}
		let mod = 1;
		const typesSet = new Set(types);
		this.buffs.forEach(buff => {
			if (buff.modifiers) {
				buff.modifiers.forEach(modifier => {
					if (modifier.category === category && (modifier.types.includes("all") || modifier.types.some(type => typesSet.has(type)))) {
						mod *= modifier.value;
					}
				})
			}
		});
		this.debuffs.forEach(debuff => {
			if (debuff.modifiers) {
				debuff.modifiers.forEach(modifier => {
					if (modifier.category === category && (modifier.types.includes("all") || modifier.types.some(type => typesSet.has(type)))) {
						mod *= modifier.value;
					}
				})
			}
		});
		modifierCache[category][cacheKey] = mod;
		return mod;
	}
	
	applyStatChanges(rating, stat) {
		if (this.statCache[stat] !== undefined) {
			return this.statCache[stat];
		}
		let current = rating;
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
		this.statCache[stat] = current
		return current;
	}

	resetRelevantCaches(buff){
		if (buff.statModifiers) {
			Object.keys(buff.statModifiers).forEach(stat => {
				this.statCache[stat] = undefined;
			});
		}
		if (buff.modifiers) {
			Object.keys(buff.modifiers).forEach(category => {
				const typeSet = new Set(buff.modifiers[category])
				Object.keys(this.modifierCache[category]).forEach(key => {
					if (typeSet.has("all") || key.split(",").some(type => typeSet.has(type))) {
						this.modifierCache[category][key] = undefined;
					}
				});
			});
		}
	}

	defaultEnemyTarget(){
		return {//Highest hp enemy as default
			type: "findBestActor",
			relation: "enemy",
			conditions: [],
			expression: {
				type: "resource",
				targetId: {
					type: "parameter",
					id: "targetId"
				},
				id: "hp",
				check: "value"
			}
		};
	}

	takeDamage(damage, sourceActor, types){
		this.resources.hp -= damage;
		SharedData.eventLoop.triggerListeners("takeDamage", this, {damage, newHp: this.resources.hp, sourceActor, types});
	}

	heal(amount, sourceActor, types){
		this.resources.hp += amount;
		SharedData.eventLoop.triggerListeners("heal", this, {amount, newHp: this.resources.hp, sourceActor, types});
	}
}