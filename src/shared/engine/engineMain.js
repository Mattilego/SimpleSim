import { Actor } from "./Actor.js"

export async function processRequest(request) {
	const actors = request.setup.actors.map((a) => new Actor(a.apl, a.stats, a.talents, a.team, a.abilities, a.buffs, a.debuffs, a.shortcuts));
	const maxFightLength = request.config.maxFightLength;


	return;
}