import { processRequest } from "./engineMain.js";
import { Log } from "./Log.js";

addEventListener("message", async (event) => {
	try {
		postMessage(await processRequest(event.data));
	} catch (e) {
		console.error("Error in web worker:", e, Log.getString());
		postMessage({ error: e.message });
	} finally {
		postMessage({});
	}
});