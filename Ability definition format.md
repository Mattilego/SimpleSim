Abilities are defined in an object with aility names/ids as keys and the definition as the value:
{
	"abilityName1": abilityDefinition,
	"abilityName2": abilityDefinition2,
	...
}

Ability Definition:
{
	"castEffects": Array[Effect],
	"cooldown": Value (Number),
	"conditions": Array[Value (Boolean)],
	"GCD": Value (Number),
	"charges": Number
}
Properties:
castEffects: The effects the ability triggers
cooldown (optional): The time until the ability gain a charge back, defaults to 0
conditions: The conditions that must be met for the ability to be used
GCD (optional): How big of a portion of a GCD the ability takes, defaults to 1
charges (optional): The number of charges the ability has, defaults to 1

Each actor is required to have an ability "_Initialize" which is called automatially when the actor is created and shouldbe used to apply permanent auras and set up the resources