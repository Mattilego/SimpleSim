import { Actor } from "./Actor.js";
import { EventLoop } from "../engine/EventLoop.js";
import { SharedData } from "./SharedData.js";
import { Log } from "./Log.js";

export async function processRequest(request) {
	SharedData.actors = request.setup.actors.map((a) => new Actor(a.name, a.level, a.apl, a.stats, a.talents, a.team, a.abilities, a.buffs, a.debuffs, a.shortcuts));
	const maxFightLength = request.config.maxFightLength;
	SharedData.eventLoop = new EventLoop(maxFightLength);
	Log.initializeListeners();
	SharedData.actors.forEach((actor) => {
		actor.processStats();
	});
	SharedData.actors.forEach((actor) => {
		SharedData.eventLoop.registerEvent(0, {
			effects: [{ type: "checkAPL", security: actor.name }],
			source: actor
		});
	});
	while (SharedData.eventLoop.futureEvents.length > 0) {
		SharedData.eventLoop.processEvent();
	}
	return Log.getString();
}
