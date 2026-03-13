// Import CSS files
import '../css/style.css';
import '../css/tooltips.css';
import '../css/screenSizeChanges.css';

import './siteNavigation.js';
import { UserDataRetriever } from "./UserDataRetriever.js";
import { DefaultSpecDataLoader } from './DefaultSpecDataLoader.js';

import './localAppFeatures.js';

import { WorkerManager } from './WorkerManager.js';

//Debug
window.workerManager = new WorkerManager(1);
window.UserDataRetriever = UserDataRetriever;
window.DefaultSpecDataLoader = DefaultSpecDataLoader;
