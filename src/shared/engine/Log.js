import { SharedData } from "./SharedData.js";

export class Log {
	static loggingDetial = "full";
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
	static pushToBuffer(string){
		if (logBufferEntries > 0) {
			this.logBuffer += "\n";
		}
		this.logBuffer += string;
		this.logBufferEntries++;
		if (logBufferEntries > bogBufferCapacity){
			const encoded = this.encoder.encode(logBuffer);
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

	static logDamage(time, sActor, dActor, abilityName){
		this.pushToBuffer()
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

	static getString() {
		if (this.loggingToFile) {
			const buffer = new DataView(new ArrayBuffer(this.accessHandle.getSize()));
			this.accessHandle.read(buffer, {at:0});
			this.accessHandle.close();
			this.opfsRoot.removeEntry(this.fileName);
			console.log(buffer);
			return buffer
		}
		return this.logs.join("\n");
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

	static async initializeListeners(loggingDetail, logToFile, fileName = "combatLog.txt") {
		this.loggingDetial = loggingDetail;
		this.loggingToFile = logToFile;
		if (this.loggingToFile) {
			this.fileName = fileName;
			this.opfsRoot = await navigator.storage.getDirectory();
			this.fileHandle = await this.opfsRoot.getFileHandle(fileName, { create: true });
			this.accessHandle = await this.fileHandle.createSyncAccessHandle();
			this.encoder = new TextEncoder();
			this.accessHandle.write(this.encoder.encode(`${this.formatTime(SharedData.eventLoop.time)}  ENCOUNTER_START,0,"Sim Iteration 0",172,1,0`), {at:0});

		}
		SharedData.actors.forEach((actor) => {
			if (loggingDetail === "full") {
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
			}
		});
	}

	static processEvent(type, data, actor) {
		switch (type) {
			case "damageTaken":
				if (this.loggingToFile) {
					this.logDamage(SharedData.eventLoop.time, data.sourceActor, actor, data.name, data.amount, data.types, data.crit, );
				}
				break;
			default:
				if (this.loggingToFile) {
					this.accessHandle.write(this.encoder.encode("\nUNKNOWN_EVENT," + type), { at: this.accessHandle.getSize() });
				}
		}
	}

	static newIteration(iteration) {
		if (this.loggingToFile && iteration > 0) {
			this.accessHandle.write(this.encoder.encode(`\n${this.formatTime(SharedData.eventLoop.time)}  ENCOUNTER_END,0,"Sim Iteration ${iteration-1}",172,1,1\n${this.formatTime(SharedData.eventLoop.time)}  ENCOUNTER_START,0,"Sim Iteration ${iteration}",172,1,0`), { at: this.accessHandle.getSize() });
		}
		if (this.loggingToFile) {
			this.accessHandle.flush();
		}
	}

	static formatTime(time) {}

	static getGeneralLogEntries(sourceActor, targetActor) {}

	static getAdvancedInfo(actor) {}

	static getSpellInfo(spellname, actor) {}
}
