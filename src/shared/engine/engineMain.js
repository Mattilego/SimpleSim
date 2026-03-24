import { Actor } from "./Actor.js";
import { EventLoop } from "../engine/EventLoop.js";
import { SharedData } from "./SharedData.js";
import { Log } from "./Log.js";

export async function processRequest(request) {
	console.log(request);
	SharedData.actors = request.setup.actors.map((a) => new Actor(a.name, a.level, a.apl, a.stats, a.talents, a.team, a.abilities, a.auras, a.shortcuts));
	const maxFightLength = request.config.maxFightLength;
	SharedData.eventLoop = new EventLoop(maxFightLength);
	await Log.initializeListeners(request.config.loggingDetail, request.config.logToFile,request.config.fileName);
	if (!(request.config.compile === false)) {
		SharedData.compiling = true;
		SharedData.strings = [];
		SharedData.actors.forEach((actor) => {
			actor.compile();
		});
	}
	SharedData.actors.forEach((actor) => {
		actor.processStats();
	});
	for (let iteration = 0; iteration < (request.config.iterations ?? 1); iteration++) {
		Log.newIteration(iteration);
		SharedData.actors.forEach((actor, index) => {
			actor.reset(request.setup.actors[index].stats);
			actor.processStats();
			SharedData.eventLoop.maxTime = SharedData.eventLoop.time + maxFightLength;
			SharedData.eventLoop.registerEvent(SharedData.eventLoop.time, {
				effects: [{ type: "checkAPL", security: actor.name }],
				source: actor
			});
		});
		while (SharedData.eventLoop.futureEvents.length > 0) {
			SharedData.eventLoop.processEvent();
		}
	}
	console.log("Simulation Done")
	return Log.getString();
}
