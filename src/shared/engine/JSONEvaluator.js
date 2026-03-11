import { SharedData } from "./SharedData.js";
import { Log } from "./Log.js";

export class JSONEvaluator {
	static evaluateValue(actor, value, parameters = {}) {
		if (value !== undefined && SharedData.compiling && typeof(value.compiled)==="function"){
			return value.compiled(SharedData, actor, parameters, null, value, null);
		}
		if (typeof value == "number" || typeof value == "string" || typeof value == "boolean") {
			return value;
		}
		if (value == undefined || Array.isArray(value)) {
			if (value == undefined || value.length == 0) {
				//Default true if no condition
				return true;
			} else {
				console.log("Uncompiled value: ", value);
				return value.every((c) => JSONEvaluator.evaluateValue(actor, c, parameters)); //Array is by default an and
			}
		} else {
			console.log("Uncompiled value: ", value);
			switch (value.type) {
				case "or":
					return value.conditions.some((c) => JSONEvaluator.evaluateValue(actor, c, parameters));
				case "and":
					return value.conditions.every((c) => JSONEvaluator.evaluateValue(actor, c, parameters));
				case "not":
					return !JSONEvaluator.evaluateValue(actor, value.conditions[0], parameters);
				case "+":
					if (JSONEvaluator.evaluateValue(actor, value.conditions, parameters)) {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters) + JSONEvaluator.evaluateValue(actor, value.value2, parameters);
					} else {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters);
					}
				case "-":
					if (JSONEvaluator.evaluateValue(actor, value.conditions, parameters)) {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters) - JSONEvaluator.evaluateValue(actor, value.value2, parameters);
					} else {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters);
					}
				case ">": //I can't think of an intuitive way for a comparison to be disabled that would be more useful than adding another logic operator
					return JSONEvaluator.evaluateValue(actor, value.value1, parameters) > JSONEvaluator.evaluateValue(actor, value.value2, parameters);
				case ">=":
					return JSONEvaluator.evaluateValue(actor, value.value1, parameters) >= JSONEvaluator.evaluateValue(actor, value.value2, parameters);
				case "<":
					return JSONEvaluator.evaluateValue(actor, value.value1, parameters) < JSONEvaluator.evaluateValue(actor, value.value2, parameters);
				case "<=":
					return JSONEvaluator.evaluateValue(actor, value.value1, parameters) <= JSONEvaluator.evaluateValue(actor, value.value2, parameters);
				case "=":
					return JSONEvaluator.evaluateValue(actor, value.value1, parameters) == JSONEvaluator.evaluateValue(actor, value.value2, parameters);
				case "!=":
					return JSONEvaluator.evaluateValue(actor, value.value1, parameters) != JSONEvaluator.evaluateValue(actor, value.value2, parameters);
				case "^":
					if (JSONEvaluator.evaluateValue(actor, value.conditions, parameters)) {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters) ** JSONEvaluator.evaluateValue(actor, value.value2, parameters);
					} else {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters);
					}
				case "*":
					if (JSONEvaluator.evaluateValue(actor, value.conditions, parameters)) {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters) * JSONEvaluator.evaluateValue(actor, value.value2, parameters);
					} else {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters);
					}
				case "/":
					if (JSONEvaluator.evaluateValue(actor, value.conditions, parameters)) {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters) / JSONEvaluator.evaluateValue(actor, value.value2, parameters);
					} else {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters);
					}
				case "max":
					if (JSONEvaluator.evaluateValue(actor, value.conditions, parameters)) {
						return Math.max(JSONEvaluator.evaluateValue(actor, value.value1, parameters), JSONEvaluator.evaluateValue(actor, value.value2, parameters));
					} else {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters);
					}
				case "min":
					if (JSONEvaluator.evaluateValue(actor, value.conditions, parameters)) {
						return Math.min(JSONEvaluator.evaluateValue(actor, value.value1, parameters), JSONEvaluator.evaluateValue(actor, value.value2, parameters));
					} else {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters);
					}
				case "%": //Modulo not intuitive, this is division by 100
					if (JSONEvaluator.evaluateValue(actor, value.conditions, parameters)) {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters) / 100;
					} else {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters);
					}
				case "mod":
					if (JSONEvaluator.evaluateValue(actor, value.conditions, parameters)) {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters) % JSONEvaluator.evaluateValue(actor, value.value2, parameters);
					} else {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters);
					}
				case "sqrt":
					if (JSONEvaluator.evaluateValue(actor, value.conditions, parameters)) {
						return Math.sqrt(JSONEvaluator.evaluateValue(actor, value.value1, parameters));
					} else {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters);
					}
				case "log":
					if (JSONEvaluator.evaluateValue(actor, value.conditions, parameters)) {
						return Math.log(JSONEvaluator.evaluateValue(actor, value.value1, parameters));
					} else {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters);
					}
				case "exp":
					if (JSONEvaluator.evaluateValue(actor, value.conditions, parameters)) {
						return Math.exp(JSONEvaluator.evaluateValue(actor, value.value1, parameters));
					} else {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters);
					}
				case "abs":
					if (JSONEvaluator.evaluateValue(actor, value.conditions, parameters)) {
						return Math.abs(JSONEvaluator.evaluateValue(actor, value.value1, parameters));
					} else {
						return JSONEvaluator.evaluateValue(actor, value.value1, parameters);
					}
				case "resource":
					let target = actor;
					if (value.targetId !== undefined && value.targetId !== null) {
						target = SharedData.actors[JSONEvaluator.evaluateValue(actor, value.targetId, parameters)];
					}
					if (value.comparison) {
						return JSONEvaluator.evaluateValue(
							actor,
							{
								type: value.comparison,
								value1: target.resources[value.id],
								value2: value.value,
								conditions: []
							},
							parameters
						);
					} else {
						return target.resources[value.id];
					}
				case "aura":
					switch (value.check) {
						case "exists":
							if (value.targetId) {
								const targetId = JSONEvaluator.evaluateValue(actor, value.targetId, parameters);
								if (!SharedData.actors[targetId]) {
									return false;
								}
								return SharedData.actors[targetId].auras.some((b) => b.id == value.id && b.source == actor);
							}
							return actor.auras.some((b) => b.id == value.id && b.source == actor);
						case "duration":
							let targetActor = actor;
							if (value.targetId) {
								const targetId = JSONEvaluator.evaluateValue(actor, value.targetId, parameters);
								if (!SharedData.actors[targetId]) {
									return 0;
								}
								targetActor = SharedData.actors[targetId];
							}
							let matchingAuras = targetActor.auras.filter((b) => b.id == value.id && b.source == actor);
							if (value.comparison) {
								let multiplier = 1;
								if (value.scale == "GCD") {
									multiplier = actor.gcd;
								}
								return matchingAuras.some((b) =>
									JSONEvaluator.evaluateValue(
										actor,
										{
											type: value.comparison,
											value1: b.duration,
											value2: value.value * multiplier,
											conditions: []
										},
										parameters
									)
								);
							} else {
								return matchingAuras.map((b) => b.duration).reduce((a, b) => Math.max(a, b), 0);
							}
						case "stacks":
							targetActor = actor;
							if (value.targetId) {
								const targetId = JSONEvaluator.evaluateValue(actor, value.targetId, parameters);
								if (!SharedData.actors[targetId]) {
									return 0;
								}
								targetActor = SharedData.actors[targetId];
							}
							matchingAuras = targetActor.auras.filter((b) => b.id == value.id && b.source == actor);
							if (value.comparison) {
								return JSONEvaluator.evaluateValue(
									actor,
									{
										type: value.comparison,
										value1: matchingAuras.map((b) => b.stacks).reduce((a, b) => a + b, 0),
										value2: value.value,
										conditions: []
									},
									parameters
								);
							} else {
								return matchingAuras.map((b) => b.stacks).reduce((a, b) => a + b, 0);
							}

						case "value":
							targetActor = actor;
							if (value.targetId) {
								const targetId = JSONEvaluator.evaluateValue(actor, value.targetId, parameters);
								if (!SharedData.actors[targetId]) {
									return 0;
								}
								targetActor = SharedData.actors[targetId];
							}
							matchingAuras = targetActor.auras.filter((b) => b.id == value.id && b.source == actor);
							if (value.comparison) {
								return matchingAuras.some((b) =>
									JSONEvaluator.evaluateValue(
										actor,
										{
											type: value.comparison,
											value1: b.value,
											value2: value.value,
											conditions: []
										},
										parameters
									)
								);
							} else {
								return matchingAuras.map((b) => b.value).reduce((a, b) => a + b, 0);
							}
						default:
							Log.warn("Invalid aura check type: " + value.check + " in " + JSON.stringify(value));
							return 0;
					}
				case "aura":
					switch (value.check) {
						case "exists":
							if (value.targetId) {
								const targetId = JSONEvaluator.evaluateValue(actor, value.targetId, parameters);
								if (!SharedData.actors[targetId]) {
									return false;
								}
								return SharedData.actors[targetId].Auras.some((b) => b.id == value.id && b.source == actor);
							}
							return SharedData.actors.filter((a) => a.team != actor.team).some((a) => a.Auras.some((b) => b.id == value.id && b.source == actor));
						case "duration":
							let multiplier = 1;
							if (value.scale == "GCD") {
								multiplier = actor.gcd;
							}
							if (value.comparison) {
								if (value.targetId) {
									const targetId = JSONEvaluator.evaluateValue(actor, value.targetId, parameters);
									if (!SharedData.actors[targetId]) {
										return JSONEvaluator.evaluateValue(
											actor,
											{
												type: value.comparison,
												value1: 0,
												value2: value.value * multiplier,
												conditions: []
											},
											parameters
										);
									}
									return JSONEvaluator.evaluateValue(
										actor,
										{
											type: value.comparison,
											value1: SharedData.actors[targetId].Auras
												.filter((b) => b.id == value.id && b.source == actor)
												.map((b) => b.duration)
												.reduce((a, b) => Math.max(a, b), 0),
											value2: value.value * multiplier,
											conditions: []
										},
										parameters
									);
								}
								return JSONEvaluator.evaluateValue(
									actor,
									{
										type: value.comparison,
										value1: SharedData.actors
											.filter((a) => a.team != actor.team)
											.map((a) =>
												a.Auras
													.filter((b) => b.id == value.id && b.source == actor)
													.map((b) => b.duration)
													.reduce((a, b) => Math.max(a, b), 0)
											)
											.reduce((a, b) => Math.max(a, b), 0),
										value2: value.value * multiplier,
										conditions: []
									},
									parameters
								);
							} else {
								if (value.targetId) {
									const targetId = JSONEvaluator.evaluateValue(actor, value.targetId, parameters);
									if (!SharedData.actors[targetId]) {
										return 0;
									}
									return SharedData.actors[JSONEvaluator.evaluateValue(actor, value.targetId, parameters)].Auras
										.filter((b) => b.id == value.id && b.source == actor)
										.map((b) => b.duration)
										.reduce((a, b) => Math.max(a, b), 0);
								}
								return SharedData.actors
									.filter((a) => a.team != actor.team)
									.map((a) =>
										a.Auras
											.filter((b) => b.id == value.id && b.source == actor)
											.map((b) => b.duration)
											.reduce((a, b) => Math.max(a, b), 0)
									)
									.reduce((a, b) => Math.max(a, b), 0);
							}
						case "stacks":
							if (value.comparison) {
								if (value.targetId) {
									const targetId = JSONEvaluator.evaluateValue(actor, value.targetId, parameters);
									if (!SharedData.actors[targetId]) {
										return JSONEvaluator.evaluateValue(
											actor,
											{
												type: value.comparison,
												value1: 0,
												value2: value.value,
												conditions: []
											},
											parameters
										);
									}
									return JSONEvaluator.evaluateValue(
										actor,
										{
											type: value.comparison,
											value1: SharedData.actors[JSONEvaluator.evaluateValue(actor, value.targetId, parameters)].Auras
												.filter((b) => b.id == value.id && b.source == actor)
												.map((b) => b.stacks)
												.reduce((a, b) => a + b, 0),
											value2: value.value,
											conditions: []
										},
										parameters
									);
								}
								return JSONEvaluator.evaluateValue(
									actor,
									{
										type: value.comparison,
										value1: SharedData.actors
											.filter((a) => a.team != actor.team)
											.map((a) =>
												a.Auras
													.filter((b) => b.id == value.id && b.source == actor)
													.map((b) => b.stacks)
													.reduce((a, b) => a + b, 0)
											)
											.reduce((a, b) => a + b, 0),
										value2: value.value,
										conditions: []
									},
									parameters
								);
							} else {
								if (value.targetId) {
									const targetId = JSONEvaluator.evaluateValue(actor, value.targetId, parameters);
									if (!SharedData.actors[targetId]) {
										return 0;
									}
									return SharedData.actors[targetId].Auras
										.filter((b) => b.id == value.id && b.source == actor)
										.map((b) => b.stacks)
										.reduce((a, b) => a + b, 0);
								}
								return SharedData.actors
									.filter((a) => a.team != actor.team)
									.map((a) =>
										a.Auras
											.filter((b) => b.id == value.id && b.source == actor)
											.map((b) => b.stacks)
											.reduce((a, b) => a + b, 0)
									)
									.reduce((a, b) => a + b, 0);
							}
						case "value":
							if (value.comparison) {
								if (value.targetId) {
									const targetId = JSONEvaluator.evaluateValue(actor, value.targetId, parameters);
									if (!SharedData.actors[targetId]) {
										return JSONEvaluator.evaluateValue(
											actor,
											{
												type: value.comparison,
												value1: 0,
												value2: value.value,
												conditions: []
											},
											parameters
										);
									}
									return JSONEvaluator.evaluateValue(
										actor,
										{
											type: value.comparison,
											value1: SharedData.actors[JSONEvaluator.evaluateValue(actor, value.targetId, parameters)].Auras
												.filter((b) => b.id == value.id && b.source == actor)
												.map((b) => b.value)
												.reduce((a, b) => Math.max(a, b), 0),
											value2: value.value,
											conditions: []
										},
										parameters
									);
								}
								return JSONEvaluator.evaluateValue(
									actor,
									{
										type: value.comparison,
										value1: SharedData.actors
											.filter((a) => a.team != actor.team)
											.map((a) =>
												a.Auras
													.filter((b) => b.id == value.id && b.source == actor)
													.map((b) => b.value)
													.reduce((a, b) => Math.max(a, b), 0)
											)
											.reduce((a, b) => Math.max(a, b), 0),
										value2: value.value,
										conditions: []
									},
									parameters
								);
							} else {
								if (value.targetId) {
									const targetId = JSONEvaluator.evaluateValue(actor, value.targetId, parameters);
									if (!SharedData.actors[targetId]) {
										return 0;
									}
									return SharedData.actors[JSONEvaluator.evaluateValue(actor, value.targetId, parameters)].Auras
										.filter((b) => b.id == value.id && b.source == actor)
										.map((b) => b.value)
										.reduce((a, b) => Math.max(a, b), 0);
								}
								return SharedData.actors
									.filter((a) => a.team != actor.team)
									.map((a) =>
										a.Auras
											.filter((b) => b.id == value.id && b.source == actor)
											.map((b) => b.value)
											.reduce((a, b) => Math.max(a, b), 0)
									)
									.reduce((a, b) => Math.max(a, b), 0);
							}
						default:
							Log.warn("Invalid check type for aura: " + value.check + " in " + JSON.stringify(value));
							return 0;
					}
				case "parameter":
					if (value.comparison) {
						return JSONEvaluator.evaluateValue(
							actor,
							{
								type: value.comparison,
								value1: parameters[value.id],
								value2: value.value,
								conditions: []
							},
							parameters
						);
					}
					return parameters[value.id];
				case "shortcut":
					if (value.parameters) {
						return JSONEvaluator.evaluateValue(actor, actor.shortcuts[value.id], Object.assign({}, parameters, value.parameters));
					} else {
						return JSONEvaluator.evaluateValue(actor, actor.shortcuts[value.id], parameters);
					}
				case "ability":
					switch (value.check) {
						case "cooldown":
							if (value.comparison) {
								let multiplier = 1;
								if (value.scale == "GCD") {
									multiplier = actor.gcd;
								}
								return JSONEvaluator.evaluateValue(
									actor,
									{
										type: value.comparison,
										value1: actor.cooldowns[value.id].cooldown,
										value2: value.value * multiplier,
										conditions: []
									},
									parameters
								);
							} else {
								return actor.cooldowns[value.id].cooldown;
							}
						case "charges":
							if (value.comparison) {
								return JSONEvaluator.evaluateValue(
									actor,
									{
										type: value.comparison,
										value1: actor.cooldowns[value.id].charges,
										value2: value.value,
										conditions: []
									},
									parameters
								);
							} else {
								return actor.cooldowns[value.id].charges;
							}
						case "usable":
							return JSONEvaluator.evaluateValue(actor, actor.abilities[value.id].conditions, parameters) && actor.cooldowns[value.id].charges >= 1;
					}
				case "findActor":
					return SharedData.actors.findIndex((a, i) => !((actor.team === a.team && value.relation === "enemy") || (actor.team !== a.team && value.relation === "ally")) && JSONEvaluator.evaluateValue(actor, value.conditions, Object.assign({}, parameters, { actorId: i })));
				case "findBestActor":
					let _best = -Infinity;
					let bestIndex = -1;
					for (let i = 0; i < SharedData.actors.length; i++) {
						const a = SharedData.actors[i];
						if ((a.team === actor.team && value.relation === "enemy") || (a.team !== actor.team && value.relation === "ally")) {
							continue;
						}
						if (!JSONEvaluator.evaluateValue(actor, value.conditions, Object.assign({}, parameters, { actorId: i }))) {
							continue;
						}
						const score = JSONEvaluator.evaluateValue(actor, value.expression, Object.assign({}, parameters, { actorId: i }));
						if (score > _best) {
							_best = score;
							bestIndex = i;
						}
					}
					return bestIndex;
				case "copyParameter":
					if (JSONEvaluator.evaluateValue(actor, value.conditions, parameters)) {
						let newParameter = {};
						newParameter[value.to] = parameters[value.from];
						return JSONEvaluator.evaluateValue(actor, value.value, Object.assign({}, parameters, newParameter));
					}
					return JSONEvaluator.evaluateValue(actor, value.value, parameters);
				case "stat":
					switch (value.check) {
						case "effect":
							return actor.getStatEffect(value.id);
						case "rating":
							return actor.getStat(value.id);
						default:
							Log.error("No check type specified in stat expression: " + JSON.stringify(value));
							return 0;
					}
				case "talent":
					switch (value.check) {
						case "known":
						case "exists":
							return actor.talents[value.id] || actor.talents[value.id + "2"];
						case "points":
							return actor.talents[value.id] + actor.talents[value.id + "2"];
					}
				case "matchingActors":
					let matchingActors = 0;
					for (let i = 0; i < SharedData.actors.length; i++) {
						const a = SharedData.actors[i];
						if (!((a.team === actor.team && value.relation === "enemy") || (a.team !== actor.team && value.relation === "ally")) && JSONEvaluator.evaluateValue(actor, value.conditions, Object.assign({}, parameters, { actorId: i }))) {
							matchingActors++;
						}
					}
					return matchingActors;
				case "level":
					if (value.comparison) {
						return JSONEvaluator.evaluateValue(
							actor,
							{
								type: value.comparison,
								value1: actor.level,
								value2: value.value,
								conditions: []
							},
							parameters
						);
					}
					return actor.level;
				case "fightData":
					switch (value.id) {
						case "time":
							if (value.comparison) {
								return JSONEvaluator.evaluateValue(
									actor,
									{
										type: value.comparison,
										value1: EventLoop.time,
										value2: value.value,
										conditions: []
									},
									parameters
								);
							}
							return SharedData.eventLoop.time;
					}
				case "proc":
					if (JSONEvaluator.evaluateValue(actor, value.conditions, parameters)) {
						return actor.procHandler.checkProc(value.id, value.chance || value.ppm || value.rppm, value.type);
					}
					return false;
			}
		}
	}

	static compileValue(value, actor, callStack = [], altCall = null){
		if (callStack.includes(value)) {
			if (altCall !== null){
				Log.warn("Potential infinite recursion with "+value);
			} else {
				Log.error("Recursion without reference with "+value);
			}
		}
		if (Array.isArray(value)){
			if (value.length > 0){
				return "("+value.map(v => this.compileValue(v, actor, [].concat(callStack, [value]))).join(")&&(")+")";
			} else {
				return "true";
			}
		} else {
			if (typeof(value) === "number" || typeof(value) === "boolean"){
				return ""+value;
			} else {
				const variablePrefix = "_".repeat(callStack.length);//For any internal variables to not overwrite
				switch (value.type){
					case "or":
					case "||":
						return "("+value.conditions.map(c => this.compileValue(c, actor, [].concat(callStack, [value]))).join("||")+")";
					case "and":
					case "&&":
						return "("+value.conditions.map(c => this.compileValue(c, actor, [].concat(callStack, [value]))).join("&&")+")";
					case "not":
					case "!":
						if (Array.isArray(value.conditions) && value.conditions.length > 1){//Disabling a not doubles as an xor
							return "("+this.compileValue(value.conditions[0], actor, [].concat(callStack, [value]))+"!=="+this.compileValue(value.conditions.slice(1), actor, [].concat(callStack, [value]))+")";
						}else{
							return "(!"+this.compileValue(value.conditions[0])+")";
						}
					case "+":
						if (Array.isArray(value.conditions) && value.conditions.length > 0){
							return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"+("+this.compileValue(value.conditions, actor, [].concat(callStack, [value]))+"?"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+":0))";
						} else {
							return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"+"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
						}
					case "-":
						if (Array.isArray(value.conditions) && value.conditions.length > 0){
							return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"-("+this.compileValue(value.conditions, actor, [].concat(callStack, [value]))+"?"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+":0))";
						} else {
							return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"-"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
						}
					case "*":
						if (Array.isArray(value.conditions) && value.conditions.length > 0){
							return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"*("+this.compileValue(value.conditions, actor, [].concat(callStack, [value]))+"?1:"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+"))";
						} else {
							return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"*"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
						}
					case "/":
						if (Array.isArray(value.conditions) && value.conditions.length > 0){
							return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"/("+this.compileValue(value.conditions, actor, [].concat(callStack, [value]))+"?1:"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+"))";
						} else {
							return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"/"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
						}
					case "**":
					case "^":
						if (Array.isArray(value.conditions) && value.conditions.length > 0){
							return "("+this.compileValue(value.conditions, actor, [].concat(callStack, [value]))+"?"+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"**"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+":"+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+")";
						} else {
							return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"**"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
						}
					case "max":
						if (Array.isArray(value.conditions) && value.conditions.length > 0){
							return "(("+this.compileValue(value.conditions, actor, [].concat(callStack, [value]))+")?Math.max("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+","+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+"):"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
						} else {
							return "Math.max("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+","+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
						}
					case "min":
						if (Array.isArray(value.conditions) && value.conditions.length > 0){
							return "(("+this.compileValue(value.conditions, actor, [].concat(callStack, [value]))+")?Math.min("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+","+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+"):"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
						} else {
							return "Math.min("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+","+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
						}
					case "%":
						if (Array.isArray(value.conditions) && value.conditions.length > 0){
							return "(("+this.compileValue(value.conditions, actor, [].concat(callStack, [value]))+")?("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"/100):"+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+")";
						} else {
							return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"/100)";
						}
					case "mod":
						if (Array.isArray(value.conditions) && value.conditions.length > 0){
							return "(("+this.compileValue(value.conditions, actor, [].concat(callStack, [value]))+")?("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"%"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+"):"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
						} else {
							return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"%"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
						}
					case "sqrt":
						if (Array.isArray(value.conditions) && value.conditions.length > 0){
							return "(("+this.compileValue(value.conditions, actor, [].concat(callStack, [value]))+")?Math.sqrt("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"):"+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+")";
						} else {
							return "Math.sqrt("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+")";
						}
					case "log":
						if (Array.isArray(value.conditions) && value.conditions.length > 0){
							return "(("+this.compileValue(value.conditions, actor, [].concat(callStack, [value]))+")?Math.log("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"):"+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+")";
						} else {
							return "Math.log("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+")";
						}
					case "exp":
						if (Array.isArray(value.conditions) && value.conditions.length > 0){
							return "(("+this.compileValue(value.conditions, actor, [].concat(callStack, [value]))+")?Math.exp("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"):"+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+")";
						} else {
							return "Math.exp("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+")";
						}
					case "abs":
						if (Array.isArray(value.conditions) && value.conditions.length > 0){
							return "(("+this.compileValue(value.conditions, actor, [].concat(callStack, [value]))+")?Math.abs("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"):"+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+")";
						} else {
							return "Math.abs("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+")";
						}
					case ">":
						return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+">"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
					case "<":
						return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"<"+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
					case ">=":
						return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+">="+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
					case "<=":
						return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"<="+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
					case "=":
					case "==":
						return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"=="+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
					case "!=":
						return "("+this.compileValue(value.value1, actor, [].concat(callStack, [value]))+"!="+this.compileValue(value.value2, actor, [].concat(callStack, [value]))+")";
					case "resource":
						if (value.comparison === undefined){
							if (!SharedData.strings.includes(value.id)){
								SharedData.strings.push(value.id);
							}
							return "actor.resources['prototypeProtection'+SharedData.strings["+SharedData.strings.indexOf(value.id)+"]]";
						}//Intentional fallthrough towards the shared comparison handling
					case "parameter":
						if (value.comparison === undefined && value.type==="parameter"){
							if (!SharedData.strings.includes(value.id)){
								SharedData.strings.push(value.id);
							}
							return "parameters[SharedData.strings["+SharedData.strings.indexOf(value.id)+"]]";
						}
					case "stat":
						if (value.comparison === undefined && value.type==="stat"){
							if (!SharedData.strings.includes(value.id)){
								SharedData.strings.push(value.id);
							}
							return "actor.stats[SharedData.strings["+SharedData.strings.indexOf(value.id)+"]]";
						}
					case "talent":
						if ((value.comparison === undefined || value.check === "known") && value.type==="talent"){
							if (!SharedData.strings.includes(value.id)){
								SharedData.strings.push(value.id);
							}
							if (value.check == "known"){
								return "actor.talents[SharedData.strings["+SharedData.strings.indexOf(value.id)+"]]";
							} else if (value.check == "points"){
								let talentString = "(+actor.talents[SharedData.strings["+SharedData.strings.indexOf(value.id)+"]]";
								if (actor.talents[value.id+"2"]){
									talentString += "+actor.talents[SharedData.strings["+SharedData.strings.indexOf(value.id)+"]+'2']";
								}
								if (actor.talents[value.id+"3"]){
									talentString += "+actor.talents[SharedData.strings["+SharedData.strings.indexOf(value.id)+"]+'3']";
								}
								if (actor.talents[value.id+"4"]){
									talentString += "+actor.talents[SharedData.strings["+SharedData.strings.indexOf(value.id)+"]+'4']";
								}
								return talentString+")";
							}
						}
					case "level":
						if (value.comparison === undefined && value.type==="level"){
							return "actor.level";
						}
					case "ability":
						if (value.comparison === undefined && value.type==="ability"){
							if (actor.ablities[value.id] === undefined){
								Log.error("Unknown ability: " + value.id);
								return "0";
							}
							if (!SharedData.strings.includes(value.id)){
								SharedData.strings.push(value.id);
							}
							if (value.check === "cooldown"){
								return "(actor.abilities[SharedData.strings["+SharedData.strings.indexOf(value.id)+"]].refreshTime-SharedData.eventLoop.time)";
							} else if (value.check === "charges"){
								return "actor.abilities[SharedData.strings["+SharedData.strings.indexOf(value.id)+"]].charges";
							} else if (value.check === "usable") {
								return "("+this.compileValue({
									type: "ability",
									check: "charges",
									id: value.id,
									check: ">=",
									value: 1
								}, actor, [].concat(callStack, [value]))+"&&"+this.compileValue(actor.abilities[value.id].conditions)+")";
							}
						}
					case "aura":
						if (value.comparison === undefined && value.type==="aura"){
							if (!SharedData.strings.includes(value.id)){
								SharedData.strings.push(value.id);
							}
							let targetActor = "actor";
							if (value.targetId){
								targetActor = "SharedData.actors["+this.compileValue(value.targetId, actor, [].concat(callStack, [value]))+"]";
							}
							switch (value.check){
								case "exists":
									return targetActor+".auras.has(SharedData.strings["+SharedData.strings.indexOf(value.id)+"])";
								case "duration":
									return targetActor+".auras.has(SharedData.strings["+SharedData.strings.indexOf(value.id)+"])?("+variablePrefix+"maxDuration = 0, "+targetActor+".auras.get(SharedData.strings["+SharedData.strings.indexOf(value.id)+"]).forEach(aura => {if(aura.duration>"+variablePrefix+"maxDuration){"+variablePrefix+"maxDuration = aura.duration}}), "+variablePrefix+"maxDuration):0";
								case "stacks":
									return targetActor+".auras.has(SharedData.strings["+SharedData.strings.indexOf(value.id)+"])?"+targetActor+".auras.get(SharedData.strings["+SharedData.strings.indexOf(value.id)+"]).reduce((acc, aura)=>acc+aura.stacks, 0):0";
								case "value":
									return targetActor+".auras.has(SharedData.strings["+SharedData.strings.indexOf(value.id)+"])?"+targetActor+".auras.get(SharedData.strings["+SharedData.strings.indexOf(value.id)+"]).reduce((acc, aura)=>acc+aura.value, 0):0";
								default:
									Log.error("Invalid check type for aura lookup: " + value.check);
									return "0";
							}
						}
					case "matchingActors":
						if (value.comparison === undefined && value.type==="matchingActors"){
							let actorChecks = ""
							if (value.relation === "enemy"){
								actorChecks += "testActor.team !== actor.team&&";
							} else if (value.relation === "ally"){
								actorChecks += "testActor.team === actor.team&&";
							}
							actorChecks += this.compileValue(value.conditions, actor, [].concat(callStack, [value]));
							return "SharedData.actors.filter((testActor, actorId)=>"+actorChecks+").length";
							
						}
					case "fightData":
						if (value.comparison === undefined && value.type==="fightData"){
							switch (value.id){
								case "time":
									return "SharedData.eventLoop.time";
							}
						}
					
					
						return this.compileValue({
							type: value.comparison,
							value1: {
								type: value.type,
								id: value.id,
								targetId: value.targetId
							},
							value2: value.value
						}, actor, [].concat(callStack, [value]));
					case "copyParameter":
						if (!SharedData.strings.includes(value.from)){
							SharedData.strings.push(value.from);
						}
						if (!SharedData.strings.includes(value.to)){
							SharedData.strings.push(value.to);
						}
						return "(parameters[SharedData.strings["+SharedData.strings.indexOf(value.to)+"]]=parameters[SharedData.strings["+SharedData.strings.indexOf(value.from)+"]],"+this.compileValue(value.value, actor, [].concat(callStack, [value]))+")";
					case "findActor":
						let actorChecks = ""
						if (value.relation === "enemy"){
							actorChecks += "testActor.team !== actor.team&&";
						} else if (value.relation === "ally"){
							actorChecks += "testActor.team === actor.team&&";
						}
						actorChecks += this.compileValue(value.conditions, actor, [].concat(callStack, [value]));
						return "SharedData.actors.findIndex((testActor, actorId)=>"+actorChecks+")";
					case "findBestActor":
						actorChecks = ""
						if (value.relation === "enemy"){
							actorChecks += "testActor.team !== actor.team&&";
						} else if (value.relation === "ally"){
							actorChecks += "testActor.team === actor.team&&";
						}
						const specifiedConditions = this.compileValue(value.conditions, actor, [].concat(callStack, [value]));
						if (specifiedConditions !== ""){
							actorChecks += specifiedConditions;
						} else {
							actorChecks = actorChecks.slice(0,-2);
						}
						if (actorChecks !== ""){
							return "("+variablePrefix+"best=-1,"+variablePrefix+"bestScore=-Infinity,SharedData.actors.forEach((testActor, actorId)=>{if("+actorChecks+"){const "+variablePrefix+"score="+this.compileValue(value.expression, actor, [].concat(callStack, [value]))+";if("+variablePrefix+"score>"+variablePrefix+"bestScore){"+variablePrefix+"bestScore="+variablePrefix+"score;"+variablePrefix+"best=actorId}}}),"+variablePrefix+"best)";
						} else {
							return "("+variablePrefix+"best=-1,"+variablePrefix+"bestScore=-Infinity,SharedData.actors.forEach((testActor, actorId)=>{const "+variablePrefix+"score="+this.compileValue(value.expression, actor, [].concat(callStack, [value]))+";if("+variablePrefix+"score>"+variablePrefix+"bestScore){"+variablePrefix+"bestScore="+variablePrefix+"score;"+variablePrefix+"best=actorId}}}),"+variablePrefix+"best)";
						}
					case "shortcut":
						if (!SharedData.strings.includes(value.id)){
							SharedData.strings.push(value.id);
						}
						let parameterAssignments = "";
						for (let key in value.parameters) {
							if (!SharedData.strings.includes(key)){
								SharedData.strings.push(key);
							}
							parameterAssignments += "parameters[SharedData.strings["+SharedData.strings.indexOf(key)+"]]=" + this.compileValue(value.parameters[key], actor, [].concat(callStack, [value])) + ",";
						}

						return "(" + parameterAssignments + this.compileValue(actor.shortcuts[value.id], actor, [].concat(callStack, [value]), "actor.shortcuts[SharedData.strings["+SharedData.strings.indexOf(value.id)+"]].compiled(SharedData, actor, parameters, abilityTarget, uncompiled, name)") + ")";
				}
			}
		}
	}
}
