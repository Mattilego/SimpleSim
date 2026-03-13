import { processRequest } from "./engineMain.js";
import { Log } from "./Log.js";

addEventListener("message", async (event) => {
	try {
		postMessage(processRequest(event.data));
	} catch (e) {
		console.error("Error in web worker:", e);
		console.log(Log.getString());
		postMessage({ error: e.message });
	} finally {
		postMessage({});
	}
});
