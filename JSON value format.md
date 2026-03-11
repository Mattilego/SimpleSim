Effects: Defines an action to be made by an actor.
All effects can have the optional property "conditions": Array[Value (Boolean)] which if evaluated to false will prevent the effect from triggering, unless different behaviour with it is specified
Types:

Damage:
{
	"type": "damage",
	"value": Value (Number),
	"types": Array[String],
	"targetId": Value (Number)
}
Deals damage to a target actor with damage multipliers and such included
Properties:
value: the base amount of damage to deal
types: array of damage types to count the damage as
targetId (optional): The actorId to deal damage to, defaults to highest hp enemy, value given abilityTarget as parameter

Heal:
{
	"type": "heal",
	"value": Value (Number),
	"types": Array[String],
	"targetId": Value (Number)
}
Heals a target actor with healing multipliers and such included
Properties:
value: the base amount of health to restore
types: array of healing types to count the healing as
targetId (optional): The actorId to heal, defaults to lowest hp ally, value given abilityTarget as parameter

Aura:
{
	"type": "aura",
	"id": String,
	"duration": Value (Number),
	"stacks": Value (Number),
	"value": Value (Number),
	"targetId": Value (Number)
}
Applies an aura to the target actor
Properties:
id: the id/name of the aura to apply
duration: the duration of the aura in seconds
stacks (optional): the number of stacks to apply, defaults to 1
value (optional): the value to give the aura (absorb amount mostly)
targetId (optional): The actorId to apply the aura to, defaults to self, value given abilityTarget as parameter

Remove Aura:
{
	"type": "removeAura",
	"id": String,
	"targetId": Value (Number)
}
Removes an aura from the target actor. If several auras with the same id exists the oldest is removed.
Properties:
id: the id/name of the aura to remove
targetId (optional): The actorId to remove the aura from, defaults to self, value given abilityTarget as parameter

Event:
{
	"type": "event",
	"time": Value (Number),
	"effects": Array[Effect]
}
Schedules an event to be executed at a specific time
Properties:
time: the time in seconds when the event should be executed, almost always used with current time + whatever delay is neeeded
effects: array of effects to execute when the event is triggered

Register Event Handler:
{
	"type": "registerEventHandler",
	"id": String,
	"effects": Array[Effect],
	"targetId": Value (Number),
	"eventConditions": Value (Boolean)
}
Creates an event handler that executes the given effects when the event is triggered
Properties:
id: the event type
effects: array of effects to execute when the event is triggered, value given event specific parameters
targetId (optional): The actorId to attach the handler to, defaults to self, value given abilityTarget as parameter
eventConditions (optional): value that must be true for the event to trigger the effecs, vaue given event specific parameters

Create Resource:
{
	"type": "createResource",
	"id": String,
	"value": Value (Number)
}
Creates a new resource for the actor
Properties:
id: the id/name of the resource to create
value: the initial value of the resource

Set Resource:
{
	"type": "setResource",
	"id": String,
	"value": Value (Number)
}
Sets the value of a resource for the actor, when compiled must have a Create Resource effect with the same id be earlier in _Initialize
Properties:
id: the id/name of the resource to set
value: the value to set the resource to

Use Ability:
{
	"type": "useAbility",
	"id": String
}
Uses an ability from the actor without checking it's conditions or applying the GCD
Properties:
id: the id/name of the ability to use

Run on Actors:
{
	"type": "runOnActors",
	"effects": Array[Effect],
	"relation": "enemy" | "ally",
	"conditions": Array(Value (Boolean))
}
Executes the given effects on all actors that match the given actorIds
Properties:
effects: array of effects to execute, effect given actorId as parameter
relation (optional): Quick filter for actor relation (enemy or ally), if not specified will interate all actors
conditions (optional): Additional conditions that must be met for the effects to execute on an actor, value given actorId and actorNumber as parameter, where actorNumber is the number o actors that have passed the conditions so far including the current

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
	"id": "time"
} = Number
Retrieves information about the fight
Properties:
id: id/name of the fight data to retrieve, currently only time

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
	"comparison": "==" | "!=" | ">" | "<" | ">=" | "<=",
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
Copies a parameter from one actor to another that can be used in the sub value and returns the sub value
Properties:
from: the id of the actor to copy from
to: the id of the actor to copy to
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
	"type": "chance" | "ppm" | "rppm",
	"id": String,
	"chance" | "ppm" | "rppm": Value (Number)
} = Boolean

type: what method to use for determining the chance
chance/ppm/rppm: the value indicating how often it should proc with respect to the type (chance in %)
id: the id/name of the proc, not needed other than for the rppm type

