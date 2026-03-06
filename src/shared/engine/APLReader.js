import { JSONEvaluator } from "./JSONEvaluator.js";
import { Log } from "./Log.js";

export class APLReader {
	static parseAPL(initiator) {
		//Returns the ability definition of the ability and what to target
		const apl = initiator.apl;
		let ability = null;
		let entry = 0;
		while (entry < apl.length && ability == null) {
			if ((initiator.cooldowns[apl[entry].ability] === undefined || initiator.cooldowns[apl[entry].ability].stacks > 0) && JSONEvaluator.evaluateValue(initiator, initiator.abilities[apl[entry].ability].conditions) && JSONEvaluator.evaluateValue(initiator, apl[entry].conditions)) {
				ability = initiator.abilities[apl[entry].ability];
			}
			entry++;
		}
		if (ability == null) {
			return [null, -1];
		}
		return [ability, apl[entry-1].ability, apl[entry - 1].target];
	}
}
