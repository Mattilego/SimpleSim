/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/renderer/js/WorkerManager.js"
/*!******************************************!*\
  !*** ./src/renderer/js/WorkerManager.js ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   WorkerManager: () => (/* binding */ WorkerManager)\n/* harmony export */ });\nfunction _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\nfunction _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError(\"Cannot call a class as a function\"); }\nfunction _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, \"value\" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }\nfunction _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, \"prototype\", { writable: !1 }), e; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, \"string\"); return \"symbol\" == _typeof(i) ? i : i + \"\"; }\nfunction _toPrimitive(t, r) { if (\"object\" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || \"default\"); if (\"object\" != _typeof(i)) return i; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (\"string\" === r ? String : Number)(t); }\nvar WorkerManager = /*#__PURE__*/function () {\n  function WorkerManager() {\n    var poolSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : navigator.hardwareConcurrency || 4;\n    _classCallCheck(this, WorkerManager);\n    this.poolSize = poolSize;\n    this.workers = [];\n    this.queue = [];\n    this.activeTasks = 0;\n    this._initializePool();\n  }\n  return _createClass(WorkerManager, [{\n    key: \"_initializePool\",\n    value: function _initializePool() {\n      for (var i = 0; i < this.poolSize - this.workers.length; i++) {\n        var worker = new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(\"src_shared_engine_webWorkerWrapper_js\"), __webpack_require__.b), {\n          type: undefined\n        });\n        this.workers.push({\n          instance: worker,\n          busy: false,\n          id: i\n        });\n      }\n    }\n\n    /**\r\n     * Executes a task on the next available worker.\r\n     * @param {any} payload - Data to send to the worker.\r\n     * @returns {Promise} - Resolves with worker's response.\r\n     */\n  }, {\n    key: \"run\",\n    value: function run(payload) {\n      var _this = this;\n      return new Promise(function (resolve, reject) {\n        var task = {\n          payload: payload,\n          resolve: resolve,\n          reject: reject\n        };\n        var availableWorker = _this.workers.find(function (w) {\n          return !w.busy;\n        });\n        if (availableWorker) {\n          _this._execute(availableWorker, task);\n        } else {\n          _this.queue.push(task);\n        }\n      });\n    }\n  }, {\n    key: \"_execute\",\n    value: function _execute(worker, task) {\n      var _this2 = this;\n      worker.busy = true;\n      this.activeTasks++;\n      var cleanup = function cleanup() {\n        worker.instance.removeEventListener('message', onMessage);\n        worker.instance.removeEventListener('error', onError);\n        worker.busy = false;\n        _this2.activeTasks--;\n\n        // Check if there are pending tasks in the queue\n        if (_this2.queue.length > 0) {\n          _this2._execute(worker, _this2.queue.shift());\n        }\n      };\n      var onMessage = function onMessage(e) {\n        cleanup();\n        task.resolve(e.data);\n      };\n      var onError = function onError(e) {\n        cleanup();\n        task.reject(e);\n      };\n      worker.instance.addEventListener('message', onMessage);\n      worker.instance.addEventListener('error', onError);\n      worker.instance.postMessage(task.payload);\n    }\n  }, {\n    key: \"terminate\",\n    value: function terminate() {\n      this.workers.forEach(function (w) {\n        return w.instance.terminate();\n      });\n      this.workers = [];\n      this.queue = [];\n    }\n  }]);\n}();\n\n//# sourceURL=webpack://simplesim/./src/renderer/js/WorkerManager.js?\n}");

/***/ },

/***/ "./src/renderer/js/index.js"
/*!**********************************!*\
  !*** ./src/renderer/js/index.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _css_style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/style.css */ \"./src/renderer/css/style.css\");\n/* harmony import */ var _css_tooltips_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../css/tooltips.css */ \"./src/renderer/css/tooltips.css\");\n/* harmony import */ var _css_screenSizeChanges_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../css/screenSizeChanges.css */ \"./src/renderer/css/screenSizeChanges.css\");\n/* harmony import */ var _siteNavigation_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./siteNavigation.js */ \"./src/renderer/js/siteNavigation.js\");\n/* harmony import */ var _siteNavigation_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_siteNavigation_js__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _localAppFeatures_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./localAppFeatures.js */ \"./src/renderer/js/localAppFeatures.js\");\n/* harmony import */ var _localAppFeatures_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_localAppFeatures_js__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _WorkerManager_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./WorkerManager.js */ \"./src/renderer/js/WorkerManager.js\");\n// Import CSS files\n\n\n\n\n\n\nwindow.workerManager = new _WorkerManager_js__WEBPACK_IMPORTED_MODULE_5__.WorkerManager();\n\n//# sourceURL=webpack://simplesim/./src/renderer/js/index.js?\n}");

/***/ },

/***/ "./src/renderer/js/localAppFeatures.js"
/*!*********************************************!*\
  !*** ./src/renderer/js/localAppFeatures.js ***!
  \*********************************************/
() {

eval("{if (true) {\n  console.log(\"Nodeintegration enabled\");\n}\n\n//# sourceURL=webpack://simplesim/./src/renderer/js/localAppFeatures.js?\n}");

/***/ },

/***/ "./src/renderer/js/siteNavigation.js"
/*!*******************************************!*\
  !*** ./src/renderer/js/siteNavigation.js ***!
  \*******************************************/
() {

eval("{function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = \"function\" == typeof Symbol ? Symbol : {}, n = r.iterator || \"@@iterator\", o = r.toStringTag || \"@@toStringTag\"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, \"_invoke\", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError(\"Generator is already running\"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = \"next\"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError(\"iterator result is not an object\"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i[\"return\"]) && t.call(i), c < 2 && (u = TypeError(\"The iterator does not provide a '\" + o + \"' method\"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, \"GeneratorFunction\")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, \"constructor\", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, \"constructor\", GeneratorFunction), GeneratorFunction.displayName = \"GeneratorFunction\", _regeneratorDefine2(GeneratorFunctionPrototype, o, \"GeneratorFunction\"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, \"Generator\"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, \"toString\", function () { return \"[object Generator]\"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }\nfunction _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, \"\", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o(\"next\", 0), o(\"throw\", 1), o(\"return\", 2)); }, _regeneratorDefine2(e, r, n, t); }\nfunction asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }\nfunction _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, \"next\", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, \"throw\", n); } _next(void 0); }); }; }\ndocument.getElementById(\"collapseSpecSettings\").addEventListener(\"click\", function () {\n  document.getElementById(\"specConfigurationContainer\").style.maxHeight = document.getElementById(\"specConfigurationContainer\").style.maxHeight == \"0px\" ? document.getElementById(\"specConfigurationContainer\").style.height : \"0px\";\n});\ndocument.getElementById(\"collapseCharacterSettings\").addEventListener(\"click\", function () {\n  document.getElementById(\"characterStatsContainer\").style.maxHeight = document.getElementById(\"characterStatsContainer\").style.maxHeight == \"0px\" ? document.getElementById(\"characterStatsContainer\").style.height : \"0px\";\n});\ndocument.getElementById(\"collapseEnemySettings\").addEventListener(\"click\", function () {\n  document.getElementById(\"enemySettingsContainer\").style.maxHeight = document.getElementById(\"enemySettingsContainer\").style.maxHeight == \"0px\" ? document.getElementById(\"enemySettingsContainer\").style.height : \"0px\";\n});\ndocument.getElementById(\"collapseFightSettings\").addEventListener(\"click\", function () {\n  document.getElementById(\"fightSettingsContainer\").style.maxHeight = document.getElementById(\"fightSettingsContainer\").style.maxHeight == \"0px\" ? document.getElementById(\"fightSettingsContainer\").style.height : \"0px\";\n});\ndocument.getElementById(\"collapseResults\").addEventListener(\"click\", function () {\n  document.getElementById(\"resultsContainer\").style.maxHeight = document.getElementById(\"resultsContainer\").style.maxHeight == \"0px\" ? document.getElementById(\"resultsContainer\").style.height : \"0px\";\n});\ndocument.addEventListener('mousedown', /*#__PURE__*/function () {\n  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(e) {\n    return _regenerator().w(function (_context) {\n      while (1) switch (_context.n) {\n        case 0:\n          if (!(e.target.type === 'radio' && e.target.checked)) {\n            _context.n = 2;\n            break;\n          }\n          _context.n = 1;\n          return new Promise(function (resolve) {\n            var _handleMouseUp = function handleMouseUp() {\n              document.removeEventListener('mouseup', _handleMouseUp);\n              resolve();\n            };\n            document.addEventListener('mouseup', _handleMouseUp);\n          });\n        case 1:\n          setTimeout(function () {\n            return e.target.checked = false;\n          }, 0);\n        case 2:\n          return _context.a(2);\n      }\n    }, _callee);\n  }));\n  return function (_x) {\n    return _ref.apply(this, arguments);\n  };\n}());\ndocument.addEventListener('keydown', /*#__PURE__*/function () {\n  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(e) {\n    return _regenerator().w(function (_context2) {\n      while (1) switch (_context2.n) {\n        case 0:\n          console.log(e.key);\n          if (!(e.target.type === 'radio' && e.target.checked && e.key === \"Enter\")) {\n            _context2.n = 2;\n            break;\n          }\n          _context2.n = 1;\n          return new Promise(function (resolve) {\n            var _handleKeyUp = function handleKeyUp() {\n              document.removeEventListener('keyup', _handleKeyUp);\n              resolve();\n            };\n            document.addEventListener('keyup', _handleKeyUp);\n          });\n        case 1:\n          setTimeout(function () {\n            return e.target.checked = false;\n          }, 0);\n          _context2.n = 3;\n          break;\n        case 2:\n          if (e.key === \"Enter\") {\n            e.target.click();\n          }\n        case 3:\n          return _context2.a(2);\n      }\n    }, _callee2);\n  }));\n  return function (_x2) {\n    return _ref2.apply(this, arguments);\n  };\n}());\ndocument.querySelectorAll(\".specRadio\").forEach(function (radio) {\n  radio.addEventListener(\"change\", function () {\n    updateTalentVisibility();\n  });\n});\nfunction updateTalentVisibility() {\n  var spec = document.querySelector(\".specRadio:checked\");\n  var classTalentSections = document.querySelectorAll(\"#talents > div\");\n  classTalentSections.forEach(function (section) {\n    section.style.display = \"none\";\n  });\n  if (spec.classList.contains(\"dkspec\")) {\n    document.getElementById(\"dkTalents\").style.display = \"grid\";\n    console.log(spec.id);\n    switch (spec.id) {\n      case \"bloodDK\":\n        document.getElementById(\"bdkTalents\").style.display = \"grid\";\n        document.getElementById(\"fdkTalents\").style.display = \"none\";\n        document.getElementById(\"udkTalents\").style.display = \"none\";\n        document.getElementById(\"deathbringerHeroTalents\").style.display = \"grid\";\n        document.getElementById(\"sanLaynHeroTalents\").style.display = \"grid\";\n        document.getElementById(\"riderOfTheApocalypseHeroTalents\").style.display = \"none\";\n        break;\n      case \"frostDK\":\n        document.getElementById(\"fdkTalents\").style.display = \"grid\";\n        document.getElementById(\"bdkTalents\").style.display = \"none\";\n        document.getElementById(\"udkTalents\").style.display = \"none\";\n        document.getElementById(\"deathbringerHeroTalents\").style.display = \"grid\";\n        document.getElementById(\"sanLaynHeroTalents\").style.display = \"none\";\n        document.getElementById(\"riderOfTheApocalypseHeroTalents\").style.display = \"grid\";\n        break;\n      case \"unholyDK\":\n        document.getElementById(\"udkTalents\").style.display = \"grid\";\n        document.getElementById(\"bdkTalents\").style.display = \"none\";\n        document.getElementById(\"fdkTalents\").style.display = \"none\";\n        document.getElementById(\"deathbringerHeroTalents\").style.display = \"none\";\n        document.getElementById(\"sanLaynHeroTalents\").style.display = \"grid\";\n        document.getElementById(\"riderOfTheApocalypseHeroTalents\").style.display = \"grid\";\n        break;\n    }\n  }\n}\ndocument.querySelectorAll(\".positiveIntegerInput\").forEach(function (input) {\n  input.addEventListener(\"change\", function (e) {\n    console.log(e.target.value);\n    e.target.value = Math.floor(e.target.value);\n    console.log(e.target.value);\n    if (typeof e.target.value !== \"number\" || e.target.value < 1) {\n      e.target.value = 1;\n    }\n  });\n});\nupdateTalentVisibility();\n\n//# sourceURL=webpack://simplesim/./src/renderer/js/siteNavigation.js?\n}");

/***/ },

/***/ "./src/renderer/css/screenSizeChanges.css"
/*!************************************************!*\
  !*** ./src/renderer/css/screenSizeChanges.css ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://simplesim/./src/renderer/css/screenSizeChanges.css?\n}");

/***/ },

/***/ "./src/renderer/css/style.css"
/*!************************************!*\
  !*** ./src/renderer/css/style.css ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://simplesim/./src/renderer/css/style.css?\n}");

/***/ },

/***/ "./src/renderer/css/tooltips.css"
/*!***************************************!*\
  !*** ./src/renderer/css/tooltips.css ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://simplesim/./src/renderer/css/tooltips.css?\n}");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".bundle.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = (typeof document !== 'undefined' && document.baseURI) || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/renderer/js/index.js");
/******/ 	
/******/ })()
;