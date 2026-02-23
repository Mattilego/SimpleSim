class JSONEvaluator {
	static evaluateValue(actor, actors, value, shortcuts = [], parameters = []) {
		try {
			if (typeof value == "number" || typeof value == "string" || typeof value == "boolean") {
				return value;
			}
			if (value == undefined || Array.isArray(value)) {
				if (value == undefined || value.length == 0) {//Default true if no condition
					return true;
				} else {
					return value.every((c) => JSONEvaluator.evaluateValue(actor, actors, c, shortcuts, parameters));//Array is by default an and
				}
			} else {
				switch (value.type){
					case "or":
						return value.conditions.some((c) => JSONEvaluator.evaluateValue(actor, actors, c, shortcuts, parameters));
					case "and":
						return value.conditions.every((c) => JSONEvaluator.evaluateValue(actor, actors, c, shortcuts, parameters));
					case "not":
						return !JSONEvaluator.evaluateValue(actor, actors, value.conditions[0], shortcuts, parameters);
					case "+":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, shortcuts, parameters)){
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters) + JSONEvaluator.evaluateValue(actor, actors, value.value2, shortcuts, parameters);
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters);
						}
					case "-":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, shortcuts, parameters)){
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters) - JSONEvaluator.evaluateValue(actor, actors, value.value2, shortcuts, parameters);
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters);
						}
					case ">"://I can't think of an intuitive way for a comparison to be disabled that would be more useful than adding another logic operator
						return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters) > JSONEvaluator.evaluateValue(actor, actors, value.value2, shortcuts, parameters);
					case ">=":
						return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters) >= JSONEvaluator.evaluateValue(actor, actors, value.value2, shortcuts, parameters);
					case "<":
						return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters) < JSONEvaluator.evaluateValue(actor, actors, value.value2, shortcuts, parameters);
					case "<=":
						return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters) <= JSONEvaluator.evaluateValue(actor, actors, value.value2, shortcuts, parameters);
					case "=":
						return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters) == JSONEvaluator.evaluateValue(actor, actors, value.value2, shortcuts, parameters);
					case "!=":
						return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters) != JSONEvaluator.evaluateValue(actor, actors, value.value2, shortcuts, parameters);
					case "^":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, shortcuts, parameters)){
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters) ** JSONEvaluator.evaluateValue(actor, actors, value.value2, shortcuts, parameters);
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters);
						}
					case "*":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, shortcuts, parameters)){
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters) * JSONEvaluator.evaluateValue(actor, actors, value.value2, shortcuts, parameters);
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters);
						}
					case "/":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, shortcuts, parameters)){
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters) / JSONEvaluator.evaluateValue(actor, actors, value.value2, shortcuts, parameters);
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters);
						}
					case "max":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, shortcuts, parameters)){
							return Math.max(JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters), JSONEvaluator.evaluateValue(actor, actors, value.value2, shortcuts, parameters));
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters);
						}
					case "min":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, shortcuts, parameters)){
							return Math.min(JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters), JSONEvaluator.evaluateValue(actor, actors, value.value2, shortcuts, parameters));
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters);
						}
					case "%"://Modulo not intuitive, this is division by 100
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, shortcuts, parameters)){
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters) / 100;
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters);
						}
					case "mod":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, shortcuts, parameters)){
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters) % JSONEvaluator.evaluateValue(actor, actors, value.value2, shortcuts, parameters);
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters);
						}
					case "sqrt":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, shortcuts, parameters)){
							return Math.sqrt(JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters));
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters);
						}
					case "log":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, shortcuts, parameters)){
							return Math.log(JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters));
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters);
						}
					case "exp":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, shortcuts, parameters)){
							return Math.exp(JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters));
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters);
						}
					case "abs":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, shortcuts, parameters)){
							return Math.abs(JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters));
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, shortcuts, parameters);
						}
					case "resource":
						switch (value.check){
							case "value":
								if (value.comparison) {
									return JSONEvaluator.evaluateValue(actor, actors, {
										type: value.comparison,
										value1: actor.resources[value.id].value,
										value2: value.value,
										conditions: []
									}, shortcuts, parameters);
								} else{
									return actor.resources[value.id].value;
								}
							case "percentage":
								if (value.comparison){
									return JSONEvaluator.evaluateValue(actor, actors, {
										type: value.comparison,
										value1: actor.resources[value.id].value,
										value2: value.value / actor.resources[value.id].max*100,
										conditions: []
									}, shortcuts, parameters);
								} else{
									return actor.resources[value.id].value / actor.resources[value.id].max*100;
								}
							default:
								Log.warn("Invalid resource check type: " + value.check + " in " + JSON.stringify(value));
								return 0;
						}
					case "buff":
						switch (value.check) {
							case "exists":
								return actor.buffs.some((b) => b.id == value.id && b.source == actor);
							case "duration":
								let matchingBuffs = actor.buffs.filter((b) => b.id == value.id && b.source == actor);
								if (value.comparison) {
									let multiplier = 1;
									if (value.scale == "GCD") {
										multiplier = actor.gcd;
									}
									return matchingBuffs.some((b) => JSONEvaluator.evaluateValue(actor, actors, {
										type: value.comparison,
										value1: b.duration,
										value2: value.value * multiplier,
										conditions: []
									}, shortcuts, parameters));
								} else {
									return matchingBuffs.map((b) => b.duration).reduce((a,b) => Math.max(a,b), 0);
								}
							case "stacks":
								matchingBuffs = actor.buffs.filter((b) => b.id == value.id && b.source == actor);
								if (value.comparison) {
									return matchingBuffs.some((b) => JSONEvaluator.evaluateValue(actor, actors, {
										type: value.comparison,
										value1: b.stacks,
										value2: value.value,
										conditions: []
									}, shortcuts, parameters));
								} else{
									return matchingBuffs.map((b) => b.stacks).reduce((a,b) => Math.max(a,b), 0);
								}
							
							case "value":
								matchingBuffs = actor.buffs.filter((b) => b.id == value.id && b.source == actor);
								if (value.comparison){
									return matchingBuffs.some((b) => JSONEvaluator.evaluateValue(actor, actors, {
										type: value.comparison,
										value1: b.value,
										value2: value.value,
										conditions: []
									}, shortcuts, parameters));
								} else{
									return matchingBuffs.map((b) => b.value).reduce((a,b) => Math.max(a,b), 0);
								}
							default:
								Log.warn("Invalid buff check type: " + value.check + " in " + JSON.stringify(value));
								return 0;
						}
					case "debuff":
						switch (value.check){
							case "exists":
								return actors.filter((a) => a.team != actor.team).some((a) => a.debuffs.some((b) => b.id == value.id && b.source == actor));
							case  "duration":
								let multiplier = 1
								if (value.scale == "GCD") {
									multiplier = actor.gcd;
								}
								if (value.comparison) {
									return JSONEvaluator.evaluateValue(actor, actors, {
										type: value.comparison,
										value1: actors.filter((a) => a.team != actor.team).map((a) => a.debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.duration).reduce((a,b) => Math.max(a,b), 0)).reduce((a,b) => Math.max(a,b), 0),
										value2: value.value * multiplier,
										conditions: []
									}, shortcuts, parameters);
								} else {
									return actors.filter((a) => a.team != actor.team).map((a) => a.debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.duration).reduce((a,b) => Math.max(a,b), 0)).reduce((a,b) => Math.max(a,b), 0);
								}
							case "stacks":
								if (value.comparison) {
									return JSONEvaluator.evaluateValue(actor, actors, {
										type: value.comparison,
										value1: actors.filter((a) => a.team != actor.team).map((a) => a.debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.stacks).reduce((a,b) => Math.max(a,b), 0)).reduce((a,b) => Math.max(a,b), 0),
										value2: value.value,
										conditions: []
									}, shortcuts, parameters);
								} else {
									return actors.filter((a) => a.team != actor.team).map((a) => a.debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.stacks).reduce((a,b) => Math.max(a,b), 0)).reduce((a,b) => Math.max(a,b), 0);
								}
							case "value":
								if (value.comparison) {
									return JSONEvaluator.evaluateValue(actor, actors, {
										type: value.comparison,
										value1: actors.filter((a) => a.team != actor.team).map((a) => a.debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.value).reduce((a,b) => Math.max(a,b), 0)).reduce((a,b) => Math.max(a,b), 0),
										value2: value.value,
										conditions: []
									}, shortcuts, parameters);
								} else {
									return actors.filter((a) => a.team != actor.team).map((a) => a.debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.value).reduce((a,b) => Math.max(a,b), 0)).reduce((a,b) => Math.max(a,b), 0);
								}
							default:
								Log.warn("Invalid check type for debuff: " + value.check + " in " + JSON.stringify(value));
								return 0;
						}
					case "parameter":
						return parameters[value.id];
					case "shortcut":
						if (value.parameters) {
							return JSONEvaluator.evaluateValue(actor, actors, shortcuts[value.id], shortcuts, Object.assign({}, parameters, value.parameters));
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, shortcuts[value.id], shortcuts, parameters);
						}
					case "ability":
						switch (value.check) {
							case "cooldown":
								if (value.comparison) {
									let multiplier = 1;
									if (value.scale == "GCD") {
										multiplier = actor.gcd;
									}
									return JSONEvaluator.evaluateValue(actor, actors, {
										type: value.comparison,
										value1: actor.cooldowns[value.id].cooldown,
										value2: value.value * multiplier,
										conditions: []
									}, shortcuts, parameters);
								} else {
									return actor.cooldowns[value.id].cooldown;
								}
							case "charges":
								if (value.comparison) {
									return JSONEvaluator.evaluateValue(actor, actors, {
										type: value.comparison,
										value1: actor.cooldowns[value.id].charges,
										value2: value.value,
										conditions: []
									}, shortcuts, parameters);
								} else {
									return actor.cooldowns[value.id].charges;
								}
							case "usable":
								return JSONEvaluator.evaluateValue(actor, actors, actor.abilities[value.id].conditions, shortcuts, parameters) && actor.cooldowns[value.id].charges >= 1;
						}
				}
			}
		} catch (e) {
			Log.error("Error evaluating value: " + JSON.stringify(value) + " with parameters: " + JSON.stringify(parameters) + " and shortcuts: " + JSON.stringify(shortcuts) + "\n" + e);
			return 0;
		}
	}
}