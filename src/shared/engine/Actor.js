import { APLReader } from "./APLReader.js";
import { AuraHandler } from "./AuraHandler.js";
import { JSONEvaluator } from "./JSONEvaluator.js";
import { SharedData } from "./SharedData.js";
import { Log } from "./Log.js";
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
			value: this.stats.maxHp
		}
		this.notVerySecureButGoodEnough = new Symbol();
	}

	useAbility(){
		let [ability, targetId] = APLReader.parseAPL(this);
		console.log(ability);
		this.triggerEffects(ability.castEffects, targetId);
		this.cooldowns[ability] = SharedData.eventLoop.time+JSONEvaluator.evaluateValue(this, ability.cooldown, {}) + (ability.castTime?JSONEvaluator.evaluateValue(this, ability.castTime, {})/this.getStatEffect("haste"):0);
		SharedData.eventLoop.registerEvent(SharedData.eventLoop.time+ability.GCD/this.getStatEffect("haste"), {
			type: "checkAPL",
			security: this.notVerySecureButGoodEnough
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
					const currentTarget = SharedData.getActor(targetId);
					let damage = JSONEvaluator.evaluateValue(this, effect.value, { targetId });
	
					// Apply multipliers (Versatility, Sanguine Ground, etc.)
					damage *= this.getStatEffect("versatility");
					damage *= this.getModifier("damageDone", effect.damageTypes);
					damage *= currentTarget.getModifier("damageTaken", effect.damageTypes);
					if (this.getStatEffect("crit") > Math.random() && effect.noCrit !== true){
						damage *= 2;
					}
	
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
						targetId = JSONEvaluator.evaluateValue(this, effect.targetId, { abilityTarget: abilityTarget || this.id });
					} else {
						if (abilityTarget !== undefined && abilityTarget !== null) {
							targetId = abilityTarget;
						} else {
							targetId = this.id;
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
				case "checkAPL"://Shouldn't be called from abilities, only the event sent by the previous ability ue
					if (effect.security === this.notVerySecureButGoodEnough) {
						this.useAbility();
					} else{
						Log.warn("checkAPL effect called somewhere other than it should, check ability and aura definitions");
					}
					break;
				case "setResource":
					this.resources[effect.id] = JSONEvaluator.evaluateValue(this, effect.value, {});
					break;
				case "useAbility":
					try {
						this.triggerEffects(this.abilities[effect.id].effects);
					} catch (error) {
						Log.error(`Infinite recursion with ability ${effect.id}, please check ability definition`);
					}
					break;
				case "removeBuff":
					targetId = -1;
					if (effect.targetId !== undefined && effect.targetId !== null) {
						targetId = JSONEvaluator.evaluateValue(this, effect.targetId, { abilityTarget: abilityTarget || this.id });
					} else {
						if (abilityTarget !== undefined && abilityTarget !== null) {
							targetId = abilityTarget;
						} else {
							targetId = this.id;
						}
					}
					target = SharedData.actors[targetId];
					target.buffs.find(buff => buff.id === effect.id).duration = 0;
					break;
				case "removeDebuff":
					targetId = -1;
					if (effect.targetId !== undefined && effect.targetId !== null) {
						targetId = JSONEvaluator.evaluateValue(this, effect.targetId, { abilityTarget: abilityTarget || this.id });
					} else {
						if (abilityTarget !== undefined && abilityTarget !== null) {
							targetId = abilityTarget;
						} else {
							targetId = this.id;
						}
					}
					target = SharedData.actors[targetId];
					target.debuffs.find(debuff => debuff.id === effect.id).duration = 0;
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
			versatility: 1+this.applyStatDR(this.getStat("versatility")/statCosts.versatility[Math.max(this.level,12)]),
			leech: this.applyStatDR(this.getStat("leech")/statCosts.leech[Math.max(this.level,12)]),
			parry: this.applyStatDR(this.getStat("parry")/statCosts.parry[Math.max(this.level,12)]),
			block: this.applyStatDR(this.getStat("block")/statCosts.block[Math.max(this.level,12)]),
			dodge: this.applyStatDR(this.getStat("dodge")/statCosts.dodge[Math.max(this.level,12)]),
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

	defaultFriendlyTarget(){
		return {//Highest hp enemy as default
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
						id: "targetId"
					},
					id: "hp",
					check: "percentage"
				}
			}
		};
	}

	takeDamage(damage, types, sourceActor){
		damage *= 1-(this.getStatEffect("versatility")-1)/2;
		if (types.includes("physical") || types.includes("all")) {
			if (sourceActor.level < 60) {
				damage *= 1-this.getStat("armor")/(this.getStat("armor")+400+85*sourceActor.level);
			} else if (sourceActor.level < 80) {
				damage *= 1-this.getStat("armor")/(this.getStat("armor")+400+85*sourceActor.level+4.5*(sourceActor.level-59));
			} else if (sourceActor.level < 85) {
				damage *= 1-this.getStat("armor")/(this.getStat("armor")+400+85*sourceActor.level+4.5*(sourceActor.level-59)+20*(sourceActor.level-80));
			} else {
				damage *= 1-this.getStat("armor")/(this.getStat("armor")+400+85*sourceActor.level+4.5*(sourceActor.level-59)+20*(sourceActor.level-80)+22*(sourceActor.level-85));
			}
		}
		damage = this.applyDamageTakenChanges(damage, types, this.resources.health.value);

		let buffId = 0;//Absorbs
		while (buffId < this.buffs.length && damage > 0) {
			if (this.buffs[buffId].absorbTypes.includes("all") || types.includes("all") || this.buffs[buffId].absorbTypes.some(type => types.includes(type))) {
				if (this.buffs[buffId].value > damage) {
					this.buffs[buffId].value -= damage;
					damage = 0;
				} else {
					damage -= this.buffs[buffId].value;
					this.buffs[buffId].duration = 0;//Set duration so that it can remove expiration event
				}
			}
			buffId++;
		}

		this.resources.health.value -= damage;
		SharedData.eventLoop.triggerListeners("takeDamage", this, {damage, newHp: this.resources.health, sourceActor, types});
	}

	applyDamageTakenChanges(damage, types, currentHp){
		for (let i = 0; i < this.buffs.length; i++) {
			if (this.buffs[i].damagetakenChange && (this.buffs[i].types.includes("all") || types.includes("all") || this.buffs[i].types.some(type => types.includes(type)))){
				damage = JSONEvaluator.evaluateValue(this, this.buffs[i].damagetakenChange, {damage, currentHp});
			}
		}
		return damage;
	}

	checkForHit(parryable, dodgeable) {
		if (parryable && this.getStatEffect("parry") > Math.random()) {
			SharedData.eventLoop.triggerListeners("parry", this);
			return false;
		}
		if (dodgeable && this.getStatEffect("dodge") > Math.random()) {
			SharedData.eventLoop.triggerListeners("dodge", this);
			return false;
		}
		return true;
	}

	heal(amount, types, sourceActor){
		this.resources.health.value += amount;
		SharedData.eventLoop.triggerListeners("heal", this, {amount, newHp: this.resources.health, sourceActor, types});
	}

	get id(){
		if (this.actorId){
			return this.actorId;
		} else{
			this.actorId = SharedData.actors.indexOf(this);
			return this.actorId;
		}
	}
}