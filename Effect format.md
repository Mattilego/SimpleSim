Effects: Defines an action to be made by an actor.
All effects can have the optional property "conditions": Array[Value (Boolean)] which if evaluated to false will prevent the effect from triggering, unless different behaviour with it is specified
Types:

Damage:
{
	"type": "damage",
	"value": Value (Number),
	"types": Array[String],
	"targetId": Value (Number),
	"missable": Boolean,
	"dodgeable": Boolean,
	"parryable": Boolean,
	"blockable": Boolean
}
Deals damage to a target actor with damage multipliers and such included
Properties:
value: the base amount of damage to deal
types: array of damage types to count the damage as
targetId (optional): The actorId to deal damage to, defaults to highest hp enemy, value given abilityTarget as parameter
missable (optional): If the damage can miss, defaults to false
dodgeable (optional): If the damage can be dodged, defaults to false
parryable (optional): If the damage can be parried, defaults to false
blockable (optional): If the damage can be blocked, defaults to false

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

Apply Aura:
{
	"type": "applyAura",
	"id": String,
	"duration": Value (Number),
	"stacks": Value (Number),
	"value": Value (Number),
	"targetId": Value (Number)
}
Applies an aura to the target actor
Properties:
id: the id/name of the aura to apply
duration (optional): the duration of the aura in seconds, uses aura definition duration if not present
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