const abilityContext = require.context("../../data/abilities", false, /\.json$/);
const buffContext = require.context("../../data/buffs", false, /\.json$/);
const debuffContext = require.context("../../data/debuffs", false, /\.json$/);
const shortcutContext = require.context("../../data/shortcuts", false, /\.json$/);
const aplContext = require.context("../../data/apls", false, /\.json$/);

const abilityRegistry = {};
const buffRegistry = {};
const debuffRegistry = {};
const shortcutRegistry = {};
const aplRegistry = {};

abilityContext.keys().forEach((key) => {
    const spec = key.replace("./", "").replace(".json", "");
	console.log(spec)
    abilityRegistry[spec] = abilityContext(key);
});

buffContext.keys().forEach((key) => {
    const spec = key.replace("./", "").replace(".json", "");
    buffRegistry[spec] = buffContext(key);
});

debuffContext.keys().forEach((key) => {
    const spec = key.replace("./", "").replace(".json", "");
    debuffRegistry[spec] = debuffContext(key);
});

shortcutContext.keys().forEach((key) => {
    const spec = key.replace("./", "").replace(".json", "");
    shortcutRegistry[spec] = shortcutContext(key);
});

aplContext.keys().forEach((key) => {
    const spec = key.replace("./", "").replace(".json", "");
    aplRegistry[spec] = aplContext(key);
});

export class DefaultSpecDataLoader {
    static load(spec) {
		return {
			abilities: abilityRegistry[spec] || {},
			buffs: buffRegistry[spec] || {},
			debuffs: debuffRegistry[spec] || {},
			shortcuts: shortcutRegistry[spec] || {},
			apls: aplRegistry[spec] || {}
		}
    }

    static loadAbilities(spec) {
		return abilityRegistry[spec] || {};
	}

    static loadBuffs(spec){
        return buffRegistry[spec] || {};
    }

    static loadDebuffs(spec){
        return debuffRegistry[spec] || {};
    }

    static loadShortcuts(spec){
        return shortcutRegistry[spec] || {};
    }

    static loadApl(spec){
        return aplRegistry[spec] || {};
    }
}