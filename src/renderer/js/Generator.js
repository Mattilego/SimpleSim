
import * as Blockly from "./../../../node_modules/blockly/core";
import * as En from "./../../../node_modules/blockly/msg/en";

export class Generator {

	static initializeGenerator(){
		const Order = {
			IDFC: 0
		};
		const indent = function (block, includeCurrent=true, includeNewline=true) {
			let i = +includeCurrent;
			let parent = block.getParent();
			console.log(parent?.getOutputShape())
			let prev = block;
			while (parent !== null && parent.getPreviousBlock() === null){
				prev = parent;
				parent = parent.getParent();
				i++;
			}
			console.log(i);
			return (includeNewline?"\n":"")+("  ".repeat(i));
		}
		const JSONGenerator = new Blockly.CodeGenerator("JSON");
		JSONGenerator.scrub_ = function(block, code, thisOnly) {
			const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
			if (nextBlock && !thisOnly) {
				return code + ',\n' + JSONGenerator.blockToCode(nextBlock);
			}
			return code;
		};
		JSONGenerator.forBlock["shortcutsContainer"] = function (block, generator) {
			return `{\n${generator.statementToCode(block, "shortcuts")}\n}`;
		};
		JSONGenerator.forBlock["valueShortcutDefinition"] = function (block, generator) {
			let shortcutValue = generator.valueToCode(block, "shortcutValue", Order.IDFC);
			if (shortcutValue === ""){
				shortcutValue = "0";
			}
			return `"${block.getFieldValue("shortcutName")}": ${shortcutValue}`;
		}
		JSONGenerator.forBlock["effectShortcutDefinition"] = function (block, generator) {
			return `"${block.getFieldValue("shortcutName")}": [\n${generator.statementToCode(block, "shortcutEffects")}\n]`;
		};
		JSONGenerator.forBlock["valueConstantNumber"] = function (block, generator) {
			return [`${block.getFieldValue("value")}`, Order.IDFC];
		};
		JSONGenerator.forBlock["valueConstantBoolean"] = function (block, generator) {
			return [`${block.getFieldValue("value").toLowerCase()}`, Order.IDFC];
		};
		JSONGenerator.forBlock["valueBinaryOp"] = function (block, generator) {
			return [`{${indent(block)}"type": "${block.getFieldValue("operator")}",${indent(block)}"value1": ${generator.valueToCode(block, "value1", Order.IDFC)},${indent(block)}"value2": ${generator.valueToCode(block, "value2", Order.IDFC)}${indent(block, false)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueParameter"] = function (block, generator) {
			return [`{${indent(block)}"type": "parameter",${indent(block)}"id": "${block.getFieldValue("parameter")}"${indent(block, false)}}`, Order.IDFC];
		};
		JSONGenerator.forBlock["valueResource"] = function (block, generator) {
			return [`{${indent(block)}"type": "resource",${indent(block)}"id": "${block.getFieldValue("resource")}"${indent(block, false)}}`, Order.IDFC];
		};
		JSONGenerator.forBlock["valueConditionalBinaryOp"] = function (block, generator) {
			return [`{${indent(block)}"type": "${block.getFieldValue("operator")}",${indent(block)}"value1": ${generator.valueToCode(block, "value1", Order.IDFC)},${indent(block)}"value2": ${generator.valueToCode(block, "value2", Order.IDFC)},${indent(block)}"conditions": [${generator.valueToCode(block, "condition", Order.IDFC)}]${indent(block, false)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueBinaryLogicalOp"] = function (block, generator) {
			return [`{${indent(block)}"type": "${block.getFieldValue("operator")}",${indent(block)}"value1": ${generator.valueToCode(block, "value1", Order.IDFC)},${indent(block)}"value2": ${generator.valueToCode(block, "value2", Order.IDFC)}${indent(block, false)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueConditionalBinaryLogicOp"] = function (block, generator) {	
			return [`{${indent(block)}"type": "${block.getFieldValue("operator")}",${indent(block)}"value1": ${generator.valueToCode(block, "value1", Order.IDFC)},${indent(block)}"value2": ${generator.valueToCode(block, "value2", Order.IDFC)},${indent(block)}"conditions": [${generator.valueToCode(block, "condition", Order.IDFC)}]${indent(block, false)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueUnaryOp"] = function (block, generator) {
			return [`{${indent(block)}"type": "${block.getFieldValue("operator")}",${indent(block)}"value": ${generator.valueToCode(block, "value", Order.IDFC)}${indent(block, false)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueConditionalUnaryOp"] = function (block, generator) {
			return [`{${indent(block)}"type": "${block.getFieldValue("operator")}",${indent(block)}"value": ${generator.valueToCode(block, "value", Order.IDFC)},${indent(block)}"conditions": [${generator.valueToCode(block, "condition", Order.IDFC)}]${indent(block, false)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueComparison"] = function (block, generator) {
			return [`{${indent(block)}"type": "${block.getFieldValue("operator")}",${indent(block)}"value1": ${generator.valueToCode(block, "value1", Order.IDFC)},${indent(block)}"value2": ${generator.valueToCode(block, "value2", Order.IDFC)}${indent(block, false)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueTargetDefaults"] = function (block, generator) {
			switch (block.getFieldValue("target")){
				case ("self"):
					return [`{${indent(block)}"type": "fightData",${indent(block)}"id": "self"${indent(block, false)}}`, Order.IDFC];
				case ("enemy"):
					return [`{${indent(block)}"type": "findBestActor",${indent(block)}"relation": "enemy",${indent(block)}"expression": {${indent(block)}  "type": "resource",${indent(block)}  "id": "health",${indent(block)}  "targetId": {${indent(block)}    "type": "parameter",${indent(block)}    "id": "actorId"${indent(block)}  }${indent(block)}}${indent(block, false)}}`, Order.IDFC];
				case ("ally"):
				return [`{${indent(block)}"type": "findBestActor",${indent(block)}"relation": "ally",${indent(block)}"conditions": [],${indent(block)}"expression": {${indent(block)}  "type": "-",${indent(block)}  "value1": {${indent(block)}    "type": "stat",${indent(block)}    "id": "maxHp",${indent(block)}    "check": "rating"${indent(block)}  },${indent(block)}  "value2": {${indent(block)}    "type": "resource",${indent(block)}    "id": "hp",${indent(block)}    "targetId": {${indent(block)}      "type": "parameter",${indent(block)}      "id": "actorId"${indent(block)}    }${indent(block)}  }${indent(block)}}${indent(block, false)}}`, Order.IDFC];
					
			}
		};
		JSONGenerator.forBlock["valueBinaryLogicOp"] = function (block, generator) {
			return [`{${indent(block)}"type": "${block.getFieldValue("operator")}",${indent(block)}"value1": ${generator.valueToCode(block, "value1", Order.IDFC)},${indent(block)}"value2": ${generator.valueToCode(block, "value2", Order.IDFC)}${indent(block, false)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueUnaryLogicOp"] = function (block, generator) {
			return [`{${indent(block)}"type": "${block.getFieldValue("operator")}",${indent(block)}"value": ${generator.valueToCode(block, "value", Order.IDFC)}${indent(block, false)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueConditionalUnaryLogicOp"] = function (block, generator) {
			return [`{${indent(block)}"type": "${block.getFieldValue("operator")}",${indent(block)}"value": ${generator.valueToCode(block, "value", Order.IDFC)},${indent(block)}"conditions": [${generator.valueToCode(block, "condition", Order.IDFC)}]${indent(block, false)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["value"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["value"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["value"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["value"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["value"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["value"] = function (block, generator) {
			
		};





		JSONGenerator.forBlock["effectCreateResource"] = function (block, generator) {
			return `{${indent(block)}"type": "createResource",${indent(block)}"id": "${block.getFieldValue("resource")}",${indent(block)}"value": ${generator.valueToCode(block, "value", Order.IDFC)}${indent(block, false)}}`;
		};
		JSONGenerator.forBlock["effectSetResource"] = function (block, generator) {
			return `{${indent(block)}"type": "setResource",${indent(block)}"id": "${block.getFieldValue("resource")}",${indent(block)}"value": ${generator.valueToCode(block, "value", Order.IDFC)}${indent(block, false)}}`;

		};
		JSONGenerator.forBlock["effect"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["effect"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["effect"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["effect"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["effect"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["effect"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["effect"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["effect"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["effect"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["effect"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["effect"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["effect"] = function (block, generator) {
			
		};
		JSONGenerator.forBlock["effect"] = function (block, generator) {
			
		};

		this.JSONGenerator = JSONGenerator;
	}

	static generateCode(workspace) {
		return this.JSONGenerator.workspaceToCode(workspace);
	}

}