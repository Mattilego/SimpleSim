import { JSONEvaluator } from "./JSONEvaluator.js";
import { Log } from "./Log.js";

export class APLReader {
	static parseAPL(initiator) {
		//Returns the ability definition of the ability and what to target
		const apl = initiator.apl;
		let ability = null;
		let entry = 0;
		while (entry < apl.length && ability == null) {
			if (JSONEvaluator.evaluateValue(initiator, initiator.abilities[apl[entry].ability].conditions) && JSONEvaluator.evaluateValue(initiator, apl[entry].conditions)) {
				ability = initiator.abilities[apl[entry].ability];
				Log.log("APLReader: Chose ability " + apl[entry].ability + " from entry " + entry);
			}
			entry++;
		}
		if (ability == null) {
			return [null, -1];
		}
		return [ability, apl[entry - 1].target];
	}
}
