class Log {
	static log = [];
	static log(message) {
		this.log.push(message);
	}

	static warn(message) {
		this.log.push("WARNING: " + message);
	}

	static error(message) {
		this.log.push("ERROR: " + message);
	}

	static clear() {
		this.log = [];
	}

	static get() {
		return this.log;
	}

	static getString() {
		return this.log.join("\n");
	}

}