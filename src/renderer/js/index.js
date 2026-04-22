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
	e.target.disabled = true;
	const totalThreadsSpan = document.getElementById("totalProcesses");
	const finishedThreadsSpan = document.getElementById("finishedProcesses");
	const progressDiv = document.getElementById("processingInfo");
	const iterationsPerWorker = Math.floor(document.getElementById("iterationsInput").value/workerManager.poolSize);
	const workersWithExtra = document.getElementById("iterationsInput").value-iterationsPerWorker*workerManager.poolSize;
	const requestObject = UserDataRetriever.getRequestObject();
	requestObject.config.iterations = iterationsPerWorker;
	let promises = [];
	totalThreadsSpan.innerHTML = workerManager.poolSize;
	finishedThreadsSpan.innerHTML = 0;
	progressDiv.style.display = "block";
	for (let i = 0; i < workerManager.poolSize; i++) {
		const currentRequestObject = {...requestObject};
		if (i < workersWithExtra){
			currentRequestObject.config.iterations++;
		}
		currentRequestObject.config.fileName = "simulationThread_" + i + ".txt";
		promises.push(workerManager.run(currentRequestObject).then((result) => {finishedThreadsSpan.innerHTML = parseInt(finishedThreadsSpan.innerHTML) + 1;return result}));
	}
	Promise.all(promises).then((results) => {
		progressDiv.style.display = "none";
		e.target.disabled = false;
		document.getElementById("averageDPS").innerHTML = results.map((result) => result.averagedResult.totalActorStats[0].damage/result.averagedResult.timeElapsed).reduce((a, b) => a + b, 0) / results.length;
		document.getElementById("averageHPS").innerHTML = results.map((result) => result.averagedResult.totalActorStats[0].healing/result.averagedResult.timeElapsed).reduce((a, b) => a + b, 0) / results.length;
		document.getElementById("averageTimeElapsed").innerHTML = results.reduce((acc, result) => acc + result.averagedResult.timeElapsed, 0) / results.length;
		document.getElementById("finishedResults").style.display = "block";
	});
});