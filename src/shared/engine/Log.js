import { SharedData } from "./SharedData.js";

export class Log {
	static loggingDetail = "full";
	static loggingToFile = false;
	static fileName = "combatLog.txt";
	static opfsRoot = null;
	static fileHandle = null;
	static accessHandle = null;
	static encoder = null;
	static logBuffer = "";
	static logBufferEntries = 0;
	static logBufferCapacity = 1000;
	static memoryStorageAmount = 0;
	static memoryStorageCapacity = 1024*1024;
	static GUIDMap = new Map();
	static totalIterationStats = [];
	static timeOffset = 0;
	static pushToBuffer(string){
		if (this.logBufferEntries > 0) {
			this.logBuffer += "\n";
		}
		this.logBuffer += string;
		this.logBufferEntries++;
		if (this.logBufferEntries > this.logBufferCapacity){
			const encoded = this.encoder.encode(this.logBuffer);
			this.memoryStorageAmount += 8*encoded.length;
			this.logBuffer = "";
			this.logBufferEntries = 0;
			this.accessHandle.write(encoded, {at:this.accessHandle.getSize()});
			if (this.memoryStorageAmount > this.memoryStorageCapacity){
				this.accessHandle.flush();
			}
			
		}
	}
	static logHeader(){
		this.pushToBuffer(this.formatTime(0)+"  COMBAT_LOG_VERSION,22,ADVANCED_LOG_ENABLED,1,BUILD_VERSION,12.0.1,PROJECT_ID,1");
	}

	static logDamage(time, sActor, dActor, abilityName, damage, baseDamage, school, overkill, crit, block, resist, dodge, miss, absorbed){
		const roundIfNumber = (n) => {
			if (typeof n === "number"){
				return Math.round(n);
			}
			return "nil";
		};
		if (this.loggingDetail === "file"){
			this.pushToBuffer(`${this.formatTime(time)}  SPELL_DAMAGE,${this.getGUID(sActor)},"${sActor.name.replace('"',"''")}",${this.getFlags(sActor)},${this.getRFlags(sActor)},${this.getGUID(dActor)},"${dActor.name.replace('"',"''")}",${this.getFlags(dActor)},${this.getRFlags(dActor)},${Math.round(sActor.abilities[abilityName]?.id ?? sActor.knownAuras[abilityName]?.id ?? 0)},"${abilityName}",${this.formatSchoolHex(sActor.abilities[abilityName]?.school ?? sActor.knownAuras[abilityName]?.school ?? ["physical"])},${this.getAdvancedInfo(dActor)},${roundIfNumber(damage)},${roundIfNumber(baseDamage)},${roundIfNumber(overkill) ?? -1},${this.formatSchoolNumber(school ?? ["physical"])},${roundIfNumber(resist)},${roundIfNumber(block)},${roundIfNumber(absorbed)},${crit ? 1 : "nil"},nil,nil,ST`);
		}
		this.totalIterationStats.at(-1).actorStats[sActor.id].damage += damage;
		this.totalIterationStats.at(-1).actorStats[dActor.id].damageTaken += damage;
	}

	static logSimple(time, event, sActor, dActor, spellName, advActor, advResource, advResourceCost){
		this.logFull(time, event, this.getGUID(sActor), sActor.name, this.getFlags(sActor), this.getRFlags(sActor), this.getGUID(dActor), dActor.name, this.getFlags(dActor), this.getRFlags(dActor), sActor.abilities[spellName]?.id ?? sActor.knownAuras[spellName]?.id, spellName, sActor.abilities[spellName]?.school ?? sActor.knownAuras[spellName]?.school ?? null, this.getGUID(advActor), "0000000000000000", advActor.getResource("health"), advActor.getStat("maxHp"), Math.max(advActor.getStat("strength"), advActor.getStat("agility")), 0, 0, 0, 0, sActor.getResourceId(advResource), sActor.getResource(advResource), sActor.getResourceMax(advResource), advResourceCost, 0, 0, 0, 0, 0);
	}

	static warn(message) {
		this.logs.push("WARNING: " + message);
	}

	static error(message) {
		this.logs.push("ERROR: " + message);
	}

	static clear() {
		this.logs = [];
	}

	static get() {
		return this.logs;
	}

	static getResult() {
		this.totalIterationStats.at(-1).timeElapsed = SharedData.eventLoop.time;
		if (this.loggingDetail === "file") {
			this.accessHandle.write(this.encoder.encode(this.logBuffer), {at:this.accessHandle.getSize()});
			this.accessHandle.flush();
			this.logBuffer = "";
			this.logBufferEntries = 0;
			this.memoryStorageAmount = 0;
			const buffer = new DataView(new ArrayBuffer(this.accessHandle.getSize()));
			this.accessHandle.read(buffer, {at:0});
			this.accessHandle.close();
			this.opfsRoot.removeEntry(this.fileName);
			console.log(buffer);
			return buffer
		}
		let averagedResult = {};
		averagedResult.timeElapsed = this.totalIterationStats.reduce((acc, stat) => acc + stat.timeElapsed, 0) / this.totalIterationStats.length;
		averagedResult.totalActorStats = this.totalIterationStats.reduce((acc, stat) => acc.map((current, i) => ({
			damage: current.damage + stat.actorStats[i].damage/this.totalIterationStats.length, 
			damageTaken: current.damageTaken+stat.actorStats[i].damageTaken/this.totalIterationStats.length,
			healing: current.healing + stat.actorStats[i].healing/this.totalIterationStats.length,
			healed: current.healed + stat.actorStats[i].healed/this.totalIterationStats.length
		})), new Array(SharedData.actors.length).fill({damage: 0, healing: 0, dmageTaken: 0, healed: 0}));
		console.log(this.totalIterationStats);
		return {averagedResult};
	}

	static JSONstringify(object) {
		const getCircularReplacer = () => {
			const seen = new WeakSet();
			return (key, value) => {
				if (typeof value === "object" && value !== null) {
					if (seen.has(value)) {
						return "[Circular]";
					} else if (value.name && value.apl) {
						return "[Actor " + value.name + "]";
					}
					seen.add(value);
				}
				return value;
			};
		};

		return JSON.stringify(object, getCircularReplacer());
	}

	static async initializeListeners(loggingDetail, fileName = "combatLog.txt") {
		this.loggingDetail = loggingDetail;
		this.totalIterationStats = [];
		this.timeOffset = 0;
		if (this.loggingDetail === "file") {
			this.fileName = fileName;
			this.opfsRoot = await navigator.storage.getDirectory();
			this.fileHandle = await this.opfsRoot.getFileHandle(fileName, { create: true });
			this.accessHandle = await this.fileHandle.createSyncAccessHandle();
			this.encoder = new TextEncoder();
			this.logHeader();
			this.pushToBuffer(`${this.formatTime(SharedData.eventLoop.time)}  ENCOUNTER_START,0,"Sim Iteration 0",172,1,0`);

		}
		SharedData.actors.forEach((actor) => {
				SharedData.eventLoop.registerEventHandler(
					"damageTaken",
					actor.id,
					{
						triggerEffects: (_, data) => {
							Log.processEvent("damageTaken", data, actor);
						}
					},
					true,
					null
				);
				SharedData.eventLoop.registerEventHandler(
					"damageDealt",
					actor.id,
					{
						triggerEffects: (_, data) => {
							Log.processEvent("damageDealt", data, actor);
						}
					},
					true,
					null
				);
				SharedData.eventLoop.registerEventHandler(
					"healRecieved",
					actor.id,
					{
						triggerEffects: (_, data) => {
							Log.processEvent("healRecieved", data, actor);
						}
					},
					true,
					null
				);
				SharedData.eventLoop.registerEventHandler(
					"healDone",
					actor.id,
					{
						triggerEffects: (_, data) => {
							Log.processEvent("healDone", data, actor);
						}
					},
					true,
					null
				);
				SharedData.eventLoop.registerEventHandler(
					"auraApplied",
					actor.id,
					{
						triggerEffects: (_, data) => {
							Log.processEvent("auraApplied", data, actor);
						}
					},
					true,
					null
				);
				SharedData.eventLoop.registerEventHandler(
					"auraRemoved",
					actor.id,
					{
						triggerEffects: (_, data) => {
							Log.processEvent("auraRemoved", data, actor);
						}
					},
					true,
					null
				);
				SharedData.eventLoop.registerEventHandler(
					"resourceChange",
					actor.id,
					{
						triggerEffects: (_, data) => {
							Log.processEvent("resourceChange", data, actor);
						}
					},
					true,
					null
				);
				SharedData.eventLoop.registerEventHandler("usedAbility", actor.id, { triggerEffects: (_, data) => {} }, true, null);
		});
	}

	static processEvent(type, data, actor) {
		switch (type) {
			case "damageTaken":
				this.logDamage(SharedData.eventLoop.time, data.sourceActor, actor, data.name, data.damage, data.baseDamage, data.types, data.overkill, data.crit, data.block);
				break;
			default:
				if (this.loggingDetail === "file") {
					//this.accessHandle.write(this.encoder.encode("\nUNKNOWN_EVENT," + type), { at: this.accessHandle.getSize() });
				}
		}
	}

	static newIteration(iteration) {
		this.timeOffset = SharedData.eventLoop.time;
		if (iteration > 0){
			if (this.loggingDetail === "file") {
				this.pushToBuffer(`\n${this.formatTime(SharedData.eventLoop.time)}  ENCOUNTER_END,0,"Sim Iteration ${iteration-1}",172,1,1\n${this.formatTime(SharedData.eventLoop.time)}  ENCOUNTER_START,0,"Sim Iteration ${iteration}",172,1,0`);
			}
			this.totalIterationStats.at(-1).timeElapsed = SharedData.eventLoop.time;
		}
		this.addCleanTotalStats();
	}

	static formatTime(time) {
		const d = new Date((time+this.timeOffset) * 1000);
		return `${('0' + (d.getMonth() + 1)).slice(-2)}/${('0' + d.getDate()).slice(-2)}/2000 ${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}.${('000' + d.getMilliseconds()).slice(-4)}`;
		
	}

	static getAdvancedInfo(actor) {
		return `${this.getGUID(actor)},0000000000000000,${Math.round(actor.getResource("health"))},${Math.round(actor.getStat("maxHp"))},${Math.round(Math.max(actor.getStat("strength"), actor.getStat("agility")))},${Math.round(actor.getStat("intellect"))},0,0,0,0,0,0,0,0,0,0,0,0,0`;
	}

	static getGUID(actor) {
		if (this.GUIDMap.has(actor.id)){
			return this.GUIDMap.get(actor.id);
		} else {
			let GUID = actor.id.toString().padStart(26, '0');
			GUID = "Creature-"+GUID[0]+"-"+GUID.substring(1,5)+"-"+GUID[5]+"-"+GUID.substring(6,11)+"-"+GUID.substring(11,16)+"-"+GUID.substring(16);
			this.GUIDMap.set(actor.id, GUID);
			return this.GUIDMap.get(actor.id);
		}
	}

	static getFlags(actor){
		return "0x511";
	}

	static getRFlags(actor){
		return "0x80000000";
	}

	static formatSchoolHex(schools){
		return "0x"+this.formatSchoolNumber(schools).toString(16).toUpperCase();
	}

	static formatSchoolNumber(schools){
		let id = 0;
		for (let school of schools){
			id += SharedData.types.get(school);
		}
		return id;
	}

	static addCleanTotalStats(){
		this.totalIterationStats.push({actorStats: SharedData.actors.map(actor => ({damage: 0, damageTaken: 0, healing: 0, healed: 0})), timeElapsed: 0});
	}
}
