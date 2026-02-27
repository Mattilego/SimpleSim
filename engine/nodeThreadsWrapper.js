import { processRequest } from "./engineMain.js";
import { parentPort } from "worker_threads";
import { Log } from "./Log.js";

parentPort.on("message", async (event) => {
	try {
		parentPort.postMessage(await processRequest(event.data));
	} catch (e) {
		console.error("Error in node thread:", e, Log.getString());
		parentPort.postMessage({ error: e.message });
	} finally {
		parentPort.postMessage({});
	}
});
