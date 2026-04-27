import "../css/style.css";
import "../css/tooltips.css";
import "../css/screenSizeChanges.css";

import "./siteNavigation.js";
import { UserDataRetriever } from "./UserDataRetriever.js";
import { DefaultSpecDataLoader } from "./DefaultSpecDataLoader.js";
import { Generator } from "./Generator.js";
import * as Blockly from "./../../../node_modules/blockly/core";
import * as En from "./../../../node_modules/blockly/msg/en";
Blockly.setLocale(En);
Generator.initializeGenerator();

const blockDefinitions = Blockly.common.createBlockDefinitionsFromJsonArray([
	{
		type: "shortcutsContainer",
		message0: "Shortcuts: %1",
		args0: [
			{
				type: "input_statement",
				name: "shortcuts",
				check: "ShortcutDefinition"
			}
		]
	},
	{
		type: "valueShortcutDefinition",
		message0: "Value shortcut %1: %2",
		args0: [
			{
				type: "field_input",
				text: "Shortcut name",
				spellcheck: false,
				name: "shortcutName"
			},
			{
				type: "input_value",
				name: "shortcutValue",
				check: "Value"
			}
		],
		nextStatement: "ShortcutDefinition",
		previousStatement: "ShortcutDefinition"
	},{
		type: "effectShortcutDefinition",
		message0: "Effect Shortcut %1: %2",
		args0: [
			{
				type: "field_input",
				text: "Shortcut name",
				spellcheck: false,
				name: "shortcutName"
			},{
				type: "input_statement",
				name: "shortcutEffects",
				check: "Effect"
			}
		],
		nextStatement: "ShortcutDefinition",
		previousStatement: "ShortcutDefinition"
	},
	{
		type: "valueBinaryOp",
		message0: "%1 %2",
		args0: [
			{
				type: "input_value",
				name: "value1",
				check: "Value"
			},
			{
				type: "field_dropdown",
				name: "operator",
				options: [
					["+", "+"],
					["-", "-"],
					["*", "*"],
					["/", "/"],
					["^", "^"]
				]
			}
		],
		message1: "%1",
		args1: [
			{
				type: "input_value",
				name: "value2",
				check: "Value"
			}
		],
		inputsInline: true,
		colour: 100,
		output: "Value"
	},
	{
		type: "valueConditionalBinaryOp",
		message0: "%1 %2",
		args0: [
			{
				type: "input_value",
				name: "value1",
				check: "Value"
			},
			{
				type: "field_dropdown",
				name: "operator",
				options: [
					["+", "+"],
					["-", "-"],
					["*", "*"],
					["/", "/"],
					["^", "^"]
				]
			}
		],
		message1: "%1 if %2",
		args1: [
			{
				type: "input_value",
				name: "value2",
				check: "Value"
			},
			{
				type: "input_value",
				name: "condition",
				check: "Value"
			}
		],
		inputsInline: true,
		colour: 100,
		output: "Value"
	},
	{
		type: "valueUnaryOp",
		message0: "%1 %2",
		args0: [
			{
				type: "field_dropdown",
				name: "operator",
				options: [
					["abs", "abs"],
					["sqrt", "sqrt"],
					["sin", "sin"],
					["cos", "cos"],
					["tan", "tan"],
					["asin", "asin"],
					["acos", "acos"],
					["atan", "atan"],
					["ln", "ln"],
					["log", "log"]
				]
			},
			{
				type: "input_value",
				name: "value",
				check: "Value"
			}
		],
		inputsInline: true,
		colour: 100,
		output: "Value"
	},
	{
		type: "valueConditionalUnaryOp",
		message0: "%1 of %2 if %3",
		args0: [
			{
				type: "field_dropdown",
				name: "operator",
				options: [
					["abs", "abs"],
					["sqrt", "sqrt"],
					["sin", "sin"],
					["cos", "cos"],
					["tan", "tan"],
					["asin", "asin"],
					["acos", "acos"],
					["atan", "atan"],
					["ln", "ln"],
					["log", "log"]
				]
			},
			{
				type: "input_value",
				name: "value",
				check: "Value"
			},
			{
				type: "input_value",
				name: "condition",
				check: "Value"
			}
		],
		inputsInline: true,
		colour: 100,
		output: "Value"
	},{
		type: "valueComparison",
		message0: "%1 %2 %3",
		args0: [
			{
				type: "input_value",
				name: "value1",
				check: "Value"
			},{
				type: "field_dropdown",
				name: "comparison",
				options: [
					["=", "="],
					["!=", "!="],
					[">", ">"],
					["<", "<"],
					[">=", ">="],
					["<=", "<="]
				]
			},{
				type: "input_value",
				name: "value2",
				check: "Value"
			}
		],
		inputsInline: true,
		colour: 100,
		output: "Value"
	},{
		type: "valueBinaryLogicOp",
		message0: "%1 %2",
		args0: [
			{
				type: "input_value",
				name: "value1",
				check: "Value"
			},
			{
				type: "field_dropdown",
				name: "operator",
				options: [
					["and", "and"],
					["or", "or"],
					["xor", "xor"],
					["nand", "nand"],
					["nor", "nor"]
				]
			}
		],
		message1: "%1",
		args1: [
			{
				type: "input_value",
				name: "value2",
				check: "Value"
			}
		],
		inputsInline: true,
		colour: 100,
		output: "Value"
	},{
		type: "valueConditionalBinaryLogicOp",
		message0: "%1 %2",
		args0: [
			{
				type: "input_value",
				name: "value1",
				check: "Value"
			},
			{
				type: "field_dropdown",
				name: "operator",
				options: [
					["and", "and"],
					["or", "or"],
					["xor", "xor"],
					["nand", "nand"],
					["nor", "nor"]
				]
			}
		],
		message1: "%1 if %2",
		args1: [
			{
				type: "input_value",
				name: "value2",
				check: "Value"
			},{
				type: "input_value",
				name: "condition",
				check: "Value"
			}
		],
		inputsInline: true,
		colour: 100,
		output: "Value"

	},{
		type: "valueUnaryLogicOp",
		message0: "%1 %2",
		args0: [
			{
				type: "field_dropdown",
				name: "operator",
				options: [
					["not", "not"]
				]
			},
			{
				type: "input_value",
				name: "value",
				check: "Value"
			}
		],
		inputsInline: true,
		colour: 100,
		output: "Value"
	},{
		type: "valueConditionalUnaryLogicOp",
		message0: "%1 %2 if %3",
		args0: [
			{
				type: "field_dropdown",
				name: "operator",
				options: [
					["not", "not"]
				]
			},
			{
				type: "input_value",
				name: "value",
				check: "Value"
			},{
				type: "input_value",
				name: "condition",
				check: "Value"
			}
		],
		inputsInline: true,
		colour: 100,
		output: "Value"
	},
	{
		type: "valueConstantNumber",
		message0: "%1",
		args0: [
			{
				type: "field_number",
				name: "value",
				value: 0
			}
		],
		inputsInline: true,
		colour: 100,
		output: "Value"
	},
	{
		type: "valueConstantBoolean",
		message0: "%1",
		args0: [
			{
				type: "field_checkbox",
				name: "value",
				checked: true
			}
		],
		inputsInline: true,
		colour: 100,
		output: "Value"
	},{
		type: "valueParameter",
		message0: "Parameter %1",
		args0: [
			{
				type: "field_input",
				name: "parameter",
				text: "Parameter"
			}
		],
		inputsInline: true,
		colour: 200,
		output: "Value"
	},{
		type: "valueCopyParameter",
		message0: "Copy parameter %1 into %2 for %3",
		args0: [
			{
				type: "field_input",
				name: "sourceParameter",
				text: "Parameter"
			},{
				type: "field_input",
				name: "destParameter",
				text: "New parameter"
			},{
				type: "input_value",
				name: "value",
				check: "Value"
			}
		],
		inputsInline: true,
		colour: 200,
		output: "Value"
	},{
		type: "valueResource",
		message0: "Value of resource %1",
		args0: [
			{
				type: "field_input",
				name: "resource",
				text: "Resource"
			}
		],
		inputsInline: true,
		colour: 300,
		output: "Value"
	},{
		type: "effectCreateResource",
		message0: "Create resource %1 starting at %2",
		args0: [
			{
				type: "field_input",
				name: "resource",
				text: "Resource"
			},{
				type: "input_value",
				name: "value",
				check: "Value"
			}
		],
		colour: 300,
		nextStatement: "Effect",
		previousStatement: "Effect"
	},{
		type: "effectSetResource",
		message0: "Set resource %1 to %2",
		args0: [
			{
				type: "field_input",
				name: "resource",
				text: "Resource"
			},{
				type: "input_value",
				name: "value",
				check: "Value"
			}
		],
		colour: 300,
		nextStatement: "Effect",
		previousStatement: "Effect"
	},{
		type: "effectDealDamage",
		message0: "Deal %1 %2 %3 damage to %4",
		args0: [
			{
				type: "input_value",
				name: "value",
				check: "Value"
			},{
				type: "input_value",
				name: "damageType"
			},{
				type: "field_dropdown",
				name: "mitigatableTypes",
				options: [
					["Always hitting", "none"],
					["Parryable", "parry"],
					["Blockable", "block"],
					["Missable", "miss"],
					["Dodgeble", "dodge"],
					["Standard spell", "spell"],
					["All", "all"]
				]
			},{
				type: "input_value",
				name: "targetId",
				check: "Value"
			}
		],
		colour: 300,
		nextStatement: "Effect",
		previousStatement: "Effect"
	},{
		type: "valueTargetDefaults",
		message0: "Target %1",
		args0: [
			{
				type: "field_dropdown",
				name: "target",
				options: [
					["Self", "self"],
					["Highest hp enemy", "enemy"],
					["Lowest hp ally", "ally"]
				]
			}
		],
		output: "Value",
		colour: 180
	},{
		type: "valueDamageTypes",
		message0: "%1 type",
		args0: [
			{
				type: "field_dropdown",
				name: "damageType",
				options: [
					["Physical", "physical"],
					["Holy", "holy"],
					["Fire", "fire"],
					["Frost", "frost"],
					["Nature", "nature"],
					["Arcane", "arcane"],
					["Shadow", "shadow"]
				]
			}
		],
		output: "Value",
		colour: 180
	},{
		type: "valueShortcut",
		message0: "Shortcut %1",
		args0: [
			{
				type: "field_input",
				name: "shortcutName",
				text: "Shortcut name"
			}
		],
		output: "Value"
	},{
		type: "effectShortcut",
		message0: "Shortcut %1",
		args0: [
			{
				type: "field_input",
				name: "shortcutName",
				text: "Shortcut name"
			}
		],
		colour: 300,
		nextStatement: "Effect",
		previousStatement: "Effect"
	},{
		type: "valueAura",
		message0: "%1 of aura %2 on %3",
		args0: [
			{
				type: "field_dropdown",
				name: "property",
				options: [
					["Duration", "duration"],
					["Stacks", "stacks"],
					["Value", "value"],
					["Exists", "exists"]
				]
			},{
				type: "field_input",
				name: "aura",
				text: "Aura"
			},{
				type: "input_value",
				name: "targetId",
				check: "Value"
			}
		],
		output: "Value"
	},{
		type: "valueFindActor",
		message0: "Id of %1 actor where %2",
		args0: [
			{
				type: "field_dropdown",
				name: "relation",
				options: [
					["Any", "any"],
					["Enemy", "enemy"],
					["Friendly", "ally"]
				]
			},{
				type: "input_value",
				name: "expression",
				check: "Value"
			}
		],
		output: "Value"
	}
]);
Blockly.common.defineBlocks(blockDefinitions);

function toolboxCreator(specialBlocks) {
	const number = {
		shadow: {
			type: "valueConstantNumber"
		}
	};
	const boolean = {
		shadow: {
			type: "valueConstantBoolean"
		}
	};
	return {
		kind: "categoryToolbox",
		contents: [
			{
				kind: "category",
				name: "Math",
				colour: 100,
				contents: [
					{
						kind: "block",
						type: "valueBinaryOp",
						inputs: {
							value1: number,
							value2: number
						}
					},
					{
						kind: "block",
						type: "valueConditionalBinaryOp",
						inputs: {
							value1: number,
							value2: number,
							condition: boolean
						}
					},
					{
						kind: "block",
						type: "valueUnaryOp",
						inputs: {
							value: number
						}
					},
					{
						kind: "block",
						type: "valueConditionalUnaryOp",
						inputs: {
							value: number,
							condition: boolean
						}
					},
					{
						kind: "block",
						type: "valueComparison",
						inputs: {
							value1: number,
							value2: number
						}
					},{
						kind: "block",
						type: "valueBinaryLogicOp",
						inputs: {
							value1: boolean,
							value2: boolean
						}
					},{
						kind: "block",
						type: "valueConditionalBinaryLogicOp",
						inputs: {
							value1: boolean,
							value2: boolean,
							condition: boolean
						}
					},{
						kind: "block",
						type: "valueUnaryLogicOp",
						inputs: {
							value: boolean
						}
					},{
						kind: "block",
						type: "valueConditionalUnaryLogicOp",
						inputs: {
							value: boolean,
							condition: boolean
						}
					},
					{
						kind: "block",
						type: "valueConstantNumber"
					},
					{
						kind: "block",
						type: "valueConstantBoolean"
					}
				]
			},{
				kind: "category",
				name: "Parameters",
				colour: 200,
				contents: [
					{
						kind: "block",
						type: "valueParameter"
					},{
						kind: "block",
						type: "valueCopyParameter"
					}
				]
			},{
				kind: "category",
				name: "Resources",
				colour: 300,
				contents: [
					{
						kind: "block",
						type: "valueResource"
					},{
						kind: "block",
						type: "effectCreateResource",
						inputs: {
							value: number
						}
					},{
						kind: "block",
						type: "effectSetResource",
						inputs: {
							value: number
						}
					}
				]
			},{
				kind: "category",
				name: "Actors",
				contents: [
					{
						kind: "block",
						type: "valueTargetDefaults"
					},{
						kind: "block",
						type: "valueFindActor",
						inputs: {
							expression: {
								shadow: {
									type: "valueComparison",
									inputs: {
										value1: {
											shadow: {
												type: "valueParameter",
												fields: {
													parameter: "actorId"
												}
											}
										},
										value2: {
											shadow: {
												type: "valueTargetDefaults"
											}
										}
									},
									fields: {
										comparison: "!="
									}
								}
							}
						}
					}
				]
			},{
				kind: "category",
				name: "Major Effects",
				contents: [
					{
						kind: "block",
						type: "effectDealDamage",
						inputs: {
							value: number,
							damageType: {
								shadow: {
									type: "valueDamageTypes"
								}
							},
							targetId: {
								shadow: {
									type: "valueTargetDefaults"
								}
							}
						}
					}
				]
			},{
				kind: "category",
				name: "Shortcuts",
				contents: [
					{
						kind: "block",
						type: "valueShortcut"
					},{
						kind: "block",
						type: "effectShortcut"
					}
				]
			},{
				kind: "category",
				name: "Auras",
				contents: [
					{
						kind: "block",
						type: "valueAura",
						inputs: {
							targetId: {
								shadow: {
									type: "valueTargetDefaults"
								}
							}
						}
					}
				]
			},{
				kind: "category",
				name: "Special",
				contents: specialBlocks
			}
		]
	};
}

const shortcutToolbox = toolboxCreator([
	{
		kind: "block",
		type: "valueShortcutDefinition"
	},{
		kind: "block",
		type: "effectShortcutDefinition"
	}
]);

const shortcutWorkspace = Blockly.inject("blocklyShortcutDiv", { toolbox: shortcutToolbox, move: { scrollbars: true, drag: true, wheel: false }, zoom: { wheel: true, controls: true } });
new ResizeObserver(() => {
	Blockly.svgResize(shortcutWorkspace);
}).observe(document.getElementById("blocklyShortcutDiv"));
shortcutWorkspace.addChangeListener(Blockly.Events.disableOrphans);
const shortcutContainerBlock = shortcutWorkspace.newBlock("shortcutsContainer");
shortcutContainerBlock.setDeletable(false);
shortcutContainerBlock.setEditable(false);
shortcutContainerBlock.initSvg();
shortcutContainerBlock.render();
shortcutContainerBlock.moveBy(100, 80);
document.getElementById("shortcutTextInput").spellcheck = false;
shortcutWorkspace.addChangeListener(() => {
	const code = Generator.generateCode(shortcutWorkspace)
	if (code !== ""){
		document.getElementById("shortcutTextInput").value = code;
	}
});
document.getElementById("shortcutTextInput").addEventListener("change", () => {
	try {
		JSON.parse(document.getElementById("shortcutTextInput").value);
	}catch {
		return;
	}
	Generator.loadCode(shortcutWorkspace, document.getElementById("shortcutTextInput").value);
});