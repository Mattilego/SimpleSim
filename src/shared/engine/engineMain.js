import { Actor } from "./Actor.js"
import { EventLoop } from "../engine/EventLoop.js"
import { SharedData } from "./SharedData.js";

export async function processRequest(request) {
	SharedData.actors = request.setup.actors.map((a) => new Actor(a.apl, a.stats, a.talents, a.team, a.abilities, a.buffs, a.debuffs, a.shortcuts));
	const maxFightLength = request.config.maxFightLength;
	SharedData.eventLoop = new EventLoop(maxFightLength);
	SharedData.actors.forEach((actor) => {
		actor.processStats();
	})
	SharedData.actors.forEach((actor) => {
		SharedData.eventLoop.registerEvent(0, {
			type: "checkAPL",
			source: actor
		})
	});

	return;
}