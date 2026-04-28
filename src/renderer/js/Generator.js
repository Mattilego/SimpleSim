
import * as Blockly from "./../../../node_modules/blockly/core";
import * as En from "./../../../node_modules/blockly/msg/en";

export class Generator {

	static initializeGenerator(){
		const Order = {
			IDFC: 0
		};
		const JSONGenerator = new Blockly.CodeGenerator("JSON");
		JSONGenerator.scrub_ = function(block, code, thisOnly) {
			const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
			if (nextBlock && !thisOnly) {
				return code + ',' + JSONGenerator.blockToCode(nextBlock);
			}
			return code;
		};
		JSONGenerator.forBlock["shortcutsContainer"] = function (block, generator) {
			return `{${generator.statementToCode(block, "shortcuts")}}`;
		};
		JSONGenerator.forBlock["valueShortcutDefinition"] = function (block, generator) {
			let shortcutValue = generator.valueToCode(block, "shortcutValue", Order.IDFC);
			if (shortcutValue === ""){
				shortcutValue = "0";
			}
			return `"${block.getFieldValue("shortcutName")}":${shortcutValue}`;
		}
		JSONGenerator.forBlock["effectShortcutDefinition"] = function (block, generator) {
			return `"${block.getFieldValue("shortcutName")}":[${generator.statementToCode(block, "shortcutEffects")}]`;
		};
		JSONGenerator.forBlock["valueConstantNumber"] = function (block, generator) {
			return [`${block.getFieldValue("value")}`, Order.IDFC];
		};
		JSONGenerator.forBlock["valueConstantBoolean"] = function (block, generator) {
			return [`${block.getFieldValue("value").toLowerCase()}`, Order.IDFC];
		};
		JSONGenerator.forBlock["valueBinaryOp"] = function (block, generator) {
			return [`{"type":"${block.getFieldValue("operator")}","value1":${generator.valueToCode(block, "value1", Order.IDFC)},"value2":${generator.valueToCode(block, "value2", Order.IDFC)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueParameter"] = function (block, generator) {
			return [`{"type":"parameter","id":"${block.getFieldValue("parameter")}"}`, Order.IDFC];
		};
		JSONGenerator.forBlock["valueResource"] = function (block, generator) {
			return [`{"type":"resource","id":"${block.getFieldValue("resource")}","targetId":${generator.valueToCode(block, "targetId", Order.IDFC)}}`, Order.IDFC];
		};
		JSONGenerator.forBlock["valueConditionalBinaryOp"] = function (block, generator) {
			return [`{"type":"${block.getFieldValue("operator")}","value1":${generator.valueToCode(block, "value1", Order.IDFC)},"value2":${generator.valueToCode(block, "value2", Order.IDFC)},"conditions":[${generator.valueToCode(block, "condition", Order.IDFC)}]}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueBinaryLogicalOp"] = function (block, generator) {
			return [`{"type":"${block.getFieldValue("operator")}","value1":${generator.valueToCode(block, "value1", Order.IDFC)},"value2":${generator.valueToCode(block, "value2", Order.IDFC)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueConditionalBinaryLogicOp"] = function (block, generator) {	
			return [`{"type":"${block.getFieldValue("operator")}","value1":${generator.valueToCode(block, "value1", Order.IDFC)},"value2":${generator.valueToCode(block, "value2", Order.IDFC)},"conditions":[${generator.valueToCode(block, "condition", Order.IDFC)}]}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueUnaryOp"] = function (block, generator) {
			return [`{"type":"${block.getFieldValue("operator")}","value":${generator.valueToCode(block, "value", Order.IDFC)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueConditionalUnaryOp"] = function (block, generator) {
			return [`{"type":"${block.getFieldValue("operator")}","value":${generator.valueToCode(block, "value", Order.IDFC)},"conditions":[${generator.valueToCode(block, "condition", Order.IDFC)}]}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueComparison"] = function (block, generator) {
			return [`{"type":"${block.getFieldValue("operator")}","value1":${generator.valueToCode(block, "value1", Order.IDFC)},"value2":${generator.valueToCode(block, "value2", Order.IDFC)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueTargetDefaults"] = function (block, generator) {
			switch (block.getFieldValue("target")){
				case ("self"):
					return [`{"type":"fightData","id":"self"}`, Order.IDFC];
				case ("enemy"):
					return [`{"type":"findBestActor","relation":"enemy","expression":{"type":"resource","id":"health","targetId":{"type":"parameter","id":"actorId"}}}`, Order.IDFC];
				case ("ally"):
				return [`{"type":"findBestActor","relation":"ally","conditions":[],"expression":{"type":"-","value1":{"type":"stat","id":"maxHp","check":"rating"},"value2":{"type":"resource","id":"hp","targetId":{"type":"parameter","id":"actorId"}}}}`, Order.IDFC];
					
			}
		};
		JSONGenerator.forBlock["valueBinaryLogicOp"] = function (block, generator) {
			return [`{"type":"${block.getFieldValue("operator")}","value1":${generator.valueToCode(block, "value1", Order.IDFC)},"value2":${generator.valueToCode(block, "value2", Order.IDFC)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueUnaryLogicOp"] = function (block, generator) {
			return [`{"type":"${block.getFieldValue("operator")}","value":${generator.valueToCode(block, "value", Order.IDFC)}}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueConditionalUnaryLogicOp"] = function (block, generator) {
			return [`{"type":"${block.getFieldValue("operator")}","value":${generator.valueToCode(block, "value", Order.IDFC)},"conditions":[${generator.valueToCode(block, "condition", Order.IDFC)}]}`,Order.IDFC];
		};
		JSONGenerator.forBlock["valueTypes"] = function (block, generator) {
			switch (block.getFieldValue("damageType")) {
				case "physical":
					return ["1", Order.IDFC];
				case "holy":
					return ["2", Order.IDFC];
				case "fire":
					return ["4", Order.IDFC];
				case "frost":
					return ["8", Order.IDFC];
				case "nature":
					return ["16", Order.IDFC];
				case "arcane":
					return ["32", Order.IDFC];
				case "shadow":
					return ["64", Order.IDFC];
			}
		};
		JSONGenerator.forBlock["valueShortcut"] = function (block, generator) {
			return [`{"type":"shortcut","id":"${block.getFieldValue("shortcutName")}"}`, Order.IDFC];
		};
		JSONGenerator.forBlock["valueAura"] = function (block, generator) {
			return [`{"type": "aura","targetId": ${generator.valueToCode(block, "targetId", Order.IDFC)},"check":"${block.getFieldValue("property")}","id":"${block.getFieldValue("aura")}"}`, Order.IDFC];
		};
		JSONGenerator.forBlock["valueFindActor"] = function (block, generator) {
			return [`{"type": "findActor", "conditions": [${generator.valueToCode(block, "expression", Order.IDFC)}],"relation": "${block.getFieldValue("relation")}"}`, Order.IDFC];
		};
		JSONGenerator.forBlock["valueStat"] = function (block, generator) {
			return [`{"type": "stat","targetId": ${generator.valueToCode(block, "targetId", Order.IDFC)},"id":"${block.getFieldValue("stat")}","check":"${block.getFieldValue("property")}"}`, Order.IDFC]
		};
		JSONGenerator.forBlock["value"] = function (block, generator) {
			
		};





		JSONGenerator.forBlock["effectCreateResource"] = function (block, generator) {
			return `{"type":"createResource","id":"${block.getFieldValue("resource")}","value":${generator.valueToCode(block, "value", Order.IDFC)}}`;
		};
		JSONGenerator.forBlock["effectSetResource"] = function (block, generator) {
			return `{"type":"setResource","id":"${block.getFieldValue("resource")}","value":${generator.valueToCode(block, "value", Order.IDFC)}}`;

		};
		JSONGenerator.forBlock["effectDealDamage"] = function (block, generator) {
			return `{"type":"dealDamage","value":${generator.valueToCode(block, "value", Order.IDFC)},"damageType":${generator.valueToCode(block, "damageType", Order.IDFC)},"targetId":${generator.valueToCode(block, "targetId", Order.IDFC)}}`;
		};
		JSONGenerator.forBlock["effectShortcut"] = function (block, generator) {
			return `{"type":"shortcut","id":"${block.getFieldValue("shortcutName")}"}`;
		};
		JSONGenerator.forBlock["effectHeal"] = function (block, generator) {
			return `{"type":"heal","value":${generator.valueToCode(block, "value", Order.IDFC)},"healType":${generator.valueToCode(block, "healType", Order.IDFC)},"targetId":${generator.valueToCode(block, "targetId", Order.IDFC)}}`;
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
		const compact = this.JSONGenerator.workspaceToCode(workspace);
		try {
			return JSON.stringify(JSON.parse(compact), null, 2);
		} catch {
			console.log("Invalid JSON generated: ", compact);
			return ""
		}
	}

}