import { APLReader } from "./APLReader.js";
import { AuraHandler } from "./AuraHandler.js";
import { JSONEvaluator } from "./JSONEvaluator.js";
import { SharedData } from "./SharedData.js";
import { Log } from "./Log.js";
import { ProcHandler } from "./ProcHandler.js";
import statCosts from "../../data/statCosts.json";

export class Actor {
	constructor(name, level, apl, stats = {}, talents, team = 0, abilities = {}, knownAuras = {}, shortcuts = [], baseGCD = 1.5) {
		this.level = level;
		this.stats = stats;
		this.statPercentageAdditions = {};
		this.talents = talents;
		this.abilities = abilities;
		this.apl = apl;
		this.knownAuras = knownAuras;
		this.auras = new Map();
		this.shortcuts = shortcuts;
		this.resources = {};
		this.cooldowns = {};
		this.team = team;
		this.stats.maxHp = 8 * this.stats.stamina;
		this.resources.prototypeProtectionhealth = this.stats.maxHp;
		this.procHandler = new ProcHandler();
		this.name = name;
		this.statMultipliers = {};
		this.statAdditions = {};
		this.statSpecialMultipliers = {};
		this.statSpccialAdditions = {};
		this.damageDoneModifiers = {};
		this.damageDoneAdditions = {};
		this.damageDoneSpecialModifiers = {};
		this.damageDoneSpecialAdditions = {};
		this.damageTakenModifiers = {};
		this.damageTakenAdditions = {};
		this.damageTakenSpecialModifiers = {};
		this.damageTakenSpecialAdditions = {};
		this.healingDoneModifiers = {};
		this.healingDoneAdditions = {};
		this.healingDoneSpecialModifiers = {};
		this.healingDoneSpecialAdditions = {};
		this.absorbs = new Set();
		this.healAbsorbs = {};
		this.baseGCD = baseGCD
	}

	updateCooldowns() {
		Object.keys(this.cooldowns).forEach((ability) => {
			if (this.cooldowns[ability].refreshTime <= SharedData.eventLoop.time) {
				this.cooldowns[ability].charges++;
				if (this.cooldowns[ability].charges < JSONEvaluator.evaluateValue(this, this.abilities[ability].charges || 1, {})) {
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
		if (ability.cooldown !== 0) {
			if (this.cooldowns[abilityName] === undefined) {
				this.cooldowns[abilityName] = {
					refreshTime: null,
					charges: JSONEvaluator.evaluateValue(this, ability.charges || 1, {}) - 0
				};
			}
			this.cooldowns[abilityName].refreshTime = SharedData.eventLoop.time + JSONEvaluator.evaluateValue(this, ability.cooldown, {}) + (ability.castTime ? JSONEvaluator.evaluateValue(this, ability.castTime, {}) / this.getStatEffect("haste") : 0);
		}
		SharedData.eventLoop.registerEvent(SharedData.eventLoop.time + (ability.castTime ? JSONEvaluator.evaluateValue(this, ability.castTime, {}):((ability.GCD || 1) * this.baseGCD)) / this.getStatEffect("haste"), {
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
		if (SharedData.compiling && typeof effects.compiled === "function") {
			effects.compiled(SharedData, this, parameters, abilityTarget, effects, name);
			return;
		}
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
					this.dealDamage(JSONEvaluator.evaluateValue(this, effect.value, Object.assign({}, parameters, { targetId })), currentTarget, effect.types, name, effect.missable === true, effect.dodgeable === true, effect.parryable === true, effect.blockable === true);
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
					this.doHealing(healing, currentTarget, effect.healingTypes, name);
					break;
				case "applyAura":
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
					let target = SharedData.actors[targetId];
					AuraHandler.applyAura(target, this, effect.id, JSONEvaluator.evaluateValue(this, effect.duration, Object.assign({}, parameters, { targetId: targetId })), JSONEvaluator.evaluateValue(this, effect.stacks, Object.assign({}, parameters, { targetId: targetId })));
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
					this.resources[effect.id] = JSONEvaluator.evaluateValue(this, effect.value, parameters);
					break;
				case "setResource":
					let oldResourceValue = this.resources[effect.id].value;
					this.resources[effect.id] = JSONEvaluator.evaluateValue(this, effect.value, parameters);
					SharedData.eventLoop.triggerListeners("resourceChange", this.id, { resource: effect.id, oldValue: oldResourceValue, newValue: this.resources[effect.id].value });
					break;
				case "useAbility":
					this.triggerEffects(this.abilities[effect.id].castEffects, abilityTarget, parameters, effect.id);
					break;
				case "removeAura":
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
					let removedAura = target.auras.get(effect.id).shift();
					if (target.auras.get(effect.id).length === 0) {
						target.auras.delete(effect.id);
					}
					if (this.absorbs.has(removedAura)) {
						this.absorbs.delete(removedAura);
					}
					if (SharedData.eventLoop.time === removedAura.expirationTime && this.knownAuras[removedAura.id].expirationAbility !== undefined) {
						this.triggerEffects([{type: "useAbility", id: this.knownAuras[removedAura.id].expirationAbility}], abilityTarget, parameters);
					} else if (SharedData.eventLoop.time !== removedAura.expirationTime && this.knownAuras[removedAura.id].removalAbility !== undefined){
						this.triggerEffects([{type: "useAbility", id: this.knownAuras[removedAura.id].removalAbility}], abilityTarget, parameters);
					}
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
						SharedData.eventLoop.registerEventHandler(effect.id, JSONEvaluator.evaluateValue(this, effect.targetId, parameters), this, effect.eventConditions, effect.effects);
					}
					break;
				case "runOnActors":
					for (let actorId = 0; actorId < SharedData.actors.length; actorId++) {
						if (!((this.team === SharedData.actors[actorId].team && effect.relation === "enemy") || (this.team !== SharedData.actors[actorId].team && effect.relation === "ally")) && JSONEvaluator.evaluateValue(this, effect.conditions, Object.assign({}, parameters, { actorId: actorId }))) {
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
			crit: this.applyStatDR(this.getStat("crit") / (statCosts.crit[Math.max(this.level, 12)] * 100)),
			haste: 1 + this.applyStatDR(this.getStat("haste") / (statCosts.haste[Math.max(this.level, 12)] * 100)),
			mastery: this.applyStatDR(this.getStat("mastery") / (statCosts.mastery[Math.max(this.level, 12)] * 100)),
			versatility: 1 + this.applyStatDR(this.getStat("versatility") / (statCosts.versatility[Math.max(this.level, 12)] * 100)),
			leech: this.applyStatDR(this.getStat("leech") / (statCosts.leech[Math.max(this.level, 12)] * 100)),
			parry: this.applyStatDR(this.getStat("parry") / (statCosts.parry[Math.max(this.level, 12)] * 100)),
			block: this.applyStatDR(this.getStat("block") / (statCosts.block[Math.max(this.level, 12)] * 100)),
			dodge: this.applyStatDR(this.getStat("dodge") / (statCosts.dodge[Math.max(this.level, 12)] * 100))
		}[stat];
	}

	getStat(stat) {
		if (stat === "mainWeaponSpeed") {
			return this.stats.mainWeaponSpeed / this.getStatEffect("haste");
		}
		if (this.statMultipliers[stat] === undefined) {
			this.statMultipliers[stat] = 1;
		}
		if (this.statAdditions[stat] === undefined) {
			this.statAdditions[stat] = 0;
		}
		let postMultiplierStat = this.stats[stat] * this.statMultipliers[stat] * this.getStatSpecialMultiplier(stat, this.stats[stat]);
		return postMultiplierStat + this.statAdditions[stat] + this.getStatSpecialAddition(stat, this.stats[stat]);
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
			damage *= this.getDamageTakenModifier(types) * this.getDamageTakenSpecialModifier(damage, types);
			damage += this.getDamageTakenAddition(types) + this.getDamageTakenSpecialAddition(damage, types);
			sourceActor.heal(damage * sourceActor.getStatEffect("leech"), types, sourceActor);
			const preAbsorbDamage = damage;
			let auraId = 0; //Absorbs
			while (auraId < this.absorbs.length && damage > 0) {
				//Needs to be redone to match new absorb format
				if (this.absorbs[auraId].absorbTypes.includes("all") || types.includes("all") || this.absorbs[auraId].absorbTypes.some((type) => types.includes(type))) {
					if (this.absorbs[auraId].value > damage) {
						this.absorbs[auraId].value -= damage;
						damage = 0;
					} else {
						damage -= this.absorbs[auraId].value;
						this.absorbs[auraId].duration = 0;
					}
				}
				auraId++;
			}

			this.resources.prototypeProtectionhealth -= damage;
			SharedData.eventLoop.triggerListeners("takeDamage", this.id, { damage: preAbsorbDamage, mitigated: rawDamage - damage, absorbed: preAbsorbDamage - damage, newHp: this.resources.prototypeProtectionhealth, sourceActor, types, target: this, name: name });
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
		let healing = amount * this.getHealingTakenModifier(types) * this.getHealingTakenSpecialModifier(amount, types);
		healing += amount * this.getHealingTakenAddition(types) + this.getHealingTakenSpecialAddition(healing, types);
		this.resources.prototypeProtectionhealth += amount;
		if (this.resources.prototypeProtectionhealth > this.stats.maxHp) {
			this.resources.prototypeProtectionhealth = this.stats.maxHp;
		}
		SharedData.eventLoop.triggerListeners("heal", this.id, { amount, newHp: this.resources.prototypeProtectionhealth, sourceActor, types, preAbsorbHealing });
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

	getDamageDoneModifier(types) {
		//TODO: implement
		return 1;
	}

	getDamageDoneAddition(types) {
		//TODO: implement
		return 0;
	}

	getDamageDoneSpecialModifier(baseDamage, types){
		//TODO: implement
		return 1;
	}

	getDamageDoneSpecialAddition(baseDamage, types){
		//TODO: implement
		return 0;
	}

	getDamageTakenModifier(types) {
		//TODO: implement
		return 1;
	}

	getDamageTakenAddition(types) {
		//TODO: implement
		return 0;
	}

	getDamageTakenSpecialModifier(baseDamage, types){
		//TODO: implement
		return 1;
	}

	getDamageTakenSpecialAddition(baseDamage, types){
		//TODO: implement
		return 0;
	}

	getHealingTakenAddition(types) {
		//TODO: implement
		return 0;
	}

	getHealingTakenModifier(types) {
		//TODO: implement
		return 1;
	}

	getHealingTakenSpecialModifier(baseHeal, types){
		//TODO: implement
		return 1;
	}

	getHealingTakenSpecialAddition(baseHeal, types){
		//TODO: implement
		return 0;
	}

	getHealingDoneModifier(types){
		//TODO: implement
		return 1;
	}

	getHealingDoneAddition(types){
		//TODO: implement
		return 0;
	}

	getHealingDoneSpecialModifier(baseHeal, types){
		//TODO: implement
		return 1;
	}

	getHealingDoneSpecialAddition(baseHeal, types){
		//TODO: implement
		return 0;
	}
	
	getStatSpecialMultiplier(stat, value) {
		//TODO: implement
		return 1;
	}
	
	getStatSpecialAddition(stat, value) {
		//TODO: implement
		return 0;
	}

	compileEffects(effect, callStack = [], altCall = null, createFunction = true) {
		if (callStack.includes(effect)) {
			if (altCall !== null) {
				Log.warn("Potential infinite recursion found with " + effect);
				return altCall; //Here createFunctios is assumed false as otherwise call stack should be empty
			} else {
				throw new Error("Circular reference in effect compilation without reference to recurse with");
			}
		}
		let effectString = "";
		if (Array.isArray(effect)) {
			effectString = effect.map((effect, index) => this.compileEffects(effect, callStack, altCall !== null ? altCall.slice(0, -2) + "[" + index + "]()" : null, false)).join("");
		} else {
			if (effect.conditions !== undefined && effect.conditions.length > 0) {
				effectString = "if(" + JSONEvaluator.compileValue(effect.conditions, this) + "){";
			}
			const variablePrefix = "_".repeat(callStack.length+1); //For any internal variables to not overwrite
			switch (effect.type) {
				case "damage":
					let targetActor = null;
					if (effect.targetId === undefined) {
						targetActor = "SharedData.actors[" + JSONEvaluator.compileValue(this.defaultEnemyTarget(), this) + "]";
					} else {
						targetActor = "SharedData.actors[" + JSONEvaluator.compileValue(effect.targetId, this) + "]"; //abilityTarget already in scope
					}
					effectString += variablePrefix + "types=[" + effect.types.map((type) => "SharedData.types[" + SharedData.types.indexOf(type) + "]").join(",") + "];actor.dealDamage(" + JSONEvaluator.compileValue(effect.value, this) + ", " + targetActor + ", " + variablePrefix + "types, name, " + (effect.missable === true) + ", " + (effect.dodgeable === true) + ", " + (effect.parryable === true) + ", " + (effect.blockable === true) + ");";
					break;
				case "heal":
					targetActor = null;
					if (effect.targetId === undefined) {
						targetActor = "SharedData.actors[" + JSONEvaluator.compileValue(this.defaultFriendlyTarget(), this) + "]";
					} else {
						targetActor = "SharedData.actors[" + JSONEvaluator.compileValue(effect.targetId, this) + "]";
					}
					effectString += variablePrefix + "types=[" + effect.types.map((type) => "SharedData.types[" + SharedData.types.indexOf(type) + "]").join(",") + "];actor.heal(" + JSONEvaluator.compileValue(effect.value, this) + ", " + variablePrefix + "types, " + targetActor + ", name);";
					break;
				case "applyAura":
					if (!SharedData.strings.includes(effect.id)) {
						SharedData.strings.push(effect.id);
					}
					let targetString = "";
					if (effect.targetId === undefined) {
						targetString = "(abilityTarget || actor)";
					} else {
						targetString = "SharedData.actors[" + JSONEvaluator.compileValue(effect.targetId, this) + "]";
					}
					effectString += "SharedData.auraHandler.applyAura(" + targetString + ", actor, SharedData.strings[" + SharedData.strings.indexOf(effect.id) + "], " + (effect.duration !== undefined?JSONEvaluator.compileValue(effect.duration, this):undefined) + ", "+((effect.stacks !== undefined)?JSONEvaluator.compileValue(effect.stacks, this):1)+");";
					break;
				case "event":
					effectString += "SharedData.eventLoop.registerEvent(" + JSONEvaluator.compileValue(effect.time, this) + ",{source:actor,effects:" + JSON.stringify(effect.effects) + "});"; //Event effects not compiled as it would need to be a function being passed as effects.compiled, which unless I want to store all event effects compiled on the actor (which I might do later) would require creating a new function every time time the event is registered, which would be slower than just interpreting
					break;
				case "checkAPL":
					effectString = "if(uncompiled.security===actor.name){actor.useAbility();}";
					break;
				case "createResource":
					SharedData.strings.push(effect.id);
					effectString = "actor.resources['prototypeProtection'+SharedData.strings[" + SharedData.strings.indexOf(effect.id) + "]] = " + JSONEvaluator.compileValue(effect.value, this) + ";";
					break;
				case "setResource":
					if (!SharedData.strings.includes(effect.id)) {
						Log.error("Unknown reource: " + effect.id);
						return "";
					}
					effectString += "actor.setResource(SharedData.strings[" + SharedData.strings.indexOf(effect.id) + "]," + JSONEvaluator.compileValue(effect.value, this) + ");";
					break;
				case "useAbility":
					if (this.abilities[effect.id] === undefined) {
						Log.error("Unknown ability: " + effect.id);
						return "";
					}
					if (!SharedData.strings.includes(effect.id)) {
						SharedData.strings.push(effect.id);
					}
					effectString += this.compileEffects(this.abilities[effect.id].castEffects, [].concat(callStack, [effect]), "actor.abilities[SharedData.strings[" + SharedData.strings.indexOf(effect.id) + "]].castEffects.compiled(SharedData, actor, parameters, abilityTarget, uncompiled, name)", false);
					break;
				case "removeAura":
					if (!SharedData.strings.includes(effect.id)) {
						SharedData.strings.push(effect.id);
					}
					if (effect.targetId === undefined) {
						targetString = "(abilityTarget || actor)";
					} else {
						targetString = "SharedData.actors[" + JSONEvaluator.compileValue(effect.targetId, this) + "]";
					}
					if (this.knownAuras[effect.id].expirationAbility !== undefined && this.abilities[this.knownAuras[effect.id].expirationAbility] !== undefined) {
						if (this.knownAuras[effect.id].removalAbility !== undefined && this.abilities[this.knownAuras[effect.id].expirationAbility] !== undefined) {
							effectString += "removedAura=" + targetString + ".auras.get(SharedData.strings[" + SharedData.strings.indexOf(effect.id) + "]).shift();if(removedAura.duration===0){" + this.compileEffects({ type: "useAbility", id: this.knownAuras[effect.id].expirationAbility }, [].concat(callStack, [effect]), null, false) + "}else{" + this.compileEffects({ type: "useAbility", id: this.knownAuras[effect.id].removalAbility }, [].concat(callStack, [effect]), null, false) + "};";
						} else {
							effectString += "removedAura=" + targetString + ".auras.get(SharedData.strings[" + SharedData.strings.indexOf(effect.id) + "]).shift();if(removedAura.duration===0){" + this.compileEffects({ type: "useAbility", id: this.knownAuras[effect.id].expirationAbility }, [].concat(callStack, [effect]), null, false) + "};";
						}
					} else {
						if (this.knownAuras[effect.id].removalAbility !== undefined && this.abilities[this.knownAuras[effect.id]].expirationAbility !== undefined) {
							effectString += "removedAura=" + targetString + ".auras.get(SharedData.strings[" + SharedData.strings.indexOf(effect.id) + "]).shift();if(removedAura.duration!==0){" + this.compileEffects({ type: "useAbility", id: this.knownAuras[effect.id].removalAbility }, [].concat(callStack, [effect]), null, false) + "};";
						} else {
							effectString += targetString + ".auras.get(SharedData.strings[" + SharedData.strings.indexOf(effect.id) + "]).shift();";
						}
					}
					break;
				case "shortcut":
					const shortcutId = effect.id;
					if (!SharedData.strings.includes(shortcutId)) {
						SharedData.strings.push(shortcutId);
					}
					const subEffect = this.shortcuts[shortcutId];
					if (subEffect === undefined) {
						Log.error("Unknown effect shortcut: " + shortcutId);
						return "";
					}
					if (effect.parameters !== undefined) {
						Object.keys(effect.parameters).forEach((parameter) => {
							effectString += "parameters['" + parameter + "']=" + JSON.stringify(effect.parameters[parameter]) + ";";
						});
					}
					effectString += this.compileEffects(subEffect, [].concat(callStack, [effect]), "actor.shortcuts[SharedData.strings[" + SharedData.strings.indexOf(shortcutId) + "]].compiled(SharedData, actor, parameters, abilityTarget, uncompiled, name)", false);
					break;
				case "registerEventHandler":
					if (!SharedData.strings.includes(effect.id)) {
						if (!SharedData.eventLoop.eventTypes.includes(effect.id)) {
							Log.error("Unknown event type: " + effect.id);
							return "";
						} else {
							SharedData.strings.push(effect.id);
						}
					}
					if (effect.targetId === undefined) {
						effect.targetId = this.id;
					}
					effectString += "SharedData.eventLoop.registerEventHandler(SharedData.strings[" + SharedData.strings.indexOf(effect.id) + "]," + JSONEvaluator.compileValue(effect.targetId, this) + ", actor," + JSONEvaluator.compileValue(effect.eventConditions, this) + "," + JSON.stringify(effect.effects) + ");";
					break;
				case "runOnActors":
					let actorCheck = "";
					if (effect.relation !== undefined) {
						if (effect.relation === "enemy") {
							actorCheck = "actorToRunOn.team !== actor.team";
						} else {
							actorCheck = "actorToRunOn.team === actor.team";
						}
					}
					if (effect.conditions !== undefined && effect.conditions.length > 0) {
						if (actorCheck !== "") {
							actorCheck += "&&";
						}
						actorCheck += JSONEvaluator.compileValue(effect.conditions, this);
					}
					if (actorCheck !== "") {
						actorCheck = "if (" + actorCheck + "){";
					} //Overwrite effectString since conditions server a different purpose
					effectString = `let ${variablePrefix}actorNumber=1;SharedData.actors.forEach((actorToRunOn,actorId)=>{const prevActorId=parameters.actorId;parameters.actorId=actorId;${actorCheck}${variablePrefix}actorNumber++;parameters.actorNumber=${variablePrefix}actorNumber;${this.compileEffects(effect.effects, [].concat(callStack, [effect]), null, false)}parameters.actorId=prevActorId;}${actorCheck !== "" ? "}" : ""});`;
					break;
			}
			if (effect.conditions !== undefined && effect.conditions.length > 0) {
				effectString += "};";
			}
		}
		if (createFunction) {
			const compiledFunction = new Function("SharedData", "actor", "parameters", "abilityTarget", "uncompiled", "name", effectString);
			return compiledFunction;
		}
		return effectString;
	}

	compile() {
		this.abilities._Initialize.compiled = this.compileEffects(this.abilities._Initialize.castEffects, [], "actor.abilities._Initialize.compiled(SharedData, actor, parameters, abilityTarget, uncompiled, name)", true); //Make sure resources are created first
		Object.keys(this.abilities).forEach((ability) => {
			this.abilities[ability].castEffects.compiled = this.compileEffects(this.abilities[ability].castEffects, [], "actor.abilities[" + ability + "].castEffects.compiled(SharedData, actor, parameters, abilityTarget, uncompiled, name)", true);
			if (this.abilities[ability].conditions !== undefined) {
				this.abilities[ability].conditions.compiled = new Function("SharedData", "actor", "parameters", "abilityTarget", "uncompiled", "name", "return(" + JSONEvaluator.compileValue(this.abilities[ability].conditions, this) + ");");
			}
		});
		//Shortcuts processed as they are used by abilities
		//Auras expiration/removal/ticking will be changed to specify an ability to handle effects, so they don't need compilation either
		this.apl.forEach((entry) => {
			if (entry.conditions !== undefined) {
				entry.conditions.compiled = new Function("SharedData", "actor", "parameters", "abilityTarget", "uncompiled", "name", "return(" + JSONEvaluator.compileValue(entry.conditions, this) + ");");
			}
		});
	}

	setResource(resource, value) {
		const oldResourceValue = this.resources["prototypeProtection" + resource];
		this.resources["prototypeProtection" + resource] = value;
		SharedData.eventLoop.triggerListeners("resourceChange", this.id, { resource: resource, oldValue: oldResourceValue, newValue: value, actor: this });
	}

	getResource(resource) {
		return this.resources["prototypeProtection" + resource];
	}

	dealDamage(baseDamage, target, types, name, missable, dodgeable, parryable, blockable) {
		let damage = baseDamage * this.getStatEffect("versatility");
		damage *= this.getDamageDoneModifier(types) * this.getDamageDoneSpecialModifier(baseDamage, target, types);
		damage += this.getDamageDoneAddition(types) + this.getDamageDoneSpecialAddition(damage, target, types);
		target.takeDamage(damage, missable, dodgeable, parryable, blockable, types, this, name);
	}

	doHealing(baseHeal, target, types, name) {
		let healing = baseHeal * this.getStatEffect("versatility");
		healing *= this.getHealingDoneModifier(types) * this.getHealingDoneSpecialModifier(baseHeal, types);
		healing += this.getHealingDoneAddition(types) + this.getHealingDoneSpecialAddition(healing, types);
		target.heal(healing, types, this, name);
	}
}
