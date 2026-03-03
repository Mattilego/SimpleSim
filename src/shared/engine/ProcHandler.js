import { Log } from "./Log.js";
import { SharedData } from "./SharedData.js";

export class ProcHandler {
	constructor() {
		this.RPPMHistory = {};
	}

	checkProc(id, frequence, system, actor) {
		switch (system) {
			case "flat":
				return Math.random() < frequence / 100;
			case "ppm":
				const mainSpeed = actor.getStat("mainWeaponSpeed");
				const offSpeed = actor.getStat("offWeaponSpeed");
				let swingsPerMin = 60 / mainSpeed;
				if (offSpeed > 0) {
					swingsPerMin = (swingsPerMin + offSpeed) / 2; //Would ideally know which weapon the proc is based on, assume average, most effects can trigger for both anyways which evens out
				}
				return Math.random() < frequence / swingsPerMin;
			case "rppm":
				const rppm = frequence;
				const now = SharedData.eventLoop.time;
				const history = this.RPPMHistory[id] || {
					lastAttemptTime: now,
					accumulatedBlp: 0
				};
				this.RPPMHistory[id] = history;

				const MAX_INTERVAL = 10;
				const interval = Math.min(now - history.lastAttemptTime, MAX_INTERVAL);
				history.accumulatedBlp += interval;

				const baseChance = (rppm * interval) / 60;

				const multiplier = Math.max(1, 1 + (history.accumulatedBlp / (60 / rppm) - 1.5) * 3);

				const chance = multiplier * baseChance;

				history.lastAttemptTime = now;
				if (Math.random() < chance) {
					history.accumulatedBlp = 0; // reset on success
					return true;
				}
				return false;
			default:
				Log.warn("Invalid proc type: " + system + " for proc id: " + id);
		}
	}
}
