import { APLReader } from "./APLReader.js";
import { AuraHandler } from "./AuraHandler.js";
import { JSONEvaluator } from "./JSONEvaluator.js";
import { SharedData } from "./SharedData.js";
import { Log } from "./Log.js";
import { ProcHandler } from "./ProcHandler.js";
import statCosts from "../../data/statCosts.json";

export class Actor {
	constructor(name, level, apl, stats = {}, talents, team = 0, abilities = {}, knownAuras = {}, shortcuts = []) {
		this.level = level;
		this.stats = stats;
		this.statPercentageAdditions = {};
		this.talents = talents;
		this.abilities = abilities;
		this.apl = apl;
		this.knownAuras = knownAuras;
		this.auras = [];
		this.shortcuts = shortcuts;
		this.resources = {};
		this.cooldowns = {};
		this.team = team;
		this.stats.maxHp = 8 * this.stats.stamina;
		this.resources.health = this.stats.maxHp;
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
			if (SharedData.compiling){
				effect(SharedData, this, parameters);
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
				case "aura":
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
				case "useAbility":
					try {
						this.triggerEffects(this.abilities[effect.id].castEffects, abilityTarget, parameters, effect.id);
					} catch (error) {
					}
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
					index = target.auras.findIndex((aura) => aura.id === effect.id && aura.source === this)
					if (target.auras[index].expirationTime === SharedData.eventLoop.time){
						this.triggerEffects(this.knownAuras[target.auras[index].id].expirationEffects, targetId, parameters, name);
					} else {
						this.triggerEffects(this.knownAuras[target.auras[index].id].removalEffects, targetId, parameters, name);
					}
					target.auras.splice(index, 1);
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
			let auraId = 0; //Absorbs
			while (auraId < this.absorbs.length && damage > 0) {//Needs to be redone to match new absorb format
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

	compileEffects(effect, callStack=[], altCall=null, createFunction=true){
		if (callStack.includes(effect)){
			if (altCall !== null){
				return altCall;
			} else {
				throw new Error("Circular reference in effect compilation without reference to recurse with");
			}
		}
		let effectString = "";
		if (Array.isArray(effect)){
			effectString = effect.map((effect, index) => this.compileEffects(effect, callStack, (altCall !== null)?altCall.slice(0,-2)+"["+index+"]()":null, false)).join("");
		} else{
			if (effect.conditions !== undefined && effect.conditions.length > 0){
				effectString = "if(!"+JSONEvaluator.compileValue(effect.conditions)+"){return;};";
			}
			switch(effect.type){
				case "damage":
					let baseDamage = ""+JSONEvaluator.compileValue(effect.value, this) + "*actor.getStatEffect('versatility')*actor.getDamageDoneModifier(["+effect.types.map((type) => "SharedData.types["+SharedData.types.indexOf(type)+"]").join(",")+"])+actor.getDamageDoneAdditions(["+effect.types.map((type) => "SharedData.types["+SharedData.types.indexOf(type)+"]").join(",")+"])";
					let targetActor = null;
					if (effect.targetId === undefined){
						targetActor = "SharedData.actors["+JSONEvaluator.compileValue(this.defaultEnemyTarget(), this)+"]";
					} else {
						targetActor = "SharedData.actors["+JSONEvaluator.compileValue(effect.targetId, this)+"]";//abilityTarget already in scope
					}
					effectString += targetActor+".takeDamage("+baseDamage+","+effect.missable===true+","+effect.dodgeable===true+","+effect.parryable===true+","+effect.blockable===true+", ["+effect.types.map((type) => "SharedData.types["+SharedData.types.indexOf(type)+"]").join(",")+"], actor, name);";
					break;
				case "heal":
					let baseHealing = ""+JSONEvaluator.compileValue(effect.value, this) + "*actor.getStatEffect('versatility')*actor.getDamageDoneModifier(["+effect.types.map((type) => "SharedData.types["+SharedData.types.indexOf(type)+"]").join(",")+"])+actor.getDamageDoneAdditions(["+effect.types.map((type) => "SharedData.types["+SharedData.types.indexOf(type)+"]").join(",")+"])";
					targetActor = null;
					if (effect.targetId === undefined){
						targetActor = "SharedData.actors["+JSONEvaluator.compileValue(this.defaultFriendlyTarget(), this)+"]";
					} else {
						targetActor = "SharedData.actors["+JSONEvaluator.compileValue(effect.targetId, this)+"]";//abilityTarget already in scope
					}
					effectString += targetActor+".heal("+baseHealing+", ["+effect.types.map((type) => "SharedData.types["+SharedData.types.indexOf(type)+"]").join(",")+"], actor, name);";
					break;
				case "applyAura":
					break;
				case "event":
					effectString += "SharedData.eventLoop.registerEvent(" + JSONEvaluator.compileValue(effect.time, this) + ",{source:actor,effects:"+JSON.stringify(effect.effects)+"});";//Event effects not compiled as it would need to be a function being passed as effects.compiled, which unless I want to store all event effects compiled on the actor (which I might do later) would require creating a new function every time time the event is registered, which would be slower than just interpreting
					break;
				case "checkAPL":
					effectString = "if(uncompiled.security===actor.name){actor.useAbility();}";
					break;
				case "createResource":
					SharedData.strings.push(effect.id);
					effectString = "actor.resources['prototypeProtection'+SharedData.strings["+SharedData.strings.indexOf(effect.id)+"]] = " + JSONEvaluator.compileValue(effect.value, this) + ";";
					break;
				case "setResource":
					if (!SharedData.strings.includes(effect.id)){
						Log.log("Unknown reource: " + effect.id);
						return "";
					}
					effectString += "actor.resources['prototypeProtection'+SharedData.strings["+SharedData.strings.indexOf(effect.id)+"]] =" + JSONEvaluator.compileValue(effect.value, this) + ";";
					break;
				case "useAbility":
					if (this.abilities[effect.id] === undefined){
						Log.error("Unknown ability: " + effect.id);
						return "";
					}
					if (!SharedData.strings.includes(effect.id)){
						SharedData.strings.push(effect.id);
					}
					effectString += this.compileEffects(this.abilities[effect.id].castEffects, [].concat(callStack, [effect]), "actor.abilities[SharedData.strings["+SharedData.strings.indexOf(effect.id)+"]].castEffects.compiled(SharedData, actor, parameters, abilityTarget, uncompiled, name)", false);
					break;
				case "removeAura":
					break;
				case "shortcut":
					const shortcutId = effect.id;
					if (!SharedData.strings.includes(shortcutId)){
						SharedData.strings.push(shortcutId);
					}
					const subEffect = this.shortcuts[shortcutId];
					if (subEffect === undefined){
						Log.error("Unknown effect shortcut: " + shortcutId);
						return "";
					}
					if (!SharedData.strings.includes(shortcutId))
					effectString += this.compileEffects(subEffect, [].concat(callStack, [effect]), "actor.shortcuts[SharedData.strings[" + SharedData.indexOf(shortcutId) + "]].compiled(SharedData, actor, parameters, abilityTarget, uncompiled, name)", false);
					break;
				case "registerEventHandler":
					if (!SharedData.strings.includes(effect.id)){
						if (!SharedData.eventLoop.eventTypes.includes(effect.id)){
							Log.error("Unknown event type: " + effect.id);
							return "";
						} else {
							SharedData.strings.push(effect.id);
						}
					}
					effectString += "SharedData.eventLoop.registerEventHandler(SharedData.strings["+SharedData.strings.indexOf(effect.id)+"],"+JSONEvaluator.compileValue(effect.targetId, this)+", actor,"+JSONEvaluator.compileValue(effect.eventConditions, this)+","+effect.effects.map((effect, index)=>this.compileEffects(effect, callStack, null, false)).join(",")+");";
					break;
				case "runOnActors":
					const actorCheck = "";
					if (effect.relation !== undefined){
						if (effect.relation === "enemy"){
							actorCheck = "actorToRunOn.team !== actor.team";
						} else {
							actorCheck = "actorToRunOn.team === actor.team";
						}
					}
					if (effect.conditions !== undefined && effect.conditions.length > 0){
						if (actorCheck !== ""){
							actorCheck += "&&";
						}
						actorCheck += JSONEvaluator.compileValue(effect.conditions, this);
					}
					if (actorCheck !== ""){
						actorCheck = "if (!(" + actorCheck + ")){return;};"
					}//Overwrite effectString since conditions server a different purpose
					effectString = `SharedData.actors.forEach((actorToRunOn,actorId)=>{const prevActorId=parameters.actorId;parameters.actorId=actorId;${actorCheck}${this.compileEffects(effect.effect, [].concat(callStack, [effect]), null, false)}parameters.actorId=prevActorId;);`;
					break;
			}
		}
		const compiledFunction = new Function("SharedData", "actor", "parameters", "abilityTarget", "uncompiled", "name", effectString);
		effect.compiled = compiledFunction;
		if (createFunction) {
			return compiledFunction;
		}
		return effectString;
	}

	compile(){
		this.abilities._Initialize.compiled = this.compileEffects(this.abilities._Initialize.castEffects, [], "actor.abilities._Initialize.compiled(SharedData, actor, parameters, abilityTarget, uncompiled, name)", true);//Make sure resources are created first
		this.abilities.forEach((ability, index) => {
			ability.castEffects.compiled = this.compileEffects(ability.castEffects, [], "actor.abilities["+index+"].castEffects.compiled(SharedData, actor, parameters, abilityTarget, uncompiled, name)", true);
		});
		//Shortcuts processed as they are used by abilities
		//Auras expiration/removal/ticking will be changed to 
	}
}
