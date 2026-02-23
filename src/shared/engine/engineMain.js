import { Log } from "./Log.js"
import { Actor } from "./Actor.js"
import { JSONEvaluator } from "./JSONEvaluator.js"
import { APLReader } from "./APLReader.js"

//Intended to be run as a web worker
addEventListener("message", async (event) => {
	try {
		postMessage(await processRequest(event.data));
	} catch (e) {
		Log.error(e);
		postMessage({ error: e.message });
	} finally {
		postMessage({});
	}
});

async function processRequest(request) {
	const player = new Actor(request.player);
	const enemies = request.enemies;
	const duration = request.duration;
	const abilities = request.abilities;
	const buffs = request.buffs;
	const debuffs = request.debuffs;
	const shortcuts = request.shortcuts;






	return;
}