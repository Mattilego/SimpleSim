import { APLReader } from "./APLReader.js";
import statCosts from "../../data/statCosts.json";

export class Actor {
	constructor (level, apl, stats = {}, talents, team = 0, abilities = {}, knownBuffs = {}, knownDebuffs = {}, shortcuts = []){
		this.level = level;
		this.stats = stats;
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

	useAbility(actors, eventLoop){
		let [ability, aplEntry] = APLReader.parseAPL(this, actors);
		console.log(ability);
		this.triggerEffects(ability.castEffects, actors, eventLoop);
		eventLoop.registerEvent(eventLoop.time+ability.GCD/this.stats.haste, {
			type: "checkAPL"
		});
	}
	
	triggerEffects(effects, actors, eventLoop) {
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
					// TODO: Implement buff logic
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
				case "useAbility":
					// TODO: Implement ability usage logic
					break;
				case "checkAPL":
					this.useAbility(actors, eventLoop);
					break;
				default:
					console.error(`Unknown effect type: ${effect.type}`);
			}
		})
	}

	processStats(actors, eventLoop) {
		this.triggerEffects(this.abilities.initialize, actors, eventLoop);
	}

	get statEffects() {
		return {
			crit: this.applyStatDR(this.stats.crit/statCosts.crit[Math.max(this.level,12)]),
			haste: this.applyStatDR(this.stats.haste/statCosts.haste[Math.max(this.level,12)]),
			mastery: this.applyStatDR(this.stats.mastery/statCosts.mastery[Math.max(this.level,12)]),
			versatility: this.applyStatDR(this.stats.versatility/statCosts.versatility[Math.max(this.level,12)]),
		}
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

	getModifier(category, type){
		
	}
}