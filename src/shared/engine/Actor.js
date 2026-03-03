import { APLReader } from "./APLReader.js";
import { AuraHandler } from "./AuraHandler.js";
import { JSONEvaluator } from "./JSONEvaluator.js";
import { SharedData } from "./SharedData.js";
import { Log } from "./Log.js";
import { ProcHandler } from "./ProcHandler.js";
import statCosts from "../../data/statCosts.json";

export class Actor {
	constructor(name, level, apl, stats = {}, talents, team = 0, abilities = {}, knownBuffs = {}, knownDebuffs = {}, shortcuts = []) {
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
		this.stats.maxHp = 8 * this.stats.stamina;
		this.resources.health = {
			max: this.stats.maxHp,
			value: this.stats.maxHp
		};
		this.procHandler = new ProcHandler();
		this.name = name;
	}

	useAbility() {
		let [ability, targetId] = APLReader.parseAPL(this);
		if (ability == null) {
			SharedData.eventLoop.registerEvent((SharedData.eventLoop.futureEvents.find((event) => event.time > SharedData.eventLoop.time) || { time: SharedData.eventLoop.time + 0.1 }).time, {
				effects: [
					{
						type: "checkAPL",
						security: this.name
					}
				],
				source: this
			});
			return;
		}
		this.triggerEffects(ability.castEffects, targetId);
		this.cooldowns[ability] = SharedData.eventLoop.time + JSONEvaluator.evaluateValue(this, ability.cooldown, {}) + (ability.castTime ? JSONEvaluator.evaluateValue(this, ability.castTime, {}) / this.getStatEffect("haste") : 0);
		SharedData.eventLoop.registerEvent(SharedData.eventLoop.time + (ability.GCD * 1.5) / this.getStatEffect("haste"), {
			effects: [
				{
					type: "checkAPL",
					security: this.name
				}
			],
			source: this
		});
	}

	triggerEffects(effects, abilityTarget, parameters = {}) {
		effects.forEach((effect) => {
			switch (effect.type) {
				case "damage":
					let targetId = -1;
					if (effect.targetId !== undefined && effect.targetId !== null) {
						targetId = JSONEvaluator.evaluateValue(this, effect.targetId, Object.assign({}, parameters, { abilityTarget: abilityTarget || JSONEvaluator.evaluateValue(this, this.defaultEnemyTarget(), parameters) }));
					} else {
						if (abilityTarget !== undefined && abilityTarget !== null) {
							targetId = abilityTarget;
						} else {
							targetId = JSONEvaluator.evaluateValue(this, this.defaultEnemyTarget(), parameters);
						}
					}
					const currentTarget = SharedData.actors[targetId];
					let damage = JSONEvaluator.evaluateValue(this, effect.value, Object.assign({}, parameters, { targetId }));

					// Apply multipliers (Versatility, Sanguine Ground, etc.)
					damage *= this.getStatEffect("versatility");
					damage *= this.getModifier("damageDone", effect.damageTypes);
					damage *= currentTarget.getModifier("damageTaken", effect.damageTypes);
					currentTarget.takeDamage(damage, effect.missable === true, effect.dodgeable === true, effect.parryable === true, effect.blockable === true, effect.damageTypes, this);
					break;
				case "heal":
					targetId = -1;
					if (effect.targetId !== undefined && effect.targetId !== null) {
						targetId = JSONEvaluator.evaluateValue(this, effect.targetId, Object.assign({}, parameters, { abilityTarget: abilityTarget || JSONEvaluator.evaluateValue(this, this.defaultFriendlyTarget(), parameters) }));
					} else {
						if (abilityTarget !== undefined && abilityTarget !== null) {
							targetId = abilityTarget;
						} else {
							targetId = JSONEvaluator.evaluateValue(this, this.defaultFriendlyTarget(), parameters);
						}
					}
					break;
				case "buff":
					targetId = -1;
					if (effect.targetId !== undefined && effect.targetId !== null) {
						targetId = JSONEvaluator.evaluateValue(this, effect.targetId, Object.assign({}, parameters, { abilityTarget: abilityTarget || this.id }));
					} else {
						if (abilityTarget !== undefined && abilityTarget !== null) {
							targetId = abilityTarget;
						} else {
							targetId = this.id;
						}
					}
					let target = SharedData.actors[targetId];
					AuraHandler.applyBuff(target, this, effect.id, JSONEvaluator.evaluateValue(this, effect.duration, Object.assign({}, parameters, { targetId: targetId })), JSONEvaluator.evaluateValue(this, effect.stacks, Object.assign({}, parameters, { targetId: targetId })));
					break;
				case "debuff":
					targetId = -1;
					if (effect.targetId !== undefined && effect.targetId !== null) {
						targetId = JSONEvaluator.evaluateValue(this, effect.targetId, Object.assign({}, parameters, { abilityTarget: abilityTarget || JSONEvaluator.evaluateValue(this, this.defaultEnemyTarget(), parameters) }));
					} else {
						if (abilityTarget !== undefined && abilityTarget !== null) {
							targetId = abilityTarget;
						} else {
							targetId = JSONEvaluator.evaluateValue(this, this.defaultEnemyTarget(), parameters);
						}
					}
					target = SharedData.actors[targetId];
					AuraHandler.applyDebuff(target, this, effect.id, JSONEvaluator.evaluateValue(this, effect.duration, Object.assign({}, parameters, { targetId: targetId })), JSONEvaluator.evaluateValue(this, effect.stacks, Object.assign({}, parameters, { targetId: targetId })));
					break;
				case "event":
					eventLoop.registerEvent(effect.time, {
						source: this,
						effects: effect.effects
					});
					break;
				case "checkAPL": //Shouldn't be called from abilities, only the event sent by the previous ability ue
					if (effect.security === this.name) {
						this.useAbility();
					} else {
						Log.warn("checkAPL effect called somewhere other than it should, check ability and aura definitions");
					}
					break;
				case "createResource":
					this.resources[effect.id] = {
						value: effect.initialValue,
						max: effect.maxValue
					};
				case "setResource":
					this.resources[effect.id].value = JSONEvaluator.evaluateValue(this, effect.value, parameters);
					break;
				case "setResourceMax":
					this.resources[effect.id].max = JSONEvaluator.evaluateValue(this, effect.vaue, parameters);
				case "useAbility":
					try {
						this.triggerEffects(this.abilities[effect.id].castEffects, abilityTarget, parameters);
					} catch (error) {
						Log.error(`Infinite recursion with ability ${effect.id}, please check ability definition`);
					}
					break;
				case "removeBuff":
					targetId = -1;
					if (effect.targetId !== undefined && effect.targetId !== null) {
						targetId = JSONEvaluator.evaluateValue(this, effect.targetId, Object.assign({}, parameters, { abilityTarget: abilityTarget || this.id }));
					} else {
						if (abilityTarget !== undefined && abilityTarget !== null) {
							targetId = abilityTarget;
						} else {
							targetId = this.id;
						}
					}
					target = SharedData.actors[targetId];
					target.buffs.find((buff) => buff.id === effect.id).duration = 0;
					break;
				case "removeDebuff":
					targetId = -1;
					if (effect.targetId !== undefined && effect.targetId !== null) {
						targetId = JSONEvaluator.evaluateValue(this, effect.targetId, Object.assign({}, parameters, { abilityTarget: abilityTarget || this.id }));
					} else {
						if (abilityTarget !== undefined && abilityTarget !== null) {
							targetId = abilityTarget;
						} else {
							targetId = this.id;
						}
					}
					target = SharedData.actors[targetId];
					target.debuffs.find((debuff) => debuff.id === effect.id).duration = 0;
					break;
				case "shortcut":
					try {
						this.triggerEffects(this.shortcuts[effect.id], abilityTarget, parameters);
					} catch (e) {
						Log.error("Infinite recusion with shortcut " + effect.id + ", please check it's definition");
					}
					break;
				case "registerEventHandler":
					if (JSONEvaluator.evaluateValue(effect.conditions)) {
						SharedData.eventLoop.registerEventHandler(effect.id, targetId, {
							source: this,
							effects: effect.effects
						});
					}
					break;
				default:
					Log.error(`Unknown effect type: ${effect.type}`);
			}
		});
	}

	processStats() {
		this.triggerEffects(this.abilities._Initialize.castEffects);
	}

	getStatEffect(stat) {
		return {
			crit: this.applyStatDR(this.getStat("crit") / statCosts.crit[Math.max(this.level, 12)]),
			haste: 1 + this.applyStatDR(this.getStat("haste") / statCosts.haste[Math.max(this.level, 12)]),
			mastery: this.applyStatDR(this.getStat("mastery") / statCosts.mastery[Math.max(this.level, 12)]),
			versatility: 1 + this.applyStatDR(this.getStat("versatility") / statCosts.versatility[Math.max(this.level, 12)]),
			leech: this.applyStatDR(this.getStat("leech") / statCosts.leech[Math.max(this.level, 12)]),
			parry: this.applyStatDR(this.getStat("parry") / statCosts.parry[Math.max(this.level, 12)]),
			block: this.applyStatDR(this.getStat("block") / statCosts.block[Math.max(this.level, 12)]),
			dodge: this.applyStatDR(this.getStat("dodge") / statCosts.dodge[Math.max(this.level, 12)])
		}[stat];
	}

	getStat(stat) {
		if (stat === "mainWeaponSpeed") {
			return this.stats.mainWeaponSpeed / this.getStatEffect("haste");
		}
		return this.applyStatChanges(this.applyStatModifiers(this.stats[stat], stat), stat);
	}

	applyStatDR(rating) {
		if (rating <= 1.3) {
			return rating;
		} else if (rating <= 1.39) {
			return 1.3 + (rating - 1.3) * 0.9;
		} else if (rating <= 1.47) {
			return 1.3 + 0.09 * 0.9 + (rating - 1.39) * 0.8;
		} else if (rating <= 1.54) {
			return 1.3 + 0.09 * 0.9 + 0.08 * 0.8 + (rating - 1.47) * 0.7;
		} else if (rating <= 1.66) {
			return 1.3 + 0.09 * 0.9 + 0.08 * 0.8 + 0.07 * 0.7 + (rating - 1.54) * 0.6;
		} else {
			return Math.min(2, 1.3 + 0.09 * 0.9 + 0.08 * 0.8 + 0.07 * 0.7 + 0.12 * 0.6 + (rating - 1.66) * 0.5);
		}
	}

	getModifier(category, types) {
		let cacheKey = types.sort().join(",");
		if (this.modifierCache[category] && this.modifierCache[category][cacheKey]) {
			return this.modifierCache[category][cacheKey];
		}
		let mod = 1;
		const typesSet = new Set(types);
		this.buffs.forEach((buff) => {
			if (buff.modifiers) {
				buff.modifiers.forEach((modifier) => {
					if (modifier.category === category && (modifier.types.includes("all") || modifier.types.some((type) => typesSet.has(type)))) {
						mod *= modifier.value;
					}
				});
			}
		});
		this.debuffs.forEach((debuff) => {
			if (debuff.modifiers) {
				debuff.modifiers.forEach((modifier) => {
					if (modifier.category === category && (modifier.types.includes("all") || modifier.types.some((type) => typesSet.has(type)))) {
						mod *= modifier.value;
					}
				});
			}
		});
		if (this.modifierCache[category] === undefined) {
			this.modifierCache[category] = {};
		}
		this.modifierCache[category][cacheKey] = mod;
		return mod;
	}

	applyStatModifiers(rating, stat) {
		if (this.statCache[stat] !== undefined && this.statCache[stat].modifiers !== undefined) {
			return this.statCache[stat].modifiers;
		}
		let mod = 1;
		this.buffs.forEach((buff) => {
			if (buff.statModifiers) {
				if (buff.statModifiers[stat]) {
					mod *= JSONEvaluator.evaluateValue(this, buff.statModifiers[stat], { currentStat: rating });
				}
			}
		});

		this.debuffs.forEach((debuff) => {
			if (debuff.statModifiers) {
				if (debuff.statModifiers[stat]) {
					mod *= JSONEvaluator.evaluateValue(this, debuff.statModifiers[stat], { currentStat: rating });
				}
			}
		});
		if (this.statCache[stat] === undefined) {
			this.statCache[stat] = {};
		}
		this.statCache[stat].modifiers = mod;
		return mod;
	}

	applyStatChanges(rating, stat) {
		if (this.statCache[stat].changes !== undefined) {
			return this.statCache[stat].changes;
		}
		let current = rating;
		this.buffs.forEach((buff) => {
			if (buff.statChanges) {
				if (buff.statChanges[stat]) {
					current = JSONEvaluator.evaluateValue(this, buff.statChanges[stat], { currentStat: current });
				}
			}
		});
		this.debuffs.forEach((debuff) => {
			if (debuff.statChanges) {
				if (debuff.statChanges[stat]) {
					current = JSONEvaluator.evaluateValue(this, debuff.statChanges[stat], { currentStat: current });
				}
			}
		});
		this.statCache[stat].changes = current;
		return current;
	}

	resetRelevantCaches(buff) {
		if (buff.statModifiers) {
			Object.keys(buff.statModifiers).forEach((stat) => {
				if (this.statCache[stat] == undefined) {
					this.statCache[stat] = {};
				}
				this.statCache[stat].modifiers = undefined;
			});
		}
		if (buff.statChanges) {
			Object.keys(buff.statChanges).forEach((stat) => {
				if (this.statCache[stat] == undefined) {
					this.statCache[stat] = {};
				}
				this.statCache[stat].changes = undefined;
			});
		}
		if (buff.modifiers) {
			Object.keys(buff.modifiers).forEach((category) => {
				if (this.modifierCache[category] == undefined) {
					this.modifierCache[category] = {};
				}
				const typeSet = new Set(buff.modifiers[category]);
				Object.keys(this.modifierCache[category]).forEach((key) => {
					if (typeSet.has("all") || key.split(",").some((type) => typeSet.has(type))) {
						this.modifierCache[category][key] = undefined;
					}
				});
			});
		}
	}

	defaultEnemyTarget() {
		return {
			//Highest hp enemy as default
			type: "findBestActor",
			relation: "enemy",
			conditions: [],
			expression: {
				type: "resource",
				targetId: {
					type: "parameter",
					id: "actorId"
				},
				id: "health",
				check: "value"
			}
		};
	}

	defaultFriendlyTarget() {
		return {
			//Highest hp enemy as default
			type: "findBestActor",
			relation: "ally",
			conditions: [],
			expression: {
				type: "-",
				value1: 100,
				value2: {
					type: "resource",
					targetId: {
						type: "parameter",
						id: "actorId"
					},
					id: "hp",
					check: "percentage"
				}
			}
		};
	}

	takeDamage(damage, missable, dodgeable, parryable, blockable, types, sourceActor) {
		const hit = this.checkForHit(missable, dodgeable, parryable, blockable, sourceActor);
		if (hit === "hit" || hit === "crit" || hit === "block") {
			damage *= 1 - (this.getStatEffect("versatility") - 1) / 2;
			if (types.includes("physical") || types.includes("all")) {
				if (sourceActor.level < 60) {
					damage *= 1 - this.getStat("armor") / (this.getStat("armor") + 400 + 85 * sourceActor.level);
				} else if (sourceActor.level < 80) {
					damage *= 1 - this.getStat("armor") / (this.getStat("armor") + 400 + 85 * sourceActor.level + 4.5 * (sourceActor.level - 59));
				} else if (sourceActor.level < 85) {
					damage *= 1 - this.getStat("armor") / (this.getStat("armor") + 400 + 85 * sourceActor.level + 4.5 * (sourceActor.level - 59) + 20 * (sourceActor.level - 80));
				} else {
					damage *= 1 - this.getStat("armor") / (this.getStat("armor") + 400 + 85 * sourceActor.level + 4.5 * (sourceActor.level - 59) + 20 * (sourceActor.level - 80) + 22 * (sourceActor.level - 85));
				}
			}
			damage *= hit === "crit" ? 2 : 1;
			damage *= hit === "block" ? 0.3 : 1;
			damage = this.applyDamageTakenChanges(damage, types, this.resources.health.value);
			sourceActor.heal(damage * sourceActor.getStatEffect("leech"), types, sourceActor);

			let buffId = 0; //Absorbs
			while (buffId < this.buffs.length && damage > 0) {
				if (this.buffs[buffId].absorbTypes.includes("all") || types.includes("all") || this.buffs[buffId].absorbTypes.some((type) => types.includes(type))) {
					if (this.buffs[buffId].value > damage) {
						this.buffs[buffId].value -= damage;
						damage = 0;
					} else {
						damage -= this.buffs[buffId].value;
						this.buffs[buffId].duration = 0; //Set duration so that it can remove expiration event
					}
				}
				buffId++;
			}

			this.resources.health.value -= damage;
			SharedData.eventLoop.triggerListeners("takeDamage", this, { damage, newHp: this.resources.health, sourceActor, types });
		} else if (hit === "parry") {
			SharedData.eventLoop.triggerListeners("parry", this, { sourceActor });
		} else if (hit === "dodge") {
			SharedData.eventLoop.triggerListeners("dodge", this, { sourceActor });
		} else if (hit === "miss") {
			SharedData.eventLoop.triggerListeners("miss", this, { sourceActor });
		}
		if (hit === "block") {
			SharedData.eventLoop.triggerListeners("block", this, { sourceActor });
		}
	}

	applyDamageTakenChanges(damage, types, currentHp) {
		for (let i = 0; i < this.buffs.length; i++) {
			if (this.buffs[i].damagetakenChange && (this.buffs[i].types.includes("all") || types.includes("all") || this.buffs[i].types.some((type) => types.includes(type)))) {
				damage = JSONEvaluator.evaluateValue(this, this.buffs[i].damagetakenChange, { damage, currentHp });
			}
		}
		return damage;
	}

	checkForHit(missable, dodgeable, parryable, blockable, sourceActor) {
		const missChance = this.chanceToMissOf(sourceActor) * (missable ? 1 : 0);
		const dodgeChance = this.chanceToDodgeFrom(sourceActor) * (dodgeable ? 1 : 0);
		const parryChance = this.chanceToParryFrom(sourceActor) * (parryable ? 1 : 0);
		const blockChance = this.chanceToBlockFrom(sourceActor) * (blockable ? 1 : 0);
		const roll = Math.random();
		if (roll < missChance) {
			return "miss";
		} else if (roll < missChance + dodgeChance) {
			return "dodge";
		} else if (roll < missChance + dodgeChance + parryChance) {
			return "parry";
		} else if (roll < missChance + dodgeChance + parryChance + blockChance) {
			return "block";
		} else if (roll < missChance + dodgeChance + parryChance + blockChance + sourceActor.getStatEffect("crit")) {
			return "crit";
		}
		return "hit";
	}

	heal(amount, types, sourceActor) {
		this.resources.health.value += amount;
		Log.log(this.name + " healed for " + amount + " by " + sourceActor.name);
		SharedData.eventLoop.triggerListeners("heal", this, { amount, newHp: this.resources.health, sourceActor, types });
	}

	get id() {
		if (this.actorId) {
			return this.actorId;
		} else {
			this.actorId = SharedData.actors.indexOf(this);
			return this.actorId;
		}
	}

	chanceToMissOf(sourceActor) {
		return 0;
	}

	chanceToDodgeFrom(sourceActor) {
		return 0;
	}

	chanceToParryFrom(sourceActor) {
		return this.getStatEffect("parry");
	}

	chanceToBlockFrom(sourceActor) {
		return 0;
	}
}
