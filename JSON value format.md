Each value in the JSON can be a number, boolean, an object with a calculation or an object retrieving information.

Calculation objects have a type representing what the calculation is, most math calculations require value1 and value2 while most boolean calculations use the conditions as the inputs. Calculations that use value1 and value2 can have conditions attached to them to instead result in value1 unchanged if the condition is false, while calculated like normal if it's true.

Objects retrieving information have a type representing where the information should be taken from, and an id representing what information should be retrieved.

Examples:

Current lost hp would be:

{
	"type": "-",
	"value1": {
		"type": "stat",
		"id": "maxHp"
	},
	"value2": {
		"type": "playerHealth",
		"check": "value"
	}
}

