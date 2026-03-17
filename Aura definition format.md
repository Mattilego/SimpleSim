Auras are defined in the same structure as abilitiesand shortcuts; as an object with aura names/ids as keys and the definition as the value.

{
	"auraName1": auraDefinition,
	"auraName2": auraDefinition2,
	...
}

Aura Definition:
{
	"duration": Value (Number),
	"reapplicationType": "refresh" | "pandemic" | "overlap" | "stackRefresh" | "stackPandemic",
	"maxStacks": Number,
	"expirationAbility": String,
	"removalAbility": String,
	"tickInterval": Value (Number),
	"tickAbility": String,
	"damageDoneMultiplier": Value (Number),
	"damageDoneAddition": Value (Number),
	"damageDoneSpecialMultiplier": Value (Number),
	"damageDoneSpecialAddition": Value (Number),
	"damageTakenMultiplier": Value (Number),
	"damageTakenAddition": Value (Number),
	"damageTakenSpecialMultiplier": Value (Number),
	"damageTakenSpecialAddition": Value (Number),
	"healingDoneMultiplier": Value (Number),
	"healingDoneAddition": Value (Number),
	"healingDoneSpecialMultiplier": Value (Number),
	"healingDoneSpecialAddition": Value (Number),
	"healingTakenMultiplier": Value (Number),
	"healingTakenAddition": Value (Number),
	"healingTakenSpecialMultiplier": Value (Number),
	"healingTakenSpecialAddition": Value (Number),
	"typesModified": Array[String],
	"statRatingMultiplier": Value (Number),
	"statRatingAddition": Value (Number),
	"statRatingSpecialMultiplier": Value (Number),
	"statRatingSpecialAddition": Value (Number),
	"statEffectMultiplier": Value (Number),
	"statEffectAddition": Value (Number),
	"statEffectSpecialMultiplier": Value (Number),
	"statEffectSpecialAddition": Value (Number),
	"statsModified": Array[String],
	"absorbTypes": Array[String]
}

Properties:
duration: default duration and used for pandemic max duration, -1 can be used for infinite duration
reapplicationType: how the aura is reapplied, refresh updates duration, pandemic extends duration up to maxDuration*1.3, overlap creates a new instance, stackRefresh and stackPandemic work like refresh and pandemic but add the new and previous stacks upt to maxStacks
maxStacks (optional): maximum number of stacks allowed and maximum amount of instances for type overlap
expirationAbility (optional): Ability with effects to trigger when the aura expires
removalAbility (optional): Ability with effects to trigger when the aura is removed before expiration
tickInterval (optional): interval in seconds for tickAbility to trigger
tickAbility (optional): Ability with effects to trigger at tickInterval
absorbTypes (optional): if present will treat aura.value as an absorb shield absorbing whatever types are in this property
damageDoneMultiplier (optional): multiplier for damage done, snapshotted on aura application
damageDoneAddition (optional): addition for damage done for each damage event, snapshotted on aura application, very rarely used
damageDoneSpecialMultipler (optional): damage multiplier without snapshotting, passed baseDamage and targetId as parameters
damageDoneSpecialAddition (optional): damage addition without snapshotting, rarely used, passed baseDamage, targetId and postMultiplierDamage as parameters
damageTakenMultiplier (optional): multiplier for damage taken, snapshotted on aura application
damageTakenAddition (optional): addition for damage taken for each damage event, snapshotted on aura application, very rarely used
damageTakenSpecialMultipler (optional): damage multiplier without snapshotting, passed baseDamage and targetId as parameters
damageTakenSpecialAddition (optional): damage addition without snapshotting, rarely used, passed baseDamage, targetId and postMultiplierDamage as parameters
healingDoneMultiplier (optional): multiplier for healing done, snapshotted on aura application
healingDoneAddition (optional): addition for healing done for each healing event, snapshotted on aura application, very rarely used
healingDoneSpecialMultipler (optional): healing multiplier without snapshotting, passed baseHealing and targetId as parameters
healingDoneSpecialAddition (optional): healing addition without snapshotting, rarely used, passed baseHealing, targetId and postMultiplierHealing as parameters
healingTakenMultiplier (optional): multiplier for healing taken, snapshotted on aura application
healingTakenAddition (optional): addition for healing taken for each healing event, snapshotted on aura application, very rarely used
healingTakenSpecialMultipler (optional): healing multiplier without snapshotting, passed baseHealing and targetId as parameters
healingTakenSpecialAddition (optional): healing addition without snapshotting, rarely used, passed baseHealing, targetId and postMultiplierHealing as parameters
typesModified (optional): limits damage/healing types affected by modifiers/additions to the specified types
statRatingMultiplier (optional): multiplier for stat rating, snapshotted on aura application
statRatingAddition (optional): addition for stat rating, snapshotted on aura application
statRatingSpecialMultiplier (optional): stat rating multiplier without snapshotting
statRatingSpecialAddition (optional): stat rating addition without snapshotting
statEffectMultiplier (optional): multiplier for stat effect, snapshotted on aura application
statEffectAddition (optional): addition for stat effect, snapshotted on aura application
statEffectSpecialMultiplier (optional): stat effect multiplier without snapshotting
statEffectSpecialAddition (optional): stat effect addition without snapshotting
statsModified (optional): limits stat ratings and effects affected by modifiers/additions to the specified stats, mandatory if any stat modification is present