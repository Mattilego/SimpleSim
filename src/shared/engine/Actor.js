export class Actor {
	constructor (apl, stats, talents, team, abilities, knownBuffs, knownDebuffs, shortcuts){
		this.stats = stats;
		this.talents = talents;
		this.abilities = abilities;
		this.apl = apl;
		this.knownBuffs = knownBuffs;
		this.knownDebuffs = knownDebuffs;
		this.buffs = [];
		this.debuffs = [];
		this.resources = {
			"playerHealth": {
				value: stats.health,
				max: stats.health
			}
		};
		this.cooldowns = {};
		this.team = team;
	}

	useAbility(actors){
		let [ability, aplEntry] = APLReader.parseAPL(this, actors);
		console.log(ability);
		this.triggerCastEffects(ability, actors);

	}
	
	triggerCastEffects(ability, actors) {
		// TODO: Implement cast effect triggering
	}
}