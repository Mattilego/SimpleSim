Shortcut:
{
	"type": "shortcut",
	"id": String,
	"parameters": Object
}
Executes a shortcut from the actor
Properties:
id: the id/name of the shortcut to execute
parameters (optional): object containing parameters to pass to the shortcut

Check APL (internal):
{
	"type": "checkAPL",
	"security": String
}
Causes the actor to check it's apl for abilities to use and schedules the next according to it's GCD
Properties:
security: must equal actor.name (Can't be consistently retireved in json) otherwise the effect does nothing, mostly to prevent accidental use leading to exponential increse in ability usage


Values: Return a value that can be used in effects or other checks
Numbers and booleans count as a Value
Types:

Normal Math Operations:
{
	"type": "+" | "-" | "*" | "/" | "mod" | "^" | "**" | "pow" | "max" | "min",
	"value1": Value (Number),
	"value2": Value (Number),
	"conditions": Array[Value (Boolean)]
} = Number
Computes the result of the operation
Properties:
value1: the first operand
value2: the second operand
conditions (optional): if evaluated to false the operation returns value1 unchanged

Unary Math Operations:
{
	"type": "abs" | "round" | "ceil" | "floor" | "sqrt" | "log" | "exp",
	"value": Value (Number),
	"conditions": Array[Value (Boolean)]
} = Number
Computes the result of the operation
Properties:
value: the value to operate on
conditions (optional): if evaluated to false the operation returns value unchanged

Normal Logic Operations:
{
	"type": "&&" | "||" | "and" | "or",
	"conditions": Array[Value (Boolean)]
} = Boolean
Computes the result of the operation
Properties:
conditions: the booleans to and/or together

Arrays of conditions other than for this type default to being anded together, with empty/missing conditions defaulting to true.

Not:
{
	"type": "!" | "not",
	"value": Value (Boolean),
	"conditions": Array[Value (Boolean)]
}
Inverts boolean unless conditions evaluate to false
Properties:
value: boolean to invert
conditions: if evaluated to false the operation returns value unchanged

Comparisons:
{
	"type": "<" | ">" | "<=" | ">=" | "==" | "=" | "!=",
	"value1": Value (Any),
	"value2": Value (Any)
} = Boolean
Computes the result of the comparison
Properties:
value1: the first value to compare
value2: the secondvalue to compare

Resource:
{
	"type": "resource",
	"id": String
} = Number
Retrieves the current value of a resource
Properties:
id: id/name of the resource

Parameter:
{
	"type": "parameter",
	"id": String
} = Any
Retrieves the current value of a parameter
Properties:
id: id/name of the parameter

Stat:
{
	"type": "stat",
	"id": String,
	"check": "rating" | "effect"
} = Number
Retrieves the current value of a stat
Properties:
id: id/name of the stat
check: whether to check the rating (raw number) or effect (percentage for non primary stats, "points" for mastery which scales differently for different effects)

Talent:
{
	"type": "talent",
	"id": String,
	"check": "known" | "points"
} = Boolean if check="known", Number if check="points"
Retrieves the current value of a talent
Properties:
id: id/name of the talent
check (optional): whether to check if the talent is known  or the points spent in the talent, defaults to "known"

Level:
{
	"type": "level"
} = Number
Retrieves the current level of the actor

Ability:
{
	"type": "ability",
	"id": String,
	"check": "cooldown" | "charges" | "usable"
} = Number if check="cooldown" or "charges", Boolean if check="usable"
Retrieves information about an ability
Properties:
id: id/name of the ability
check: whether to check the cooldown, charges, or if the ability is usable, defaults to "usable", cooldown is the time untl the next charge is gained, 0 if at max charges (max charges is often 1)


Aura:
{
	"type": "aura",
	"id": String,
	"check": "exists" | "duration" | "stacks" | "value"
} = Boolean if check="exists", Number if check="duration" or "stacks" or "value"
Retrieves information about an aura
Properties:
id: id/name of the aura
check: whether to check if the aura exists, the duration, stacks, or value

Fight Data:
{
	"type": "fightData",
	"id": "time" | "self"
} = Number
Retrieves information about the fight
Properties:
id: id/name of the fight data to retrieve, time retrieves current fight time, self retrieves own actor id

Matching Actors:
{
	"type": "matchingActors",
	"relation": "enemy" | "ally",
	"conditions": Array[Value (Boolean)]
} = Number
Retrieves the number of actors that match the conditions
Properties:
relation: whether to check enemy or ally actors
conditions: the conditions to check

Direct comparisons:
{
	"type": "resource" | "parameter" | "stat" | "talent" | "ability" | "aura" | "fightData" | "matchingActors",
	type specific properties,
	"comparison": "=" | "==" | "!=" | ">" | "<" | ">=" | "<=",
	"value": Value (Number)
} = Boolean (instead of previous return type)
Optionally adds a comparison directly do a value retrieval
Properties:
comparison: the comparison to perform
value: the value to compare to

Find Actor:
{
	"type": "findActor",
	"conditions": Array[Value (Boolean)],
	"relation": "enemy" | "ally"
} = Bumber
Finds an actor that matches the conditions and returns its id
Properties:
conditions: the conditions to check
relation (optional): whether to check enemy or ally actors, if not present all actors are checked

Find Best Actor:
{
	"type": "findBestActor",
	"expression": Value (Number),
	"conditions": Array[Value (Boolean)],
	"relation": "enemy" | "ally"
} = Number
Finds the actor with the highest value of the expression and returns its id
Properties:
expression: the expression to evaluate, value given actorId as parameter
conditions (optional): additional conditions that must be met for an actor to be considered
relation (optional): whether to check enemy or ally actors, if not present all actors are checked

Copy Parameter:
{
	"type": "copyParameter",
	"from": String,
	"to": String,
	"value": Value (Any)
} = Any
Copies a parameter to another parameter name that can be used in the sub value and returns the sub value
Properties:
from: the id/name of the parameter to copy from
to: the id/name of the parameter to copy to
value: the value to pass through

Shortcut:
{
	"type": "shortcut",
	"id": String,
	"parameters": Object
} = Any
Retrieves a value from a shortcut
Properties:
id: the id/name of the shortcut
parameters (optional): Additional parameters to give the shortcut

Proc:
{
	"type": "proc",
	"system": "chance" | "ppm" | "rppm",
	"id": String,
	"chance" | "ppm" | "rppm": Value (Number)
} = Boolean
Randomly returns true or false according to proc rules, usually used as a conditions for applyAura, sometimes as a condition for an effect directly
Properties:
system: what method to use for determining the chance
chance/ppm/rppm: the value indicating how often it should proc with respect to the type (chance in %)
id: the id/name of the proc, not needed other than for the rppm type