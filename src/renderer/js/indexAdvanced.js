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
		message0: "Deal %1 %2 %3 damage to %4",//Deal [value] [damage type] [blockable/parryable...] damage to [targetId]
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
					["None", [false, false, false, false]],
					["Parryable", [false, false, true, false]],
					["Blockable", [false, false, false, true]],
					["Missable", [true, false, false, false]],
					["Dodgeble", [false, true, false, false]],
					["Standard spell", [true, true, false, false]]
					["All", [true, true, true, true]]
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
		type: "valueDamageTypes"
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
				name: "Defaults",
				contents: [
					{
						kind: "block",
						type: "valueTargetDefaults"
					}
				]
			},{
				kind: "category",
				name: "Major Effects",
				contents: [
					{
						kind: "block",
						type: "effectDealDamage"
					}
				]
			},
			{
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
shortcutWorkspace.addChangeListener(() => {
	console.log(document.getElementById("shortcutTextInput").value = Generator.generateCode(shortcutWorkspace));
});
document.getElementById("shortcutTextInput").addEventListener("change", () => {
	try {
		JSON.parse(document.getElementById("shortcutTextInput").value);
	}catch {
		return;
	}
	Generator.loadCode(shortcutWorkspace, document.getElementById("shortcutTextInput").value);
});