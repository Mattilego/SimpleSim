// Import CSS files
import '../css/style.css';
import '../css/tooltips.css';
import '../css/screenSizeChanges.css';

import './siteNavigation.js';
import "./UserDataRetiever.js";

import './localAppFeatures.js';

import { WorkerManager } from './WorkerManager.js';

window.workerManager = new WorkerManager();
