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
		this.team = team;
		this.stats.maxHp = 8 * this.stats.stamina;
		this.resources.health = {
			max: this.stats.maxHp,
			value: this.stats.maxHp
		};
		this.procHandler = new ProcHandler();
		this.name = name;
		this.statModifiers = {};
		this.statAdditions = {};
		this.statSpecialChanges = {};
		this.damageDoneModifiers = {};
		this.damageDoneAdditions = {};
		this.damageDoneSpecialChnges = {};
		this.healingDoneModifiers = {};
		this.healingDoneAdditions = {};
		this.healingDoneSpecialChanges = {};
		this.damageTakenModifiers = {};
		this.damageTakenAdditions = {};
		this.damagetakenSpecialChanges = {};
		this.absorbs = {};
		this.healAbsorbs = {};
	}

	updateCooldowns(){
		Object.keys(this.cooldowns).forEach((ability) => {
			if (this.cooldowns[ability].refreshTime <= SharedData.eventLoop.time) {
				this.cooldowns[ability].charges++;
				if (this.cooldowns[ability].charges < JSONEvaluator.evaluateValue(this, this.abilities[ability].charges || 1, {})){
					this.cooldowns[ability].refreshTime = this.cooldowns[ability].refreshTime + JSONEvaluator.evaluateValue(this, this.abilities[ability].cooldown || 0, {});
				}
			}
		});
	}

	useAbility() {
		this.updateCooldowns();
		let [ability, abilityName, targetId] = APLReader.parseAPL(this);
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
		this.triggerEffects(ability.castEffects, targetId, {}, abilityName);
		if (ability.cooldown !== 0){
			if (this.cooldowns[abilityName] === undefined){
				this.cooldowns[abilityName] = {
					refreshTime: null,
					charges: JSONEvaluator.evaluateValue(this, ability.charges || 1, {})-0
				};
			}
			this.cooldowns[abilityName].refreshTime = SharedData.eventLoop.time + JSONEvaluator.evaluateValue(this, ability.cooldown, {}) + (ability.castTime ? JSONEvaluator.evaluateValue(this, ability.castTime, {}) / this.getStatEffect("haste") : 0);
		}
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

	triggerEffects(effects, abilityTarget, parameters = {}, name = "unknown") {
		effects.forEach((effect) => {
			if (!JSONEvaluator.evaluateValue(this, effect.conditions, parameters)) {
				return;
			}
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
					let currentTarget = SharedData.actors[targetId];
					let damage = JSONEvaluator.evaluateValue(this, effect.value, Object.assign({}, parameters, { targetId }));

					// Apply multipliers (Versatility, Sanguine Ground, etc.)
					damage *= this.getStatEffect("versatility");
					damage *= this.getDamageDoneModifier(types);
					damage += this.getDamageDoneAddition(types);
					damage = this.applyDamageDoneSpeciaChanges(damage, types);
					currentTarget.takeDamage(damage, effect.missable === true, effect.dodgeable === true, effect.parryable === true, effect.blockable === true, effect.damageTypes, this, name);
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
					currentTarget = SharedData.actors[targetId];
					let healing = JSONEvaluator.evaluateValue(this, effect.value, Object.assign({}, parameters, { targetId: targetId }));
					healing *= this.getStatEffect("versatility")*this.gethealingDoneModifier(effect.healingTypes);
					currentTarget.heal(healing+this.getHealingDoneAddition(effect.healingTypes), effect.healingTypes, sourceActor);
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
					AuraHandler.applyBuff(target, this, effect.id, JSONEvaluator.evaluateValue(this, effect.duration, Object.assign({}, parameters, { targetId: targetId })), JSONEvaluator.evaluateValue(this, effect.stacks || 1, Object.assign({}, parameters, { targetId: targetId })));
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
					SharedData.eventLoop.registerEvent(JSONEvaluator.evaluateValue(this, effect.time, parameters), {
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
						value: JSONEvaluator.evaluateValue(this, effect.initialValue, parameters),
						max: JSONEvaluator.evaluateValue(this, effect.maxValue, parameters)
					};
					break;
				case "setResource":
					let oldResourceValue = this.resources[effect.id].value;
					this.resources[effect.id].value = JSONEvaluator.evaluateValue(this, effect.value, parameters);
					SharedData.eventLoop.triggerListeners("resourceChange", this.id, { resource: effect.id, oldValue: oldResourceValue, newValue: this.resources[effect.id].value });
					break;
				case "setResourceMax":
					this.resources[effect.id].max = JSONEvaluator.evaluateValue(this, effect.vaule, parameters);
					break;
				case "useAbility":
					try {
						this.triggerEffects(this.abilities[effect.id].castEffects, abilityTarget, parameters, effect.id);
					} catch (error) {
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
					let index = target.buffs.findIndex((buff) => buff.id === effect.id && buff.source === this)
					if (target.buffs[index].expirationTime === SharedData.eventLoop.time){
						this.triggerEffects(this.knownBuffs[target.buffs[index].id].expirationEffects, targetId, parameters, name);
					} else {
						this.triggerEffects(this.knownBuffs[target.buffs[index].id].removalEffects, targetId, parameters, name);
					}
					target.buffs.splice(index, 1);
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
					index = target.debuffs.findIndex((debuff) => debuff.id === effect.id && debuff.source === this)
					if (target.debuffs[index].expirationTime === SharedData.eventLoop.time){
						this.triggerEffects(this.knownDebuffs[target.debuffs[index].id].expirationEffects, targetId, parameters, name);
					} else {
						this.triggerEffects(this.knownDebuffs[target.debuffs[index].id].removalEffects, targetId, parameters, name);
					}
					target.debuffs.splice(index, 1);
					break;
				case "shortcut":
					try {
						this.triggerEffects(this.shortcuts[effect.id], abilityTarget, Object.assign({}, effect.parameters, parameters), name);
					} catch (e) {
						Log.error("Infinite recusion with shortcut " + effect.id + ", please check it's definition");
					}
					break;
				case "registerEventHandler":
					if (JSONEvaluator.evaluateValue(effect.conditions)) {
						SharedData.eventLoop.registerEventHandler(effect.id, JSONEvaluator.evaluateValue(this,effect.targetId,parameters), this, effect.eventConditions, effect.effects);
					}
					break;
				case "runOnActors":
					for (let actorId = 0; actorId < SharedData.actors.length; actorId++) {
						if (!((this.team === SharedData.actors[actorId].team && effect.relation === "enemy") || (this.team !== SharedData.actors[actorId].team && effect.relation === "ally")) &&JSONEvaluator.evaluateValue(this, effect.conditions, Object.assign({}, parameters, { actorId: actorId }))) {
							this.triggerEffects(effect.effects, actorId, parameters, name); 
						}
					}
					
				default:
					Log.error(`Unknown effect type: ${effect.type}`);
			}
		});
	}

	processStats() {
		this.triggerEffects(this.abilities._Initialize.castEffects, null, {}, "Initialization");
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
		return this.applySpecialStatChanges(this.stats[stat]*this.statMultipliers[stat]+this.statAdditions[stat], stat);
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

	takeDamage(damage, missable, dodgeable, parryable, blockable, types, sourceActor, name) {
		const hit = this.checkForHit(missable, dodgeable, parryable, blockable, sourceActor);
		if (hit === "hit" || hit === "crit" || hit === "block") {
			damage *= hit === "crit" ? 2 : 1;
			const rawDamage = damage;
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
			damage *= hit === "block" ? 0.3 : 1;
			damage *= this.getDamageTakenModifier(types);
			damage += this.getDamageTakenAdditions(types);
			damage = this.applyDamageTakenSpecialChanges(damage, types);
			sourceActor.heal(damage * sourceActor.getStatEffect("leech"), types, sourceActor);
			const preAbsorbDamage = damage;
			let buffId = 0; //Absorbs
			while (buffId < this.absorbs.length && damage > 0) {
				if (this.absorbs[buffId].absorbTypes.includes("all") || types.includes("all") || this.absorbs[buffId].absorbTypes.some((type) => types.includes(type))) {
					if (this.absorbs[buffId].value > damage) {
						this.absorbs[buffId].value -= damage;
						damage = 0;
					} else {
						damage -= this.absorbs[buffId].value;
						this.absorbs[buffId].duration = 0; //Set duration so that it can remove expiration event
					}
				}
				buffId++;
			}

			this.resources.health.value -= damage;
			SharedData.eventLoop.triggerListeners("takeDamage", this.id, { damage: preAbsorbDamage, mitigated: rawDamage-damage, absorbed: preAbsorbDamage - damage, newHp: this.resources.health, sourceActor, types, target: this, name: name });
		} else if (hit === "parry") {
			SharedData.eventLoop.triggerListeners("parry", this.id, { sourceActor });
		} else if (hit === "dodge") {
			SharedData.eventLoop.triggerListeners("dodge", this.id, { sourceActor });
		} else if (hit === "miss") {
			SharedData.eventLoop.triggerListeners("miss", this.id, { sourceActor });
		}
		if (hit === "block") {
			SharedData.eventLoop.triggerListeners("block", this.id, { sourceActor });
		}
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
		const preAbsorbHealing = amount;
		let healing = amount*this.getHealingTakenModifier(types);
		healing += amount*this.getHealingTakenAddition(types);
		healing = this.applyHealingTakenSpeciaChanges(types);
		this.resources.health.value += amount;
		SharedData.eventLoop.triggerListeners("heal", this.id, { amount, newHp: this.resources.health, sourceActor, types, preAbsorbHealing });
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
