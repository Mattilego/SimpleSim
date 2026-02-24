import { Actor } from "./Actor.js"
import { EventLoop } from "../engine/EventLoop.js"

export async function processRequest(request) {
	const actors = request.setup.actors.map((a) => new Actor(a.apl, a.stats, a.talents, a.team, a.abilities, a.buffs, a.debuffs, a.shortcuts));
	const maxFightLength = request.config.maxFightLength;
	const eventLoop = new EventLoop(maxFightLength);
	actors.forEach((actor) => {
		actor.processStats();
	})
	actors.forEach((actor) => {
		eventLoop.registerEvent(0, {
			type: "checkAPL",
			source: actor
		})
	});

	return;
}