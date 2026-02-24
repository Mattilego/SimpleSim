export class JSONEvaluator {
	static evaluateValue(actor, actors, value, parameters = []) {
		try {
			if (typeof value == "number" || typeof value == "string" || typeof value == "boolean") {
				return value;
			}
			if (value == undefined || Array.isArray(value)) {
				if (value == undefined || value.length == 0) {//Default true if no condition
					return true;
				} else {
					return value.every((c) => JSONEvaluator.evaluateValue(actor, actors, c, parameters));//Array is by default an and
				}
			} else {
				switch (value.type){
					case "or":
						return value.conditions.some((c) => JSONEvaluator.evaluateValue(actor, actors, c, parameters));
					case "and":
						return value.conditions.every((c) => JSONEvaluator.evaluateValue(actor, actors, c, parameters));
					case "not":
						return !JSONEvaluator.evaluateValue(actor, actors, value.conditions[0], parameters);
					case "+":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, parameters)){
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters) + JSONEvaluator.evaluateValue(actor, actors, value.value2, parameters);
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters);
						}
					case "-":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, parameters)){
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters) - JSONEvaluator.evaluateValue(actor, actors, value.value2, parameters);
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters);
						}
					case ">"://I can't think of an intuitive way for a comparison to be disabled that would be more useful than adding another logic operator
						return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters) > JSONEvaluator.evaluateValue(actor, actors, value.value2, parameters);
					case ">=":
						return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters) >= JSONEvaluator.evaluateValue(actor, actors, value.value2, parameters);
					case "<":
						return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters) < JSONEvaluator.evaluateValue(actor, actors, value.value2, parameters);
					case "<=":
						return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters) <= JSONEvaluator.evaluateValue(actor, actors, value.value2, parameters);
					case "=":
						return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters) == JSONEvaluator.evaluateValue(actor, actors, value.value2, parameters);
					case "!=":
						return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters) != JSONEvaluator.evaluateValue(actor, actors, value.value2, parameters);
					case "^":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, parameters)){
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters) ** JSONEvaluator.evaluateValue(actor, actors, value.value2, parameters);
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters);
						}
					case "*":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, parameters)){
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters) * JSONEvaluator.evaluateValue(actor, actors, value.value2, parameters);
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters);
						}
					case "/":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, parameters)){
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters) / JSONEvaluator.evaluateValue(actor, actors, value.value2, parameters);
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters);
						}
					case "max":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, parameters)){
							return Math.max(JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters), JSONEvaluator.evaluateValue(actor, actors, value.value2, parameters));
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters);
						}
					case "min":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, parameters)){
							return Math.min(JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters), JSONEvaluator.evaluateValue(actor, actors, value.value2, parameters));
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters);
						}
					case "%"://Modulo not intuitive, this is division by 100
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, parameters)){
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters) / 100;
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters);
						}
					case "mod":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, parameters)){
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters) % JSONEvaluator.evaluateValue(actor, actors, value.value2, parameters);
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters);
						}
					case "sqrt":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, parameters)){
							return Math.sqrt(JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters));
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters);
						}
					case "log":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, parameters)){
							return Math.log(JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters));
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters);
						}
					case "exp":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, parameters)){
							return Math.exp(JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters));
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters);
						}
					case "abs":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, parameters)){
							return Math.abs(JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters));
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, value.value1, parameters);
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
									}, parameters);
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
									}, parameters);
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
								if (value.target){
									const targetId = JSONEvaluator.evaluateValue(actor, actors, value.target, parameters);
									if (!actors[targetId]) {
										return false;
									}
									return actors[targetId].buffs.some((b) => b.id == value.id && b.source == actor);
								}
								return actor.buffs.some((b) => b.id == value.id && b.source == actor);
							case "duration":
								let targetActor = actor;
								if (value.target){
									const targetId = JSONEvaluator.evaluateValue(actor, actors, value.target, parameters);
									if (!actors[targetId]) {
										return 0;
									}
									targetActor = actors[targetId];
								}
								let matchingBuffs = targetActor.buffs.filter((b) => b.id == value.id && b.source == actor);
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
									}, parameters));
								} else {
									return matchingBuffs.map((b) => b.duration).reduce((a,b) => Math.max(a,b), 0);
								}
							case "stacks":
								targetActor = actor;
								if (value.target){
									const targetId = JSONEvaluator.evaluateValue(actor, actors, value.target, parameters);
									if (!actors[targetId]) {
										return 0;
									}
									targetActor = actors[targetId];
								}
								matchingBuffs = targetActor.buffs.filter((b) => b.id == value.id && b.source == actor);
								if (value.comparison) {
									return matchingBuffs.some((b) => JSONEvaluator.evaluateValue(actor, actors, {
										type: value.comparison,
										value1: b.stacks,
										value2: value.value,
										conditions: []
									}, parameters));
								} else{
									return matchingBuffs.map((b) => b.stacks).reduce((a,b) => Math.max(a,b), 0);
								}
							
							case "value":
								targetActor = actor;
								if (value.target){
									const targetId = JSONEvaluator.evaluateValue(actor, actors, value.target, parameters);
									if (!actors[targetId]) {
										return 0;
									}
									targetActor = actors[targetId];
								}
								matchingBuffs = targetActor.buffs.filter((b) => b.id == value.id && b.source == actor);
								if (value.comparison){
									return matchingBuffs.some((b) => JSONEvaluator.evaluateValue(actor, actors, {
										type: value.comparison,
										value1: b.value,
										value2: value.value,
										conditions: []
									}, parameters));
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
								if (value.target) {
									const targetId = JSONEvaluator.evaluateValue(actor, actors, value.target, parameters);
									if (!actors[targetId]) {
										return false;
									}
									return actors[targetId].debuffs.some((b) => b.id == value.id && b.source == actor);
								}
								return actors.filter((a) => a.team != actor.team).some((a) => a.debuffs.some((b) => b.id == value.id && b.source == actor));
							case  "duration":
								let multiplier = 1
								if (value.scale == "GCD") {
									multiplier = actor.gcd;
								}
								if (value.comparison) {
									if (value.target){
										const targetId = JSONEvaluator.evaluateValue(actor, actors, value.target, parameters);
										if (!actors[targetId]){
											return JSONEvaluator.evaluateValue(actor, actors, {
												type: value.comparison,
												value1: 0,
												value2: value.value * multiplier,
												conditions: []
											}, parameters);
										}
										return JSONEvaluator.evaluateValue(actor, actors, {
											type: value.comparison,
											value1: actors[targetId].debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.duration).reduce((a,b) => Math.max(a,b), 0),
											value2: value.value * multiplier,
											conditions: []
										}, parameters);
									}
									return JSONEvaluator.evaluateValue(actor, actors, {
										type: value.comparison,
										value1: actors.filter((a) => a.team != actor.team).map((a) => a.debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.duration).reduce((a,b) => Math.max(a,b), 0)).reduce((a,b) => Math.max(a,b), 0),
										value2: value.value * multiplier,
										conditions: []
									}, parameters);
								} else {
									if (value.target){
										const targetId = JSONEvaluator.evaluateValue(actor, actors, value.target, parameters);
										if (!actors[targetId]){
											return 0
										}
										return actors[JSONEvaluator.evaluateValue(actor, actors, value.target, parameters)].debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.duration).reduce((a,b) => Math.max(a,b), 0);
									}
									return actors.filter((a) => a.team != actor.team).map((a) => a.debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.duration).reduce((a,b) => Math.max(a,b), 0)).reduce((a,b) => Math.max(a,b), 0);
								}
							case "stacks":
								if (value.comparison) {
									if (value.target){
										const targetId = JSONEvaluator.evaluateValue(actor, actors, value.target, parameters);
										if (!actors[targetId]){
											return JSONEvaluator.evaluateValue(actor, actors, {
												type: value.comparison,
												value1: 0,
												value2: value.value,
												conditions: []
											}, parameters);
										}
										return JSONEvaluator.evaluateValue(actor, actors, {
											type: value.comparison,
											value1: actors[JSONEvaluator.evaluateValue(actor, actors, value.target, parameters)].debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.stacks).reduce((a,b) => Math.max(a,b), 0),
											value2: value.value,
											conditions: []
										}, parameters);
									}
									return JSONEvaluator.evaluateValue(actor, actors, {
										type: value.comparison,
										value1: actors.filter((a) => a.team != actor.team).map((a) => a.debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.stacks).reduce((a,b) => Math.max(a,b), 0)).reduce((a,b) => Math.max(a,b), 0),
										value2: value.value,
										conditions: []
									}, parameters);
								} else {
									if (value.target){
										const targetId = JSONEvaluator.evaluateValue(actor, actors, value.target, parameters);
										if (!actors[targetId]){
											return 0;
										}
										return actors[targetId].debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.stacks).reduce((a,b) => Math.max(a,b), 0);
									}
									return actors.filter((a) => a.team != actor.team).map((a) => a.debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.stacks).reduce((a,b) => Math.max(a,b), 0)).reduce((a,b) => Math.max(a,b), 0);
								}
							case "value":
								if (value.comparison) {
									if (value.target){
										const targetId = JSONEvaluator.evaluateValue(actor, actors, value.target, parameters);
										if (!actors[targetId]){
											return JSONEvaluator.evaluateValue(actor, actors, {
												type: value.comparison,
												value1: 0,
												value2: value.value,
												conditions: []
											}, parameters);
										}
										return JSONEvaluator.evaluateValue(actor, actors, {
											type: value.comparison,
											value1: actors[JSONEvaluator.evaluateValue(actor, actors, value.target, parameters)].debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.value).reduce((a,b) => Math.max(a,b), 0),
											value2: value.value,
											conditions: []
										}, parameters);
									}
									return JSONEvaluator.evaluateValue(actor, actors, {
										type: value.comparison,
										value1: actors.filter((a) => a.team != actor.team).map((a) => a.debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.value).reduce((a,b) => Math.max(a,b), 0)).reduce((a,b) => Math.max(a,b), 0),
										value2: value.value,
										conditions: []
									}, parameters);
								} else {
									if (value.target){
										const targetId = JSONEvaluator.evaluateValue(actor, actors, value.target, parameters);
										if (!actors[targetId]){
											return 0;
										}
										return actors[JSONEvaluator.evaluateValue(actor, actors, value.target, parameters)].debuffs.filter((b) => b.id == value.id && b.source == actor).map((b) => b.value).reduce((a,b) => Math.max(a,b), 0);
									}
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
							return JSONEvaluator.evaluateValue(actor, actors, actor.shortcuts[value.id], Object.assign({}, parameters, value.parameters));
						} else {
							return JSONEvaluator.evaluateValue(actor, actors, actor.shortcuts[value.id], parameters);
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
									}, parameters);
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
									}, parameters);
								} else {
									return actor.cooldowns[value.id].charges;
								}
							case "usable":
								return JSONEvaluator.evaluateValue(actor, actors, actor.abilities[value.id].conditions, parameters) && actor.cooldowns[value.id].charges >= 1;
						}
					case "findActor":
						return actors.findIndex((a) => (!(actor.team === a.team && value.relation === "enemy" || actor.team !== a.team && value.relation === "ally")) && JSONEvaluator.evaluateValue(actor, actors, value.conditions, Object.assign({}, parameters, { actorId: actors.indexOf(a) })));
					case "findBestActor":
						let best = -Infinity;
						let bestIndex = -1;
						for (let i = 0; i < actors.length; i++) {
							const a = actors[i];
							if (a.team === actor.team && value.relation === "enemy" || a.team !== actor.team && value.relation === "ally") {
								continue;
							}
							if (!JSONEvaluator.evaluateValue(actor, actors, value.conditions, Object.assign({}, parameters, { actorId: i }))) {
								continue;
							}
							const score = JSONEvaluator.evaluateValue(actor, actors, value.expression, Object.assign({}, parameters, { actorId: i }));
							if (score > best) {
								best = score;
								bestIndex = i;
							}
						}
						return bestIndex;
					case "copyParameter":
						if (JSONEvaluator.evaluateValue(actor, actors, value.conditions, parameters)) {
							let newParameter = {}
							newParameter[value.to] = parameters[value.from];
							return JSONEvaluator.evaluateValue(actor, actors, value.value, Object.assign({}, parameters, newParameter))
						}
						return JSONEvaluator.evaluateValue(actor, actors, value.value, parameters)
					case "stat":
						switch (value.check) {
							case "effect":
								return actor.statEffects[value.id];
							case "rating":
								return actor.stats[value.id];
						}
					case "talent":
						switch (value.check) {
							case "known":
							case "exists":
								return actor.talents[value.id].known;
							case "points":
								return actor.talents[value.id].points;
						}
					case "matchingActors":
						let matchingActors = 0;
						for (let i = 0; i < actors.length; i++) {
							const a = actors[i];
							if ((!(a.team === actor.team && value.relation === "enemy" || a.team !== actor.team && value.relation === "ally")) && JSONEvaluator.evaluateValue(actor, actors, value.conditions, Object.assign({}, parameters, { actorId: i }))) {
								matchingActors++;
							}
						}
						return matchingActors;
				}
			}
		} catch (e) {
			Log.error("Error evaluating value: " + JSON.stringify(value) + " with parameters: " + JSON.stringify(parameters) + " and shortcuts: " + JSON.stringify(shortcuts) + "\n" + e);
			return 0;
		}
	}
}