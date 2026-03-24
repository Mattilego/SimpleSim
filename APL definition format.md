APLs are defined as an array of entries, with the first entry havin the highest priority to be used, moving on to the next one if the first could not be used.

[
	APLEntry,
	APLEntry,
	...
]

APLEntry:
{
	ability: String,
	conditions: Array[Value (Boolean)],
	targetId: Value (Number)
}

Properties:
ability: The ability to use, while any ability can be used (such as _Initialize), it's usually not a good idea to put any ability with an underscore since those are ont meant as abilities you have access to.
conditions (optional): the conditions to use the ability at this priority, beyond meeting the requirements for the ability
targetId (optional): Which actor to target the ability at, ability definitions need to use the ablityTarget parameter for this to have an effect.