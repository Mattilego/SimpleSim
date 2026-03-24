// Import CSS files
import '../css/style.css';
import '../css/tooltips.css';
import '../css/screenSizeChanges.css';

import './siteNavigation.js';
import { UserDataRetriever } from "./UserDataRetriever.js";
import { DefaultSpecDataLoader } from './DefaultSpecDataLoader.js';

import './localAppFeatures.js';

import { WorkerManager } from './WorkerManager.js';

const workerManager = new WorkerManager();

//Debug
window.workerManager = workerManager;
window.UserDataRetriever = UserDataRetriever;
window.DefaultSpecDataLoader = DefaultSpecDataLoader;

document.getElementById("startSimulationButton").addEventListener("click", async (e) => {
	const iterationsPerWorker = Math.floor(document.getElementById("iterationsInput").value/workerManager.poolSize);
	const workersWithExtra = document.getElementById("iterationsInput").value-iterationsPerWorker*workerManager.poolSize;
	const requestObject = UserDataRetriever.getRequestObject();
	requestObject.config.iterations = iterationsPerWorker;
	for (let i = 0; i < workerManager.poolSize; i++) {
		const currentRequestObject = {...requestObject};
		if (i < workersWithExtra){
			currentRequestObject.config.iterations++;
		}
		currentRequestObject.config.fileName = "simulationThread_" + i + ".txt";
		workerManager.run(currentRequestObject).then((result) => {
			console.log("Finished worker " + i, result);
		});
	}
});