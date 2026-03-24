Standard entries, when an actor does something: Timestamp(M/D/Y H:M:S.XXXX)  Event(Constant),SourceGUID(GUID),Sourcename(String),SourceFlags(Hex),SourceRaidFlags(Hex),DestGUID(GUID),DestName(String),DestFlags(Hex),DestRaidFlags(Hex)
When a spell is involved(event is SPELL_*): SpellId(Number),SpellName(String),SpellSchool(Hex)
Advanced info: GUID(GUID),some GUID that is often 0000000000000000(GUID, can be left out),CurrentHp(Number),MaxHp(Number),AttackPower(Number),SpellPower(Number),Some stat(maybe armor)(Number),Not sure(Unknown, 0 is valid, not seen confirmed use),Not sure(Unknown, 0 is valid, not seen confirmed use),Not sure(Unknown, 0 is valid, not seen confirmed use),ResourceId(Number),CurrentResource(Number),MaxResource(Number),ResourceCost(Number),X(Number),Y(Number),MapID(Number),Angle(Number),AvgIlvl(Number)
Damage info: EffectiveDamage(Number),BaseDamage(Number, seems to be before damage increases such as from vers as well),Overkill(Number, -1 when no a killing blow),School(Number),Resisted(Number),Blocked(Number),Absorbed(Number, 0 when no absorption),Crit(1/nil),Glancing(nil),Crushing(nil),Flag(Constant, ST common)
Heal info: EffectiveHeal(Number),BaseHeal(Number),Overheal(Number),Absorbed(Number),Crit(1/nil)

SPELL_DAMAGE/SPELL_PERIODIC_DAMAGE: Standard, Spell, Advanced(for actor hit), damage info
SPELL_HEAL: Standard, Spell, Advanced(for actor healed), Heal info
SPELL_AURA_APPLIED/SPELL_AURA_REMOVED: Standard, Spell, BUFF/DEBUFF
SPELL_CAST_START: Standard, Spell
SPELL_CAST_SUCCESS: Standard, Spell, Advanced(for caster)
UNIT_DIED: Standard
ZONE_CHANGE: Timestamp  Event,ZoneId(Number),ZoneName(String),Some number(probably layer id or something, usually 0)
MAP_CHANGE: Timestamp  Event,MapID(Number),MapName(String), Map Edge X(Number), Map Edge Y(Number), Other Map Edge X(Number), Other Map Edge Y(Number)
ENCOUNTER_START: Timestamp  Event,EncounterId(Number),EncounterName(String),DifficultyId(Number),GroupSize(Number, what the content is scaled to, so 5 even if solo in a dungeon or 20 no matter how many you are in a mythic raid),InstanceId(Number)
ENCOUNTER_END: Timestamp  Event,EncounterId(Number),EncounterName(String),DifficultyId(Number),GroupSize(Number),Status(Number, often 1 or 0)
Header: Timestamp  COMBAT_LOG_VERSION,22,ADVANCED_LOG_ENABLED,1,BUILD_VERSION,12.0.1,PROJECT_ID,1