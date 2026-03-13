import { DefaultSpecDataLoader } from "./DefaultSpecDataLoader";

export class UserDataRetriever {
	static nameToId = {
		"BloodDeathKnight": "bdk",
		"FrostDeathKnight": "fdk",
		"UnholyDeathKnight": "udk",
		"HavocDemonHunter": "vdh",
		"VengeanceDemonHunter": "vdh",
		"DevourerDemonHunter": "ddh",
		"BalanceDruid": "bd",
		"FeralDruid": "fd",
		"RestorationDruid": "rd",
		"GuardianDruid": "gd",
		"DevastationEvoker": "de",
		"AugmentationEvoker": "ae",
		"PreservationEvoker": "pe",
		"ArcaneMage": "am",
		"FireMage": "fim",
		"FrostMage": "frm",
		"BrewmasterMonk": "bmm",
		"MistweaverMonk": "mwm",
		"WindwalkerMonk": "wwm",
		"HolyPaladin": "hp",
		"ProtectionPaladin": "pp",
		"RetributionPaladin": "rp",
		"DisciplinePriest": "dp",
		"HolyPriest": "hpr",
		"ShadowPriest": "sp",
		"ElementalShaman": "els",
		"EnhancementShaman": "ens",
		"RestorationShaman": "rs",
		"AfflictionWarlock": "al",
		"DemonologyWarlock": "dml",
		"DestructionWarlock": "desl",
		"ArmsWarrior": "aw",
		"FuryWarrior": "fw",
		"ProtectionWarrior": "pw"
	}

	static specPrimaryStats = {
		"BloodDeathKnight": "strength",
		"FrostDeathKnight": "strength",
		"UnholyDeathKnight": "strength",
		"HavocDemonHunter": "agility",
		"VengeanceDemonHunter": "agility",
		"DevourerDemonHunter": "intellect",
		"BalanceDruid": "intellect",
		"FeralDruid": "agility",
		"RestorationDruid": "intellect",
		"GuardianDruid": "agility",
		"DevastationEvoker": "intellect",
		"AugmentationEvoker": "intellect",
		"PreservationEvoker": "intellect",
		"ArcaneMage": "intellect",
		"FireMage": "intellect",
		"FrostMage": "intellect",
		"BrewmasterMonk": "agility",
		"MistweaverMonk": "agility",
		"WindwalkerMonk": "intellect",
		"HolyPaladin": "intellect",
		"ProtectionPaladin": "strength",
		"RetributionPaladin": "strength",
		"DisciplinePriest": "intellect",
		"HolyPriest": "intellct",
		"ShadowPriest": "intellect",
		"ElementalShaman": "intellect",
		"EnhancementShaman": "agility",
		"RestorationShaman": "intellect",
		"AfflictionWarlock": "intellect",
		"DemonologyWarlock": "intellect",
		"DestructionWarlock": "intellect",
		"ArmsWarrior": "strength",
		"FuryWarrior": "strength",
		"ProtectionWarrior": "strength"
	}


	static getSpec() {
		const spec = document.querySelector('input[name="spec"]:checked').value;
		return spec[0].toUpperCase()+spec.slice(1);
	}

	static getTalents(spec) {
		const talents = {};
		const specTalentDiv = document.getElementById(this.nameToId[spec] + "Talents");
		const classTalentsDiv = specTalentDiv.parentElement.querySelector(".classTalents");
		let heroTalentDivs = specTalentDiv.parentElement.querySelectorAll(".heroTalents");
		heroTalentDivs = Array.from(heroTalentDivs).filter((div) => div.style.display !== "none");//Filter out inactive hero talents
		const classTalentInputs = Array.from(classTalentsDiv.querySelectorAll("input"));
		const heroTalentInputs = heroTalentDivs.map((div) => Array.from(div.querySelectorAll("input")));
		const specTalentInputs = Array.from(specTalentDiv.querySelectorAll("input"));
		const nonHeroTalentInputs = classTalentInputs.concat(specTalentInputs);
		nonHeroTalentInputs.forEach((input) => {
			const talentObject = {};
			talentObject[input.id.replace("talent", "")] = input.checked;
			Object.assign(talents, talentObject);
		});
		heroTalentInputs.forEach((inputs, heroTalentIndex) => {
			inputs.forEach((input) => {
				const talentObject = {};
				talentObject[input.id.replace("talent", "")] = input.checked && heroTalentDivs[heroTalentIndex].querySelector("input").checked;
				Object.assign(talents, talentObject);
			});
		});
		return talents;
	}

	static getStats(spec) {
		const stats = {
			strength: 0,
			agility: 0,
			intellect: 0,
			armor: 0,
			stamina: 0,
			crit: 0,
			haste: 0,
			mastery: 0,
			versatility: 0,
			leech: 0,
			parry: 0,
			block: 0,
			dodge: 0,
			mainWeaponDamage: 216,
			mainWeaponSpeed: 3.6
		};
		stats[this.specPrimaryStats[spec]] = parseFloat(document.getElementById("primaryStatInput").value);
		stats.armor = parseFloat(document.getElementById("armorStatInput").value);
		stats.stamina = parseFloat(document.getElementById("staminaStatInput").value);
		stats.crit = parseFloat(document.getElementById("critStatInput").value);
		stats.haste = parseFloat(document.getElementById("hasteStatInput").value);
		stats.mastery = parseFloat(document.getElementById("masteryStatInput").value);
		stats.versatility = parseFloat(document.getElementById("versatilityStatInput").value);
		stats.leech = parseFloat(document.getElementById("leechStatInput").value);
		stats.parry = parseFloat(document.getElementById("parryStatInput").value);
		stats.block = parseFloat(document.getElementById("blockStatInput").value);
		stats.dodge = parseFloat(document.getElementById("dodgeStatInput").value);
		return stats;
	}

	static getEnemySettings() {
		const enemySettings = {};
		enemySettings.count = document.getElementById("enemyCountInput").value;
		enemySettings.health = document.getElementById("enemyHealthInput").value;
		enemySettings.dps = document.getElementById("enemyDamageInput").value;
		enemySettings.attackSpeed = document.getElementById("enemyAttackSpeedInput").value;
		enemySettings.linearHealthDecrease = document.getElementById("steadyEnemyHealthInput").value;
		return enemySettings;
	}

	static generateEnemyActors() {
		const settings = this.getEnemySettings();
		const actors = [];
		for (let i = 0; i < settings.count; i++) {
			const actor = {
				stats: {
					stamina: settings.health/8,
					armor: 0,
					mainWeaponDamage: settings.dps/settings.attackSpeed,
					mainWeaponSpeed: 1/settings.attackSpeed,
					crit: 0,
					haste: 0,
					mastery: 0,
					versatility: 0,
					leech: 0,
					parry: 0,
					block: 0,
					dodge: 0
				},
				talents: {},
				auras: {},
				shortcuts: {},
				abilities: {
					"_Initialize": {castEffects: []},
					"Auto Attack Main Hand": DefaultSpecDataLoader.loadAbilities("BloodDeathKnight")["Auto Attack Main Hand"]//Stealing this one
				},
				apl: [],
				name: "enemy_"+i,
				team: 1,
				level: parseInt(document.getElementById("levelInput").value)
			}
			actors.push(actor);
		}
		return actors;
	}

	static getRequestObject() {
		const spec = this.getSpec();
		console.log(spec);
		const stats = this.getStats(spec);
		const talents = this.getTalents(spec);
		const enemies = this.generateEnemyActors();
		const actors = [{
			stats: stats,
			talents: talents,
			auras: DefaultSpecDataLoader.loadAuras(spec),
			shortcuts: DefaultSpecDataLoader.loadShortcuts(spec),
			abilities: DefaultSpecDataLoader.loadAbilities(spec),
			apl: DefaultSpecDataLoader.loadApl(spec),
			name: "player",
			team: 0,
			level: parseInt(document.getElementById("levelInput").value)
		}].concat(enemies);
		return {
			setup: {
				actors: actors,
			},
			config: {
				maxFightLength: parseFloat(document.getElementById("fightDurationInput").value*60),
				compile: true
			}
		};
	}
}