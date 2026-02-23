export class APLReader {
	static parseAPL(initiator, actors) {//Returns the ability definition of the ability to use and the apl entry that triggered it
		const apl = initiator.apl;
		let ability = null;
		let entry = 0;
		while (entry < apl.length && ability == null) {
			if (JSONEvaluator.evaluateValue(initiator, actors, initiator.abilities[apl[entry].ability].conditions) && JSONEvaluator.evaluateValue(initiator, actors, apl[entry].conditions)) {
				ability = initiator.abilities[apl[entry].ability];
			}
			entry++;
		}
		return [ability, apl[entry - 1]];
	}
}