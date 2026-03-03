export class Log {
	static logs = [];
	static log(message) {
		this.logs.push(message);
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
}
