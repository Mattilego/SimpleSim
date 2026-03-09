const abilityContext = require.context("../../data/abilities", false, /\.json$/);
const auraContext = require.context("../../data/auras", false, /\.json$/);
const shortcutContext = require.context("../../data/shortcuts", false, /\.json$/);
const aplContext = require.context("../../data/apls", false, /\.json$/);

const abilityRegistry = {};
const auraRegistry = {};
const shortcutRegistry = {};
const aplRegistry = {};

abilityContext.keys().forEach((key) => {
    const spec = key.replace("./", "").replace(".json", "");
	console.log(spec)
    abilityRegistry[spec] = abilityContext(key);
});

auraContext.keys().forEach((key) => {
    const spec = key.replace("./", "").replace(".json", "");
    auraRegistry[spec] = auraContext(key);
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
			auras: auraRegistry[spec] || {},
			shortcuts: shortcutRegistry[spec] || {},
			apls: aplRegistry[spec] || {}
		}
    }

    static loadAbilities(spec) {
		return abilityRegistry[spec] || {};
	}

    static loadAuras(spec){
        return auraRegistry[spec] || {};
    }

    static loadShortcuts(spec){
        return shortcutRegistry[spec] || {};
    }

    static loadApl(spec){
        return aplRegistry[spec] || {};
    }
}