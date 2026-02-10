//Intended to be run as a web worker
this.addEventListener("message", async (event) => {
	this.postMessage(await this.processRequest(event.data));
});

async function processRequest(request) {
	const player = request.player;
	const enemies = request.enemies;
	const duration = request.duration;
	const abilities = request.abilities;
	const buffs = request.buffs;
	const debuffs = request.debuffs;
	const shortcuts = request.shortcuts;

}