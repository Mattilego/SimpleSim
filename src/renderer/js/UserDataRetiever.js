import { DefaultSpecDataLoader } from "./DefaultSpecDataLoader";

export class UserDataRetiever {
	static nameToId = {
		"Blood Death Knight": "bdk",
		"Frost Death Knight": "fdk",
		"Unholy Death Knight": "udk",
		"Havoc Demon Hunter": "vdh",
		"Vengeance Demon Hunter": "vdh",
		"Devourer Demon Hunter": "ddh",
		"Balance Druid": "bd",
		"Feral Druid": "fd",
		"Restoration Druid": "rd",
		"Guardian Druid": "gd",
		"Devastation Evoker": "de",
		"Augmentation Evoker": "ae",
		"Preservation Evoker": "pe",
		"Arcane Mage": "am",
		"Fire Mage": "fim",
		"Frost Mage": "frm",
		"Brewmaster Monk": "bmm",
		"Mistweaver Monk": "mwm",
		"Windwalker Monk": "wwm",
		"Holy Paladin": "hp",
		"Protection Paladin": "pp",
		"Retribution Paladin": "rp",
		"Discipline Priest": "dp",
		"Holy Priest": "hpr",
		"Shadow Priest": "sp",
		"Elemental Shaman": "els",
		"Enhancement Shaman": "ens",
		"Restoration Shaman": "rs",
		"Affliction Warlock": "al",
		"Demonology Warlock": "dml",
		"Destruction Warlock": "desl",
		"Arms Warrior": "aw",
		"Fury Warrior": "fw",
		"Protection Warrior": "pw"
	}

	static specPrimaryStats = {
		"Blood Death Knight": "strength",
		"Frost Death Knight": "strength",
		"Unholy Death Knight": "strength",
		"Havoc Demon Hunter": "agility",
		"Vengeance Demon Hunter": "agility",
		"Devourer Demon Hunter": "intellect",
		"Balance Druid": "intellect",
		"Feral Druid": "agility",
		"Restoration Druid": "intellect",
		"Guardian Druid": "agility",
		"Devastation Evoker": "intellect",
		"Augmentation Evoker": "intellect",
		"Preservation Evoker": "intellect",
		"Arcane Mage": "intellect",
		"Fire Mage": "intellect",
		"Frost Mage": "intellect",
		"Brewmaster Monk": "agility",
		"Mistweaver Monk": "agility",
		"Windwalker Monk": "intellect",
		"Holy Paladin": "intellect",
		"Protection Paladin": "strength",
		"Retribution Paladin": "strength",
		"Discipline Priest": "intellect",
		"Holy Priest": "intellct",
		"Shadow Priest": "intellect",
		"Elemental Shaman": "intellect",
		"Enhancement Shaman": "agility",
		"Restoration Shaman": "intellect",
		"Affliction Warlock": "intellect",
		"Demonology Warlock": "intellect",
		"Destruction Warlock": "intellect",
		"Arms Warrior": "strength",
		"Fury Warrior": "strength",
		"Protection Warrior": "strength"
	}


	static getSpec() {
		const input = document.querySelector('input[name="spec"]:checked');
		return input.value;
	}

	static getTalents(spec) {
		const talents = {};
		const specTalentDiv = document.getElementById(this.nameToId[spec] + "Talents");
		const classTalentsDiv = specTalentDiv.parentElement.querySelector(".classTalents");
		let heroTalentDivs = specTalentDiv.parentElement.querySelectorAll(".heroTalents");
		heroTalentDivs = Array.from(heroTalentDivs).filter((div) => div.style.display !== "none");//Filter out inactive hero talents
		const classTalentInputs = classTalentsDiv.querySelectorAll("input");
		const heroTalentInputs = heroTalentDivs.map((div) => div.querySelectorAll("input"));
		const specTalentInputs = specTalentDiv.querySelectorAll("input");
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
			dodge: 0
		};
		stats[this.specPrimaryStats[spec]] = document.getElementById("primaryStatInput").value;
		stats.armor = document.getElementById("armorStatInput").value;
		stats.stamina = document.getElementById("staminaStatInput").value;
		stats.crit = document.getElementById("critStatInput").value;
		stats.haste = document.getElementById("hasteStatInput").value;
		stats.mastery = document.getElementById("masteryStatInput").value;
		stats.versatility = document.getElementById("versatilityStatInput").value;
		stats.leech = document.getElementById("leechStatInput").value;
		stats.parry = document.getElementById("parryStatInput").value;
		stats.block = document.getElementById("blockStatInput").value;
		stats.dodge = document.getElementById("dodgeStatInput").value;
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
				buffs: {},
				debuffs: {},
				shortcuts: {},
				abilities: {
					"Auto Attack Main Hand": DefaultSpecDataLoader.loadAbilities("BloodDeathKnight")["Auto Attack Main Hand"],//Stealing this one
					"Tank Buster": {
						castEffects: {

						},
						
					}
				}

			}
			actors.push(actor);
		}
		return actors;
	}

	static getRequestObject() {
		const spec = this.getSpec();
		const stats = this.getStats(spec);
		const talents = this.getTalents(spec);
	}
}