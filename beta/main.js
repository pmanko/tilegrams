/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _mobileDetect = __webpack_require__(1);

	var _mobileDetect2 = _interopRequireDefault(_mobileDetect);

	var _Canvas = __webpack_require__(3);

	var _Canvas2 = _interopRequireDefault(_Canvas);

	var _Ui = __webpack_require__(88);

	var _Ui2 = _interopRequireDefault(_Ui);

	var _Metrics = __webpack_require__(87);

	var _Metrics2 = _interopRequireDefault(_Metrics);

	var _Exporter = __webpack_require__(53);

	var _Exporter2 = _interopRequireDefault(_Exporter);

	var _Importer = __webpack_require__(308);

	var _Importer2 = _interopRequireDefault(_Importer);

	var _DatasetResource = __webpack_require__(309);

	var _DatasetResource2 = _interopRequireDefault(_DatasetResource);

	var _GeographyResource = __webpack_require__(41);

	var _GeographyResource2 = _interopRequireDefault(_GeographyResource);

	var _TilegramResource = __webpack_require__(318);

	var _TilegramResource2 = _interopRequireDefault(_TilegramResource);

	var _GridGeometry = __webpack_require__(21);

	var _GridGeometry2 = _interopRequireDefault(_GridGeometry);

	var _utils = __webpack_require__(20);

	var _constants = __webpack_require__(22);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	__webpack_require__(325);
	__webpack_require__(332);

	var CARTOGRAM_COMPUTE_FPS = 60.0;

	var cartogramComputeTimer = void 0;

	var importing = false;
	var defaultGeography = 'United States';

	if (typeof window !== 'undefined') {
	  var mobileDetect = new _mobileDetect2.default(window.navigator.userAgent);
	  var isMobile = mobileDetect.mobile();
	  if (isMobile) {
	    document.body.className = 'isMobile';
	  }
	}

	function selectDataset(geography, index, customCsv) {
	  var dataset = index !== null ? _DatasetResource2.default.getDataset(geography, index) : _DatasetResource2.default.buildDatasetFromCustomCsv(geography, customCsv);
	  importing = false;
	  _Ui2.default.setSelectedDataset(dataset);
	  _Canvas2.default.computeCartogram(dataset);
	  clearInterval(cartogramComputeTimer);
	  cartogramComputeTimer = setInterval(function () {
	    var iterated = _Canvas2.default.iterateCartogram(dataset.geography);
	    if (iterated) {
	      _Canvas2.default.updateTilesFromMetrics();
	    }
	  }, 1000.0 / CARTOGRAM_COMPUTE_FPS);
	}

	function updateUi() {
	  _Ui2.default.setTiles(_Canvas2.default.getGrid().getTiles());
	  _Ui2.default.render();
	}

	function loadTopoJson(topoJson) {
	  clearInterval(cartogramComputeTimer);
	  importing = true;

	  var _importer$fromTopoJso = _Importer2.default.fromTopoJson(topoJson);

	  var tiles = _importer$fromTopoJso.tiles;
	  var metricPerTile = _importer$fromTopoJso.metricPerTile;
	  var geography = _importer$fromTopoJso.geography;

	  var dataset = _DatasetResource2.default.buildDatasetFromTiles(tiles);
	  _Ui2.default.setGeography(geography);
	  _Ui2.default.setSelectedDataset(dataset);
	  _Metrics2.default.metricPerTile = metricPerTile;
	  _Canvas2.default.importTiles(tiles);
	  updateUi();
	}

	function selectGeography(geography) {
	  /**
	  * Updates ui with matching geo data (list of tilegrams, list of datasets).
	  * Update ui and canvas with the matching geoCodeHash for the current geography. This is used
	  * in the hexMetrics component and to render the labels on canvas.
	  * Loads the first tilegram associated with the geography if it exists, else loads the first
	  * dataset.
	  * NB: ui.selectTilegramGenerateOption is loaded _after_ the dataset is updated to prevent error
	  * on first load.
	  */
	  importing = false;
	  var datasets = _DatasetResource2.default.getDatasetsByGeography(geography);
	  var tilegrams = _TilegramResource2.default.getTilegramsByGeography(geography);
	  var geoCodeToName = _GeographyResource2.default.getGeoCodeHash(geography);
	  _Ui2.default.setGeography(geography);
	  _Ui2.default.setDatasetLabels(datasets.map(function (dataset) {
	    return dataset.label;
	  }));
	  _Ui2.default.setTilegramLabels(tilegrams.map(function (tilegram) {
	    return tilegram.label;
	  }));
	  _Canvas2.default.setGeoCodeToName(geoCodeToName);
	  if (tilegrams.length) {
	    loadTopoJson(tilegrams[0].topoJson);
	    _Ui2.default.selectTilegramGenerateOption('import');
	  } else {
	    selectDataset(geography, 0);
	    _Ui2.default.selectTilegramGenerateOption('generate');
	  }
	}

	function confirmNavigation(e) {
	  // most browsers won't let you display custom text but have something like this anyway
	  var message = 'Are you sure you want to leave this page? You will lose any unsaved work.';
	  e.returnValue = message;
	  return message;
	}

	function init() {
	  // wire up callbacks
	  _Canvas2.default.getGrid().onChange(function () {
	    return updateUi();
	  });
	  _Canvas2.default.getGrid().setUiEditingCallback(function () {
	    return _Ui2.default.setEditingTrue();
	  });
	  _Ui2.default.setAddTileCallback(function (id) {
	    return _Canvas2.default.getGrid().onAddTileMouseDown(id);
	  });
	  _Ui2.default.setDatasetSelectedCallback(function (geography, index) {
	    return selectDataset(geography, index);
	  });
	  _Ui2.default.setTilegramSelectedCallback(function (geography, index) {
	    var tilegram = _TilegramResource2.default.getTilegram(geography, index);
	    if (tilegram) {
	      loadTopoJson(_TilegramResource2.default.getTilegram(geography, index));
	    }
	  });
	  _Ui2.default.setCustomDatasetCallback(function (geography, csv) {
	    return selectDataset(geography, null, csv);
	  });
	  _Ui2.default.setHightlightCallback(function (id) {
	    return _Canvas2.default.getGrid().onHighlightGeo(id);
	  });
	  _Ui2.default.setUnhighlightCallback(function () {
	    return _Canvas2.default.getGrid().resetHighlightedGeo();
	  });
	  _Ui2.default.setResolutionChangedCallback(function (metricPerTile, sumMetrics) {
	    if (importing) {
	      return;
	    }
	    _Metrics2.default.metricPerTile = metricPerTile;
	    _Metrics2.default.sumMetrics = sumMetrics;
	    _Canvas2.default.updateTilesFromMetrics();
	  });
	  _Ui2.default.setUnsavedChangesCallback(function () {
	    return _Canvas2.default.getGrid().checkForEdits();
	  });
	  _Ui2.default.setResetUnsavedChangesCallback(function () {
	    return _Canvas2.default.getGrid().resetEdits();
	  });
	  _Ui2.default.setExportCallback(function (geography) {
	    var json = _Exporter2.default.toTopoJson(_Canvas2.default.getGrid().getTiles(), _Metrics2.default.metricPerTile, geography);
	    (0, _utils.startDownload)({
	      filename: 'tiles.topo.json',
	      mimeType: 'text/plain',
	      content: JSON.stringify(json)
	    });
	  });
	  _Ui2.default.setExportSvgCallback(function (geography) {
	    var svg = _Exporter2.default.toSvg(_Canvas2.default.getGrid().getTiles(), geography);
	    (0, _utils.startDownload)({
	      filename: 'tiles.svg',
	      mimeType: 'image/svg+xml',
	      content: svg
	    });
	  });
	  _Ui2.default.setImportCallback(loadTopoJson);
	  _Ui2.default.setGeographySelectCallback(selectGeography);

	  selectGeography(defaultGeography);

	  if (!(0, _utils.isDevEnvironment)()) {
	    window.addEventListener('beforeunload', confirmNavigation);
	  }
	}

	function resize() {
	  (0, _constants.updateCanvasSize)();
	  _Canvas2.default.resize();
	  _GridGeometry2.default.resize();
	  _Canvas2.default.getMap().updatePreProjection();
	}
	window.onresize = resize;
	resize();

	// Ignore ctrl-Z altogether
	document.addEventListener('keydown', function (event) {
	  if (event.metaKey && event.key === 'z') {
	    event.preventDefault();
	  }
	});

	init();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// THIS FILE IS GENERATED - DO NOT EDIT!
	/*!mobile-detect v1.3.5 2016-11-14*/
	/*global module:false, define:false*/
	/*jshint latedef:false*/
	/*!@license Copyright 2013, Heinrich Goebl, License: MIT, see https://github.com/hgoebl/mobile-detect.js*/
	(function (define, undefined) {
	define(function () {
	    'use strict';

	    var impl = {};

	    impl.mobileDetectRules = {
	    "phones": {
	        "iPhone": "\\biPhone\\b|\\biPod\\b",
	        "BlackBerry": "BlackBerry|\\bBB10\\b|rim[0-9]+",
	        "HTC": "HTC|HTC.*(Sensation|Evo|Vision|Explorer|6800|8100|8900|A7272|S510e|C110e|Legend|Desire|T8282)|APX515CKT|Qtek9090|APA9292KT|HD_mini|Sensation.*Z710e|PG86100|Z715e|Desire.*(A8181|HD)|ADR6200|ADR6400L|ADR6425|001HT|Inspire 4G|Android.*\\bEVO\\b|T-Mobile G1|Z520m",
	        "Nexus": "Nexus One|Nexus S|Galaxy.*Nexus|Android.*Nexus.*Mobile|Nexus 4|Nexus 5|Nexus 6",
	        "Dell": "Dell.*Streak|Dell.*Aero|Dell.*Venue|DELL.*Venue Pro|Dell Flash|Dell Smoke|Dell Mini 3iX|XCD28|XCD35|\\b001DL\\b|\\b101DL\\b|\\bGS01\\b",
	        "Motorola": "Motorola|DROIDX|DROID BIONIC|\\bDroid\\b.*Build|Android.*Xoom|HRI39|MOT-|A1260|A1680|A555|A853|A855|A953|A955|A956|Motorola.*ELECTRIFY|Motorola.*i1|i867|i940|MB200|MB300|MB501|MB502|MB508|MB511|MB520|MB525|MB526|MB611|MB612|MB632|MB810|MB855|MB860|MB861|MB865|MB870|ME501|ME502|ME511|ME525|ME600|ME632|ME722|ME811|ME860|ME863|ME865|MT620|MT710|MT716|MT720|MT810|MT870|MT917|Motorola.*TITANIUM|WX435|WX445|XT300|XT301|XT311|XT316|XT317|XT319|XT320|XT390|XT502|XT530|XT531|XT532|XT535|XT603|XT610|XT611|XT615|XT681|XT701|XT702|XT711|XT720|XT800|XT806|XT860|XT862|XT875|XT882|XT883|XT894|XT901|XT907|XT909|XT910|XT912|XT928|XT926|XT915|XT919|XT925|XT1021|\\bMoto E\\b",
	        "Samsung": "\\bSamsung\\b|SM-G9250|GT-19300|SGH-I337|BGT-S5230|GT-B2100|GT-B2700|GT-B2710|GT-B3210|GT-B3310|GT-B3410|GT-B3730|GT-B3740|GT-B5510|GT-B5512|GT-B5722|GT-B6520|GT-B7300|GT-B7320|GT-B7330|GT-B7350|GT-B7510|GT-B7722|GT-B7800|GT-C3010|GT-C3011|GT-C3060|GT-C3200|GT-C3212|GT-C3212I|GT-C3262|GT-C3222|GT-C3300|GT-C3300K|GT-C3303|GT-C3303K|GT-C3310|GT-C3322|GT-C3330|GT-C3350|GT-C3500|GT-C3510|GT-C3530|GT-C3630|GT-C3780|GT-C5010|GT-C5212|GT-C6620|GT-C6625|GT-C6712|GT-E1050|GT-E1070|GT-E1075|GT-E1080|GT-E1081|GT-E1085|GT-E1087|GT-E1100|GT-E1107|GT-E1110|GT-E1120|GT-E1125|GT-E1130|GT-E1160|GT-E1170|GT-E1175|GT-E1180|GT-E1182|GT-E1200|GT-E1210|GT-E1225|GT-E1230|GT-E1390|GT-E2100|GT-E2120|GT-E2121|GT-E2152|GT-E2220|GT-E2222|GT-E2230|GT-E2232|GT-E2250|GT-E2370|GT-E2550|GT-E2652|GT-E3210|GT-E3213|GT-I5500|GT-I5503|GT-I5700|GT-I5800|GT-I5801|GT-I6410|GT-I6420|GT-I7110|GT-I7410|GT-I7500|GT-I8000|GT-I8150|GT-I8160|GT-I8190|GT-I8320|GT-I8330|GT-I8350|GT-I8530|GT-I8700|GT-I8703|GT-I8910|GT-I9000|GT-I9001|GT-I9003|GT-I9010|GT-I9020|GT-I9023|GT-I9070|GT-I9082|GT-I9100|GT-I9103|GT-I9220|GT-I9250|GT-I9300|GT-I9305|GT-I9500|GT-I9505|GT-M3510|GT-M5650|GT-M7500|GT-M7600|GT-M7603|GT-M8800|GT-M8910|GT-N7000|GT-S3110|GT-S3310|GT-S3350|GT-S3353|GT-S3370|GT-S3650|GT-S3653|GT-S3770|GT-S3850|GT-S5210|GT-S5220|GT-S5229|GT-S5230|GT-S5233|GT-S5250|GT-S5253|GT-S5260|GT-S5263|GT-S5270|GT-S5300|GT-S5330|GT-S5350|GT-S5360|GT-S5363|GT-S5369|GT-S5380|GT-S5380D|GT-S5560|GT-S5570|GT-S5600|GT-S5603|GT-S5610|GT-S5620|GT-S5660|GT-S5670|GT-S5690|GT-S5750|GT-S5780|GT-S5830|GT-S5839|GT-S6102|GT-S6500|GT-S7070|GT-S7200|GT-S7220|GT-S7230|GT-S7233|GT-S7250|GT-S7500|GT-S7530|GT-S7550|GT-S7562|GT-S7710|GT-S8000|GT-S8003|GT-S8500|GT-S8530|GT-S8600|SCH-A310|SCH-A530|SCH-A570|SCH-A610|SCH-A630|SCH-A650|SCH-A790|SCH-A795|SCH-A850|SCH-A870|SCH-A890|SCH-A930|SCH-A950|SCH-A970|SCH-A990|SCH-I100|SCH-I110|SCH-I400|SCH-I405|SCH-I500|SCH-I510|SCH-I515|SCH-I600|SCH-I730|SCH-I760|SCH-I770|SCH-I830|SCH-I910|SCH-I920|SCH-I959|SCH-LC11|SCH-N150|SCH-N300|SCH-R100|SCH-R300|SCH-R351|SCH-R400|SCH-R410|SCH-T300|SCH-U310|SCH-U320|SCH-U350|SCH-U360|SCH-U365|SCH-U370|SCH-U380|SCH-U410|SCH-U430|SCH-U450|SCH-U460|SCH-U470|SCH-U490|SCH-U540|SCH-U550|SCH-U620|SCH-U640|SCH-U650|SCH-U660|SCH-U700|SCH-U740|SCH-U750|SCH-U810|SCH-U820|SCH-U900|SCH-U940|SCH-U960|SCS-26UC|SGH-A107|SGH-A117|SGH-A127|SGH-A137|SGH-A157|SGH-A167|SGH-A177|SGH-A187|SGH-A197|SGH-A227|SGH-A237|SGH-A257|SGH-A437|SGH-A517|SGH-A597|SGH-A637|SGH-A657|SGH-A667|SGH-A687|SGH-A697|SGH-A707|SGH-A717|SGH-A727|SGH-A737|SGH-A747|SGH-A767|SGH-A777|SGH-A797|SGH-A817|SGH-A827|SGH-A837|SGH-A847|SGH-A867|SGH-A877|SGH-A887|SGH-A897|SGH-A927|SGH-B100|SGH-B130|SGH-B200|SGH-B220|SGH-C100|SGH-C110|SGH-C120|SGH-C130|SGH-C140|SGH-C160|SGH-C170|SGH-C180|SGH-C200|SGH-C207|SGH-C210|SGH-C225|SGH-C230|SGH-C417|SGH-C450|SGH-D307|SGH-D347|SGH-D357|SGH-D407|SGH-D415|SGH-D780|SGH-D807|SGH-D980|SGH-E105|SGH-E200|SGH-E315|SGH-E316|SGH-E317|SGH-E335|SGH-E590|SGH-E635|SGH-E715|SGH-E890|SGH-F300|SGH-F480|SGH-I200|SGH-I300|SGH-I320|SGH-I550|SGH-I577|SGH-I600|SGH-I607|SGH-I617|SGH-I627|SGH-I637|SGH-I677|SGH-I700|SGH-I717|SGH-I727|SGH-i747M|SGH-I777|SGH-I780|SGH-I827|SGH-I847|SGH-I857|SGH-I896|SGH-I897|SGH-I900|SGH-I907|SGH-I917|SGH-I927|SGH-I937|SGH-I997|SGH-J150|SGH-J200|SGH-L170|SGH-L700|SGH-M110|SGH-M150|SGH-M200|SGH-N105|SGH-N500|SGH-N600|SGH-N620|SGH-N625|SGH-N700|SGH-N710|SGH-P107|SGH-P207|SGH-P300|SGH-P310|SGH-P520|SGH-P735|SGH-P777|SGH-Q105|SGH-R210|SGH-R220|SGH-R225|SGH-S105|SGH-S307|SGH-T109|SGH-T119|SGH-T139|SGH-T209|SGH-T219|SGH-T229|SGH-T239|SGH-T249|SGH-T259|SGH-T309|SGH-T319|SGH-T329|SGH-T339|SGH-T349|SGH-T359|SGH-T369|SGH-T379|SGH-T409|SGH-T429|SGH-T439|SGH-T459|SGH-T469|SGH-T479|SGH-T499|SGH-T509|SGH-T519|SGH-T539|SGH-T559|SGH-T589|SGH-T609|SGH-T619|SGH-T629|SGH-T639|SGH-T659|SGH-T669|SGH-T679|SGH-T709|SGH-T719|SGH-T729|SGH-T739|SGH-T746|SGH-T749|SGH-T759|SGH-T769|SGH-T809|SGH-T819|SGH-T839|SGH-T919|SGH-T929|SGH-T939|SGH-T959|SGH-T989|SGH-U100|SGH-U200|SGH-U800|SGH-V205|SGH-V206|SGH-X100|SGH-X105|SGH-X120|SGH-X140|SGH-X426|SGH-X427|SGH-X475|SGH-X495|SGH-X497|SGH-X507|SGH-X600|SGH-X610|SGH-X620|SGH-X630|SGH-X700|SGH-X820|SGH-X890|SGH-Z130|SGH-Z150|SGH-Z170|SGH-ZX10|SGH-ZX20|SHW-M110|SPH-A120|SPH-A400|SPH-A420|SPH-A460|SPH-A500|SPH-A560|SPH-A600|SPH-A620|SPH-A660|SPH-A700|SPH-A740|SPH-A760|SPH-A790|SPH-A800|SPH-A820|SPH-A840|SPH-A880|SPH-A900|SPH-A940|SPH-A960|SPH-D600|SPH-D700|SPH-D710|SPH-D720|SPH-I300|SPH-I325|SPH-I330|SPH-I350|SPH-I500|SPH-I600|SPH-I700|SPH-L700|SPH-M100|SPH-M220|SPH-M240|SPH-M300|SPH-M305|SPH-M320|SPH-M330|SPH-M350|SPH-M360|SPH-M370|SPH-M380|SPH-M510|SPH-M540|SPH-M550|SPH-M560|SPH-M570|SPH-M580|SPH-M610|SPH-M620|SPH-M630|SPH-M800|SPH-M810|SPH-M850|SPH-M900|SPH-M910|SPH-M920|SPH-M930|SPH-N100|SPH-N200|SPH-N240|SPH-N300|SPH-N400|SPH-Z400|SWC-E100|SCH-i909|GT-N7100|GT-N7105|SCH-I535|SM-N900A|SGH-I317|SGH-T999L|GT-S5360B|GT-I8262|GT-S6802|GT-S6312|GT-S6310|GT-S5312|GT-S5310|GT-I9105|GT-I8510|GT-S6790N|SM-G7105|SM-N9005|GT-S5301|GT-I9295|GT-I9195|SM-C101|GT-S7392|GT-S7560|GT-B7610|GT-I5510|GT-S7582|GT-S7530E|GT-I8750|SM-G9006V|SM-G9008V|SM-G9009D|SM-G900A|SM-G900D|SM-G900F|SM-G900H|SM-G900I|SM-G900J|SM-G900K|SM-G900L|SM-G900M|SM-G900P|SM-G900R4|SM-G900S|SM-G900T|SM-G900V|SM-G900W8|SHV-E160K|SCH-P709|SCH-P729|SM-T2558|GT-I9205|SM-G9350|SM-J120F",
	        "LG": "\\bLG\\b;|LG[- ]?(C800|C900|E400|E610|E900|E-900|F160|F180K|F180L|F180S|730|855|L160|LS740|LS840|LS970|LU6200|MS690|MS695|MS770|MS840|MS870|MS910|P500|P700|P705|VM696|AS680|AS695|AX840|C729|E970|GS505|272|C395|E739BK|E960|L55C|L75C|LS696|LS860|P769BK|P350|P500|P509|P870|UN272|US730|VS840|VS950|LN272|LN510|LS670|LS855|LW690|MN270|MN510|P509|P769|P930|UN200|UN270|UN510|UN610|US670|US740|US760|UX265|UX840|VN271|VN530|VS660|VS700|VS740|VS750|VS910|VS920|VS930|VX9200|VX11000|AX840A|LW770|P506|P925|P999|E612|D955|D802|MS323)",
	        "Sony": "SonyST|SonyLT|SonyEricsson|SonyEricssonLT15iv|LT18i|E10i|LT28h|LT26w|SonyEricssonMT27i|C5303|C6902|C6903|C6906|C6943|D2533",
	        "Asus": "Asus.*Galaxy|PadFone.*Mobile",
	        "NokiaLumia": "Lumia [0-9]{3,4}",
	        "Micromax": "Micromax.*\\b(A210|A92|A88|A72|A111|A110Q|A115|A116|A110|A90S|A26|A51|A35|A54|A25|A27|A89|A68|A65|A57|A90)\\b",
	        "Palm": "PalmSource|Palm",
	        "Vertu": "Vertu|Vertu.*Ltd|Vertu.*Ascent|Vertu.*Ayxta|Vertu.*Constellation(F|Quest)?|Vertu.*Monika|Vertu.*Signature",
	        "Pantech": "PANTECH|IM-A850S|IM-A840S|IM-A830L|IM-A830K|IM-A830S|IM-A820L|IM-A810K|IM-A810S|IM-A800S|IM-T100K|IM-A725L|IM-A780L|IM-A775C|IM-A770K|IM-A760S|IM-A750K|IM-A740S|IM-A730S|IM-A720L|IM-A710K|IM-A690L|IM-A690S|IM-A650S|IM-A630K|IM-A600S|VEGA PTL21|PT003|P8010|ADR910L|P6030|P6020|P9070|P4100|P9060|P5000|CDM8992|TXT8045|ADR8995|IS11PT|P2030|P6010|P8000|PT002|IS06|CDM8999|P9050|PT001|TXT8040|P2020|P9020|P2000|P7040|P7000|C790",
	        "Fly": "IQ230|IQ444|IQ450|IQ440|IQ442|IQ441|IQ245|IQ256|IQ236|IQ255|IQ235|IQ245|IQ275|IQ240|IQ285|IQ280|IQ270|IQ260|IQ250",
	        "Wiko": "KITE 4G|HIGHWAY|GETAWAY|STAIRWAY|DARKSIDE|DARKFULL|DARKNIGHT|DARKMOON|SLIDE|WAX 4G|RAINBOW|BLOOM|SUNSET|GOA(?!nna)|LENNY|BARRY|IGGY|OZZY|CINK FIVE|CINK PEAX|CINK PEAX 2|CINK SLIM|CINK SLIM 2|CINK +|CINK KING|CINK PEAX|CINK SLIM|SUBLIM",
	        "iMobile": "i-mobile (IQ|i-STYLE|idea|ZAA|Hitz)",
	        "SimValley": "\\b(SP-80|XT-930|SX-340|XT-930|SX-310|SP-360|SP60|SPT-800|SP-120|SPT-800|SP-140|SPX-5|SPX-8|SP-100|SPX-8|SPX-12)\\b",
	        "Wolfgang": "AT-B24D|AT-AS50HD|AT-AS40W|AT-AS55HD|AT-AS45q2|AT-B26D|AT-AS50Q",
	        "Alcatel": "Alcatel",
	        "Nintendo": "Nintendo 3DS",
	        "Amoi": "Amoi",
	        "INQ": "INQ",
	        "GenericPhone": "Tapatalk|PDA;|SAGEM|\\bmmp\\b|pocket|\\bpsp\\b|symbian|Smartphone|smartfon|treo|up.browser|up.link|vodafone|\\bwap\\b|nokia|Series40|Series60|S60|SonyEricsson|N900|MAUI.*WAP.*Browser"
	    },
	    "tablets": {
	        "iPad": "iPad|iPad.*Mobile",
	        "NexusTablet": "Android.*Nexus[\\s]+(7|9|10)",
	        "SamsungTablet": "SAMSUNG.*Tablet|Galaxy.*Tab|SC-01C|GT-P1000|GT-P1003|GT-P1010|GT-P3105|GT-P6210|GT-P6800|GT-P6810|GT-P7100|GT-P7300|GT-P7310|GT-P7500|GT-P7510|SCH-I800|SCH-I815|SCH-I905|SGH-I957|SGH-I987|SGH-T849|SGH-T859|SGH-T869|SPH-P100|GT-P3100|GT-P3108|GT-P3110|GT-P5100|GT-P5110|GT-P6200|GT-P7320|GT-P7511|GT-N8000|GT-P8510|SGH-I497|SPH-P500|SGH-T779|SCH-I705|SCH-I915|GT-N8013|GT-P3113|GT-P5113|GT-P8110|GT-N8010|GT-N8005|GT-N8020|GT-P1013|GT-P6201|GT-P7501|GT-N5100|GT-N5105|GT-N5110|SHV-E140K|SHV-E140L|SHV-E140S|SHV-E150S|SHV-E230K|SHV-E230L|SHV-E230S|SHW-M180K|SHW-M180L|SHW-M180S|SHW-M180W|SHW-M300W|SHW-M305W|SHW-M380K|SHW-M380S|SHW-M380W|SHW-M430W|SHW-M480K|SHW-M480S|SHW-M480W|SHW-M485W|SHW-M486W|SHW-M500W|GT-I9228|SCH-P739|SCH-I925|GT-I9200|GT-P5200|GT-P5210|GT-P5210X|SM-T311|SM-T310|SM-T310X|SM-T210|SM-T210R|SM-T211|SM-P600|SM-P601|SM-P605|SM-P900|SM-P901|SM-T217|SM-T217A|SM-T217S|SM-P6000|SM-T3100|SGH-I467|XE500|SM-T110|GT-P5220|GT-I9200X|GT-N5110X|GT-N5120|SM-P905|SM-T111|SM-T2105|SM-T315|SM-T320|SM-T320X|SM-T321|SM-T520|SM-T525|SM-T530NU|SM-T230NU|SM-T330NU|SM-T900|XE500T1C|SM-P605V|SM-P905V|SM-T337V|SM-T537V|SM-T707V|SM-T807V|SM-P600X|SM-P900X|SM-T210X|SM-T230|SM-T230X|SM-T325|GT-P7503|SM-T531|SM-T330|SM-T530|SM-T705|SM-T705C|SM-T535|SM-T331|SM-T800|SM-T700|SM-T537|SM-T807|SM-P907A|SM-T337A|SM-T537A|SM-T707A|SM-T807A|SM-T237|SM-T807P|SM-P607T|SM-T217T|SM-T337T|SM-T807T|SM-T116NQ|SM-P550|SM-T350|SM-T550|SM-T9000|SM-P9000|SM-T705Y|SM-T805|GT-P3113|SM-T710|SM-T810|SM-T815|SM-T360|SM-T533|SM-T113|SM-T335|SM-T715|SM-T560|SM-T670|SM-T677|SM-T377|SM-T567|SM-T357T|SM-T555|SM-T561|SM-T713|SM-T719|SM-T813|SM-T819|SM-T580|SM-T355Y|SM-T280",
	        "Kindle": "Kindle|Silk.*Accelerated|Android.*\\b(KFOT|KFTT|KFJWI|KFJWA|KFOTE|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|WFJWAE|KFSAWA|KFSAWI|KFASWI|KFARWI)\\b",
	        "SurfaceTablet": "Windows NT [0-9.]+; ARM;.*(Tablet|ARMBJS)",
	        "HPTablet": "HP Slate (7|8|10)|HP ElitePad 900|hp-tablet|EliteBook.*Touch|HP 8|Slate 21|HP SlateBook 10",
	        "AsusTablet": "^.*PadFone((?!Mobile).)*$|Transformer|TF101|TF101G|TF300T|TF300TG|TF300TL|TF700T|TF700KL|TF701T|TF810C|ME171|ME301T|ME302C|ME371MG|ME370T|ME372MG|ME172V|ME173X|ME400C|Slider SL101|\\bK00F\\b|\\bK00C\\b|\\bK00E\\b|\\bK00L\\b|TX201LA|ME176C|ME102A|\\bM80TA\\b|ME372CL|ME560CG|ME372CG|ME302KL| K010 | K011 | K017 | K01E |ME572C|ME103K|ME170C|ME171C|\\bME70C\\b|ME581C|ME581CL|ME8510C|ME181C|P01Y|PO1MA|P01Z",
	        "BlackBerryTablet": "PlayBook|RIM Tablet",
	        "HTCtablet": "HTC_Flyer_P512|HTC Flyer|HTC Jetstream|HTC-P715a|HTC EVO View 4G|PG41200|PG09410",
	        "MotorolaTablet": "xoom|sholest|MZ615|MZ605|MZ505|MZ601|MZ602|MZ603|MZ604|MZ606|MZ607|MZ608|MZ609|MZ615|MZ616|MZ617",
	        "NookTablet": "Android.*Nook|NookColor|nook browser|BNRV200|BNRV200A|BNTV250|BNTV250A|BNTV400|BNTV600|LogicPD Zoom2",
	        "AcerTablet": "Android.*; \\b(A100|A101|A110|A200|A210|A211|A500|A501|A510|A511|A700|A701|W500|W500P|W501|W501P|W510|W511|W700|G100|G100W|B1-A71|B1-710|B1-711|A1-810|A1-811|A1-830)\\b|W3-810|\\bA3-A10\\b|\\bA3-A11\\b|\\bA3-A20\\b|\\bA3-A30",
	        "ToshibaTablet": "Android.*(AT100|AT105|AT200|AT205|AT270|AT275|AT300|AT305|AT1S5|AT500|AT570|AT700|AT830)|TOSHIBA.*FOLIO",
	        "LGTablet": "\\bL-06C|LG-V909|LG-V900|LG-V700|LG-V510|LG-V500|LG-V410|LG-V400|LG-VK810\\b",
	        "FujitsuTablet": "Android.*\\b(F-01D|F-02F|F-05E|F-10D|M532|Q572)\\b",
	        "PrestigioTablet": "PMP3170B|PMP3270B|PMP3470B|PMP7170B|PMP3370B|PMP3570C|PMP5870C|PMP3670B|PMP5570C|PMP5770D|PMP3970B|PMP3870C|PMP5580C|PMP5880D|PMP5780D|PMP5588C|PMP7280C|PMP7280C3G|PMP7280|PMP7880D|PMP5597D|PMP5597|PMP7100D|PER3464|PER3274|PER3574|PER3884|PER5274|PER5474|PMP5097CPRO|PMP5097|PMP7380D|PMP5297C|PMP5297C_QUAD|PMP812E|PMP812E3G|PMP812F|PMP810E|PMP880TD|PMT3017|PMT3037|PMT3047|PMT3057|PMT7008|PMT5887|PMT5001|PMT5002",
	        "LenovoTablet": "Lenovo TAB|Idea(Tab|Pad)( A1|A10| K1|)|ThinkPad([ ]+)?Tablet|YT3-X90L|YT3-X90F|YT3-X90X|Lenovo.*(S2109|S2110|S5000|S6000|K3011|A3000|A3500|A1000|A2107|A2109|A1107|A5500|A7600|B6000|B8000|B8080)(-|)(FL|F|HV|H|)",
	        "DellTablet": "Venue 11|Venue 8|Venue 7|Dell Streak 10|Dell Streak 7",
	        "YarvikTablet": "Android.*\\b(TAB210|TAB211|TAB224|TAB250|TAB260|TAB264|TAB310|TAB360|TAB364|TAB410|TAB411|TAB420|TAB424|TAB450|TAB460|TAB461|TAB464|TAB465|TAB467|TAB468|TAB07-100|TAB07-101|TAB07-150|TAB07-151|TAB07-152|TAB07-200|TAB07-201-3G|TAB07-210|TAB07-211|TAB07-212|TAB07-214|TAB07-220|TAB07-400|TAB07-485|TAB08-150|TAB08-200|TAB08-201-3G|TAB08-201-30|TAB09-100|TAB09-211|TAB09-410|TAB10-150|TAB10-201|TAB10-211|TAB10-400|TAB10-410|TAB13-201|TAB274EUK|TAB275EUK|TAB374EUK|TAB462EUK|TAB474EUK|TAB9-200)\\b",
	        "MedionTablet": "Android.*\\bOYO\\b|LIFE.*(P9212|P9514|P9516|S9512)|LIFETAB",
	        "ArnovaTablet": "97G4|AN10G2|AN7bG3|AN7fG3|AN8G3|AN8cG3|AN7G3|AN9G3|AN7dG3|AN7dG3ST|AN7dG3ChildPad|AN10bG3|AN10bG3DT|AN9G2",
	        "IntensoTablet": "INM8002KP|INM1010FP|INM805ND|Intenso Tab|TAB1004",
	        "IRUTablet": "M702pro",
	        "MegafonTablet": "MegaFon V9|\\bZTE V9\\b|Android.*\\bMT7A\\b",
	        "EbodaTablet": "E-Boda (Supreme|Impresspeed|Izzycomm|Essential)",
	        "AllViewTablet": "Allview.*(Viva|Alldro|City|Speed|All TV|Frenzy|Quasar|Shine|TX1|AX1|AX2)",
	        "ArchosTablet": "\\b(101G9|80G9|A101IT)\\b|Qilive 97R|Archos5|\\bARCHOS (70|79|80|90|97|101|FAMILYPAD|)(b|)(G10| Cobalt| TITANIUM(HD|)| Xenon| Neon|XSK| 2| XS 2| PLATINUM| CARBON|GAMEPAD)\\b",
	        "AinolTablet": "NOVO7|NOVO8|NOVO10|Novo7Aurora|Novo7Basic|NOVO7PALADIN|novo9-Spark",
	        "NokiaLumiaTablet": "Lumia 2520",
	        "SonyTablet": "Sony.*Tablet|Xperia Tablet|Sony Tablet S|SO-03E|SGPT12|SGPT13|SGPT114|SGPT121|SGPT122|SGPT123|SGPT111|SGPT112|SGPT113|SGPT131|SGPT132|SGPT133|SGPT211|SGPT212|SGPT213|SGP311|SGP312|SGP321|EBRD1101|EBRD1102|EBRD1201|SGP351|SGP341|SGP511|SGP512|SGP521|SGP541|SGP551|SGP621|SGP612|SOT31",
	        "PhilipsTablet": "\\b(PI2010|PI3000|PI3100|PI3105|PI3110|PI3205|PI3210|PI3900|PI4010|PI7000|PI7100)\\b",
	        "CubeTablet": "Android.*(K8GT|U9GT|U10GT|U16GT|U17GT|U18GT|U19GT|U20GT|U23GT|U30GT)|CUBE U8GT",
	        "CobyTablet": "MID1042|MID1045|MID1125|MID1126|MID7012|MID7014|MID7015|MID7034|MID7035|MID7036|MID7042|MID7048|MID7127|MID8042|MID8048|MID8127|MID9042|MID9740|MID9742|MID7022|MID7010",
	        "MIDTablet": "M9701|M9000|M9100|M806|M1052|M806|T703|MID701|MID713|MID710|MID727|MID760|MID830|MID728|MID933|MID125|MID810|MID732|MID120|MID930|MID800|MID731|MID900|MID100|MID820|MID735|MID980|MID130|MID833|MID737|MID960|MID135|MID860|MID736|MID140|MID930|MID835|MID733|MID4X10",
	        "MSITablet": "MSI \\b(Primo 73K|Primo 73L|Primo 81L|Primo 77|Primo 93|Primo 75|Primo 76|Primo 73|Primo 81|Primo 91|Primo 90|Enjoy 71|Enjoy 7|Enjoy 10)\\b",
	        "SMiTTablet": "Android.*(\\bMID\\b|MID-560|MTV-T1200|MTV-PND531|MTV-P1101|MTV-PND530)",
	        "RockChipTablet": "Android.*(RK2818|RK2808A|RK2918|RK3066)|RK2738|RK2808A",
	        "FlyTablet": "IQ310|Fly Vision",
	        "bqTablet": "Android.*(bq)?.*(Elcano|Curie|Edison|Maxwell|Kepler|Pascal|Tesla|Hypatia|Platon|Newton|Livingstone|Cervantes|Avant|Aquaris [E|M]10)|Maxwell.*Lite|Maxwell.*Plus",
	        "HuaweiTablet": "MediaPad|MediaPad 7 Youth|IDEOS S7|S7-201c|S7-202u|S7-101|S7-103|S7-104|S7-105|S7-106|S7-201|S7-Slim",
	        "NecTablet": "\\bN-06D|\\bN-08D",
	        "PantechTablet": "Pantech.*P4100",
	        "BronchoTablet": "Broncho.*(N701|N708|N802|a710)",
	        "VersusTablet": "TOUCHPAD.*[78910]|\\bTOUCHTAB\\b",
	        "ZyncTablet": "z1000|Z99 2G|z99|z930|z999|z990|z909|Z919|z900",
	        "PositivoTablet": "TB07STA|TB10STA|TB07FTA|TB10FTA",
	        "NabiTablet": "Android.*\\bNabi",
	        "KoboTablet": "Kobo Touch|\\bK080\\b|\\bVox\\b Build|\\bArc\\b Build",
	        "DanewTablet": "DSlide.*\\b(700|701R|702|703R|704|802|970|971|972|973|974|1010|1012)\\b",
	        "TexetTablet": "NaviPad|TB-772A|TM-7045|TM-7055|TM-9750|TM-7016|TM-7024|TM-7026|TM-7041|TM-7043|TM-7047|TM-8041|TM-9741|TM-9747|TM-9748|TM-9751|TM-7022|TM-7021|TM-7020|TM-7011|TM-7010|TM-7023|TM-7025|TM-7037W|TM-7038W|TM-7027W|TM-9720|TM-9725|TM-9737W|TM-1020|TM-9738W|TM-9740|TM-9743W|TB-807A|TB-771A|TB-727A|TB-725A|TB-719A|TB-823A|TB-805A|TB-723A|TB-715A|TB-707A|TB-705A|TB-709A|TB-711A|TB-890HD|TB-880HD|TB-790HD|TB-780HD|TB-770HD|TB-721HD|TB-710HD|TB-434HD|TB-860HD|TB-840HD|TB-760HD|TB-750HD|TB-740HD|TB-730HD|TB-722HD|TB-720HD|TB-700HD|TB-500HD|TB-470HD|TB-431HD|TB-430HD|TB-506|TB-504|TB-446|TB-436|TB-416|TB-146SE|TB-126SE",
	        "PlaystationTablet": "Playstation.*(Portable|Vita)",
	        "TrekstorTablet": "ST10416-1|VT10416-1|ST70408-1|ST702xx-1|ST702xx-2|ST80208|ST97216|ST70104-2|VT10416-2|ST10216-2A|SurfTab",
	        "PyleAudioTablet": "\\b(PTBL10CEU|PTBL10C|PTBL72BC|PTBL72BCEU|PTBL7CEU|PTBL7C|PTBL92BC|PTBL92BCEU|PTBL9CEU|PTBL9CUK|PTBL9C)\\b",
	        "AdvanTablet": "Android.* \\b(E3A|T3X|T5C|T5B|T3E|T3C|T3B|T1J|T1F|T2A|T1H|T1i|E1C|T1-E|T5-A|T4|E1-B|T2Ci|T1-B|T1-D|O1-A|E1-A|T1-A|T3A|T4i)\\b ",
	        "DanyTechTablet": "Genius Tab G3|Genius Tab S2|Genius Tab Q3|Genius Tab G4|Genius Tab Q4|Genius Tab G-II|Genius TAB GII|Genius TAB GIII|Genius Tab S1",
	        "GalapadTablet": "Android.*\\bG1\\b",
	        "MicromaxTablet": "Funbook|Micromax.*\\b(P250|P560|P360|P362|P600|P300|P350|P500|P275)\\b",
	        "KarbonnTablet": "Android.*\\b(A39|A37|A34|ST8|ST10|ST7|Smart Tab3|Smart Tab2)\\b",
	        "AllFineTablet": "Fine7 Genius|Fine7 Shine|Fine7 Air|Fine8 Style|Fine9 More|Fine10 Joy|Fine11 Wide",
	        "PROSCANTablet": "\\b(PEM63|PLT1023G|PLT1041|PLT1044|PLT1044G|PLT1091|PLT4311|PLT4311PL|PLT4315|PLT7030|PLT7033|PLT7033D|PLT7035|PLT7035D|PLT7044K|PLT7045K|PLT7045KB|PLT7071KG|PLT7072|PLT7223G|PLT7225G|PLT7777G|PLT7810K|PLT7849G|PLT7851G|PLT7852G|PLT8015|PLT8031|PLT8034|PLT8036|PLT8080K|PLT8082|PLT8088|PLT8223G|PLT8234G|PLT8235G|PLT8816K|PLT9011|PLT9045K|PLT9233G|PLT9735|PLT9760G|PLT9770G)\\b",
	        "YONESTablet": "BQ1078|BC1003|BC1077|RK9702|BC9730|BC9001|IT9001|BC7008|BC7010|BC708|BC728|BC7012|BC7030|BC7027|BC7026",
	        "ChangJiaTablet": "TPC7102|TPC7103|TPC7105|TPC7106|TPC7107|TPC7201|TPC7203|TPC7205|TPC7210|TPC7708|TPC7709|TPC7712|TPC7110|TPC8101|TPC8103|TPC8105|TPC8106|TPC8203|TPC8205|TPC8503|TPC9106|TPC9701|TPC97101|TPC97103|TPC97105|TPC97106|TPC97111|TPC97113|TPC97203|TPC97603|TPC97809|TPC97205|TPC10101|TPC10103|TPC10106|TPC10111|TPC10203|TPC10205|TPC10503",
	        "GUTablet": "TX-A1301|TX-M9002|Q702|kf026",
	        "PointOfViewTablet": "TAB-P506|TAB-navi-7-3G-M|TAB-P517|TAB-P-527|TAB-P701|TAB-P703|TAB-P721|TAB-P731N|TAB-P741|TAB-P825|TAB-P905|TAB-P925|TAB-PR945|TAB-PL1015|TAB-P1025|TAB-PI1045|TAB-P1325|TAB-PROTAB[0-9]+|TAB-PROTAB25|TAB-PROTAB26|TAB-PROTAB27|TAB-PROTAB26XL|TAB-PROTAB2-IPS9|TAB-PROTAB30-IPS9|TAB-PROTAB25XXL|TAB-PROTAB26-IPS10|TAB-PROTAB30-IPS10",
	        "OvermaxTablet": "OV-(SteelCore|NewBase|Basecore|Baseone|Exellen|Quattor|EduTab|Solution|ACTION|BasicTab|TeddyTab|MagicTab|Stream|TB-08|TB-09)",
	        "HCLTablet": "HCL.*Tablet|Connect-3G-2.0|Connect-2G-2.0|ME Tablet U1|ME Tablet U2|ME Tablet G1|ME Tablet X1|ME Tablet Y2|ME Tablet Sync",
	        "DPSTablet": "DPS Dream 9|DPS Dual 7",
	        "VistureTablet": "V97 HD|i75 3G|Visture V4( HD)?|Visture V5( HD)?|Visture V10",
	        "CrestaTablet": "CTP(-)?810|CTP(-)?818|CTP(-)?828|CTP(-)?838|CTP(-)?888|CTP(-)?978|CTP(-)?980|CTP(-)?987|CTP(-)?988|CTP(-)?989",
	        "MediatekTablet": "\\bMT8125|MT8389|MT8135|MT8377\\b",
	        "ConcordeTablet": "Concorde([ ]+)?Tab|ConCorde ReadMan",
	        "GoCleverTablet": "GOCLEVER TAB|A7GOCLEVER|M1042|M7841|M742|R1042BK|R1041|TAB A975|TAB A7842|TAB A741|TAB A741L|TAB M723G|TAB M721|TAB A1021|TAB I921|TAB R721|TAB I720|TAB T76|TAB R70|TAB R76.2|TAB R106|TAB R83.2|TAB M813G|TAB I721|GCTA722|TAB I70|TAB I71|TAB S73|TAB R73|TAB R74|TAB R93|TAB R75|TAB R76.1|TAB A73|TAB A93|TAB A93.2|TAB T72|TAB R83|TAB R974|TAB R973|TAB A101|TAB A103|TAB A104|TAB A104.2|R105BK|M713G|A972BK|TAB A971|TAB R974.2|TAB R104|TAB R83.3|TAB A1042",
	        "ModecomTablet": "FreeTAB 9000|FreeTAB 7.4|FreeTAB 7004|FreeTAB 7800|FreeTAB 2096|FreeTAB 7.5|FreeTAB 1014|FreeTAB 1001 |FreeTAB 8001|FreeTAB 9706|FreeTAB 9702|FreeTAB 7003|FreeTAB 7002|FreeTAB 1002|FreeTAB 7801|FreeTAB 1331|FreeTAB 1004|FreeTAB 8002|FreeTAB 8014|FreeTAB 9704|FreeTAB 1003",
	        "VoninoTablet": "\\b(Argus[ _]?S|Diamond[ _]?79HD|Emerald[ _]?78E|Luna[ _]?70C|Onyx[ _]?S|Onyx[ _]?Z|Orin[ _]?HD|Orin[ _]?S|Otis[ _]?S|SpeedStar[ _]?S|Magnet[ _]?M9|Primus[ _]?94[ _]?3G|Primus[ _]?94HD|Primus[ _]?QS|Android.*\\bQ8\\b|Sirius[ _]?EVO[ _]?QS|Sirius[ _]?QS|Spirit[ _]?S)\\b",
	        "ECSTablet": "V07OT2|TM105A|S10OT1|TR10CS1",
	        "StorexTablet": "eZee[_']?(Tab|Go)[0-9]+|TabLC7|Looney Tunes Tab",
	        "VodafoneTablet": "SmartTab([ ]+)?[0-9]+|SmartTabII10|SmartTabII7|VF-1497",
	        "EssentielBTablet": "Smart[ ']?TAB[ ]+?[0-9]+|Family[ ']?TAB2",
	        "RossMoorTablet": "RM-790|RM-997|RMD-878G|RMD-974R|RMT-705A|RMT-701|RME-601|RMT-501|RMT-711",
	        "iMobileTablet": "i-mobile i-note",
	        "TolinoTablet": "tolino tab [0-9.]+|tolino shine",
	        "AudioSonicTablet": "\\bC-22Q|T7-QC|T-17B|T-17P\\b",
	        "AMPETablet": "Android.* A78 ",
	        "SkkTablet": "Android.* (SKYPAD|PHOENIX|CYCLOPS)",
	        "TecnoTablet": "TECNO P9",
	        "JXDTablet": "Android.* \\b(F3000|A3300|JXD5000|JXD3000|JXD2000|JXD300B|JXD300|S5800|S7800|S602b|S5110b|S7300|S5300|S602|S603|S5100|S5110|S601|S7100a|P3000F|P3000s|P101|P200s|P1000m|P200m|P9100|P1000s|S6600b|S908|P1000|P300|S18|S6600|S9100)\\b",
	        "iJoyTablet": "Tablet (Spirit 7|Essentia|Galatea|Fusion|Onix 7|Landa|Titan|Scooby|Deox|Stella|Themis|Argon|Unique 7|Sygnus|Hexen|Finity 7|Cream|Cream X2|Jade|Neon 7|Neron 7|Kandy|Scape|Saphyr 7|Rebel|Biox|Rebel|Rebel 8GB|Myst|Draco 7|Myst|Tab7-004|Myst|Tadeo Jones|Tablet Boing|Arrow|Draco Dual Cam|Aurix|Mint|Amity|Revolution|Finity 9|Neon 9|T9w|Amity 4GB Dual Cam|Stone 4GB|Stone 8GB|Andromeda|Silken|X2|Andromeda II|Halley|Flame|Saphyr 9,7|Touch 8|Planet|Triton|Unique 10|Hexen 10|Memphis 4GB|Memphis 8GB|Onix 10)",
	        "FX2Tablet": "FX2 PAD7|FX2 PAD10",
	        "XoroTablet": "KidsPAD 701|PAD[ ]?712|PAD[ ]?714|PAD[ ]?716|PAD[ ]?717|PAD[ ]?718|PAD[ ]?720|PAD[ ]?721|PAD[ ]?722|PAD[ ]?790|PAD[ ]?792|PAD[ ]?900|PAD[ ]?9715D|PAD[ ]?9716DR|PAD[ ]?9718DR|PAD[ ]?9719QR|PAD[ ]?9720QR|TelePAD1030|Telepad1032|TelePAD730|TelePAD731|TelePAD732|TelePAD735Q|TelePAD830|TelePAD9730|TelePAD795|MegaPAD 1331|MegaPAD 1851|MegaPAD 2151",
	        "ViewsonicTablet": "ViewPad 10pi|ViewPad 10e|ViewPad 10s|ViewPad E72|ViewPad7|ViewPad E100|ViewPad 7e|ViewSonic VB733|VB100a",
	        "OdysTablet": "LOOX|XENO10|ODYS[ -](Space|EVO|Xpress|NOON)|\\bXELIO\\b|Xelio10Pro|XELIO7PHONETAB|XELIO10EXTREME|XELIOPT2|NEO_QUAD10",
	        "CaptivaTablet": "CAPTIVA PAD",
	        "IconbitTablet": "NetTAB|NT-3702|NT-3702S|NT-3702S|NT-3603P|NT-3603P|NT-0704S|NT-0704S|NT-3805C|NT-3805C|NT-0806C|NT-0806C|NT-0909T|NT-0909T|NT-0907S|NT-0907S|NT-0902S|NT-0902S",
	        "TeclastTablet": "T98 4G|\\bP80\\b|\\bX90HD\\b|X98 Air|X98 Air 3G|\\bX89\\b|P80 3G|\\bX80h\\b|P98 Air|\\bX89HD\\b|P98 3G|\\bP90HD\\b|P89 3G|X98 3G|\\bP70h\\b|P79HD 3G|G18d 3G|\\bP79HD\\b|\\bP89s\\b|\\bA88\\b|\\bP10HD\\b|\\bP19HD\\b|G18 3G|\\bP78HD\\b|\\bA78\\b|\\bP75\\b|G17s 3G|G17h 3G|\\bP85t\\b|\\bP90\\b|\\bP11\\b|\\bP98t\\b|\\bP98HD\\b|\\bG18d\\b|\\bP85s\\b|\\bP11HD\\b|\\bP88s\\b|\\bA80HD\\b|\\bA80se\\b|\\bA10h\\b|\\bP89\\b|\\bP78s\\b|\\bG18\\b|\\bP85\\b|\\bA70h\\b|\\bA70\\b|\\bG17\\b|\\bP18\\b|\\bA80s\\b|\\bA11s\\b|\\bP88HD\\b|\\bA80h\\b|\\bP76s\\b|\\bP76h\\b|\\bP98\\b|\\bA10HD\\b|\\bP78\\b|\\bP88\\b|\\bA11\\b|\\bA10t\\b|\\bP76a\\b|\\bP76t\\b|\\bP76e\\b|\\bP85HD\\b|\\bP85a\\b|\\bP86\\b|\\bP75HD\\b|\\bP76v\\b|\\bA12\\b|\\bP75a\\b|\\bA15\\b|\\bP76Ti\\b|\\bP81HD\\b|\\bA10\\b|\\bT760VE\\b|\\bT720HD\\b|\\bP76\\b|\\bP73\\b|\\bP71\\b|\\bP72\\b|\\bT720SE\\b|\\bC520Ti\\b|\\bT760\\b|\\bT720VE\\b|T720-3GE|T720-WiFi",
	        "OndaTablet": "\\b(V975i|Vi30|VX530|V701|Vi60|V701s|Vi50|V801s|V719|Vx610w|VX610W|V819i|Vi10|VX580W|Vi10|V711s|V813|V811|V820w|V820|Vi20|V711|VI30W|V712|V891w|V972|V819w|V820w|Vi60|V820w|V711|V813s|V801|V819|V975s|V801|V819|V819|V818|V811|V712|V975m|V101w|V961w|V812|V818|V971|V971s|V919|V989|V116w|V102w|V973|Vi40)\\b[\\s]+",
	        "JaytechTablet": "TPC-PA762",
	        "BlaupunktTablet": "Endeavour 800NG|Endeavour 1010",
	        "DigmaTablet": "\\b(iDx10|iDx9|iDx8|iDx7|iDxD7|iDxD8|iDsQ8|iDsQ7|iDsQ8|iDsD10|iDnD7|3TS804H|iDsQ11|iDj7|iDs10)\\b",
	        "EvolioTablet": "ARIA_Mini_wifi|Aria[ _]Mini|Evolio X10|Evolio X7|Evolio X8|\\bEvotab\\b|\\bNeura\\b",
	        "LavaTablet": "QPAD E704|\\bIvoryS\\b|E-TAB IVORY|\\bE-TAB\\b",
	        "AocTablet": "MW0811|MW0812|MW0922|MTK8382|MW1031|MW0831|MW0821|MW0931|MW0712",
	        "MpmanTablet": "MP11 OCTA|MP10 OCTA|MPQC1114|MPQC1004|MPQC994|MPQC974|MPQC973|MPQC804|MPQC784|MPQC780|\\bMPG7\\b|MPDCG75|MPDCG71|MPDC1006|MP101DC|MPDC9000|MPDC905|MPDC706HD|MPDC706|MPDC705|MPDC110|MPDC100|MPDC99|MPDC97|MPDC88|MPDC8|MPDC77|MP709|MID701|MID711|MID170|MPDC703|MPQC1010",
	        "CelkonTablet": "CT695|CT888|CT[\\s]?910|CT7 Tab|CT9 Tab|CT3 Tab|CT2 Tab|CT1 Tab|C820|C720|\\bCT-1\\b",
	        "WolderTablet": "miTab \\b(DIAMOND|SPACE|BROOKLYN|NEO|FLY|MANHATTAN|FUNK|EVOLUTION|SKY|GOCAR|IRON|GENIUS|POP|MINT|EPSILON|BROADWAY|JUMP|HOP|LEGEND|NEW AGE|LINE|ADVANCE|FEEL|FOLLOW|LIKE|LINK|LIVE|THINK|FREEDOM|CHICAGO|CLEVELAND|BALTIMORE-GH|IOWA|BOSTON|SEATTLE|PHOENIX|DALLAS|IN 101|MasterChef)\\b",
	        "MiTablet": "\\bMI PAD\\b|\\bHM NOTE 1W\\b",
	        "NibiruTablet": "Nibiru M1|Nibiru Jupiter One",
	        "NexoTablet": "NEXO NOVA|NEXO 10|NEXO AVIO|NEXO FREE|NEXO GO|NEXO EVO|NEXO 3G|NEXO SMART|NEXO KIDDO|NEXO MOBI",
	        "LeaderTablet": "TBLT10Q|TBLT10I|TBL-10WDKB|TBL-10WDKBO2013|TBL-W230V2|TBL-W450|TBL-W500|SV572|TBLT7I|TBA-AC7-8G|TBLT79|TBL-8W16|TBL-10W32|TBL-10WKB|TBL-W100",
	        "UbislateTablet": "UbiSlate[\\s]?7C",
	        "PocketBookTablet": "Pocketbook",
	        "KocasoTablet": "\\b(TB-1207)\\b",
	        "HisenseTablet": "\\b(F5281|E2371)\\b",
	        "Hudl": "Hudl HT7S3|Hudl 2",
	        "TelstraTablet": "T-Hub2",
	        "GenericTablet": "Android.*\\b97D\\b|Tablet(?!.*PC)|BNTV250A|MID-WCDMA|LogicPD Zoom2|\\bA7EB\\b|CatNova8|A1_07|CT704|CT1002|\\bM721\\b|rk30sdk|\\bEVOTAB\\b|M758A|ET904|ALUMIUM10|Smartfren Tab|Endeavour 1010|Tablet-PC-4|Tagi Tab|\\bM6pro\\b|CT1020W|arc 10HD|\\bTP750\\b"
	    },
	    "oss": {
	        "AndroidOS": "Android",
	        "BlackBerryOS": "blackberry|\\bBB10\\b|rim tablet os",
	        "PalmOS": "PalmOS|avantgo|blazer|elaine|hiptop|palm|plucker|xiino",
	        "SymbianOS": "Symbian|SymbOS|Series60|Series40|SYB-[0-9]+|\\bS60\\b",
	        "WindowsMobileOS": "Windows CE.*(PPC|Smartphone|Mobile|[0-9]{3}x[0-9]{3})|Window Mobile|Windows Phone [0-9.]+|WCE;",
	        "WindowsPhoneOS": "Windows Phone 10.0|Windows Phone 8.1|Windows Phone 8.0|Windows Phone OS|XBLWP7|ZuneWP7|Windows NT 6.[23]; ARM;",
	        "iOS": "\\biPhone.*Mobile|\\biPod|\\biPad",
	        "MeeGoOS": "MeeGo",
	        "MaemoOS": "Maemo",
	        "JavaOS": "J2ME\/|\\bMIDP\\b|\\bCLDC\\b",
	        "webOS": "webOS|hpwOS",
	        "badaOS": "\\bBada\\b",
	        "BREWOS": "BREW"
	    },
	    "uas": {
	        "Chrome": "\\bCrMo\\b|CriOS|Android.*Chrome\/[.0-9]* (Mobile)?",
	        "Dolfin": "\\bDolfin\\b",
	        "Opera": "Opera.*Mini|Opera.*Mobi|Android.*Opera|Mobile.*OPR\/[0-9.]+|Coast\/[0-9.]+",
	        "Skyfire": "Skyfire",
	        "Edge": "Mobile Safari\/[.0-9]* Edge",
	        "IE": "IEMobile|MSIEMobile",
	        "Firefox": "fennec|firefox.*maemo|(Mobile|Tablet).*Firefox|Firefox.*Mobile|FxiOS",
	        "Bolt": "bolt",
	        "TeaShark": "teashark",
	        "Blazer": "Blazer",
	        "Safari": "Version.*Mobile.*Safari|Safari.*Mobile|MobileSafari",
	        "UCBrowser": "UC.*Browser|UCWEB",
	        "baiduboxapp": "baiduboxapp",
	        "baidubrowser": "baidubrowser",
	        "DiigoBrowser": "DiigoBrowser",
	        "Puffin": "Puffin",
	        "Mercury": "\\bMercury\\b",
	        "ObigoBrowser": "Obigo",
	        "NetFront": "NF-Browser",
	        "GenericBrowser": "NokiaBrowser|OviBrowser|OneBrowser|TwonkyBeamBrowser|SEMC.*Browser|FlyFlow|Minimo|NetFront|Novarra-Vision|MQQBrowser|MicroMessenger",
	        "PaleMoon": "Android.*PaleMoon|Mobile.*PaleMoon"
	    },
	    "props": {
	        "Mobile": "Mobile\/[VER]",
	        "Build": "Build\/[VER]",
	        "Version": "Version\/[VER]",
	        "VendorID": "VendorID\/[VER]",
	        "iPad": "iPad.*CPU[a-z ]+[VER]",
	        "iPhone": "iPhone.*CPU[a-z ]+[VER]",
	        "iPod": "iPod.*CPU[a-z ]+[VER]",
	        "Kindle": "Kindle\/[VER]",
	        "Chrome": [
	            "Chrome\/[VER]",
	            "CriOS\/[VER]",
	            "CrMo\/[VER]"
	        ],
	        "Coast": [
	            "Coast\/[VER]"
	        ],
	        "Dolfin": "Dolfin\/[VER]",
	        "Firefox": [
	            "Firefox\/[VER]",
	            "FxiOS\/[VER]"
	        ],
	        "Fennec": "Fennec\/[VER]",
	        "Edge": "Edge\/[VER]",
	        "IE": [
	            "IEMobile\/[VER];",
	            "IEMobile [VER]",
	            "MSIE [VER];",
	            "Trident\/[0-9.]+;.*rv:[VER]"
	        ],
	        "NetFront": "NetFront\/[VER]",
	        "NokiaBrowser": "NokiaBrowser\/[VER]",
	        "Opera": [
	            " OPR\/[VER]",
	            "Opera Mini\/[VER]",
	            "Version\/[VER]"
	        ],
	        "Opera Mini": "Opera Mini\/[VER]",
	        "Opera Mobi": "Version\/[VER]",
	        "UC Browser": "UC Browser[VER]",
	        "MQQBrowser": "MQQBrowser\/[VER]",
	        "MicroMessenger": "MicroMessenger\/[VER]",
	        "baiduboxapp": "baiduboxapp\/[VER]",
	        "baidubrowser": "baidubrowser\/[VER]",
	        "SamsungBrowser": "SamsungBrowser\/[VER]",
	        "Iron": "Iron\/[VER]",
	        "Safari": [
	            "Version\/[VER]",
	            "Safari\/[VER]"
	        ],
	        "Skyfire": "Skyfire\/[VER]",
	        "Tizen": "Tizen\/[VER]",
	        "Webkit": "webkit[ \/][VER]",
	        "PaleMoon": "PaleMoon\/[VER]",
	        "Gecko": "Gecko\/[VER]",
	        "Trident": "Trident\/[VER]",
	        "Presto": "Presto\/[VER]",
	        "Goanna": "Goanna\/[VER]",
	        "iOS": " \\bi?OS\\b [VER][ ;]{1}",
	        "Android": "Android [VER]",
	        "BlackBerry": [
	            "BlackBerry[\\w]+\/[VER]",
	            "BlackBerry.*Version\/[VER]",
	            "Version\/[VER]"
	        ],
	        "BREW": "BREW [VER]",
	        "Java": "Java\/[VER]",
	        "Windows Phone OS": [
	            "Windows Phone OS [VER]",
	            "Windows Phone [VER]"
	        ],
	        "Windows Phone": "Windows Phone [VER]",
	        "Windows CE": "Windows CE\/[VER]",
	        "Windows NT": "Windows NT [VER]",
	        "Symbian": [
	            "SymbianOS\/[VER]",
	            "Symbian\/[VER]"
	        ],
	        "webOS": [
	            "webOS\/[VER]",
	            "hpwOS\/[VER];"
	        ]
	    },
	    "utils": {
	        "Bot": "Googlebot|facebookexternalhit|AdsBot-Google|Google Keyword Suggestion|Facebot|YandexBot|YandexMobileBot|bingbot|ia_archiver|AhrefsBot|Ezooms|GSLFbot|WBSearchBot|Twitterbot|TweetmemeBot|Twikle|PaperLiBot|Wotbox|UnwindFetchor|Exabot|MJ12bot|YandexImages|TurnitinBot|Pingdom",
	        "MobileBot": "Googlebot-Mobile|AdsBot-Google-Mobile|YahooSeeker\/M1A1-R2D2",
	        "DesktopMode": "WPDesktop",
	        "TV": "SonyDTV|HbbTV",
	        "WebKit": "(webkit)[ \/]([\\w.]+)",
	        "Console": "\\b(Nintendo|Nintendo WiiU|Nintendo 3DS|PLAYSTATION|Xbox)\\b",
	        "Watch": "SM-V700"
	    }
	};

	    // following patterns come from http://detectmobilebrowsers.com/
	    impl.detectMobileBrowsers = {
	        fullPattern: /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,
	        shortPattern: /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,
	        tabletPattern: /android|ipad|playbook|silk/i
	    };

	    var hasOwnProp = Object.prototype.hasOwnProperty,
	        isArray;

	    impl.FALLBACK_PHONE = 'UnknownPhone';
	    impl.FALLBACK_TABLET = 'UnknownTablet';
	    impl.FALLBACK_MOBILE = 'UnknownMobile';

	    isArray = ('isArray' in Array) ?
	        Array.isArray : function (value) { return Object.prototype.toString.call(value) === '[object Array]'; };

	    function equalIC(a, b) {
	        return a != null && b != null && a.toLowerCase() === b.toLowerCase();
	    }

	    function containsIC(array, value) {
	        var valueLC, i, len = array.length;
	        if (!len || !value) {
	            return false;
	        }
	        valueLC = value.toLowerCase();
	        for (i = 0; i < len; ++i) {
	            if (valueLC === array[i].toLowerCase()) {
	                return true;
	            }
	        }
	        return false;
	    }

	    function convertPropsToRegExp(object) {
	        for (var key in object) {
	            if (hasOwnProp.call(object, key)) {
	                object[key] = new RegExp(object[key], 'i');
	            }
	        }
	    }

	    (function init() {
	        var key, values, value, i, len, verPos, mobileDetectRules = impl.mobileDetectRules;
	        for (key in mobileDetectRules.props) {
	            if (hasOwnProp.call(mobileDetectRules.props, key)) {
	                values = mobileDetectRules.props[key];
	                if (!isArray(values)) {
	                    values = [values];
	                }
	                len = values.length;
	                for (i = 0; i < len; ++i) {
	                    value = values[i];
	                    verPos = value.indexOf('[VER]');
	                    if (verPos >= 0) {
	                        value = value.substring(0, verPos) + '([\\w._\\+]+)' + value.substring(verPos + 5);
	                    }
	                    values[i] = new RegExp(value, 'i');
	                }
	                mobileDetectRules.props[key] = values;
	            }
	        }
	        convertPropsToRegExp(mobileDetectRules.oss);
	        convertPropsToRegExp(mobileDetectRules.phones);
	        convertPropsToRegExp(mobileDetectRules.tablets);
	        convertPropsToRegExp(mobileDetectRules.uas);
	        convertPropsToRegExp(mobileDetectRules.utils);

	        // copy some patterns to oss0 which are tested first (see issue#15)
	        mobileDetectRules.oss0 = {
	            WindowsPhoneOS: mobileDetectRules.oss.WindowsPhoneOS,
	            WindowsMobileOS: mobileDetectRules.oss.WindowsMobileOS
	        };
	    }());

	    /**
	     * Test userAgent string against a set of rules and find the first matched key.
	     * @param {Object} rules (key is String, value is RegExp)
	     * @param {String} userAgent the navigator.userAgent (or HTTP-Header 'User-Agent').
	     * @returns {String|null} the matched key if found, otherwise <tt>null</tt>
	     * @private
	     */
	    impl.findMatch = function(rules, userAgent) {
	        for (var key in rules) {
	            if (hasOwnProp.call(rules, key)) {
	                if (rules[key].test(userAgent)) {
	                    return key;
	                }
	            }
	        }
	        return null;
	    };

	    /**
	     * Test userAgent string against a set of rules and return an array of matched keys.
	     * @param {Object} rules (key is String, value is RegExp)
	     * @param {String} userAgent the navigator.userAgent (or HTTP-Header 'User-Agent').
	     * @returns {Array} an array of matched keys, may be empty when there is no match, but not <tt>null</tt>
	     * @private
	     */
	    impl.findMatches = function(rules, userAgent) {
	        var result = [];
	        for (var key in rules) {
	            if (hasOwnProp.call(rules, key)) {
	                if (rules[key].test(userAgent)) {
	                    result.push(key);
	                }
	            }
	        }
	        return result;
	    };

	    /**
	     * Check the version of the given property in the User-Agent.
	     *
	     * @param {String} propertyName
	     * @param {String} userAgent
	     * @return {String} version or <tt>null</tt> if version not found
	     * @private
	     */
	    impl.getVersionStr = function (propertyName, userAgent) {
	        var props = impl.mobileDetectRules.props, patterns, i, len, match;
	        if (hasOwnProp.call(props, propertyName)) {
	            patterns = props[propertyName];
	            len = patterns.length;
	            for (i = 0; i < len; ++i) {
	                match = patterns[i].exec(userAgent);
	                if (match !== null) {
	                    return match[1];
	                }
	            }
	        }
	        return null;
	    };

	    /**
	     * Check the version of the given property in the User-Agent.
	     * Will return a float number. (eg. 2_0 will return 2.0, 4.3.1 will return 4.31)
	     *
	     * @param {String} propertyName
	     * @param {String} userAgent
	     * @return {Number} version or <tt>NaN</tt> if version not found
	     * @private
	     */
	    impl.getVersion = function (propertyName, userAgent) {
	        var version = impl.getVersionStr(propertyName, userAgent);
	        return version ? impl.prepareVersionNo(version) : NaN;
	    };

	    /**
	     * Prepare the version number.
	     *
	     * @param {String} version
	     * @return {Number} the version number as a floating number
	     * @private
	     */
	    impl.prepareVersionNo = function (version) {
	        var numbers;

	        numbers = version.split(/[a-z._ \/\-]/i);
	        if (numbers.length === 1) {
	            version = numbers[0];
	        }
	        if (numbers.length > 1) {
	            version = numbers[0] + '.';
	            numbers.shift();
	            version += numbers.join('');
	        }
	        return Number(version);
	    };

	    impl.isMobileFallback = function (userAgent) {
	        return impl.detectMobileBrowsers.fullPattern.test(userAgent) ||
	            impl.detectMobileBrowsers.shortPattern.test(userAgent.substr(0,4));
	    };

	    impl.isTabletFallback = function (userAgent) {
	        return impl.detectMobileBrowsers.tabletPattern.test(userAgent);
	    };

	    impl.prepareDetectionCache = function (cache, userAgent, maxPhoneWidth) {
	        if (cache.mobile !== undefined) {
	            return;
	        }
	        var phone, tablet, phoneSized;

	        // first check for stronger tablet rules, then phone (see issue#5)
	        tablet = impl.findMatch(impl.mobileDetectRules.tablets, userAgent);
	        if (tablet) {
	            cache.mobile = cache.tablet = tablet;
	            cache.phone = null;
	            return; // unambiguously identified as tablet
	        }

	        phone = impl.findMatch(impl.mobileDetectRules.phones, userAgent);
	        if (phone) {
	            cache.mobile = cache.phone = phone;
	            cache.tablet = null;
	            return; // unambiguously identified as phone
	        }

	        // our rules haven't found a match -> try more general fallback rules
	        if (impl.isMobileFallback(userAgent)) {
	            phoneSized = MobileDetect.isPhoneSized(maxPhoneWidth);
	            if (phoneSized === undefined) {
	                cache.mobile = impl.FALLBACK_MOBILE;
	                cache.tablet = cache.phone = null;
	            } else if (phoneSized) {
	                cache.mobile = cache.phone = impl.FALLBACK_PHONE;
	                cache.tablet = null;
	            } else {
	                cache.mobile = cache.tablet = impl.FALLBACK_TABLET;
	                cache.phone = null;
	            }
	        } else if (impl.isTabletFallback(userAgent)) {
	            cache.mobile = cache.tablet = impl.FALLBACK_TABLET;
	            cache.phone = null;
	        } else {
	            // not mobile at all!
	            cache.mobile = cache.tablet = cache.phone = null;
	        }
	    };

	    // t is a reference to a MobileDetect instance
	    impl.mobileGrade = function (t) {
	        // impl note:
	        // To keep in sync w/ Mobile_Detect.php easily, the following code is tightly aligned to the PHP version.
	        // When changes are made in Mobile_Detect.php, copy this method and replace:
	        //     $this-> / t.
	        //     self::MOBILE_GRADE_(.) / '$1'
	        //     , self::VERSION_TYPE_FLOAT / (nothing)
	        //     isIOS() / os('iOS')
	        //     [reg] / (nothing)   <-- jsdelivr complaining about unescaped unicode character U+00AE
	        var $isMobile = t.mobile() !== null;

	        if (
	            // Apple iOS 3.2-5.1 - Tested on the original iPad (4.3 / 5.0), iPad 2 (4.3), iPad 3 (5.1), original iPhone (3.1), iPhone 3 (3.2), 3GS (4.3), 4 (4.3 / 5.0), and 4S (5.1)
	            t.os('iOS') && t.version('iPad')>=4.3 ||
	            t.os('iOS') && t.version('iPhone')>=3.1 ||
	            t.os('iOS') && t.version('iPod')>=3.1 ||

	            // Android 2.1-2.3 - Tested on the HTC Incredible (2.2), original Droid (2.2), HTC Aria (2.1), Google Nexus S (2.3). Functional on 1.5 & 1.6 but performance may be sluggish, tested on Google G1 (1.5)
	            // Android 3.1 (Honeycomb)  - Tested on the Samsung Galaxy Tab 10.1 and Motorola XOOM
	            // Android 4.0 (ICS)  - Tested on a Galaxy Nexus. Note: transition performance can be poor on upgraded devices
	            // Android 4.1 (Jelly Bean)  - Tested on a Galaxy Nexus and Galaxy 7
	            ( t.version('Android')>2.1 && t.is('Webkit') ) ||

	            // Windows Phone 7-7.5 - Tested on the HTC Surround (7.0) HTC Trophy (7.5), LG-E900 (7.5), Nokia Lumia 800
	            t.version('Windows Phone OS')>=7.0 ||

	            // Blackberry 7 - Tested on BlackBerry Torch 9810
	            // Blackberry 6.0 - Tested on the Torch 9800 and Style 9670
	            t.is('BlackBerry') && t.version('BlackBerry')>=6.0 ||
	            // Blackberry Playbook (1.0-2.0) - Tested on PlayBook
	            t.match('Playbook.*Tablet') ||

	            // Palm WebOS (1.4-2.0) - Tested on the Palm Pixi (1.4), Pre (1.4), Pre 2 (2.0)
	            ( t.version('webOS')>=1.4 && t.match('Palm|Pre|Pixi') ) ||
	            // Palm WebOS 3.0  - Tested on HP TouchPad
	            t.match('hp.*TouchPad') ||

	            // Firefox Mobile (12 Beta) - Tested on Android 2.3 device
	            ( t.is('Firefox') && t.version('Firefox')>=12 ) ||

	            // Chrome for Android - Tested on Android 4.0, 4.1 device
	            ( t.is('Chrome') && t.is('AndroidOS') && t.version('Android')>=4.0 ) ||

	            // Skyfire 4.1 - Tested on Android 2.3 device
	            ( t.is('Skyfire') && t.version('Skyfire')>=4.1 && t.is('AndroidOS') && t.version('Android')>=2.3 ) ||

	            // Opera Mobile 11.5-12: Tested on Android 2.3
	            ( t.is('Opera') && t.version('Opera Mobi')>11 && t.is('AndroidOS') ) ||

	            // Meego 1.2 - Tested on Nokia 950 and N9
	            t.is('MeeGoOS') ||

	            // Tizen (pre-release) - Tested on early hardware
	            t.is('Tizen') ||

	            // Samsung Bada 2.0 - Tested on a Samsung Wave 3, Dolphin browser
	            // @todo: more tests here!
	            t.is('Dolfin') && t.version('Bada')>=2.0 ||

	            // UC Browser - Tested on Android 2.3 device
	            ( (t.is('UC Browser') || t.is('Dolfin')) && t.version('Android')>=2.3 ) ||

	            // Kindle 3 and Fire  - Tested on the built-in WebKit browser for each
	            ( t.match('Kindle Fire') ||
	                t.is('Kindle') && t.version('Kindle')>=3.0 ) ||

	            // Nook Color 1.4.1 - Tested on original Nook Color, not Nook Tablet
	            t.is('AndroidOS') && t.is('NookTablet') ||

	            // Chrome Desktop 11-21 - Tested on OS X 10.7 and Windows 7
	            t.version('Chrome')>=11 && !$isMobile ||

	            // Safari Desktop 4-5 - Tested on OS X 10.7 and Windows 7
	            t.version('Safari')>=5.0 && !$isMobile ||

	            // Firefox Desktop 4-13 - Tested on OS X 10.7 and Windows 7
	            t.version('Firefox')>=4.0 && !$isMobile ||

	            // Internet Explorer 7-9 - Tested on Windows XP, Vista and 7
	            t.version('MSIE')>=7.0 && !$isMobile ||

	            // Opera Desktop 10-12 - Tested on OS X 10.7 and Windows 7
	            // @reference: http://my.opera.com/community/openweb/idopera/
	            t.version('Opera')>=10 && !$isMobile

	            ){
	            return 'A';
	        }

	        if (
	            t.os('iOS') && t.version('iPad')<4.3 ||
	            t.os('iOS') && t.version('iPhone')<3.1 ||
	            t.os('iOS') && t.version('iPod')<3.1 ||

	            // Blackberry 5.0: Tested on the Storm 2 9550, Bold 9770
	            t.is('Blackberry') && t.version('BlackBerry')>=5 && t.version('BlackBerry')<6 ||

	            //Opera Mini (5.0-6.5) - Tested on iOS 3.2/4.3 and Android 2.3
	            ( t.version('Opera Mini')>=5.0 && t.version('Opera Mini')<=6.5 &&
	                (t.version('Android')>=2.3 || t.is('iOS')) ) ||

	            // Nokia Symbian^3 - Tested on Nokia N8 (Symbian^3), C7 (Symbian^3), also works on N97 (Symbian^1)
	            t.match('NokiaN8|NokiaC7|N97.*Series60|Symbian/3') ||

	            // @todo: report this (tested on Nokia N71)
	            t.version('Opera Mobi')>=11 && t.is('SymbianOS')
	            ){
	            return 'B';
	        }

	        if (
	        // Blackberry 4.x - Tested on the Curve 8330
	            t.version('BlackBerry')<5.0 ||
	            // Windows Mobile - Tested on the HTC Leo (WinMo 5.2)
	            t.match('MSIEMobile|Windows CE.*Mobile') || t.version('Windows Mobile')<=5.2

	            ){
	            return 'C';
	        }

	        //All older smartphone platforms and featurephones - Any device that doesn't support media queries
	        //will receive the basic, C grade experience.
	        return 'C';
	    };

	    impl.detectOS = function (ua) {
	        return impl.findMatch(impl.mobileDetectRules.oss0, ua) ||
	            impl.findMatch(impl.mobileDetectRules.oss, ua);
	    };

	    impl.getDeviceSmallerSide = function () {
	        return window.screen.width < window.screen.height ?
	            window.screen.width :
	            window.screen.height;
	    };

	    /**
	     * Constructor for MobileDetect object.
	     * <br>
	     * Such an object will keep a reference to the given user-agent string and cache most of the detect queries.<br>
	     * <div style="background-color: #d9edf7; border: 1px solid #bce8f1; color: #3a87ad; padding: 14px; border-radius: 2px; margin-top: 20px">
	     *     <strong>Find information how to download and install:</strong>
	     *     <a href="https://github.com/hgoebl/mobile-detect.js/">github.com/hgoebl/mobile-detect.js/</a>
	     * </div>
	     *
	     * @example <pre>
	     *     var md = new MobileDetect(window.navigator.userAgent);
	     *     if (md.mobile()) {
	     *         location.href = (md.mobileGrade() === 'A') ? '/mobile/' : '/lynx/';
	     *     }
	     * </pre>
	     *
	     * @param {string} userAgent typically taken from window.navigator.userAgent or http_header['User-Agent']
	     * @param {number} [maxPhoneWidth=600] <strong>only for browsers</strong> specify a value for the maximum
	     *        width of smallest device side (in logical "CSS" pixels) until a device detected as mobile will be handled
	     *        as phone.
	     *        This is only used in cases where the device cannot be classified as phone or tablet.<br>
	     *        See <a href="http://developer.android.com/guide/practices/screens_support.html">Declaring Tablet Layouts
	     *        for Android</a>.<br>
	     *        If you provide a value < 0, then this "fuzzy" check is disabled.
	     * @constructor
	     * @global
	     */
	    function MobileDetect(userAgent, maxPhoneWidth) {
	        this.ua = userAgent || '';
	        this._cache = {};
	        //600dp is typical 7" tablet minimum width
	        this.maxPhoneWidth = maxPhoneWidth || 600;
	    }

	    MobileDetect.prototype = {
	        constructor: MobileDetect,

	        /**
	         * Returns the detected phone or tablet type or <tt>null</tt> if it is not a mobile device.
	         * <br>
	         * For a list of possible return values see {@link MobileDetect#phone} and {@link MobileDetect#tablet}.<br>
	         * <br>
	         * If the device is not detected by the regular expressions from Mobile-Detect, a test is made against
	         * the patterns of <a href="http://detectmobilebrowsers.com/">detectmobilebrowsers.com</a>. If this test
	         * is positive, a value of <code>UnknownPhone</code>, <code>UnknownTablet</code> or
	         * <code>UnknownMobile</code> is returned.<br>
	         * When used in browser, the decision whether phone or tablet is made based on <code>screen.width/height</code>.<br>
	         * <br>
	         * When used server-side (node.js), there is no way to tell the difference between <code>UnknownTablet</code>
	         * and <code>UnknownMobile</code>, so you will get <code>UnknownMobile</code> here.<br>
	         * Be aware that since v1.0.0 in this special case you will get <code>UnknownMobile</code> only for:
	         * {@link MobileDetect#mobile}, not for {@link MobileDetect#phone} and {@link MobileDetect#tablet}.
	         * In versions before v1.0.0 all 3 methods returned <code>UnknownMobile</code> which was tedious to use.
	         * <br>
	         * In most cases you will use the return value just as a boolean.
	         *
	         * @returns {String} the key for the phone family or tablet family, e.g. "Nexus".
	         * @function MobileDetect#mobile
	         */
	        mobile: function () {
	            impl.prepareDetectionCache(this._cache, this.ua, this.maxPhoneWidth);
	            return this._cache.mobile;
	        },

	        /**
	         * Returns the detected phone type/family string or <tt>null</tt>.
	         * <br>
	         * The returned tablet (family or producer) is one of following keys:<br>
	         * <br><tt>iPhone, BlackBerry, HTC, Nexus, Dell, Motorola, Samsung, LG, Sony, Asus,
	         * NokiaLumia, Micromax, Palm, Vertu, Pantech, Fly, Wiko, iMobile, SimValley,
	         * Wolfgang, Alcatel, Nintendo, Amoi, INQ, GenericPhone</tt><br>
	         * <br>
	         * If the device is not detected by the regular expressions from Mobile-Detect, a test is made against
	         * the patterns of <a href="http://detectmobilebrowsers.com/">detectmobilebrowsers.com</a>. If this test
	         * is positive, a value of <code>UnknownPhone</code> or <code>UnknownMobile</code> is returned.<br>
	         * When used in browser, the decision whether phone or tablet is made based on <code>screen.width/height</code>.<br>
	         * <br>
	         * When used server-side (node.js), there is no way to tell the difference between <code>UnknownTablet</code>
	         * and <code>UnknownMobile</code>, so you will get <code>null</code> here, while {@link MobileDetect#mobile}
	         * will return <code>UnknownMobile</code>.<br>
	         * Be aware that since v1.0.0 in this special case you will get <code>UnknownMobile</code> only for:
	         * {@link MobileDetect#mobile}, not for {@link MobileDetect#phone} and {@link MobileDetect#tablet}.
	         * In versions before v1.0.0 all 3 methods returned <code>UnknownMobile</code> which was tedious to use.
	         * <br>
	         * In most cases you will use the return value just as a boolean.
	         *
	         * @returns {String} the key of the phone family or producer, e.g. "iPhone"
	         * @function MobileDetect#phone
	         */
	        phone: function () {
	            impl.prepareDetectionCache(this._cache, this.ua, this.maxPhoneWidth);
	            return this._cache.phone;
	        },

	        /**
	         * Returns the detected tablet type/family string or <tt>null</tt>.
	         * <br>
	         * The returned tablet (family or producer) is one of following keys:<br>
	         * <br><tt>iPad, NexusTablet, SamsungTablet, Kindle, SurfaceTablet, HPTablet, AsusTablet,
	         * BlackBerryTablet, HTCtablet, MotorolaTablet, NookTablet, AcerTablet,
	         * ToshibaTablet, LGTablet, FujitsuTablet, PrestigioTablet, LenovoTablet,
	         * DellTablet, YarvikTablet, MedionTablet, ArnovaTablet, IntensoTablet, IRUTablet,
	         * MegafonTablet, EbodaTablet, AllViewTablet, ArchosTablet, AinolTablet,
	         * NokiaLumiaTablet, SonyTablet, PhilipsTablet, CubeTablet, CobyTablet, MIDTablet,
	         * MSITablet, SMiTTablet, RockChipTablet, FlyTablet, bqTablet, HuaweiTablet,
	         * NecTablet, PantechTablet, BronchoTablet, VersusTablet, ZyncTablet,
	         * PositivoTablet, NabiTablet, KoboTablet, DanewTablet, TexetTablet,
	         * PlaystationTablet, TrekstorTablet, PyleAudioTablet, AdvanTablet,
	         * DanyTechTablet, GalapadTablet, MicromaxTablet, KarbonnTablet, AllFineTablet,
	         * PROSCANTablet, YONESTablet, ChangJiaTablet, GUTablet, PointOfViewTablet,
	         * OvermaxTablet, HCLTablet, DPSTablet, VistureTablet, CrestaTablet,
	         * MediatekTablet, ConcordeTablet, GoCleverTablet, ModecomTablet, VoninoTablet,
	         * ECSTablet, StorexTablet, VodafoneTablet, EssentielBTablet, RossMoorTablet,
	         * iMobileTablet, TolinoTablet, AudioSonicTablet, AMPETablet, SkkTablet,
	         * TecnoTablet, JXDTablet, iJoyTablet, FX2Tablet, XoroTablet, ViewsonicTablet,
	         * OdysTablet, CaptivaTablet, IconbitTablet, TeclastTablet, OndaTablet,
	         * JaytechTablet, BlaupunktTablet, DigmaTablet, EvolioTablet, LavaTablet,
	         * AocTablet, MpmanTablet, CelkonTablet, WolderTablet, MiTablet, NibiruTablet,
	         * NexoTablet, LeaderTablet, UbislateTablet, PocketBookTablet, KocasoTablet,
	         * HisenseTablet, Hudl, TelstraTablet, GenericTablet</tt><br>
	         * <br>
	         * If the device is not detected by the regular expressions from Mobile-Detect, a test is made against
	         * the patterns of <a href="http://detectmobilebrowsers.com/">detectmobilebrowsers.com</a>. If this test
	         * is positive, a value of <code>UnknownTablet</code> or <code>UnknownMobile</code> is returned.<br>
	         * When used in browser, the decision whether phone or tablet is made based on <code>screen.width/height</code>.<br>
	         * <br>
	         * When used server-side (node.js), there is no way to tell the difference between <code>UnknownTablet</code>
	         * and <code>UnknownMobile</code>, so you will get <code>null</code> here, while {@link MobileDetect#mobile}
	         * will return <code>UnknownMobile</code>.<br>
	         * Be aware that since v1.0.0 in this special case you will get <code>UnknownMobile</code> only for:
	         * {@link MobileDetect#mobile}, not for {@link MobileDetect#phone} and {@link MobileDetect#tablet}.
	         * In versions before v1.0.0 all 3 methods returned <code>UnknownMobile</code> which was tedious to use.
	         * <br>
	         * In most cases you will use the return value just as a boolean.
	         *
	         * @returns {String} the key of the tablet family or producer, e.g. "SamsungTablet"
	         * @function MobileDetect#tablet
	         */
	        tablet: function () {
	            impl.prepareDetectionCache(this._cache, this.ua, this.maxPhoneWidth);
	            return this._cache.tablet;
	        },

	        /**
	         * Returns the (first) detected user-agent string or <tt>null</tt>.
	         * <br>
	         * The returned user-agent is one of following keys:<br>
	         * <br><tt>Chrome, Dolfin, Opera, Skyfire, Edge, IE, Firefox, Bolt, TeaShark, Blazer,
	         * Safari, UCBrowser, baiduboxapp, baidubrowser, DiigoBrowser, Puffin, Mercury,
	         * ObigoBrowser, NetFront, GenericBrowser, PaleMoon</tt><br>
	         * <br>
	         * In most cases calling {@link MobileDetect#userAgent} will be sufficient. But there are rare
	         * cases where a mobile device pretends to be more than one particular browser. You can get the
	         * list of all matches with {@link MobileDetect#userAgents} or check for a particular value by
	         * providing one of the defined keys as first argument to {@link MobileDetect#is}.
	         *
	         * @returns {String} the key for the detected user-agent or <tt>null</tt>
	         * @function MobileDetect#userAgent
	         */
	        userAgent: function () {
	            if (this._cache.userAgent === undefined) {
	                this._cache.userAgent = impl.findMatch(impl.mobileDetectRules.uas, this.ua);
	            }
	            return this._cache.userAgent;
	        },

	        /**
	         * Returns all detected user-agent strings.
	         * <br>
	         * The array is empty or contains one or more of following keys:<br>
	         * <br><tt>Chrome, Dolfin, Opera, Skyfire, Edge, IE, Firefox, Bolt, TeaShark, Blazer,
	         * Safari, UCBrowser, baiduboxapp, baidubrowser, DiigoBrowser, Puffin, Mercury,
	         * ObigoBrowser, NetFront, GenericBrowser, PaleMoon</tt><br>
	         * <br>
	         * In most cases calling {@link MobileDetect#userAgent} will be sufficient. But there are rare
	         * cases where a mobile device pretends to be more than one particular browser. You can get the
	         * list of all matches with {@link MobileDetect#userAgents} or check for a particular value by
	         * providing one of the defined keys as first argument to {@link MobileDetect#is}.
	         *
	         * @returns {Array} the array of detected user-agent keys or <tt>[]</tt>
	         * @function MobileDetect#userAgents
	         */
	        userAgents: function () {
	            if (this._cache.userAgents === undefined) {
	                this._cache.userAgents = impl.findMatches(impl.mobileDetectRules.uas, this.ua);
	            }
	            return this._cache.userAgents;
	        },

	        /**
	         * Returns the detected operating system string or <tt>null</tt>.
	         * <br>
	         * The operating system is one of following keys:<br>
	         * <br><tt>AndroidOS, BlackBerryOS, PalmOS, SymbianOS, WindowsMobileOS, WindowsPhoneOS,
	         * iOS, MeeGoOS, MaemoOS, JavaOS, webOS, badaOS, BREWOS</tt><br>
	         *
	         * @returns {String} the key for the detected operating system.
	         * @function MobileDetect#os
	         */
	        os: function () {
	            if (this._cache.os === undefined) {
	                this._cache.os = impl.detectOS(this.ua);
	            }
	            return this._cache.os;
	        },

	        /**
	         * Get the version (as Number) of the given property in the User-Agent.
	         * <br>
	         * Will return a float number. (eg. 2_0 will return 2.0, 4.3.1 will return 4.31)
	         *
	         * @param {String} key a key defining a thing which has a version.<br>
	         *        You can use one of following keys:<br>
	         * <br><tt>Mobile, Build, Version, VendorID, iPad, iPhone, iPod, Kindle, Chrome, Coast,
	         * Dolfin, Firefox, Fennec, Edge, IE, NetFront, NokiaBrowser, Opera, Opera Mini,
	         * Opera Mobi, UC Browser, MQQBrowser, MicroMessenger, baiduboxapp, baidubrowser,
	         * SamsungBrowser, Iron, Safari, Skyfire, Tizen, Webkit, PaleMoon, Gecko, Trident,
	         * Presto, Goanna, iOS, Android, BlackBerry, BREW, Java, Windows Phone OS, Windows
	         * Phone, Windows CE, Windows NT, Symbian, webOS</tt><br>
	         *
	         * @returns {Number} the version as float or <tt>NaN</tt> if User-Agent doesn't contain this version.
	         *          Be careful when comparing this value with '==' operator!
	         * @function MobileDetect#version
	         */
	        version: function (key) {
	            return impl.getVersion(key, this.ua);
	        },

	        /**
	         * Get the version (as String) of the given property in the User-Agent.
	         * <br>
	         *
	         * @param {String} key a key defining a thing which has a version.<br>
	         *        You can use one of following keys:<br>
	         * <br><tt>Mobile, Build, Version, VendorID, iPad, iPhone, iPod, Kindle, Chrome, Coast,
	         * Dolfin, Firefox, Fennec, Edge, IE, NetFront, NokiaBrowser, Opera, Opera Mini,
	         * Opera Mobi, UC Browser, MQQBrowser, MicroMessenger, baiduboxapp, baidubrowser,
	         * SamsungBrowser, Iron, Safari, Skyfire, Tizen, Webkit, PaleMoon, Gecko, Trident,
	         * Presto, Goanna, iOS, Android, BlackBerry, BREW, Java, Windows Phone OS, Windows
	         * Phone, Windows CE, Windows NT, Symbian, webOS</tt><br>
	         *
	         * @returns {String} the "raw" version as String or <tt>null</tt> if User-Agent doesn't contain this version.
	         *
	         * @function MobileDetect#versionStr
	         */
	        versionStr: function (key) {
	            return impl.getVersionStr(key, this.ua);
	        },

	        /**
	         * Global test key against userAgent, os, phone, tablet and some other properties of userAgent string.
	         *
	         * @param {String} key the key (case-insensitive) of a userAgent, an operating system, phone or
	         *        tablet family.<br>
	         *        For a complete list of possible values, see {@link MobileDetect#userAgent},
	         *        {@link MobileDetect#os}, {@link MobileDetect#phone}, {@link MobileDetect#tablet}.<br>
	         *        Additionally you have following keys:<br>
	         * <br><tt>Bot, MobileBot, DesktopMode, TV, WebKit, Console, Watch</tt><br>
	         *
	         * @returns {boolean} <tt>true</tt> when the given key is one of the defined keys of userAgent, os, phone,
	         *                    tablet or one of the listed additional keys, otherwise <tt>false</tt>
	         * @function MobileDetect#is
	         */
	        is: function (key) {
	            return containsIC(this.userAgents(), key) ||
	                   equalIC(key, this.os()) ||
	                   equalIC(key, this.phone()) ||
	                   equalIC(key, this.tablet()) ||
	                   containsIC(impl.findMatches(impl.mobileDetectRules.utils, this.ua), key);
	        },

	        /**
	         * Do a quick test against navigator::userAgent.
	         *
	         * @param {String|RegExp} pattern the pattern, either as String or RegExp
	         *                        (a string will be converted to a case-insensitive RegExp).
	         * @returns {boolean} <tt>true</tt> when the pattern matches, otherwise <tt>false</tt>
	         * @function MobileDetect#match
	         */
	        match: function (pattern) {
	            if (!(pattern instanceof RegExp)) {
	                pattern = new RegExp(pattern, 'i');
	            }
	            return pattern.test(this.ua);
	        },

	        /**
	         * Checks whether the mobile device can be considered as phone regarding <code>screen.width</code>.
	         * <br>
	         * Obviously this method makes sense in browser environments only (not for Node.js)!
	         * @param {number} [maxPhoneWidth] the maximum logical pixels (aka. CSS-pixels) to be considered as phone.<br>
	         *        The argument is optional and if not present or falsy, the value of the constructor is taken.
	         * @returns {boolean|undefined} <code>undefined</code> if screen size wasn't detectable, else <code>true</code>
	         *          when screen.width is less or equal to maxPhoneWidth, otherwise <code>false</code>.<br>
	         *          Will always return <code>undefined</code> server-side.
	         */
	        isPhoneSized: function (maxPhoneWidth) {
	            return MobileDetect.isPhoneSized(maxPhoneWidth || this.maxPhoneWidth);
	        },

	        /**
	         * Returns the mobile grade ('A', 'B', 'C').
	         *
	         * @returns {String} one of the mobile grades ('A', 'B', 'C').
	         * @function MobileDetect#mobileGrade
	         */
	        mobileGrade: function () {
	            if (this._cache.grade === undefined) {
	                this._cache.grade = impl.mobileGrade(this);
	            }
	            return this._cache.grade;
	        }
	    };

	    // environment-dependent
	    if (typeof window !== 'undefined' && window.screen) {
	        MobileDetect.isPhoneSized = function (maxPhoneWidth) {
	            return maxPhoneWidth < 0 ? undefined : impl.getDeviceSmallerSide() <= maxPhoneWidth;
	        };
	    } else {
	        MobileDetect.isPhoneSized = function () {};
	    }

	    // should not be replaced by a completely new object - just overwrite existing methods
	    MobileDetect._impl = impl;
	    
	    MobileDetect.version = '1.3.5 2016-11-14';

	    return MobileDetect;
	}); // end of call of define()
	})((function (undefined) {
	    if (typeof module !== 'undefined' && module.exports) {
	        return function (factory) { module.exports = factory(); };
	    } else if (true) {
	        return __webpack_require__(2);
	    } else if (typeof window !== 'undefined') {
	        return function (factory) { window.MobileDetect = factory(); };
	    } else {
	        // please file a bug if you get this error!
	        throw new Error('unknown environment');
	    }
	})());

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _statsJs = __webpack_require__(4);

	var _statsJs2 = _interopRequireDefault(_statsJs);

	var _GridGraphic = __webpack_require__(5);

	var _GridGraphic2 = _interopRequireDefault(_GridGraphic);

	var _MapGraphic = __webpack_require__(27);

	var _MapGraphic2 = _interopRequireDefault(_MapGraphic);

	var _GridGeometry = __webpack_require__(21);

	var _GridGeometry2 = _interopRequireDefault(_GridGeometry);

	var _Metrics = __webpack_require__(87);

	var _Metrics2 = _interopRequireDefault(_Metrics);

	var _constants = __webpack_require__(22);

	var _utils = __webpack_require__(20);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Canvas = function () {
	  function Canvas() {
	    _classCallCheck(this, Canvas);

	    this._createCanvas();
	    this._requestRender();
	    this._initStats();
	    this._mapGraphic = new _MapGraphic2.default();
	    this._gridGraphic = new _GridGraphic2.default();
	    this._cartogramReady = false;
	    this._cartogramArea = null;
	  }

	  _createClass(Canvas, [{
	    key: 'setGeoCodeToName',
	    value: function setGeoCodeToName(geoCodeToName) {
	      this._gridGraphic.geoCodeToName = geoCodeToName;
	    }
	  }, {
	    key: 'computeCartogram',
	    value: function computeCartogram(dataset) {
	      this._mapGraphic.computeCartogram(dataset);
	      this._setCartogramArea();
	      this.updateTiles(dataset.data);
	      this._cartogramReady = true;
	    }
	  }, {
	    key: 'iterateCartogram',
	    value: function iterateCartogram(geography) {
	      var iterated = this._mapGraphic.iterateCartogram(geography);
	      if (iterated) {
	        this._setCartogramArea();
	      }
	      return iterated;
	    }
	  }, {
	    key: 'importTiles',
	    value: function importTiles(tiles) {
	      this._mapGraphic.resetBounds();
	      this._gridGraphic.importTiles(tiles);
	      this._cartogramReady = true;
	    }
	  }, {
	    key: 'updateTiles',
	    value: function updateTiles(properties) {
	      if (typeof properties !== 'undefined') {
	        this._properties = properties;
	      }
	      this._gridGraphic.populateTiles(this._mapGraphic, this._properties);
	    }
	  }, {
	    key: 'updateTilesFromMetrics',
	    value: function updateTilesFromMetrics() {
	      var idealHexArea = this._cartogramArea * _Metrics2.default.metricPerTile / _Metrics2.default.sumMetrics;
	      _GridGeometry2.default.setTileEdgeFromArea(idealHexArea);
	      this.updateTiles();
	    }
	  }, {
	    key: '_setCartogramArea',
	    value: function _setCartogramArea() {
	      this._cartogramArea = this._mapGraphic.computeCartogramArea();
	    }
	  }, {
	    key: 'getGrid',
	    value: function getGrid() {
	      return this._gridGraphic;
	    }
	  }, {
	    key: 'getMap',
	    value: function getMap() {
	      return this._mapGraphic;
	    }
	  }, {
	    key: 'resize',
	    value: function resize() {
	      this._canvas.width = _constants.canvasDimensions.width;
	      this._canvas.height = _constants.canvasDimensions.height;
	      this._canvas.style.width = _constants.canvasDimensions.width / _constants.devicePixelRatio + 'px';
	      if (this._gridGraphic) {
	        this._gridGraphic.renderBackgroundImage();
	      }
	    }
	  }, {
	    key: '_createCanvas',
	    value: function _createCanvas() {
	      var container = (0, _utils.createElement)({ id: 'canvas' });
	      this._canvas = document.createElement('canvas');
	      this.resize();

	      container.appendChild(this._canvas);
	      this._ctx = this._canvas.getContext('2d');

	      this._canvas.onmousedown = this._onMouseDown.bind(this);
	      this._canvas.onmouseup = this._onMouseUp.bind(this);
	      this._canvas.onmousemove = this._onMouseMove.bind(this);
	      this._canvas.ondblclick = this._onDoubleClick.bind(this);

	      document.onmouseup = this._bodyOnMouseUp.bind(this);
	    }

	    /** stats.js fps indicator */

	  }, {
	    key: '_initStats',
	    value: function _initStats() {
	      this._stats = new _statsJs2.default();
	      this._stats.domElement.style.position = 'absolute';
	      this._stats.domElement.style.right = 0;
	      this._stats.domElement.style.top = 0;
	      if ((0, _utils.isDevEnvironment)()) {
	        document.body.appendChild(this._stats.domElement);
	      }
	    }
	  }, {
	    key: '_requestRender',
	    value: function _requestRender() {
	      requestAnimationFrame(this._render.bind(this));
	    }
	  }, {
	    key: '_render',
	    value: function _render() {
	      this._requestRender();
	      this._stats.begin();
	      this._ctx.clearRect(0, 0, _constants.canvasDimensions.width, _constants.canvasDimensions.height);

	      if (this._cartogramReady) {
	        if (_constants.settings.displayGrid) {
	          this._gridGraphic.render(this._ctx);
	        }
	      }
	      this._stats.end();
	    }
	  }, {
	    key: '_onMouseDown',
	    value: function _onMouseDown(event) {
	      this._gridGraphic.onMouseDown(event, this._ctx);
	    }
	  }, {
	    key: '_onMouseUp',
	    value: function _onMouseUp(event) {
	      this._gridGraphic.onMouseUp(event, this._ctx);
	    }
	  }, {
	    key: '_onMouseMove',
	    value: function _onMouseMove(event) {
	      this._gridGraphic.onMouseMove(event, this._ctx);
	    }
	  }, {
	    key: '_onDoubleClick',
	    value: function _onDoubleClick(event) {
	      this._gridGraphic.onDoubleClick(event, this._ctx);
	    }
	  }, {
	    key: '_bodyOnMouseUp',
	    value: function _bodyOnMouseUp(event) {
	      if (event.target === this._canvas) {
	        return;
	      }
	      this._gridGraphic.bodyOnMouseUp(event, this.ctx);
	    }
	  }]);

	  return Canvas;
	}();

	exports.default = new Canvas();

/***/ },
/* 4 */
/***/ function(module, exports) {

	// stats.js - http://github.com/mrdoob/stats.js
	var Stats=function(){var l=Date.now(),m=l,g=0,n=Infinity,o=0,h=0,p=Infinity,q=0,r=0,s=0,f=document.createElement("div");f.id="stats";f.addEventListener("mousedown",function(b){b.preventDefault();t(++s%2)},!1);f.style.cssText="width:80px;opacity:0.9;cursor:pointer";var a=document.createElement("div");a.id="fps";a.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#002";f.appendChild(a);var i=document.createElement("div");i.id="fpsText";i.style.cssText="color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
	i.innerHTML="FPS";a.appendChild(i);var c=document.createElement("div");c.id="fpsGraph";c.style.cssText="position:relative;width:74px;height:30px;background-color:#0ff";for(a.appendChild(c);74>c.children.length;){var j=document.createElement("span");j.style.cssText="width:1px;height:30px;float:left;background-color:#113";c.appendChild(j)}var d=document.createElement("div");d.id="ms";d.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";f.appendChild(d);var k=document.createElement("div");
	k.id="msText";k.style.cssText="color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";k.innerHTML="MS";d.appendChild(k);var e=document.createElement("div");e.id="msGraph";e.style.cssText="position:relative;width:74px;height:30px;background-color:#0f0";for(d.appendChild(e);74>e.children.length;)j=document.createElement("span"),j.style.cssText="width:1px;height:30px;float:left;background-color:#131",e.appendChild(j);var t=function(b){s=b;switch(s){case 0:a.style.display=
	"block";d.style.display="none";break;case 1:a.style.display="none",d.style.display="block"}};return{REVISION:12,domElement:f,setMode:t,begin:function(){l=Date.now()},end:function(){var b=Date.now();g=b-l;n=Math.min(n,g);o=Math.max(o,g);k.textContent=g+" MS ("+n+"-"+o+")";var a=Math.min(30,30-30*(g/200));e.appendChild(e.firstChild).style.height=a+"px";r++;b>m+1E3&&(h=Math.round(1E3*r/(b-m)),p=Math.min(p,h),q=Math.max(q,h),i.textContent=h+" FPS ("+p+"-"+q+")",a=Math.min(30,30-30*(h/100)),c.appendChild(c.firstChild).style.height=
	a+"px",m=b,r=0);return b},update:function(){l=this.end()}}};"object"===typeof module&&(module.exports=Stats);


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _hull = __webpack_require__(6);

	var _hull2 = _interopRequireDefault(_hull);

	var _densityClustering = __webpack_require__(11);

	var _polygonOverlap = __webpack_require__(16);

	var _polygonOverlap2 = _interopRequireDefault(_polygonOverlap);

	var _Graphic2 = __webpack_require__(19);

	var _Graphic3 = _interopRequireDefault(_Graphic2);

	var _utils = __webpack_require__(20);

	var _GridGeometry = __webpack_require__(21);

	var _GridGeometry2 = _interopRequireDefault(_GridGeometry);

	var _constants = __webpack_require__(22);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var GridGraphic = function (_Graphic) {
	  _inherits(GridGraphic, _Graphic);

	  function GridGraphic() {
	    _classCallCheck(this, GridGraphic);

	    var _this = _possibleConstructorReturn(this, (GridGraphic.__proto__ || Object.getPrototypeOf(GridGraphic)).call(this));

	    _this._highlightId = null;
	    _this._makingMarqueeSelection = false;
	    _this._draggingMultiSelect = false;
	    _this._selectedTiles = [];
	    _this._highlightFromOutsideGrid = false;
	    _this._mouseAt = { x: 0, y: 0 };
	    _this._hasBeenEdited = false;
	    document.body.onkeydown = _this.onkeydown.bind(_this);
	    return _this;
	  }

	  _createClass(GridGraphic, [{
	    key: 'onMouseDown',
	    value: function onMouseDown(event) {
	      document.activeElement.blur();
	      event.preventDefault();
	      var position = _GridGeometry2.default.getPositionFromScreen(event.offsetX, event.offsetY);
	      var tile = this._findTile(position);
	      if (tile == null || this._selectedTiles.includes(tile)) {
	        this._onMarqueeMouseDown(event);
	      } else {
	        this._onArrowMouseDown(event);
	      }
	    }
	  }, {
	    key: '_onArrowMouseDown',
	    value: function _onArrowMouseDown(event) {
	      if (this._tiles) {
	        var position = _GridGeometry2.default.getPositionFromScreen(event.offsetX, event.offsetY);
	        var tile = this._findTile(position);
	        // Deselect if clicking on null tile, otherwise select tile and/or allow drag
	        if (tile == null) {
	          this._selectedTiles.length = 0;
	          return;
	        }
	        if (this._selectedTiles[0] !== tile) {
	          this._selectedTiles.length = 0;
	          this._draggingMultiSelect = true;
	          this._draggingMultiSelectOrigin = {
	            x: event.offsetX,
	            y: event.offsetY
	          };
	          this._selectedTiles.push(tile);
	        }
	      }
	    }
	  }, {
	    key: '_onMarqueeMouseDown',
	    value: function _onMarqueeMouseDown(event) {
	      if (this._tiles) {
	        var createMarquee = true;
	        // check if mouse on currently selected marquee tiles
	        if (this._selectedTiles.length > 0) {
	          var position = _GridGeometry2.default.getPositionFromScreen(event.offsetX, event.offsetY);
	          var tile = this._findTile(position);
	          if (this._selectedTiles.includes(tile)) {
	            createMarquee = false;
	            this._draggingMultiSelect = true;
	            this._draggingMultiSelectOrigin = {
	              x: event.offsetX,
	              y: event.offsetY
	            };
	          }
	        }

	        // else start a marquee
	        if (createMarquee) {
	          this._marqueeStart = this._mouseAt;
	          this._makingMarqueeSelection = true;
	        }
	      }
	    }
	  }, {
	    key: '_getMarqueeSelection',
	    value: function _getMarqueeSelection() {
	      var marqueeBounds = {
	        x1: Math.min(this._marqueeStart.x * _constants.devicePixelRatio, this._mouseAt.x * _constants.devicePixelRatio),
	        x2: Math.max(this._marqueeStart.x * _constants.devicePixelRatio, this._mouseAt.x * _constants.devicePixelRatio),
	        y1: Math.min(this._marqueeStart.y * _constants.devicePixelRatio, this._mouseAt.y * _constants.devicePixelRatio),
	        y2: Math.max(this._marqueeStart.y * _constants.devicePixelRatio, this._mouseAt.y * _constants.devicePixelRatio)
	      };
	      return this._tiles.filter(function (tile) {
	        var center = _GridGeometry2.default.tileCenterPoint(tile.position);
	        return (0, _polygonOverlap2.default)([[marqueeBounds.x1, marqueeBounds.y1], [marqueeBounds.x2, marqueeBounds.y1], [marqueeBounds.x2, marqueeBounds.y2], [marqueeBounds.x1, marqueeBounds.y2]], _GridGeometry2.default.getPointsAround(center));
	      });
	    }
	  }, {
	    key: 'onMouseUp',
	    value: function onMouseUp(event) {
	      var _this2 = this;

	      if (this._makingMarqueeSelection) {
	        this._selectedTiles = this._getMarqueeSelection();
	        this._makingMarqueeSelection = false;
	      } else if (this._draggingMultiSelect) {
	        (function () {
	          // we need to offset each selected tile by the amount the mouse moved,
	          // we cannot just put each tile where the mouse is as some will not be under the mouse
	          // when the mouse went down. calculated to where the mouse went down when
	          // dragging started.
	          var offset = {
	            x: event.offsetX - _this2._draggingMultiSelectOrigin.x,
	            y: event.offsetY - _this2._draggingMultiSelectOrigin.y
	          };

	          // special case for new tiles, there is only one of them at a time
	          // so they can just go where the mouse is
	          if (_this2._selectedTiles[0] === _this2._newTile) {
	            offset.x = event.offsetX;
	            offset.y = event.offsetY;
	          }

	          // determine where each tile is going to be moved to
	          var counts = _GridGeometry2.default.getTileCounts();
	          var overlaps = _this2._selectedTiles.some(function (tile) {
	            // figure out where in XY space this tile currently is
	            var tileXY = _GridGeometry2.default.tileCenterPoint(tile.position);
	            // add in the offset of the moved mouse (accounting for DPI)
	            tileXY.x = tileXY.x / _constants.devicePixelRatio + offset.x;
	            tileXY.y = tileXY.y / _constants.devicePixelRatio + offset.y;
	            // convert back to hex coordinates
	            tile.newPosition = _GridGeometry2.default.getPositionFromScreen(tileXY.x, tileXY.y);
	            // check to see if a tile exists at that place
	            var overlappingTile = _this2._findTile(tile.newPosition);
	            // if there is an overlapping tile
	            if (overlappingTile) {
	              // and it's not currently selected
	              if (!_this2._selectedTiles.includes(overlappingTile)) {
	                // bail, we are moving a tile to where a tile already exists.
	                return true;
	              }
	            }
	            if (tile.newPosition.x > counts.width || tile.newPosition.y > counts.height) {
	              // bail, we are moving offscreen
	              return true;
	            }
	            return false;
	          });

	          // nothing is overlapping
	          if (!overlaps) {
	            // check to see if has actually moved
	            var movedTilesLength = _this2._selectedTiles.filter(function (tile) {
	              return tile.position.x !== tile.newPosition.x && tile.position.y !== tile.newPosition.y;
	            }).length;
	            // if so, notify editing
	            if (movedTilesLength > 0) {
	              _this2._setToEditingMode();
	            }
	            // actually update the tile positions
	            _this2._selectedTiles.forEach(function (tile) {
	              tile.position = tile.newPosition;
	              delete tile.newPosition;
	            });
	          } else if (_this2._selectedTiles[0] === _this2._newTile) {
	            // there exists overlaps on a new tile, remove new tile
	            _this2._newTile = null;
	            _this2._selectedTiles.length = 0;
	          }

	          if (_this2._selectedTiles[0] === _this2._newTile) {
	            // add new tile to list of tiles
	            _this2._tiles.push(_this2._newTile);
	            _this2._setToEditingMode();
	            _this2.updateUi();
	            _this2._newTile = null;
	          }
	          _this2._draggingMultiSelect = false;
	          _this2._positionClusterLabels();
	        })();
	      }
	    }
	  }, {
	    key: 'bodyOnMouseUp',
	    value: function bodyOnMouseUp() {
	      if (this._makingMarqueeSelection) {
	        this._makingMarqueeSelection = false;
	      } else if (this._draggingMultiSelect) {
	        this._draggingMultiSelect = false;
	      }
	    }
	  }, {
	    key: 'onMouseMove',
	    value: function onMouseMove(event) {
	      if (this._tiles) {
	        this._mouseAt = {
	          x: event.offsetX,
	          y: event.offsetY
	        };
	        if (this._makingMarqueeSelection) {
	          this._selectedTiles = this._getMarqueeSelection();
	        }
	        var position = _GridGeometry2.default.getPositionFromScreen(this._mouseAt.x, this._mouseAt.y);
	        var tile = this._findTile(position);
	        if (!tile) {
	          this._highlightId = null;
	          return;
	        }
	        this._highlightId = tile.id;
	      }
	    }
	  }, {
	    key: 'onDoubleClick',
	    value: function onDoubleClick(event) {
	      var _this3 = this;

	      if (this._tiles) {
	        (function () {
	          var position = _GridGeometry2.default.getPositionFromScreen(event.offsetX, event.offsetY);
	          var tile = _this3._findTile(position);
	          if (tile) {
	            _this3._deselectTile();
	            _this3._selectedTiles = _this3._tiles.filter(function (t) {
	              return t.id === tile.id;
	            });
	          }
	        })();
	      }
	    }
	  }, {
	    key: 'onHighlightGeo',
	    value: function onHighlightGeo(id) {
	      this._highlightId = id;
	      this._highlightFromOutsideGrid = true;
	    }
	  }, {
	    key: 'resetHighlightedGeo',
	    value: function resetHighlightedGeo() {
	      this._highlightId = null;
	      this._highlightFromOutsideGrid = false;
	    }
	  }, {
	    key: 'onkeydown',
	    value: function onkeydown(event) {
	      var _this4 = this;

	      if (event.target.type === 'textarea' || event.target.type === 'text') {
	        return; // ignore delete events from textareas
	      }
	      var key = event.keyCode || event.charCode;
	      if (key === 8 || key === 46) {
	        event.preventDefault();
	        this._selectedTiles.forEach(function (tile) {
	          _this4._deleteTile(tile);
	        });
	        this._selectedTiles.length = 0;
	        this._setToEditingMode();
	        this.updateUi();
	      }
	    }
	  }, {
	    key: 'onChange',
	    value: function onChange(callback) {
	      this._onChangeCallback = callback;
	    }
	  }, {
	    key: '_deselectTile',
	    value: function _deselectTile() {
	      if (this._selectedTiles.length !== 0) {
	        this._selectedTiles.length = 0;
	        this._makingMarqueeSelection = false;
	        this._draggingMultiSelect = false;
	      }
	    }
	  }, {
	    key: 'onAddTileMouseDown',
	    value: function onAddTileMouseDown(id) {
	      this._deselectTile();
	      this._newTile = {
	        id: id,
	        position: {
	          x: -1,
	          y: -1
	        }
	      };
	      this._draggingMultiSelect = true;
	      this._draggingMultiSelectOrigin = {
	        x: this._mouseAt.x,
	        y: this._mouseAt.y
	      };
	      this._mouseAt = { x: -1, y: -1 };
	      this._selectedTiles.length = 0;
	      this._selectedTiles.push(this._newTile);
	    }
	  }, {
	    key: '_deleteTile',
	    value: function _deleteTile(selected) {
	      this._tiles = this._tiles.filter(function (tile) {
	        return tile.position.x !== selected.position.x || tile.position.y !== selected.position.y;
	      });
	    }

	    /** Populate tiles based on given TopoJSON-backed map graphic */

	  }, {
	    key: 'populateTiles',
	    value: function populateTiles(mapGraphic, properties) {
	      var _this5 = this;

	      var hasProperties = Array.isArray(properties);
	      this._tiles = [];
	      this._deselectTile();
	      _GridGeometry2.default.forEachTilePosition(function (x, y) {
	        var point = _GridGeometry2.default.tileCenterPoint({ x: x, y: y });
	        var feature = mapGraphic.getFeatureAtPoint(point);
	        if (feature) {
	          var tile = {
	            id: feature.id,
	            position: { x: x, y: y }
	          };
	          if (hasProperties) {
	            var tileProperty = properties.find(function (property) {
	              return property[0] === feature.id;
	            });
	            if (tileProperty) {
	              tile.tilegramValue = tileProperty[1];
	            }
	          }
	          _this5._tiles.push(tile);
	        }
	      });
	      this._hasBeenEdited = false; // reset edit state
	      this.updateUi();
	      this.renderBackgroundImage();
	      this._positionClusterLabels();
	      return this._tiles;
	    }
	  }, {
	    key: 'importTiles',
	    value: function importTiles(tiles) {
	      this._deselectTile();
	      var maxX = Math.max.apply(Math, _toConsumableArray(tiles.map(function (tile) {
	        return tile.position.x;
	      })));
	      var maxY = Math.max.apply(Math, _toConsumableArray(tiles.map(function (tile) {
	        return tile.position.y;
	      })));
	      _GridGeometry2.default.setTileEdgeFromMax(maxX, maxY);
	      this._tiles = tiles;
	      this.renderBackgroundImage();
	      this._positionClusterLabels();
	    }
	  }, {
	    key: 'getTiles',
	    value: function getTiles() {
	      return this._tiles;
	    }
	  }, {
	    key: '_findTile',
	    value: function _findTile(position) {
	      return this._tiles.find(function (tile) {
	        return tile.position.x === position.x && tile.position.y === position.y;
	      });
	    }
	  }, {
	    key: '_disableSelectionHighlight',
	    value: function _disableSelectionHighlight() {
	      return this._highlightId !== null && this._highlightFromOutsideGrid && !this._newTile && !this._draggingMultiSelect;
	    }
	  }, {
	    key: 'checkForEdits',
	    value: function checkForEdits() {
	      return this._hasBeenEdited;
	    }
	  }, {
	    key: 'resetEdits',
	    value: function resetEdits() {
	      this._hasBeenEdited = false;
	    }
	  }, {
	    key: 'renderBackgroundImage',
	    value: function renderBackgroundImage() {
	      var _this6 = this;

	      this._backgroundCanvas = document.createElement('canvas');
	      this._backgroundCanvas.width = _constants.canvasDimensions.width;
	      this._backgroundCanvas.height = _constants.canvasDimensions.height;
	      var ctx = this._backgroundCanvas.getContext('2d');
	      _GridGeometry2.default.forEachTilePosition(function (x, y) {
	        _this6._drawTile({ x: x, y: y }, '#fff', { ctx: ctx });
	      });
	    }
	  }, {
	    key: 'render',
	    value: function render(ctx) {
	      var _this7 = this;

	      this._ctx = ctx;

	      this._populateTileIdArray();

	      // background pattern
	      ctx.drawImage(this._backgroundCanvas, 0, 0);

	      // draw tiles and inland borders
	      this._tiles.forEach(function (tile) {
	        var color = (0, _utils.fipsColor)(tile.id);
	        if (!_this7._disableSelectionHighlight() && _this7._selectedTiles.includes(tile)) {
	          color = _constants.movingTileOriginalPositionColor;
	        }
	        _this7._drawTile(tile.position, color, {});
	        _this7._drawInlandBoundaries(tile);
	      });

	      // draw highlighted region border
	      if (this._highlightId && !this._makingMarqueeSelection && !this._draggingMultiSelect) {
	        this._drawGeoBorder(this._highlightId);
	        this._showGeoName(this._highlightId);
	      }

	      // draw selected tiles
	      if (this._selectedTiles.length > 0 && !this._disableSelectionHighlight()) {
	        this._selectedTiles.forEach(function (tile) {
	          var position = tile.position;
	          if (_this7._draggingMultiSelect) {
	            var offset = {
	              x: _this7._mouseAt.x - _this7._draggingMultiSelectOrigin.x,
	              y: _this7._mouseAt.y - _this7._draggingMultiSelectOrigin.y
	            };
	            if (_this7._selectedTiles[0] === _this7._newTile) {
	              offset.x = _this7._mouseAt.x;
	              offset.y = _this7._mouseAt.y;
	            }

	            var tileXY = _GridGeometry2.default.tileCenterPoint(position);
	            tileXY.x = tileXY.x / _constants.devicePixelRatio + offset.x;
	            tileXY.y = tileXY.y / _constants.devicePixelRatio + offset.y;
	            position = _GridGeometry2.default.getPositionFromScreen(tileXY.x, tileXY.y);
	          }
	          _this7._drawTile(position, (0, _utils.fipsColor)(tile.id), { drawStroke: true });
	        });
	      }

	      // draw marquee
	      if (this._makingMarqueeSelection) {
	        this._drawMarqueeSelection();
	      }

	      this._drawClusterLabels();
	    }
	  }, {
	    key: '_positionClusterLabels',
	    value: function _positionClusterLabels() {
	      var _this8 = this;

	      var ids = new Set(this._tiles.map(function (t) {
	        return t.id;
	      }));
	      this._labels = Array.from(ids).map(function (id) {
	        var tiles = _this8._getTilesById(id);
	        var clusters = _this8._computeClusters(tiles);
	        var biggestCluster = [];
	        clusters.forEach(function (cluster) {
	          if (cluster.length > biggestCluster.length) {
	            biggestCluster = cluster;
	          }
	        });
	        var clusterSum = biggestCluster.reduce(function (previous, point) {
	          return [previous[0] + point[0], previous[1] + point[1]];
	        }, [0, 0]);
	        return {
	          id: id,
	          position: {
	            x: clusterSum[0] / biggestCluster.length,
	            y: clusterSum[1] / biggestCluster.length
	          }
	        };
	      });
	    }
	  }, {
	    key: '_drawClusterLabels',
	    value: function _drawClusterLabels() {
	      var _this9 = this;

	      this._labels.forEach(function (label) {
	        _this9._ctx.textAlign = 'center';
	        _this9._ctx.textBaseline = 'middle';
	        _this9._ctx.fillStyle = 'black';
	        _this9._ctx.font = 12.0 * _constants.devicePixelRatio + 'px Fira Sans';
	        var geoCode = _this9.geoCodeToName[label.id];
	        var text = geoCode ? geoCode.name_short || label.id : label.id;
	        _this9._ctx.fillText(text, label.position.x, label.position.y);
	      });
	    }
	  }, {
	    key: '_drawMarqueeSelection',
	    value: function _drawMarqueeSelection() {
	      var _ctx, _ctx2;

	      var rect = [this._marqueeStart.x * _constants.devicePixelRatio, this._marqueeStart.y * _constants.devicePixelRatio, this._mouseAt.x * _constants.devicePixelRatio - this._marqueeStart.x * _constants.devicePixelRatio, this._mouseAt.y * _constants.devicePixelRatio - this._marqueeStart.y * _constants.devicePixelRatio];

	      // stroke
	      this._ctx.strokeStyle = '#333';
	      this._ctx.lineWidth = 0.25 * _constants.devicePixelRatio;
	      (_ctx = this._ctx).strokeRect.apply(_ctx, rect);

	      // fill
	      this._ctx.globalAlpha = 0.1;
	      this._ctx.fillStyle = '#666';
	      (_ctx2 = this._ctx).fillRect.apply(_ctx2, rect);
	      this._ctx.globalAlpha = 1.0;
	    }

	    /** http://www.redblobgames.com/gridGeometrys/hexagons/#basics */

	  }, {
	    key: '_drawTile',
	    value: function _drawTile(position, fill, _ref) {
	      var drawStroke = _ref.drawStroke;
	      var ctx = _ref.ctx;

	      drawStroke = drawStroke || false;
	      ctx = ctx || this._ctx;
	      var center = _GridGeometry2.default.tileCenterPoint(position);
	      var points = _GridGeometry2.default.getPointsAround(center);
	      ctx.beginPath();
	      points.forEach(function (point, index) {
	        var _ctx3;

	        var command = index === 0 ? 'moveTo' : 'lineTo';
	        (_ctx3 = ctx)[command].apply(_ctx3, _toConsumableArray(point));
	      });
	      ctx.closePath();
	      if (fill) {
	        ctx.fillStyle = fill;
	        ctx.fill();
	      }
	      if (drawStroke) {
	        ctx.strokeStyle = _constants.selectedTileBorderColor;
	        ctx.lineWidth = 1.0 * _constants.devicePixelRatio;
	        ctx.stroke();
	      }
	    }

	    /** Draw border around geo using convex hull algorithm */

	  }, {
	    key: '_drawGeoBorder',
	    value: function _drawGeoBorder(id) {
	      var _this10 = this;

	      var tiles = this._getTilesById(id);
	      var clusters = this._computeClusters(tiles);
	      var paths = clusters.map(function (cluster) {
	        return (0, _hull2.default)(cluster, _GridGeometry2.default.getTileEdge() // 'concavity', a.k.a. max edge length
	        );
	      });
	      paths.forEach(function (path) {
	        _this10._ctx.beginPath();
	        path.forEach(function (point, index) {
	          var _ctx4;

	          var command = index === 0 ? 'moveTo' : 'lineTo';
	          (_ctx4 = _this10._ctx)[command].apply(_ctx4, _toConsumableArray(point));
	        });
	        _this10._ctx.closePath();
	        _this10._ctx.globalAlpha = 0.75;
	        _this10._ctx.strokeStyle = _constants.hoveredTileBorderColor;
	        _this10._ctx.lineWidth = 1.0 * _constants.devicePixelRatio;
	        _this10._ctx.stroke();
	        _this10._ctx.globalAlpha = 1.0;
	      });
	    }
	  }, {
	    key: '_showGeoName',
	    value: function _showGeoName(id) {
	      this._ctx.textAlign = 'left';
	      this._ctx.textBaseline = 'top';
	      this._ctx.fillStyle = 'black';
	      this._ctx.font = 14.0 * _constants.devicePixelRatio + 'px Fira Sans';
	      var geoCode = this.geoCodeToName[id];
	      var text = geoCode ? geoCode.name : id;
	      this._ctx.fillText(text, 40, 30);
	    }

	    /** Compute contiguous outline (convex hull) of given tiles */

	  }, {
	    key: '_computeOutlinePaths',
	    value: function _computeOutlinePaths(tiles) {
	      return this._clusters(tiles, true);
	    }

	    /** Compute clusters returning each cluster for given tiles */

	  }, {
	    key: '_computeClusters',
	    value: function _computeClusters(tiles) {
	      // collect unique points for tiles
	      var points = [];
	      tiles.forEach(function (tile) {
	        var center = _GridGeometry2.default.tileCenterPoint(tile.position);
	        var hexagonPoints = _GridGeometry2.default.getPointsAround(center);
	        hexagonPoints.forEach(function (point) {
	          if (points.indexOf(point) === -1) {
	            points.push(point);
	          }
	        });
	      });

	      // cluster points, returns clusters with indicies to original points
	      var dbscan = new _densityClustering.DBSCAN();
	      var clusters = dbscan.run(points, _GridGeometry2.default.getTileEdge(), // neighborhood radius
	      2 // min points per cluster
	      );
	      // deindex and return clusters
	      return clusters.map(function (clusterIndices) {
	        return clusterIndices.map(function (index) {
	          return points[index];
	        });
	      });
	    }

	    /** Check three of six hex sides and determine whether to draw a boundary */

	  }, {
	    key: '_drawInlandBoundaries',
	    value: function _drawInlandBoundaries(tile) {
	      var position = tile.position;
	      var id = tile.id;

	      var center = _GridGeometry2.default.tileCenterPoint(position);
	      var points = _GridGeometry2.default.getPointsAround(center, true);

	      var adjacentRight = this._isAbutting(position, { x: 1, y: 0 }, id);
	      var adjacentLowerRight = this._isAbutting(position, { x: position.y % 2 === 1 ? 0 : 1, y: 1 }, id);
	      var adjacentLowerLeft = this._isAbutting(position, { x: position.y % 2 === 0 ? 0 : -1, y: 1 }, id);

	      if (adjacentRight) {
	        this._drawBoundaryLine(points[2], points[3]);
	      }
	      if (adjacentLowerRight) {
	        this._drawBoundaryLine(points[3], points[4]);
	      }
	      if (adjacentLowerLeft) {
	        this._drawBoundaryLine(points[4], points[5]);
	      }
	    }
	  }, {
	    key: '_drawBoundaryLine',
	    value: function _drawBoundaryLine(fromPoint, toPoint) {
	      var _ctx5, _ctx6;

	      this._ctx.beginPath();
	      (_ctx5 = this._ctx).moveTo.apply(_ctx5, _toConsumableArray(fromPoint));
	      (_ctx6 = this._ctx).lineTo.apply(_ctx6, _toConsumableArray(toPoint));
	      this._ctx.closePath();
	      this._ctx.strokeStyle = _constants.selectedTileBorderColor;
	      this._ctx.lineWidth = 1.0 * _constants.devicePixelRatio;
	      this._ctx.stroke();
	    }

	    /** Populate once to make boundary calculations faster */

	  }, {
	    key: '_populateTileIdArray',
	    value: function _populateTileIdArray() {
	      var _this11 = this;

	      var counts = _GridGeometry2.default.getTileCounts();
	      this._tileIdArray = new Array(counts.width).fill([]).map(function () {
	        return new Array(counts.height);
	      });
	      this._tiles.forEach(function (tile) {
	        var column = _this11._tileIdArray[tile.position.x];
	        if (!column) {
	          return;
	        }
	        column[tile.position.y] = tile.id;
	      });
	    }
	  }, {
	    key: '_isAbutting',
	    value: function _isAbutting(position, offset, checkId) {
	      var column = this._tileIdArray[position.x + offset.x];
	      if (!column) {
	        return false;
	      }
	      var id = column[position.y + offset.y];
	      return id != null && id !== checkId;
	    }
	  }, {
	    key: 'updateUi',
	    value: function updateUi() {
	      if (this._onChangeCallback) {
	        this._onChangeCallback();
	      }
	    }

	    /**
	     * sets ._hasBeenEdited to true to notify user of possible edit loss
	     * ensures UI is in editing mode
	     */

	  }, {
	    key: '_setToEditingMode',
	    value: function _setToEditingMode() {
	      this._hasBeenEdited = true;
	      this._setUiEditing();
	    }
	  }, {
	    key: 'setUiEditingCallback',
	    value: function setUiEditingCallback(callback) {
	      this._setUiEditing = callback;
	    }
	  }, {
	    key: '_getTilesById',
	    value: function _getTilesById(id) {
	      return this._tiles.filter(function (tile) {
	        return tile.id === id;
	      });
	    }
	  }]);

	  return GridGraphic;
	}(_Graphic3.default);

	exports.default = GridGraphic;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 (c) 2014-2016, Andrii Heonia
	 Hull.js, a JavaScript library for concave hull generation by set of points.
	 https://github.com/AndriiHeonia/hull
	*/

	'use strict';

	var intersect = __webpack_require__(7);
	var grid = __webpack_require__(8);
	var formatUtil = __webpack_require__(9);
	var convexHull = __webpack_require__(10);

	function _filterDuplicates(pointset) {
	    return pointset.filter(function(el, idx, arr) {
	        var prevEl = arr[idx - 1];
	        return idx === 0 || !(prevEl[0] === el[0] && prevEl[1] === el[1]);
	    });
	}

	function _sortByX(pointset) {
	    return pointset.sort(function(a, b) {
	        if (a[0] == b[0]) {
	            return a[1] - b[1];
	        } else {
	            return a[0] - b[0];
	        }
	    });
	}

	function _sqLength(a, b) {
	    return Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2);
	}

	function _cos(o, a, b) {
	    var aShifted = [a[0] - o[0], a[1] - o[1]],
	        bShifted = [b[0] - o[0], b[1] - o[1]],
	        sqALen = _sqLength(o, a),
	        sqBLen = _sqLength(o, b),
	        dot = aShifted[0] * bShifted[0] + aShifted[1] * bShifted[1];

	    return dot / Math.sqrt(sqALen * sqBLen);
	}

	function _intersect(segment, pointset) {
	    for (var i = 0; i < pointset.length - 1; i++) {
	        var seg = [pointset[i], pointset[i + 1]];
	        if (segment[0][0] === seg[0][0] && segment[0][1] === seg[0][1] ||
	            segment[0][0] === seg[1][0] && segment[0][1] === seg[1][1]) {
	            continue;
	        }
	        if (intersect(segment, seg)) {
	            return true;
	        }
	    }
	    return false;
	}

	function _occupiedArea(pointset) {
	    var minX = Infinity,
	        minY = Infinity,
	        maxX = -Infinity,
	        maxY = -Infinity;

	    for (var i = pointset.length - 1; i >= 0; i--) {
	        if (pointset[i][0] < minX) {
	            minX = pointset[i][0];
	        }
	        if (pointset[i][1] < minY) {
	            minY = pointset[i][1];
	        }
	        if (pointset[i][0] > maxX) {
	            maxX = pointset[i][0];
	        }
	        if (pointset[i][1] > maxY) {
	            maxY = pointset[i][1];
	        }
	    }

	    return [
	        maxX - minX, // width
	        maxY - minY  // height
	    ];
	}

	function _bBoxAround(edge) {
	    return [
	        Math.min(edge[0][0], edge[1][0]), // left
	        Math.min(edge[0][1], edge[1][1]), // top
	        Math.max(edge[0][0], edge[1][0]), // right
	        Math.max(edge[0][1], edge[1][1])  // bottom
	    ];
	}

	function _midPoint(edge, innerPoints, convex) {
	    var point = null,
	        angle1Cos = MAX_CONCAVE_ANGLE_COS,
	        angle2Cos = MAX_CONCAVE_ANGLE_COS,
	        a1Cos, a2Cos;

	    for (var i = 0; i < innerPoints.length; i++) {
	        a1Cos = _cos(edge[0], edge[1], innerPoints[i]);
	        a2Cos = _cos(edge[1], edge[0], innerPoints[i]);

	        if (a1Cos > angle1Cos && a2Cos > angle2Cos &&
	            !_intersect([edge[0], innerPoints[i]], convex) &&
	            !_intersect([edge[1], innerPoints[i]], convex)) {

	            angle1Cos = a1Cos;
	            angle2Cos = a2Cos;
	            point = innerPoints[i];
	        }
	    }

	    return point;
	}

	function _concave(convex, maxSqEdgeLen, maxSearchArea, grid, edgeSkipList) {
	    var edge,
	        keyInSkipList,
	        scaleFactor,
	        midPoint,
	        bBoxAround,
	        bBoxWidth,
	        bBoxHeight,
	        midPointInserted = false;

	    for (var i = 0; i < convex.length - 1; i++) {
	        edge = [convex[i], convex[i + 1]];
	        keyInSkipList = edge[0].join() + ',' + edge[1].join();

	        if (_sqLength(edge[0], edge[1]) < maxSqEdgeLen ||
	            edgeSkipList[keyInSkipList] === true) { continue; }

	        scaleFactor = 0;
	        bBoxAround = _bBoxAround(edge);
	        do {
	            bBoxAround = grid.extendBbox(bBoxAround, scaleFactor);
	            bBoxWidth = bBoxAround[2] - bBoxAround[0];
	            bBoxHeight = bBoxAround[3] - bBoxAround[1];

	            midPoint = _midPoint(edge, grid.rangePoints(bBoxAround), convex);            
	            scaleFactor++;
	        }  while (midPoint === null && (maxSearchArea[0] > bBoxWidth || maxSearchArea[1] > bBoxHeight));

	        if (bBoxWidth >= maxSearchArea[0] && bBoxHeight >= maxSearchArea[1]) {
	            edgeSkipList[keyInSkipList] = true;
	        }

	        if (midPoint !== null) {
	            convex.splice(i + 1, 0, midPoint);
	            grid.removePoint(midPoint);
	            midPointInserted = true;
	        }
	    }

	    if (midPointInserted) {
	        return _concave(convex, maxSqEdgeLen, maxSearchArea, grid, edgeSkipList);
	    }

	    return convex;
	}

	function hull(pointset, concavity, format) {
	    var convex,
	        concave,
	        innerPoints,
	        occupiedArea,
	        maxSearchArea,
	        cellSize,
	        points,
	        maxEdgeLen = concavity || 20;

	    if (pointset.length < 4) {
	        return pointset.slice();
	    }

	    points = _filterDuplicates(_sortByX(formatUtil.toXy(pointset, format)));

	    occupiedArea = _occupiedArea(points);
	    maxSearchArea = [
	        occupiedArea[0] * MAX_SEARCH_BBOX_SIZE_PERCENT,
	        occupiedArea[1] * MAX_SEARCH_BBOX_SIZE_PERCENT
	    ];

	    convex = convexHull(points);
	    innerPoints = points.filter(function(pt) {
	        return convex.indexOf(pt) < 0;
	    });

	    cellSize = Math.ceil(1 / (points.length / (occupiedArea[0] * occupiedArea[1])));

	    concave = _concave(
	        convex, Math.pow(maxEdgeLen, 2),
	        maxSearchArea, grid(innerPoints, cellSize), {});
	 
	    return formatUtil.fromXy(concave, format);
	}

	var MAX_CONCAVE_ANGLE_COS = Math.cos(90 / (180 / Math.PI)); // angle = 90 deg
	var MAX_SEARCH_BBOX_SIZE_PERCENT = 0.6;

	module.exports = hull;

/***/ },
/* 7 */
/***/ function(module, exports) {

	function ccw(x1, y1, x2, y2, x3, y3) {           
	    var cw = ((y3 - y1) * (x2 - x1)) - ((y2 - y1) * (x3 - x1));
	    return cw > 0 ? true : cw < 0 ? false : true; // colinear
	}

	function intersect(seg1, seg2) {
	  var x1 = seg1[0][0], y1 = seg1[0][1],
	      x2 = seg1[1][0], y2 = seg1[1][1],
	      x3 = seg2[0][0], y3 = seg2[0][1],
	      x4 = seg2[1][0], y4 = seg2[1][1];

	    return ccw(x1, y1, x3, y3, x4, y4) !== ccw(x2, y2, x3, y3, x4, y4) && ccw(x1, y1, x2, y2, x3, y3) !== ccw(x1, y1, x2, y2, x4, y4);
	}

	module.exports = intersect;

/***/ },
/* 8 */
/***/ function(module, exports) {

	function Grid(points, cellSize) {
	    this._cells = [];
	    this._cellSize = cellSize;

	    points.forEach(function(point) {
	        var cellXY = this.point2CellXY(point),
	            x = cellXY[0],
	            y = cellXY[1];
	        if (this._cells[x] === undefined) {
	            this._cells[x] = [];
	        }
	        if (this._cells[x][y] === undefined) {
	            this._cells[x][y] = [];
	        }
	        this._cells[x][y].push(point);
	    }, this);
	}

	Grid.prototype = {
	    cellPoints: function(x, y) { // (Number, Number) -> Array
	        return (this._cells[x] !== undefined && this._cells[x][y] !== undefined) ? this._cells[x][y] : [];
	    },

	    rangePoints: function(bbox) { // (Array) -> Array
	        var tlCellXY = this.point2CellXY([bbox[0], bbox[1]]),
	            brCellXY = this.point2CellXY([bbox[2], bbox[3]]),
	            points = [];

	        for (var x = tlCellXY[0]; x <= brCellXY[0]; x++) {
	            for (var y = tlCellXY[1]; y <= brCellXY[1]; y++) {
	                points = points.concat(this.cellPoints(x, y));
	            }
	        }

	        return points;
	    },

	    removePoint: function(point) { // (Array) -> Array
	        var cellXY = this.point2CellXY(point),
	            cell = this._cells[cellXY[0]][cellXY[1]],
	            pointIdxInCell;
	        
	        for (var i = 0; i < cell.length; i++) {
	            if (cell[i][0] === point[0] && cell[i][1] === point[1]) {
	                pointIdxInCell = i;
	                break;
	            }
	        }

	        cell.splice(pointIdxInCell, 1);

	        return cell;
	    },

	    point2CellXY: function(point) { // (Array) -> Array
	        var x = parseInt(point[0] / this._cellSize),
	            y = parseInt(point[1] / this._cellSize);
	        return [x, y];
	    },

	    extendBbox: function(bbox, scaleFactor) { // (Array, Number) -> Array
	        return [
	            bbox[0] - (scaleFactor * this._cellSize),
	            bbox[1] - (scaleFactor * this._cellSize),
	            bbox[2] + (scaleFactor * this._cellSize),
	            bbox[3] + (scaleFactor * this._cellSize)
	        ];
	    }
	};

	function grid(points, cellSize) {
	    return new Grid(points, cellSize);
	}

	module.exports = grid;

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = {

	    toXy: function(pointset, format) {
	        if (format === undefined) {
	            return pointset.slice();
	        }
	        return pointset.map(function(pt) {
	            /*jslint evil: true */
	            var _getXY = new Function('pt', 'return [pt' + format[0] + ',' + 'pt' + format[1] + '];');
	            return _getXY(pt);
	        });
	    },

	    fromXy: function(pointset, format) {
	        if (format === undefined) {
	            return pointset.slice();
	        }
	        return pointset.map(function(pt) {
	            /*jslint evil: true */
	            var _getObj = new Function('pt', 'var o = {}; o' + format[0] + '= pt[0]; o' + format[1] + '= pt[1]; return o;');
	            return _getObj(pt);
	        });
	    }

	}

/***/ },
/* 10 */
/***/ function(module, exports) {

	function _cross(o, a, b) {
	    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
	}

	function _upperTangent(pointset) {
	    var lower = [];
	    for (var l = 0; l < pointset.length; l++) {
	        while (lower.length >= 2 && (_cross(lower[lower.length - 2], lower[lower.length - 1], pointset[l]) <= 0)) {
	            lower.pop();
	        }
	        lower.push(pointset[l]);
	    }
	    lower.pop();
	    return lower;
	}

	function _lowerTangent(pointset) {
	    var reversed = pointset.reverse(),
	        upper = [];
	    for (var u = 0; u < reversed.length; u++) {
	        while (upper.length >= 2 && (_cross(upper[upper.length - 2], upper[upper.length - 1], reversed[u]) <= 0)) {
	            upper.pop();
	        }
	        upper.push(reversed[u]);
	    }
	    upper.pop();
	    return upper;
	}

	// pointset has to be sorted by X
	function convex(pointset) {
	    var convex,
	        upper = _upperTangent(pointset),
	        lower = _lowerTangent(pointset);
	    convex = lower.concat(upper);
	    convex.push(pointset[0]);  
	    return convex;  
	}

	module.exports = convex;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	
	if (typeof module !== 'undefined' && module.exports) {
	    module.exports = {
	      DBSCAN: __webpack_require__(12),
	      KMEANS: __webpack_require__(13),
	      OPTICS: __webpack_require__(14),
	      PriorityQueue: __webpack_require__(15)
	    };
	}


/***/ },
/* 12 */
/***/ function(module, exports) {

	/**
	 * DBSCAN - Density based clustering
	 *
	 * @author Lukasz Krawczyk <contact@lukaszkrawczyk.eu>
	 * @copyright MIT
	 */

	/**
	 * DBSCAN class construcotr
	 * @constructor
	 *
	 * @param {Array} dataset
	 * @param {number} epsilon
	 * @param {number} minPts
	 * @param {function} distanceFunction
	 * @returns {DBSCAN}
	 */
	function DBSCAN(dataset, epsilon, minPts, distanceFunction) {
	  /** @type {Array} */
	  this.dataset = [];
	  /** @type {number} */
	  this.epsilon = 1;
	  /** @type {number} */
	  this.minPts = 2;
	  /** @type {function} */
	  this.distance = this._euclideanDistance;
	  /** @type {Array} */
	  this.clusters = [];
	  /** @type {Array} */
	  this.noise = [];

	  // temporary variables used during computation

	  /** @type {Array} */
	  this._visited = [];
	  /** @type {Array} */
	  this._assigned = [];
	  /** @type {number} */
	  this._datasetLength = 0;

	  this._init(dataset, epsilon, minPts, distanceFunction);
	};

	/******************************************************************************/
	// public functions

	/**
	 * Start clustering
	 *
	 * @param {Array} dataset
	 * @param {number} epsilon
	 * @param {number} minPts
	 * @param {function} distanceFunction
	 * @returns {undefined}
	 * @access public
	 */
	DBSCAN.prototype.run = function(dataset, epsilon, minPts, distanceFunction) {
	  this._init(dataset, epsilon, minPts, distanceFunction);

	  for (var pointId = 0; pointId < this._datasetLength; pointId++) {
	    // if point is not visited, check if it forms a cluster
	    if (this._visited[pointId] !== 1) {
	      this._visited[pointId] = 1;

	      // if closest neighborhood is too small to form a cluster, mark as noise
	      var neighbors = this._regionQuery(pointId);

	      if (neighbors.length < this.minPts) {
	        this.noise.push(pointId);
	      } else {
	        // create new cluster and add point
	        var clusterId = this.clusters.length;
	        this.clusters.push([]);
	        this._addToCluster(pointId, clusterId);

	        this._expandCluster(clusterId, neighbors);
	      }
	    }
	  }

	  return this.clusters;
	};

	/******************************************************************************/
	// protected functions

	/**
	 * Set object properties
	 *
	 * @param {Array} dataset
	 * @param {number} epsilon
	 * @param {number} minPts
	 * @param {function} distance
	 * @returns {undefined}
	 * @access protected
	 */
	DBSCAN.prototype._init = function(dataset, epsilon, minPts, distance) {

	  if (dataset) {

	    if (!(dataset instanceof Array)) {
	      throw Error('Dataset must be of type array, ' +
	        typeof dataset + ' given');
	    }

	    this.dataset = dataset;
	    this.clusters = [];
	    this.noise = [];

	    this._datasetLength = dataset.length;
	    this._visited = new Array(this._datasetLength);
	    this._assigned = new Array(this._datasetLength);
	  }

	  if (epsilon) {
	    this.epsilon = epsilon;
	  }

	  if (minPts) {
	    this.minPts = minPts;
	  }

	  if (distance) {
	    this.distance = distance;
	  }
	};

	/**
	 * Expand cluster to closest points of given neighborhood
	 *
	 * @param {number} clusterId
	 * @param {Array} neighbors
	 * @returns {undefined}
	 * @access protected
	 */
	DBSCAN.prototype._expandCluster = function(clusterId, neighbors) {

	  /**
	   * It's very important to calculate length of neighbors array each time,
	   * as the number of elements changes over time
	   */
	  for (var i = 0; i < neighbors.length; i++) {
	    var pointId2 = neighbors[i];

	    if (this._visited[pointId2] !== 1) {
	      this._visited[pointId2] = 1;
	      var neighbors2 = this._regionQuery(pointId2);

	      if (neighbors2.length >= this.minPts) {
	        neighbors = this._mergeArrays(neighbors, neighbors2);
	      }
	    }

	    // add to cluster
	    if (this._assigned[pointId2] !== 1) {
	      this._addToCluster(pointId2, clusterId);
	    }
	  }
	};

	/**
	 * Add new point to cluster
	 *
	 * @param {number} pointId
	 * @param {number} clusterId
	 */
	DBSCAN.prototype._addToCluster = function(pointId, clusterId) {
	  this.clusters[clusterId].push(pointId);
	  this._assigned[pointId] = 1;
	};

	/**
	 * Find all neighbors around given point
	 *
	 * @param {number} pointId,
	 * @param {number} epsilon
	 * @returns {Array}
	 * @access protected
	 */
	DBSCAN.prototype._regionQuery = function(pointId) {
	  var neighbors = [];

	  for (var id = 0; id < this._datasetLength; id++) {
	    var dist = this.distance(this.dataset[pointId], this.dataset[id]);
	    if (dist < this.epsilon) {
	      neighbors.push(id);
	    }
	  }

	  return neighbors;
	};

	/******************************************************************************/
	// helpers

	/**
	 * @param {Array} a
	 * @param {Array} b
	 * @returns {Array}
	 * @access protected
	 */
	DBSCAN.prototype._mergeArrays = function(a, b) {
	  var len = b.length;

	  for (var i = 0; i < len; i++) {
	    var P = b[i];
	    if (a.indexOf(P) < 0) {
	      a.push(P);
	    }
	  }

	  return a;
	};

	/**
	 * Calculate euclidean distance in multidimensional space
	 *
	 * @param {Array} p
	 * @param {Array} q
	 * @returns {number}
	 * @access protected
	 */
	DBSCAN.prototype._euclideanDistance = function(p, q) {
	  var sum = 0;
	  var i = Math.min(p.length, q.length);

	  while (i--) {
	    sum += (p[i] - q[i]) * (p[i] - q[i]);
	  }

	  return Math.sqrt(sum);
	};

	if (typeof module !== 'undefined' && module.exports) {
	  module.exports = DBSCAN;
	}


/***/ },
/* 13 */
/***/ function(module, exports) {

	/**
	 * KMEANS clustering
	 *
	 * @author Lukasz Krawczyk <contact@lukaszkrawczyk.eu>
	 * @copyright MIT
	 */

	/**
	 * KMEANS class constructor
	 * @constructor
	 *
	 * @param {Array} dataset
	 * @param {number} k - number of clusters
	 * @param {function} distance - distance function
	 * @returns {KMEANS}
	 */
	 function KMEANS(dataset, k, distance) {
	  this.k = 3; // number of clusters
	  this.dataset = []; // set of feature vectors
	  this.assignments = []; // set of associated clusters for each feature vector
	  this.centroids = []; // vectors for our clusters

	  this.init(dataset, k, distance);
	}

	/**
	 * @returns {undefined}
	 */
	KMEANS.prototype.init = function(dataset, k, distance) {
	  this.assignments = [];
	  this.centroids = [];

	  if (typeof dataset !== 'undefined') {
	    this.dataset = dataset;
	  }

	  if (typeof k !== 'undefined') {
	    this.k = k;
	  }

	  if (typeof distance !== 'undefined') {
	    this.distance = distance;
	  }
	};

	/**
	 * @returns {undefined}
	 */
	KMEANS.prototype.run = function(dataset, k) {
	  this.init(dataset, k);

	  var len = this.dataset.length;

	  // initialize centroids
	  for (var i = 0; i < this.k; i++) {
	    this.centroids[i] = this.randomCentroid();
		}

	  var change = true;
	  while(change) {

	    // assign feature vectors to clusters
	    change = this.assign();

	    // adjust location of centroids
	    for (var centroidId = 0; centroidId < this.k; centroidId++) {
	      var mean = new Array(maxDim);
	      var count = 0;

	      // init mean vector
	      for (var dim = 0; dim < maxDim; dim++) {
	        mean[dim] = 0;
	      }

	      for (var j = 0; j < len; j++) {
	        var maxDim = this.dataset[j].length;

	        // if current cluster id is assigned to point
	        if (centroidId === this.assignments[j]) {
	          for (var dim = 0; dim < maxDim; dim++) {
	            mean[dim] += this.dataset[j][dim];
	          }
	          count++;
	        }
	      }

	      if (count > 0) {
	        // if cluster contain points, adjust centroid position
	        for (var dim = 0; dim < maxDim; dim++) {
	          mean[dim] /= count;
	        }
	        this.centroids[centroidId] = mean;
	      } else {
	        // if cluster is empty, generate new random centroid
	        this.centroids[centroidId] = this.randomCentroid();
	        change = true;
	      }
	    }
	  }

	  return this.getClusters();
	};

	/**
	 * Generate random centroid
	 *
	 * @returns {Array}
	 */
	KMEANS.prototype.randomCentroid = function() {
	  var maxId = this.dataset.length -1;
	  var centroid;
	  var id;

	  do {
	    id = Math.round(Math.random() * maxId);
	    centroid = this.dataset[id];
	  } while (this.centroids.indexOf(centroid) >= 0);

	  return centroid;
	}

	/**
	 * Assign points to clusters
	 *
	 * @returns {boolean}
	 */
	KMEANS.prototype.assign = function() {
	  var change = false;
	  var len = this.dataset.length;
	  var closestCentroid;

	  for (var i = 0; i < len; i++) {
	    closestCentroid = this.argmin(this.dataset[i], this.centroids, this.distance);

	    if (closestCentroid != this.assignments[i]) {
	      this.assignments[i] = closestCentroid;
	      change = true;
	    }
	  }

	  return change;
	}

	/**
	 * Extract information about clusters
	 *
	 * @returns {undefined}
	 */
	KMEANS.prototype.getClusters = function() {
	  var clusters = new Array(this.k);
	  var centroidId;

	  for (var pointId = 0; pointId < this.assignments.length; pointId++) {
	    centroidId = this.assignments[pointId];

	    // init empty cluster
	    if (typeof clusters[centroidId] === 'undefined') {
	      clusters[centroidId] = [];
	    }

	    clusters[centroidId].push(pointId);
	  }

	  return clusters;
	};

	// utils

	/**
	 * @params {Array} point
	 * @params {Array.<Array>} set
	 * @params {Function} f
	 * @returns {number}
	 */
	KMEANS.prototype.argmin = function(point, set, f) {
	  var min = Number.MAX_VALUE;
	  var arg = 0;
	  var len = set.length;
	  var d;

	  for (var i = 0; i < len; i++) {
	    d = f(point, set[i]);
	    if (d < min) {
	      min = d;
	      arg = i;
	    }
	  }

	  return arg;
	};

	/**
	 * Euclidean distance
	 *
	 * @params {number} p
	 * @params {number} q
	 * @returns {number}
	 */
	KMEANS.prototype.distance = function(p, q) {
	  var sum = 0;
	  var i = Math.min(p.length, q.length);

	  while (i--) {
	    var diff = p[i] - q[i];
	    sum += diff * diff;
	  }

	  return Math.sqrt(sum);
	};

	if (typeof module !== 'undefined' && module.exports) {
	  module.exports = KMEANS;
	}


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * @requires ./PriorityQueue.js
	 */

	if (typeof module !== 'undefined' && module.exports) {
	      var PriorityQueue = __webpack_require__(15);
	}

	/**
	 * OPTICS - Ordering points to identify the clustering structure
	 *
	 * @author Lukasz Krawczyk <contact@lukaszkrawczyk.eu>
	 * @copyright MIT
	 */

	/**
	 * OPTICS class constructor
	 * @constructor
	 *
	 * @param {Array} dataset
	 * @param {number} epsilon
	 * @param {number} minPts
	 * @param {function} distanceFunction
	 * @returns {OPTICS}
	 */
	function OPTICS(dataset, epsilon, minPts, distanceFunction) {
	  /** @type {number} */
	  this.epsilon = 1;
	  /** @type {number} */
	  this.minPts = 1;
	  /** @type {function} */
	  this.distance = this._euclideanDistance;

	  // temporary variables used during computation

	  /** @type {Array} */
	  this._reachability = [];
	  /** @type {Array} */
	  this._processed = [];
	  /** @type {number} */
	  this._coreDistance = 0;
	  /** @type {Array} */
	  this._orderedList = [];

	  this._init(dataset, epsilon, minPts, distanceFunction);
	}

	/******************************************************************************/
	// pulic functions

	/**
	 * Start clustering
	 *
	 * @param {Array} dataset
	 * @returns {undefined}
	 * @access public
	 */
	OPTICS.prototype.run = function(dataset, epsilon, minPts, distanceFunction) {
	  this._init(dataset, epsilon, minPts, distanceFunction);

	  for (var pointId = 0, l = this.dataset.length; pointId < l; pointId++) {
	    if (this._processed[pointId] !== 1) {
	      this._processed[pointId] = 1;
	      this.clusters.push([pointId]);
	      var clusterId = this.clusters.length - 1;

	      this._orderedList.push(pointId);
	      var priorityQueue = new PriorityQueue(null, null, 'asc');
	      var neighbors = this._regionQuery(pointId);

	      // using priority queue assign elements to new cluster
	      if (this._distanceToCore(pointId) !== undefined) {
	        this._updateQueue(pointId, neighbors, priorityQueue);
	        this._expandCluster(clusterId, priorityQueue);
	      }
	    }
	  }

	  return this.clusters;
	};

	/**
	 * Generate reachability plot for all points
	 *
	 * @returns {array}
	 * @access public
	 */
	OPTICS.prototype.getReachabilityPlot = function() {
	  var reachabilityPlot = [];

	  for (var i = 0, l = this._orderedList.length; i < l; i++) {
	    var pointId = this._orderedList[i];
	    var distance = this._reachability[pointId];

	    reachabilityPlot.push([pointId, distance]);
	  }

	  return reachabilityPlot;
	};

	/******************************************************************************/
	// protected functions

	/**
	 * Set object properties
	 *
	 * @param {Array} dataset
	 * @param {number} epsilon
	 * @param {number} minPts
	 * @param {function} distance
	 * @returns {undefined}
	 * @access protected
	 */
	OPTICS.prototype._init = function(dataset, epsilon, minPts, distance) {

	  if (dataset) {

	    if (!(dataset instanceof Array)) {
	      throw Error('Dataset must be of type array, ' +
	        typeof dataset + ' given');
	    }

	    this.dataset = dataset;
	    this.clusters = [];
	    this._reachability = new Array(this.dataset.length);
	    this._processed = new Array(this.dataset.length);
	    this._coreDistance = 0;
	    this._orderedList = [];
	  }

	  if (epsilon) {
	    this.epsilon = epsilon;
	  }

	  if (minPts) {
	    this.minPts = minPts;
	  }

	  if (distance) {
	    this.distance = distance;
	  }
	};

	/**
	 * Update information in queue
	 *
	 * @param {number} pointId
	 * @param {Array} neighbors
	 * @param {PriorityQueue} queue
	 * @returns {undefined}
	 * @access protected
	 */
	OPTICS.prototype._updateQueue = function(pointId, neighbors, queue) {
	  var self = this;

	  this._coreDistance = this._distanceToCore(pointId);
	  neighbors.forEach(function(pointId2) {
	    if (self._processed[pointId2] === undefined) {
	      var dist = self.distance(self.dataset[pointId], self.dataset[pointId2]);
	      var newReachableDistance = Math.max(self._coreDistance, dist);

	      if (self._reachability[pointId2] === undefined) {
	        self._reachability[pointId2] = newReachableDistance;
	        queue.insert(pointId2, newReachableDistance);
	      } else {
	        if (newReachableDistance < self._reachability[pointId2]) {
	          self._reachability[pointId2] = newReachableDistance;
	          queue.remove(pointId2);
	          queue.insert(pointId2, newReachableDistance);
	        }
	      }
	    }
	  });
	};

	/**
	 * Expand cluster
	 *
	 * @param {number} clusterId
	 * @param {PriorityQueue} queue
	 * @returns {undefined}
	 * @access protected
	 */
	OPTICS.prototype._expandCluster = function(clusterId, queue) {
	  var queueElements = queue.getElements();

	  for (var p = 0, l = queueElements.length; p < l; p++) {
	    var pointId = queueElements[p];
	    if (this._processed[pointId] === undefined) {
	      var neighbors = this._regionQuery(pointId);
	      this._processed[pointId] = 1;

	      this.clusters[clusterId].push(pointId);
	      this._orderedList.push(pointId);

	      if (this._distanceToCore(pointId) !== undefined) {
	        this._updateQueue(pointId, neighbors, queue);
	        this._expandCluster(clusterId, queue);
	      }
	    }
	  }
	};

	/**
	 * Calculating distance to cluster core
	 *
	 * @param {number} pointId
	 * @returns {number}
	 * @access protected
	 */
	OPTICS.prototype._distanceToCore = function(pointId) {
	  var l = this.epsilon;
	  for (var coreDistCand = 0; coreDistCand < l; coreDistCand++) {
	    var neighbors = this._regionQuery(pointId, coreDistCand);
	    if (neighbors.length >= this.minPts) {
	      return coreDistCand;
	    }
	  }

	  return;
	};

	/**
	 * Find all neighbors around given point
	 *
	 * @param {number} pointId
	 * @param {number} epsilon
	 * @returns {Array}
	 * @access protected
	 */
	OPTICS.prototype._regionQuery = function(pointId, epsilon) {
	  epsilon = epsilon || this.epsilon;
	  var neighbors = [];

	  for (var id = 0, l = this.dataset.length; id < l; id++) {
	    if (this.distance(this.dataset[pointId], this.dataset[id]) < epsilon) {
	      neighbors.push(id);
	    }
	  }

	  return neighbors;
	};

	/******************************************************************************/
	// helpers

	/**
	 * Calculate euclidean distance in multidimensional space
	 *
	 * @param {Array} p
	 * @param {Array} q
	 * @returns {number}
	 * @access protected
	 */
	OPTICS.prototype._euclideanDistance = function(p, q) {
	  var sum = 0;
	  var i = Math.min(p.length, q.length);

	  while (i--) {
	    sum += (p[i] - q[i]) * (p[i] - q[i]);
	  }

	  return Math.sqrt(sum);
	};

	if (typeof module !== 'undefined' && module.exports) {
	  module.exports = OPTICS;
	}


/***/ },
/* 15 */
/***/ function(module, exports) {

	/**
	 * PriorityQueue
	 * Elements in this queue are sorted according to their value
	 *
	 * @author Lukasz Krawczyk <contact@lukaszkrawczyk.eu>
	 * @copyright MIT
	 */

	/**
	 * PriorityQueue class construcotr
	 * @constructor
	 *
	 * @example
	 * queue: [1,2,3,4]
	 * priorities: [4,1,2,3]
	 * > result = [1,4,2,3]
	 *
	 * @param {Array} elements
	 * @param {Array} priorities
	 * @param {string} sorting - asc / desc
	 * @returns {PriorityQueue}
	 */
	function PriorityQueue(elements, priorities, sorting) {
	  /** @type {Array} */
	  this._queue = [];
	  /** @type {Array} */
	  this._priorities = [];
	  /** @type {string} */
	  this._sorting = 'desc';

	  this._init(elements, priorities, sorting);
	};

	/**
	 * Insert element
	 *
	 * @param {Object} ele
	 * @param {Object} priority
	 * @returns {undefined}
	 * @access public
	 */
	PriorityQueue.prototype.insert = function(ele, priority) {
	  var indexToInsert = this._queue.length;
	  var index = indexToInsert;

	  while (index--) {
	    var priority2 = this._priorities[index];
	    if (this._sorting === 'desc') {
	      if (priority > priority2) {
	        indexToInsert = index;
	      }
	    } else {
	      if (priority < priority2) {
	        indexToInsert = index;
	      }
	    }
	  }

	  this._insertAt(ele, priority, indexToInsert);
	};

	/**
	 * Remove element
	 *
	 * @param {Object} ele
	 * @returns {undefined}
	 * @access public
	 */
	PriorityQueue.prototype.remove = function(ele) {
	  var index = this._queue.length;

	  while (index--) {
	    var ele2 = this._queue[index];
	    if (ele === ele2) {
	      this._queue.splice(index, 1);
	      this._priorities.splice(index, 1);
	      break;
	    }
	  }
	};

	/**
	 * For each loop wrapper
	 *
	 * @param {function} func
	 * @returs {undefined}
	 * @access public
	 */
	PriorityQueue.prototype.forEach = function(func) {
	  this._queue.forEach(func);
	};

	/**
	 * @returns {Array}
	 * @access public
	 */
	PriorityQueue.prototype.getElements = function() {
	  return this._queue;
	};

	/**
	 * @param {number} index
	 * @returns {Object}
	 * @access public
	 */
	PriorityQueue.prototype.getElementPriority = function(index) {
	  return this._priorities[index];
	};

	/**
	 * @returns {Array}
	 * @access public
	 */
	PriorityQueue.prototype.getPriorities = function() {
	  return this._priorities;
	};

	/**
	 * @returns {Array}
	 * @access public
	 */
	PriorityQueue.prototype.getElementsWithPriorities = function() {
	  var result = [];

	  for (var i = 0, l = this._queue.length; i < l; i++) {
	    result.push([this._queue[i], this._priorities[i]]);
	  }

	  return result;
	};

	/**
	 * Set object properties
	 *
	 * @param {Array} elements
	 * @param {Array} priorities
	 * @returns {undefined}
	 * @access protected
	 */
	PriorityQueue.prototype._init = function(elements, priorities, sorting) {

	  if (elements && priorities) {
	    this._queue = [];
	    this._priorities = [];

	    if (elements.length !== priorities.length) {
	      throw new Error('Arrays must have the same length');
	    }

	    for (var i = 0; i < elements.length; i++) {
	      this.insert(elements[i], priorities[i]);
	    }
	  }

	  if (sorting) {
	    this._sorting = sorting;
	  }
	};

	/**
	 * Insert element at given position
	 *
	 * @param {Object} ele
	 * @param {number} index
	 * @returns {undefined}
	 * @access protected
	 */
	PriorityQueue.prototype._insertAt = function(ele, priority, index) {
	  if (this._queue.length === index) {
	    this._queue.push(ele);
	    this._priorities.push(priority);
	  } else {
	    this._queue.splice(index, 0, ele);
	    this._priorities.splice(index, 0, priority);
	  }
	};

	if (typeof module !== 'undefined' && module.exports) {
	  module.exports = PriorityQueue;
	}


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var intersect = __webpack_require__(17);
	var inside = __webpack_require__(18);

	function polygon_points_inside(p0, p1) {
	    var i;
	    for (i = 0; i < p0.length; i += 1) {
	        if (inside(p0[i], p1)) {
	            return true;
	        }
	    }
	    for (i = 0; i < p1.length; i += 1) {
	        if (inside(p1[i], p0)) {
	            return true;
	        }
	    }
	    return false;
	}

	function polygon_edges_overlap(p0, p1) {
	    for (var i = 0; i < p0.length - 1; i += 1) {
	        for (var j = 0; j < p1.length - 1; j += 1) {
	            if (intersect(p0[i][0], p0[i][1], p0[i + 1][0], p0[i + 1][1], 
	                          p1[j][0], p1[j][1], p1[j + 1][0], p1[j + 1][1])) {
	                return true;
	            }
	        }
	    }
	    return false;
	}

	function overlap (p0, p1) {

	    // polygons overlap if either

	    // 1. one of the points of one polygon is inside the other polygon polygon
	    if (polygon_points_inside(p0, p1)) {
	        return true;
	    }

	    // 2. one of the edges overlap
	    if (polygon_edges_overlap(p0, p1)) {
	        return true;
	    }

	    return false;
	}

	if (typeof module !== 'undefined' && module.exports) {
	    module.exports = overlap;
	}



/***/ },
/* 17 */
/***/ function(module, exports) {

	"use strict";

	function on_seg(xi, yi, xj, yj, xk, yk) {
	    return (xi <= xk || xj <= xk) && (xk <= xi || xk <= xj) &&
	        (yi <= yk || yj <= yk) && (yk <= yi || yk <= yj);
	}

	function dir(xi, yi, xj, yj, xk, yk) {
	    var a = (xk - xi) * (yj - yi);
	    var b = (xj - xi) * (yk - yi);
	    return a < b ? -1 : a > b ? 1 : 0;
	}

	function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
	    var d1 = dir(x3, y3, x4, y4, x1, y1);
	    var d2 = dir(x3, y3, x4, y4, x2, y2);
	    var d3 = dir(x1, y1, x2, y2, x3, y3);
	    var d4 = dir(x1, y1, x2, y2, x4, y4);
	    return (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && 
	            ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) ||
	             (d1 === 0 && on_seg(x3, y3, x4, y4, x1, y1)) ||
	             (d2 === 0 && on_seg(x3, y3, x4, y4, x2, y2)) ||
	             (d3 === 0 && on_seg(x1, y1, x2, y2, x3, y3)) ||
	             (d4 === 0 && on_seg(x1, y1, x2, y2, x4, y4));
	}

	if (typeof module !== 'undefined' && module.exports) {
	    module.exports = intersect;
	}



/***/ },
/* 18 */
/***/ function(module, exports) {

	"use strict";

	function inside (p, poly) {
	    var i, j, c = false, nvert = poly.length;
	    for (i = 0, j = nvert - 1; i < nvert; j = i++) {
	        if (((poly[i][1] > p[1]) !== (poly[j][1] > p[1])) &&
	            (p[0] < (poly[j][0] - poly[i][0]) * (p[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])) {
	                c = !c;
	            }
	    }
	    return c;
	}

	if (typeof module !== 'undefined' && module.exports) {
	    module.exports = inside;
	}



/***/ },
/* 19 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/** Graphic: Base class for canvas-based interactive graphics */

	var Graphic = function () {
	  function Graphic() {
	    _classCallCheck(this, Graphic);
	  }

	  _createClass(Graphic, [{
	    key: "onMouseDown",

	    /** To override: mouse event handler */
	    value: function onMouseDown(event) {} // eslint-disable-line no-unused-vars


	    /** To override: mouse event handler */

	  }, {
	    key: "onMouseUp",
	    value: function onMouseUp(event) {} // eslint-disable-line no-unused-vars


	    /** To override: mouse event handler */

	  }, {
	    key: "onMouseMove",
	    value: function onMouseMove(event) {} // eslint-disable-line no-unused-vars


	    /** To override: canvas drawing commands */

	  }, {
	    key: "render",
	    value: function render(ctx) {// eslint-disable-line no-unused-vars
	    }
	  }]);

	  return Graphic;
	}();

	exports.default = Graphic;

/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';

	/** Return a pseudo-random color for a given fips code */
	function fipsColor(fips) {
	  var number = parseInt(fips, 10);
	  if (isNaN(number)) {
	    number = fips.charCodeAt(0) - 97 || 0; // TODO: better conversion of string to color
	  }
	  var scalar = number / 56.0;
	  return 'hsl(' + (360 - (scalar * 180.0 + 180.0)) + ', 85%, 70%)';
	}

	/** Create DOM element. Options may include 'id' */
	function createElement(options) {
	  var div = document.createElement('div');
	  document.body.appendChild(div);
	  div.id = options.id;
	  return div;
	}

	function startDownload(_ref) {
	  var filename = _ref.filename;
	  var content = _ref.content;
	  var mimeType = _ref.mimeType;

	  var link = document.createElement('a');
	  document.body.appendChild(link);
	  link.setAttribute('href', 'data:' + mimeType + ',' + content);
	  link.setAttribute('download', filename);
	  link.click();
	  document.body.removeChild(link);
	}

	/** Update memoized bounds if exceeded by bounds */
	function updateBounds(memoBounds, bounds) {
	  for (var lim = 0; lim < 2; lim++) {
	    // limit (0 = min; 1 = max)
	    for (var dim = 0; dim < 2; dim++) {
	      // dimension (0 = x; 1 = y)
	      memoBounds[lim][dim] = Math[lim === 0 ? 'min' : 'max'](memoBounds[lim][dim], bounds[lim][dim]);
	    }
	  }
	}

	/** Check if point is within corner bounds (of format [[0, 0], [100, 100]]) */
	function checkWithinBounds(point, bounds) {
	  for (var lim = 0; lim < 2; lim++) {
	    // limit (0 = min; 1 = max)
	    for (var dim = 0; dim < 2; dim++) {
	      // dimension (0 = x; 1 = y)
	      if (lim === 0 && point[dim] < bounds[lim][dim]) {
	        return false;
	      } else if (lim === 1 && point[dim] > bounds[lim][dim]) {
	        return false;
	      }
	    }
	  }
	  return true;
	}

	/** Convert array of key,value objects (eg: [{key: 0, value: 0}]) to hash for quick lookup */
	function hashFromData(data) {
	  var dataHash = {};
	  data.forEach(function (datum) {
	    dataHash[datum.key] = datum.value;
	  });
	  return dataHash;
	}

	function checkDevEnvironment() {
	  var devPort = 8080; // should match whatever port webpack-dev-server is running on
	  return parseInt(document.location.port, 10) === devPort;
	}
	var _isDevEnvironment = checkDevEnvironment(); // eslint-disable-line no-underscore-dangle

	function isDevEnvironment() {
	  return _isDevEnvironment;
	}

	module.exports = {
	  fipsColor: fipsColor,
	  createElement: createElement,
	  startDownload: startDownload,
	  updateBounds: updateBounds,
	  checkWithinBounds: checkWithinBounds,
	  hashFromData: hashFromData,
	  isDevEnvironment: isDevEnvironment
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.IMPORT_TILE_MARGINS = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * GridGeometry: manage and convert grid coordinates
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

	var _constants = __webpack_require__(22);

	var _PointyTopHexagonShape = __webpack_require__(26);

	var _PointyTopHexagonShape2 = _interopRequireDefault(_PointyTopHexagonShape);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var TILE_OFFSET = 1;

	// tile margins must be even to not break Importer._getTilePosition()
	var IMPORT_TILE_MARGINS = exports.IMPORT_TILE_MARGINS = 6;

	var shape = new _PointyTopHexagonShape2.default();

	var GridGeometry = function () {
	  function GridGeometry() {
	    _classCallCheck(this, GridGeometry);

	    this.setTileEdge(_constants.tileEdgeRange.default);
	  }

	  _createClass(GridGeometry, [{
	    key: 'setTileEdge',
	    value: function setTileEdge(tileEdge) {
	      this._tileEdge = tileEdge;
	      this.resize();
	    }
	  }, {
	    key: 'setTileEdgeFromMax',
	    value: function setTileEdgeFromMax(maxX, maxY) {
	      var tileEdge = shape.getTileEdgeFromGridUnit({
	        width: _constants.canvasDimensions.width / (maxX + IMPORT_TILE_MARGINS),
	        height: _constants.canvasDimensions.height / (maxY + IMPORT_TILE_MARGINS)
	      });
	      this.setTileEdge(tileEdge);
	    }
	  }, {
	    key: 'setTileEdgeFromArea',
	    value: function setTileEdgeFromArea(area) {
	      var tileEdge = shape.getTileEdgeFromArea(area);
	      this.setTileEdge(tileEdge);
	    }
	  }, {
	    key: 'getTileEdge',
	    value: function getTileEdge() {
	      return this._tileEdge;
	    }
	  }, {
	    key: 'getTileDimensions',
	    value: function getTileDimensions() {
	      return this._tileSize;
	    }
	  }, {
	    key: 'getUnitOffsetX',
	    value: function getUnitOffsetX(y) {
	      return shape.getUnitOffsetX(y);
	    }
	  }, {
	    key: 'getUnitOffsetY',
	    value: function getUnitOffsetY(x) {
	      return shape.getUnitOffsetY(x);
	    }
	  }, {
	    key: 'getDrawOffsetX',
	    value: function getDrawOffsetX(y) {
	      return shape.getDrawOffsetX(y);
	    }
	  }, {
	    key: 'getDrawOffsetY',
	    value: function getDrawOffsetY(x) {
	      return shape.getDrawOffsetY(x);
	    }
	  }, {
	    key: 'getTileCounts',
	    value: function getTileCounts() {
	      return this._tileCounts;
	    }
	  }, {
	    key: 'resize',
	    value: function resize() {
	      this._tileSize = shape.getTileSize(this._tileEdge);
	      var gridUnit = shape.getGridUnit();
	      this._tileCounts = {
	        width: Math.floor(_constants.canvasDimensions.width / (this._tileSize.width * gridUnit.width) - TILE_OFFSET * 2),
	        height: Math.floor(_constants.canvasDimensions.height / (this._tileSize.height * gridUnit.height) - TILE_OFFSET * 2)
	      };
	    }
	  }, {
	    key: 'forEachTilePosition',
	    value: function forEachTilePosition(iterator) {
	      for (var x = TILE_OFFSET - 2; x < this._tileCounts.width + 3; x++) {
	        for (var y = TILE_OFFSET - 2; y < this._tileCounts.height + 3; y++) {
	          iterator(x, y);
	        }
	      }
	    }

	    /** Return X/Y center point of tile at given position */

	  }, {
	    key: 'tileCenterPoint',
	    value: function tileCenterPoint(position) {
	      var gridUnit = shape.getGridUnit();
	      return {
	        x: this._tileSize.width * ((position.x + TILE_OFFSET) * gridUnit.width + this.getDrawOffsetX(position.y)),
	        y: this._tileSize.height * ((position.y + TILE_OFFSET) * gridUnit.height + this.getDrawOffsetY(position.x))
	      };
	    }
	  }, {
	    key: 'getPointsAround',
	    value: function getPointsAround(center, contiguous) {
	      var tileScale = contiguous ? 1.0 : _constants.settings.tileScale;
	      var scaledSize = {
	        width: this._tileSize.width * tileScale,
	        height: this._tileSize.height * tileScale
	      };
	      return shape.getPointsAround(center, scaledSize);
	    }

	    /**
	     * Return grid position, given screen coordinates.
	     * NOTE: The order that X and Y can be calculated depends on the shape
	     * because of grid offsets.
	     */

	  }, {
	    key: 'getPositionFromScreen',
	    value: function getPositionFromScreen(screenX, screenY) {
	      var gridUnit = shape.getGridUnit();
	      var y = Math.round(screenY / (this._tileSize.height * gridUnit.height / devicePixelRatio) - this.getDrawOffsetY()) - TILE_OFFSET;
	      var x = Math.round(screenX / (this._tileSize.width * gridUnit.width / devicePixelRatio) - this.getDrawOffsetX(y)) - TILE_OFFSET;
	      return { x: x, y: y };
	    }
	  }]);

	  return GridGeometry;
	}();

	exports.default = new GridGeometry();

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _datGui = __webpack_require__(23);

	var _datGui2 = _interopRequireDefault(_datGui);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var devicePixelRatio = window.devicePixelRatio;

	var canvasDimensions = {
	  width: 0,
	  height: 0
	};
	/**
	 * update canvasDimensions ensuring that there is always a min w/h
	 * prevent errors on small screens
	 */
	function updateCanvasSize() {
	  var canvasContainer = document.getElementById('canvas');
	  canvasDimensions.width = Math.max(200, canvasContainer.offsetWidth * devicePixelRatio);
	  canvasDimensions.height = Math.max(200, canvasContainer.offsetHeight * devicePixelRatio);
	}

	/**
	 * target min and max number of tiles for map output
	 * used to calculate a dataset's domain
	 */
	var nTileDomain = [80, 1000];

	/** dat.gui for realtime updating of properties */

	var Settings = function Settings() {
	  _classCallCheck(this, Settings);

	  this.tileScale = 0.95;
	  this.displayMap = true;
	  this.displayGrid = true;
	};

	var settings = new Settings();
	var gui = new _datGui2.default.GUI();
	gui.add(settings, 'tileScale', 0.9, 1.0);
	gui.add(settings, 'displayMap');
	gui.add(settings, 'displayGrid');
	_datGui2.default.GUI.toggleHide();

	module.exports = {
	  settings: settings,
	  devicePixelRatio: devicePixelRatio,
	  canvasDimensions: canvasDimensions,
	  updateCanvasSize: updateCanvasSize,
	  nTileDomain: nTileDomain,
	  tileEdgeRange: {
	    default: 20,
	    min: 10,
	    max: 40
	  },
	  selectedTileBorderColor: '#737373',
	  hoveredTileBorderColor: '#737373',
	  movingTileOriginalPositionColor: '#d0d2d3'
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(24)
	module.exports.color = __webpack_require__(25)

/***/ },
/* 24 */
/***/ function(module, exports) {

	/**
	 * dat-gui JavaScript Controller Library
	 * http://code.google.com/p/dat-gui
	 *
	 * Copyright 2011 Data Arts Team, Google Creative Lab
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 */

	/** @namespace */
	var dat = module.exports = dat || {};

	/** @namespace */
	dat.gui = dat.gui || {};

	/** @namespace */
	dat.utils = dat.utils || {};

	/** @namespace */
	dat.controllers = dat.controllers || {};

	/** @namespace */
	dat.dom = dat.dom || {};

	/** @namespace */
	dat.color = dat.color || {};

	dat.utils.css = (function () {
	  return {
	    load: function (url, doc) {
	      doc = doc || document;
	      var link = doc.createElement('link');
	      link.type = 'text/css';
	      link.rel = 'stylesheet';
	      link.href = url;
	      doc.getElementsByTagName('head')[0].appendChild(link);
	    },
	    inject: function(css, doc) {
	      doc = doc || document;
	      var injected = document.createElement('style');
	      injected.type = 'text/css';
	      injected.innerHTML = css;
	      doc.getElementsByTagName('head')[0].appendChild(injected);
	    }
	  }
	})();


	dat.utils.common = (function () {
	  
	  var ARR_EACH = Array.prototype.forEach;
	  var ARR_SLICE = Array.prototype.slice;

	  /**
	   * Band-aid methods for things that should be a lot easier in JavaScript.
	   * Implementation and structure inspired by underscore.js
	   * http://documentcloud.github.com/underscore/
	   */

	  return { 
	    
	    BREAK: {},
	  
	    extend: function(target) {
	      
	      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
	        
	        for (var key in obj)
	          if (!this.isUndefined(obj[key])) 
	            target[key] = obj[key];
	        
	      }, this);
	      
	      return target;
	      
	    },
	    
	    defaults: function(target) {
	      
	      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
	        
	        for (var key in obj)
	          if (this.isUndefined(target[key])) 
	            target[key] = obj[key];
	        
	      }, this);
	      
	      return target;
	    
	    },
	    
	    compose: function() {
	      var toCall = ARR_SLICE.call(arguments);
	            return function() {
	              var args = ARR_SLICE.call(arguments);
	              for (var i = toCall.length -1; i >= 0; i--) {
	                args = [toCall[i].apply(this, args)];
	              }
	              return args[0];
	            }
	    },
	    
	    each: function(obj, itr, scope) {

	      
	      if (ARR_EACH && obj.forEach === ARR_EACH) { 
	        
	        obj.forEach(itr, scope);
	        
	      } else if (obj.length === obj.length + 0) { // Is number but not NaN
	        
	        for (var key = 0, l = obj.length; key < l; key++)
	          if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) 
	            return;
	            
	      } else {

	        for (var key in obj) 
	          if (itr.call(scope, obj[key], key) === this.BREAK)
	            return;
	            
	      }
	            
	    },
	    
	    defer: function(fnc) {
	      setTimeout(fnc, 0);
	    },
	    
	    toArray: function(obj) {
	      if (obj.toArray) return obj.toArray();
	      return ARR_SLICE.call(obj);
	    },

	    isUndefined: function(obj) {
	      return obj === undefined;
	    },
	    
	    isNull: function(obj) {
	      return obj === null;
	    },
	    
	    isNaN: function(obj) {
	      return obj !== obj;
	    },
	    
	    isArray: Array.isArray || function(obj) {
	      return obj.constructor === Array;
	    },
	    
	    isObject: function(obj) {
	      return obj === Object(obj);
	    },
	    
	    isNumber: function(obj) {
	      return obj === obj+0;
	    },
	    
	    isString: function(obj) {
	      return obj === obj+'';
	    },
	    
	    isBoolean: function(obj) {
	      return obj === false || obj === true;
	    },
	    
	    isFunction: function(obj) {
	      return Object.prototype.toString.call(obj) === '[object Function]';
	    }
	  
	  };
	    
	})();


	dat.controllers.Controller = (function (common) {

	  /**
	   * @class An "abstract" class that represents a given property of an object.
	   *
	   * @param {Object} object The object to be manipulated
	   * @param {string} property The name of the property to be manipulated
	   *
	   * @member dat.controllers
	   */
	  var Controller = function(object, property) {

	    this.initialValue = object[property];

	    /**
	     * Those who extend this class will put their DOM elements in here.
	     * @type {DOMElement}
	     */
	    this.domElement = document.createElement('div');

	    /**
	     * The object to manipulate
	     * @type {Object}
	     */
	    this.object = object;

	    /**
	     * The name of the property to manipulate
	     * @type {String}
	     */
	    this.property = property;

	    /**
	     * The function to be called on change.
	     * @type {Function}
	     * @ignore
	     */
	    this.__onChange = undefined;

	    /**
	     * The function to be called on finishing change.
	     * @type {Function}
	     * @ignore
	     */
	    this.__onFinishChange = undefined;

	  };

	  common.extend(

	      Controller.prototype,

	      /** @lends dat.controllers.Controller.prototype */
	      {

	        /**
	         * Specify that a function fire every time someone changes the value with
	         * this Controller.
	         *
	         * @param {Function} fnc This function will be called whenever the value
	         * is modified via this Controller.
	         * @returns {dat.controllers.Controller} this
	         */
	        onChange: function(fnc) {
	          this.__onChange = fnc;
	          return this;
	        },

	        /**
	         * Specify that a function fire every time someone "finishes" changing
	         * the value wih this Controller. Useful for values that change
	         * incrementally like numbers or strings.
	         *
	         * @param {Function} fnc This function will be called whenever
	         * someone "finishes" changing the value via this Controller.
	         * @returns {dat.controllers.Controller} this
	         */
	        onFinishChange: function(fnc) {
	          this.__onFinishChange = fnc;
	          return this;
	        },

	        /**
	         * Change the value of <code>object[property]</code>
	         *
	         * @param {Object} newValue The new value of <code>object[property]</code>
	         */
	        setValue: function(newValue) {
	          this.object[this.property] = newValue;
	          if (this.__onChange) {
	            this.__onChange.call(this, newValue);
	          }
	          this.updateDisplay();
	          return this;
	        },

	        /**
	         * Gets the value of <code>object[property]</code>
	         *
	         * @returns {Object} The current value of <code>object[property]</code>
	         */
	        getValue: function() {
	          return this.object[this.property];
	        },

	        /**
	         * Refreshes the visual display of a Controller in order to keep sync
	         * with the object's current value.
	         * @returns {dat.controllers.Controller} this
	         */
	        updateDisplay: function() {
	          return this;
	        },

	        /**
	         * @returns {Boolean} true if the value has deviated from initialValue
	         */
	        isModified: function() {
	          return this.initialValue !== this.getValue()
	        }

	      }

	  );

	  return Controller;


	})(dat.utils.common);


	dat.dom.dom = (function (common) {

	  var EVENT_MAP = {
	    'HTMLEvents': ['change'],
	    'MouseEvents': ['click','mousemove','mousedown','mouseup', 'mouseover'],
	    'KeyboardEvents': ['keydown']
	  };

	  var EVENT_MAP_INV = {};
	  common.each(EVENT_MAP, function(v, k) {
	    common.each(v, function(e) {
	      EVENT_MAP_INV[e] = k;
	    });
	  });

	  var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;

	  function cssValueToPixels(val) {

	    if (val === '0' || common.isUndefined(val)) return 0;

	    var match = val.match(CSS_VALUE_PIXELS);

	    if (!common.isNull(match)) {
	      return parseFloat(match[1]);
	    }

	    // TODO ...ems? %?

	    return 0;

	  }

	  /**
	   * @namespace
	   * @member dat.dom
	   */
	  var dom = {

	    /**
	     * 
	     * @param elem
	     * @param selectable
	     */
	    makeSelectable: function(elem, selectable) {

	      if (elem === undefined || elem.style === undefined) return;

	      elem.onselectstart = selectable ? function() {
	        return false;
	      } : function() {
	      };

	      elem.style.MozUserSelect = selectable ? 'auto' : 'none';
	      elem.style.KhtmlUserSelect = selectable ? 'auto' : 'none';
	      elem.unselectable = selectable ? 'on' : 'off';

	    },

	    /**
	     *
	     * @param elem
	     * @param horizontal
	     * @param vertical
	     */
	    makeFullscreen: function(elem, horizontal, vertical) {

	      if (common.isUndefined(horizontal)) horizontal = true;
	      if (common.isUndefined(vertical)) vertical = true;

	      elem.style.position = 'absolute';

	      if (horizontal) {
	        elem.style.left = 0;
	        elem.style.right = 0;
	      }
	      if (vertical) {
	        elem.style.top = 0;
	        elem.style.bottom = 0;
	      }

	    },

	    /**
	     *
	     * @param elem
	     * @param eventType
	     * @param params
	     */
	    fakeEvent: function(elem, eventType, params, aux) {
	      params = params || {};
	      var className = EVENT_MAP_INV[eventType];
	      if (!className) {
	        throw new Error('Event type ' + eventType + ' not supported.');
	      }
	      var evt = document.createEvent(className);
	      switch (className) {
	        case 'MouseEvents':
	          var clientX = params.x || params.clientX || 0;
	          var clientY = params.y || params.clientY || 0;
	          evt.initMouseEvent(eventType, params.bubbles || false,
	              params.cancelable || true, window, params.clickCount || 1,
	              0, //screen X
	              0, //screen Y
	              clientX, //client X
	              clientY, //client Y
	              false, false, false, false, 0, null);
	          break;
	        case 'KeyboardEvents':
	          var init = evt.initKeyboardEvent || evt.initKeyEvent; // webkit || moz
	          common.defaults(params, {
	            cancelable: true,
	            ctrlKey: false,
	            altKey: false,
	            shiftKey: false,
	            metaKey: false,
	            keyCode: undefined,
	            charCode: undefined
	          });
	          init(eventType, params.bubbles || false,
	              params.cancelable, window,
	              params.ctrlKey, params.altKey,
	              params.shiftKey, params.metaKey,
	              params.keyCode, params.charCode);
	          break;
	        default:
	          evt.initEvent(eventType, params.bubbles || false,
	              params.cancelable || true);
	          break;
	      }
	      common.defaults(evt, aux);
	      elem.dispatchEvent(evt);
	    },

	    /**
	     *
	     * @param elem
	     * @param event
	     * @param func
	     * @param bool
	     */
	    bind: function(elem, event, func, bool) {
	      bool = bool || false;
	      if (elem.addEventListener)
	        elem.addEventListener(event, func, bool);
	      else if (elem.attachEvent)
	        elem.attachEvent('on' + event, func);
	      return dom;
	    },

	    /**
	     *
	     * @param elem
	     * @param event
	     * @param func
	     * @param bool
	     */
	    unbind: function(elem, event, func, bool) {
	      bool = bool || false;
	      if (elem.removeEventListener)
	        elem.removeEventListener(event, func, bool);
	      else if (elem.detachEvent)
	        elem.detachEvent('on' + event, func);
	      return dom;
	    },

	    /**
	     *
	     * @param elem
	     * @param className
	     */
	    addClass: function(elem, className) {
	      if (elem.className === undefined) {
	        elem.className = className;
	      } else if (elem.className !== className) {
	        var classes = elem.className.split(/ +/);
	        if (classes.indexOf(className) == -1) {
	          classes.push(className);
	          elem.className = classes.join(' ').replace(/^\s+/, '').replace(/\s+$/, '');
	        }
	      }
	      return dom;
	    },

	    /**
	     *
	     * @param elem
	     * @param className
	     */
	    removeClass: function(elem, className) {
	      if (className) {
	        if (elem.className === undefined) {
	          // elem.className = className;
	        } else if (elem.className === className) {
	          elem.removeAttribute('class');
	        } else {
	          var classes = elem.className.split(/ +/);
	          var index = classes.indexOf(className);
	          if (index != -1) {
	            classes.splice(index, 1);
	            elem.className = classes.join(' ');
	          }
	        }
	      } else {
	        elem.className = undefined;
	      }
	      return dom;
	    },

	    hasClass: function(elem, className) {
	      return new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)').test(elem.className) || false;
	    },

	    /**
	     *
	     * @param elem
	     */
	    getWidth: function(elem) {

	      var style = getComputedStyle(elem);

	      return cssValueToPixels(style['border-left-width']) +
	          cssValueToPixels(style['border-right-width']) +
	          cssValueToPixels(style['padding-left']) +
	          cssValueToPixels(style['padding-right']) +
	          cssValueToPixels(style['width']);
	    },

	    /**
	     *
	     * @param elem
	     */
	    getHeight: function(elem) {

	      var style = getComputedStyle(elem);

	      return cssValueToPixels(style['border-top-width']) +
	          cssValueToPixels(style['border-bottom-width']) +
	          cssValueToPixels(style['padding-top']) +
	          cssValueToPixels(style['padding-bottom']) +
	          cssValueToPixels(style['height']);
	    },

	    /**
	     *
	     * @param elem
	     */
	    getOffset: function(elem) {
	      var offset = {left: 0, top:0};
	      if (elem.offsetParent) {
	        do {
	          offset.left += elem.offsetLeft;
	          offset.top += elem.offsetTop;
	        } while (elem = elem.offsetParent);
	      }
	      return offset;
	    },

	    // http://stackoverflow.com/posts/2684561/revisions
	    /**
	     * 
	     * @param elem
	     */
	    isActive: function(elem) {
	      return elem === document.activeElement && ( elem.type || elem.href );
	    }

	  };

	  return dom;

	})(dat.utils.common);


	dat.controllers.OptionController = (function (Controller, dom, common) {

	  /**
	   * @class Provides a select input to alter the property of an object, using a
	   * list of accepted values.
	   *
	   * @extends dat.controllers.Controller
	   *
	   * @param {Object} object The object to be manipulated
	   * @param {string} property The name of the property to be manipulated
	   * @param {Object|string[]} options A map of labels to acceptable values, or
	   * a list of acceptable string values.
	   *
	   * @member dat.controllers
	   */
	  var OptionController = function(object, property, options) {

	    OptionController.superclass.call(this, object, property);

	    var _this = this;

	    /**
	     * The drop down menu
	     * @ignore
	     */
	    this.__select = document.createElement('select');

	    if (common.isArray(options)) {
	      var map = {};
	      common.each(options, function(element) {
	        map[element] = element;
	      });
	      options = map;
	    }

	    common.each(options, function(value, key) {

	      var opt = document.createElement('option');
	      opt.innerHTML = key;
	      opt.setAttribute('value', value);
	      _this.__select.appendChild(opt);

	    });

	    // Acknowledge original value
	    this.updateDisplay();

	    dom.bind(this.__select, 'change', function() {
	      var desiredValue = this.options[this.selectedIndex].value;
	      _this.setValue(desiredValue);
	    });

	    this.domElement.appendChild(this.__select);

	  };

	  OptionController.superclass = Controller;

	  common.extend(

	      OptionController.prototype,
	      Controller.prototype,

	      {

	        setValue: function(v) {
	          var toReturn = OptionController.superclass.prototype.setValue.call(this, v);
	          if (this.__onFinishChange) {
	            this.__onFinishChange.call(this, this.getValue());
	          }
	          return toReturn;
	        },

	        updateDisplay: function() {
	          this.__select.value = this.getValue();
	          return OptionController.superclass.prototype.updateDisplay.call(this);
	        }

	      }

	  );

	  return OptionController;

	})(dat.controllers.Controller,
	dat.dom.dom,
	dat.utils.common);


	dat.controllers.NumberController = (function (Controller, common) {

	  /**
	   * @class Represents a given property of an object that is a number.
	   *
	   * @extends dat.controllers.Controller
	   *
	   * @param {Object} object The object to be manipulated
	   * @param {string} property The name of the property to be manipulated
	   * @param {Object} [params] Optional parameters
	   * @param {Number} [params.min] Minimum allowed value
	   * @param {Number} [params.max] Maximum allowed value
	   * @param {Number} [params.step] Increment by which to change value
	   *
	   * @member dat.controllers
	   */
	  var NumberController = function(object, property, params) {

	    NumberController.superclass.call(this, object, property);

	    params = params || {};

	    this.__min = params.min;
	    this.__max = params.max;
	    this.__step = params.step;

	    if (common.isUndefined(this.__step)) {

	      if (this.initialValue == 0) {
	        this.__impliedStep = 1; // What are we, psychics?
	      } else {
	        // Hey Doug, check this out.
	        this.__impliedStep = Math.pow(10, Math.floor(Math.log(this.initialValue)/Math.LN10))/10;
	      }

	    } else {

	      this.__impliedStep = this.__step;

	    }

	    this.__precision = numDecimals(this.__impliedStep);


	  };

	  NumberController.superclass = Controller;

	  common.extend(

	      NumberController.prototype,
	      Controller.prototype,

	      /** @lends dat.controllers.NumberController.prototype */
	      {

	        setValue: function(v) {

	          if (this.__min !== undefined && v < this.__min) {
	            v = this.__min;
	          } else if (this.__max !== undefined && v > this.__max) {
	            v = this.__max;
	          }

	          if (this.__step !== undefined && v % this.__step != 0) {
	            v = Math.round(v / this.__step) * this.__step;
	          }

	          return NumberController.superclass.prototype.setValue.call(this, v);

	        },

	        /**
	         * Specify a minimum value for <code>object[property]</code>.
	         *
	         * @param {Number} minValue The minimum value for
	         * <code>object[property]</code>
	         * @returns {dat.controllers.NumberController} this
	         */
	        min: function(v) {
	          this.__min = v;
	          return this;
	        },

	        /**
	         * Specify a maximum value for <code>object[property]</code>.
	         *
	         * @param {Number} maxValue The maximum value for
	         * <code>object[property]</code>
	         * @returns {dat.controllers.NumberController} this
	         */
	        max: function(v) {
	          this.__max = v;
	          return this;
	        },

	        /**
	         * Specify a step value that dat.controllers.NumberController
	         * increments by.
	         *
	         * @param {Number} stepValue The step value for
	         * dat.controllers.NumberController
	         * @default if minimum and maximum specified increment is 1% of the
	         * difference otherwise stepValue is 1
	         * @returns {dat.controllers.NumberController} this
	         */
	        step: function(v) {
	          this.__step = v;
	          return this;
	        }

	      }

	  );

	  function numDecimals(x) {
	    x = x.toString();
	    if (x.indexOf('.') > -1) {
	      return x.length - x.indexOf('.') - 1;
	    } else {
	      return 0;
	    }
	  }

	  return NumberController;

	})(dat.controllers.Controller,
	dat.utils.common);


	dat.controllers.NumberControllerBox = (function (NumberController, dom, common) {

	  /**
	   * @class Represents a given property of an object that is a number and
	   * provides an input element with which to manipulate it.
	   *
	   * @extends dat.controllers.Controller
	   * @extends dat.controllers.NumberController
	   *
	   * @param {Object} object The object to be manipulated
	   * @param {string} property The name of the property to be manipulated
	   * @param {Object} [params] Optional parameters
	   * @param {Number} [params.min] Minimum allowed value
	   * @param {Number} [params.max] Maximum allowed value
	   * @param {Number} [params.step] Increment by which to change value
	   *
	   * @member dat.controllers
	   */
	  var NumberControllerBox = function(object, property, params) {

	    this.__truncationSuspended = false;

	    NumberControllerBox.superclass.call(this, object, property, params);

	    var _this = this;

	    /**
	     * {Number} Previous mouse y position
	     * @ignore
	     */
	    var prev_y;

	    this.__input = document.createElement('input');
	    this.__input.setAttribute('type', 'text');

	    // Makes it so manually specified values are not truncated.

	    dom.bind(this.__input, 'change', onChange);
	    dom.bind(this.__input, 'blur', onBlur);
	    dom.bind(this.__input, 'mousedown', onMouseDown);
	    dom.bind(this.__input, 'keydown', function(e) {

	      // When pressing entire, you can be as precise as you want.
	      if (e.keyCode === 13) {
	        _this.__truncationSuspended = true;
	        this.blur();
	        _this.__truncationSuspended = false;
	      }

	    });

	    function onChange() {
	      var attempted = parseFloat(_this.__input.value);
	      if (!common.isNaN(attempted)) _this.setValue(attempted);
	    }

	    function onBlur() {
	      onChange();
	      if (_this.__onFinishChange) {
	        _this.__onFinishChange.call(_this, _this.getValue());
	      }
	    }

	    function onMouseDown(e) {
	      dom.bind(window, 'mousemove', onMouseDrag);
	      dom.bind(window, 'mouseup', onMouseUp);
	      prev_y = e.clientY;
	    }

	    function onMouseDrag(e) {

	      var diff = prev_y - e.clientY;
	      _this.setValue(_this.getValue() + diff * _this.__impliedStep);

	      prev_y = e.clientY;

	    }

	    function onMouseUp() {
	      dom.unbind(window, 'mousemove', onMouseDrag);
	      dom.unbind(window, 'mouseup', onMouseUp);
	    }

	    this.updateDisplay();

	    this.domElement.appendChild(this.__input);

	  };

	  NumberControllerBox.superclass = NumberController;

	  common.extend(

	      NumberControllerBox.prototype,
	      NumberController.prototype,

	      {

	        updateDisplay: function() {

	          this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
	          return NumberControllerBox.superclass.prototype.updateDisplay.call(this);
	        }

	      }

	  );

	  function roundToDecimal(value, decimals) {
	    var tenTo = Math.pow(10, decimals);
	    return Math.round(value * tenTo) / tenTo;
	  }

	  return NumberControllerBox;

	})(dat.controllers.NumberController,
	dat.dom.dom,
	dat.utils.common);


	dat.controllers.NumberControllerSlider = (function (NumberController, dom, css, common, styleSheet) {

	  /**
	   * @class Represents a given property of an object that is a number, contains
	   * a minimum and maximum, and provides a slider element with which to
	   * manipulate it. It should be noted that the slider element is made up of
	   * <code>&lt;div&gt;</code> tags, <strong>not</strong> the html5
	   * <code>&lt;slider&gt;</code> element.
	   *
	   * @extends dat.controllers.Controller
	   * @extends dat.controllers.NumberController
	   * 
	   * @param {Object} object The object to be manipulated
	   * @param {string} property The name of the property to be manipulated
	   * @param {Number} minValue Minimum allowed value
	   * @param {Number} maxValue Maximum allowed value
	   * @param {Number} stepValue Increment by which to change value
	   *
	   * @member dat.controllers
	   */
	  var NumberControllerSlider = function(object, property, min, max, step) {

	    NumberControllerSlider.superclass.call(this, object, property, { min: min, max: max, step: step });

	    var _this = this;

	    this.__background = document.createElement('div');
	    this.__foreground = document.createElement('div');
	    


	    dom.bind(this.__background, 'mousedown', onMouseDown);
	    
	    dom.addClass(this.__background, 'slider');
	    dom.addClass(this.__foreground, 'slider-fg');

	    function onMouseDown(e) {

	      dom.bind(window, 'mousemove', onMouseDrag);
	      dom.bind(window, 'mouseup', onMouseUp);

	      onMouseDrag(e);
	    }

	    function onMouseDrag(e) {

	      e.preventDefault();

	      var offset = dom.getOffset(_this.__background);
	      var width = dom.getWidth(_this.__background);
	      
	      _this.setValue(
	        map(e.clientX, offset.left, offset.left + width, _this.__min, _this.__max)
	      );

	      return false;

	    }

	    function onMouseUp() {
	      dom.unbind(window, 'mousemove', onMouseDrag);
	      dom.unbind(window, 'mouseup', onMouseUp);
	      if (_this.__onFinishChange) {
	        _this.__onFinishChange.call(_this, _this.getValue());
	      }
	    }

	    this.updateDisplay();

	    this.__background.appendChild(this.__foreground);
	    this.domElement.appendChild(this.__background);

	  };

	  NumberControllerSlider.superclass = NumberController;

	  /**
	   * Injects default stylesheet for slider elements.
	   */
	  NumberControllerSlider.useDefaultStyles = function() {
	    css.inject(styleSheet);
	  };

	  common.extend(

	      NumberControllerSlider.prototype,
	      NumberController.prototype,

	      {

	        updateDisplay: function() {
	          var pct = (this.getValue() - this.__min)/(this.__max - this.__min);
	          this.__foreground.style.width = pct*100+'%';
	          return NumberControllerSlider.superclass.prototype.updateDisplay.call(this);
	        }

	      }



	  );

	  function map(v, i1, i2, o1, o2) {
	    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
	  }

	  return NumberControllerSlider;
	  
	})(dat.controllers.NumberController,
	dat.dom.dom,
	dat.utils.css,
	dat.utils.common,
	".slider {\n  box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);\n  height: 1em;\n  border-radius: 1em;\n  background-color: #eee;\n  padding: 0 0.5em;\n  overflow: hidden;\n}\n\n.slider-fg {\n  padding: 1px 0 2px 0;\n  background-color: #aaa;\n  height: 1em;\n  margin-left: -0.5em;\n  padding-right: 0.5em;\n  border-radius: 1em 0 0 1em;\n}\n\n.slider-fg:after {\n  display: inline-block;\n  border-radius: 1em;\n  background-color: #fff;\n  border:  1px solid #aaa;\n  content: '';\n  float: right;\n  margin-right: -1em;\n  margin-top: -1px;\n  height: 0.9em;\n  width: 0.9em;\n}");


	dat.controllers.FunctionController = (function (Controller, dom, common) {

	  /**
	   * @class Provides a GUI interface to fire a specified method, a property of an object.
	   *
	   * @extends dat.controllers.Controller
	   *
	   * @param {Object} object The object to be manipulated
	   * @param {string} property The name of the property to be manipulated
	   *
	   * @member dat.controllers
	   */
	  var FunctionController = function(object, property, text) {

	    FunctionController.superclass.call(this, object, property);

	    var _this = this;

	    this.__button = document.createElement('div');
	    this.__button.innerHTML = text === undefined ? 'Fire' : text;
	    dom.bind(this.__button, 'click', function(e) {
	      e.preventDefault();
	      _this.fire();
	      return false;
	    });

	    dom.addClass(this.__button, 'button');

	    this.domElement.appendChild(this.__button);


	  };

	  FunctionController.superclass = Controller;

	  common.extend(

	      FunctionController.prototype,
	      Controller.prototype,
	      {
	        
	        fire: function() {
	          if (this.__onChange) {
	            this.__onChange.call(this);
	          }
	          if (this.__onFinishChange) {
	            this.__onFinishChange.call(this, this.getValue());
	          }
	          this.getValue().call(this.object);
	        }
	      }

	  );

	  return FunctionController;

	})(dat.controllers.Controller,
	dat.dom.dom,
	dat.utils.common);


	dat.controllers.BooleanController = (function (Controller, dom, common) {

	  /**
	   * @class Provides a checkbox input to alter the boolean property of an object.
	   * @extends dat.controllers.Controller
	   *
	   * @param {Object} object The object to be manipulated
	   * @param {string} property The name of the property to be manipulated
	   *
	   * @member dat.controllers
	   */
	  var BooleanController = function(object, property) {

	    BooleanController.superclass.call(this, object, property);

	    var _this = this;
	    this.__prev = this.getValue();

	    this.__checkbox = document.createElement('input');
	    this.__checkbox.setAttribute('type', 'checkbox');


	    dom.bind(this.__checkbox, 'change', onChange, false);

	    this.domElement.appendChild(this.__checkbox);

	    // Match original value
	    this.updateDisplay();

	    function onChange() {
	      _this.setValue(!_this.__prev);
	    }

	  };

	  BooleanController.superclass = Controller;

	  common.extend(

	      BooleanController.prototype,
	      Controller.prototype,

	      {

	        setValue: function(v) {
	          var toReturn = BooleanController.superclass.prototype.setValue.call(this, v);
	          if (this.__onFinishChange) {
	            this.__onFinishChange.call(this, this.getValue());
	          }
	          this.__prev = this.getValue();
	          return toReturn;
	        },

	        updateDisplay: function() {
	          
	          if (this.getValue() === true) {
	            this.__checkbox.setAttribute('checked', 'checked');
	            this.__checkbox.checked = true;    
	          } else {
	              this.__checkbox.checked = false;
	          }

	          return BooleanController.superclass.prototype.updateDisplay.call(this);

	        }


	      }

	  );

	  return BooleanController;

	})(dat.controllers.Controller,
	dat.dom.dom,
	dat.utils.common);


	dat.color.toString = (function (common) {

	  return function(color) {

	    if (color.a == 1 || common.isUndefined(color.a)) {

	      var s = color.hex.toString(16);
	      while (s.length < 6) {
	        s = '0' + s;
	      }

	      return '#' + s;

	    } else {

	      return 'rgba(' + Math.round(color.r) + ',' + Math.round(color.g) + ',' + Math.round(color.b) + ',' + color.a + ')';

	    }

	  }

	})(dat.utils.common);


	dat.color.interpret = (function (toString, common) {

	  var result, toReturn;

	  var interpret = function() {

	    toReturn = false;

	    var original = arguments.length > 1 ? common.toArray(arguments) : arguments[0];

	    common.each(INTERPRETATIONS, function(family) {

	      if (family.litmus(original)) {

	        common.each(family.conversions, function(conversion, conversionName) {

	          result = conversion.read(original);

	          if (toReturn === false && result !== false) {
	            toReturn = result;
	            result.conversionName = conversionName;
	            result.conversion = conversion;
	            return common.BREAK;

	          }

	        });

	        return common.BREAK;

	      }

	    });

	    return toReturn;

	  };

	  var INTERPRETATIONS = [

	    // Strings
	    {

	      litmus: common.isString,

	      conversions: {

	        THREE_CHAR_HEX: {

	          read: function(original) {

	            var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
	            if (test === null) return false;

	            return {
	              space: 'HEX',
	              hex: parseInt(
	                  '0x' +
	                      test[1].toString() + test[1].toString() +
	                      test[2].toString() + test[2].toString() +
	                      test[3].toString() + test[3].toString())
	            };

	          },

	          write: toString

	        },

	        SIX_CHAR_HEX: {

	          read: function(original) {

	            var test = original.match(/^#([A-F0-9]{6})$/i);
	            if (test === null) return false;

	            return {
	              space: 'HEX',
	              hex: parseInt('0x' + test[1].toString())
	            };

	          },

	          write: toString

	        },

	        CSS_RGB: {

	          read: function(original) {

	            var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
	            if (test === null) return false;

	            return {
	              space: 'RGB',
	              r: parseFloat(test[1]),
	              g: parseFloat(test[2]),
	              b: parseFloat(test[3])
	            };

	          },

	          write: toString

	        },

	        CSS_RGBA: {

	          read: function(original) {

	            var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);
	            if (test === null) return false;

	            return {
	              space: 'RGB',
	              r: parseFloat(test[1]),
	              g: parseFloat(test[2]),
	              b: parseFloat(test[3]),
	              a: parseFloat(test[4])
	            };

	          },

	          write: toString

	        }

	      }

	    },

	    // Numbers
	    {

	      litmus: common.isNumber,

	      conversions: {

	        HEX: {
	          read: function(original) {
	            return {
	              space: 'HEX',
	              hex: original,
	              conversionName: 'HEX'
	            }
	          },

	          write: function(color) {
	            return color.hex;
	          }
	        }

	      }

	    },

	    // Arrays
	    {

	      litmus: common.isArray,

	      conversions: {

	        RGB_ARRAY: {
	          read: function(original) {
	            if (original.length != 3) return false;
	            return {
	              space: 'RGB',
	              r: original[0],
	              g: original[1],
	              b: original[2]
	            };
	          },

	          write: function(color) {
	            return [color.r, color.g, color.b];
	          }

	        },

	        RGBA_ARRAY: {
	          read: function(original) {
	            if (original.length != 4) return false;
	            return {
	              space: 'RGB',
	              r: original[0],
	              g: original[1],
	              b: original[2],
	              a: original[3]
	            };
	          },

	          write: function(color) {
	            return [color.r, color.g, color.b, color.a];
	          }

	        }

	      }

	    },

	    // Objects
	    {

	      litmus: common.isObject,

	      conversions: {

	        RGBA_OBJ: {
	          read: function(original) {
	            if (common.isNumber(original.r) &&
	                common.isNumber(original.g) &&
	                common.isNumber(original.b) &&
	                common.isNumber(original.a)) {
	              return {
	                space: 'RGB',
	                r: original.r,
	                g: original.g,
	                b: original.b,
	                a: original.a
	              }
	            }
	            return false;
	          },

	          write: function(color) {
	            return {
	              r: color.r,
	              g: color.g,
	              b: color.b,
	              a: color.a
	            }
	          }
	        },

	        RGB_OBJ: {
	          read: function(original) {
	            if (common.isNumber(original.r) &&
	                common.isNumber(original.g) &&
	                common.isNumber(original.b)) {
	              return {
	                space: 'RGB',
	                r: original.r,
	                g: original.g,
	                b: original.b
	              }
	            }
	            return false;
	          },

	          write: function(color) {
	            return {
	              r: color.r,
	              g: color.g,
	              b: color.b
	            }
	          }
	        },

	        HSVA_OBJ: {
	          read: function(original) {
	            if (common.isNumber(original.h) &&
	                common.isNumber(original.s) &&
	                common.isNumber(original.v) &&
	                common.isNumber(original.a)) {
	              return {
	                space: 'HSV',
	                h: original.h,
	                s: original.s,
	                v: original.v,
	                a: original.a
	              }
	            }
	            return false;
	          },

	          write: function(color) {
	            return {
	              h: color.h,
	              s: color.s,
	              v: color.v,
	              a: color.a
	            }
	          }
	        },

	        HSV_OBJ: {
	          read: function(original) {
	            if (common.isNumber(original.h) &&
	                common.isNumber(original.s) &&
	                common.isNumber(original.v)) {
	              return {
	                space: 'HSV',
	                h: original.h,
	                s: original.s,
	                v: original.v
	              }
	            }
	            return false;
	          },

	          write: function(color) {
	            return {
	              h: color.h,
	              s: color.s,
	              v: color.v
	            }
	          }

	        }

	      }

	    }


	  ];

	  return interpret;


	})(dat.color.toString,
	dat.utils.common);


	dat.GUI = dat.gui.GUI = (function (css, saveDialogueContents, styleSheet, controllerFactory, Controller, BooleanController, FunctionController, NumberControllerBox, NumberControllerSlider, OptionController, ColorController, requestAnimationFrame, CenteredDiv, dom, common) {

	  css.inject(styleSheet);

	  /** Outer-most className for GUI's */
	  var CSS_NAMESPACE = 'dg';

	  var HIDE_KEY_CODE = 72;

	  /** The only value shared between the JS and SCSS. Use caution. */
	  var CLOSE_BUTTON_HEIGHT = 20;

	  var DEFAULT_DEFAULT_PRESET_NAME = 'Default';

	  var SUPPORTS_LOCAL_STORAGE = (function() {
	    try {
	      return 'localStorage' in window && window['localStorage'] !== null;
	    } catch (e) {
	      return false;
	    }
	  })();

	  var SAVE_DIALOGUE;

	  /** Have we yet to create an autoPlace GUI? */
	  var auto_place_virgin = true;

	  /** Fixed position div that auto place GUI's go inside */
	  var auto_place_container;

	  /** Are we hiding the GUI's ? */
	  var hide = false;

	  /** GUI's which should be hidden */
	  var hideable_guis = [];

	  /**
	   * A lightweight controller library for JavaScript. It allows you to easily
	   * manipulate variables and fire functions on the fly.
	   * @class
	   *
	   * @member dat.gui
	   *
	   * @param {Object} [params]
	   * @param {String} [params.name] The name of this GUI.
	   * @param {Object} [params.load] JSON object representing the saved state of
	   * this GUI.
	   * @param {Boolean} [params.auto=true]
	   * @param {dat.gui.GUI} [params.parent] The GUI I'm nested in.
	   * @param {Boolean} [params.closed] If true, starts closed
	   */
	  var GUI = function(params) {

	    var _this = this;

	    /**
	     * Outermost DOM Element
	     * @type DOMElement
	     */
	    this.domElement = document.createElement('div');
	    this.__ul = document.createElement('ul');
	    this.domElement.appendChild(this.__ul);

	    dom.addClass(this.domElement, CSS_NAMESPACE);

	    /**
	     * Nested GUI's by name
	     * @ignore
	     */
	    this.__folders = {};

	    this.__controllers = [];

	    /**
	     * List of objects I'm remembering for save, only used in top level GUI
	     * @ignore
	     */
	    this.__rememberedObjects = [];

	    /**
	     * Maps the index of remembered objects to a map of controllers, only used
	     * in top level GUI.
	     *
	     * @private
	     * @ignore
	     *
	     * @example
	     * [
	     *  {
	     *    propertyName: Controller,
	     *    anotherPropertyName: Controller
	     *  },
	     *  {
	     *    propertyName: Controller
	     *  }
	     * ]
	     */
	    this.__rememberedObjectIndecesToControllers = [];

	    this.__listening = [];

	    params = params || {};

	    // Default parameters
	    params = common.defaults(params, {
	      autoPlace: true,
	      width: GUI.DEFAULT_WIDTH
	    });

	    params = common.defaults(params, {
	      resizable: params.autoPlace,
	      hideable: params.autoPlace
	    });


	    if (!common.isUndefined(params.load)) {

	      // Explicit preset
	      if (params.preset) params.load.preset = params.preset;

	    } else {

	      params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };

	    }

	    if (common.isUndefined(params.parent) && params.hideable) {
	      hideable_guis.push(this);
	    }

	    // Only root level GUI's are resizable.
	    params.resizable = common.isUndefined(params.parent) && params.resizable;


	    if (params.autoPlace && common.isUndefined(params.scrollable)) {
	      params.scrollable = true;
	    }
	//    params.scrollable = common.isUndefined(params.parent) && params.scrollable === true;

	    // Not part of params because I don't want people passing this in via
	    // constructor. Should be a 'remembered' value.
	    var use_local_storage =
	        SUPPORTS_LOCAL_STORAGE &&
	            localStorage.getItem(getLocalStorageHash(this, 'isLocal')) === 'true';

	    Object.defineProperties(this,

	        /** @lends dat.gui.GUI.prototype */
	        {

	          /**
	           * The parent <code>GUI</code>
	           * @type dat.gui.GUI
	           */
	          parent: {
	            get: function() {
	              return params.parent;
	            }
	          },

	          scrollable: {
	            get: function() {
	              return params.scrollable;
	            }
	          },

	          /**
	           * Handles <code>GUI</code>'s element placement for you
	           * @type Boolean
	           */
	          autoPlace: {
	            get: function() {
	              return params.autoPlace;
	            }
	          },

	          /**
	           * The identifier for a set of saved values
	           * @type String
	           */
	          preset: {

	            get: function() {
	              if (_this.parent) {
	                return _this.getRoot().preset;
	              } else {
	                return params.load.preset;
	              }
	            },

	            set: function(v) {
	              if (_this.parent) {
	                _this.getRoot().preset = v;
	              } else {
	                params.load.preset = v;
	              }
	              setPresetSelectIndex(this);
	              _this.revert();
	            }

	          },

	          /**
	           * The width of <code>GUI</code> element
	           * @type Number
	           */
	          width: {
	            get: function() {
	              return params.width;
	            },
	            set: function(v) {
	              params.width = v;
	              setWidth(_this, v);
	            }
	          },

	          /**
	           * The name of <code>GUI</code>. Used for folders. i.e
	           * a folder's name
	           * @type String
	           */
	          name: {
	            get: function() {
	              return params.name;
	            },
	            set: function(v) {
	              // TODO Check for collisions among sibling folders
	              params.name = v;
	              if (title_row_name) {
	                title_row_name.innerHTML = params.name;
	              }
	            }
	          },

	          /**
	           * Whether the <code>GUI</code> is collapsed or not
	           * @type Boolean
	           */
	          closed: {
	            get: function() {
	              return params.closed;
	            },
	            set: function(v) {
	              params.closed = v;
	              if (params.closed) {
	                dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
	              } else {
	                dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
	              }
	              // For browsers that aren't going to respect the CSS transition,
	              // Lets just check our height against the window height right off
	              // the bat.
	              this.onResize();

	              if (_this.__closeButton) {
	                _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
	              }
	            }
	          },

	          /**
	           * Contains all presets
	           * @type Object
	           */
	          load: {
	            get: function() {
	              return params.load;
	            }
	          },

	          /**
	           * Determines whether or not to use <a href="https://developer.mozilla.org/en/DOM/Storage#localStorage">localStorage</a> as the means for
	           * <code>remember</code>ing
	           * @type Boolean
	           */
	          useLocalStorage: {

	            get: function() {
	              return use_local_storage;
	            },
	            set: function(bool) {
	              if (SUPPORTS_LOCAL_STORAGE) {
	                use_local_storage = bool;
	                if (bool) {
	                  dom.bind(window, 'unload', saveToLocalStorage);
	                } else {
	                  dom.unbind(window, 'unload', saveToLocalStorage);
	                }
	                localStorage.setItem(getLocalStorageHash(_this, 'isLocal'), bool);
	              }
	            }

	          }

	        });

	    // Are we a root level GUI?
	    if (common.isUndefined(params.parent)) {

	      params.closed = false;

	      dom.addClass(this.domElement, GUI.CLASS_MAIN);
	      dom.makeSelectable(this.domElement, false);

	      // Are we supposed to be loading locally?
	      if (SUPPORTS_LOCAL_STORAGE) {

	        if (use_local_storage) {

	          _this.useLocalStorage = true;

	          var saved_gui = localStorage.getItem(getLocalStorageHash(this, 'gui'));

	          if (saved_gui) {
	            params.load = JSON.parse(saved_gui);
	          }

	        }

	      }

	      this.__closeButton = document.createElement('div');
	      this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
	      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
	      this.domElement.appendChild(this.__closeButton);

	      dom.bind(this.__closeButton, 'click', function() {

	        _this.closed = !_this.closed;


	      });


	      // Oh, you're a nested GUI!
	    } else {

	      if (params.closed === undefined) {
	        params.closed = true;
	      }

	      var title_row_name = document.createTextNode(params.name);
	      dom.addClass(title_row_name, 'controller-name');

	      var title_row = addRow(_this, title_row_name);

	      var on_click_title = function(e) {
	        e.preventDefault();
	        _this.closed = !_this.closed;
	        return false;
	      };

	      dom.addClass(this.__ul, GUI.CLASS_CLOSED);

	      dom.addClass(title_row, 'title');
	      dom.bind(title_row, 'click', on_click_title);

	      if (!params.closed) {
	        this.closed = false;
	      }

	    }

	    if (params.autoPlace) {

	      if (common.isUndefined(params.parent)) {

	        if (auto_place_virgin) {
	          auto_place_container = document.createElement('div');
	          dom.addClass(auto_place_container, CSS_NAMESPACE);
	          dom.addClass(auto_place_container, GUI.CLASS_AUTO_PLACE_CONTAINER);
	          document.body.appendChild(auto_place_container);
	          auto_place_virgin = false;
	        }

	        // Put it in the dom for you.
	        auto_place_container.appendChild(this.domElement);

	        // Apply the auto styles
	        dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);

	      }


	      // Make it not elastic.
	      if (!this.parent) setWidth(_this, params.width);

	    }

	    dom.bind(window, 'resize', function() { _this.onResize() });
	    dom.bind(this.__ul, 'webkitTransitionEnd', function() { _this.onResize(); });
	    dom.bind(this.__ul, 'transitionend', function() { _this.onResize() });
	    dom.bind(this.__ul, 'oTransitionEnd', function() { _this.onResize() });
	    this.onResize();


	    if (params.resizable) {
	      addResizeHandle(this);
	    }

	    function saveToLocalStorage() {
	      localStorage.setItem(getLocalStorageHash(_this, 'gui'), JSON.stringify(_this.getSaveObject()));
	    }

	    var root = _this.getRoot();
	    function resetWidth() {
	        var root = _this.getRoot();
	        root.width += 1;
	        common.defer(function() {
	          root.width -= 1;
	        });
	      }

	      if (!params.parent) {
	        resetWidth();
	      }

	  };

	  GUI.toggleHide = function() {

	    hide = !hide;
	    common.each(hideable_guis, function(gui) {
	      gui.domElement.style.zIndex = hide ? -999 : 999;
	      gui.domElement.style.opacity = hide ? 0 : 1;
	    });
	  };

	  GUI.CLASS_AUTO_PLACE = 'a';
	  GUI.CLASS_AUTO_PLACE_CONTAINER = 'ac';
	  GUI.CLASS_MAIN = 'main';
	  GUI.CLASS_CONTROLLER_ROW = 'cr';
	  GUI.CLASS_TOO_TALL = 'taller-than-window';
	  GUI.CLASS_CLOSED = 'closed';
	  GUI.CLASS_CLOSE_BUTTON = 'close-button';
	  GUI.CLASS_DRAG = 'drag';

	  GUI.DEFAULT_WIDTH = 245;
	  GUI.TEXT_CLOSED = 'Close Controls';
	  GUI.TEXT_OPEN = 'Open Controls';

	  dom.bind(window, 'keydown', function(e) {

	    if (document.activeElement.type !== 'text' &&
	        (e.which === HIDE_KEY_CODE || e.keyCode == HIDE_KEY_CODE)) {
	      GUI.toggleHide();
	    }

	  }, false);

	  common.extend(

	      GUI.prototype,

	      /** @lends dat.gui.GUI */
	      {

	        /**
	         * @param object
	         * @param property
	         * @returns {dat.controllers.Controller} The new controller that was added.
	         * @instance
	         */
	        add: function(object, property) {

	          return add(
	              this,
	              object,
	              property,
	              {
	                factoryArgs: Array.prototype.slice.call(arguments, 2)
	              }
	          );

	        },

	        /**
	         * @param object
	         * @param property
	         * @returns {dat.controllers.ColorController} The new controller that was added.
	         * @instance
	         */
	        addColor: function(object, property) {

	          return add(
	              this,
	              object,
	              property,
	              {
	                color: true
	              }
	          );

	        },

	        /**
	         * @param controller
	         * @instance
	         */
	        remove: function(controller) {

	          // TODO listening?
	          this.__ul.removeChild(controller.__li);
	          this.__controllers.slice(this.__controllers.indexOf(controller), 1);
	          var _this = this;
	          common.defer(function() {
	            _this.onResize();
	          });

	        },

	        destroy: function() {

	          if (this.autoPlace) {
	            auto_place_container.removeChild(this.domElement);
	          }

	        },

	        /**
	         * @param name
	         * @returns {dat.gui.GUI} The new folder.
	         * @throws {Error} if this GUI already has a folder by the specified
	         * name
	         * @instance
	         */
	        addFolder: function(name) {

	          // We have to prevent collisions on names in order to have a key
	          // by which to remember saved values
	          if (this.__folders[name] !== undefined) {
	            throw new Error('You already have a folder in this GUI by the' +
	                ' name "' + name + '"');
	          }

	          var new_gui_params = { name: name, parent: this };

	          // We need to pass down the autoPlace trait so that we can
	          // attach event listeners to open/close folder actions to
	          // ensure that a scrollbar appears if the window is too short.
	          new_gui_params.autoPlace = this.autoPlace;

	          // Do we have saved appearance data for this folder?

	          if (this.load && // Anything loaded?
	              this.load.folders && // Was my parent a dead-end?
	              this.load.folders[name]) { // Did daddy remember me?

	            // Start me closed if I was closed
	            new_gui_params.closed = this.load.folders[name].closed;

	            // Pass down the loaded data
	            new_gui_params.load = this.load.folders[name];

	          }

	          var gui = new GUI(new_gui_params);
	          this.__folders[name] = gui;

	          var li = addRow(this, gui.domElement);
	          dom.addClass(li, 'folder');
	          return gui;

	        },

	        open: function() {
	          this.closed = false;
	        },

	        close: function() {
	          this.closed = true;
	        },

	        onResize: function() {

	          var root = this.getRoot();

	          if (root.scrollable) {

	            var top = dom.getOffset(root.__ul).top;
	            var h = 0;

	            common.each(root.__ul.childNodes, function(node) {
	              if (! (root.autoPlace && node === root.__save_row))
	                h += dom.getHeight(node);
	            });

	            if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
	              dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
	              root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + 'px';
	            } else {
	              dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
	              root.__ul.style.height = 'auto';
	            }

	          }

	          if (root.__resize_handle) {
	            common.defer(function() {
	              root.__resize_handle.style.height = root.__ul.offsetHeight + 'px';
	            });
	          }

	          if (root.__closeButton) {
	            root.__closeButton.style.width = root.width + 'px';
	          }

	        },

	        /**
	         * Mark objects for saving. The order of these objects cannot change as
	         * the GUI grows. When remembering new objects, append them to the end
	         * of the list.
	         *
	         * @param {Object...} objects
	         * @throws {Error} if not called on a top level GUI.
	         * @instance
	         */
	        remember: function() {

	          if (common.isUndefined(SAVE_DIALOGUE)) {
	            SAVE_DIALOGUE = new CenteredDiv();
	            SAVE_DIALOGUE.domElement.innerHTML = saveDialogueContents;
	          }

	          if (this.parent) {
	            throw new Error("You can only call remember on a top level GUI.");
	          }

	          var _this = this;

	          common.each(Array.prototype.slice.call(arguments), function(object) {
	            if (_this.__rememberedObjects.length == 0) {
	              addSaveMenu(_this);
	            }
	            if (_this.__rememberedObjects.indexOf(object) == -1) {
	              _this.__rememberedObjects.push(object);
	            }
	          });

	          if (this.autoPlace) {
	            // Set save row width
	            setWidth(this, this.width);
	          }

	        },

	        /**
	         * @returns {dat.gui.GUI} the topmost parent GUI of a nested GUI.
	         * @instance
	         */
	        getRoot: function() {
	          var gui = this;
	          while (gui.parent) {
	            gui = gui.parent;
	          }
	          return gui;
	        },

	        /**
	         * @returns {Object} a JSON object representing the current state of
	         * this GUI as well as its remembered properties.
	         * @instance
	         */
	        getSaveObject: function() {

	          var toReturn = this.load;

	          toReturn.closed = this.closed;

	          // Am I remembering any values?
	          if (this.__rememberedObjects.length > 0) {

	            toReturn.preset = this.preset;

	            if (!toReturn.remembered) {
	              toReturn.remembered = {};
	            }

	            toReturn.remembered[this.preset] = getCurrentPreset(this);

	          }

	          toReturn.folders = {};
	          common.each(this.__folders, function(element, key) {
	            toReturn.folders[key] = element.getSaveObject();
	          });

	          return toReturn;

	        },

	        save: function() {

	          if (!this.load.remembered) {
	            this.load.remembered = {};
	          }

	          this.load.remembered[this.preset] = getCurrentPreset(this);
	          markPresetModified(this, false);

	        },

	        saveAs: function(presetName) {

	          if (!this.load.remembered) {

	            // Retain default values upon first save
	            this.load.remembered = {};
	            this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);

	          }

	          this.load.remembered[presetName] = getCurrentPreset(this);
	          this.preset = presetName;
	          addPresetOption(this, presetName, true);

	        },

	        revert: function(gui) {

	          common.each(this.__controllers, function(controller) {
	            // Make revert work on Default.
	            if (!this.getRoot().load.remembered) {
	              controller.setValue(controller.initialValue);
	            } else {
	              recallSavedValue(gui || this.getRoot(), controller);
	            }
	          }, this);

	          common.each(this.__folders, function(folder) {
	            folder.revert(folder);
	          });

	          if (!gui) {
	            markPresetModified(this.getRoot(), false);
	          }


	        },

	        listen: function(controller) {

	          var init = this.__listening.length == 0;
	          this.__listening.push(controller);
	          if (init) updateDisplays(this.__listening);

	        }

	      }

	  );

	  function add(gui, object, property, params) {

	    if (object[property] === undefined) {
	      throw new Error("Object " + object + " has no property \"" + property + "\"");
	    }

	    var controller;

	    if (params.color) {

	      controller = new ColorController(object, property);

	    } else {

	      var factoryArgs = [object,property].concat(params.factoryArgs);
	      controller = controllerFactory.apply(gui, factoryArgs);

	    }

	    if (params.before instanceof Controller) {
	      params.before = params.before.__li;
	    }

	    recallSavedValue(gui, controller);

	    dom.addClass(controller.domElement, 'c');

	    var name = document.createElement('span');
	    dom.addClass(name, 'property-name');
	    name.innerHTML = controller.property;

	    var container = document.createElement('div');
	    container.appendChild(name);
	    container.appendChild(controller.domElement);

	    var li = addRow(gui, container, params.before);

	    dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
	    dom.addClass(li, typeof controller.getValue());

	    augmentController(gui, li, controller);

	    gui.__controllers.push(controller);

	    return controller;

	  }

	  /**
	   * Add a row to the end of the GUI or before another row.
	   *
	   * @param gui
	   * @param [dom] If specified, inserts the dom content in the new row
	   * @param [liBefore] If specified, places the new row before another row
	   */
	  function addRow(gui, dom, liBefore) {
	    var li = document.createElement('li');
	    if (dom) li.appendChild(dom);
	    if (liBefore) {
	      gui.__ul.insertBefore(li, params.before);
	    } else {
	      gui.__ul.appendChild(li);
	    }
	    gui.onResize();
	    return li;
	  }

	  function augmentController(gui, li, controller) {

	    controller.__li = li;
	    controller.__gui = gui;

	    common.extend(controller, {

	      options: function(options) {

	        if (arguments.length > 1) {
	          controller.remove();

	          return add(
	              gui,
	              controller.object,
	              controller.property,
	              {
	                before: controller.__li.nextElementSibling,
	                factoryArgs: [common.toArray(arguments)]
	              }
	          );

	        }

	        if (common.isArray(options) || common.isObject(options)) {
	          controller.remove();

	          return add(
	              gui,
	              controller.object,
	              controller.property,
	              {
	                before: controller.__li.nextElementSibling,
	                factoryArgs: [options]
	              }
	          );

	        }

	      },

	      name: function(v) {
	        controller.__li.firstElementChild.firstElementChild.innerHTML = v;
	        return controller;
	      },

	      listen: function() {
	        controller.__gui.listen(controller);
	        return controller;
	      },

	      remove: function() {
	        controller.__gui.remove(controller);
	        return controller;
	      }

	    });

	    // All sliders should be accompanied by a box.
	    if (controller instanceof NumberControllerSlider) {

	      var box = new NumberControllerBox(controller.object, controller.property,
	          { min: controller.__min, max: controller.__max, step: controller.__step });

	      common.each(['updateDisplay', 'onChange', 'onFinishChange'], function(method) {
	        var pc = controller[method];
	        var pb = box[method];
	        controller[method] = box[method] = function() {
	          var args = Array.prototype.slice.call(arguments);
	          pc.apply(controller, args);
	          return pb.apply(box, args);
	        }
	      });

	      dom.addClass(li, 'has-slider');
	      controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);

	    }
	    else if (controller instanceof NumberControllerBox) {

	      var r = function(returned) {

	        // Have we defined both boundaries?
	        if (common.isNumber(controller.__min) && common.isNumber(controller.__max)) {

	          // Well, then lets just replace this with a slider.
	          controller.remove();
	          return add(
	              gui,
	              controller.object,
	              controller.property,
	              {
	                before: controller.__li.nextElementSibling,
	                factoryArgs: [controller.__min, controller.__max, controller.__step]
	              });

	        }

	        return returned;

	      };

	      controller.min = common.compose(r, controller.min);
	      controller.max = common.compose(r, controller.max);

	    }
	    else if (controller instanceof BooleanController) {

	      dom.bind(li, 'click', function() {
	        dom.fakeEvent(controller.__checkbox, 'click');
	      });

	      dom.bind(controller.__checkbox, 'click', function(e) {
	        e.stopPropagation(); // Prevents double-toggle
	      })

	    }
	    else if (controller instanceof FunctionController) {

	      dom.bind(li, 'click', function() {
	        dom.fakeEvent(controller.__button, 'click');
	      });

	      dom.bind(li, 'mouseover', function() {
	        dom.addClass(controller.__button, 'hover');
	      });

	      dom.bind(li, 'mouseout', function() {
	        dom.removeClass(controller.__button, 'hover');
	      });

	    }
	    else if (controller instanceof ColorController) {

	      dom.addClass(li, 'color');
	      controller.updateDisplay = common.compose(function(r) {
	        li.style.borderLeftColor = controller.__color.toString();
	        return r;
	      }, controller.updateDisplay);

	      controller.updateDisplay();

	    }

	    controller.setValue = common.compose(function(r) {
	      if (gui.getRoot().__preset_select && controller.isModified()) {
	        markPresetModified(gui.getRoot(), true);
	      }
	      return r;
	    }, controller.setValue);

	  }

	  function recallSavedValue(gui, controller) {

	    // Find the topmost GUI, that's where remembered objects live.
	    var root = gui.getRoot();

	    // Does the object we're controlling match anything we've been told to
	    // remember?
	    var matched_index = root.__rememberedObjects.indexOf(controller.object);

	    // Why yes, it does!
	    if (matched_index != -1) {

	      // Let me fetch a map of controllers for thcommon.isObject.
	      var controller_map =
	          root.__rememberedObjectIndecesToControllers[matched_index];

	      // Ohp, I believe this is the first controller we've created for this
	      // object. Lets make the map fresh.
	      if (controller_map === undefined) {
	        controller_map = {};
	        root.__rememberedObjectIndecesToControllers[matched_index] =
	            controller_map;
	      }

	      // Keep track of this controller
	      controller_map[controller.property] = controller;

	      // Okay, now have we saved any values for this controller?
	      if (root.load && root.load.remembered) {

	        var preset_map = root.load.remembered;

	        // Which preset are we trying to load?
	        var preset;

	        if (preset_map[gui.preset]) {

	          preset = preset_map[gui.preset];

	        } else if (preset_map[DEFAULT_DEFAULT_PRESET_NAME]) {

	          // Uhh, you can have the default instead?
	          preset = preset_map[DEFAULT_DEFAULT_PRESET_NAME];

	        } else {

	          // Nada.

	          return;

	        }


	        // Did the loaded object remember thcommon.isObject?
	        if (preset[matched_index] &&

	          // Did we remember this particular property?
	            preset[matched_index][controller.property] !== undefined) {

	          // We did remember something for this guy ...
	          var value = preset[matched_index][controller.property];

	          // And that's what it is.
	          controller.initialValue = value;
	          controller.setValue(value);

	        }

	      }

	    }

	  }

	  function getLocalStorageHash(gui, key) {
	    // TODO how does this deal with multiple GUI's?
	    return document.location.href + '.' + key;

	  }

	  function addSaveMenu(gui) {

	    var div = gui.__save_row = document.createElement('li');

	    dom.addClass(gui.domElement, 'has-save');

	    gui.__ul.insertBefore(div, gui.__ul.firstChild);

	    dom.addClass(div, 'save-row');

	    var gears = document.createElement('span');
	    gears.innerHTML = '&nbsp;';
	    dom.addClass(gears, 'button gears');

	    // TODO replace with FunctionController
	    var button = document.createElement('span');
	    button.innerHTML = 'Save';
	    dom.addClass(button, 'button');
	    dom.addClass(button, 'save');

	    var button2 = document.createElement('span');
	    button2.innerHTML = 'New';
	    dom.addClass(button2, 'button');
	    dom.addClass(button2, 'save-as');

	    var button3 = document.createElement('span');
	    button3.innerHTML = 'Revert';
	    dom.addClass(button3, 'button');
	    dom.addClass(button3, 'revert');

	    var select = gui.__preset_select = document.createElement('select');

	    if (gui.load && gui.load.remembered) {

	      common.each(gui.load.remembered, function(value, key) {
	        addPresetOption(gui, key, key == gui.preset);
	      });

	    } else {
	      addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
	    }

	    dom.bind(select, 'change', function() {


	      for (var index = 0; index < gui.__preset_select.length; index++) {
	        gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
	      }

	      gui.preset = this.value;

	    });

	    div.appendChild(select);
	    div.appendChild(gears);
	    div.appendChild(button);
	    div.appendChild(button2);
	    div.appendChild(button3);

	    if (SUPPORTS_LOCAL_STORAGE) {

	      var saveLocally = document.getElementById('dg-save-locally');
	      var explain = document.getElementById('dg-local-explain');

	      saveLocally.style.display = 'block';

	      var localStorageCheckBox = document.getElementById('dg-local-storage');

	      if (localStorage.getItem(getLocalStorageHash(gui, 'isLocal')) === 'true') {
	        localStorageCheckBox.setAttribute('checked', 'checked');
	      }

	      function showHideExplain() {
	        explain.style.display = gui.useLocalStorage ? 'block' : 'none';
	      }

	      showHideExplain();

	      // TODO: Use a boolean controller, fool!
	      dom.bind(localStorageCheckBox, 'change', function() {
	        gui.useLocalStorage = !gui.useLocalStorage;
	        showHideExplain();
	      });

	    }

	    var newConstructorTextArea = document.getElementById('dg-new-constructor');

	    dom.bind(newConstructorTextArea, 'keydown', function(e) {
	      if (e.metaKey && (e.which === 67 || e.keyCode == 67)) {
	        SAVE_DIALOGUE.hide();
	      }
	    });

	    dom.bind(gears, 'click', function() {
	      newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
	      SAVE_DIALOGUE.show();
	      newConstructorTextArea.focus();
	      newConstructorTextArea.select();
	    });

	    dom.bind(button, 'click', function() {
	      gui.save();
	    });

	    dom.bind(button2, 'click', function() {
	      var presetName = prompt('Enter a new preset name.');
	      if (presetName) gui.saveAs(presetName);
	    });

	    dom.bind(button3, 'click', function() {
	      gui.revert();
	    });

	//    div.appendChild(button2);

	  }

	  function addResizeHandle(gui) {

	    gui.__resize_handle = document.createElement('div');

	    common.extend(gui.__resize_handle.style, {

	      width: '6px',
	      marginLeft: '-3px',
	      height: '200px',
	      cursor: 'ew-resize',
	      position: 'absolute'
	//      border: '1px solid blue'

	    });

	    var pmouseX;

	    dom.bind(gui.__resize_handle, 'mousedown', dragStart);
	    dom.bind(gui.__closeButton, 'mousedown', dragStart);

	    gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);

	    function dragStart(e) {

	      e.preventDefault();

	      pmouseX = e.clientX;

	      dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
	      dom.bind(window, 'mousemove', drag);
	      dom.bind(window, 'mouseup', dragStop);

	      return false;

	    }

	    function drag(e) {

	      e.preventDefault();

	      gui.width += pmouseX - e.clientX;
	      gui.onResize();
	      pmouseX = e.clientX;

	      return false;

	    }

	    function dragStop() {

	      dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
	      dom.unbind(window, 'mousemove', drag);
	      dom.unbind(window, 'mouseup', dragStop);

	    }

	  }

	  function setWidth(gui, w) {
	    gui.domElement.style.width = w + 'px';
	    // Auto placed save-rows are position fixed, so we have to
	    // set the width manually if we want it to bleed to the edge
	    if (gui.__save_row && gui.autoPlace) {
	      gui.__save_row.style.width = w + 'px';
	    }if (gui.__closeButton) {
	      gui.__closeButton.style.width = w + 'px';
	    }
	  }

	  function getCurrentPreset(gui, useInitialValues) {

	    var toReturn = {};

	    // For each object I'm remembering
	    common.each(gui.__rememberedObjects, function(val, index) {

	      var saved_values = {};

	      // The controllers I've made for thcommon.isObject by property
	      var controller_map =
	          gui.__rememberedObjectIndecesToControllers[index];

	      // Remember each value for each property
	      common.each(controller_map, function(controller, property) {
	        saved_values[property] = useInitialValues ? controller.initialValue : controller.getValue();
	      });

	      // Save the values for thcommon.isObject
	      toReturn[index] = saved_values;

	    });

	    return toReturn;

	  }

	  function addPresetOption(gui, name, setSelected) {
	    var opt = document.createElement('option');
	    opt.innerHTML = name;
	    opt.value = name;
	    gui.__preset_select.appendChild(opt);
	    if (setSelected) {
	      gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
	    }
	  }

	  function setPresetSelectIndex(gui) {
	    for (var index = 0; index < gui.__preset_select.length; index++) {
	      if (gui.__preset_select[index].value == gui.preset) {
	        gui.__preset_select.selectedIndex = index;
	      }
	    }
	  }

	  function markPresetModified(gui, modified) {
	    var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
	//    console.log('mark', modified, opt);
	    if (modified) {
	      opt.innerHTML = opt.value + "*";
	    } else {
	      opt.innerHTML = opt.value;
	    }
	  }

	  function updateDisplays(controllerArray) {


	    if (controllerArray.length != 0) {

	      requestAnimationFrame(function() {
	        updateDisplays(controllerArray);
	      });

	    }

	    common.each(controllerArray, function(c) {
	      c.updateDisplay();
	    });

	  }

	  return GUI;

	})(dat.utils.css,
	"<div id=\"dg-save\" class=\"dg dialogue\">\n\n  Here's the new load parameter for your <code>GUI</code>'s constructor:\n\n  <textarea id=\"dg-new-constructor\"></textarea>\n\n  <div id=\"dg-save-locally\">\n\n    <input id=\"dg-local-storage\" type=\"checkbox\"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id=\"dg-local-explain\">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n      \n    </div>\n    \n  </div>\n\n</div>",
	".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity 0.1s linear;-o-transition:opacity 0.1s linear;-moz-transition:opacity 0.1s linear;transition:opacity 0.1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity 0.1s linear;-o-transition:opacity 0.1s linear;-moz-transition:opacity 0.1s linear;transition:opacity 0.1s linear;border:0;position:absolute;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-x:hidden}.dg.a.has-save ul{margin-top:27px}.dg.a.has-save ul.closed{margin-top:0}.dg.a .save-row{position:fixed;top:0;z-index:1002}.dg li{-webkit-transition:height 0.1s ease-out;-o-transition:height 0.1s ease-out;-moz-transition:height 0.1s ease-out;transition:height 0.1s ease-out}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;overflow:hidden;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li > *{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:9px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2fa1d6}.dg .cr.number input[type=text]{color:#2fa1d6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2fa1d6}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n",
	dat.controllers.factory = (function (OptionController, NumberControllerBox, NumberControllerSlider, StringController, FunctionController, BooleanController, common) {

	      return function(object, property) {

	        var initialValue = object[property];

	        // Providing options?
	        if (common.isArray(arguments[2]) || common.isObject(arguments[2])) {
	          return new OptionController(object, property, arguments[2]);
	        }

	        // Providing a map?

	        if (common.isNumber(initialValue)) {

	          if (common.isNumber(arguments[2]) && common.isNumber(arguments[3])) {

	            // Has min and max.
	            return new NumberControllerSlider(object, property, arguments[2], arguments[3]);

	          } else {

	            return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });

	          }

	        }

	        if (common.isString(initialValue)) {
	          return new StringController(object, property);
	        }

	        if (common.isFunction(initialValue)) {
	          return new FunctionController(object, property, '');
	        }

	        if (common.isBoolean(initialValue)) {
	          return new BooleanController(object, property);
	        }

	      }

	    })(dat.controllers.OptionController,
	dat.controllers.NumberControllerBox,
	dat.controllers.NumberControllerSlider,
	dat.controllers.StringController = (function (Controller, dom, common) {

	  /**
	   * @class Provides a text input to alter the string property of an object.
	   *
	   * @extends dat.controllers.Controller
	   *
	   * @param {Object} object The object to be manipulated
	   * @param {string} property The name of the property to be manipulated
	   *
	   * @member dat.controllers
	   */
	  var StringController = function(object, property) {

	    StringController.superclass.call(this, object, property);

	    var _this = this;

	    this.__input = document.createElement('input');
	    this.__input.setAttribute('type', 'text');

	    dom.bind(this.__input, 'keyup', onChange);
	    dom.bind(this.__input, 'change', onChange);
	    dom.bind(this.__input, 'blur', onBlur);
	    dom.bind(this.__input, 'keydown', function(e) {
	      if (e.keyCode === 13) {
	        this.blur();
	      }
	    });
	    

	    function onChange() {
	      _this.setValue(_this.__input.value);
	    }

	    function onBlur() {
	      if (_this.__onFinishChange) {
	        _this.__onFinishChange.call(_this, _this.getValue());
	      }
	    }

	    this.updateDisplay();

	    this.domElement.appendChild(this.__input);

	  };

	  StringController.superclass = Controller;

	  common.extend(

	      StringController.prototype,
	      Controller.prototype,

	      {

	        updateDisplay: function() {
	          // Stops the caret from moving on account of:
	          // keyup -> setValue -> updateDisplay
	          if (!dom.isActive(this.__input)) {
	            this.__input.value = this.getValue();
	          }
	          return StringController.superclass.prototype.updateDisplay.call(this);
	        }

	      }

	  );

	  return StringController;

	})(dat.controllers.Controller,
	dat.dom.dom,
	dat.utils.common),
	dat.controllers.FunctionController,
	dat.controllers.BooleanController,
	dat.utils.common),
	dat.controllers.Controller,
	dat.controllers.BooleanController,
	dat.controllers.FunctionController,
	dat.controllers.NumberControllerBox,
	dat.controllers.NumberControllerSlider,
	dat.controllers.OptionController,
	dat.controllers.ColorController = (function (Controller, dom, Color, interpret, common) {

	  var ColorController = function(object, property) {

	    ColorController.superclass.call(this, object, property);

	    this.__color = new Color(this.getValue());
	    this.__temp = new Color(0);

	    var _this = this;

	    this.domElement = document.createElement('div');

	    dom.makeSelectable(this.domElement, false);

	    this.__selector = document.createElement('div');
	    this.__selector.className = 'selector';

	    this.__saturation_field = document.createElement('div');
	    this.__saturation_field.className = 'saturation-field';

	    this.__field_knob = document.createElement('div');
	    this.__field_knob.className = 'field-knob';
	    this.__field_knob_border = '2px solid ';

	    this.__hue_knob = document.createElement('div');
	    this.__hue_knob.className = 'hue-knob';

	    this.__hue_field = document.createElement('div');
	    this.__hue_field.className = 'hue-field';

	    this.__input = document.createElement('input');
	    this.__input.type = 'text';
	    this.__input_textShadow = '0 1px 1px ';

	    dom.bind(this.__input, 'keydown', function(e) {
	      if (e.keyCode === 13) { // on enter
	        onBlur.call(this);
	      }
	    });

	    dom.bind(this.__input, 'blur', onBlur);

	    dom.bind(this.__selector, 'mousedown', function(e) {

	      dom
	        .addClass(this, 'drag')
	        .bind(window, 'mouseup', function(e) {
	          dom.removeClass(_this.__selector, 'drag');
	        });

	    });

	    var value_field = document.createElement('div');

	    common.extend(this.__selector.style, {
	      width: '122px',
	      height: '102px',
	      padding: '3px',
	      backgroundColor: '#222',
	      boxShadow: '0px 1px 3px rgba(0,0,0,0.3)'
	    });

	    common.extend(this.__field_knob.style, {
	      position: 'absolute',
	      width: '12px',
	      height: '12px',
	      border: this.__field_knob_border + (this.__color.v < .5 ? '#fff' : '#000'),
	      boxShadow: '0px 1px 3px rgba(0,0,0,0.5)',
	      borderRadius: '12px',
	      zIndex: 1
	    });
	    
	    common.extend(this.__hue_knob.style, {
	      position: 'absolute',
	      width: '15px',
	      height: '2px',
	      borderRight: '4px solid #fff',
	      zIndex: 1
	    });

	    common.extend(this.__saturation_field.style, {
	      width: '100px',
	      height: '100px',
	      border: '1px solid #555',
	      marginRight: '3px',
	      display: 'inline-block',
	      cursor: 'pointer'
	    });

	    common.extend(value_field.style, {
	      width: '100%',
	      height: '100%',
	      background: 'none'
	    });
	    
	    linearGradient(value_field, 'top', 'rgba(0,0,0,0)', '#000');

	    common.extend(this.__hue_field.style, {
	      width: '15px',
	      height: '100px',
	      display: 'inline-block',
	      border: '1px solid #555',
	      cursor: 'ns-resize'
	    });

	    hueGradient(this.__hue_field);

	    common.extend(this.__input.style, {
	      outline: 'none',
	//      width: '120px',
	      textAlign: 'center',
	//      padding: '4px',
	//      marginBottom: '6px',
	      color: '#fff',
	      border: 0,
	      fontWeight: 'bold',
	      textShadow: this.__input_textShadow + 'rgba(0,0,0,0.7)'
	    });

	    dom.bind(this.__saturation_field, 'mousedown', fieldDown);
	    dom.bind(this.__field_knob, 'mousedown', fieldDown);

	    dom.bind(this.__hue_field, 'mousedown', function(e) {
	      setH(e);
	      dom.bind(window, 'mousemove', setH);
	      dom.bind(window, 'mouseup', unbindH);
	    });

	    function fieldDown(e) {
	      setSV(e);
	      // document.body.style.cursor = 'none';
	      dom.bind(window, 'mousemove', setSV);
	      dom.bind(window, 'mouseup', unbindSV);
	    }

	    function unbindSV() {
	      dom.unbind(window, 'mousemove', setSV);
	      dom.unbind(window, 'mouseup', unbindSV);
	      // document.body.style.cursor = 'default';
	    }

	    function onBlur() {
	      var i = interpret(this.value);
	      if (i !== false) {
	        _this.__color.__state = i;
	        _this.setValue(_this.__color.toOriginal());
	      } else {
	        this.value = _this.__color.toString();
	      }
	    }

	    function unbindH() {
	      dom.unbind(window, 'mousemove', setH);
	      dom.unbind(window, 'mouseup', unbindH);
	    }

	    this.__saturation_field.appendChild(value_field);
	    this.__selector.appendChild(this.__field_knob);
	    this.__selector.appendChild(this.__saturation_field);
	    this.__selector.appendChild(this.__hue_field);
	    this.__hue_field.appendChild(this.__hue_knob);

	    this.domElement.appendChild(this.__input);
	    this.domElement.appendChild(this.__selector);

	    this.updateDisplay();

	    function setSV(e) {

	      e.preventDefault();

	      var w = dom.getWidth(_this.__saturation_field);
	      var o = dom.getOffset(_this.__saturation_field);
	      var s = (e.clientX - o.left + document.body.scrollLeft) / w;
	      var v = 1 - (e.clientY - o.top + document.body.scrollTop) / w;

	      if (v > 1) v = 1;
	      else if (v < 0) v = 0;

	      if (s > 1) s = 1;
	      else if (s < 0) s = 0;

	      _this.__color.v = v;
	      _this.__color.s = s;

	      _this.setValue(_this.__color.toOriginal());


	      return false;

	    }

	    function setH(e) {

	      e.preventDefault();

	      var s = dom.getHeight(_this.__hue_field);
	      var o = dom.getOffset(_this.__hue_field);
	      var h = 1 - (e.clientY - o.top + document.body.scrollTop) / s;

	      if (h > 1) h = 1;
	      else if (h < 0) h = 0;

	      _this.__color.h = h * 360;

	      _this.setValue(_this.__color.toOriginal());

	      return false;

	    }

	  };

	  ColorController.superclass = Controller;

	  common.extend(

	      ColorController.prototype,
	      Controller.prototype,

	      {

	        updateDisplay: function() {

	          var i = interpret(this.getValue());

	          if (i !== false) {

	            var mismatch = false;

	            // Check for mismatch on the interpreted value.

	            common.each(Color.COMPONENTS, function(component) {
	              if (!common.isUndefined(i[component]) &&
	                  !common.isUndefined(this.__color.__state[component]) &&
	                  i[component] !== this.__color.__state[component]) {
	                mismatch = true;
	                return {}; // break
	              }
	            }, this);

	            // If nothing diverges, we keep our previous values
	            // for statefulness, otherwise we recalculate fresh
	            if (mismatch) {
	              common.extend(this.__color.__state, i);
	            }

	          }

	          common.extend(this.__temp.__state, this.__color.__state);

	          this.__temp.a = 1;

	          var flip = (this.__color.v < .5 || this.__color.s > .5) ? 255 : 0;
	          var _flip = 255 - flip;

	          common.extend(this.__field_knob.style, {
	            marginLeft: 100 * this.__color.s - 7 + 'px',
	            marginTop: 100 * (1 - this.__color.v) - 7 + 'px',
	            backgroundColor: this.__temp.toString(),
	            border: this.__field_knob_border + 'rgb(' + flip + ',' + flip + ',' + flip +')'
	          });

	          this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + 'px'

	          this.__temp.s = 1;
	          this.__temp.v = 1;

	          linearGradient(this.__saturation_field, 'left', '#fff', this.__temp.toString());

	          common.extend(this.__input.style, {
	            backgroundColor: this.__input.value = this.__color.toString(),
	            color: 'rgb(' + flip + ',' + flip + ',' + flip +')',
	            textShadow: this.__input_textShadow + 'rgba(' + _flip + ',' + _flip + ',' + _flip +',.7)'
	          });

	        }

	      }

	  );
	  
	  var vendors = ['-moz-','-o-','-webkit-','-ms-',''];
	  
	  function linearGradient(elem, x, a, b) {
	    elem.style.background = '';
	    common.each(vendors, function(vendor) {
	      elem.style.cssText += 'background: ' + vendor + 'linear-gradient('+x+', '+a+' 0%, ' + b + ' 100%); ';
	    });
	  }
	  
	  function hueGradient(elem) {
	    elem.style.background = '';
	    elem.style.cssText += 'background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);'
	    elem.style.cssText += 'background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
	    elem.style.cssText += 'background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
	    elem.style.cssText += 'background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
	    elem.style.cssText += 'background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
	  }


	  return ColorController;

	})(dat.controllers.Controller,
	dat.dom.dom,
	dat.color.Color = (function (interpret, math, toString, common) {

	  var Color = function() {

	    this.__state = interpret.apply(this, arguments);

	    if (this.__state === false) {
	      throw 'Failed to interpret color arguments';
	    }

	    this.__state.a = this.__state.a || 1;


	  };

	  Color.COMPONENTS = ['r','g','b','h','s','v','hex','a'];

	  common.extend(Color.prototype, {

	    toString: function() {
	      return toString(this);
	    },

	    toOriginal: function() {
	      return this.__state.conversion.write(this);
	    }

	  });

	  defineRGBComponent(Color.prototype, 'r', 2);
	  defineRGBComponent(Color.prototype, 'g', 1);
	  defineRGBComponent(Color.prototype, 'b', 0);

	  defineHSVComponent(Color.prototype, 'h');
	  defineHSVComponent(Color.prototype, 's');
	  defineHSVComponent(Color.prototype, 'v');

	  Object.defineProperty(Color.prototype, 'a', {

	    get: function() {
	      return this.__state.a;
	    },

	    set: function(v) {
	      this.__state.a = v;
	    }

	  });

	  Object.defineProperty(Color.prototype, 'hex', {

	    get: function() {

	      if (!this.__state.space !== 'HEX') {
	        this.__state.hex = math.rgb_to_hex(this.r, this.g, this.b);
	      }

	      return this.__state.hex;

	    },

	    set: function(v) {

	      this.__state.space = 'HEX';
	      this.__state.hex = v;

	    }

	  });

	  function defineRGBComponent(target, component, componentHexIndex) {

	    Object.defineProperty(target, component, {

	      get: function() {

	        if (this.__state.space === 'RGB') {
	          return this.__state[component];
	        }

	        recalculateRGB(this, component, componentHexIndex);

	        return this.__state[component];

	      },

	      set: function(v) {

	        if (this.__state.space !== 'RGB') {
	          recalculateRGB(this, component, componentHexIndex);
	          this.__state.space = 'RGB';
	        }

	        this.__state[component] = v;

	      }

	    });

	  }

	  function defineHSVComponent(target, component) {

	    Object.defineProperty(target, component, {

	      get: function() {

	        if (this.__state.space === 'HSV')
	          return this.__state[component];

	        recalculateHSV(this);

	        return this.__state[component];

	      },

	      set: function(v) {

	        if (this.__state.space !== 'HSV') {
	          recalculateHSV(this);
	          this.__state.space = 'HSV';
	        }

	        this.__state[component] = v;

	      }

	    });

	  }

	  function recalculateRGB(color, component, componentHexIndex) {

	    if (color.__state.space === 'HEX') {

	      color.__state[component] = math.component_from_hex(color.__state.hex, componentHexIndex);

	    } else if (color.__state.space === 'HSV') {

	      common.extend(color.__state, math.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));

	    } else {

	      throw 'Corrupted color state';

	    }

	  }

	  function recalculateHSV(color) {

	    var result = math.rgb_to_hsv(color.r, color.g, color.b);

	    common.extend(color.__state,
	        {
	          s: result.s,
	          v: result.v
	        }
	    );

	    if (!common.isNaN(result.h)) {
	      color.__state.h = result.h;
	    } else if (common.isUndefined(color.__state.h)) {
	      color.__state.h = 0;
	    }

	  }

	  return Color;

	})(dat.color.interpret,
	dat.color.math = (function () {

	  var tmpComponent;

	  return {

	    hsv_to_rgb: function(h, s, v) {

	      var hi = Math.floor(h / 60) % 6;

	      var f = h / 60 - Math.floor(h / 60);
	      var p = v * (1.0 - s);
	      var q = v * (1.0 - (f * s));
	      var t = v * (1.0 - ((1.0 - f) * s));
	      var c = [
	        [v, t, p],
	        [q, v, p],
	        [p, v, t],
	        [p, q, v],
	        [t, p, v],
	        [v, p, q]
	      ][hi];

	      return {
	        r: c[0] * 255,
	        g: c[1] * 255,
	        b: c[2] * 255
	      };

	    },

	    rgb_to_hsv: function(r, g, b) {

	      var min = Math.min(r, g, b),
	          max = Math.max(r, g, b),
	          delta = max - min,
	          h, s;

	      if (max != 0) {
	        s = delta / max;
	      } else {
	        return {
	          h: NaN,
	          s: 0,
	          v: 0
	        };
	      }

	      if (r == max) {
	        h = (g - b) / delta;
	      } else if (g == max) {
	        h = 2 + (b - r) / delta;
	      } else {
	        h = 4 + (r - g) / delta;
	      }
	      h /= 6;
	      if (h < 0) {
	        h += 1;
	      }

	      return {
	        h: h * 360,
	        s: s,
	        v: max / 255
	      };
	    },

	    rgb_to_hex: function(r, g, b) {
	      var hex = this.hex_with_component(0, 2, r);
	      hex = this.hex_with_component(hex, 1, g);
	      hex = this.hex_with_component(hex, 0, b);
	      return hex;
	    },

	    component_from_hex: function(hex, componentIndex) {
	      return (hex >> (componentIndex * 8)) & 0xFF;
	    },

	    hex_with_component: function(hex, componentIndex, value) {
	      return value << (tmpComponent = componentIndex * 8) | (hex & ~ (0xFF << tmpComponent));
	    }

	  }

	})(),
	dat.color.toString,
	dat.utils.common),
	dat.color.interpret,
	dat.utils.common),
	dat.utils.requestAnimationFrame = (function () {

	  /**
	   * requirejs version of Paul Irish's RequestAnimationFrame
	   * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	   */

	  return window.webkitRequestAnimationFrame ||
	      window.mozRequestAnimationFrame ||
	      window.oRequestAnimationFrame ||
	      window.msRequestAnimationFrame ||
	      function(callback, element) {

	        window.setTimeout(callback, 1000 / 60);

	      };
	})(),
	dat.dom.CenteredDiv = (function (dom, common) {


	  var CenteredDiv = function() {

	    this.backgroundElement = document.createElement('div');
	    common.extend(this.backgroundElement.style, {
	      backgroundColor: 'rgba(0,0,0,0.8)',
	      top: 0,
	      left: 0,
	      display: 'none',
	      zIndex: '1000',
	      opacity: 0,
	      WebkitTransition: 'opacity 0.2s linear'
	    });

	    dom.makeFullscreen(this.backgroundElement);
	    this.backgroundElement.style.position = 'fixed';

	    this.domElement = document.createElement('div');
	    common.extend(this.domElement.style, {
	      position: 'fixed',
	      display: 'none',
	      zIndex: '1001',
	      opacity: 0,
	      WebkitTransition: '-webkit-transform 0.2s ease-out, opacity 0.2s linear'
	    });


	    document.body.appendChild(this.backgroundElement);
	    document.body.appendChild(this.domElement);

	    var _this = this;
	    dom.bind(this.backgroundElement, 'click', function() {
	      _this.hide();
	    });


	  };

	  CenteredDiv.prototype.show = function() {

	    var _this = this;
	    


	    this.backgroundElement.style.display = 'block';

	    this.domElement.style.display = 'block';
	    this.domElement.style.opacity = 0;
	//    this.domElement.style.top = '52%';
	    this.domElement.style.webkitTransform = 'scale(1.1)';

	    this.layout();

	    common.defer(function() {
	      _this.backgroundElement.style.opacity = 1;
	      _this.domElement.style.opacity = 1;
	      _this.domElement.style.webkitTransform = 'scale(1)';
	    });

	  };

	  CenteredDiv.prototype.hide = function() {

	    var _this = this;

	    var hide = function() {

	      _this.domElement.style.display = 'none';
	      _this.backgroundElement.style.display = 'none';

	      dom.unbind(_this.domElement, 'webkitTransitionEnd', hide);
	      dom.unbind(_this.domElement, 'transitionend', hide);
	      dom.unbind(_this.domElement, 'oTransitionEnd', hide);

	    };

	    dom.bind(this.domElement, 'webkitTransitionEnd', hide);
	    dom.bind(this.domElement, 'transitionend', hide);
	    dom.bind(this.domElement, 'oTransitionEnd', hide);

	    this.backgroundElement.style.opacity = 0;
	//    this.domElement.style.top = '48%';
	    this.domElement.style.opacity = 0;
	    this.domElement.style.webkitTransform = 'scale(1.1)';

	  };

	  CenteredDiv.prototype.layout = function() {
	    this.domElement.style.left = window.innerWidth/2 - dom.getWidth(this.domElement) / 2 + 'px';
	    this.domElement.style.top = window.innerHeight/2 - dom.getHeight(this.domElement) / 2 + 'px';
	  };
	  
	  function lockScroll(e) {
	    console.log(e);
	  }

	  return CenteredDiv;

	})(dat.dom.dom,
	dat.utils.common),
	dat.dom.dom,
	dat.utils.common);

/***/ },
/* 25 */
/***/ function(module, exports) {

	/**
	 * dat-gui JavaScript Controller Library
	 * http://code.google.com/p/dat-gui
	 *
	 * Copyright 2011 Data Arts Team, Google Creative Lab
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 */

	/** @namespace */
	var dat = module.exports = dat || {};

	/** @namespace */
	dat.color = dat.color || {};

	/** @namespace */
	dat.utils = dat.utils || {};

	dat.utils.common = (function () {
	  
	  var ARR_EACH = Array.prototype.forEach;
	  var ARR_SLICE = Array.prototype.slice;

	  /**
	   * Band-aid methods for things that should be a lot easier in JavaScript.
	   * Implementation and structure inspired by underscore.js
	   * http://documentcloud.github.com/underscore/
	   */

	  return { 
	    
	    BREAK: {},
	  
	    extend: function(target) {
	      
	      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
	        
	        for (var key in obj)
	          if (!this.isUndefined(obj[key])) 
	            target[key] = obj[key];
	        
	      }, this);
	      
	      return target;
	      
	    },
	    
	    defaults: function(target) {
	      
	      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
	        
	        for (var key in obj)
	          if (this.isUndefined(target[key])) 
	            target[key] = obj[key];
	        
	      }, this);
	      
	      return target;
	    
	    },
	    
	    compose: function() {
	      var toCall = ARR_SLICE.call(arguments);
	            return function() {
	              var args = ARR_SLICE.call(arguments);
	              for (var i = toCall.length -1; i >= 0; i--) {
	                args = [toCall[i].apply(this, args)];
	              }
	              return args[0];
	            }
	    },
	    
	    each: function(obj, itr, scope) {

	      
	      if (ARR_EACH && obj.forEach === ARR_EACH) { 
	        
	        obj.forEach(itr, scope);
	        
	      } else if (obj.length === obj.length + 0) { // Is number but not NaN
	        
	        for (var key = 0, l = obj.length; key < l; key++)
	          if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) 
	            return;
	            
	      } else {

	        for (var key in obj) 
	          if (itr.call(scope, obj[key], key) === this.BREAK)
	            return;
	            
	      }
	            
	    },
	    
	    defer: function(fnc) {
	      setTimeout(fnc, 0);
	    },
	    
	    toArray: function(obj) {
	      if (obj.toArray) return obj.toArray();
	      return ARR_SLICE.call(obj);
	    },

	    isUndefined: function(obj) {
	      return obj === undefined;
	    },
	    
	    isNull: function(obj) {
	      return obj === null;
	    },
	    
	    isNaN: function(obj) {
	      return obj !== obj;
	    },
	    
	    isArray: Array.isArray || function(obj) {
	      return obj.constructor === Array;
	    },
	    
	    isObject: function(obj) {
	      return obj === Object(obj);
	    },
	    
	    isNumber: function(obj) {
	      return obj === obj+0;
	    },
	    
	    isString: function(obj) {
	      return obj === obj+'';
	    },
	    
	    isBoolean: function(obj) {
	      return obj === false || obj === true;
	    },
	    
	    isFunction: function(obj) {
	      return Object.prototype.toString.call(obj) === '[object Function]';
	    }
	  
	  };
	    
	})();


	dat.color.toString = (function (common) {

	  return function(color) {

	    if (color.a == 1 || common.isUndefined(color.a)) {

	      var s = color.hex.toString(16);
	      while (s.length < 6) {
	        s = '0' + s;
	      }

	      return '#' + s;

	    } else {

	      return 'rgba(' + Math.round(color.r) + ',' + Math.round(color.g) + ',' + Math.round(color.b) + ',' + color.a + ')';

	    }

	  }

	})(dat.utils.common);


	dat.Color = dat.color.Color = (function (interpret, math, toString, common) {

	  var Color = function() {

	    this.__state = interpret.apply(this, arguments);

	    if (this.__state === false) {
	      throw 'Failed to interpret color arguments';
	    }

	    this.__state.a = this.__state.a || 1;


	  };

	  Color.COMPONENTS = ['r','g','b','h','s','v','hex','a'];

	  common.extend(Color.prototype, {

	    toString: function() {
	      return toString(this);
	    },

	    toOriginal: function() {
	      return this.__state.conversion.write(this);
	    }

	  });

	  defineRGBComponent(Color.prototype, 'r', 2);
	  defineRGBComponent(Color.prototype, 'g', 1);
	  defineRGBComponent(Color.prototype, 'b', 0);

	  defineHSVComponent(Color.prototype, 'h');
	  defineHSVComponent(Color.prototype, 's');
	  defineHSVComponent(Color.prototype, 'v');

	  Object.defineProperty(Color.prototype, 'a', {

	    get: function() {
	      return this.__state.a;
	    },

	    set: function(v) {
	      this.__state.a = v;
	    }

	  });

	  Object.defineProperty(Color.prototype, 'hex', {

	    get: function() {

	      if (!this.__state.space !== 'HEX') {
	        this.__state.hex = math.rgb_to_hex(this.r, this.g, this.b);
	      }

	      return this.__state.hex;

	    },

	    set: function(v) {

	      this.__state.space = 'HEX';
	      this.__state.hex = v;

	    }

	  });

	  function defineRGBComponent(target, component, componentHexIndex) {

	    Object.defineProperty(target, component, {

	      get: function() {

	        if (this.__state.space === 'RGB') {
	          return this.__state[component];
	        }

	        recalculateRGB(this, component, componentHexIndex);

	        return this.__state[component];

	      },

	      set: function(v) {

	        if (this.__state.space !== 'RGB') {
	          recalculateRGB(this, component, componentHexIndex);
	          this.__state.space = 'RGB';
	        }

	        this.__state[component] = v;

	      }

	    });

	  }

	  function defineHSVComponent(target, component) {

	    Object.defineProperty(target, component, {

	      get: function() {

	        if (this.__state.space === 'HSV')
	          return this.__state[component];

	        recalculateHSV(this);

	        return this.__state[component];

	      },

	      set: function(v) {

	        if (this.__state.space !== 'HSV') {
	          recalculateHSV(this);
	          this.__state.space = 'HSV';
	        }

	        this.__state[component] = v;

	      }

	    });

	  }

	  function recalculateRGB(color, component, componentHexIndex) {

	    if (color.__state.space === 'HEX') {

	      color.__state[component] = math.component_from_hex(color.__state.hex, componentHexIndex);

	    } else if (color.__state.space === 'HSV') {

	      common.extend(color.__state, math.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));

	    } else {

	      throw 'Corrupted color state';

	    }

	  }

	  function recalculateHSV(color) {

	    var result = math.rgb_to_hsv(color.r, color.g, color.b);

	    common.extend(color.__state,
	        {
	          s: result.s,
	          v: result.v
	        }
	    );

	    if (!common.isNaN(result.h)) {
	      color.__state.h = result.h;
	    } else if (common.isUndefined(color.__state.h)) {
	      color.__state.h = 0;
	    }

	  }

	  return Color;

	})(dat.color.interpret = (function (toString, common) {

	  var result, toReturn;

	  var interpret = function() {

	    toReturn = false;

	    var original = arguments.length > 1 ? common.toArray(arguments) : arguments[0];

	    common.each(INTERPRETATIONS, function(family) {

	      if (family.litmus(original)) {

	        common.each(family.conversions, function(conversion, conversionName) {

	          result = conversion.read(original);

	          if (toReturn === false && result !== false) {
	            toReturn = result;
	            result.conversionName = conversionName;
	            result.conversion = conversion;
	            return common.BREAK;

	          }

	        });

	        return common.BREAK;

	      }

	    });

	    return toReturn;

	  };

	  var INTERPRETATIONS = [

	    // Strings
	    {

	      litmus: common.isString,

	      conversions: {

	        THREE_CHAR_HEX: {

	          read: function(original) {

	            var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
	            if (test === null) return false;

	            return {
	              space: 'HEX',
	              hex: parseInt(
	                  '0x' +
	                      test[1].toString() + test[1].toString() +
	                      test[2].toString() + test[2].toString() +
	                      test[3].toString() + test[3].toString())
	            };

	          },

	          write: toString

	        },

	        SIX_CHAR_HEX: {

	          read: function(original) {

	            var test = original.match(/^#([A-F0-9]{6})$/i);
	            if (test === null) return false;

	            return {
	              space: 'HEX',
	              hex: parseInt('0x' + test[1].toString())
	            };

	          },

	          write: toString

	        },

	        CSS_RGB: {

	          read: function(original) {

	            var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
	            if (test === null) return false;

	            return {
	              space: 'RGB',
	              r: parseFloat(test[1]),
	              g: parseFloat(test[2]),
	              b: parseFloat(test[3])
	            };

	          },

	          write: toString

	        },

	        CSS_RGBA: {

	          read: function(original) {

	            var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);
	            if (test === null) return false;

	            return {
	              space: 'RGB',
	              r: parseFloat(test[1]),
	              g: parseFloat(test[2]),
	              b: parseFloat(test[3]),
	              a: parseFloat(test[4])
	            };

	          },

	          write: toString

	        }

	      }

	    },

	    // Numbers
	    {

	      litmus: common.isNumber,

	      conversions: {

	        HEX: {
	          read: function(original) {
	            return {
	              space: 'HEX',
	              hex: original,
	              conversionName: 'HEX'
	            }
	          },

	          write: function(color) {
	            return color.hex;
	          }
	        }

	      }

	    },

	    // Arrays
	    {

	      litmus: common.isArray,

	      conversions: {

	        RGB_ARRAY: {
	          read: function(original) {
	            if (original.length != 3) return false;
	            return {
	              space: 'RGB',
	              r: original[0],
	              g: original[1],
	              b: original[2]
	            };
	          },

	          write: function(color) {
	            return [color.r, color.g, color.b];
	          }

	        },

	        RGBA_ARRAY: {
	          read: function(original) {
	            if (original.length != 4) return false;
	            return {
	              space: 'RGB',
	              r: original[0],
	              g: original[1],
	              b: original[2],
	              a: original[3]
	            };
	          },

	          write: function(color) {
	            return [color.r, color.g, color.b, color.a];
	          }

	        }

	      }

	    },

	    // Objects
	    {

	      litmus: common.isObject,

	      conversions: {

	        RGBA_OBJ: {
	          read: function(original) {
	            if (common.isNumber(original.r) &&
	                common.isNumber(original.g) &&
	                common.isNumber(original.b) &&
	                common.isNumber(original.a)) {
	              return {
	                space: 'RGB',
	                r: original.r,
	                g: original.g,
	                b: original.b,
	                a: original.a
	              }
	            }
	            return false;
	          },

	          write: function(color) {
	            return {
	              r: color.r,
	              g: color.g,
	              b: color.b,
	              a: color.a
	            }
	          }
	        },

	        RGB_OBJ: {
	          read: function(original) {
	            if (common.isNumber(original.r) &&
	                common.isNumber(original.g) &&
	                common.isNumber(original.b)) {
	              return {
	                space: 'RGB',
	                r: original.r,
	                g: original.g,
	                b: original.b
	              }
	            }
	            return false;
	          },

	          write: function(color) {
	            return {
	              r: color.r,
	              g: color.g,
	              b: color.b
	            }
	          }
	        },

	        HSVA_OBJ: {
	          read: function(original) {
	            if (common.isNumber(original.h) &&
	                common.isNumber(original.s) &&
	                common.isNumber(original.v) &&
	                common.isNumber(original.a)) {
	              return {
	                space: 'HSV',
	                h: original.h,
	                s: original.s,
	                v: original.v,
	                a: original.a
	              }
	            }
	            return false;
	          },

	          write: function(color) {
	            return {
	              h: color.h,
	              s: color.s,
	              v: color.v,
	              a: color.a
	            }
	          }
	        },

	        HSV_OBJ: {
	          read: function(original) {
	            if (common.isNumber(original.h) &&
	                common.isNumber(original.s) &&
	                common.isNumber(original.v)) {
	              return {
	                space: 'HSV',
	                h: original.h,
	                s: original.s,
	                v: original.v
	              }
	            }
	            return false;
	          },

	          write: function(color) {
	            return {
	              h: color.h,
	              s: color.s,
	              v: color.v
	            }
	          }

	        }

	      }

	    }


	  ];

	  return interpret;


	})(dat.color.toString,
	dat.utils.common),
	dat.color.math = (function () {

	  var tmpComponent;

	  return {

	    hsv_to_rgb: function(h, s, v) {

	      var hi = Math.floor(h / 60) % 6;

	      var f = h / 60 - Math.floor(h / 60);
	      var p = v * (1.0 - s);
	      var q = v * (1.0 - (f * s));
	      var t = v * (1.0 - ((1.0 - f) * s));
	      var c = [
	        [v, t, p],
	        [q, v, p],
	        [p, v, t],
	        [p, q, v],
	        [t, p, v],
	        [v, p, q]
	      ][hi];

	      return {
	        r: c[0] * 255,
	        g: c[1] * 255,
	        b: c[2] * 255
	      };

	    },

	    rgb_to_hsv: function(r, g, b) {

	      var min = Math.min(r, g, b),
	          max = Math.max(r, g, b),
	          delta = max - min,
	          h, s;

	      if (max != 0) {
	        s = delta / max;
	      } else {
	        return {
	          h: NaN,
	          s: 0,
	          v: 0
	        };
	      }

	      if (r == max) {
	        h = (g - b) / delta;
	      } else if (g == max) {
	        h = 2 + (b - r) / delta;
	      } else {
	        h = 4 + (r - g) / delta;
	      }
	      h /= 6;
	      if (h < 0) {
	        h += 1;
	      }

	      return {
	        h: h * 360,
	        s: s,
	        v: max / 255
	      };
	    },

	    rgb_to_hex: function(r, g, b) {
	      var hex = this.hex_with_component(0, 2, r);
	      hex = this.hex_with_component(hex, 1, g);
	      hex = this.hex_with_component(hex, 0, b);
	      return hex;
	    },

	    component_from_hex: function(hex, componentIndex) {
	      return (hex >> (componentIndex * 8)) & 0xFF;
	    },

	    hex_with_component: function(hex, componentIndex, value) {
	      return value << (tmpComponent = componentIndex * 8) | (hex & ~ (0xFF << tmpComponent));
	    }

	  }

	})(),
	dat.color.toString,
	dat.utils.common);

/***/ },
/* 26 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * Primary geometry reference:
	 * http://www.redblobgames.com/grids/hexagons/#coordinates
	 */

	var PointyTopHexagonShape = function () {
	  function PointyTopHexagonShape() {
	    _classCallCheck(this, PointyTopHexagonShape);
	  }

	  _createClass(PointyTopHexagonShape, [{
	    key: "getTileSize",

	    /** Return tile maximum dimensions, point-to-point, given edge */
	    value: function getTileSize(tileEdge) {
	      return {
	        width: Math.sqrt(3.0) * tileEdge,
	        height: 2.0 * tileEdge
	      };
	    }

	    /** Determine edge length given unit */

	  }, {
	    key: "getTileEdgeFromGridUnit",
	    value: function getTileEdgeFromGridUnit(_ref) {
	      var width = _ref.width;
	      var height = _ref.height;

	      return Math.min(width / Math.sqrt(3.0), height / 3.0 * 2.0);
	    }
	  }, {
	    key: "getTileEdgeFromArea",
	    value: function getTileEdgeFromArea(area) {
	      return Math.sqrt(area * 2 / (Math.sqrt(3) * 3));
	    }
	  }, {
	    key: "getGridUnit",
	    value: function getGridUnit() {
	      return {
	        width: 1.0,
	        height: 0.75
	      };
	    }
	  }, {
	    key: "getUnitOffsetX",
	    value: function getUnitOffsetX(y) {
	      return y % 2 === 0 ? 0 : 1;
	    }
	  }, {
	    key: "getUnitOffsetY",
	    value: function getUnitOffsetY() {
	      return 0.0;
	    }
	  }, {
	    key: "getDrawOffsetX",
	    value: function getDrawOffsetX(y) {
	      return y % 2 === 0 ? 0.5 : 0;
	    }
	  }, {
	    key: "getDrawOffsetY",
	    value: function getDrawOffsetY() {
	      return 0.0;
	    }
	  }, {
	    key: "getPointsAround",
	    value: function getPointsAround(center, tileSize) {
	      return [
	      // upper left
	      [center.x - tileSize.width * 0.5, center.y - tileSize.height * 0.25],
	      // top
	      [center.x, center.y - tileSize.height * 0.5],
	      // upper right
	      [center.x + tileSize.width * 0.5, center.y - tileSize.height * 0.25],
	      // lower right
	      [center.x + tileSize.width * 0.5, center.y + tileSize.height * 0.25],
	      // bottom
	      [center.x, center.y + tileSize.height * 0.5],
	      // lower left
	      [center.x - tileSize.width * 0.5, center.y + tileSize.height * 0.25]];
	    }
	  }]);

	  return PointyTopHexagonShape;
	}();

	exports.default = PointyTopHexagonShape;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _d3Geo = __webpack_require__(28);

	var _pointInPolygon = __webpack_require__(30);

	var _pointInPolygon2 = _interopRequireDefault(_pointInPolygon);

	var _areaPolygon = __webpack_require__(31);

	var _areaPolygon2 = _interopRequireDefault(_areaPolygon);

	var _topogram = __webpack_require__(32);

	var _topogram2 = _interopRequireDefault(_topogram);

	var _Graphic2 = __webpack_require__(19);

	var _Graphic3 = _interopRequireDefault(_Graphic2);

	var _GeographyResource = __webpack_require__(41);

	var _GeographyResource2 = _interopRequireDefault(_GeographyResource);

	var _Exporter = __webpack_require__(53);

	var _Exporter2 = _interopRequireDefault(_Exporter);

	var _utils = __webpack_require__(20);

	var _constants = __webpack_require__(22);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var topogram = (0, _topogram2.default)();

	var MIN_PATH_AREA = 0.5;
	var MAX_ITERATION_COUNT = 20;

	var MapGraphic = function (_Graphic) {
	  _inherits(MapGraphic, _Graphic);

	  function MapGraphic() {
	    _classCallCheck(this, MapGraphic);

	    var _this = _possibleConstructorReturn(this, (MapGraphic.__proto__ || Object.getPrototypeOf(MapGraphic)).call(this));

	    _this._stateFeatures = null;
	    _this._iterationCount = 0;
	    _this._generalBounds = [[Infinity, Infinity], [-Infinity, -Infinity]];
	    _this.getFeatureAtPoint = _this.getFeatureAtPoint.bind(_this);
	    topogram.iterations(1);
	    return _this;
	  }

	  /** Apply topogram on topoJson using data in properties */


	  _createClass(MapGraphic, [{
	    key: 'computeCartogram',
	    value: function computeCartogram(dataset) {
	      topogram.value(function (feature) {
	        return dataset.data.find(function (datum) {
	          return datum[0] === feature.id;
	        })[1];
	      });
	      this._iterationCount = 0;

	      // compute initial cartogram from geography
	      this.updatePreProjection(dataset.geography);

	      // generate basemap for topogram
	      this._baseMap = this._getbaseMapTopoJson(dataset);
	      this._stateFeatures = topogram(this._baseMap.topo, this._baseMap.geometries);
	      this._precomputeBounds();
	    }

	    /**
	     * Returns either the original map topojson and geometries or
	     * a filtered version of the map if the data properties don't match the map.
	     */

	  }, {
	    key: '_getbaseMapTopoJson',
	    value: function _getbaseMapTopoJson(dataset) {
	      var mapResource = _GeographyResource2.default.getMapResource(dataset.geography);
	      var baseMapTopoJson = mapResource.getTopoJson();
	      var filteredTopoJson = null;
	      var filteredGeometries = null;
	      var baseMapLength = baseMapTopoJson.objects[mapResource.getObjectId()].geometries.length;
	      // for custom uploads with incomplete data
	      if (dataset.data.length !== baseMapLength) {
	        (function () {
	          var statesWithData = dataset.data.map(function (datum) {
	            return datum[0];
	          });
	          filteredGeometries = baseMapTopoJson.objects[mapResource.getObjectId()].geometries.filter(function (geom) {
	            return statesWithData.indexOf(geom.id) > -1;
	          });
	          filteredTopoJson = JSON.parse(JSON.stringify(baseMapTopoJson)); // clones the baseMap
	          // only pass filtered geometries to topogram generator
	          filteredTopoJson.objects[mapResource.getObjectId()].geometries = filteredGeometries;
	        })();
	      }
	      return {
	        topo: filteredTopoJson || baseMapTopoJson,
	        geometries: filteredGeometries || mapResource.getGeometries()
	      };
	    }

	    /**
	     * Calculate subsequent cartogram iterations.
	     * Return true if iteration was performed, false if not.
	     */

	  }, {
	    key: 'iterateCartogram',
	    value: function iterateCartogram(geography) {
	      if (this._iterationCount > MAX_ITERATION_COUNT) {
	        return false;
	      }
	      var mapResource = _GeographyResource2.default.getMapResource(geography);
	      topogram.projection(function (x) {
	        return x;
	      });
	      var topoJson = _Exporter2.default.fromGeoJSON(this._stateFeatures, mapResource.getObjectId());
	      this._stateFeatures = topogram(topoJson, topoJson.objects[mapResource.getObjectId()].geometries);
	      this._precomputeBounds();
	      this._iterationCount++;
	      return true;
	    }
	  }, {
	    key: 'resetBounds',
	    value: function resetBounds() {
	      this._generalBounds = [[Infinity, Infinity], [-Infinity, -Infinity]];
	    }

	    /** Apply projection _before_ cartogram computation */

	  }, {
	    key: 'updatePreProjection',
	    value: function updatePreProjection(geography) {
	      // TODO: Smarter map projection
	      var projection = function projection(d) {
	        return d;
	      };
	      var defaultTranslate = [_constants.canvasDimensions.width * 0.5, _constants.canvasDimensions.height * 0.5];
	      if (geography === 'United States') {
	        projection = (0, _d3Geo.geoAlbersUsa)().scale(_constants.canvasDimensions.width).translate(defaultTranslate);
	      } else if (geography === 'World') {
	        projection = (0, _d3Geo.geoMercator)().scale(_constants.canvasDimensions.width / 8).translate([_constants.canvasDimensions.width * 0.5, _constants.canvasDimensions.height * 0.7]);
	      } else if (geography === 'United Kingdom - Constituencies') {
	        projection = (0, _d3Geo.geoMercator)().center([-2, 55.7]).scale(_constants.canvasDimensions.height * 2.9).translate(defaultTranslate);
	      } else if (geography === 'Germany - Constituencies') {
	        projection = (0, _d3Geo.geoMercator)().center([11, 51.2]).scale(_constants.canvasDimensions.height * 3.9).translate(defaultTranslate);
	      } else if (geography === 'France - Regions' || 'France - Departments') {
	        projection = (0, _d3Geo.geoMercator)().center([3.4, 46.3]).scale(_constants.canvasDimensions.height * 3.4).translate(defaultTranslate);
	      }
	      topogram.projection(projection);
	    }

	    /** Pre-compute projected bounding boxes; filter out small-area paths */

	  }, {
	    key: '_precomputeBounds',
	    value: function _precomputeBounds() {
	      var _this2 = this;

	      var pathProjection = (0, _d3Geo.geoPath)();
	      this._generalBounds = [[Infinity, Infinity], [-Infinity, -Infinity]];
	      this._projectedStates = this._stateFeatures.features.map(function (feature) {
	        var hasMultiplePaths = feature.geometry.type === 'MultiPolygon';
	        var bounds = pathProjection.bounds(feature);
	        (0, _utils.updateBounds)(_this2._generalBounds, bounds);
	        var paths = feature.geometry.coordinates.filter(function (path) {
	          return (0, _areaPolygon2.default)(hasMultiplePaths ? path[0] : path) > MIN_PATH_AREA;
	        }).map(function (path) {
	          return [hasMultiplePaths ? path[0] : path];
	        });
	        return { bounds: bounds, paths: paths };
	      });
	    }
	  }, {
	    key: 'render',
	    value: function render(ctx) {
	      this._stateFeatures.features.forEach(function (feature) {
	        ctx.beginPath();
	        var hasMultiplePaths = feature.geometry.coordinates.length > 1;
	        feature.geometry.coordinates.forEach(function (path) {
	          var points = hasMultiplePaths ? path[0] : path;
	          ctx.moveTo(points[0][0], points[0][1]);
	          for (var index = 1; index < points.length; index++) {
	            ctx.lineTo(points[index][0], points[index][1]);
	          }
	        });
	        ctx.closePath();
	        ctx.fillStyle = (0, _utils.fipsColor)(feature.id);
	        ctx.globalAlpha = 0.35;
	        ctx.fill();
	        ctx.globalAlpha = 1.0;
	      });
	    }

	    /** Find feature that contains given point */

	  }, {
	    key: 'getFeatureAtPoint',
	    value: function getFeatureAtPoint(point) {
	      var _this3 = this;

	      var pointDimensions = [point.x, point.y];

	      // check if point is within general bounds of TopoJSON
	      if (!(0, _utils.checkWithinBounds)(pointDimensions, this._generalBounds)) {
	        return null;
	      }

	      // for each feature: check if point is within bounds, then within path
	      return this._stateFeatures.features.find(function (feature, featureIndex) {
	        var bounds = _this3._projectedStates[featureIndex].bounds;
	        if (!(0, _utils.checkWithinBounds)(pointDimensions, bounds || _this3._generalBounds)) {
	          return false;
	        }
	        var matchingPath = _this3._projectedStates[featureIndex].paths.find(function (path) {
	          return (0, _pointInPolygon2.default)(pointDimensions, path[0]);
	        });
	        return matchingPath != null;
	      });
	    }
	  }, {
	    key: 'computeCartogramArea',
	    value: function computeCartogramArea() {
	      var featureAreas = this._stateFeatures.features.map(function (feature) {
	        return (0, _d3Geo.geoPath)().area(feature);
	      });
	      return featureAreas.reduce(function (a, b) {
	        return a + b;
	      });
	    }
	  }]);

	  return MapGraphic;
	}(_Graphic3.default);

	exports.default = MapGraphic;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-geo/ Version 1.2.4. Copyright 2016 Mike Bostock.
	(function (global, factory) {
	   true ? factory(exports, __webpack_require__(29)) :
	  typeof define === 'function' && define.amd ? define(['exports', 'd3-array'], factory) :
	  (factory((global.d3 = global.d3 || {}),global.d3));
	}(this, (function (exports,d3Array) { 'use strict';

	// Adds floating point numbers with twice the normal precision.
	// Reference: J. R. Shewchuk, Adaptive Precision Floating-Point Arithmetic and
	// Fast Robust Geometric Predicates, Discrete & Computational Geometry 18(3)
	// 305–363 (1997).
	// Code adapted from GeographicLib by Charles F. F. Karney,
	// http://geographiclib.sourceforge.net/

	function adder() {
	  return new Adder;
	}

	function Adder() {
	  this.reset();
	}

	Adder.prototype = {
	  constructor: Adder,
	  reset: function() {
	    this.s = // rounded value
	    this.t = 0; // exact error
	  },
	  add: function(y) {
	    add(temp, y, this.t);
	    add(this, temp.s, this.s);
	    if (this.s) this.t += temp.t;
	    else this.s = temp.t;
	  },
	  valueOf: function() {
	    return this.s;
	  }
	};

	var temp = new Adder;

	function add(adder, a, b) {
	  var x = adder.s = a + b,
	      bv = x - a,
	      av = x - bv;
	  adder.t = (a - av) + (b - bv);
	}

	var epsilon = 1e-6;
	var epsilon2 = 1e-12;
	var pi = Math.PI;
	var halfPi = pi / 2;
	var quarterPi = pi / 4;
	var tau = pi * 2;

	var degrees = 180 / pi;
	var radians = pi / 180;

	var abs = Math.abs;
	var atan = Math.atan;
	var atan2 = Math.atan2;
	var cos = Math.cos;
	var ceil = Math.ceil;
	var exp = Math.exp;
	var log = Math.log;
	var pow = Math.pow;
	var sin = Math.sin;
	var sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
	var sqrt = Math.sqrt;
	var tan = Math.tan;

	function acos(x) {
	  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
	}

	function asin(x) {
	  return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
	}

	function haversin(x) {
	  return (x = sin(x / 2)) * x;
	}

	function noop() {}

	function streamGeometry(geometry, stream) {
	  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
	    streamGeometryType[geometry.type](geometry, stream);
	  }
	}

	var streamObjectType = {
	  Feature: function(feature, stream) {
	    streamGeometry(feature.geometry, stream);
	  },
	  FeatureCollection: function(object, stream) {
	    var features = object.features, i = -1, n = features.length;
	    while (++i < n) streamGeometry(features[i].geometry, stream);
	  }
	};

	var streamGeometryType = {
	  Sphere: function(object, stream) {
	    stream.sphere();
	  },
	  Point: function(object, stream) {
	    object = object.coordinates;
	    stream.point(object[0], object[1], object[2]);
	  },
	  MultiPoint: function(object, stream) {
	    var coordinates = object.coordinates, i = -1, n = coordinates.length;
	    while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
	  },
	  LineString: function(object, stream) {
	    streamLine(object.coordinates, stream, 0);
	  },
	  MultiLineString: function(object, stream) {
	    var coordinates = object.coordinates, i = -1, n = coordinates.length;
	    while (++i < n) streamLine(coordinates[i], stream, 0);
	  },
	  Polygon: function(object, stream) {
	    streamPolygon(object.coordinates, stream);
	  },
	  MultiPolygon: function(object, stream) {
	    var coordinates = object.coordinates, i = -1, n = coordinates.length;
	    while (++i < n) streamPolygon(coordinates[i], stream);
	  },
	  GeometryCollection: function(object, stream) {
	    var geometries = object.geometries, i = -1, n = geometries.length;
	    while (++i < n) streamGeometry(geometries[i], stream);
	  }
	};

	function streamLine(coordinates, stream, closed) {
	  var i = -1, n = coordinates.length - closed, coordinate;
	  stream.lineStart();
	  while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
	  stream.lineEnd();
	}

	function streamPolygon(coordinates, stream) {
	  var i = -1, n = coordinates.length;
	  stream.polygonStart();
	  while (++i < n) streamLine(coordinates[i], stream, 1);
	  stream.polygonEnd();
	}

	function geoStream(object, stream) {
	  if (object && streamObjectType.hasOwnProperty(object.type)) {
	    streamObjectType[object.type](object, stream);
	  } else {
	    streamGeometry(object, stream);
	  }
	}

	var areaRingSum = adder();

	var areaSum = adder();
	var lambda00;
	var phi00;
	var lambda0;
	var cosPhi0;
	var sinPhi0;
	var areaStream = {
	  point: noop,
	  lineStart: noop,
	  lineEnd: noop,
	  polygonStart: function() {
	    areaRingSum.reset();
	    areaStream.lineStart = areaRingStart;
	    areaStream.lineEnd = areaRingEnd;
	  },
	  polygonEnd: function() {
	    var areaRing = +areaRingSum;
	    areaSum.add(areaRing < 0 ? tau + areaRing : areaRing);
	    this.lineStart = this.lineEnd = this.point = noop;
	  },
	  sphere: function() {
	    areaSum.add(tau);
	  }
	};

	function areaRingStart() {
	  areaStream.point = areaPointFirst;
	}

	function areaRingEnd() {
	  areaPoint(lambda00, phi00);
	}

	function areaPointFirst(lambda, phi) {
	  areaStream.point = areaPoint;
	  lambda00 = lambda, phi00 = phi;
	  lambda *= radians, phi *= radians;
	  lambda0 = lambda, cosPhi0 = cos(phi = phi / 2 + quarterPi), sinPhi0 = sin(phi);
	}

	function areaPoint(lambda, phi) {
	  lambda *= radians, phi *= radians;
	  phi = phi / 2 + quarterPi; // half the angular distance from south pole

	  // Spherical excess E for a spherical triangle with vertices: south pole,
	  // previous point, current point.  Uses a formula derived from Cagnoli’s
	  // theorem.  See Todhunter, Spherical Trig. (1871), Sec. 103, Eq. (2).
	  var dLambda = lambda - lambda0,
	      sdLambda = dLambda >= 0 ? 1 : -1,
	      adLambda = sdLambda * dLambda,
	      cosPhi = cos(phi),
	      sinPhi = sin(phi),
	      k = sinPhi0 * sinPhi,
	      u = cosPhi0 * cosPhi + k * cos(adLambda),
	      v = k * sdLambda * sin(adLambda);
	  areaRingSum.add(atan2(v, u));

	  // Advance the previous points.
	  lambda0 = lambda, cosPhi0 = cosPhi, sinPhi0 = sinPhi;
	}

	function area(object) {
	  areaSum.reset();
	  geoStream(object, areaStream);
	  return areaSum * 2;
	}

	function spherical(cartesian) {
	  return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
	}

	function cartesian(spherical) {
	  var lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
	  return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
	}

	function cartesianDot(a, b) {
	  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	}

	function cartesianCross(a, b) {
	  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
	}

	// TODO return a
	function cartesianAddInPlace(a, b) {
	  a[0] += b[0], a[1] += b[1], a[2] += b[2];
	}

	function cartesianScale(vector, k) {
	  return [vector[0] * k, vector[1] * k, vector[2] * k];
	}

	// TODO return d
	function cartesianNormalizeInPlace(d) {
	  var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
	  d[0] /= l, d[1] /= l, d[2] /= l;
	}

	var lambda0$1;
	var phi0;
	var lambda1;
	var phi1;
	var lambda2;
	var lambda00$1;
	var phi00$1;
	var p0;
	var deltaSum = adder();
	var ranges;
	var range$1;
	var boundsStream = {
	  point: boundsPoint,
	  lineStart: boundsLineStart,
	  lineEnd: boundsLineEnd,
	  polygonStart: function() {
	    boundsStream.point = boundsRingPoint;
	    boundsStream.lineStart = boundsRingStart;
	    boundsStream.lineEnd = boundsRingEnd;
	    deltaSum.reset();
	    areaStream.polygonStart();
	  },
	  polygonEnd: function() {
	    areaStream.polygonEnd();
	    boundsStream.point = boundsPoint;
	    boundsStream.lineStart = boundsLineStart;
	    boundsStream.lineEnd = boundsLineEnd;
	    if (areaRingSum < 0) lambda0$1 = -(lambda1 = 180), phi0 = -(phi1 = 90);
	    else if (deltaSum > epsilon) phi1 = 90;
	    else if (deltaSum < -epsilon) phi0 = -90;
	    range$1[0] = lambda0$1, range$1[1] = lambda1;
	  }
	};

	function boundsPoint(lambda, phi) {
	  ranges.push(range$1 = [lambda0$1 = lambda, lambda1 = lambda]);
	  if (phi < phi0) phi0 = phi;
	  if (phi > phi1) phi1 = phi;
	}

	function linePoint(lambda, phi) {
	  var p = cartesian([lambda * radians, phi * radians]);
	  if (p0) {
	    var normal = cartesianCross(p0, p),
	        equatorial = [normal[1], -normal[0], 0],
	        inflection = cartesianCross(equatorial, normal);
	    cartesianNormalizeInPlace(inflection);
	    inflection = spherical(inflection);
	    var delta = lambda - lambda2,
	        sign = delta > 0 ? 1 : -1,
	        lambdai = inflection[0] * degrees * sign,
	        phii,
	        antimeridian = abs(delta) > 180;
	    if (antimeridian ^ (sign * lambda2 < lambdai && lambdai < sign * lambda)) {
	      phii = inflection[1] * degrees;
	      if (phii > phi1) phi1 = phii;
	    } else if (lambdai = (lambdai + 360) % 360 - 180, antimeridian ^ (sign * lambda2 < lambdai && lambdai < sign * lambda)) {
	      phii = -inflection[1] * degrees;
	      if (phii < phi0) phi0 = phii;
	    } else {
	      if (phi < phi0) phi0 = phi;
	      if (phi > phi1) phi1 = phi;
	    }
	    if (antimeridian) {
	      if (lambda < lambda2) {
	        if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
	      } else {
	        if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
	      }
	    } else {
	      if (lambda1 >= lambda0$1) {
	        if (lambda < lambda0$1) lambda0$1 = lambda;
	        if (lambda > lambda1) lambda1 = lambda;
	      } else {
	        if (lambda > lambda2) {
	          if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
	        } else {
	          if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
	        }
	      }
	    }
	  } else {
	    boundsPoint(lambda, phi);
	  }
	  p0 = p, lambda2 = lambda;
	}

	function boundsLineStart() {
	  boundsStream.point = linePoint;
	}

	function boundsLineEnd() {
	  range$1[0] = lambda0$1, range$1[1] = lambda1;
	  boundsStream.point = boundsPoint;
	  p0 = null;
	}

	function boundsRingPoint(lambda, phi) {
	  if (p0) {
	    var delta = lambda - lambda2;
	    deltaSum.add(abs(delta) > 180 ? delta + (delta > 0 ? 360 : -360) : delta);
	  } else {
	    lambda00$1 = lambda, phi00$1 = phi;
	  }
	  areaStream.point(lambda, phi);
	  linePoint(lambda, phi);
	}

	function boundsRingStart() {
	  areaStream.lineStart();
	}

	function boundsRingEnd() {
	  boundsRingPoint(lambda00$1, phi00$1);
	  areaStream.lineEnd();
	  if (abs(deltaSum) > epsilon) lambda0$1 = -(lambda1 = 180);
	  range$1[0] = lambda0$1, range$1[1] = lambda1;
	  p0 = null;
	}

	// Finds the left-right distance between two longitudes.
	// This is almost the same as (lambda1 - lambda0 + 360°) % 360°, except that we want
	// the distance between ±180° to be 360°.
	function angle(lambda0, lambda1) {
	  return (lambda1 -= lambda0) < 0 ? lambda1 + 360 : lambda1;
	}

	function rangeCompare(a, b) {
	  return a[0] - b[0];
	}

	function rangeContains(range, x) {
	  return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
	}

	function bounds(feature) {
	  var i, n, a, b, merged, deltaMax, delta;

	  phi1 = lambda1 = -(lambda0$1 = phi0 = Infinity);
	  ranges = [];
	  geoStream(feature, boundsStream);

	  // First, sort ranges by their minimum longitudes.
	  if (n = ranges.length) {
	    ranges.sort(rangeCompare);

	    // Then, merge any ranges that overlap.
	    for (i = 1, a = ranges[0], merged = [a]; i < n; ++i) {
	      b = ranges[i];
	      if (rangeContains(a, b[0]) || rangeContains(a, b[1])) {
	        if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
	        if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
	      } else {
	        merged.push(a = b);
	      }
	    }

	    // Finally, find the largest gap between the merged ranges.
	    // The final bounding box will be the inverse of this gap.
	    for (deltaMax = -Infinity, n = merged.length - 1, i = 0, a = merged[n]; i <= n; a = b, ++i) {
	      b = merged[i];
	      if ((delta = angle(a[1], b[0])) > deltaMax) deltaMax = delta, lambda0$1 = b[0], lambda1 = a[1];
	    }
	  }

	  ranges = range$1 = null;

	  return lambda0$1 === Infinity || phi0 === Infinity
	      ? [[NaN, NaN], [NaN, NaN]]
	      : [[lambda0$1, phi0], [lambda1, phi1]];
	}

	var W0;
	var W1;
	var X0;
	var Y0;
	var Z0;
	var X1;
	var Y1;
	var Z1;
	var X2;
	var Y2;
	var Z2;
	var lambda00$2;
	var phi00$2;
	var x0;
	var y0;
	var z0;
	// previous point

	var centroidStream = {
	  sphere: noop,
	  point: centroidPoint,
	  lineStart: centroidLineStart,
	  lineEnd: centroidLineEnd,
	  polygonStart: function() {
	    centroidStream.lineStart = centroidRingStart;
	    centroidStream.lineEnd = centroidRingEnd;
	  },
	  polygonEnd: function() {
	    centroidStream.lineStart = centroidLineStart;
	    centroidStream.lineEnd = centroidLineEnd;
	  }
	};

	// Arithmetic mean of Cartesian vectors.
	function centroidPoint(lambda, phi) {
	  lambda *= radians, phi *= radians;
	  var cosPhi = cos(phi);
	  centroidPointCartesian(cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi));
	}

	function centroidPointCartesian(x, y, z) {
	  ++W0;
	  X0 += (x - X0) / W0;
	  Y0 += (y - Y0) / W0;
	  Z0 += (z - Z0) / W0;
	}

	function centroidLineStart() {
	  centroidStream.point = centroidLinePointFirst;
	}

	function centroidLinePointFirst(lambda, phi) {
	  lambda *= radians, phi *= radians;
	  var cosPhi = cos(phi);
	  x0 = cosPhi * cos(lambda);
	  y0 = cosPhi * sin(lambda);
	  z0 = sin(phi);
	  centroidStream.point = centroidLinePoint;
	  centroidPointCartesian(x0, y0, z0);
	}

	function centroidLinePoint(lambda, phi) {
	  lambda *= radians, phi *= radians;
	  var cosPhi = cos(phi),
	      x = cosPhi * cos(lambda),
	      y = cosPhi * sin(lambda),
	      z = sin(phi),
	      w = atan2(sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
	  W1 += w;
	  X1 += w * (x0 + (x0 = x));
	  Y1 += w * (y0 + (y0 = y));
	  Z1 += w * (z0 + (z0 = z));
	  centroidPointCartesian(x0, y0, z0);
	}

	function centroidLineEnd() {
	  centroidStream.point = centroidPoint;
	}

	// See J. E. Brock, The Inertia Tensor for a Spherical Triangle,
	// J. Applied Mechanics 42, 239 (1975).
	function centroidRingStart() {
	  centroidStream.point = centroidRingPointFirst;
	}

	function centroidRingEnd() {
	  centroidRingPoint(lambda00$2, phi00$2);
	  centroidStream.point = centroidPoint;
	}

	function centroidRingPointFirst(lambda, phi) {
	  lambda00$2 = lambda, phi00$2 = phi;
	  lambda *= radians, phi *= radians;
	  centroidStream.point = centroidRingPoint;
	  var cosPhi = cos(phi);
	  x0 = cosPhi * cos(lambda);
	  y0 = cosPhi * sin(lambda);
	  z0 = sin(phi);
	  centroidPointCartesian(x0, y0, z0);
	}

	function centroidRingPoint(lambda, phi) {
	  lambda *= radians, phi *= radians;
	  var cosPhi = cos(phi),
	      x = cosPhi * cos(lambda),
	      y = cosPhi * sin(lambda),
	      z = sin(phi),
	      cx = y0 * z - z0 * y,
	      cy = z0 * x - x0 * z,
	      cz = x0 * y - y0 * x,
	      m = sqrt(cx * cx + cy * cy + cz * cz),
	      u = x0 * x + y0 * y + z0 * z,
	      v = m && -acos(u) / m, // area weight
	      w = atan2(m, u); // line weight
	  X2 += v * cx;
	  Y2 += v * cy;
	  Z2 += v * cz;
	  W1 += w;
	  X1 += w * (x0 + (x0 = x));
	  Y1 += w * (y0 + (y0 = y));
	  Z1 += w * (z0 + (z0 = z));
	  centroidPointCartesian(x0, y0, z0);
	}

	function centroid(object) {
	  W0 = W1 =
	  X0 = Y0 = Z0 =
	  X1 = Y1 = Z1 =
	  X2 = Y2 = Z2 = 0;
	  geoStream(object, centroidStream);

	  var x = X2,
	      y = Y2,
	      z = Z2,
	      m = x * x + y * y + z * z;

	  // If the area-weighted ccentroid is undefined, fall back to length-weighted ccentroid.
	  if (m < epsilon2) {
	    x = X1, y = Y1, z = Z1;
	    // If the feature has zero length, fall back to arithmetic mean of point vectors.
	    if (W1 < epsilon) x = X0, y = Y0, z = Z0;
	    m = x * x + y * y + z * z;
	    // If the feature still has an undefined ccentroid, then return.
	    if (m < epsilon2) return [NaN, NaN];
	  }

	  return [atan2(y, x) * degrees, asin(z / sqrt(m)) * degrees];
	}

	function constant(x) {
	  return function() {
	    return x;
	  };
	}

	function compose(a, b) {

	  function compose(x, y) {
	    return x = a(x, y), b(x[0], x[1]);
	  }

	  if (a.invert && b.invert) compose.invert = function(x, y) {
	    return x = b.invert(x, y), x && a.invert(x[0], x[1]);
	  };

	  return compose;
	}

	function rotationIdentity(lambda, phi) {
	  return [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
	}

	rotationIdentity.invert = rotationIdentity;

	function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
	  return (deltaLambda %= tau) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
	    : rotationLambda(deltaLambda))
	    : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
	    : rotationIdentity);
	}

	function forwardRotationLambda(deltaLambda) {
	  return function(lambda, phi) {
	    return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
	  };
	}

	function rotationLambda(deltaLambda) {
	  var rotation = forwardRotationLambda(deltaLambda);
	  rotation.invert = forwardRotationLambda(-deltaLambda);
	  return rotation;
	}

	function rotationPhiGamma(deltaPhi, deltaGamma) {
	  var cosDeltaPhi = cos(deltaPhi),
	      sinDeltaPhi = sin(deltaPhi),
	      cosDeltaGamma = cos(deltaGamma),
	      sinDeltaGamma = sin(deltaGamma);

	  function rotation(lambda, phi) {
	    var cosPhi = cos(phi),
	        x = cos(lambda) * cosPhi,
	        y = sin(lambda) * cosPhi,
	        z = sin(phi),
	        k = z * cosDeltaPhi + x * sinDeltaPhi;
	    return [
	      atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
	      asin(k * cosDeltaGamma + y * sinDeltaGamma)
	    ];
	  }

	  rotation.invert = function(lambda, phi) {
	    var cosPhi = cos(phi),
	        x = cos(lambda) * cosPhi,
	        y = sin(lambda) * cosPhi,
	        z = sin(phi),
	        k = z * cosDeltaGamma - y * sinDeltaGamma;
	    return [
	      atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
	      asin(k * cosDeltaPhi - x * sinDeltaPhi)
	    ];
	  };

	  return rotation;
	}

	function rotation(rotate) {
	  rotate = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);

	  function forward(coordinates) {
	    coordinates = rotate(coordinates[0] * radians, coordinates[1] * radians);
	    return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
	  }

	  forward.invert = function(coordinates) {
	    coordinates = rotate.invert(coordinates[0] * radians, coordinates[1] * radians);
	    return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
	  };

	  return forward;
	}

	// Generates a circle centered at [0°, 0°], with a given radius and precision.
	function circleStream(stream, radius, delta, direction, t0, t1) {
	  if (!delta) return;
	  var cosRadius = cos(radius),
	      sinRadius = sin(radius),
	      step = direction * delta;
	  if (t0 == null) {
	    t0 = radius + direction * tau;
	    t1 = radius - step / 2;
	  } else {
	    t0 = circleRadius(cosRadius, t0);
	    t1 = circleRadius(cosRadius, t1);
	    if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
	  }
	  for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
	    point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
	    stream.point(point[0], point[1]);
	  }
	}

	// Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
	function circleRadius(cosRadius, point) {
	  point = cartesian(point), point[0] -= cosRadius;
	  cartesianNormalizeInPlace(point);
	  var radius = acos(-point[1]);
	  return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
	}

	function circle() {
	  var center = constant([0, 0]),
	      radius = constant(90),
	      precision = constant(6),
	      ring,
	      rotate,
	      stream = {point: point};

	  function point(x, y) {
	    ring.push(x = rotate(x, y));
	    x[0] *= degrees, x[1] *= degrees;
	  }

	  function circle() {
	    var c = center.apply(this, arguments),
	        r = radius.apply(this, arguments) * radians,
	        p = precision.apply(this, arguments) * radians;
	    ring = [];
	    rotate = rotateRadians(-c[0] * radians, -c[1] * radians, 0).invert;
	    circleStream(stream, r, p, 1);
	    c = {type: "Polygon", coordinates: [ring]};
	    ring = rotate = null;
	    return c;
	  }

	  circle.center = function(_) {
	    return arguments.length ? (center = typeof _ === "function" ? _ : constant([+_[0], +_[1]]), circle) : center;
	  };

	  circle.radius = function(_) {
	    return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), circle) : radius;
	  };

	  circle.precision = function(_) {
	    return arguments.length ? (precision = typeof _ === "function" ? _ : constant(+_), circle) : precision;
	  };

	  return circle;
	}

	function clipBuffer() {
	  var lines = [],
	      line;
	  return {
	    point: function(x, y) {
	      line.push([x, y]);
	    },
	    lineStart: function() {
	      lines.push(line = []);
	    },
	    lineEnd: noop,
	    rejoin: function() {
	      if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
	    },
	    result: function() {
	      var result = lines;
	      lines = [];
	      line = null;
	      return result;
	    }
	  };
	}

	function clipLine(a, b, x0, y0, x1, y1) {
	  var ax = a[0],
	      ay = a[1],
	      bx = b[0],
	      by = b[1],
	      t0 = 0,
	      t1 = 1,
	      dx = bx - ax,
	      dy = by - ay,
	      r;

	  r = x0 - ax;
	  if (!dx && r > 0) return;
	  r /= dx;
	  if (dx < 0) {
	    if (r < t0) return;
	    if (r < t1) t1 = r;
	  } else if (dx > 0) {
	    if (r > t1) return;
	    if (r > t0) t0 = r;
	  }

	  r = x1 - ax;
	  if (!dx && r < 0) return;
	  r /= dx;
	  if (dx < 0) {
	    if (r > t1) return;
	    if (r > t0) t0 = r;
	  } else if (dx > 0) {
	    if (r < t0) return;
	    if (r < t1) t1 = r;
	  }

	  r = y0 - ay;
	  if (!dy && r > 0) return;
	  r /= dy;
	  if (dy < 0) {
	    if (r < t0) return;
	    if (r < t1) t1 = r;
	  } else if (dy > 0) {
	    if (r > t1) return;
	    if (r > t0) t0 = r;
	  }

	  r = y1 - ay;
	  if (!dy && r < 0) return;
	  r /= dy;
	  if (dy < 0) {
	    if (r > t1) return;
	    if (r > t0) t0 = r;
	  } else if (dy > 0) {
	    if (r < t0) return;
	    if (r < t1) t1 = r;
	  }

	  if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
	  if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
	  return true;
	}

	function pointEqual(a, b) {
	  return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
	}

	function Intersection(point, points, other, entry) {
	  this.x = point;
	  this.z = points;
	  this.o = other; // another intersection
	  this.e = entry; // is an entry?
	  this.v = false; // visited
	  this.n = this.p = null; // next & previous
	}

	// A generalized polygon clipping algorithm: given a polygon that has been cut
	// into its visible line segments, and rejoins the segments by interpolating
	// along the clip edge.
	function clipPolygon(segments, compareIntersection, startInside, interpolate, stream) {
	  var subject = [],
	      clip = [],
	      i,
	      n;

	  segments.forEach(function(segment) {
	    if ((n = segment.length - 1) <= 0) return;
	    var n, p0 = segment[0], p1 = segment[n], x;

	    // If the first and last points of a segment are coincident, then treat as a
	    // closed ring. TODO if all rings are closed, then the winding order of the
	    // exterior ring should be checked.
	    if (pointEqual(p0, p1)) {
	      stream.lineStart();
	      for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
	      stream.lineEnd();
	      return;
	    }

	    subject.push(x = new Intersection(p0, segment, null, true));
	    clip.push(x.o = new Intersection(p0, null, x, false));
	    subject.push(x = new Intersection(p1, segment, null, false));
	    clip.push(x.o = new Intersection(p1, null, x, true));
	  });

	  if (!subject.length) return;

	  clip.sort(compareIntersection);
	  link(subject);
	  link(clip);

	  for (i = 0, n = clip.length; i < n; ++i) {
	    clip[i].e = startInside = !startInside;
	  }

	  var start = subject[0],
	      points,
	      point;

	  while (1) {
	    // Find first unvisited intersection.
	    var current = start,
	        isSubject = true;
	    while (current.v) if ((current = current.n) === start) return;
	    points = current.z;
	    stream.lineStart();
	    do {
	      current.v = current.o.v = true;
	      if (current.e) {
	        if (isSubject) {
	          for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
	        } else {
	          interpolate(current.x, current.n.x, 1, stream);
	        }
	        current = current.n;
	      } else {
	        if (isSubject) {
	          points = current.p.z;
	          for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
	        } else {
	          interpolate(current.x, current.p.x, -1, stream);
	        }
	        current = current.p;
	      }
	      current = current.o;
	      points = current.z;
	      isSubject = !isSubject;
	    } while (!current.v);
	    stream.lineEnd();
	  }
	}

	function link(array) {
	  if (!(n = array.length)) return;
	  var n,
	      i = 0,
	      a = array[0],
	      b;
	  while (++i < n) {
	    a.n = b = array[i];
	    b.p = a;
	    a = b;
	  }
	  a.n = b = array[0];
	  b.p = a;
	}

	var clipMax = 1e9;
	var clipMin = -clipMax;
	// TODO Use d3-polygon’s polygonContains here for the ring check?
	// TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

	function clipExtent(x0, y0, x1, y1) {

	  function visible(x, y) {
	    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
	  }

	  function interpolate(from, to, direction, stream) {
	    var a = 0, a1 = 0;
	    if (from == null
	        || (a = corner(from, direction)) !== (a1 = corner(to, direction))
	        || comparePoint(from, to) < 0 ^ direction > 0) {
	      do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
	      while ((a = (a + direction + 4) % 4) !== a1);
	    } else {
	      stream.point(to[0], to[1]);
	    }
	  }

	  function corner(p, direction) {
	    return abs(p[0] - x0) < epsilon ? direction > 0 ? 0 : 3
	        : abs(p[0] - x1) < epsilon ? direction > 0 ? 2 : 1
	        : abs(p[1] - y0) < epsilon ? direction > 0 ? 1 : 0
	        : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
	  }

	  function compareIntersection(a, b) {
	    return comparePoint(a.x, b.x);
	  }

	  function comparePoint(a, b) {
	    var ca = corner(a, 1),
	        cb = corner(b, 1);
	    return ca !== cb ? ca - cb
	        : ca === 0 ? b[1] - a[1]
	        : ca === 1 ? a[0] - b[0]
	        : ca === 2 ? a[1] - b[1]
	        : b[0] - a[0];
	  }

	  return function(stream) {
	    var activeStream = stream,
	        bufferStream = clipBuffer(),
	        segments,
	        polygon,
	        ring,
	        x__, y__, v__, // first point
	        x_, y_, v_, // previous point
	        first,
	        clean;

	    var clipStream = {
	      point: point,
	      lineStart: lineStart,
	      lineEnd: lineEnd,
	      polygonStart: polygonStart,
	      polygonEnd: polygonEnd
	    };

	    function point(x, y) {
	      if (visible(x, y)) activeStream.point(x, y);
	    }

	    function polygonInside() {
	      var winding = 0;

	      for (var i = 0, n = polygon.length; i < n; ++i) {
	        for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
	          a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
	          if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding; }
	          else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding; }
	        }
	      }

	      return winding;
	    }

	    // Buffer geometry within a polygon and then clip it en masse.
	    function polygonStart() {
	      activeStream = bufferStream, segments = [], polygon = [], clean = true;
	    }

	    function polygonEnd() {
	      var startInside = polygonInside(),
	          cleanInside = clean && startInside,
	          visible = (segments = d3Array.merge(segments)).length;
	      if (cleanInside || visible) {
	        stream.polygonStart();
	        if (cleanInside) {
	          stream.lineStart();
	          interpolate(null, null, 1, stream);
	          stream.lineEnd();
	        }
	        if (visible) {
	          clipPolygon(segments, compareIntersection, startInside, interpolate, stream);
	        }
	        stream.polygonEnd();
	      }
	      activeStream = stream, segments = polygon = ring = null;
	    }

	    function lineStart() {
	      clipStream.point = linePoint;
	      if (polygon) polygon.push(ring = []);
	      first = true;
	      v_ = false;
	      x_ = y_ = NaN;
	    }

	    // TODO rather than special-case polygons, simply handle them separately.
	    // Ideally, coincident intersection points should be jittered to avoid
	    // clipping issues.
	    function lineEnd() {
	      if (segments) {
	        linePoint(x__, y__);
	        if (v__ && v_) bufferStream.rejoin();
	        segments.push(bufferStream.result());
	      }
	      clipStream.point = point;
	      if (v_) activeStream.lineEnd();
	    }

	    function linePoint(x, y) {
	      var v = visible(x, y);
	      if (polygon) ring.push([x, y]);
	      if (first) {
	        x__ = x, y__ = y, v__ = v;
	        first = false;
	        if (v) {
	          activeStream.lineStart();
	          activeStream.point(x, y);
	        }
	      } else {
	        if (v && v_) activeStream.point(x, y);
	        else {
	          var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
	              b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
	          if (clipLine(a, b, x0, y0, x1, y1)) {
	            if (!v_) {
	              activeStream.lineStart();
	              activeStream.point(a[0], a[1]);
	            }
	            activeStream.point(b[0], b[1]);
	            if (!v) activeStream.lineEnd();
	            clean = false;
	          } else if (v) {
	            activeStream.lineStart();
	            activeStream.point(x, y);
	            clean = false;
	          }
	        }
	      }
	      x_ = x, y_ = y, v_ = v;
	    }

	    return clipStream;
	  };
	}

	function extent() {
	  var x0 = 0,
	      y0 = 0,
	      x1 = 960,
	      y1 = 500,
	      cache,
	      cacheStream,
	      clip;

	  return clip = {
	    stream: function(stream) {
	      return cache && cacheStream === stream ? cache : cache = clipExtent(x0, y0, x1, y1)(cacheStream = stream);
	    },
	    extent: function(_) {
	      return arguments.length ? (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1], cache = cacheStream = null, clip) : [[x0, y0], [x1, y1]];
	    }
	  };
	}

	var lengthSum = adder();
	var lambda0$2;
	var sinPhi0$1;
	var cosPhi0$1;
	var lengthStream = {
	  sphere: noop,
	  point: noop,
	  lineStart: lengthLineStart,
	  lineEnd: noop,
	  polygonStart: noop,
	  polygonEnd: noop
	};

	function lengthLineStart() {
	  lengthStream.point = lengthPointFirst;
	  lengthStream.lineEnd = lengthLineEnd;
	}

	function lengthLineEnd() {
	  lengthStream.point = lengthStream.lineEnd = noop;
	}

	function lengthPointFirst(lambda, phi) {
	  lambda *= radians, phi *= radians;
	  lambda0$2 = lambda, sinPhi0$1 = sin(phi), cosPhi0$1 = cos(phi);
	  lengthStream.point = lengthPoint;
	}

	function lengthPoint(lambda, phi) {
	  lambda *= radians, phi *= radians;
	  var sinPhi = sin(phi),
	      cosPhi = cos(phi),
	      delta = abs(lambda - lambda0$2),
	      cosDelta = cos(delta),
	      sinDelta = sin(delta),
	      x = cosPhi * sinDelta,
	      y = cosPhi0$1 * sinPhi - sinPhi0$1 * cosPhi * cosDelta,
	      z = sinPhi0$1 * sinPhi + cosPhi0$1 * cosPhi * cosDelta;
	  lengthSum.add(atan2(sqrt(x * x + y * y), z));
	  lambda0$2 = lambda, sinPhi0$1 = sinPhi, cosPhi0$1 = cosPhi;
	}

	function length(object) {
	  lengthSum.reset();
	  geoStream(object, lengthStream);
	  return +lengthSum;
	}

	var coordinates = [null, null];
	var object = {type: "LineString", coordinates: coordinates};
	function distance(a, b) {
	  coordinates[0] = a;
	  coordinates[1] = b;
	  return length(object);
	}

	function graticuleX(y0, y1, dy) {
	  var y = d3Array.range(y0, y1 - epsilon, dy).concat(y1);
	  return function(x) { return y.map(function(y) { return [x, y]; }); };
	}

	function graticuleY(x0, x1, dx) {
	  var x = d3Array.range(x0, x1 - epsilon, dx).concat(x1);
	  return function(y) { return x.map(function(x) { return [x, y]; }); };
	}

	function graticule() {
	  var x1, x0, X1, X0,
	      y1, y0, Y1, Y0,
	      dx = 10, dy = dx, DX = 90, DY = 360,
	      x, y, X, Y,
	      precision = 2.5;

	  function graticule() {
	    return {type: "MultiLineString", coordinates: lines()};
	  }

	  function lines() {
	    return d3Array.range(ceil(X0 / DX) * DX, X1, DX).map(X)
	        .concat(d3Array.range(ceil(Y0 / DY) * DY, Y1, DY).map(Y))
	        .concat(d3Array.range(ceil(x0 / dx) * dx, x1, dx).filter(function(x) { return abs(x % DX) > epsilon; }).map(x))
	        .concat(d3Array.range(ceil(y0 / dy) * dy, y1, dy).filter(function(y) { return abs(y % DY) > epsilon; }).map(y));
	  }

	  graticule.lines = function() {
	    return lines().map(function(coordinates) { return {type: "LineString", coordinates: coordinates}; });
	  };

	  graticule.outline = function() {
	    return {
	      type: "Polygon",
	      coordinates: [
	        X(X0).concat(
	        Y(Y1).slice(1),
	        X(X1).reverse().slice(1),
	        Y(Y0).reverse().slice(1))
	      ]
	    };
	  };

	  graticule.extent = function(_) {
	    if (!arguments.length) return graticule.extentMinor();
	    return graticule.extentMajor(_).extentMinor(_);
	  };

	  graticule.extentMajor = function(_) {
	    if (!arguments.length) return [[X0, Y0], [X1, Y1]];
	    X0 = +_[0][0], X1 = +_[1][0];
	    Y0 = +_[0][1], Y1 = +_[1][1];
	    if (X0 > X1) _ = X0, X0 = X1, X1 = _;
	    if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
	    return graticule.precision(precision);
	  };

	  graticule.extentMinor = function(_) {
	    if (!arguments.length) return [[x0, y0], [x1, y1]];
	    x0 = +_[0][0], x1 = +_[1][0];
	    y0 = +_[0][1], y1 = +_[1][1];
	    if (x0 > x1) _ = x0, x0 = x1, x1 = _;
	    if (y0 > y1) _ = y0, y0 = y1, y1 = _;
	    return graticule.precision(precision);
	  };

	  graticule.step = function(_) {
	    if (!arguments.length) return graticule.stepMinor();
	    return graticule.stepMajor(_).stepMinor(_);
	  };

	  graticule.stepMajor = function(_) {
	    if (!arguments.length) return [DX, DY];
	    DX = +_[0], DY = +_[1];
	    return graticule;
	  };

	  graticule.stepMinor = function(_) {
	    if (!arguments.length) return [dx, dy];
	    dx = +_[0], dy = +_[1];
	    return graticule;
	  };

	  graticule.precision = function(_) {
	    if (!arguments.length) return precision;
	    precision = +_;
	    x = graticuleX(y0, y1, 90);
	    y = graticuleY(x0, x1, precision);
	    X = graticuleX(Y0, Y1, 90);
	    Y = graticuleY(X0, X1, precision);
	    return graticule;
	  };

	  return graticule
	      .extentMajor([[-180, -90 + epsilon], [180, 90 - epsilon]])
	      .extentMinor([[-180, -80 - epsilon], [180, 80 + epsilon]]);
	}

	function interpolate(a, b) {
	  var x0 = a[0] * radians,
	      y0 = a[1] * radians,
	      x1 = b[0] * radians,
	      y1 = b[1] * radians,
	      cy0 = cos(y0),
	      sy0 = sin(y0),
	      cy1 = cos(y1),
	      sy1 = sin(y1),
	      kx0 = cy0 * cos(x0),
	      ky0 = cy0 * sin(x0),
	      kx1 = cy1 * cos(x1),
	      ky1 = cy1 * sin(x1),
	      d = 2 * asin(sqrt(haversin(y1 - y0) + cy0 * cy1 * haversin(x1 - x0))),
	      k = sin(d);

	  var interpolate = d ? function(t) {
	    var B = sin(t *= d) / k,
	        A = sin(d - t) / k,
	        x = A * kx0 + B * kx1,
	        y = A * ky0 + B * ky1,
	        z = A * sy0 + B * sy1;
	    return [
	      atan2(y, x) * degrees,
	      atan2(z, sqrt(x * x + y * y)) * degrees
	    ];
	  } : function() {
	    return [x0 * degrees, y0 * degrees];
	  };

	  interpolate.distance = d;

	  return interpolate;
	}

	function identity(x) {
	  return x;
	}

	var areaSum$1 = adder();
	var areaRingSum$1 = adder();
	var x00;
	var y00;
	var x0$1;
	var y0$1;
	var areaStream$1 = {
	  point: noop,
	  lineStart: noop,
	  lineEnd: noop,
	  polygonStart: function() {
	    areaStream$1.lineStart = areaRingStart$1;
	    areaStream$1.lineEnd = areaRingEnd$1;
	  },
	  polygonEnd: function() {
	    areaStream$1.lineStart = areaStream$1.lineEnd = areaStream$1.point = noop;
	    areaSum$1.add(abs(areaRingSum$1));
	    areaRingSum$1.reset();
	  },
	  result: function() {
	    var area = areaSum$1 / 2;
	    areaSum$1.reset();
	    return area;
	  }
	};

	function areaRingStart$1() {
	  areaStream$1.point = areaPointFirst$1;
	}

	function areaPointFirst$1(x, y) {
	  areaStream$1.point = areaPoint$1;
	  x00 = x0$1 = x, y00 = y0$1 = y;
	}

	function areaPoint$1(x, y) {
	  areaRingSum$1.add(y0$1 * x - x0$1 * y);
	  x0$1 = x, y0$1 = y;
	}

	function areaRingEnd$1() {
	  areaPoint$1(x00, y00);
	}

	var x0$2 = Infinity;
	var y0$2 = x0$2;
	var x1 = -x0$2;
	var y1 = x1;
	var boundsStream$1 = {
	  point: boundsPoint$1,
	  lineStart: noop,
	  lineEnd: noop,
	  polygonStart: noop,
	  polygonEnd: noop,
	  result: function() {
	    var bounds = [[x0$2, y0$2], [x1, y1]];
	    x1 = y1 = -(y0$2 = x0$2 = Infinity);
	    return bounds;
	  }
	};

	function boundsPoint$1(x, y) {
	  if (x < x0$2) x0$2 = x;
	  if (x > x1) x1 = x;
	  if (y < y0$2) y0$2 = y;
	  if (y > y1) y1 = y;
	}

	var X0$1 = 0;
	var Y0$1 = 0;
	var Z0$1 = 0;
	var X1$1 = 0;
	var Y1$1 = 0;
	var Z1$1 = 0;
	var X2$1 = 0;
	var Y2$1 = 0;
	var Z2$1 = 0;
	var x00$1;
	var y00$1;
	var x0$3;
	var y0$3;
	var centroidStream$1 = {
	  point: centroidPoint$1,
	  lineStart: centroidLineStart$1,
	  lineEnd: centroidLineEnd$1,
	  polygonStart: function() {
	    centroidStream$1.lineStart = centroidRingStart$1;
	    centroidStream$1.lineEnd = centroidRingEnd$1;
	  },
	  polygonEnd: function() {
	    centroidStream$1.point = centroidPoint$1;
	    centroidStream$1.lineStart = centroidLineStart$1;
	    centroidStream$1.lineEnd = centroidLineEnd$1;
	  },
	  result: function() {
	    var centroid = Z2$1 ? [X2$1 / Z2$1, Y2$1 / Z2$1]
	        : Z1$1 ? [X1$1 / Z1$1, Y1$1 / Z1$1]
	        : Z0$1 ? [X0$1 / Z0$1, Y0$1 / Z0$1]
	        : [NaN, NaN];
	    X0$1 = Y0$1 = Z0$1 =
	    X1$1 = Y1$1 = Z1$1 =
	    X2$1 = Y2$1 = Z2$1 = 0;
	    return centroid;
	  }
	};

	function centroidPoint$1(x, y) {
	  X0$1 += x;
	  Y0$1 += y;
	  ++Z0$1;
	}

	function centroidLineStart$1() {
	  centroidStream$1.point = centroidPointFirstLine;
	}

	function centroidPointFirstLine(x, y) {
	  centroidStream$1.point = centroidPointLine;
	  centroidPoint$1(x0$3 = x, y0$3 = y);
	}

	function centroidPointLine(x, y) {
	  var dx = x - x0$3, dy = y - y0$3, z = sqrt(dx * dx + dy * dy);
	  X1$1 += z * (x0$3 + x) / 2;
	  Y1$1 += z * (y0$3 + y) / 2;
	  Z1$1 += z;
	  centroidPoint$1(x0$3 = x, y0$3 = y);
	}

	function centroidLineEnd$1() {
	  centroidStream$1.point = centroidPoint$1;
	}

	function centroidRingStart$1() {
	  centroidStream$1.point = centroidPointFirstRing;
	}

	function centroidRingEnd$1() {
	  centroidPointRing(x00$1, y00$1);
	}

	function centroidPointFirstRing(x, y) {
	  centroidStream$1.point = centroidPointRing;
	  centroidPoint$1(x00$1 = x0$3 = x, y00$1 = y0$3 = y);
	}

	function centroidPointRing(x, y) {
	  var dx = x - x0$3,
	      dy = y - y0$3,
	      z = sqrt(dx * dx + dy * dy);

	  X1$1 += z * (x0$3 + x) / 2;
	  Y1$1 += z * (y0$3 + y) / 2;
	  Z1$1 += z;

	  z = y0$3 * x - x0$3 * y;
	  X2$1 += z * (x0$3 + x);
	  Y2$1 += z * (y0$3 + y);
	  Z2$1 += z * 3;
	  centroidPoint$1(x0$3 = x, y0$3 = y);
	}

	function PathContext(context) {
	  this._context = context;
	}

	PathContext.prototype = {
	  _radius: 4.5,
	  pointRadius: function(_) {
	    return this._radius = _, this;
	  },
	  polygonStart: function() {
	    this._line = 0;
	  },
	  polygonEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._line === 0) this._context.closePath();
	    this._point = NaN;
	  },
	  point: function(x, y) {
	    switch (this._point) {
	      case 0: {
	        this._context.moveTo(x, y);
	        this._point = 1;
	        break;
	      }
	      case 1: {
	        this._context.lineTo(x, y);
	        break;
	      }
	      default: {
	        this._context.moveTo(x + this._radius, y);
	        this._context.arc(x, y, this._radius, 0, tau);
	        break;
	      }
	    }
	  },
	  result: noop
	};

	function PathString() {
	  this._string = [];
	}

	PathString.prototype = {
	  _circle: circle$1(4.5),
	  pointRadius: function(_) {
	    return this._circle = circle$1(_), this;
	  },
	  polygonStart: function() {
	    this._line = 0;
	  },
	  polygonEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._line === 0) this._string.push("Z");
	    this._point = NaN;
	  },
	  point: function(x, y) {
	    switch (this._point) {
	      case 0: {
	        this._string.push("M", x, ",", y);
	        this._point = 1;
	        break;
	      }
	      case 1: {
	        this._string.push("L", x, ",", y);
	        break;
	      }
	      default: {
	        this._string.push("M", x, ",", y, this._circle);
	        break;
	      }
	    }
	  },
	  result: function() {
	    if (this._string.length) {
	      var result = this._string.join("");
	      this._string = [];
	      return result;
	    }
	  }
	};

	function circle$1(radius) {
	  return "m0," + radius
	      + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
	      + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
	      + "z";
	}

	function index() {
	  var pointRadius = 4.5,
	      projection,
	      projectionStream,
	      context,
	      contextStream;

	  function path(object) {
	    if (object) {
	      if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
	      geoStream(object, projectionStream(contextStream));
	    }
	    return contextStream.result();
	  }

	  path.area = function(object) {
	    geoStream(object, projectionStream(areaStream$1));
	    return areaStream$1.result();
	  };

	  path.bounds = function(object) {
	    geoStream(object, projectionStream(boundsStream$1));
	    return boundsStream$1.result();
	  };

	  path.centroid = function(object) {
	    geoStream(object, projectionStream(centroidStream$1));
	    return centroidStream$1.result();
	  };

	  path.projection = function(_) {
	    return arguments.length ? (projectionStream = (projection = _) == null ? identity : _.stream, path) : projection;
	  };

	  path.context = function(_) {
	    if (!arguments.length) return context;
	    contextStream = (context = _) == null ? new PathString : new PathContext(_);
	    if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
	    return path;
	  };

	  path.pointRadius = function(_) {
	    if (!arguments.length) return pointRadius;
	    pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
	    return path;
	  };

	  return path.projection(null).context(null);
	}

	var sum = adder();

	function polygonContains(polygon, point) {
	  var lambda = point[0],
	      phi = point[1],
	      normal = [sin(lambda), -cos(lambda), 0],
	      angle = 0,
	      winding = 0;

	  sum.reset();

	  for (var i = 0, n = polygon.length; i < n; ++i) {
	    if (!(m = (ring = polygon[i]).length)) continue;
	    var ring,
	        m,
	        point0 = ring[m - 1],
	        lambda0 = point0[0],
	        phi0 = point0[1] / 2 + quarterPi,
	        sinPhi0 = sin(phi0),
	        cosPhi0 = cos(phi0);

	    for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
	      var point1 = ring[j],
	          lambda1 = point1[0],
	          phi1 = point1[1] / 2 + quarterPi,
	          sinPhi1 = sin(phi1),
	          cosPhi1 = cos(phi1),
	          delta = lambda1 - lambda0,
	          sign = delta >= 0 ? 1 : -1,
	          absDelta = sign * delta,
	          antimeridian = absDelta > pi,
	          k = sinPhi0 * sinPhi1;

	      sum.add(atan2(k * sign * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
	      angle += antimeridian ? delta + sign * tau : delta;

	      // Are the longitudes either side of the point’s meridian (lambda),
	      // and are the latitudes smaller than the parallel (phi)?
	      if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
	        var arc = cartesianCross(cartesian(point0), cartesian(point1));
	        cartesianNormalizeInPlace(arc);
	        var intersection = cartesianCross(normal, arc);
	        cartesianNormalizeInPlace(intersection);
	        var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
	        if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
	          winding += antimeridian ^ delta >= 0 ? 1 : -1;
	        }
	      }
	    }
	  }

	  // First, determine whether the South pole is inside or outside:
	  //
	  // It is inside if:
	  // * the polygon winds around it in a clockwise direction.
	  // * the polygon does not (cumulatively) wind around it, but has a negative
	  //   (counter-clockwise) area.
	  //
	  // Second, count the (signed) number of times a segment crosses a lambda
	  // from the point to the South pole.  If it is zero, then the point is the
	  // same side as the South pole.

	  return (angle < -epsilon || angle < epsilon && sum < -epsilon) ^ (winding & 1);
	}

	function clip(pointVisible, clipLine, interpolate, start) {
	  return function(rotate, sink) {
	    var line = clipLine(sink),
	        rotatedStart = rotate.invert(start[0], start[1]),
	        ringBuffer = clipBuffer(),
	        ringSink = clipLine(ringBuffer),
	        polygonStarted = false,
	        polygon,
	        segments,
	        ring;

	    var clip = {
	      point: point,
	      lineStart: lineStart,
	      lineEnd: lineEnd,
	      polygonStart: function() {
	        clip.point = pointRing;
	        clip.lineStart = ringStart;
	        clip.lineEnd = ringEnd;
	        segments = [];
	        polygon = [];
	      },
	      polygonEnd: function() {
	        clip.point = point;
	        clip.lineStart = lineStart;
	        clip.lineEnd = lineEnd;
	        segments = d3Array.merge(segments);
	        var startInside = polygonContains(polygon, rotatedStart);
	        if (segments.length) {
	          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
	          clipPolygon(segments, compareIntersection, startInside, interpolate, sink);
	        } else if (startInside) {
	          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
	          sink.lineStart();
	          interpolate(null, null, 1, sink);
	          sink.lineEnd();
	        }
	        if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
	        segments = polygon = null;
	      },
	      sphere: function() {
	        sink.polygonStart();
	        sink.lineStart();
	        interpolate(null, null, 1, sink);
	        sink.lineEnd();
	        sink.polygonEnd();
	      }
	    };

	    function point(lambda, phi) {
	      var point = rotate(lambda, phi);
	      if (pointVisible(lambda = point[0], phi = point[1])) sink.point(lambda, phi);
	    }

	    function pointLine(lambda, phi) {
	      var point = rotate(lambda, phi);
	      line.point(point[0], point[1]);
	    }

	    function lineStart() {
	      clip.point = pointLine;
	      line.lineStart();
	    }

	    function lineEnd() {
	      clip.point = point;
	      line.lineEnd();
	    }

	    function pointRing(lambda, phi) {
	      ring.push([lambda, phi]);
	      var point = rotate(lambda, phi);
	      ringSink.point(point[0], point[1]);
	    }

	    function ringStart() {
	      ringSink.lineStart();
	      ring = [];
	    }

	    function ringEnd() {
	      pointRing(ring[0][0], ring[0][1]);
	      ringSink.lineEnd();

	      var clean = ringSink.clean(),
	          ringSegments = ringBuffer.result(),
	          i, n = ringSegments.length, m,
	          segment,
	          point;

	      ring.pop();
	      polygon.push(ring);
	      ring = null;

	      if (!n) return;

	      // No intersections.
	      if (clean & 1) {
	        segment = ringSegments[0];
	        if ((m = segment.length - 1) > 0) {
	          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
	          sink.lineStart();
	          for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
	          sink.lineEnd();
	        }
	        return;
	      }

	      // Rejoin connected segments.
	      // TODO reuse ringBuffer.rejoin()?
	      if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

	      segments.push(ringSegments.filter(validSegment));
	    }

	    return clip;
	  };
	}

	function validSegment(segment) {
	  return segment.length > 1;
	}

	// Intersections are sorted along the clip edge. For both antimeridian cutting
	// and circle clipping, the same comparison is used.
	function compareIntersection(a, b) {
	  return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1])
	       - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
	}

	var clipAntimeridian = clip(
	  function() { return true; },
	  clipAntimeridianLine,
	  clipAntimeridianInterpolate,
	  [-pi, -halfPi]
	);

	// Takes a line and cuts into visible segments. Return values: 0 - there were
	// intersections or the line was empty; 1 - no intersections; 2 - there were
	// intersections, and the first and last segments should be rejoined.
	function clipAntimeridianLine(stream) {
	  var lambda0 = NaN,
	      phi0 = NaN,
	      sign0 = NaN,
	      clean; // no intersections

	  return {
	    lineStart: function() {
	      stream.lineStart();
	      clean = 1;
	    },
	    point: function(lambda1, phi1) {
	      var sign1 = lambda1 > 0 ? pi : -pi,
	          delta = abs(lambda1 - lambda0);
	      if (abs(delta - pi) < epsilon) { // line crosses a pole
	        stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
	        stream.point(sign0, phi0);
	        stream.lineEnd();
	        stream.lineStart();
	        stream.point(sign1, phi0);
	        stream.point(lambda1, phi0);
	        clean = 0;
	      } else if (sign0 !== sign1 && delta >= pi) { // line crosses antimeridian
	        if (abs(lambda0 - sign0) < epsilon) lambda0 -= sign0 * epsilon; // handle degeneracies
	        if (abs(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon;
	        phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
	        stream.point(sign0, phi0);
	        stream.lineEnd();
	        stream.lineStart();
	        stream.point(sign1, phi0);
	        clean = 0;
	      }
	      stream.point(lambda0 = lambda1, phi0 = phi1);
	      sign0 = sign1;
	    },
	    lineEnd: function() {
	      stream.lineEnd();
	      lambda0 = phi0 = NaN;
	    },
	    clean: function() {
	      return 2 - clean; // if intersections, rejoin first and last segments
	    }
	  };
	}

	function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
	  var cosPhi0,
	      cosPhi1,
	      sinLambda0Lambda1 = sin(lambda0 - lambda1);
	  return abs(sinLambda0Lambda1) > epsilon
	      ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1)
	          - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0))
	          / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
	      : (phi0 + phi1) / 2;
	}

	function clipAntimeridianInterpolate(from, to, direction, stream) {
	  var phi;
	  if (from == null) {
	    phi = direction * halfPi;
	    stream.point(-pi, phi);
	    stream.point(0, phi);
	    stream.point(pi, phi);
	    stream.point(pi, 0);
	    stream.point(pi, -phi);
	    stream.point(0, -phi);
	    stream.point(-pi, -phi);
	    stream.point(-pi, 0);
	    stream.point(-pi, phi);
	  } else if (abs(from[0] - to[0]) > epsilon) {
	    var lambda = from[0] < to[0] ? pi : -pi;
	    phi = direction * lambda / 2;
	    stream.point(-lambda, phi);
	    stream.point(0, phi);
	    stream.point(lambda, phi);
	  } else {
	    stream.point(to[0], to[1]);
	  }
	}

	function clipCircle(radius, delta) {
	  var cr = cos(radius),
	      smallRadius = cr > 0,
	      notHemisphere = abs(cr) > epsilon; // TODO optimise for this common case

	  function interpolate(from, to, direction, stream) {
	    circleStream(stream, radius, delta, direction, from, to);
	  }

	  function visible(lambda, phi) {
	    return cos(lambda) * cos(phi) > cr;
	  }

	  // Takes a line and cuts into visible segments. Return values used for polygon
	  // clipping: 0 - there were intersections or the line was empty; 1 - no
	  // intersections 2 - there were intersections, and the first and last segments
	  // should be rejoined.
	  function clipLine(stream) {
	    var point0, // previous point
	        c0, // code for previous point
	        v0, // visibility of previous point
	        v00, // visibility of first point
	        clean; // no intersections
	    return {
	      lineStart: function() {
	        v00 = v0 = false;
	        clean = 1;
	      },
	      point: function(lambda, phi) {
	        var point1 = [lambda, phi],
	            point2,
	            v = visible(lambda, phi),
	            c = smallRadius
	              ? v ? 0 : code(lambda, phi)
	              : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
	        if (!point0 && (v00 = v0 = v)) stream.lineStart();
	        // Handle degeneracies.
	        // TODO ignore if not clipping polygons.
	        if (v !== v0) {
	          point2 = intersect(point0, point1);
	          if (pointEqual(point0, point2) || pointEqual(point1, point2)) {
	            point1[0] += epsilon;
	            point1[1] += epsilon;
	            v = visible(point1[0], point1[1]);
	          }
	        }
	        if (v !== v0) {
	          clean = 0;
	          if (v) {
	            // outside going in
	            stream.lineStart();
	            point2 = intersect(point1, point0);
	            stream.point(point2[0], point2[1]);
	          } else {
	            // inside going out
	            point2 = intersect(point0, point1);
	            stream.point(point2[0], point2[1]);
	            stream.lineEnd();
	          }
	          point0 = point2;
	        } else if (notHemisphere && point0 && smallRadius ^ v) {
	          var t;
	          // If the codes for two points are different, or are both zero,
	          // and there this segment intersects with the small circle.
	          if (!(c & c0) && (t = intersect(point1, point0, true))) {
	            clean = 0;
	            if (smallRadius) {
	              stream.lineStart();
	              stream.point(t[0][0], t[0][1]);
	              stream.point(t[1][0], t[1][1]);
	              stream.lineEnd();
	            } else {
	              stream.point(t[1][0], t[1][1]);
	              stream.lineEnd();
	              stream.lineStart();
	              stream.point(t[0][0], t[0][1]);
	            }
	          }
	        }
	        if (v && (!point0 || !pointEqual(point0, point1))) {
	          stream.point(point1[0], point1[1]);
	        }
	        point0 = point1, v0 = v, c0 = c;
	      },
	      lineEnd: function() {
	        if (v0) stream.lineEnd();
	        point0 = null;
	      },
	      // Rejoin first and last segments if there were intersections and the first
	      // and last points were visible.
	      clean: function() {
	        return clean | ((v00 && v0) << 1);
	      }
	    };
	  }

	  // Intersects the great circle between a and b with the clip circle.
	  function intersect(a, b, two) {
	    var pa = cartesian(a),
	        pb = cartesian(b);

	    // We have two planes, n1.p = d1 and n2.p = d2.
	    // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
	    var n1 = [1, 0, 0], // normal
	        n2 = cartesianCross(pa, pb),
	        n2n2 = cartesianDot(n2, n2),
	        n1n2 = n2[0], // cartesianDot(n1, n2),
	        determinant = n2n2 - n1n2 * n1n2;

	    // Two polar points.
	    if (!determinant) return !two && a;

	    var c1 =  cr * n2n2 / determinant,
	        c2 = -cr * n1n2 / determinant,
	        n1xn2 = cartesianCross(n1, n2),
	        A = cartesianScale(n1, c1),
	        B = cartesianScale(n2, c2);
	    cartesianAddInPlace(A, B);

	    // Solve |p(t)|^2 = 1.
	    var u = n1xn2,
	        w = cartesianDot(A, u),
	        uu = cartesianDot(u, u),
	        t2 = w * w - uu * (cartesianDot(A, A) - 1);

	    if (t2 < 0) return;

	    var t = sqrt(t2),
	        q = cartesianScale(u, (-w - t) / uu);
	    cartesianAddInPlace(q, A);
	    q = spherical(q);

	    if (!two) return q;

	    // Two intersection points.
	    var lambda0 = a[0],
	        lambda1 = b[0],
	        phi0 = a[1],
	        phi1 = b[1],
	        z;

	    if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;

	    var delta = lambda1 - lambda0,
	        polar = abs(delta - pi) < epsilon,
	        meridian = polar || delta < epsilon;

	    if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;

	    // Check that the first point is between a and b.
	    if (meridian
	        ? polar
	          ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1)
	          : phi0 <= q[1] && q[1] <= phi1
	        : delta > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
	      var q1 = cartesianScale(u, (-w + t) / uu);
	      cartesianAddInPlace(q1, A);
	      return [q, spherical(q1)];
	    }
	  }

	  // Generates a 4-bit vector representing the location of a point relative to
	  // the small circle's bounding box.
	  function code(lambda, phi) {
	    var r = smallRadius ? radius : pi - radius,
	        code = 0;
	    if (lambda < -r) code |= 1; // left
	    else if (lambda > r) code |= 2; // right
	    if (phi < -r) code |= 4; // below
	    else if (phi > r) code |= 8; // above
	    return code;
	  }

	  return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
	}

	function transform(prototype) {
	  return {
	    stream: transform$1(prototype)
	  };
	}

	function transform$1(prototype) {
	  function T() {}
	  var p = T.prototype = Object.create(Transform.prototype);
	  for (var k in prototype) p[k] = prototype[k];
	  return function(stream) {
	    var t = new T;
	    t.stream = stream;
	    return t;
	  };
	}

	function Transform() {}

	Transform.prototype = {
	  point: function(x, y) { this.stream.point(x, y); },
	  sphere: function() { this.stream.sphere(); },
	  lineStart: function() { this.stream.lineStart(); },
	  lineEnd: function() { this.stream.lineEnd(); },
	  polygonStart: function() { this.stream.polygonStart(); },
	  polygonEnd: function() { this.stream.polygonEnd(); }
	};

	function fit(project, extent, object) {
	  var w = extent[1][0] - extent[0][0],
	      h = extent[1][1] - extent[0][1],
	      clip = project.clipExtent && project.clipExtent();

	  project
	      .scale(150)
	      .translate([0, 0]);

	  if (clip != null) project.clipExtent(null);

	  geoStream(object, project.stream(boundsStream$1));

	  var b = boundsStream$1.result(),
	      k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
	      x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
	      y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;

	  if (clip != null) project.clipExtent(clip);

	  return project
	      .scale(k * 150)
	      .translate([x, y]);
	}

	function fitSize(project) {
	  return function(size, object) {
	    return fit(project, [[0, 0], size], object);
	  };
	}

	function fitExtent(project) {
	  return function(extent, object) {
	    return fit(project, extent, object);
	  };
	}

	var maxDepth = 16;
	var cosMinDistance = cos(30 * radians);
	// cos(minimum angular distance)

	function resample(project, delta2) {
	  return +delta2 ? resample$1(project, delta2) : resampleNone(project);
	}

	function resampleNone(project) {
	  return transform$1({
	    point: function(x, y) {
	      x = project(x, y);
	      this.stream.point(x[0], x[1]);
	    }
	  });
	}

	function resample$1(project, delta2) {

	  function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
	    var dx = x1 - x0,
	        dy = y1 - y0,
	        d2 = dx * dx + dy * dy;
	    if (d2 > 4 * delta2 && depth--) {
	      var a = a0 + a1,
	          b = b0 + b1,
	          c = c0 + c1,
	          m = sqrt(a * a + b * b + c * c),
	          phi2 = asin(c /= m),
	          lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a),
	          p = project(lambda2, phi2),
	          x2 = p[0],
	          y2 = p[1],
	          dx2 = x2 - x0,
	          dy2 = y2 - y0,
	          dz = dy * dx2 - dx * dy2;
	      if (dz * dz / d2 > delta2 // perpendicular projected distance
	          || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
	          || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
	        resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
	        stream.point(x2, y2);
	        resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
	      }
	    }
	  }
	  return function(stream) {
	    var lambda00, x00, y00, a00, b00, c00, // first point
	        lambda0, x0, y0, a0, b0, c0; // previous point

	    var resampleStream = {
	      point: point,
	      lineStart: lineStart,
	      lineEnd: lineEnd,
	      polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
	      polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
	    };

	    function point(x, y) {
	      x = project(x, y);
	      stream.point(x[0], x[1]);
	    }

	    function lineStart() {
	      x0 = NaN;
	      resampleStream.point = linePoint;
	      stream.lineStart();
	    }

	    function linePoint(lambda, phi) {
	      var c = cartesian([lambda, phi]), p = project(lambda, phi);
	      resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
	      stream.point(x0, y0);
	    }

	    function lineEnd() {
	      resampleStream.point = point;
	      stream.lineEnd();
	    }

	    function ringStart() {
	      lineStart();
	      resampleStream.point = ringPoint;
	      resampleStream.lineEnd = ringEnd;
	    }

	    function ringPoint(lambda, phi) {
	      linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
	      resampleStream.point = linePoint;
	    }

	    function ringEnd() {
	      resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
	      resampleStream.lineEnd = lineEnd;
	      lineEnd();
	    }

	    return resampleStream;
	  };
	}

	var transformRadians = transform$1({
	  point: function(x, y) {
	    this.stream.point(x * radians, y * radians);
	  }
	});

	function projection(project) {
	  return projectionMutator(function() { return project; })();
	}

	function projectionMutator(projectAt) {
	  var project,
	      k = 150, // scale
	      x = 480, y = 250, // translate
	      dx, dy, lambda = 0, phi = 0, // center
	      deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, projectRotate, // rotate
	      theta = null, preclip = clipAntimeridian, // clip angle
	      x0 = null, y0, x1, y1, postclip = identity, // clip extent
	      delta2 = 0.5, projectResample = resample(projectTransform, delta2), // precision
	      cache,
	      cacheStream;

	  function projection(point) {
	    point = projectRotate(point[0] * radians, point[1] * radians);
	    return [point[0] * k + dx, dy - point[1] * k];
	  }

	  function invert(point) {
	    point = projectRotate.invert((point[0] - dx) / k, (dy - point[1]) / k);
	    return point && [point[0] * degrees, point[1] * degrees];
	  }

	  function projectTransform(x, y) {
	    return x = project(x, y), [x[0] * k + dx, dy - x[1] * k];
	  }

	  projection.stream = function(stream) {
	    return cache && cacheStream === stream ? cache : cache = transformRadians(preclip(rotate, projectResample(postclip(cacheStream = stream))));
	  };

	  projection.clipAngle = function(_) {
	    return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians, 6 * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
	  };

	  projection.clipExtent = function(_) {
	    return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity) : clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
	  };

	  projection.scale = function(_) {
	    return arguments.length ? (k = +_, recenter()) : k;
	  };

	  projection.translate = function(_) {
	    return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
	  };

	  projection.center = function(_) {
	    return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
	  };

	  projection.rotate = function(_) {
	    return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
	  };

	  projection.precision = function(_) {
	    return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
	  };

	  projection.fitExtent = fitExtent(projection);

	  projection.fitSize = fitSize(projection);

	  function recenter() {
	    projectRotate = compose(rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma), project);
	    var center = project(lambda, phi);
	    dx = x - center[0] * k;
	    dy = y + center[1] * k;
	    return reset();
	  }

	  function reset() {
	    cache = cacheStream = null;
	    return projection;
	  }

	  return function() {
	    project = projectAt.apply(this, arguments);
	    projection.invert = project.invert && invert;
	    return recenter();
	  };
	}

	function conicProjection(projectAt) {
	  var phi0 = 0,
	      phi1 = pi / 3,
	      m = projectionMutator(projectAt),
	      p = m(phi0, phi1);

	  p.parallels = function(_) {
	    return arguments.length ? m(phi0 = _[0] * radians, phi1 = _[1] * radians) : [phi0 * degrees, phi1 * degrees];
	  };

	  return p;
	}

	function conicEqualAreaRaw(y0, y1) {
	  var sy0 = sin(y0),
	      n = (sy0 + sin(y1)) / 2,
	      c = 1 + sy0 * (2 * n - sy0),
	      r0 = sqrt(c) / n;

	  function project(x, y) {
	    var r = sqrt(c - 2 * n * sin(y)) / n;
	    return [r * sin(x *= n), r0 - r * cos(x)];
	  }

	  project.invert = function(x, y) {
	    var r0y = r0 - y;
	    return [atan2(x, r0y) / n, asin((c - (x * x + r0y * r0y) * n * n) / (2 * n))];
	  };

	  return project;
	}

	function conicEqualArea() {
	  return conicProjection(conicEqualAreaRaw)
	      .scale(155.424)
	      .center([0, 33.6442]);
	}

	function albers() {
	  return conicEqualArea()
	      .parallels([29.5, 45.5])
	      .scale(1070)
	      .translate([480, 250])
	      .rotate([96, 0])
	      .center([-0.6, 38.7]);
	}

	// The projections must have mutually exclusive clip regions on the sphere,
	// as this will avoid emitting interleaving lines and polygons.
	function multiplex(streams) {
	  var n = streams.length;
	  return {
	    point: function(x, y) { var i = -1; while (++i < n) streams[i].point(x, y); },
	    sphere: function() { var i = -1; while (++i < n) streams[i].sphere(); },
	    lineStart: function() { var i = -1; while (++i < n) streams[i].lineStart(); },
	    lineEnd: function() { var i = -1; while (++i < n) streams[i].lineEnd(); },
	    polygonStart: function() { var i = -1; while (++i < n) streams[i].polygonStart(); },
	    polygonEnd: function() { var i = -1; while (++i < n) streams[i].polygonEnd(); }
	  };
	}

	// A composite projection for the United States, configured by default for
	// 960×500. The projection also works quite well at 960×600 if you change the
	// scale to 1285 and adjust the translate accordingly. The set of standard
	// parallels for each region comes from USGS, which is published here:
	// http://egsc.usgs.gov/isb/pubs/MapProjections/projections.html#albers
	function albersUsa() {
	  var cache,
	      cacheStream,
	      lower48 = albers(), lower48Point,
	      alaska = conicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, // EPSG:3338
	      hawaii = conicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, // ESRI:102007
	      point, pointStream = {point: function(x, y) { point = [x, y]; }};

	  function albersUsa(coordinates) {
	    var x = coordinates[0], y = coordinates[1];
	    return point = null,
	        (lower48Point.point(x, y), point)
	        || (alaskaPoint.point(x, y), point)
	        || (hawaiiPoint.point(x, y), point);
	  }

	  albersUsa.invert = function(coordinates) {
	    var k = lower48.scale(),
	        t = lower48.translate(),
	        x = (coordinates[0] - t[0]) / k,
	        y = (coordinates[1] - t[1]) / k;
	    return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska
	        : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii
	        : lower48).invert(coordinates);
	  };

	  albersUsa.stream = function(stream) {
	    return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)]);
	  };

	  albersUsa.precision = function(_) {
	    if (!arguments.length) return lower48.precision();
	    lower48.precision(_), alaska.precision(_), hawaii.precision(_);
	    return albersUsa;
	  };

	  albersUsa.scale = function(_) {
	    if (!arguments.length) return lower48.scale();
	    lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_);
	    return albersUsa.translate(lower48.translate());
	  };

	  albersUsa.translate = function(_) {
	    if (!arguments.length) return lower48.translate();
	    var k = lower48.scale(), x = +_[0], y = +_[1];

	    lower48Point = lower48
	        .translate(_)
	        .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]])
	        .stream(pointStream);

	    alaskaPoint = alaska
	        .translate([x - 0.307 * k, y + 0.201 * k])
	        .clipExtent([[x - 0.425 * k + epsilon, y + 0.120 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon]])
	        .stream(pointStream);

	    hawaiiPoint = hawaii
	        .translate([x - 0.205 * k, y + 0.212 * k])
	        .clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon]])
	        .stream(pointStream);

	    return albersUsa;
	  };

	  albersUsa.fitExtent = fitExtent(albersUsa);

	  albersUsa.fitSize = fitSize(albersUsa);

	  return albersUsa.scale(1070);
	}

	function azimuthalRaw(scale) {
	  return function(x, y) {
	    var cx = cos(x),
	        cy = cos(y),
	        k = scale(cx * cy);
	    return [
	      k * cy * sin(x),
	      k * sin(y)
	    ];
	  }
	}

	function azimuthalInvert(angle) {
	  return function(x, y) {
	    var z = sqrt(x * x + y * y),
	        c = angle(z),
	        sc = sin(c),
	        cc = cos(c);
	    return [
	      atan2(x * sc, z * cc),
	      asin(z && y * sc / z)
	    ];
	  }
	}

	var azimuthalEqualAreaRaw = azimuthalRaw(function(cxcy) {
	  return sqrt(2 / (1 + cxcy));
	});

	azimuthalEqualAreaRaw.invert = azimuthalInvert(function(z) {
	  return 2 * asin(z / 2);
	});

	function azimuthalEqualArea() {
	  return projection(azimuthalEqualAreaRaw)
	      .scale(124.75)
	      .clipAngle(180 - 1e-3);
	}

	var azimuthalEquidistantRaw = azimuthalRaw(function(c) {
	  return (c = acos(c)) && c / sin(c);
	});

	azimuthalEquidistantRaw.invert = azimuthalInvert(function(z) {
	  return z;
	});

	function azimuthalEquidistant() {
	  return projection(azimuthalEquidistantRaw)
	      .scale(79.4188)
	      .clipAngle(180 - 1e-3);
	}

	function mercatorRaw(lambda, phi) {
	  return [lambda, log(tan((halfPi + phi) / 2))];
	}

	mercatorRaw.invert = function(x, y) {
	  return [x, 2 * atan(exp(y)) - halfPi];
	};

	function mercator() {
	  return mercatorProjection(mercatorRaw)
	      .scale(961 / tau);
	}

	function mercatorProjection(project) {
	  var m = projection(project),
	      scale = m.scale,
	      translate = m.translate,
	      clipExtent = m.clipExtent,
	      clipAuto;

	  m.scale = function(_) {
	    return arguments.length ? (scale(_), clipAuto && m.clipExtent(null), m) : scale();
	  };

	  m.translate = function(_) {
	    return arguments.length ? (translate(_), clipAuto && m.clipExtent(null), m) : translate();
	  };

	  m.clipExtent = function(_) {
	    if (!arguments.length) return clipAuto ? null : clipExtent();
	    if (clipAuto = _ == null) {
	      var k = pi * scale(),
	          t = translate();
	      _ = [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]];
	    }
	    clipExtent(_);
	    return m;
	  };

	  return m.clipExtent(null);
	}

	function tany(y) {
	  return tan((halfPi + y) / 2);
	}

	function conicConformalRaw(y0, y1) {
	  var cy0 = cos(y0),
	      n = y0 === y1 ? sin(y0) : log(cy0 / cos(y1)) / log(tany(y1) / tany(y0)),
	      f = cy0 * pow(tany(y0), n) / n;

	  if (!n) return mercatorRaw;

	  function project(x, y) {
	    if (f > 0) { if (y < -halfPi + epsilon) y = -halfPi + epsilon; }
	    else { if (y > halfPi - epsilon) y = halfPi - epsilon; }
	    var r = f / pow(tany(y), n);
	    return [r * sin(n * x), f - r * cos(n * x)];
	  }

	  project.invert = function(x, y) {
	    var fy = f - y, r = sign(n) * sqrt(x * x + fy * fy);
	    return [atan2(x, fy) / n, 2 * atan(pow(f / r, 1 / n)) - halfPi];
	  };

	  return project;
	}

	function conicConformal() {
	  return conicProjection(conicConformalRaw)
	      .scale(109.5)
	      .parallels([30, 30]);
	}

	function equirectangularRaw(lambda, phi) {
	  return [lambda, phi];
	}

	equirectangularRaw.invert = equirectangularRaw;

	function equirectangular() {
	  return projection(equirectangularRaw)
	      .scale(152.63);
	}

	function conicEquidistantRaw(y0, y1) {
	  var cy0 = cos(y0),
	      n = y0 === y1 ? sin(y0) : (cy0 - cos(y1)) / (y1 - y0),
	      g = cy0 / n + y0;

	  if (abs(n) < epsilon) return equirectangularRaw;

	  function project(x, y) {
	    var gy = g - y, nx = n * x;
	    return [gy * sin(nx), g - gy * cos(nx)];
	  }

	  project.invert = function(x, y) {
	    var gy = g - y;
	    return [atan2(x, gy) / n, g - sign(n) * sqrt(x * x + gy * gy)];
	  };

	  return project;
	}

	function conicEquidistant() {
	  return conicProjection(conicEquidistantRaw)
	      .scale(131.154)
	      .center([0, 13.9389]);
	}

	function gnomonicRaw(x, y) {
	  var cy = cos(y), k = cos(x) * cy;
	  return [cy * sin(x) / k, sin(y) / k];
	}

	gnomonicRaw.invert = azimuthalInvert(atan);

	function gnomonic() {
	  return projection(gnomonicRaw)
	      .scale(144.049)
	      .clipAngle(60);
	}

	function orthographicRaw(x, y) {
	  return [cos(y) * sin(x), sin(y)];
	}

	orthographicRaw.invert = azimuthalInvert(asin);

	function orthographic() {
	  return projection(orthographicRaw)
	      .scale(249.5)
	      .clipAngle(90 + epsilon);
	}

	function stereographicRaw(x, y) {
	  var cy = cos(y), k = 1 + cos(x) * cy;
	  return [cy * sin(x) / k, sin(y) / k];
	}

	stereographicRaw.invert = azimuthalInvert(function(z) {
	  return 2 * atan(z);
	});

	function stereographic() {
	  return projection(stereographicRaw)
	      .scale(250)
	      .clipAngle(142);
	}

	function transverseMercatorRaw(lambda, phi) {
	  return [log(tan((halfPi + phi) / 2)), -lambda];
	}

	transverseMercatorRaw.invert = function(x, y) {
	  return [-y, 2 * atan(exp(x)) - halfPi];
	};

	function transverseMercator() {
	  var m = mercatorProjection(transverseMercatorRaw),
	      center = m.center,
	      rotate = m.rotate;

	  m.center = function(_) {
	    return arguments.length ? center([-_[1], _[0]]) : (_ = center(), [_[1], -_[0]]);
	  };

	  m.rotate = function(_) {
	    return arguments.length ? rotate([_[0], _[1], _.length > 2 ? _[2] + 90 : 90]) : (_ = rotate(), [_[0], _[1], _[2] - 90]);
	  };

	  return rotate([0, 0, 90])
	      .scale(159.155);
	}

	exports.geoArea = area;
	exports.geoBounds = bounds;
	exports.geoCentroid = centroid;
	exports.geoCircle = circle;
	exports.geoClipExtent = extent;
	exports.geoDistance = distance;
	exports.geoGraticule = graticule;
	exports.geoInterpolate = interpolate;
	exports.geoLength = length;
	exports.geoPath = index;
	exports.geoAlbers = albers;
	exports.geoAlbersUsa = albersUsa;
	exports.geoAzimuthalEqualArea = azimuthalEqualArea;
	exports.geoAzimuthalEqualAreaRaw = azimuthalEqualAreaRaw;
	exports.geoAzimuthalEquidistant = azimuthalEquidistant;
	exports.geoAzimuthalEquidistantRaw = azimuthalEquidistantRaw;
	exports.geoConicConformal = conicConformal;
	exports.geoConicConformalRaw = conicConformalRaw;
	exports.geoConicEqualArea = conicEqualArea;
	exports.geoConicEqualAreaRaw = conicEqualAreaRaw;
	exports.geoConicEquidistant = conicEquidistant;
	exports.geoConicEquidistantRaw = conicEquidistantRaw;
	exports.geoEquirectangular = equirectangular;
	exports.geoEquirectangularRaw = equirectangularRaw;
	exports.geoGnomonic = gnomonic;
	exports.geoGnomonicRaw = gnomonicRaw;
	exports.geoProjection = projection;
	exports.geoProjectionMutator = projectionMutator;
	exports.geoMercator = mercator;
	exports.geoMercatorRaw = mercatorRaw;
	exports.geoOrthographic = orthographic;
	exports.geoOrthographicRaw = orthographicRaw;
	exports.geoStereographic = stereographic;
	exports.geoStereographicRaw = stereographicRaw;
	exports.geoTransverseMercator = transverseMercator;
	exports.geoTransverseMercatorRaw = transverseMercatorRaw;
	exports.geoRotation = rotation;
	exports.geoStream = geoStream;
	exports.geoTransform = transform;

	Object.defineProperty(exports, '__esModule', { value: true });

	})));

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-array/ Version 1.0.1. Copyright 2016 Mike Bostock.
	(function (global, factory) {
	   true ? factory(exports) :
	  typeof define === 'function' && define.amd ? define(['exports'], factory) :
	  (factory((global.d3 = global.d3 || {})));
	}(this, function (exports) { 'use strict';

	  function ascending(a, b) {
	    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	  }

	  function bisector(compare) {
	    if (compare.length === 1) compare = ascendingComparator(compare);
	    return {
	      left: function(a, x, lo, hi) {
	        if (lo == null) lo = 0;
	        if (hi == null) hi = a.length;
	        while (lo < hi) {
	          var mid = lo + hi >>> 1;
	          if (compare(a[mid], x) < 0) lo = mid + 1;
	          else hi = mid;
	        }
	        return lo;
	      },
	      right: function(a, x, lo, hi) {
	        if (lo == null) lo = 0;
	        if (hi == null) hi = a.length;
	        while (lo < hi) {
	          var mid = lo + hi >>> 1;
	          if (compare(a[mid], x) > 0) hi = mid;
	          else lo = mid + 1;
	        }
	        return lo;
	      }
	    };
	  }

	  function ascendingComparator(f) {
	    return function(d, x) {
	      return ascending(f(d), x);
	    };
	  }

	  var ascendingBisect = bisector(ascending);
	  var bisectRight = ascendingBisect.right;
	  var bisectLeft = ascendingBisect.left;

	  function descending(a, b) {
	    return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
	  }

	  function number(x) {
	    return x === null ? NaN : +x;
	  }

	  function variance(array, f) {
	    var n = array.length,
	        m = 0,
	        a,
	        d,
	        s = 0,
	        i = -1,
	        j = 0;

	    if (f == null) {
	      while (++i < n) {
	        if (!isNaN(a = number(array[i]))) {
	          d = a - m;
	          m += d / ++j;
	          s += d * (a - m);
	        }
	      }
	    }

	    else {
	      while (++i < n) {
	        if (!isNaN(a = number(f(array[i], i, array)))) {
	          d = a - m;
	          m += d / ++j;
	          s += d * (a - m);
	        }
	      }
	    }

	    if (j > 1) return s / (j - 1);
	  }

	  function deviation(array, f) {
	    var v = variance(array, f);
	    return v ? Math.sqrt(v) : v;
	  }

	  function extent(array, f) {
	    var i = -1,
	        n = array.length,
	        a,
	        b,
	        c;

	    if (f == null) {
	      while (++i < n) if ((b = array[i]) != null && b >= b) { a = c = b; break; }
	      while (++i < n) if ((b = array[i]) != null) {
	        if (a > b) a = b;
	        if (c < b) c = b;
	      }
	    }

	    else {
	      while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = c = b; break; }
	      while (++i < n) if ((b = f(array[i], i, array)) != null) {
	        if (a > b) a = b;
	        if (c < b) c = b;
	      }
	    }

	    return [a, c];
	  }

	  var array = Array.prototype;

	  var slice = array.slice;
	  var map = array.map;

	  function constant(x) {
	    return function() {
	      return x;
	    };
	  }

	  function identity(x) {
	    return x;
	  }

	  function range(start, stop, step) {
	    start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

	    var i = -1,
	        n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
	        range = new Array(n);

	    while (++i < n) {
	      range[i] = start + i * step;
	    }

	    return range;
	  }

	  var e10 = Math.sqrt(50);
	  var e5 = Math.sqrt(10);
	  var e2 = Math.sqrt(2);
	  function ticks(start, stop, count) {
	    var step = tickStep(start, stop, count);
	    return range(
	      Math.ceil(start / step) * step,
	      Math.floor(stop / step) * step + step / 2, // inclusive
	      step
	    );
	  }

	  function tickStep(start, stop, count) {
	    var step0 = Math.abs(stop - start) / Math.max(0, count),
	        step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
	        error = step0 / step1;
	    if (error >= e10) step1 *= 10;
	    else if (error >= e5) step1 *= 5;
	    else if (error >= e2) step1 *= 2;
	    return stop < start ? -step1 : step1;
	  }

	  function sturges(values) {
	    return Math.ceil(Math.log(values.length) / Math.LN2) + 1;
	  }

	  function histogram() {
	    var value = identity,
	        domain = extent,
	        threshold = sturges;

	    function histogram(data) {
	      var i,
	          n = data.length,
	          x,
	          values = new Array(n);

	      for (i = 0; i < n; ++i) {
	        values[i] = value(data[i], i, data);
	      }

	      var xz = domain(values),
	          x0 = xz[0],
	          x1 = xz[1],
	          tz = threshold(values, x0, x1);

	      // Convert number of thresholds into uniform thresholds.
	      if (!Array.isArray(tz)) tz = ticks(x0, x1, tz);

	      // Remove any thresholds outside the domain.
	      var m = tz.length;
	      while (tz[0] <= x0) tz.shift(), --m;
	      while (tz[m - 1] >= x1) tz.pop(), --m;

	      var bins = new Array(m + 1),
	          bin;

	      // Initialize bins.
	      for (i = 0; i <= m; ++i) {
	        bin = bins[i] = [];
	        bin.x0 = i > 0 ? tz[i - 1] : x0;
	        bin.x1 = i < m ? tz[i] : x1;
	      }

	      // Assign data to bins by value, ignoring any outside the domain.
	      for (i = 0; i < n; ++i) {
	        x = values[i];
	        if (x0 <= x && x <= x1) {
	          bins[bisectRight(tz, x, 0, m)].push(data[i]);
	        }
	      }

	      return bins;
	    }

	    histogram.value = function(_) {
	      return arguments.length ? (value = typeof _ === "function" ? _ : constant(_), histogram) : value;
	    };

	    histogram.domain = function(_) {
	      return arguments.length ? (domain = typeof _ === "function" ? _ : constant([_[0], _[1]]), histogram) : domain;
	    };

	    histogram.thresholds = function(_) {
	      return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant(slice.call(_)) : constant(_), histogram) : threshold;
	    };

	    return histogram;
	  }

	  function quantile(array, p, f) {
	    if (f == null) f = number;
	    if (!(n = array.length)) return;
	    if ((p = +p) <= 0 || n < 2) return +f(array[0], 0, array);
	    if (p >= 1) return +f(array[n - 1], n - 1, array);
	    var n,
	        h = (n - 1) * p,
	        i = Math.floor(h),
	        a = +f(array[i], i, array),
	        b = +f(array[i + 1], i + 1, array);
	    return a + (b - a) * (h - i);
	  }

	  function freedmanDiaconis(values, min, max) {
	    values = map.call(values, number).sort(ascending);
	    return Math.ceil((max - min) / (2 * (quantile(values, 0.75) - quantile(values, 0.25)) * Math.pow(values.length, -1 / 3)));
	  }

	  function scott(values, min, max) {
	    return Math.ceil((max - min) / (3.5 * deviation(values) * Math.pow(values.length, -1 / 3)));
	  }

	  function max(array, f) {
	    var i = -1,
	        n = array.length,
	        a,
	        b;

	    if (f == null) {
	      while (++i < n) if ((b = array[i]) != null && b >= b) { a = b; break; }
	      while (++i < n) if ((b = array[i]) != null && b > a) a = b;
	    }

	    else {
	      while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = b; break; }
	      while (++i < n) if ((b = f(array[i], i, array)) != null && b > a) a = b;
	    }

	    return a;
	  }

	  function mean(array, f) {
	    var s = 0,
	        n = array.length,
	        a,
	        i = -1,
	        j = n;

	    if (f == null) {
	      while (++i < n) if (!isNaN(a = number(array[i]))) s += a; else --j;
	    }

	    else {
	      while (++i < n) if (!isNaN(a = number(f(array[i], i, array)))) s += a; else --j;
	    }

	    if (j) return s / j;
	  }

	  function median(array, f) {
	    var numbers = [],
	        n = array.length,
	        a,
	        i = -1;

	    if (f == null) {
	      while (++i < n) if (!isNaN(a = number(array[i]))) numbers.push(a);
	    }

	    else {
	      while (++i < n) if (!isNaN(a = number(f(array[i], i, array)))) numbers.push(a);
	    }

	    return quantile(numbers.sort(ascending), 0.5);
	  }

	  function merge(arrays) {
	    var n = arrays.length,
	        m,
	        i = -1,
	        j = 0,
	        merged,
	        array;

	    while (++i < n) j += arrays[i].length;
	    merged = new Array(j);

	    while (--n >= 0) {
	      array = arrays[n];
	      m = array.length;
	      while (--m >= 0) {
	        merged[--j] = array[m];
	      }
	    }

	    return merged;
	  }

	  function min(array, f) {
	    var i = -1,
	        n = array.length,
	        a,
	        b;

	    if (f == null) {
	      while (++i < n) if ((b = array[i]) != null && b >= b) { a = b; break; }
	      while (++i < n) if ((b = array[i]) != null && a > b) a = b;
	    }

	    else {
	      while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = b; break; }
	      while (++i < n) if ((b = f(array[i], i, array)) != null && a > b) a = b;
	    }

	    return a;
	  }

	  function pairs(array) {
	    var i = 0, n = array.length - 1, p = array[0], pairs = new Array(n < 0 ? 0 : n);
	    while (i < n) pairs[i] = [p, p = array[++i]];
	    return pairs;
	  }

	  function permute(array, indexes) {
	    var i = indexes.length, permutes = new Array(i);
	    while (i--) permutes[i] = array[indexes[i]];
	    return permutes;
	  }

	  function scan(array, compare) {
	    if (!(n = array.length)) return;
	    var i = 0,
	        n,
	        j = 0,
	        xi,
	        xj = array[j];

	    if (!compare) compare = ascending;

	    while (++i < n) if (compare(xi = array[i], xj) < 0 || compare(xj, xj) !== 0) xj = xi, j = i;

	    if (compare(xj, xj) === 0) return j;
	  }

	  function shuffle(array, i0, i1) {
	    var m = (i1 == null ? array.length : i1) - (i0 = i0 == null ? 0 : +i0),
	        t,
	        i;

	    while (m) {
	      i = Math.random() * m-- | 0;
	      t = array[m + i0];
	      array[m + i0] = array[i + i0];
	      array[i + i0] = t;
	    }

	    return array;
	  }

	  function sum(array, f) {
	    var s = 0,
	        n = array.length,
	        a,
	        i = -1;

	    if (f == null) {
	      while (++i < n) if (a = +array[i]) s += a; // Note: zero and null are equivalent.
	    }

	    else {
	      while (++i < n) if (a = +f(array[i], i, array)) s += a;
	    }

	    return s;
	  }

	  function transpose(matrix) {
	    if (!(n = matrix.length)) return [];
	    for (var i = -1, m = min(matrix, length), transpose = new Array(m); ++i < m;) {
	      for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n;) {
	        row[j] = matrix[j][i];
	      }
	    }
	    return transpose;
	  }

	  function length(d) {
	    return d.length;
	  }

	  function zip() {
	    return transpose(arguments);
	  }

	  exports.bisect = bisectRight;
	  exports.bisectRight = bisectRight;
	  exports.bisectLeft = bisectLeft;
	  exports.ascending = ascending;
	  exports.bisector = bisector;
	  exports.descending = descending;
	  exports.deviation = deviation;
	  exports.extent = extent;
	  exports.histogram = histogram;
	  exports.thresholdFreedmanDiaconis = freedmanDiaconis;
	  exports.thresholdScott = scott;
	  exports.thresholdSturges = sturges;
	  exports.max = max;
	  exports.mean = mean;
	  exports.median = median;
	  exports.merge = merge;
	  exports.min = min;
	  exports.pairs = pairs;
	  exports.permute = permute;
	  exports.quantile = quantile;
	  exports.range = range;
	  exports.scan = scan;
	  exports.shuffle = shuffle;
	  exports.sum = sum;
	  exports.ticks = ticks;
	  exports.tickStep = tickStep;
	  exports.transpose = transpose;
	  exports.variance = variance;
	  exports.zip = zip;

	  Object.defineProperty(exports, '__esModule', { value: true });

	}));

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = function (point, vs) {
	    // ray-casting algorithm based on
	    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
	    
	    var x = point[0], y = point[1];
	    
	    var inside = false;
	    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
	        var xi = vs[i][0], yi = vs[i][1];
	        var xj = vs[j][0], yj = vs[j][1];
	        
	        var intersect = ((yi > y) != (yj > y))
	            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
	        if (intersect) inside = !inside;
	    }
	    
	    return inside;
	};


/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = function (points,signed) {
	  var l = points.length
	  var det = 0
	  var isSigned = signed || false

	  points = points.map(normalize)
	  if (points[0] != points[points.length -1])  
	    points = points.concat(points[0])

	  for (var i = 0; i < l; i++)
	    det += points[i].x * points[i + 1].y
	      - points[i].y * points[i + 1].x
	  if (isSigned)
	    return det / 2
	  else
	    return Math.abs(det) / 2
	}

	function normalize(point) {
	  if (Array.isArray(point))
	    return {
	      x: point[0],
	      y: point[1]
	    }
	  else
	    return point
	}


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var d3Geo = __webpack_require__(28)
	var d3Array = __webpack_require__(29)
	var topojson = __webpack_require__(33);
	var copy = __webpack_require__(34);

	var projectArcs = __webpack_require__(35);
	var objectify = __webpack_require__(37);
	var math = __webpack_require__(38);
	var utils = __webpack_require__(39);
	var timer = __webpack_require__(40);

	module.exports = function() {
	  var iterations = 8;
	  var debug = false;
	  var projection = d3Geo.geoAlbers();
	  var properties = function(geom, topology) {
	    return geom.properties || {};
	  };
	  var value = function(d) {
	    return 1;
	  };

	  var path = d3Geo.geoPath()
	    .projection(null);

	  var topogram = function(topology, geometries) {
	    if (debug) timer.start('copy');
	    topology = copy(topology);
	    if (debug) timer.end('copy');

	    if (debug) timer.start('project');
	    var projectedArcs = projectArcs(topology, projection);
	    if (debug) timer.end('project');

	    if (debug) timer.start('objectify');
	    var objects = objectify(projectedArcs, {
	      type: "GeometryCollection",
	      geometries: geometries
	    })
	    .geometries.map(function(geom) {
	      return {
	        type: "Feature",
	        id: geom.id,
	        properties: properties.call(null, geom, topology),
	        geometry: geom
	      };
	    });
	    if (debug) timer.end('objectify');

	    var values = objects.map(value);
	    var totalValue = d3Array.sum(values);

	    if (iterations <= 0) {
	      return objects;
	    }

	    var i = 0;
	    if (debug) timer.start('iterate');
	    while (i++ < iterations) {
	      if (debug) timer.start('iteration ' + i);
	      var areas = objects.map(path.area);
	      var totalArea = d3Array.sum(areas);
	      var sizeErrorsTot = 0;
	      var sizeErrorsNum = 0;
	      var meta = objects.map(function(o, j) {
	        // FIXME: why do we have negative areas?
	        var area = Math.abs(areas[j]);
	        var v = +values[j];
	        var desired = totalArea * v / totalValue;
	        var radius = Math.sqrt(area / Math.PI);
	        var mass = Math.sqrt(desired / Math.PI) - radius;
	        sizeError = Math.max(area, desired) / Math.min(area, desired);
	        sizeErrorsTot += sizeError;
	        sizeErrorsNum++;
	        // console.log(o.id, "@", j, "area:", area, "value:", v, "->", desired, radius, mass, sizeError);
	        return {
	          id:         o.id,
	          area:       area,
	          centroid:   path.centroid(o),
	          value:      v,
	          desired:    desired,
	          radius:     radius,
	          mass:       mass,
	          sizeError:  sizeError
	        };
	      });

	      var sizeError = sizeErrorsTot / sizeErrorsNum;
	      var forceReductionFactor = 1 / (1 + sizeError);

	      // console.log("meta:", meta);
	      // console.log("  total area:", totalArea);
	      // console.log("  force reduction factor:", forceReductionFactor, "mean error:", sizeError);

	      var len2 = projectedArcs.length;
	      var i2 = 0;

	      while (i2 < len2) {
	        var len1 = projectedArcs[i2].length;
	        var i1 = 0;
	        while (i1 < len1) {
	          // create an array of vectors: [x, y]
	          var delta = [0,0];
	          var len3 = meta.length;
	          var i3 = 0;
	          while (i3 < len3) {
	            var centroid = meta[i3].centroid;
	            var mass = meta[i3].mass;
	            var radius = meta[i3].radius;
	            var rSquared = radius * radius;
	            var dx = projectedArcs[i2][i1][0] - centroid[0];
	            var dy = projectedArcs[i2][i1][1] - centroid[1];
	            var distSquared = dx * dx + dy * dy;
	            var dist = Math.sqrt(distSquared);
	            var Fij = (dist > radius)
	              ? mass * radius / dist
	              : mass *
	                (distSquared / rSquared) *
	                (4 - 3 * dist / radius); // XXX magic numbers!
	            delta[0] += (Fij * math.cosArctan(dy, dx));
	            delta[1] += (Fij * math.sinArctan(dy, dx));
	            i3++;
	          }
	          projectedArcs[i2][i1][0] += delta[0] * forceReductionFactor;
	          projectedArcs[i2][i1][1] += delta[1] * forceReductionFactor;
	          i1++;
	        }
	        i2++;
	      }
	      if (debug) timer.end('iteration ' + i);

	      // break if we hit the target size error
	      if (sizeError <= 1) break;
	    }
	    if (debug) timer.end('iterate');

	    return {
	      features: objects,
	      arcs: projectedArcs
	    };
	  };

	  // expose the path directly, for convenience
	  topogram.path = path;

	  topogram.iterations = function(i) {
	    if (arguments.length) {
	      iterations = Number(i) || 0;
	      return topogram;
	    } else {
	      return iterations;
	    }
	  };

	  topogram.value = function(v) {
	    if (arguments.length) {
	      value = utils.functor(v);
	      return topogram;
	    } else {
	      return value;
	    }
	  };

	  topogram.projection = function(p) {
	    if (arguments.length) {
	      projection = p;
	      return topogram;
	    } else {
	      return projection;
	    }
	  };

	  topogram.feature = function(topology, geom) {
	    return {
	      type: "Feature",
	      id: geom.id,
	      properties: properties.call(null, geom, topology),
	      geometry: {
	        type: geom.type,
	        coordinates: topojson.object(topology, geom).coordinates
	      }
	    };
	  };

	  topogram.features = function(topo, geometries) {
	    return geometries.map(function(f) {
	      return topogram.feature(topo, f);
	    });
	  };

	  topogram.properties = function(props) {
	    if (arguments.length) {
	      properties = utils.functor(props);
	      return topogram;
	    } else {
	      return properties;
	    }
	  };

	  topogram.debug = function(d) {
	    if (arguments.length) {
	      debug = !!d;
	      return topogram;
	    } else {
	      return debug;
	    }
	  };

	  return topogram;
	};


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	(function (global, factory) {
	   true ? factory(exports) :
	  typeof define === 'function' && define.amd ? define(['exports'], factory) :
	  (factory((global.topojson = global.topojson || {})));
	}(this, (function (exports) { 'use strict';

	function noop() {}

	function transformAbsolute(transform) {
	  if (!transform) return noop;
	  var x0,
	      y0,
	      kx = transform.scale[0],
	      ky = transform.scale[1],
	      dx = transform.translate[0],
	      dy = transform.translate[1];
	  return function(point, i) {
	    if (!i) x0 = y0 = 0;
	    point[0] = (x0 += point[0]) * kx + dx;
	    point[1] = (y0 += point[1]) * ky + dy;
	  };
	}

	function transformRelative(transform) {
	  if (!transform) return noop;
	  var x0,
	      y0,
	      kx = transform.scale[0],
	      ky = transform.scale[1],
	      dx = transform.translate[0],
	      dy = transform.translate[1];
	  return function(point, i) {
	    if (!i) x0 = y0 = 0;
	    var x1 = Math.round((point[0] - dx) / kx),
	        y1 = Math.round((point[1] - dy) / ky);
	    point[0] = x1 - x0;
	    point[1] = y1 - y0;
	    x0 = x1;
	    y0 = y1;
	  };
	}

	function reverse(array, n) {
	  var t, j = array.length, i = j - n;
	  while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
	}

	function bisect(a, x) {
	  var lo = 0, hi = a.length;
	  while (lo < hi) {
	    var mid = lo + hi >>> 1;
	    if (a[mid] < x) lo = mid + 1;
	    else hi = mid;
	  }
	  return lo;
	}

	function feature(topology, o) {
	  return o.type === "GeometryCollection" ? {
	    type: "FeatureCollection",
	    features: o.geometries.map(function(o) { return feature$1(topology, o); })
	  } : feature$1(topology, o);
	}

	function feature$1(topology, o) {
	  var f = {
	    type: "Feature",
	    id: o.id,
	    properties: o.properties || {},
	    geometry: object(topology, o)
	  };
	  if (o.id == null) delete f.id;
	  return f;
	}

	function object(topology, o) {
	  var absolute = transformAbsolute(topology.transform),
	      arcs = topology.arcs;

	  function arc(i, points) {
	    if (points.length) points.pop();
	    for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length, p; k < n; ++k) {
	      points.push(p = a[k].slice());
	      absolute(p, k);
	    }
	    if (i < 0) reverse(points, n);
	  }

	  function point(p) {
	    p = p.slice();
	    absolute(p, 0);
	    return p;
	  }

	  function line(arcs) {
	    var points = [];
	    for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
	    if (points.length < 2) points.push(points[0].slice());
	    return points;
	  }

	  function ring(arcs) {
	    var points = line(arcs);
	    while (points.length < 4) points.push(points[0].slice());
	    return points;
	  }

	  function polygon(arcs) {
	    return arcs.map(ring);
	  }

	  function geometry(o) {
	    var t = o.type;
	    return t === "GeometryCollection" ? {type: t, geometries: o.geometries.map(geometry)}
	        : t in geometryType ? {type: t, coordinates: geometryType[t](o)}
	        : null;
	  }

	  var geometryType = {
	    Point: function(o) { return point(o.coordinates); },
	    MultiPoint: function(o) { return o.coordinates.map(point); },
	    LineString: function(o) { return line(o.arcs); },
	    MultiLineString: function(o) { return o.arcs.map(line); },
	    Polygon: function(o) { return polygon(o.arcs); },
	    MultiPolygon: function(o) { return o.arcs.map(polygon); }
	  };

	  return geometry(o);
	}

	function stitchArcs(topology, arcs) {
	  var stitchedArcs = {},
	      fragmentByStart = {},
	      fragmentByEnd = {},
	      fragments = [],
	      emptyIndex = -1;

	  // Stitch empty arcs first, since they may be subsumed by other arcs.
	  arcs.forEach(function(i, j) {
	    var arc = topology.arcs[i < 0 ? ~i : i], t;
	    if (arc.length < 3 && !arc[1][0] && !arc[1][1]) {
	      t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;
	    }
	  });

	  arcs.forEach(function(i) {
	    var e = ends(i),
	        start = e[0],
	        end = e[1],
	        f, g;

	    if (f = fragmentByEnd[start]) {
	      delete fragmentByEnd[f.end];
	      f.push(i);
	      f.end = end;
	      if (g = fragmentByStart[end]) {
	        delete fragmentByStart[g.start];
	        var fg = g === f ? f : f.concat(g);
	        fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
	      } else {
	        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
	      }
	    } else if (f = fragmentByStart[end]) {
	      delete fragmentByStart[f.start];
	      f.unshift(i);
	      f.start = start;
	      if (g = fragmentByEnd[start]) {
	        delete fragmentByEnd[g.end];
	        var gf = g === f ? f : g.concat(f);
	        fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
	      } else {
	        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
	      }
	    } else {
	      f = [i];
	      fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;
	    }
	  });

	  function ends(i) {
	    var arc = topology.arcs[i < 0 ? ~i : i], p0 = arc[0], p1;
	    if (topology.transform) p1 = [0, 0], arc.forEach(function(dp) { p1[0] += dp[0], p1[1] += dp[1]; });
	    else p1 = arc[arc.length - 1];
	    return i < 0 ? [p1, p0] : [p0, p1];
	  }

	  function flush(fragmentByEnd, fragmentByStart) {
	    for (var k in fragmentByEnd) {
	      var f = fragmentByEnd[k];
	      delete fragmentByStart[f.start];
	      delete f.start;
	      delete f.end;
	      f.forEach(function(i) { stitchedArcs[i < 0 ? ~i : i] = 1; });
	      fragments.push(f);
	    }
	  }

	  flush(fragmentByEnd, fragmentByStart);
	  flush(fragmentByStart, fragmentByEnd);
	  arcs.forEach(function(i) { if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]); });

	  return fragments;
	}

	function mesh(topology) {
	  return object(topology, meshArcs.apply(this, arguments));
	}

	function meshArcs(topology, o, filter) {
	  var arcs = [];

	  function arc(i) {
	    var j = i < 0 ? ~i : i;
	    (geomsByArc[j] || (geomsByArc[j] = [])).push({i: i, g: geom});
	  }

	  function line(arcs) {
	    arcs.forEach(arc);
	  }

	  function polygon(arcs) {
	    arcs.forEach(line);
	  }

	  function geometry(o) {
	    if (o.type === "GeometryCollection") o.geometries.forEach(geometry);
	    else if (o.type in geometryType) geom = o, geometryType[o.type](o.arcs);
	  }

	  if (arguments.length > 1) {
	    var geomsByArc = [],
	        geom;

	    var geometryType = {
	      LineString: line,
	      MultiLineString: polygon,
	      Polygon: polygon,
	      MultiPolygon: function(arcs) { arcs.forEach(polygon); }
	    };

	    geometry(o);

	    geomsByArc.forEach(arguments.length < 3
	        ? function(geoms) { arcs.push(geoms[0].i); }
	        : function(geoms) { if (filter(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i); });
	  } else {
	    for (var i = 0, n = topology.arcs.length; i < n; ++i) arcs.push(i);
	  }

	  return {type: "MultiLineString", arcs: stitchArcs(topology, arcs)};
	}

	function cartesianTriangleArea(triangle) {
	  var a = triangle[0], b = triangle[1], c = triangle[2];
	  return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]));
	}

	function ring(ring) {
	  var i = -1,
	      n = ring.length,
	      a,
	      b = ring[n - 1],
	      area = 0;

	  while (++i < n) {
	    a = b;
	    b = ring[i];
	    area += a[0] * b[1] - a[1] * b[0];
	  }

	  return area / 2;
	}

	function merge(topology) {
	  return object(topology, mergeArcs.apply(this, arguments));
	}

	function mergeArcs(topology, objects) {
	  var polygonsByArc = {},
	      polygons = [],
	      components = [];

	  objects.forEach(function(o) {
	    if (o.type === "Polygon") register(o.arcs);
	    else if (o.type === "MultiPolygon") o.arcs.forEach(register);
	  });

	  function register(polygon) {
	    polygon.forEach(function(ring$$) {
	      ring$$.forEach(function(arc) {
	        (polygonsByArc[arc = arc < 0 ? ~arc : arc] || (polygonsByArc[arc] = [])).push(polygon);
	      });
	    });
	    polygons.push(polygon);
	  }

	  function area(ring$$) {
	    return Math.abs(ring(object(topology, {type: "Polygon", arcs: [ring$$]}).coordinates[0]));
	  }

	  polygons.forEach(function(polygon) {
	    if (!polygon._) {
	      var component = [],
	          neighbors = [polygon];
	      polygon._ = 1;
	      components.push(component);
	      while (polygon = neighbors.pop()) {
	        component.push(polygon);
	        polygon.forEach(function(ring$$) {
	          ring$$.forEach(function(arc) {
	            polygonsByArc[arc < 0 ? ~arc : arc].forEach(function(polygon) {
	              if (!polygon._) {
	                polygon._ = 1;
	                neighbors.push(polygon);
	              }
	            });
	          });
	        });
	      }
	    }
	  });

	  polygons.forEach(function(polygon) {
	    delete polygon._;
	  });

	  return {
	    type: "MultiPolygon",
	    arcs: components.map(function(polygons) {
	      var arcs = [], n;

	      // Extract the exterior (unique) arcs.
	      polygons.forEach(function(polygon) {
	        polygon.forEach(function(ring$$) {
	          ring$$.forEach(function(arc) {
	            if (polygonsByArc[arc < 0 ? ~arc : arc].length < 2) {
	              arcs.push(arc);
	            }
	          });
	        });
	      });

	      // Stitch the arcs into one or more rings.
	      arcs = stitchArcs(topology, arcs);

	      // If more than one ring is returned,
	      // at most one of these rings can be the exterior;
	      // choose the one with the greatest absolute area.
	      if ((n = arcs.length) > 1) {
	        for (var i = 1, k = area(arcs[0]), ki, t; i < n; ++i) {
	          if ((ki = area(arcs[i])) > k) {
	            t = arcs[0], arcs[0] = arcs[i], arcs[i] = t, k = ki;
	          }
	        }
	      }

	      return arcs;
	    })
	  };
	}

	function neighbors(objects) {
	  var indexesByArc = {}, // arc index -> array of object indexes
	      neighbors = objects.map(function() { return []; });

	  function line(arcs, i) {
	    arcs.forEach(function(a) {
	      if (a < 0) a = ~a;
	      var o = indexesByArc[a];
	      if (o) o.push(i);
	      else indexesByArc[a] = [i];
	    });
	  }

	  function polygon(arcs, i) {
	    arcs.forEach(function(arc) { line(arc, i); });
	  }

	  function geometry(o, i) {
	    if (o.type === "GeometryCollection") o.geometries.forEach(function(o) { geometry(o, i); });
	    else if (o.type in geometryType) geometryType[o.type](o.arcs, i);
	  }

	  var geometryType = {
	    LineString: line,
	    MultiLineString: polygon,
	    Polygon: polygon,
	    MultiPolygon: function(arcs, i) { arcs.forEach(function(arc) { polygon(arc, i); }); }
	  };

	  objects.forEach(geometry);

	  for (var i in indexesByArc) {
	    for (var indexes = indexesByArc[i], m = indexes.length, j = 0; j < m; ++j) {
	      for (var k = j + 1; k < m; ++k) {
	        var ij = indexes[j], ik = indexes[k], n;
	        if ((n = neighbors[ij])[i = bisect(n, ik)] !== ik) n.splice(i, 0, ik);
	        if ((n = neighbors[ik])[i = bisect(n, ij)] !== ij) n.splice(i, 0, ij);
	      }
	    }
	  }

	  return neighbors;
	}

	function compareArea(a, b) {
	  return a[1][2] - b[1][2];
	}

	function minAreaHeap() {
	  var heap = {},
	      array = [],
	      size = 0;

	  heap.push = function(object) {
	    up(array[object._ = size] = object, size++);
	    return size;
	  };

	  heap.pop = function() {
	    if (size <= 0) return;
	    var removed = array[0], object;
	    if (--size > 0) object = array[size], down(array[object._ = 0] = object, 0);
	    return removed;
	  };

	  heap.remove = function(removed) {
	    var i = removed._, object;
	    if (array[i] !== removed) return; // invalid request
	    if (i !== --size) object = array[size], (compareArea(object, removed) < 0 ? up : down)(array[object._ = i] = object, i);
	    return i;
	  };

	  function up(object, i) {
	    while (i > 0) {
	      var j = ((i + 1) >> 1) - 1,
	          parent = array[j];
	      if (compareArea(object, parent) >= 0) break;
	      array[parent._ = i] = parent;
	      array[object._ = i = j] = object;
	    }
	  }

	  function down(object, i) {
	    while (true) {
	      var r = (i + 1) << 1,
	          l = r - 1,
	          j = i,
	          child = array[j];
	      if (l < size && compareArea(array[l], child) < 0) child = array[j = l];
	      if (r < size && compareArea(array[r], child) < 0) child = array[j = r];
	      if (j === i) break;
	      array[child._ = i] = child;
	      array[object._ = i = j] = object;
	    }
	  }

	  return heap;
	}

	function presimplify(topology, triangleArea) {
	  var absolute = transformAbsolute(topology.transform),
	      relative = transformRelative(topology.transform),
	      heap = minAreaHeap();

	  if (!triangleArea) triangleArea = cartesianTriangleArea;

	  topology.arcs.forEach(function(arc) {
	    var triangles = [],
	        maxArea = 0,
	        triangle,
	        i,
	        n,
	        p;

	    // To store each point’s effective area, we create a new array rather than
	    // extending the passed-in point to workaround a Chrome/V8 bug (getting
	    // stuck in smi mode). For midpoints, the initial effective area of
	    // Infinity will be computed in the next step.
	    for (i = 0, n = arc.length; i < n; ++i) {
	      p = arc[i];
	      absolute(arc[i] = [p[0], p[1], Infinity], i);
	    }

	    for (i = 1, n = arc.length - 1; i < n; ++i) {
	      triangle = arc.slice(i - 1, i + 2);
	      triangle[1][2] = triangleArea(triangle);
	      triangles.push(triangle);
	      heap.push(triangle);
	    }

	    for (i = 0, n = triangles.length; i < n; ++i) {
	      triangle = triangles[i];
	      triangle.previous = triangles[i - 1];
	      triangle.next = triangles[i + 1];
	    }

	    while (triangle = heap.pop()) {
	      var previous = triangle.previous,
	          next = triangle.next;

	      // If the area of the current point is less than that of the previous point
	      // to be eliminated, use the latter's area instead. This ensures that the
	      // current point cannot be eliminated without eliminating previously-
	      // eliminated points.
	      if (triangle[1][2] < maxArea) triangle[1][2] = maxArea;
	      else maxArea = triangle[1][2];

	      if (previous) {
	        previous.next = next;
	        previous[2] = triangle[2];
	        update(previous);
	      }

	      if (next) {
	        next.previous = previous;
	        next[0] = triangle[0];
	        update(next);
	      }
	    }

	    arc.forEach(relative);
	  });

	  function update(triangle) {
	    heap.remove(triangle);
	    triangle[1][2] = triangleArea(triangle);
	    heap.push(triangle);
	  }

	  return topology;
	}

	var version = "1.6.27";

	exports.version = version;
	exports.mesh = mesh;
	exports.meshArcs = meshArcs;
	exports.merge = merge;
	exports.mergeArcs = mergeArcs;
	exports.feature = feature;
	exports.neighbors = neighbors;
	exports.presimplify = presimplify;

	Object.defineProperty(exports, '__esModule', { value: true });

	})));

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	
	;(function (name, root, factory) {
	  if (true) {
	    module.exports = factory()
	  }
	  else if (typeof define === 'function' && define.amd) {
	    define(factory)
	  }
	  else {
	    root[name] = factory()
	  }
	}('dcopy', this, function () {
	  /**
	   * Deep copy objects and arrays
	   *
	   * @param {Object/Array} target
	   * @return {Object/Array} copy
	   * @api public
	   */

	  return function (target) {
	    var copy = (target instanceof Array) ? [] : {}
	    ;(function read (target, copy) {
	      for (var key in target) {
	        var obj = target[key]
	        if (obj instanceof Array) {
	          var value = []
	          var last = add(copy, key, value)
	          read(obj, last)
	        }
	        else if (obj instanceof Object && typeof obj !== 'function') {
	          var value = {}
	          var last = add(copy, key, value)
	          read(obj, last)
	        }
	        else {
	          var value = obj
	          add(copy, key, value)
	        }
	      }
	    }(target, copy))
	    return copy
	  }

	  /**
	   * Adds a value to the copy object based on its type
	   *
	   * @api private
	   */

	  function add (copy, key, value) {
	    if (copy instanceof Array) {
	      copy.push(value)
	      return copy[copy.length - 1]
	    }
	    else if (copy instanceof Object) {
	      copy[key] = value
	      return copy[key]
	    }
	  }
	}))


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var transformer = __webpack_require__(36);

	module.exports = function(topology, projection) {
	  var tf = transformer(topology.transform);
	  var x, y, len1, i1, out1;
	  var len2 = topology.arcs.length;
	  var i2 = 0;
	  var projectedArcs = new Array(len2);
	  while (i2 < len2) {
	    x = 0;
	    y = 0;
	    len1 = topology.arcs[i2].length;
	    i1 = 0;
	    out1 = new Array(len1);
	    while (i1 < len1) {
	      topology.arcs[i2][i1][0] = (x += topology.arcs[i2][i1][0]);
	      topology.arcs[i2][i1][1] = (y += topology.arcs[i2][i1][1]);
	      out1[i1] = projection(tf(topology.arcs[i2][i1]));
	      i1++;
	    }
	    projectedArcs[i2++] = out1;
	  }
	  return projectedArcs;
	};



/***/ },
/* 36 */
/***/ function(module, exports) {

	module.exports = function transformer(tf) {
	  var kx = tf.scale[0];
	  var ky = tf.scale[1];
	  var dx = tf.translate[0];
	  var dy = tf.translate[1];

	  var transform = function(c) {
	    return [c[0] * kx + dx, c[1] * ky + dy];
	  };

	  transform.invert = function(c) {
	    return [(c[0] - dx) / kx, (c[1]- dy) / ky];
	  };

	  return transform;
	};


/***/ },
/* 37 */
/***/ function(module, exports) {

	var reverse = function(array, n) {
	  var t;
	  var j = array.length;
	  var i = j - n;
	  while (i < --j) {
	    t = array[i], array[i++] = array[j], array[j] = t;
	  }
	}
	module.exports = function objectify(arcs, o) {
	  function arc(i, points) {
	    if (points.length) {
	      points.pop();
	    }
	    for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
	      points.push(a[k]);
	    }
	    if (i < 0) {
	      reverse(points, n);
	    }
	  }

	  function line(arcs) {
	    var points = [];
	    for (var i = 0, n = arcs.length; i < n; ++i) {
	      arc(arcs[i], points);
	    }
	    return points;
	  }

	  function polygon(arcs) {
	    return arcs.map(line);
	  }

	  function geometry(o) {
	    o = Object.create(o);
	    o.coordinates = geometryType[o.type](o.arcs);
	    return o;
	  }
	  var geometryType = {
	    LineString: line,
	    MultiLineString: polygon,
	    Polygon: polygon,
	    MultiPolygon: function(arcs) {
	      return arcs.map(polygon);
	    }
	  };

	  return o.type === 'GeometryCollection'
	    ? (o = Object.create(o), o.geometries = o.geometries.map(geometry), o)
	    : geometry(o);
	}



/***/ },
/* 38 */
/***/ function(module, exports) {

	module.exports = {
	  cosArctan: function(dx, dy) {
	    var div = dx / dy;
	    return (dy > 0)
	      ? (1 / Math.sqrt(1 + div * div))
	      : (-1 / Math.sqrt(1 + div * div));
	  },
	  sinArctan: function(dx, dy) {
	    var div = dx / dy;
	    return (dy > 0)
	      ? (div / Math.sqrt(1 + div * div))
	      : (-div / Math.sqrt(1 + div * div));
	  }
	};


/***/ },
/* 39 */
/***/ function(module, exports) {

	module.exports = {
	  functor: function(v) {
	    return typeof v === "function" ? v : function() {
	      return v;
	    };
	  }
	};


/***/ },
/* 40 */
/***/ function(module, exports) {

	var timers = {};

	module.exports = {
	  start: function(label) {
	    timers[label] = Date.now();
	  },
	  end: function(label) {
	    var elapsed = Date.now() - timers[label];
	    console.warn(label, ':', elapsed, 'ms');
	  }
	};


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _us110mTopo = __webpack_require__(42);

	var _us110mTopo2 = _interopRequireDefault(_us110mTopo);

	var _ukConstituencyTopo = __webpack_require__(43);

	var _ukConstituencyTopo2 = _interopRequireDefault(_ukConstituencyTopo);

	var _germanyConstituencyTopo = __webpack_require__(44);

	var _germanyConstituencyTopo2 = _interopRequireDefault(_germanyConstituencyTopo);

	var _franceRegionTopo = __webpack_require__(45);

	var _franceRegionTopo2 = _interopRequireDefault(_franceRegionTopo);

	var _franceDepartmentTopo = __webpack_require__(46);

	var _franceDepartmentTopo2 = _interopRequireDefault(_franceDepartmentTopo);

	var _MapResource = __webpack_require__(47);

	var _MapResource2 = _interopRequireDefault(_MapResource);

	var _fipsToState = __webpack_require__(48);

	var _fipsToState2 = _interopRequireDefault(_fipsToState);

	var _fidToConstituency = __webpack_require__(49);

	var _fidToConstituency2 = _interopRequireDefault(_fidToConstituency);

	var _wkrToName = __webpack_require__(50);

	var _wkrToName2 = _interopRequireDefault(_wkrToName);

	var _regionToName = __webpack_require__(51);

	var _regionToName2 = _interopRequireDefault(_regionToName);

	var _departmentToName = __webpack_require__(52);

	var _departmentToName2 = _interopRequireDefault(_departmentToName);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var GeographyResource = function () {
	  function GeographyResource() {
	    _classCallCheck(this, GeographyResource);

	    this._geographies = [{
	      label: 'United States',
	      mapResource: new _MapResource2.default(_us110mTopo2.default, 'states'),
	      geoCodeToName: _fipsToState2.default
	    }, {
	      label: 'United Kingdom - Constituencies',
	      mapResource: new _MapResource2.default(_ukConstituencyTopo2.default, 'constituencies'),
	      geoCodeToName: _fidToConstituency2.default
	    }, {
	      label: 'Germany - Constituencies',
	      mapResource: new _MapResource2.default(_germanyConstituencyTopo2.default, 'constituencies'),
	      geoCodeToName: _wkrToName2.default
	    }, {
	      label: 'France - Regions',
	      mapResource: new _MapResource2.default(_franceRegionTopo2.default, 'regions'),
	      geoCodeToName: _regionToName2.default
	    }, {
	      label: 'France - Departments',
	      mapResource: new _MapResource2.default(_franceDepartmentTopo2.default, 'departments'),
	      geoCodeToName: _departmentToName2.default
	    }];
	  }

	  _createClass(GeographyResource, [{
	    key: 'getMapResource',
	    value: function getMapResource(label) {
	      return this._geographies.find(function (geography) {
	        return geography.label === label;
	      }).mapResource;
	    }
	  }, {
	    key: 'getGeographies',
	    value: function getGeographies() {
	      return this._geographies;
	    }
	  }, {
	    key: 'getGeoCodeHash',
	    value: function getGeoCodeHash(label) {
	      return this._geographies.find(function (geography) {
	        return geography.label === label;
	      }).geoCodeToName;
	    }
	  }]);

	  return GeographyResource;
	}();

	exports.default = new GeographyResource();

/***/ },
/* 42 */
/***/ function(module, exports) {

	module.exports = {
		"type": "Topology",
		"objects": {
			"states": {
				"type": "GeometryCollection",
				"geometries": [
					{
						"type": "Polygon",
						"id": "27",
						"arcs": [
							[
								0,
								1,
								2,
								3,
								4
							]
						]
					},
					{
						"type": "Polygon",
						"id": "30",
						"arcs": [
							[
								5,
								6,
								7,
								8,
								9
							]
						]
					},
					{
						"type": "Polygon",
						"id": "38",
						"arcs": [
							[
								-4,
								10,
								-10,
								11
							]
						]
					},
					{
						"type": "MultiPolygon",
						"id": "15",
						"arcs": [
							[
								[
									12
								]
							],
							[
								[
									13
								]
							],
							[
								[
									14
								]
							],
							[
								[
									15
								]
							],
							[
								[
									16
								]
							]
						]
					},
					{
						"type": "Polygon",
						"id": "16",
						"arcs": [
							[
								17,
								18,
								19,
								20,
								21,
								22,
								-8
							]
						]
					},
					{
						"type": "Polygon",
						"id": "53",
						"arcs": [
							[
								-22,
								23,
								24
							]
						]
					},
					{
						"type": "Polygon",
						"id": "04",
						"arcs": [
							[
								25,
								26,
								27,
								28,
								29
							]
						]
					},
					{
						"type": "Polygon",
						"id": "06",
						"arcs": [
							[
								30,
								-28,
								31,
								32
							]
						]
					},
					{
						"type": "Polygon",
						"id": "08",
						"arcs": [
							[
								33,
								34,
								35,
								36,
								37,
								38
							]
						]
					},
					{
						"type": "Polygon",
						"id": "32",
						"arcs": [
							[
								39,
								-29,
								-31,
								40,
								-20
							]
						]
					},
					{
						"type": "Polygon",
						"id": "35",
						"arcs": [
							[
								41,
								42,
								43,
								-26,
								-36
							]
						]
					},
					{
						"type": "Polygon",
						"id": "41",
						"arcs": [
							[
								-21,
								-41,
								-33,
								44,
								-24
							]
						]
					},
					{
						"type": "Polygon",
						"id": "49",
						"arcs": [
							[
								-37,
								-30,
								-40,
								-19,
								45
							]
						]
					},
					{
						"type": "Polygon",
						"id": "56",
						"arcs": [
							[
								46,
								47,
								-38,
								-46,
								-18,
								-7
							]
						]
					},
					{
						"type": "Polygon",
						"id": "05",
						"arcs": [
							[
								48,
								49,
								50,
								51,
								52,
								53
							]
						]
					},
					{
						"type": "Polygon",
						"id": "19",
						"arcs": [
							[
								54,
								55,
								56,
								57,
								58,
								-2
							]
						]
					},
					{
						"type": "Polygon",
						"id": "20",
						"arcs": [
							[
								59,
								-34,
								60,
								61
							]
						]
					},
					{
						"type": "Polygon",
						"id": "29",
						"arcs": [
							[
								62,
								63,
								64,
								-54,
								65,
								-62,
								66,
								-57
							]
						]
					},
					{
						"type": "Polygon",
						"id": "31",
						"arcs": [
							[
								-58,
								-67,
								-61,
								-39,
								-48,
								67
							]
						]
					},
					{
						"type": "Polygon",
						"id": "40",
						"arcs": [
							[
								-53,
								68,
								-42,
								-35,
								-60,
								-66
							]
						]
					},
					{
						"type": "Polygon",
						"id": "46",
						"arcs": [
							[
								-59,
								-68,
								-47,
								-6,
								-11,
								-3
							]
						]
					},
					{
						"type": "Polygon",
						"id": "22",
						"arcs": [
							[
								69,
								70,
								71,
								72,
								73,
								-51
							]
						]
					},
					{
						"type": "Polygon",
						"id": "48",
						"arcs": [
							[
								-52,
								-74,
								74,
								-43,
								-69
							]
						]
					},
					{
						"type": "Polygon",
						"id": "09",
						"arcs": [
							[
								75,
								76,
								77,
								78,
								79
							]
						]
					},
					{
						"type": "Polygon",
						"id": "25",
						"arcs": [
							[
								80,
								81,
								-78,
								82,
								83,
								84
							]
						]
					},
					{
						"type": "Polygon",
						"id": "33",
						"arcs": [
							[
								85,
								-85,
								86,
								87,
								88
							]
						]
					},
					{
						"type": "Polygon",
						"id": "44",
						"arcs": [
							[
								89,
								-79,
								-82
							]
						]
					},
					{
						"type": "Polygon",
						"id": "50",
						"arcs": [
							[
								-84,
								90,
								91,
								-87
							]
						]
					},
					{
						"type": "Polygon",
						"id": "01",
						"arcs": [
							[
								92,
								93,
								94,
								95,
								96
							]
						]
					},
					{
						"type": "Polygon",
						"id": "12",
						"arcs": [
							[
								97,
								-94,
								98
							]
						]
					},
					{
						"type": "Polygon",
						"id": "13",
						"arcs": [
							[
								99,
								100,
								-99,
								-93,
								101,
								102
							]
						]
					},
					{
						"type": "Polygon",
						"id": "28",
						"arcs": [
							[
								103,
								104,
								-70,
								-50,
								105,
								-96,
								106
							]
						]
					},
					{
						"type": "Polygon",
						"id": "45",
						"arcs": [
							[
								107,
								-100,
								108
							]
						]
					},
					{
						"type": "Polygon",
						"id": "17",
						"arcs": [
							[
								109,
								110,
								111,
								-63,
								-56,
								112
							]
						]
					},
					{
						"type": "Polygon",
						"id": "18",
						"arcs": [
							[
								113,
								114,
								-111,
								115,
								116
							]
						]
					},
					{
						"type": "Polygon",
						"id": "21",
						"arcs": [
							[
								117,
								118,
								119,
								-64,
								-112,
								-115,
								120
							]
						]
					},
					{
						"type": "Polygon",
						"id": "37",
						"arcs": [
							[
								121,
								-109,
								-103,
								122,
								123
							]
						]
					},
					{
						"type": "Polygon",
						"id": "39",
						"arcs": [
							[
								124,
								-121,
								-114,
								125,
								126,
								127
							]
						]
					},
					{
						"type": "Polygon",
						"id": "47",
						"arcs": [
							[
								128,
								-123,
								-102,
								-97,
								-106,
								-49,
								-65,
								-120
							]
						]
					},
					{
						"type": "MultiPolygon",
						"id": "51",
						"arcs": [
							[
								[
									129,
									130,
									131
								]
							],
							[
								[
									132,
									133,
									134,
									135,
									-124,
									-129,
									-119,
									136,
									137,
									138
								]
							]
						]
					},
					{
						"type": "Polygon",
						"id": "55",
						"arcs": [
							[
								139,
								140,
								-113,
								-55,
								-1,
								141
							]
						]
					},
					{
						"type": "Polygon",
						"id": "54",
						"arcs": [
							[
								142,
								143,
								-139,
								144,
								-137,
								-118,
								-125
							]
						]
					},
					{
						"type": "Polygon",
						"id": "10",
						"arcs": [
							[
								145,
								146,
								147,
								148
							]
						]
					},
					{
						"type": "Polygon",
						"id": "11",
						"arcs": [
							[
								-134,
								149
							]
						]
					},
					{
						"type": "Polygon",
						"id": "24",
						"arcs": [
							[
								-148,
								150,
								-132,
								151,
								152,
								-135,
								-150,
								-133,
								-144,
								153
							]
						]
					},
					{
						"type": "Polygon",
						"id": "34",
						"arcs": [
							[
								154,
								-146,
								155,
								156
							]
						]
					},
					{
						"type": "Polygon",
						"id": "36",
						"arcs": [
							[
								-83,
								-77,
								157,
								158,
								-157,
								159,
								160,
								-91
							]
						]
					},
					{
						"type": "Polygon",
						"id": "42",
						"arcs": [
							[
								-156,
								-149,
								-154,
								-143,
								-128,
								161,
								-160
							]
						]
					},
					{
						"type": "Polygon",
						"id": "23",
						"arcs": [
							[
								-89,
								162
							]
						]
					},
					{
						"type": "MultiPolygon",
						"id": "26",
						"arcs": [
							[
								[
									-126,
									-117,
									163
								]
							],
							[
								[
									-140,
									164
								]
							]
						]
					},
					{
						"type": "MultiPolygon",
						"id": "02",
						"arcs": [
							[
								[
									165
								]
							],
							[
								[
									166
								]
							],
							[
								[
									167
								]
							],
							[
								[
									168
								]
							]
						]
					}
				]
			}
		},
		"arcs": [
			[
				[
					7610,
					5300
				],
				[
					-25,
					-11
				],
				[
					1,
					-107
				],
				[
					-3,
					0
				],
				[
					-24,
					-21
				],
				[
					-20,
					-18
				],
				[
					-14,
					-35
				],
				[
					20,
					-36
				],
				[
					-7,
					-48
				],
				[
					0,
					-51
				],
				[
					-3,
					-42
				],
				[
					28,
					-37
				],
				[
					11,
					-2
				],
				[
					31,
					-27
				],
				[
					11,
					-13
				],
				[
					6,
					-20
				],
				[
					24,
					-33
				],
				[
					33,
					-28
				],
				[
					3,
					-16
				],
				[
					0,
					-46
				],
				[
					3,
					-21
				]
			],
			[
				[
					7685,
					4688
				],
				[
					-126,
					3
				],
				[
					-139,
					-1
				],
				[
					-130,
					-3
				],
				[
					-104,
					1
				]
			],
			[
				[
					7186,
					4688
				],
				[
					2,
					178
				],
				[
					-12,
					182
				],
				[
					-17,
					15
				],
				[
					-9,
					30
				],
				[
					5,
					25
				],
				[
					21,
					22
				],
				[
					2,
					27
				]
			],
			[
				[
					7178,
					5167
				],
				[
					0,
					35
				],
				[
					-6,
					29
				],
				[
					-8,
					31
				],
				[
					-5,
					39
				],
				[
					-1,
					43
				],
				[
					-3,
					11
				],
				[
					-4,
					55
				],
				[
					0,
					26
				],
				[
					-2,
					23
				],
				[
					-5,
					39
				],
				[
					-11,
					39
				],
				[
					-11,
					35
				],
				[
					-2,
					34
				],
				[
					-1,
					38
				],
				[
					3,
					24
				],
				[
					1,
					22
				],
				[
					-9,
					27
				],
				[
					-2,
					19
				]
			],
			[
				[
					7112,
					5736
				],
				[
					198,
					0
				],
				[
					0,
					73
				],
				[
					32,
					1
				],
				[
					17,
					-104
				],
				[
					30,
					-33
				],
				[
					66,
					-11
				],
				[
					98,
					-31
				],
				[
					92,
					-59
				],
				[
					78,
					25
				],
				[
					117,
					-50
				],
				[
					-97,
					-63
				],
				[
					-68,
					-76
				],
				[
					-65,
					-80
				],
				[
					0,
					-28
				]
			],
			[
				[
					6464,
					5156
				],
				[
					-5,
					-175
				]
			],
			[
				[
					6459,
					4981
				],
				[
					-159,
					2
				],
				[
					-172,
					-1
				],
				[
					-148,
					2
				],
				[
					-188,
					-1
				],
				[
					0,
					-97
				],
				[
					-1,
					-7
				]
			],
			[
				[
					5791,
					4879
				],
				[
					-11,
					11
				],
				[
					-9,
					26
				],
				[
					-11,
					6
				],
				[
					-13,
					-38
				],
				[
					-22,
					-6
				],
				[
					-54,
					12
				],
				[
					-2,
					-19
				],
				[
					-32,
					7
				],
				[
					-17,
					-27
				],
				[
					-17,
					50
				],
				[
					-12,
					28
				],
				[
					-19,
					4
				],
				[
					-6,
					14
				],
				[
					-6,
					50
				],
				[
					-17,
					24
				],
				[
					-11,
					60
				],
				[
					-11,
					26
				],
				[
					-12,
					6
				],
				[
					-10,
					-27
				],
				[
					-19,
					-23
				],
				[
					-17,
					19
				],
				[
					0,
					49
				],
				[
					11,
					12
				],
				[
					-8,
					49
				],
				[
					9,
					50
				],
				[
					10,
					43
				],
				[
					-28,
					1
				],
				[
					-25,
					28
				],
				[
					-27,
					59
				],
				[
					-15,
					29
				],
				[
					-22,
					19
				],
				[
					-18,
					30
				],
				[
					0,
					34
				],
				[
					-25,
					51
				],
				[
					-8,
					200
				]
			],
			[
				[
					5317,
					5736
				],
				[
					285,
					0
				],
				[
					285,
					1
				],
				[
					285,
					0
				],
				[
					285,
					0
				]
			],
			[
				[
					6457,
					5737
				],
				[
					2,
					-350
				],
				[
					5,
					-231
				]
			],
			[
				[
					7178,
					5167
				],
				[
					-181,
					-10
				],
				[
					-155,
					0
				],
				[
					-196,
					0
				],
				[
					-182,
					-1
				]
			],
			[
				[
					6457,
					5737
				],
				[
					331,
					0
				],
				[
					324,
					-1
				]
			],
			[
				[
					1550,
					32
				],
				[
					-14,
					-32
				],
				[
					-24,
					27
				],
				[
					3,
					54
				],
				[
					-16,
					69
				],
				[
					5,
					21
				],
				[
					17,
					31
				],
				[
					-7,
					38
				],
				[
					6,
					18
				],
				[
					7,
					-4
				],
				[
					36,
					-32
				],
				[
					17,
					-17
				],
				[
					16,
					-25
				],
				[
					24,
					-67
				],
				[
					-2,
					-11
				],
				[
					-38,
					-40
				],
				[
					-30,
					-30
				]
			],
			[
				[
					1499,
					329
				],
				[
					-32,
					-13
				],
				[
					-17,
					40
				],
				[
					-11,
					15
				],
				[
					-1,
					12
				],
				[
					10,
					17
				],
				[
					34,
					-18
				],
				[
					25,
					-30
				],
				[
					-8,
					-23
				]
			],
			[
				[
					1434,
					431
				],
				[
					-3,
					-21
				],
				[
					-51,
					6
				],
				[
					7,
					23
				],
				[
					47,
					-8
				]
			],
			[
				[
					1349,
					459
				],
				[
					-6,
					-11
				],
				[
					-6,
					2
				],
				[
					-34,
					7
				],
				[
					-12,
					43
				],
				[
					-3,
					8
				],
				[
					25,
					26
				],
				[
					8,
					-12
				],
				[
					28,
					-63
				]
			],
			[
				[
					1187,
					585
				],
				[
					-11,
					-19
				],
				[
					-32,
					34
				],
				[
					5,
					14
				],
				[
					14,
					19
				],
				[
					22,
					-4
				],
				[
					2,
					-44
				]
			],
			[
				[
					5791,
					4879
				],
				[
					3,
					-3
				],
				[
					0,
					-474
				]
			],
			[
				[
					5794,
					4402
				],
				[
					-285,
					-2
				]
			],
			[
				[
					5509,
					4400
				],
				[
					-285,
					1
				]
			],
			[
				[
					5224,
					4401
				],
				[
					1,
					343
				],
				[
					8,
					54
				],
				[
					-7,
					25
				],
				[
					-18,
					13
				],
				[
					0,
					30
				],
				[
					13,
					44
				],
				[
					21,
					37
				],
				[
					14,
					62
				],
				[
					12,
					49
				],
				[
					10,
					25
				],
				[
					-5,
					29
				],
				[
					-16,
					15
				],
				[
					-23,
					37
				]
			],
			[
				[
					5234,
					5164
				],
				[
					1,
					34
				],
				[
					-8,
					29
				],
				[
					-3,
					266
				],
				[
					-1,
					243
				]
			],
			[
				[
					5223,
					5736
				],
				[
					94,
					0
				]
			],
			[
				[
					5234,
					5164
				],
				[
					-196,
					-1
				],
				[
					-35,
					-20
				],
				[
					-24,
					8
				],
				[
					-19,
					-15
				],
				[
					-35,
					-21
				],
				[
					-43,
					2
				],
				[
					-22,
					-15
				],
				[
					-20,
					-7
				],
				[
					-15,
					10
				],
				[
					-34,
					8
				],
				[
					-21,
					-6
				],
				[
					-37,
					-20
				],
				[
					-24,
					-1
				],
				[
					-22,
					8
				],
				[
					-7,
					26
				],
				[
					-2,
					32
				],
				[
					-18,
					37
				],
				[
					-28,
					11
				],
				[
					-23,
					17
				],
				[
					-29,
					1
				],
				[
					-21,
					0
				]
			],
			[
				[
					4559,
					5218
				],
				[
					-8,
					111
				],
				[
					-30,
					163
				],
				[
					-28,
					89
				],
				[
					12,
					37
				],
				[
					138,
					-65
				],
				[
					50,
					-180
				],
				[
					24,
					50
				],
				[
					-15,
					157
				],
				[
					-33,
					156
				],
				[
					271,
					0
				],
				[
					283,
					0
				]
			],
			[
				[
					5985,
					3448
				],
				[
					0,
					-1079
				]
			],
			[
				[
					5985,
					2369
				],
				[
					-189,
					-1
				],
				[
					-217,
					134
				],
				[
					-144,
					93
				],
				[
					9,
					37
				]
			],
			[
				[
					5444,
					2632
				],
				[
					12,
					-1
				],
				[
					11,
					38
				],
				[
					-17,
					27
				],
				[
					-3,
					28
				],
				[
					-5,
					34
				],
				[
					18,
					44
				],
				[
					8,
					87
				],
				[
					29,
					39
				],
				[
					-18,
					37
				],
				[
					-13,
					36
				],
				[
					-8,
					33
				],
				[
					-5,
					26
				],
				[
					-2,
					17
				]
			],
			[
				[
					5451,
					3077
				],
				[
					6,
					37
				],
				[
					-5,
					38
				],
				[
					-2,
					37
				],
				[
					0,
					41
				],
				[
					-8,
					26
				],
				[
					6,
					23
				],
				[
					21,
					0
				],
				[
					18,
					-13
				],
				[
					13,
					-8
				],
				[
					6,
					29
				],
				[
					4,
					7
				],
				[
					0,
					153
				]
			],
			[
				[
					5510,
					3447
				],
				[
					153,
					3
				],
				[
					184,
					-1
				],
				[
					138,
					-1
				]
			],
			[
				[
					4940,
					4400
				],
				[
					0,
					-572
				],
				[
					180,
					-257
				],
				[
					171,
					-252
				],
				[
					160,
					-242
				]
			],
			[
				[
					5444,
					2632
				],
				[
					-121,
					-21
				],
				[
					-109,
					-14
				],
				[
					-16,
					97
				],
				[
					-62,
					110
				],
				[
					-44,
					23
				],
				[
					-11,
					54
				],
				[
					-53,
					10
				],
				[
					-34,
					51
				],
				[
					-89,
					19
				],
				[
					-24,
					31
				],
				[
					-12,
					105
				],
				[
					-92,
					191
				],
				[
					-80,
					265
				],
				[
					4,
					44
				],
				[
					-43,
					63
				],
				[
					-73,
					160
				],
				[
					-14,
					156
				],
				[
					-50,
					104
				],
				[
					21,
					158
				],
				[
					-4,
					163
				]
			],
			[
				[
					4538,
					4401
				],
				[
					402,
					-1
				]
			],
			[
				[
					6652,
					4020
				],
				[
					1,
					-294
				],
				[
					0,
					-279
				]
			],
			[
				[
					6653,
					3447
				],
				[
					-92,
					0
				]
			],
			[
				[
					6561,
					3447
				],
				[
					-114,
					0
				],
				[
					-162,
					1
				],
				[
					-151,
					0
				],
				[
					-149,
					0
				]
			],
			[
				[
					5985,
					3448
				],
				[
					-1,
					763
				]
			],
			[
				[
					5984,
					4211
				],
				[
					96,
					0
				],
				[
					95,
					0
				],
				[
					191,
					0
				],
				[
					96,
					0
				]
			],
			[
				[
					6462,
					4211
				],
				[
					191,
					0
				],
				[
					-1,
					-185
				],
				[
					0,
					-6
				]
			],
			[
				[
					5509,
					4400
				],
				[
					1,
					-953
				]
			],
			[
				[
					4940,
					4400
				],
				[
					284,
					1
				]
			],
			[
				[
					6561,
					3447
				],
				[
					1,
					-94
				]
			],
			[
				[
					6562,
					3353
				],
				[
					0,
					-500
				],
				[
					0,
					-358
				],
				[
					-89,
					0
				],
				[
					-172,
					0
				],
				[
					-86,
					0
				],
				[
					1,
					-17
				],
				[
					11,
					-30
				]
			],
			[
				[
					6227,
					2448
				],
				[
					-165,
					0
				],
				[
					0,
					-79
				],
				[
					-77,
					0
				]
			],
			[
				[
					4538,
					4401
				],
				[
					-30,
					146
				],
				[
					37,
					180
				],
				[
					23,
					346
				],
				[
					-9,
					145
				]
			],
			[
				[
					5794,
					4402
				],
				[
					-1,
					-186
				],
				[
					191,
					-5
				]
			],
			[
				[
					6459,
					4981
				],
				[
					2,
					-389
				]
			],
			[
				[
					6461,
					4592
				],
				[
					1,
					-381
				]
			],
			[
				[
					7834,
					3262
				],
				[
					-1,
					-16
				],
				[
					-10,
					-27
				],
				[
					-17,
					-18
				],
				[
					-3,
					-32
				],
				[
					-15,
					-25
				],
				[
					1,
					-56
				],
				[
					-11,
					-17
				]
			],
			[
				[
					7778,
					3071
				],
				[
					-2,
					-15
				],
				[
					-17,
					-15
				],
				[
					0,
					-27
				],
				[
					-13,
					-51
				],
				[
					-11,
					-11
				],
				[
					-17,
					-26
				],
				[
					-10,
					-39
				],
				[
					-21,
					-67
				],
				[
					-2,
					-45
				],
				[
					11,
					-50
				],
				[
					-5,
					-38
				]
			],
			[
				[
					7691,
					2687
				],
				[
					-80,
					7
				],
				[
					-104,
					-7
				],
				[
					-92,
					1
				]
			],
			[
				[
					7415,
					2688
				],
				[
					5,
					108
				],
				[
					-22,
					1
				],
				[
					-19,
					-3
				],
				[
					-5,
					13
				]
			],
			[
				[
					7374,
					2807
				],
				[
					3,
					166
				],
				[
					2,
					186
				],
				[
					-19,
					201
				]
			],
			[
				[
					7360,
					3360
				],
				[
					116,
					-2
				],
				[
					106,
					-1
				],
				[
					100,
					0
				],
				[
					109,
					-12
				],
				[
					8,
					-23
				],
				[
					-11,
					-21
				],
				[
					-10,
					-20
				],
				[
					-6,
					-19
				],
				[
					62,
					0
				]
			],
			[
				[
					7685,
					4688
				],
				[
					1,
					-11
				],
				[
					12,
					-30
				],
				[
					-8,
					-14
				],
				[
					0,
					-41
				],
				[
					4,
					-17
				],
				[
					6,
					-30
				],
				[
					31,
					-18
				],
				[
					10,
					-29
				]
			],
			[
				[
					7741,
					4498
				],
				[
					5,
					-15
				],
				[
					11,
					-9
				],
				[
					5,
					-21
				],
				[
					15,
					-15
				],
				[
					10,
					-17
				],
				[
					-5,
					-51
				],
				[
					-18,
					-43
				],
				[
					-6,
					-14
				],
				[
					-22,
					-11
				],
				[
					-33,
					-9
				],
				[
					-8,
					-33
				],
				[
					11,
					-15
				],
				[
					4,
					-30
				],
				[
					-12,
					-33
				],
				[
					-6,
					-29
				],
				[
					-25,
					-28
				],
				[
					-2,
					-35
				]
			],
			[
				[
					7665,
					4090
				],
				[
					-13,
					16
				],
				[
					-18,
					31
				],
				[
					-104,
					-4
				],
				[
					-110,
					-1
				],
				[
					-85,
					-1
				],
				[
					-86,
					0
				]
			],
			[
				[
					7249,
					4131
				],
				[
					-6,
					35
				],
				[
					2,
					34
				],
				[
					-2,
					33
				],
				[
					-10,
					55
				],
				[
					-6,
					23
				],
				[
					-7,
					6
				],
				[
					-1,
					44
				],
				[
					-6,
					32
				],
				[
					-17,
					35
				],
				[
					0,
					16
				],
				[
					-6,
					32
				],
				[
					-4,
					19
				]
			],
			[
				[
					7186,
					4495
				],
				[
					0,
					17
				],
				[
					-15,
					21
				],
				[
					7,
					32
				],
				[
					5,
					30
				],
				[
					3,
					21
				],
				[
					-13,
					25
				],
				[
					1,
					47
				],
				[
					12,
					0
				]
			],
			[
				[
					7361,
					3448
				],
				[
					-84,
					0
				],
				[
					-172,
					0
				],
				[
					-171,
					-1
				],
				[
					-96,
					0
				],
				[
					-95,
					0
				],
				[
					-90,
					0
				]
			],
			[
				[
					6652,
					4020
				],
				[
					1,
					0
				],
				[
					166,
					0
				],
				[
					124,
					0
				],
				[
					220,
					0
				],
				[
					131,
					0
				]
			],
			[
				[
					7294,
					4020
				],
				[
					23,
					-25
				],
				[
					12,
					0
				],
				[
					3,
					-27
				],
				[
					-14,
					-36
				],
				[
					8,
					-18
				],
				[
					11,
					-40
				],
				[
					26,
					-18
				],
				[
					-1,
					-204
				],
				[
					-1,
					-204
				]
			],
			[
				[
					7665,
					4090
				],
				[
					-8,
					-47
				],
				[
					9,
					-57
				],
				[
					15,
					-39
				],
				[
					19,
					-33
				],
				[
					21,
					-25
				],
				[
					9,
					-9
				],
				[
					8,
					-36
				],
				[
					2,
					-32
				],
				[
					11,
					-8
				],
				[
					18,
					12
				],
				[
					18,
					-31
				],
				[
					-6,
					-35
				],
				[
					-8,
					-28
				],
				[
					-7,
					-33
				],
				[
					14,
					-29
				],
				[
					19,
					-27
				],
				[
					11,
					0
				],
				[
					25,
					-42
				],
				[
					9,
					-6
				],
				[
					7,
					-46
				],
				[
					-3,
					-29
				],
				[
					12,
					-46
				],
				[
					10,
					5
				],
				[
					17,
					-30
				]
			],
			[
				[
					7887,
					3439
				],
				[
					-3,
					-19
				],
				[
					2,
					-30
				],
				[
					-15,
					-16
				],
				[
					-21,
					-20
				]
			],
			[
				[
					7850,
					3354
				],
				[
					-3,
					-19
				],
				[
					-6,
					-27
				],
				[
					-7,
					-46
				]
			],
			[
				[
					7360,
					3360
				],
				[
					1,
					88
				]
			],
			[
				[
					7294,
					4020
				],
				[
					-12,
					41
				],
				[
					-15,
					24
				],
				[
					-16,
					31
				],
				[
					-2,
					15
				]
			],
			[
				[
					6461,
					4592
				],
				[
					187,
					0
				],
				[
					143,
					0
				],
				[
					191,
					0
				],
				[
					25,
					-24
				],
				[
					35,
					-15
				],
				[
					8,
					9
				],
				[
					23,
					-1
				],
				[
					34,
					2
				],
				[
					24,
					-25
				],
				[
					26,
					-16
				],
				[
					5,
					-16
				],
				[
					8,
					-9
				],
				[
					16,
					-2
				]
			],
			[
				[
					7374,
					2807
				],
				[
					-41,
					37
				],
				[
					-26,
					20
				],
				[
					-22,
					-13
				],
				[
					-34,
					2
				],
				[
					-19,
					0
				],
				[
					-17,
					-16
				],
				[
					-16,
					-7
				],
				[
					-14,
					9
				],
				[
					-32,
					-10
				],
				[
					-14,
					31
				],
				[
					-15,
					-27
				],
				[
					-26,
					12
				],
				[
					-27,
					30
				],
				[
					-28,
					-19
				],
				[
					-13,
					46
				],
				[
					-44,
					-5
				],
				[
					-29,
					10
				],
				[
					-32,
					14
				],
				[
					-14,
					39
				],
				[
					-25,
					-12
				],
				[
					-15,
					15
				],
				[
					-23,
					21
				],
				[
					0,
					182
				],
				[
					0,
					187
				],
				[
					-96,
					0
				],
				[
					-95,
					0
				],
				[
					-95,
					0
				]
			],
			[
				[
					7691,
					2687
				],
				[
					7,
					-11
				],
				[
					-8,
					-27
				],
				[
					13,
					-39
				],
				[
					-4,
					-24
				],
				[
					13,
					-33
				],
				[
					-13,
					-19
				],
				[
					-5,
					-36
				],
				[
					-18,
					-30
				],
				[
					-9,
					-40
				],
				[
					-9,
					-46
				],
				[
					-11,
					-21
				],
				[
					4,
					-48
				],
				[
					84,
					-6
				],
				[
					90,
					0
				],
				[
					-3,
					-32
				],
				[
					-6,
					-31
				],
				[
					6,
					-24
				],
				[
					12,
					-23
				],
				[
					4,
					-31
				]
			],
			[
				[
					7838,
					2166
				],
				[
					1,
					-19
				],
				[
					1,
					-3
				]
			],
			[
				[
					7840,
					2144
				],
				[
					1,
					0
				]
			],
			[
				[
					7841,
					2144
				],
				[
					17,
					-51
				],
				[
					-2,
					-77
				],
				[
					20,
					-38
				],
				[
					-18,
					-25
				],
				[
					-35,
					28
				],
				[
					-36,
					-36
				],
				[
					-69,
					6
				],
				[
					-71,
					101
				],
				[
					-84,
					-24
				],
				[
					-69,
					44
				],
				[
					-59,
					-13
				]
			],
			[
				[
					7435,
					2059
				],
				[
					-7,
					20
				],
				[
					10,
					28
				],
				[
					14,
					26
				],
				[
					0,
					38
				],
				[
					-7,
					12
				],
				[
					9,
					46
				],
				[
					6,
					20
				],
				[
					9,
					70
				],
				[
					-9,
					26
				],
				[
					-11,
					44
				],
				[
					-8,
					44
				],
				[
					-5,
					29
				],
				[
					-16,
					22
				],
				[
					-5,
					204
				]
			],
			[
				[
					7435,
					2059
				],
				[
					-81,
					-45
				],
				[
					-86,
					-141
				],
				[
					-95,
					-82
				],
				[
					-52,
					-91
				],
				[
					-22,
					-86
				],
				[
					-1,
					-132
				],
				[
					5,
					-91
				],
				[
					18,
					-65
				],
				[
					-38,
					-6
				],
				[
					-67,
					42
				],
				[
					-75,
					59
				],
				[
					-26,
					90
				],
				[
					-21,
					133
				],
				[
					-57,
					109
				],
				[
					-33,
					112
				],
				[
					-47,
					130
				],
				[
					-68,
					76
				],
				[
					-78,
					-3
				],
				[
					-60,
					-151
				],
				[
					-79,
					57
				],
				[
					-49,
					58
				],
				[
					-24,
					105
				],
				[
					-32,
					99
				],
				[
					-56,
					84
				],
				[
					-49,
					60
				],
				[
					-35,
					68
				]
			],
			[
				[
					9361,
					4202
				],
				[
					0,
					6
				]
			],
			[
				[
					9361,
					4208
				],
				[
					-4,
					23
				],
				[
					21,
					19
				],
				[
					-7,
					16
				],
				[
					5,
					146
				]
			],
			[
				[
					9376,
					4412
				],
				[
					73,
					-4
				],
				[
					89,
					-4
				]
			],
			[
				[
					9538,
					4404
				],
				[
					0,
					-104
				],
				[
					-5,
					-28
				]
			],
			[
				[
					9533,
					4272
				],
				[
					-42,
					-10
				],
				[
					-56,
					-9
				],
				[
					-73,
					-51
				],
				[
					-1,
					0
				]
			],
			[
				[
					9632,
					4566
				],
				[
					-1,
					-101
				],
				[
					31,
					-101
				],
				[
					40,
					-5
				],
				[
					-10,
					70
				],
				[
					28,
					-42
				],
				[
					-7,
					-55
				],
				[
					-65,
					-31
				],
				[
					-45,
					4
				]
			],
			[
				[
					9603,
					4305
				],
				[
					-3,
					29
				],
				[
					-15,
					22
				],
				[
					-7,
					50
				],
				[
					-40,
					-2
				]
			],
			[
				[
					9376,
					4412
				],
				[
					20,
					131
				]
			],
			[
				[
					9396,
					4543
				],
				[
					79,
					-3
				]
			],
			[
				[
					9475,
					4540
				],
				[
					115,
					-2
				],
				[
					10,
					19
				],
				[
					20,
					13
				],
				[
					12,
					-4
				]
			],
			[
				[
					9648,
					4609
				],
				[
					-16,
					-43
				]
			],
			[
				[
					9475,
					4540
				],
				[
					-8,
					20
				],
				[
					8,
					25
				],
				[
					2,
					50
				],
				[
					3,
					11
				],
				[
					3,
					46
				],
				[
					11,
					38
				],
				[
					8,
					16
				],
				[
					11,
					45
				],
				[
					2,
					31
				],
				[
					3,
					19
				],
				[
					19,
					9
				],
				[
					21,
					22
				],
				[
					4,
					24
				],
				[
					-7,
					27
				],
				[
					11,
					52
				]
			],
			[
				[
					9566,
					4975
				],
				[
					9,
					47
				],
				[
					31,
					10
				]
			],
			[
				[
					9606,
					5032
				],
				[
					13,
					-351
				],
				[
					-3,
					-19
				],
				[
					17,
					-28
				],
				[
					5,
					-27
				],
				[
					10,
					2
				]
			],
			[
				[
					9603,
					4305
				],
				[
					-70,
					-33
				]
			],
			[
				[
					9396,
					4543
				],
				[
					4,
					157
				],
				[
					-13,
					2
				],
				[
					-2,
					7
				],
				[
					6,
					28
				],
				[
					-9,
					50
				],
				[
					10,
					39
				],
				[
					-5,
					29
				],
				[
					-3,
					57
				],
				[
					4,
					24
				],
				[
					2,
					39
				]
			],
			[
				[
					9390,
					4975
				],
				[
					176,
					0
				]
			],
			[
				[
					8219,
					3064
				],
				[
					25,
					-237
				],
				[
					22,
					-189
				],
				[
					14,
					-60
				],
				[
					8,
					-34
				],
				[
					-15,
					-33
				],
				[
					-6,
					-61
				],
				[
					5,
					-36
				],
				[
					-2,
					-34
				],
				[
					-3,
					-31
				],
				[
					6,
					-24
				],
				[
					5,
					-23
				]
			],
			[
				[
					8278,
					2302
				],
				[
					-194,
					-1
				],
				[
					-55,
					-11
				],
				[
					-1,
					-14
				],
				[
					21,
					-47
				],
				[
					-5,
					-37
				],
				[
					-7,
					-26
				]
			],
			[
				[
					8037,
					2166
				],
				[
					-84,
					21
				]
			],
			[
				[
					7953,
					2187
				],
				[
					-3,
					291
				],
				[
					16,
					305
				],
				[
					17,
					247
				],
				[
					-6,
					37
				]
			],
			[
				[
					7977,
					3067
				],
				[
					120,
					0
				],
				[
					122,
					-3
				]
			],
			[
				[
					8613,
					2253
				],
				[
					17,
					-133
				],
				[
					32,
					-163
				],
				[
					43,
					-135
				],
				[
					0,
					-82
				],
				[
					45,
					-222
				],
				[
					-3,
					-128
				],
				[
					-4,
					-74
				],
				[
					-24,
					-117
				],
				[
					-28,
					-24
				],
				[
					-47,
					23
				],
				[
					-15,
					84
				],
				[
					-37,
					44
				],
				[
					-50,
					164
				],
				[
					-44,
					146
				],
				[
					-15,
					74
				],
				[
					20,
					127
				],
				[
					-27,
					105
				],
				[
					-74,
					159
				],
				[
					-37,
					30
				],
				[
					-97,
					-87
				],
				[
					-17,
					10
				],
				[
					-46,
					88
				],
				[
					-60,
					48
				],
				[
					-108,
					-24
				]
			],
			[
				[
					8278,
					2302
				],
				[
					15,
					-51
				],
				[
					96,
					-9
				],
				[
					154,
					-28
				],
				[
					7,
					-34
				],
				[
					13,
					17
				],
				[
					0,
					67
				],
				[
					11,
					6
				],
				[
					19,
					-14
				],
				[
					20,
					-3
				]
			],
			[
				[
					8462,
					3063
				],
				[
					-10,
					-16
				],
				[
					-16,
					-36
				],
				[
					26,
					-32
				],
				[
					17,
					-12
				],
				[
					17,
					-60
				],
				[
					12,
					-34
				],
				[
					33,
					-45
				],
				[
					7,
					-24
				],
				[
					22,
					-31
				],
				[
					11,
					-45
				],
				[
					31,
					-39
				],
				[
					7,
					-43
				],
				[
					5,
					-21
				],
				[
					-3,
					-14
				],
				[
					18,
					-21
				],
				[
					9,
					-36
				],
				[
					0,
					-36
				],
				[
					9,
					-7
				],
				[
					16,
					-10
				]
			],
			[
				[
					8673,
					2501
				],
				[
					-45,
					-113
				],
				[
					-15,
					-135
				]
			],
			[
				[
					8219,
					3064
				],
				[
					74,
					-2
				],
				[
					50,
					2
				]
			],
			[
				[
					8343,
					3064
				],
				[
					119,
					-1
				]
			],
			[
				[
					7841,
					2144
				],
				[
					-1,
					0
				]
			],
			[
				[
					7840,
					2144
				],
				[
					-2,
					22
				]
			],
			[
				[
					7778,
					3071
				],
				[
					94,
					0
				],
				[
					105,
					-4
				]
			],
			[
				[
					7953,
					2187
				],
				[
					-73,
					-13
				],
				[
					-39,
					-30
				]
			],
			[
				[
					8894,
					2850
				],
				[
					-49,
					-70
				],
				[
					-13,
					-64
				],
				[
					-105,
					-124
				],
				[
					-54,
					-91
				]
			],
			[
				[
					8462,
					3063
				],
				[
					10,
					5
				],
				[
					51,
					33
				],
				[
					88,
					-2
				],
				[
					45,
					-8
				],
				[
					1,
					-17
				],
				[
					9,
					12
				],
				[
					15,
					-32
				],
				[
					0,
					-22
				],
				[
					106,
					-2
				],
				[
					107,
					-180
				]
			],
			[
				[
					8011,
					4496
				],
				[
					1,
					-50
				],
				[
					26,
					-100
				]
			],
			[
				[
					8038,
					4346
				],
				[
					0,
					-221
				],
				[
					0,
					-221
				],
				[
					-11,
					-53
				],
				[
					7,
					-14
				],
				[
					6,
					-33
				],
				[
					-1,
					-25
				],
				[
					-8,
					-12
				],
				[
					-7,
					-31
				],
				[
					-20,
					-42
				],
				[
					-13,
					-51
				],
				[
					-3,
					-39
				]
			],
			[
				[
					7988,
					3604
				],
				[
					0,
					-14
				],
				[
					-10,
					-26
				],
				[
					8,
					-18
				],
				[
					-17,
					-14
				],
				[
					-22,
					-16
				],
				[
					4,
					-42
				],
				[
					-13,
					-16
				],
				[
					-23,
					18
				],
				[
					-25,
					10
				],
				[
					-6,
					-18
				],
				[
					3,
					-29
				]
			],
			[
				[
					7741,
					4498
				],
				[
					97,
					0
				],
				[
					100,
					-1
				],
				[
					73,
					-1
				]
			],
			[
				[
					8297,
					4340
				],
				[
					0,
					-173
				],
				[
					-1,
					-185
				],
				[
					0,
					-132
				]
			],
			[
				[
					8296,
					3850
				],
				[
					-6,
					-9
				],
				[
					8,
					-39
				],
				[
					-4,
					-14
				],
				[
					-16,
					-1
				],
				[
					-15,
					-17
				],
				[
					-23,
					7
				],
				[
					-2,
					-36
				],
				[
					-13,
					-14
				],
				[
					-13,
					-33
				],
				[
					-13,
					-6
				],
				[
					-21,
					-57
				],
				[
					-20,
					17
				],
				[
					-6,
					23
				],
				[
					-16,
					-38
				],
				[
					-11,
					-21
				],
				[
					-20,
					22
				],
				[
					-22,
					-18
				],
				[
					-8,
					-19
				],
				[
					-29,
					30
				],
				[
					-20,
					-21
				],
				[
					-25,
					14
				],
				[
					-1,
					-21
				],
				[
					-12,
					5
				]
			],
			[
				[
					8038,
					4346
				],
				[
					8,
					-13
				],
				[
					33,
					1
				],
				[
					26,
					21
				]
			],
			[
				[
					8105,
					4355
				],
				[
					102,
					-1
				],
				[
					90,
					1
				],
				[
					0,
					-15
				]
			],
			[
				[
					8509,
					3718
				],
				[
					1,
					-18
				],
				[
					-1,
					-40
				],
				[
					12,
					-29
				],
				[
					4,
					-29
				],
				[
					14,
					-25
				],
				[
					10,
					-23
				],
				[
					18,
					-4
				]
			],
			[
				[
					8567,
					3550
				],
				[
					-9,
					-14
				],
				[
					-29,
					-43
				],
				[
					-29,
					-22
				],
				[
					-3,
					-15
				],
				[
					-10,
					-20
				],
				[
					-25,
					-22
				],
				[
					-1,
					-1
				],
				[
					-1,
					-2
				],
				[
					-8,
					-17
				],
				[
					-14,
					-8
				],
				[
					-5,
					-3
				],
				[
					-28,
					-11
				]
			],
			[
				[
					8405,
					3372
				],
				[
					-64,
					-7
				],
				[
					-84,
					9
				],
				[
					-28,
					-3
				],
				[
					-55,
					6
				],
				[
					-55,
					1
				],
				[
					-52,
					1
				],
				[
					-59,
					-5
				],
				[
					-3,
					9
				],
				[
					-19,
					-1
				],
				[
					0,
					-30
				],
				[
					-136,
					2
				]
			],
			[
				[
					8296,
					3850
				],
				[
					32,
					-5
				],
				[
					17,
					-18
				],
				[
					25,
					-43
				],
				[
					21,
					-14
				],
				[
					14,
					-15
				],
				[
					23,
					5
				],
				[
					17,
					-11
				],
				[
					20,
					11
				],
				[
					18,
					3
				],
				[
					8,
					-27
				],
				[
					18,
					-18
				]
			],
			[
				[
					9150,
					3362
				],
				[
					13,
					-190
				],
				[
					-61,
					-142
				],
				[
					-98,
					-56
				],
				[
					-63,
					-112
				],
				[
					-47,
					-12
				]
			],
			[
				[
					8343,
					3064
				],
				[
					3,
					41
				],
				[
					20,
					12
				],
				[
					6,
					20
				],
				[
					14,
					23
				],
				[
					19,
					5
				],
				[
					23,
					9
				],
				[
					21,
					16
				],
				[
					10,
					17
				],
				[
					18,
					16
				],
				[
					0,
					13
				],
				[
					24,
					26
				],
				[
					7,
					-17
				],
				[
					35,
					36
				],
				[
					17,
					-3
				],
				[
					15,
					32
				],
				[
					19,
					8
				],
				[
					-1,
					27
				],
				[
					2,
					24
				]
			],
			[
				[
					8595,
					3369
				],
				[
					161,
					-8
				],
				[
					190,
					-1
				],
				[
					101,
					1
				],
				[
					91,
					1
				],
				[
					12,
					0
				]
			],
			[
				[
					8706,
					4142
				],
				[
					-13,
					-9
				],
				[
					4,
					-25
				],
				[
					-5,
					-43
				],
				[
					-9,
					-50
				],
				[
					-10,
					-41
				],
				[
					-1,
					-20
				],
				[
					-26,
					-43
				],
				[
					-11,
					-10
				],
				[
					-13,
					-5
				],
				[
					-12,
					4
				],
				[
					-21,
					-33
				],
				[
					-4,
					-34
				],
				[
					-3,
					-19
				],
				[
					-8,
					-7
				],
				[
					-1,
					21
				],
				[
					-13,
					5
				],
				[
					-14,
					-42
				],
				[
					-1,
					-42
				],
				[
					-13,
					-26
				],
				[
					-23,
					-5
				]
			],
			[
				[
					8297,
					4340
				],
				[
					49,
					1
				],
				[
					43,
					0
				],
				[
					36,
					2
				]
			],
			[
				[
					8425,
					4343
				],
				[
					59,
					-39
				],
				[
					48,
					-10
				],
				[
					69,
					25
				],
				[
					56,
					53
				],
				[
					49,
					26
				]
			],
			[
				[
					8706,
					4398
				],
				[
					0,
					-256
				]
			],
			[
				[
					8405,
					3372
				],
				[
					142,
					-7
				],
				[
					11,
					1
				],
				[
					37,
					3
				]
			],
			[
				[
					9197,
					3642
				],
				[
					-54,
					-153
				],
				[
					-9,
					8
				],
				[
					30,
					130
				]
			],
			[
				[
					9164,
					3627
				],
				[
					10,
					12
				]
			],
			[
				[
					9174,
					3639
				],
				[
					23,
					3
				]
			],
			[
				[
					8973,
					3891
				],
				[
					2,
					-1
				],
				[
					12,
					-6
				],
				[
					12,
					-14
				],
				[
					-5,
					-16
				],
				[
					-2,
					-4
				],
				[
					21,
					-12
				],
				[
					17,
					-21
				]
			],
			[
				[
					9030,
					3817
				],
				[
					8,
					-17
				],
				[
					0,
					-11
				]
			],
			[
				[
					9038,
					3789
				],
				[
					-2,
					-15
				],
				[
					-4,
					-4
				],
				[
					-12,
					-14
				],
				[
					-11,
					-43
				],
				[
					13,
					-10
				],
				[
					15,
					8
				],
				[
					5,
					-21
				],
				[
					1,
					-6
				]
			],
			[
				[
					9043,
					3684
				],
				[
					65,
					-61
				],
				[
					4,
					-181
				],
				[
					28,
					-14
				],
				[
					10,
					-66
				]
			],
			[
				[
					8567,
					3550
				],
				[
					5,
					-32
				],
				[
					8,
					-14
				],
				[
					2,
					-3
				],
				[
					15,
					-16
				],
				[
					22,
					17
				],
				[
					8,
					6
				],
				[
					11,
					-13
				],
				[
					30,
					13
				],
				[
					6,
					3
				],
				[
					1,
					10
				],
				[
					1,
					7
				],
				[
					11,
					-7
				],
				[
					11,
					13
				],
				[
					1,
					1
				],
				[
					13,
					-3
				],
				[
					15,
					15
				],
				[
					1,
					10
				],
				[
					1,
					7
				],
				[
					-1,
					23
				],
				[
					13,
					33
				],
				[
					18,
					25
				],
				[
					5,
					28
				],
				[
					9,
					19
				],
				[
					7,
					15
				],
				[
					9,
					41
				]
			],
			[
				[
					8789,
					3748
				],
				[
					13,
					-14
				],
				[
					14,
					-14
				]
			],
			[
				[
					8816,
					3720
				],
				[
					14,
					7
				],
				[
					4,
					18
				],
				[
					10,
					23
				],
				[
					6,
					17
				],
				[
					4,
					10
				],
				[
					7,
					-8
				],
				[
					14,
					25
				],
				[
					11,
					15
				],
				[
					8,
					10
				],
				[
					3,
					5
				],
				[
					9,
					14
				],
				[
					6,
					40
				],
				[
					1,
					11
				],
				[
					45,
					-47
				],
				[
					4,
					-5
				],
				[
					11,
					36
				]
			],
			[
				[
					7763,
					5275
				],
				[
					1,
					-1
				],
				[
					6,
					4
				],
				[
					0,
					-1
				],
				[
					15,
					-6
				],
				[
					8,
					-34
				],
				[
					83,
					-34
				],
				[
					55,
					-35
				],
				[
					27,
					0
				],
				[
					19,
					-2
				],
				[
					5,
					-32
				],
				[
					22,
					-12
				],
				[
					9,
					-27
				],
				[
					-6,
					-15
				],
				[
					-4,
					-31
				],
				[
					21,
					-2
				],
				[
					-7,
					-30
				],
				[
					12,
					-23
				],
				[
					3,
					-1
				]
			],
			[
				[
					8032,
					4993
				],
				[
					-1,
					-2
				],
				[
					-37,
					-68
				],
				[
					13,
					-23
				],
				[
					70,
					123
				],
				[
					14,
					1
				],
				[
					-49,
					-147
				],
				[
					-22,
					-133
				],
				[
					-18,
					-108
				],
				[
					12,
					-93
				],
				[
					-3,
					-47
				]
			],
			[
				[
					7610,
					5300
				],
				[
					95,
					39
				],
				[
					58,
					-64
				]
			],
			[
				[
					8706,
					4142
				],
				[
					0,
					-175
				],
				[
					99,
					0
				]
			],
			[
				[
					8805,
					3967
				],
				[
					0,
					-97
				],
				[
					14,
					17
				],
				[
					17,
					22
				],
				[
					19,
					8
				],
				[
					12,
					20
				],
				[
					28,
					-8
				],
				[
					11,
					14
				],
				[
					18,
					15
				],
				[
					30,
					-16
				],
				[
					11,
					-27
				],
				[
					8,
					-24
				]
			],
			[
				[
					8816,
					3720
				],
				[
					-14,
					14
				],
				[
					-13,
					14
				]
			],
			[
				[
					9194,
					3981
				],
				[
					-14,
					-20
				],
				[
					2,
					-37
				]
			],
			[
				[
					9182,
					3924
				],
				[
					20,
					-102
				],
				[
					24,
					-34
				],
				[
					2,
					-64
				]
			],
			[
				[
					9228,
					3724
				],
				[
					-64,
					0
				],
				[
					-7,
					243
				]
			],
			[
				[
					9157,
					3967
				],
				[
					8,
					15
				],
				[
					8,
					9
				],
				[
					21,
					-10
				]
			],
			[
				[
					9030,
					3817
				],
				[
					8,
					9
				],
				[
					12,
					-20
				],
				[
					-12,
					-17
				]
			],
			[
				[
					9228,
					3724
				],
				[
					-1,
					-8
				],
				[
					-30,
					-74
				]
			],
			[
				[
					9174,
					3639
				],
				[
					-10,
					-12
				]
			],
			[
				[
					9164,
					3627
				],
				[
					-49,
					73
				],
				[
					-11,
					158
				],
				[
					-19,
					-82
				],
				[
					21,
					-121
				],
				[
					-63,
					29
				]
			],
			[
				[
					8805,
					3967
				],
				[
					89,
					0
				],
				[
					30,
					0
				],
				[
					68,
					1
				],
				[
					81,
					-1
				],
				[
					84,
					0
				]
			],
			[
				[
					9332,
					4163
				],
				[
					-29,
					-53
				],
				[
					29,
					-8
				],
				[
					-21,
					-137
				],
				[
					-69,
					-147
				],
				[
					-8,
					49
				],
				[
					-21,
					10
				],
				[
					-31,
					47
				]
			],
			[
				[
					9194,
					3981
				],
				[
					19,
					18
				],
				[
					7,
					11
				],
				[
					23,
					26
				],
				[
					12,
					20
				],
				[
					-30,
					50
				],
				[
					-2,
					20
				],
				[
					-10,
					6
				],
				[
					1,
					31
				],
				[
					11,
					23
				],
				[
					-5,
					25
				],
				[
					15,
					16
				],
				[
					17,
					43
				],
				[
					11,
					8
				]
			],
			[
				[
					9263,
					4278
				],
				[
					73,
					-75
				],
				[
					-4,
					-40
				]
			],
			[
				[
					9361,
					4208
				],
				[
					1,
					-6
				],
				[
					-1,
					0
				]
			],
			[
				[
					9361,
					4202
				],
				[
					-5,
					-4
				],
				[
					140,
					35
				],
				[
					28,
					-36
				],
				[
					-134,
					-57
				],
				[
					-60,
					0
				],
				[
					2,
					23
				]
			],
			[
				[
					9263,
					4278
				],
				[
					-15,
					14
				],
				[
					-16,
					13
				],
				[
					-7,
					28
				],
				[
					3,
					21
				],
				[
					-11,
					17
				],
				[
					-21,
					30
				],
				[
					-130,
					0
				],
				[
					-139,
					0
				],
				[
					-149,
					0
				],
				[
					0,
					52
				]
			],
			[
				[
					8778,
					4453
				],
				[
					82,
					114
				],
				[
					-1,
					18
				],
				[
					-9,
					58
				],
				[
					45,
					22
				],
				[
					75,
					-8
				],
				[
					78,
					-15
				],
				[
					72,
					63
				],
				[
					-6,
					74
				],
				[
					-9,
					26
				],
				[
					97,
					133
				],
				[
					43,
					35
				],
				[
					145,
					2
				]
			],
			[
				[
					8706,
					4398
				],
				[
					72,
					55
				]
			],
			[
				[
					9606,
					5032
				],
				[
					41,
					29
				],
				[
					33,
					87
				],
				[
					29,
					148
				],
				[
					73,
					144
				],
				[
					32,
					-50
				],
				[
					64,
					32
				],
				[
					42,
					-55
				],
				[
					0,
					-260
				],
				[
					63,
					-107
				],
				[
					16,
					-63
				],
				[
					-102,
					-92
				],
				[
					-98,
					-66
				],
				[
					-101,
					-57
				],
				[
					-50,
					-113
				]
			],
			[
				[
					8105,
					4355
				],
				[
					19,
					26
				],
				[
					39,
					93
				],
				[
					2,
					126
				],
				[
					-31,
					118
				],
				[
					4,
					81
				],
				[
					25,
					93
				],
				[
					24,
					64
				],
				[
					38,
					46
				],
				[
					9,
					-64
				],
				[
					17,
					94
				],
				[
					21,
					20
				],
				[
					13,
					72
				],
				[
					81,
					-38
				],
				[
					71,
					-74
				],
				[
					8,
					-87
				],
				[
					-9,
					-87
				],
				[
					-52,
					-76
				],
				[
					4,
					-48
				],
				[
					19,
					-2
				],
				[
					60,
					84
				],
				[
					35,
					-19
				],
				[
					17,
					-111
				],
				[
					5,
					-78
				],
				[
					-45,
					-105
				],
				[
					-21,
					-66
				],
				[
					-33,
					-74
				]
			],
			[
				[
					7763,
					5275
				],
				[
					1,
					-1
				],
				[
					74,
					48
				],
				[
					76,
					62
				],
				[
					84,
					63
				],
				[
					-30,
					-100
				],
				[
					54,
					-24
				],
				[
					67,
					-73
				],
				[
					85,
					42
				],
				[
					93,
					17
				],
				[
					20,
					-53
				],
				[
					29,
					-8
				],
				[
					6,
					19
				],
				[
					-6,
					-19
				],
				[
					26,
					-6
				],
				[
					47,
					-76
				],
				[
					-84,
					-17
				],
				[
					-3,
					1
				],
				[
					-75,
					20
				],
				[
					-74,
					-38
				],
				[
					-65,
					-18
				],
				[
					-56,
					-121
				]
			],
			[
				[
					1792,
					7284
				],
				[
					-95,
					-73
				],
				[
					-49,
					49
				],
				[
					-15,
					89
				],
				[
					87,
					68
				],
				[
					51,
					29
				],
				[
					63,
					-13
				],
				[
					40,
					-59
				],
				[
					-82,
					-90
				]
			],
			[
				[
					593,
					7816
				],
				[
					-59,
					-29
				],
				[
					-63,
					35
				],
				[
					-57,
					52
				],
				[
					94,
					33
				],
				[
					75,
					-18
				],
				[
					10,
					-73
				]
			],
			[
				[
					6,
					8555
				],
				[
					59,
					-37
				],
				[
					59,
					20
				],
				[
					77,
					-50
				],
				[
					95,
					-26
				],
				[
					-8,
					-21
				],
				[
					-72,
					-40
				],
				[
					-73,
					42
				],
				[
					-36,
					34
				],
				[
					-84,
					-11
				],
				[
					-23,
					17
				],
				[
					6,
					72
				]
			],
			[
				[
					1595,
					9959
				],
				[
					69,
					-86
				],
				[
					43,
					37
				],
				[
					161,
					-12
				],
				[
					-6,
					-43
				],
				[
					146,
					-33
				],
				[
					97,
					19
				],
				[
					201,
					-60
				],
				[
					184,
					-18
				],
				[
					73,
					-25
				],
				[
					127,
					31
				],
				[
					145,
					-57
				],
				[
					103,
					-27
				],
				[
					0,
					-708
				],
				[
					-1,
					-1085
				],
				[
					94,
					-6
				],
				[
					93,
					-53
				],
				[
					67,
					-83
				],
				[
					84,
					-125
				],
				[
					93,
					106
				],
				[
					96,
					62
				],
				[
					51,
					-99
				],
				[
					64,
					-78
				],
				[
					87,
					-86
				],
				[
					60,
					-136
				],
				[
					97,
					-218
				],
				[
					163,
					-121
				],
				[
					2,
					-121
				],
				[
					-53,
					-92
				],
				[
					-52,
					72
				],
				[
					-84,
					61
				],
				[
					-27,
					166
				],
				[
					-123,
					155
				],
				[
					-52,
					180
				],
				[
					-91,
					12
				],
				[
					-152,
					5
				],
				[
					-112,
					54
				],
				[
					-197,
					198
				],
				[
					-91,
					36
				],
				[
					-167,
					69
				],
				[
					-132,
					-17
				],
				[
					-188,
					88
				],
				[
					-113,
					81
				],
				[
					-106,
					-40
				],
				[
					20,
					-133
				],
				[
					-53,
					-12
				],
				[
					-110,
					-40
				],
				[
					-84,
					-64
				],
				[
					-106,
					-41
				],
				[
					-14,
					113
				],
				[
					43,
					187
				],
				[
					101,
					59
				],
				[
					-26,
					47
				],
				[
					-121,
					-106
				],
				[
					-65,
					-127
				],
				[
					-138,
					-135
				],
				[
					70,
					-93
				],
				[
					-90,
					-137
				],
				[
					-103,
					-80
				],
				[
					-95,
					-58
				],
				[
					-24,
					-84
				],
				[
					-149,
					-99
				],
				[
					-30,
					-89
				],
				[
					-111,
					-82
				],
				[
					-66,
					15
				],
				[
					-89,
					-53
				],
				[
					-97,
					-65
				],
				[
					-79,
					-64
				],
				[
					-164,
					-55
				],
				[
					-15,
					33
				],
				[
					105,
					89
				],
				[
					93,
					58
				],
				[
					102,
					105
				],
				[
					118,
					21
				],
				[
					47,
					78
				],
				[
					132,
					115
				],
				[
					22,
					38
				],
				[
					70,
					67
				],
				[
					16,
					145
				],
				[
					49,
					112
				],
				[
					-110,
					-57
				],
				[
					-31,
					32
				],
				[
					-51,
					-69
				],
				[
					-63,
					97
				],
				[
					-26,
					-69
				],
				[
					-35,
					95
				],
				[
					-96,
					-76
				],
				[
					-58,
					0
				],
				[
					-8,
					114
				],
				[
					17,
					70
				],
				[
					-61,
					67
				],
				[
					-125,
					-36
				],
				[
					-80,
					89
				],
				[
					-65,
					46
				],
				[
					-1,
					108
				],
				[
					-73,
					81
				],
				[
					37,
					110
				],
				[
					77,
					106
				],
				[
					35,
					98
				],
				[
					77,
					14
				],
				[
					65,
					-30
				],
				[
					77,
					92
				],
				[
					69,
					-17
				],
				[
					73,
					60
				],
				[
					-18,
					87
				],
				[
					-53,
					34
				],
				[
					71,
					73
				],
				[
					-59,
					-2
				],
				[
					-101,
					-41
				],
				[
					-29,
					-42
				],
				[
					-76,
					42
				],
				[
					-134,
					-22
				],
				[
					-140,
					46
				],
				[
					-40,
					77
				],
				[
					-121,
					111
				],
				[
					134,
					79
				],
				[
					213,
					93
				],
				[
					78,
					0
				],
				[
					-13,
					-95
				],
				[
					202,
					8
				],
				[
					-78,
					118
				],
				[
					-117,
					72
				],
				[
					-68,
					96
				],
				[
					-91,
					81
				],
				[
					-132,
					60
				],
				[
					54,
					100
				],
				[
					169,
					6
				],
				[
					120,
					87
				],
				[
					23,
					93
				],
				[
					98,
					91
				],
				[
					93,
					21
				],
				[
					180,
					85
				],
				[
					88,
					-13
				],
				[
					147,
					102
				],
				[
					144,
					-40
				]
			]
		],
		"transform": {
			"scale": [
				0.010483693429632079,
				0.005244681825876752
			],
			"translate": [
				-171.79111060289117,
				18.916190000000103
			]
		}
	};

/***/ },
/* 43 */
/***/ function(module, exports) {

	module.exports = {
		"type": "Topology",
		"arcs": [
			[
				[
					3579,
					2340
				],
				[
					21,
					78
				]
			],
			[
				[
					3600,
					2418
				],
				[
					93,
					-53
				],
				[
					115,
					110
				]
			],
			[
				[
					3808,
					2475
				],
				[
					14,
					-92
				]
			],
			[
				[
					3822,
					2383
				],
				[
					-74,
					0
				],
				[
					-7,
					-144
				]
			],
			[
				[
					3741,
					2239
				],
				[
					-74,
					-4
				]
			],
			[
				[
					3667,
					2235
				],
				[
					-88,
					105
				]
			],
			[
				[
					3483,
					4328
				],
				[
					59,
					169
				],
				[
					-71,
					78
				]
			],
			[
				[
					3471,
					4575
				],
				[
					126,
					29
				],
				[
					-5,
					66
				],
				[
					87,
					-33
				]
			],
			[
				[
					3679,
					4637
				],
				[
					9,
					-181
				],
				[
					44,
					-266
				]
			],
			[
				[
					3732,
					4190
				],
				[
					-98,
					-51
				],
				[
					-77,
					99
				],
				[
					-57,
					-12
				],
				[
					-17,
					102
				]
			],
			[
				[
					4799,
					9797
				],
				[
					-11,
					71
				]
			],
			[
				[
					4788,
					9868
				],
				[
					66,
					-36
				],
				[
					92,
					20
				]
			],
			[
				[
					4946,
					9852
				],
				[
					39,
					-59
				]
			],
			[
				[
					4985,
					9793
				],
				[
					-186,
					4
				]
			],
			[
				[
					3491,
					8155
				],
				[
					79,
					9
				]
			],
			[
				[
					3570,
					8164
				],
				[
					116,
					-130
				]
			],
			[
				[
					3686,
					8034
				],
				[
					0,
					-78
				]
			],
			[
				[
					3686,
					7956
				],
				[
					-94,
					-24
				]
			],
			[
				[
					3592,
					7932
				],
				[
					-39,
					84
				],
				[
					-60,
					4
				]
			],
			[
				[
					3493,
					8020
				],
				[
					-2,
					135
				]
			],
			[
				[
					5898,
					1973
				],
				[
					22,
					-13
				]
			],
			[
				[
					5920,
					1960
				],
				[
					22,
					-137
				]
			],
			[
				[
					5942,
					1823
				],
				[
					-44,
					20
				]
			],
			[
				[
					5898,
					1843
				],
				[
					0,
					130
				]
			],
			[
				[
					5021,
					3667
				],
				[
					-16,
					51
				]
			],
			[
				[
					5005,
					3718
				],
				[
					4,
					5
				]
			],
			[
				[
					5009,
					3723
				],
				[
					24,
					30
				]
			],
			[
				[
					5033,
					3753
				],
				[
					37,
					-26
				]
			],
			[
				[
					5070,
					3727
				],
				[
					24,
					-79
				]
			],
			[
				[
					5094,
					3648
				],
				[
					-14,
					-30
				]
			],
			[
				[
					5080,
					3618
				],
				[
					-1,
					-2
				]
			],
			[
				[
					5079,
					3616
				],
				[
					-58,
					51
				]
			],
			[
				[
					4638,
					4741
				],
				[
					19,
					23
				]
			],
			[
				[
					4657,
					4764
				],
				[
					104,
					29
				]
			],
			[
				[
					4761,
					4793
				],
				[
					1,
					-104
				]
			],
			[
				[
					4762,
					4689
				],
				[
					-85,
					41
				]
			],
			[
				[
					4677,
					4730
				],
				[
					-39,
					11
				]
			],
			[
				[
					4116,
					4357
				],
				[
					91,
					26
				],
				[
					-39,
					69
				],
				[
					32,
					96
				]
			],
			[
				[
					4200,
					4548
				],
				[
					26,
					-6
				]
			],
			[
				[
					4226,
					4542
				],
				[
					74,
					-104
				],
				[
					-27,
					-52
				]
			],
			[
				[
					4273,
					4386
				],
				[
					-56,
					-55
				]
			],
			[
				[
					4217,
					4331
				],
				[
					-69,
					-26
				]
			],
			[
				[
					4148,
					4305
				],
				[
					-32,
					52
				]
			],
			[
				[
					5389,
					4271
				],
				[
					12,
					86
				]
			],
			[
				[
					5401,
					4357
				],
				[
					100,
					-40
				]
			],
			[
				[
					5501,
					4317
				],
				[
					18,
					-104
				]
			],
			[
				[
					5519,
					4213
				],
				[
					1,
					-1
				]
			],
			[
				[
					5520,
					4212
				],
				[
					-19,
					-34
				]
			],
			[
				[
					5501,
					4178
				],
				[
					-99,
					6
				],
				[
					-13,
					87
				]
			],
			[
				[
					3966,
					9428
				],
				[
					61,
					68
				],
				[
					121,
					-50
				],
				[
					35,
					95
				],
				[
					144,
					38
				],
				[
					95,
					-36
				],
				[
					79,
					-101
				],
				[
					34,
					-137
				],
				[
					145,
					-38
				]
			],
			[
				[
					4680,
					9267
				],
				[
					-43,
					-180
				],
				[
					-149,
					-158
				]
			],
			[
				[
					4488,
					8929
				],
				[
					-118,
					94
				],
				[
					-110,
					-24
				]
			],
			[
				[
					4260,
					8999
				],
				[
					-137,
					-25
				]
			],
			[
				[
					4123,
					8974
				],
				[
					-9,
					154
				],
				[
					-100,
					51
				],
				[
					-61,
					107
				],
				[
					13,
					142
				]
			],
			[
				[
					3237,
					4298
				],
				[
					-8,
					60
				],
				[
					117,
					136
				],
				[
					125,
					81
				]
			],
			[
				[
					3483,
					4328
				],
				[
					-63,
					-75
				],
				[
					-146,
					-29
				],
				[
					-37,
					74
				]
			],
			[
				[
					6142,
					1578
				],
				[
					-28,
					-67
				],
				[
					132,
					-33
				],
				[
					73,
					54
				]
			],
			[
				[
					6319,
					1532
				],
				[
					23,
					-77
				],
				[
					71,
					-21
				]
			],
			[
				[
					6413,
					1434
				],
				[
					-11,
					-74
				]
			],
			[
				[
					6402,
					1360
				],
				[
					-40,
					-24
				]
			],
			[
				[
					6362,
					1336
				],
				[
					-43,
					-7
				]
			],
			[
				[
					6319,
					1329
				],
				[
					-121,
					-12
				]
			],
			[
				[
					6198,
					1317
				],
				[
					-82,
					-43
				]
			],
			[
				[
					6116,
					1274
				],
				[
					-129,
					-2
				]
			],
			[
				[
					5987,
					1272
				],
				[
					26,
					130
				],
				[
					-35,
					87
				],
				[
					66,
					96
				],
				[
					98,
					-7
				]
			],
			[
				[
					5501,
					4317
				],
				[
					5,
					103
				],
				[
					49,
					9
				]
			],
			[
				[
					5555,
					4429
				],
				[
					62,
					-67
				]
			],
			[
				[
					5617,
					4362
				],
				[
					-55,
					-103
				]
			],
			[
				[
					5562,
					4259
				],
				[
					-43,
					-46
				]
			],
			[
				[
					6985,
					1703
				],
				[
					104,
					122
				],
				[
					147,
					50
				]
			],
			[
				[
					7236,
					1875
				],
				[
					23,
					-119
				]
			],
			[
				[
					7259,
					1756
				],
				[
					-52,
					-105
				],
				[
					-71,
					-13
				],
				[
					-46,
					-139
				]
			],
			[
				[
					7090,
					1499
				],
				[
					-55,
					5
				]
			],
			[
				[
					7035,
					1504
				],
				[
					-76,
					25
				]
			],
			[
				[
					6959,
					1529
				],
				[
					-9,
					40
				]
			],
			[
				[
					6950,
					1569
				],
				[
					35,
					134
				]
			],
			[
				[
					4885,
					4844
				],
				[
					-4,
					58
				]
			],
			[
				[
					4881,
					4902
				],
				[
					48,
					7
				]
			],
			[
				[
					4929,
					4909
				],
				[
					23,
					2
				]
			],
			[
				[
					4952,
					4911
				],
				[
					-10,
					-56
				]
			],
			[
				[
					4942,
					4855
				],
				[
					-57,
					-11
				]
			],
			[
				[
					5823,
					2499
				],
				[
					50,
					-31
				],
				[
					66,
					36
				],
				[
					-98,
					166
				],
				[
					106,
					-32
				]
			],
			[
				[
					5947,
					2638
				],
				[
					50,
					-90
				]
			],
			[
				[
					5997,
					2548
				],
				[
					-67,
					-89
				],
				[
					42,
					-54
				]
			],
			[
				[
					5972,
					2405
				],
				[
					-172,
					-36
				]
			],
			[
				[
					5800,
					2369
				],
				[
					41,
					61
				],
				[
					-18,
					69
				]
			],
			[
				[
					5524,
					2725
				],
				[
					-57,
					108
				],
				[
					-109,
					23
				]
			],
			[
				[
					5358,
					2856
				],
				[
					34,
					141
				]
			],
			[
				[
					5392,
					2997
				],
				[
					109,
					90
				]
			],
			[
				[
					5501,
					3087
				],
				[
					63,
					-98
				],
				[
					-54,
					-11
				],
				[
					33,
					-111
				],
				[
					59,
					-37
				],
				[
					60,
					51
				]
			],
			[
				[
					5662,
					2881
				],
				[
					49,
					-17
				],
				[
					-17,
					-234
				],
				[
					-37,
					17
				]
			],
			[
				[
					5657,
					2647
				],
				[
					-26,
					50
				],
				[
					-107,
					28
				]
			],
			[
				[
					6555,
					2246
				],
				[
					46,
					30
				]
			],
			[
				[
					6601,
					2276
				],
				[
					9,
					-72
				]
			],
			[
				[
					6610,
					2204
				],
				[
					-31,
					-1
				]
			],
			[
				[
					6579,
					2203
				],
				[
					-24,
					43
				]
			],
			[
				[
					5375,
					4924
				],
				[
					-44,
					100
				]
			],
			[
				[
					5331,
					5024
				],
				[
					43,
					-8
				]
			],
			[
				[
					5374,
					5016
				],
				[
					57,
					6
				]
			],
			[
				[
					5431,
					5022
				],
				[
					15,
					-60
				],
				[
					-71,
					-38
				]
			],
			[
				[
					5431,
					5022
				],
				[
					58,
					-29
				]
			],
			[
				[
					5489,
					4993
				],
				[
					12,
					-27
				]
			],
			[
				[
					5501,
					4966
				],
				[
					2,
					-44
				],
				[
					-95,
					-79
				]
			],
			[
				[
					5408,
					4843
				],
				[
					-33,
					81
				]
			],
			[
				[
					4223,
					5691
				],
				[
					-139,
					-80
				],
				[
					-82,
					173
				]
			],
			[
				[
					4002,
					5784
				],
				[
					65,
					36
				],
				[
					-3,
					171
				],
				[
					95,
					123
				]
			],
			[
				[
					4159,
					6114
				],
				[
					-25,
					-86
				],
				[
					10,
					-138
				],
				[
					37,
					38
				],
				[
					48,
					-85
				],
				[
					-29,
					-48
				],
				[
					23,
					-104
				]
			],
			[
				[
					6791,
					2275
				],
				[
					15,
					115
				]
			],
			[
				[
					6806,
					2390
				],
				[
					70,
					-37
				]
			],
			[
				[
					6876,
					2353
				],
				[
					3,
					-41
				]
			],
			[
				[
					6879,
					2312
				],
				[
					-88,
					-37
				]
			],
			[
				[
					5650,
					1887
				],
				[
					115,
					12
				],
				[
					-9,
					-57
				],
				[
					-105,
					-25
				]
			],
			[
				[
					5651,
					1817
				],
				[
					-1,
					70
				]
			],
			[
				[
					5593,
					4501
				],
				[
					8,
					126
				]
			],
			[
				[
					5601,
					4627
				],
				[
					63,
					129
				]
			],
			[
				[
					5664,
					4756
				],
				[
					76,
					26
				],
				[
					60,
					103
				]
			],
			[
				[
					5800,
					4885
				],
				[
					103,
					-64
				]
			],
			[
				[
					5903,
					4821
				],
				[
					-15,
					-39
				],
				[
					48,
					-143
				]
			],
			[
				[
					5936,
					4639
				],
				[
					-112,
					-3
				],
				[
					-94,
					-77
				]
			],
			[
				[
					5730,
					4559
				],
				[
					-57,
					-34
				]
			],
			[
				[
					5673,
					4525
				],
				[
					-80,
					-24
				]
			],
			[
				[
					4737,
					1989
				],
				[
					-50,
					31
				],
				[
					54,
					24
				],
				[
					-4,
					-55
				]
			],
			[
				[
					5321,
					5159
				],
				[
					-10,
					-4
				]
			],
			[
				[
					5311,
					5155
				],
				[
					-105,
					-25
				]
			],
			[
				[
					5206,
					5130
				],
				[
					-2,
					-3
				]
			],
			[
				[
					5204,
					5127
				],
				[
					-32,
					59
				]
			],
			[
				[
					5172,
					5186
				],
				[
					66,
					41
				]
			],
			[
				[
					5238,
					5227
				],
				[
					83,
					-68
				]
			],
			[
				[
					6391,
					2166
				],
				[
					15,
					2
				]
			],
			[
				[
					6406,
					2168
				],
				[
					-15,
					-34
				]
			],
			[
				[
					6391,
					2134
				],
				[
					4,
					-26
				]
			],
			[
				[
					6395,
					2108
				],
				[
					-36,
					16
				]
			],
			[
				[
					6359,
					2124
				],
				[
					-2,
					14
				]
			],
			[
				[
					6357,
					2138
				],
				[
					34,
					28
				]
			],
			[
				[
					6103,
					2178
				],
				[
					-66,
					60
				],
				[
					-17,
					-51
				]
			],
			[
				[
					6020,
					2187
				],
				[
					-15,
					-17
				]
			],
			[
				[
					6005,
					2170
				],
				[
					-42,
					121
				],
				[
					-55,
					-33
				]
			],
			[
				[
					5908,
					2258
				],
				[
					17,
					80
				],
				[
					70,
					-6
				]
			],
			[
				[
					5995,
					2332
				],
				[
					115,
					-4
				]
			],
			[
				[
					6110,
					2328
				],
				[
					17,
					-7
				]
			],
			[
				[
					6127,
					2321
				],
				[
					18,
					-54
				]
			],
			[
				[
					6145,
					2267
				],
				[
					-7,
					-67
				]
			],
			[
				[
					6138,
					2200
				],
				[
					-3,
					-20
				]
			],
			[
				[
					6135,
					2180
				],
				[
					-32,
					-2
				]
			],
			[
				[
					6466,
					2049
				],
				[
					32,
					22
				]
			],
			[
				[
					6498,
					2071
				],
				[
					55,
					-31
				]
			],
			[
				[
					6553,
					2040
				],
				[
					-52,
					-62
				]
			],
			[
				[
					6501,
					1978
				],
				[
					-35,
					71
				]
			],
			[
				[
					6123,
					3020
				],
				[
					35,
					66
				],
				[
					8,
					-72
				]
			],
			[
				[
					6166,
					3014
				],
				[
					-43,
					6
				]
			],
			[
				[
					6421,
					2200
				],
				[
					22,
					-4
				]
			],
			[
				[
					6443,
					2196
				],
				[
					38,
					-18
				]
			],
			[
				[
					6481,
					2178
				],
				[
					-15,
					-5
				]
			],
			[
				[
					6466,
					2173
				],
				[
					-42,
					-15
				]
			],
			[
				[
					6424,
					2158
				],
				[
					-3,
					42
				]
			],
			[
				[
					4352,
					7048
				],
				[
					-34,
					88
				],
				[
					30,
					85
				],
				[
					-61,
					69
				],
				[
					-48,
					-28
				],
				[
					-89,
					125
				],
				[
					-68,
					22
				],
				[
					-55,
					-46
				],
				[
					-2,
					120
				],
				[
					-46,
					67
				],
				[
					127,
					122
				],
				[
					72,
					-35
				],
				[
					103,
					117
				],
				[
					-104,
					121
				]
			],
			[
				[
					4177,
					7875
				],
				[
					107,
					130
				],
				[
					78,
					1
				]
			],
			[
				[
					4362,
					8006
				],
				[
					130,
					35
				],
				[
					59,
					-22
				],
				[
					174,
					159
				]
			],
			[
				[
					4725,
					8178
				],
				[
					166,
					-39
				],
				[
					83,
					-143
				]
			],
			[
				[
					4974,
					7996
				],
				[
					-162,
					-215
				],
				[
					-66,
					-27
				],
				[
					78,
					-118
				],
				[
					28,
					-135
				],
				[
					-113,
					-61
				],
				[
					6,
					-43
				]
			],
			[
				[
					4745,
					7397
				],
				[
					-114,
					-21
				],
				[
					-119,
					-124
				],
				[
					-33,
					-95
				]
			],
			[
				[
					4479,
					7157
				],
				[
					-127,
					-109
				]
			],
			[
				[
					6444,
					2216
				],
				[
					47,
					29
				]
			],
			[
				[
					6491,
					2245
				],
				[
					2,
					-18
				]
			],
			[
				[
					6493,
					2227
				],
				[
					-44,
					-26
				]
			],
			[
				[
					6449,
					2201
				],
				[
					-5,
					15
				]
			],
			[
				[
					6314,
					5194
				],
				[
					-32,
					82
				]
			],
			[
				[
					6282,
					5276
				],
				[
					-53,
					14
				]
			],
			[
				[
					6229,
					5290
				],
				[
					-215,
					17
				]
			],
			[
				[
					6014,
					5307
				],
				[
					55,
					48
				],
				[
					-50,
					95
				],
				[
					117,
					22
				],
				[
					161,
					-53
				],
				[
					12,
					86
				],
				[
					54,
					-4
				]
			],
			[
				[
					6363,
					5501
				],
				[
					24,
					-77
				],
				[
					215,
					-342
				],
				[
					14,
					-62
				],
				[
					-212,
					50
				],
				[
					-90,
					124
				]
			],
			[
				[
					6802,
					1625
				],
				[
					52,
					-66
				],
				[
					105,
					-30
				]
			],
			[
				[
					7035,
					1504
				],
				[
					19,
					-48
				],
				[
					-122,
					2
				],
				[
					-51,
					-159
				]
			],
			[
				[
					6881,
					1299
				],
				[
					-122,
					-57
				]
			],
			[
				[
					6759,
					1242
				],
				[
					-57,
					25
				]
			],
			[
				[
					6702,
					1267
				],
				[
					2,
					25
				]
			],
			[
				[
					6704,
					1292
				],
				[
					4,
					138
				],
				[
					-72,
					50
				],
				[
					134,
					57
				],
				[
					32,
					88
				]
			],
			[
				[
					6632,
					2107
				],
				[
					-44,
					44
				]
			],
			[
				[
					6588,
					2151
				],
				[
					57,
					15
				]
			],
			[
				[
					6645,
					2166
				],
				[
					17,
					2
				]
			],
			[
				[
					6662,
					2168
				],
				[
					10,
					-5
				]
			],
			[
				[
					6672,
					2163
				],
				[
					-40,
					-56
				]
			],
			[
				[
					4242,
					4749
				],
				[
					23,
					-45
				]
			],
			[
				[
					4265,
					4704
				],
				[
					-67,
					-12
				]
			],
			[
				[
					4198,
					4692
				],
				[
					-18,
					51
				]
			],
			[
				[
					4180,
					4743
				],
				[
					62,
					6
				]
			],
			[
				[
					4986,
					3443
				],
				[
					3,
					40
				]
			],
			[
				[
					4989,
					3483
				],
				[
					40,
					28
				]
			],
			[
				[
					5029,
					3511
				],
				[
					46,
					-22
				]
			],
			[
				[
					5075,
					3489
				],
				[
					-8,
					-23
				]
			],
			[
				[
					5067,
					3466
				],
				[
					-38,
					-7
				]
			],
			[
				[
					5029,
					3459
				],
				[
					-20,
					-37
				]
			],
			[
				[
					5009,
					3422
				],
				[
					-23,
					21
				]
			],
			[
				[
					5125,
					3541
				],
				[
					-23,
					6
				]
			],
			[
				[
					5102,
					3547
				],
				[
					-15,
					66
				]
			],
			[
				[
					5087,
					3613
				],
				[
					72,
					-66
				]
			],
			[
				[
					5159,
					3547
				],
				[
					-4,
					-1
				]
			],
			[
				[
					5155,
					3546
				],
				[
					-30,
					-5
				]
			],
			[
				[
					5075,
					3489
				],
				[
					29,
					-3
				]
			],
			[
				[
					5104,
					3486
				],
				[
					26,
					-47
				]
			],
			[
				[
					5130,
					3439
				],
				[
					-18,
					-25
				]
			],
			[
				[
					5112,
					3414
				],
				[
					-45,
					52
				]
			],
			[
				[
					5155,
					3546
				],
				[
					25,
					-54
				]
			],
			[
				[
					5180,
					3492
				],
				[
					-74,
					1
				]
			],
			[
				[
					5106,
					3493
				],
				[
					19,
					48
				]
			],
			[
				[
					5029,
					3511
				],
				[
					-2,
					36
				]
			],
			[
				[
					5027,
					3547
				],
				[
					2,
					0
				]
			],
			[
				[
					5029,
					3547
				],
				[
					73,
					0
				]
			],
			[
				[
					5106,
					3493
				],
				[
					-2,
					-7
				]
			],
			[
				[
					5029,
					3459
				],
				[
					34,
					-50
				]
			],
			[
				[
					5063,
					3409
				],
				[
					-54,
					13
				]
			],
			[
				[
					5029,
					3547
				],
				[
					31,
					51
				]
			],
			[
				[
					5060,
					3598
				],
				[
					19,
					18
				]
			],
			[
				[
					5080,
					3618
				],
				[
					7,
					-5
				]
			],
			[
				[
					5112,
					3414
				],
				[
					-15,
					-8
				]
			],
			[
				[
					5097,
					3406
				],
				[
					-34,
					3
				]
			],
			[
				[
					5180,
					3492
				],
				[
					-2,
					-24
				]
			],
			[
				[
					5178,
					3468
				],
				[
					-48,
					-29
				]
			],
			[
				[
					5275,
					6519
				],
				[
					51,
					-14
				]
			],
			[
				[
					5326,
					6505
				],
				[
					-40,
					-116
				],
				[
					-49,
					-2
				],
				[
					-10,
					-110
				]
			],
			[
				[
					5227,
					6277
				],
				[
					-63,
					-6
				],
				[
					-122,
					-105
				],
				[
					-77,
					29
				],
				[
					-95,
					-23
				]
			],
			[
				[
					4870,
					6172
				],
				[
					-1,
					100
				],
				[
					-100,
					86
				],
				[
					-16,
					176
				]
			],
			[
				[
					4753,
					6534
				],
				[
					101,
					-43
				],
				[
					184,
					-33
				],
				[
					94,
					52
				],
				[
					105,
					-48
				],
				[
					38,
					57
				]
			],
			[
				[
					4592,
					5170
				],
				[
					-16,
					44
				]
			],
			[
				[
					4576,
					5214
				],
				[
					72,
					46
				]
			],
			[
				[
					4648,
					5260
				],
				[
					20,
					-66
				]
			],
			[
				[
					4668,
					5194
				],
				[
					-76,
					-24
				]
			],
			[
				[
					4813,
					4864
				],
				[
					-33,
					33
				]
			],
			[
				[
					4780,
					4897
				],
				[
					40,
					37
				]
			],
			[
				[
					4820,
					4934
				],
				[
					38,
					-14
				]
			],
			[
				[
					4858,
					4920
				],
				[
					12,
					-7
				]
			],
			[
				[
					4870,
					4913
				],
				[
					-57,
					-49
				]
			],
			[
				[
					4201,
					5408
				],
				[
					47,
					4
				]
			],
			[
				[
					4248,
					5412
				],
				[
					-10,
					-91
				]
			],
			[
				[
					4238,
					5321
				],
				[
					12,
					-12
				]
			],
			[
				[
					4250,
					5309
				],
				[
					-55,
					3
				]
			],
			[
				[
					4195,
					5312
				],
				[
					6,
					96
				]
			],
			[
				[
					4250,
					5309
				],
				[
					-55,
					-58
				]
			],
			[
				[
					4195,
					5251
				],
				[
					0,
					61
				]
			],
			[
				[
					4078,
					2487
				],
				[
					-65,
					96
				]
			],
			[
				[
					4013,
					2583
				],
				[
					20,
					42
				],
				[
					95,
					-13
				]
			],
			[
				[
					4128,
					2612
				],
				[
					17,
					-31
				]
			],
			[
				[
					4145,
					2581
				],
				[
					14,
					-137
				]
			],
			[
				[
					4159,
					2444
				],
				[
					-81,
					43
				]
			],
			[
				[
					5133,
					6775
				],
				[
					39,
					102
				]
			],
			[
				[
					5172,
					6877
				],
				[
					54,
					-15
				]
			],
			[
				[
					5226,
					6862
				],
				[
					14,
					-8
				]
			],
			[
				[
					5240,
					6854
				],
				[
					83,
					-53
				]
			],
			[
				[
					5323,
					6801
				],
				[
					7,
					-58
				]
			],
			[
				[
					5330,
					6743
				],
				[
					-104,
					33
				]
			],
			[
				[
					5226,
					6776
				],
				[
					-93,
					-1
				]
			],
			[
				[
					5275,
					6991
				],
				[
					8,
					64
				]
			],
			[
				[
					5283,
					7055
				],
				[
					99,
					7
				]
			],
			[
				[
					5382,
					7062
				],
				[
					22,
					-59
				]
			],
			[
				[
					5404,
					7003
				],
				[
					-74,
					-27
				]
			],
			[
				[
					5330,
					6976
				],
				[
					-55,
					15
				]
			],
			[
				[
					6116,
					1274
				],
				[
					-6,
					-29
				]
			],
			[
				[
					6110,
					1245
				],
				[
					-170,
					-61
				]
			],
			[
				[
					5940,
					1184
				],
				[
					47,
					88
				]
			],
			[
				[
					5502,
					4554
				],
				[
					37,
					70
				]
			],
			[
				[
					5539,
					4624
				],
				[
					62,
					3
				]
			],
			[
				[
					5593,
					4501
				],
				[
					-38,
					-72
				]
			],
			[
				[
					5401,
					4357
				],
				[
					-4,
					12
				]
			],
			[
				[
					5397,
					4369
				],
				[
					80,
					84
				],
				[
					-24,
					55
				]
			],
			[
				[
					5453,
					4508
				],
				[
					49,
					46
				]
			],
			[
				[
					4717,
					4977
				],
				[
					-61,
					4
				]
			],
			[
				[
					4656,
					4981
				],
				[
					-13,
					57
				]
			],
			[
				[
					4643,
					5038
				],
				[
					70,
					20
				]
			],
			[
				[
					4713,
					5058
				],
				[
					8,
					-47
				]
			],
			[
				[
					4721,
					5011
				],
				[
					-4,
					-34
				]
			],
			[
				[
					4659,
					4920
				],
				[
					-3,
					61
				]
			],
			[
				[
					4717,
					4977
				],
				[
					27,
					-51
				]
			],
			[
				[
					4744,
					4926
				],
				[
					-12,
					-9
				]
			],
			[
				[
					4732,
					4917
				],
				[
					-73,
					3
				]
			],
			[
				[
					4570,
					4945
				],
				[
					-42,
					62
				]
			],
			[
				[
					4528,
					5007
				],
				[
					86,
					45
				]
			],
			[
				[
					4614,
					5052
				],
				[
					29,
					-14
				]
			],
			[
				[
					4659,
					4920
				],
				[
					-2,
					-4
				]
			],
			[
				[
					4657,
					4916
				],
				[
					-58,
					-4
				]
			],
			[
				[
					4599,
					4912
				],
				[
					-29,
					33
				]
			],
			[
				[
					4232,
					4795
				],
				[
					-7,
					14
				]
			],
			[
				[
					4225,
					4809
				],
				[
					-18,
					38
				]
			],
			[
				[
					4207,
					4847
				],
				[
					69,
					-9
				]
			],
			[
				[
					4276,
					4838
				],
				[
					-11,
					-33
				]
			],
			[
				[
					4265,
					4805
				],
				[
					-33,
					-10
				]
			],
			[
				[
					6767,
					4489
				],
				[
					-1,
					-138
				],
				[
					-35,
					-107
				],
				[
					-72,
					-30
				],
				[
					-61,
					-67
				],
				[
					-34,
					-28
				],
				[
					-40,
					-48
				]
			],
			[
				[
					6524,
					4071
				],
				[
					-65,
					-47
				],
				[
					-141,
					88
				]
			],
			[
				[
					6318,
					4112
				],
				[
					43,
					91
				],
				[
					-5,
					98
				]
			],
			[
				[
					6356,
					4301
				],
				[
					44,
					-53
				],
				[
					87,
					114
				],
				[
					123,
					19
				],
				[
					17,
					61
				],
				[
					140,
					47
				]
			],
			[
				[
					5538,
					3823
				],
				[
					44,
					-95
				],
				[
					-30,
					-40
				]
			],
			[
				[
					5552,
					3688
				],
				[
					-56,
					-83
				],
				[
					10,
					-70
				]
			],
			[
				[
					5506,
					3535
				],
				[
					-69,
					45
				]
			],
			[
				[
					5437,
					3580
				],
				[
					-64,
					41
				]
			],
			[
				[
					5373,
					3621
				],
				[
					-44,
					42
				],
				[
					7,
					97
				]
			],
			[
				[
					5336,
					3760
				],
				[
					80,
					-5
				],
				[
					122,
					68
				]
			],
			[
				[
					5100,
					1132
				],
				[
					-6,
					62
				]
			],
			[
				[
					5094,
					1194
				],
				[
					100,
					-56
				]
			],
			[
				[
					5194,
					1138
				],
				[
					-94,
					-6
				]
			],
			[
				[
					5100,
					1132
				],
				[
					-27,
					-11
				]
			],
			[
				[
					5073,
					1121
				],
				[
					-37,
					57
				]
			],
			[
				[
					5036,
					1178
				],
				[
					23,
					31
				]
			],
			[
				[
					5059,
					1209
				],
				[
					35,
					-15
				]
			],
			[
				[
					5900,
					2062
				],
				[
					64,
					10
				],
				[
					-14,
					-67
				]
			],
			[
				[
					5950,
					2005
				],
				[
					-30,
					-45
				]
			],
			[
				[
					5898,
					1973
				],
				[
					-85,
					31
				]
			],
			[
				[
					5813,
					2004
				],
				[
					87,
					58
				]
			],
			[
				[
					5173,
					5311
				],
				[
					43,
					60
				]
			],
			[
				[
					5216,
					5371
				],
				[
					0,
					-97
				]
			],
			[
				[
					5216,
					5274
				],
				[
					-52,
					-15
				]
			],
			[
				[
					5164,
					5259
				],
				[
					9,
					52
				]
			],
			[
				[
					5094,
					5257
				],
				[
					70,
					2
				]
			],
			[
				[
					5216,
					5274
				],
				[
					53,
					-16
				]
			],
			[
				[
					5269,
					5258
				],
				[
					-8,
					-17
				]
			],
			[
				[
					5261,
					5241
				],
				[
					-23,
					-14
				]
			],
			[
				[
					5172,
					5186
				],
				[
					-17,
					25
				]
			],
			[
				[
					5155,
					5211
				],
				[
					-61,
					46
				]
			],
			[
				[
					5094,
					5257
				],
				[
					-17,
					3
				]
			],
			[
				[
					5077,
					5260
				],
				[
					96,
					51
				]
			],
			[
				[
					6797,
					2909
				],
				[
					11,
					39
				]
			],
			[
				[
					6808,
					2948
				],
				[
					119,
					8
				]
			],
			[
				[
					6927,
					2956
				],
				[
					113,
					0
				],
				[
					52,
					-141
				]
			],
			[
				[
					7092,
					2815
				],
				[
					-62,
					-90
				]
			],
			[
				[
					7030,
					2725
				],
				[
					-131,
					-68
				]
			],
			[
				[
					6899,
					2657
				],
				[
					-78,
					104
				],
				[
					7,
					152
				],
				[
					-31,
					-4
				]
			],
			[
				[
					4013,
					2583
				],
				[
					-101,
					30
				]
			],
			[
				[
					3912,
					2613
				],
				[
					-111,
					-83
				]
			],
			[
				[
					3801,
					2530
				],
				[
					-59,
					42
				],
				[
					-81,
					-40
				],
				[
					-22,
					43
				]
			],
			[
				[
					3639,
					2575
				],
				[
					70,
					133
				],
				[
					12,
					129
				],
				[
					38,
					76
				],
				[
					-83,
					120
				]
			],
			[
				[
					3676,
					3033
				],
				[
					9,
					255
				],
				[
					45,
					68
				]
			],
			[
				[
					3730,
					3356
				],
				[
					60,
					-10
				],
				[
					68,
					66
				],
				[
					214,
					59
				]
			],
			[
				[
					4072,
					3471
				],
				[
					9,
					-44
				],
				[
					134,
					-103
				],
				[
					65,
					7
				]
			],
			[
				[
					4280,
					3331
				],
				[
					-38,
					-115
				],
				[
					-51,
					-38
				],
				[
					-51,
					-143
				],
				[
					27,
					-17
				]
			],
			[
				[
					4167,
					3018
				],
				[
					-16,
					-52
				],
				[
					44,
					-128
				]
			],
			[
				[
					4195,
					2838
				],
				[
					3,
					-162
				],
				[
					-70,
					-64
				]
			],
			[
				[
					6227,
					2177
				],
				[
					50,
					9
				]
			],
			[
				[
					6277,
					2186
				],
				[
					36,
					2
				]
			],
			[
				[
					6313,
					2188
				],
				[
					7,
					-18
				]
			],
			[
				[
					6320,
					2170
				],
				[
					-58,
					-30
				]
			],
			[
				[
					6262,
					2140
				],
				[
					-50,
					-22
				]
			],
			[
				[
					6212,
					2118
				],
				[
					15,
					59
				]
			],
			[
				[
					6621,
					2499
				],
				[
					61,
					65
				]
			],
			[
				[
					6682,
					2564
				],
				[
					82,
					-17
				],
				[
					23,
					-93
				]
			],
			[
				[
					6787,
					2454
				],
				[
					19,
					-64
				]
			],
			[
				[
					6791,
					2275
				],
				[
					-52,
					0
				]
			],
			[
				[
					6739,
					2275
				],
				[
					-87,
					81
				]
			],
			[
				[
					6652,
					2356
				],
				[
					-45,
					-3
				]
			],
			[
				[
					6607,
					2353
				],
				[
					-6,
					-3
				]
			],
			[
				[
					6601,
					2350
				],
				[
					20,
					149
				]
			],
			[
				[
					6335,
					2227
				],
				[
					-3,
					1
				]
			],
			[
				[
					6332,
					2228
				],
				[
					-14,
					3
				]
			],
			[
				[
					6318,
					2231
				],
				[
					-27,
					8
				]
			],
			[
				[
					6291,
					2239
				],
				[
					22,
					52
				]
			],
			[
				[
					6313,
					2291
				],
				[
					16,
					-9
				]
			],
			[
				[
					6329,
					2282
				],
				[
					14,
					-21
				]
			],
			[
				[
					6343,
					2261
				],
				[
					-8,
					-34
				]
			],
			[
				[
					6265,
					2297
				],
				[
					38,
					25
				]
			],
			[
				[
					6303,
					2322
				],
				[
					10,
					-31
				]
			],
			[
				[
					6291,
					2239
				],
				[
					-15,
					-9
				]
			],
			[
				[
					6276,
					2230
				],
				[
					-25,
					33
				]
			],
			[
				[
					6251,
					2263
				],
				[
					14,
					34
				]
			],
			[
				[
					3741,
					2239
				],
				[
					122,
					-42
				]
			],
			[
				[
					3863,
					2197
				],
				[
					-105,
					-52
				]
			],
			[
				[
					3758,
					2145
				],
				[
					-91,
					90
				]
			],
			[
				[
					3704,
					1828
				],
				[
					133,
					-1
				],
				[
					106,
					-62
				],
				[
					92,
					-4
				],
				[
					206,
					78
				]
			],
			[
				[
					4241,
					1839
				],
				[
					127,
					-68
				],
				[
					14,
					-113
				]
			],
			[
				[
					4382,
					1658
				],
				[
					-52,
					-52
				]
			],
			[
				[
					4330,
					1606
				],
				[
					-71,
					-38
				],
				[
					-116,
					42
				],
				[
					-46,
					62
				],
				[
					-164,
					-122
				]
			],
			[
				[
					3933,
					1550
				],
				[
					-141,
					-27
				]
			],
			[
				[
					3792,
					1523
				],
				[
					3,
					60
				],
				[
					-177,
					116
				],
				[
					-4,
					52
				],
				[
					87,
					5
				],
				[
					3,
					72
				]
			],
			[
				[
					5800,
					4885
				],
				[
					36,
					132
				]
			],
			[
				[
					5836,
					5017
				],
				[
					16,
					50
				],
				[
					-138,
					24
				]
			],
			[
				[
					5714,
					5091
				],
				[
					-19,
					65
				],
				[
					126,
					31
				]
			],
			[
				[
					5821,
					5187
				],
				[
					164,
					-34
				],
				[
					54,
					31
				],
				[
					92,
					-37
				]
			],
			[
				[
					6131,
					5147
				],
				[
					110,
					-186
				]
			],
			[
				[
					6241,
					4961
				],
				[
					-107,
					-18
				]
			],
			[
				[
					6134,
					4943
				],
				[
					-54,
					-2
				],
				[
					-79,
					103
				],
				[
					-54,
					-136
				]
			],
			[
				[
					5947,
					4908
				],
				[
					-44,
					-87
				]
			],
			[
				[
					6400,
					1268
				],
				[
					41,
					61
				]
			],
			[
				[
					6441,
					1329
				],
				[
					84,
					-110
				]
			],
			[
				[
					6525,
					1219
				],
				[
					-125,
					49
				]
			],
			[
				[
					6402,
					1360
				],
				[
					39,
					-31
				]
			],
			[
				[
					6400,
					1268
				],
				[
					-15,
					5
				]
			],
			[
				[
					6385,
					1273
				],
				[
					-23,
					63
				]
			],
			[
				[
					4567,
					2110
				],
				[
					8,
					39
				]
			],
			[
				[
					4575,
					2149
				],
				[
					21,
					33
				]
			],
			[
				[
					4596,
					2182
				],
				[
					18,
					-32
				]
			],
			[
				[
					4614,
					2150
				],
				[
					0,
					-59
				]
			],
			[
				[
					4614,
					2091
				],
				[
					-36,
					-24
				]
			],
			[
				[
					4578,
					2067
				],
				[
					-11,
					43
				]
			],
			[
				[
					4401,
					2213
				],
				[
					1,
					1
				]
			],
			[
				[
					4402,
					2214
				],
				[
					13,
					6
				]
			],
			[
				[
					4415,
					2220
				],
				[
					6,
					0
				]
			],
			[
				[
					4421,
					2220
				],
				[
					50,
					-3
				]
			],
			[
				[
					4471,
					2217
				],
				[
					125,
					-35
				]
			],
			[
				[
					4575,
					2149
				],
				[
					-52,
					-19
				]
			],
			[
				[
					4523,
					2130
				],
				[
					-68,
					59
				],
				[
					-125,
					-100
				]
			],
			[
				[
					4330,
					2089
				],
				[
					-165,
					-116
				]
			],
			[
				[
					4165,
					1973
				],
				[
					-8,
					45
				]
			],
			[
				[
					4157,
					2018
				],
				[
					1,
					1
				]
			],
			[
				[
					4158,
					2019
				],
				[
					243,
					194
				]
			],
			[
				[
					4527,
					2120
				],
				[
					40,
					-10
				]
			],
			[
				[
					4578,
					2067
				],
				[
					-24,
					-18
				]
			],
			[
				[
					4554,
					2049
				],
				[
					-27,
					71
				]
			],
			[
				[
					4527,
					2120
				],
				[
					-4,
					10
				]
			],
			[
				[
					7663,
					3609
				],
				[
					-130,
					93
				]
			],
			[
				[
					7533,
					3702
				],
				[
					-14,
					71
				],
				[
					-87,
					-22
				]
			],
			[
				[
					7432,
					3751
				],
				[
					-102,
					-15
				]
			],
			[
				[
					7330,
					3736
				],
				[
					4,
					85
				],
				[
					-102,
					127
				],
				[
					-97,
					5
				],
				[
					-28,
					-55
				],
				[
					-71,
					25
				]
			],
			[
				[
					7036,
					3923
				],
				[
					60,
					160
				]
			],
			[
				[
					7096,
					4083
				],
				[
					90,
					24
				],
				[
					6,
					-61
				],
				[
					65,
					29
				],
				[
					23,
					-68
				],
				[
					89,
					-53
				],
				[
					118,
					-6
				],
				[
					96,
					-159
				],
				[
					86,
					-11
				]
			],
			[
				[
					7669,
					3778
				],
				[
					74,
					-124
				]
			],
			[
				[
					7743,
					3654
				],
				[
					-80,
					-45
				]
			],
			[
				[
					6498,
					2071
				],
				[
					28,
					37
				]
			],
			[
				[
					6526,
					2108
				],
				[
					34,
					-13
				]
			],
			[
				[
					6560,
					2095
				],
				[
					33,
					-25
				]
			],
			[
				[
					6593,
					2070
				],
				[
					-40,
					-30
				]
			],
			[
				[
					4957,
					3244
				],
				[
					-62,
					88
				]
			],
			[
				[
					4895,
					3332
				],
				[
					-23,
					99
				]
			],
			[
				[
					4872,
					3431
				],
				[
					2,
					9
				]
			],
			[
				[
					4874,
					3440
				],
				[
					54,
					20
				]
			],
			[
				[
					4928,
					3460
				],
				[
					58,
					-17
				]
			],
			[
				[
					5097,
					3406
				],
				[
					18,
					-8
				]
			],
			[
				[
					5115,
					3398
				],
				[
					-20,
					-42
				]
			],
			[
				[
					5095,
					3356
				],
				[
					-7,
					-77
				]
			],
			[
				[
					5088,
					3279
				],
				[
					-131,
					-35
				]
			],
			[
				[
					6380,
					2440
				],
				[
					-6,
					20
				]
			],
			[
				[
					6374,
					2460
				],
				[
					55,
					44
				]
			],
			[
				[
					6429,
					2504
				],
				[
					85,
					39
				]
			],
			[
				[
					6514,
					2543
				],
				[
					-21,
					-56
				]
			],
			[
				[
					6493,
					2487
				],
				[
					2,
					-57
				]
			],
			[
				[
					6495,
					2430
				],
				[
					-115,
					10
				]
			],
			[
				[
					5567,
					4141
				],
				[
					23,
					-62
				]
			],
			[
				[
					5590,
					4079
				],
				[
					-19,
					-17
				]
			],
			[
				[
					5571,
					4062
				],
				[
					-51,
					150
				]
			],
			[
				[
					5562,
					4259
				],
				[
					20,
					-41
				]
			],
			[
				[
					5582,
					4218
				],
				[
					-15,
					-77
				]
			],
			[
				[
					5823,
					2499
				],
				[
					-106,
					17
				],
				[
					-58,
					57
				],
				[
					-2,
					74
				]
			],
			[
				[
					5662,
					2881
				],
				[
					-3,
					40
				],
				[
					128,
					49
				],
				[
					61,
					-55
				]
			],
			[
				[
					5848,
					2915
				],
				[
					50,
					-73
				],
				[
					114,
					-23
				]
			],
			[
				[
					6012,
					2819
				],
				[
					1,
					-2
				]
			],
			[
				[
					6013,
					2817
				],
				[
					-38,
					-79
				],
				[
					94,
					-58
				],
				[
					18,
					-53
				]
			],
			[
				[
					6087,
					2627
				],
				[
					-21,
					-27
				]
			],
			[
				[
					6066,
					2600
				],
				[
					-119,
					38
				]
			],
			[
				[
					4741,
					5278
				],
				[
					22,
					24
				]
			],
			[
				[
					4763,
					5302
				],
				[
					151,
					-9
				]
			],
			[
				[
					4914,
					5293
				],
				[
					-46,
					-111
				]
			],
			[
				[
					4868,
					5182
				],
				[
					-97,
					34
				]
			],
			[
				[
					4771,
					5216
				],
				[
					-30,
					62
				]
			],
			[
				[
					5057,
					4158
				],
				[
					27,
					71
				],
				[
					81,
					39
				]
			],
			[
				[
					5165,
					4268
				],
				[
					-41,
					-213
				],
				[
					66,
					-24
				]
			],
			[
				[
					5190,
					4031
				],
				[
					77,
					-17
				],
				[
					41,
					-76
				],
				[
					-61,
					-35
				]
			],
			[
				[
					5247,
					3903
				],
				[
					-101,
					109
				],
				[
					-125,
					41
				]
			],
			[
				[
					5021,
					4053
				],
				[
					-53,
					42
				],
				[
					89,
					63
				]
			],
			[
				[
					4794,
					5035
				],
				[
					-7,
					-42
				]
			],
			[
				[
					4787,
					4993
				],
				[
					-66,
					18
				]
			],
			[
				[
					4713,
					5058
				],
				[
					81,
					-23
				]
			],
			[
				[
					4787,
					4993
				],
				[
					33,
					-59
				]
			],
			[
				[
					4780,
					4897
				],
				[
					-36,
					29
				]
			],
			[
				[
					7042,
					3100
				],
				[
					-59,
					43
				],
				[
					76,
					187
				],
				[
					79,
					-76
				],
				[
					66,
					28
				],
				[
					28,
					77
				]
			],
			[
				[
					7232,
					3359
				],
				[
					47,
					11
				]
			],
			[
				[
					7279,
					3370
				],
				[
					38,
					-8
				]
			],
			[
				[
					7317,
					3362
				],
				[
					16,
					-85
				],
				[
					-66,
					-94
				],
				[
					36,
					-25
				],
				[
					-12,
					-103
				],
				[
					-71,
					-43
				]
			],
			[
				[
					7220,
					3012
				],
				[
					-11,
					60
				],
				[
					-167,
					28
				]
			],
			[
				[
					4167,
					2318
				],
				[
					-10,
					-70
				]
			],
			[
				[
					4157,
					2248
				],
				[
					-90,
					9
				]
			],
			[
				[
					4067,
					2257
				],
				[
					-47,
					79
				]
			],
			[
				[
					4020,
					2336
				],
				[
					-10,
					46
				]
			],
			[
				[
					4010,
					2382
				],
				[
					63,
					71
				]
			],
			[
				[
					4073,
					2453
				],
				[
					-4,
					-93
				],
				[
					98,
					-42
				]
			],
			[
				[
					4888,
					5127
				],
				[
					-20,
					55
				]
			],
			[
				[
					4914,
					5293
				],
				[
					38,
					27
				]
			],
			[
				[
					4952,
					5320
				],
				[
					84,
					-53
				]
			],
			[
				[
					5036,
					5267
				],
				[
					22,
					-106
				],
				[
					58,
					-19
				],
				[
					39,
					69
				]
			],
			[
				[
					5204,
					5127
				],
				[
					-69,
					-13
				]
			],
			[
				[
					5135,
					5114
				],
				[
					-144,
					-75
				]
			],
			[
				[
					4991,
					5039
				],
				[
					-13,
					10
				]
			],
			[
				[
					4978,
					5049
				],
				[
					-18,
					80
				],
				[
					-72,
					-2
				]
			],
			[
				[
					6469,
					2119
				],
				[
					-12,
					-3
				]
			],
			[
				[
					6457,
					2116
				],
				[
					-28,
					34
				]
			],
			[
				[
					6429,
					2150
				],
				[
					-5,
					8
				]
			],
			[
				[
					6466,
					2173
				],
				[
					3,
					-54
				]
			],
			[
				[
					6580,
					3166
				],
				[
					56,
					-13
				],
				[
					4,
					-64
				]
			],
			[
				[
					6640,
					3089
				],
				[
					-60,
					77
				]
			],
			[
				[
					5041,
					3903
				],
				[
					-8,
					-150
				]
			],
			[
				[
					5009,
					3723
				],
				[
					-52,
					67
				],
				[
					22,
					61
				]
			],
			[
				[
					4979,
					3851
				],
				[
					62,
					52
				]
			],
			[
				[
					7236,
					1875
				],
				[
					33,
					60
				],
				[
					-60,
					61
				]
			],
			[
				[
					7209,
					1996
				],
				[
					20,
					22
				]
			],
			[
				[
					7229,
					2018
				],
				[
					89,
					-1
				]
			],
			[
				[
					7318,
					2017
				],
				[
					34,
					-105
				],
				[
					70,
					36
				]
			],
			[
				[
					7422,
					1948
				],
				[
					-11,
					-103
				]
			],
			[
				[
					7411,
					1845
				],
				[
					-44,
					-93
				]
			],
			[
				[
					7367,
					1752
				],
				[
					-108,
					4
				]
			],
			[
				[
					4099,
					2180
				],
				[
					47,
					43
				]
			],
			[
				[
					4146,
					2223
				],
				[
					-37,
					-69
				]
			],
			[
				[
					4109,
					2154
				],
				[
					-10,
					26
				]
			],
			[
				[
					4049,
					2238
				],
				[
					18,
					19
				]
			],
			[
				[
					4157,
					2248
				],
				[
					18,
					-13
				]
			],
			[
				[
					4175,
					2235
				],
				[
					-29,
					-12
				]
			],
			[
				[
					4099,
					2180
				],
				[
					-50,
					58
				]
			],
			[
				[
					3993,
					2198
				],
				[
					56,
					40
				]
			],
			[
				[
					4109,
					2154
				],
				[
					-19,
					-13
				]
			],
			[
				[
					4090,
					2141
				],
				[
					-97,
					57
				]
			],
			[
				[
					4210,
					6678
				],
				[
					-53,
					127
				]
			],
			[
				[
					4157,
					6805
				],
				[
					83,
					25
				],
				[
					34,
					-63
				],
				[
					108,
					13
				],
				[
					47,
					-117
				],
				[
					-113,
					-1
				],
				[
					-58,
					-61
				],
				[
					-48,
					77
				]
			],
			[
				[
					3639,
					2575
				],
				[
					-98,
					-23
				]
			],
			[
				[
					3541,
					2552
				],
				[
					-47,
					4
				]
			],
			[
				[
					3494,
					2556
				],
				[
					-67,
					36
				],
				[
					-81,
					-18
				],
				[
					-24,
					-81
				],
				[
					-46,
					50
				],
				[
					-74,
					-35
				]
			],
			[
				[
					3202,
					2508
				],
				[
					81,
					165
				],
				[
					6,
					92
				],
				[
					-46,
					70
				],
				[
					-121,
					-27
				]
			],
			[
				[
					3122,
					2808
				],
				[
					-50,
					111
				]
			],
			[
				[
					3072,
					2919
				],
				[
					248,
					-5
				],
				[
					70,
					75
				],
				[
					89,
					2
				],
				[
					58,
					55
				],
				[
					139,
					-13
				]
			],
			[
				[
					6365,
					1970
				],
				[
					-12,
					62
				]
			],
			[
				[
					6353,
					2032
				],
				[
					49,
					8
				]
			],
			[
				[
					6402,
					2040
				],
				[
					9,
					-28
				]
			],
			[
				[
					6411,
					2012
				],
				[
					-25,
					-66
				]
			],
			[
				[
					6386,
					1946
				],
				[
					-21,
					24
				]
			],
			[
				[
					6929,
					2305
				],
				[
					50,
					-23
				]
			],
			[
				[
					6979,
					2282
				],
				[
					42,
					-60
				]
			],
			[
				[
					7021,
					2222
				],
				[
					7,
					-3
				]
			],
			[
				[
					7028,
					2219
				],
				[
					-14,
					-27
				]
			],
			[
				[
					7014,
					2192
				],
				[
					-96,
					-2
				]
			],
			[
				[
					6918,
					2190
				],
				[
					11,
					115
				]
			],
			[
				[
					3776,
					1408
				],
				[
					150,
					-148
				]
			],
			[
				[
					3926,
					1260
				],
				[
					-54,
					-78
				]
			],
			[
				[
					3872,
					1182
				],
				[
					-55,
					-13
				],
				[
					64,
					-76
				]
			],
			[
				[
					3881,
					1093
				],
				[
					27,
					-42
				]
			],
			[
				[
					3908,
					1051
				],
				[
					-2,
					-20
				]
			],
			[
				[
					3906,
					1031
				],
				[
					-43,
					18
				],
				[
					-132,
					-181
				],
				[
					-43,
					-18
				]
			],
			[
				[
					3688,
					850
				],
				[
					-13,
					-55
				],
				[
					-88,
					102
				]
			],
			[
				[
					3587,
					897
				],
				[
					2,
					94
				],
				[
					-70,
					127
				],
				[
					-40,
					-45
				],
				[
					-19,
					76
				],
				[
					-66,
					-1
				],
				[
					-55,
					62
				],
				[
					87,
					124
				],
				[
					71,
					3
				],
				[
					41,
					-59
				],
				[
					28,
					107
				]
			],
			[
				[
					3566,
					1385
				],
				[
					210,
					23
				]
			],
			[
				[
					7317,
					3362
				],
				[
					99,
					-23
				],
				[
					101,
					66
				]
			],
			[
				[
					7517,
					3405
				],
				[
					47,
					-55
				]
			],
			[
				[
					7564,
					3350
				],
				[
					-39,
					-35
				],
				[
					80,
					-144
				],
				[
					-8,
					-75
				],
				[
					-88,
					-37
				],
				[
					-98,
					-143
				]
			],
			[
				[
					7411,
					2916
				],
				[
					-63,
					27
				]
			],
			[
				[
					7348,
					2943
				],
				[
					-128,
					69
				]
			],
			[
				[
					5538,
					3823
				],
				[
					27,
					29
				]
			],
			[
				[
					5565,
					3852
				],
				[
					113,
					-17
				],
				[
					38,
					77
				]
			],
			[
				[
					5716,
					3912
				],
				[
					51,
					-133
				],
				[
					-53,
					-36
				]
			],
			[
				[
					5714,
					3743
				],
				[
					-60,
					14
				]
			],
			[
				[
					5654,
					3757
				],
				[
					-54,
					-52
				]
			],
			[
				[
					5600,
					3705
				],
				[
					-48,
					-17
				]
			],
			[
				[
					6879,
					1913
				],
				[
					-35,
					-34
				]
			],
			[
				[
					6844,
					1879
				],
				[
					-47,
					95
				]
			],
			[
				[
					6797,
					1974
				],
				[
					8,
					14
				]
			],
			[
				[
					6805,
					1988
				],
				[
					79,
					-13
				],
				[
					23,
					48
				]
			],
			[
				[
					6907,
					2023
				],
				[
					20,
					-54
				]
			],
			[
				[
					6927,
					1969
				],
				[
					-48,
					-56
				]
			],
			[
				[
					4819,
					4748
				],
				[
					19,
					8
				]
			],
			[
				[
					4838,
					4756
				],
				[
					60,
					-15
				]
			],
			[
				[
					4898,
					4741
				],
				[
					4,
					-42
				]
			],
			[
				[
					4902,
					4699
				],
				[
					-43,
					-43
				]
			],
			[
				[
					4859,
					4656
				],
				[
					-42,
					36
				]
			],
			[
				[
					4817,
					4692
				],
				[
					2,
					56
				]
			],
			[
				[
					6840,
					2475
				],
				[
					-5,
					57
				],
				[
					69,
					-16
				]
			],
			[
				[
					6904,
					2516
				],
				[
					-12,
					-80
				],
				[
					-52,
					39
				]
			],
			[
				[
					6337,
					2149
				],
				[
					-3,
					13
				]
			],
			[
				[
					6334,
					2162
				],
				[
					22,
					7
				]
			],
			[
				[
					6356,
					2169
				],
				[
					30,
					14
				]
			],
			[
				[
					6386,
					2183
				],
				[
					5,
					-17
				]
			],
			[
				[
					6357,
					2138
				],
				[
					-20,
					11
				]
			],
			[
				[
					4991,
					2729
				],
				[
					-46,
					-51
				]
			],
			[
				[
					4945,
					2678
				],
				[
					-40,
					74
				],
				[
					86,
					-23
				]
			],
			[
				[
					5997,
					2548
				],
				[
					93,
					-51
				],
				[
					20,
					-169
				]
			],
			[
				[
					5995,
					2332
				],
				[
					-23,
					73
				]
			],
			[
				[
					5453,
					4508
				],
				[
					-63,
					0
				],
				[
					16,
					81
				],
				[
					96,
					-35
				]
			],
			[
				[
					5802,
					1213
				],
				[
					-5,
					130
				]
			],
			[
				[
					5797,
					1343
				],
				[
					-2,
					93
				]
			],
			[
				[
					5795,
					1436
				],
				[
					35,
					108
				],
				[
					107,
					85
				]
			],
			[
				[
					5937,
					1629
				],
				[
					148,
					-2
				]
			],
			[
				[
					6085,
					1627
				],
				[
					48,
					13
				]
			],
			[
				[
					6133,
					1640
				],
				[
					9,
					-62
				]
			],
			[
				[
					5940,
					1184
				],
				[
					-28,
					-45
				],
				[
					-110,
					74
				]
			],
			[
				[
					6534,
					2343
				],
				[
					-10,
					-36
				]
			],
			[
				[
					6524,
					2307
				],
				[
					-11,
					7
				]
			],
			[
				[
					6513,
					2314
				],
				[
					-35,
					20
				]
			],
			[
				[
					6478,
					2334
				],
				[
					16,
					50
				]
			],
			[
				[
					6494,
					2384
				],
				[
					40,
					-41
				]
			],
			[
				[
					4911,
					1969
				],
				[
					-119,
					-19
				]
			],
			[
				[
					4792,
					1950
				],
				[
					-11,
					1
				]
			],
			[
				[
					4781,
					1951
				],
				[
					-42,
					28
				],
				[
					47,
					69
				]
			],
			[
				[
					4786,
					2048
				],
				[
					59,
					4
				],
				[
					49,
					101
				],
				[
					57,
					-84
				]
			],
			[
				[
					4951,
					2069
				],
				[
					-40,
					-100
				]
			],
			[
				[
					6366,
					2414
				],
				[
					33,
					-79
				]
			],
			[
				[
					6399,
					2335
				],
				[
					-13,
					-6
				]
			],
			[
				[
					6386,
					2329
				],
				[
					-29,
					7
				]
			],
			[
				[
					6357,
					2336
				],
				[
					-55,
					42
				]
			],
			[
				[
					6302,
					2378
				],
				[
					64,
					36
				]
			],
			[
				[
					4528,
					5007
				],
				[
					-48,
					15
				]
			],
			[
				[
					4480,
					5022
				],
				[
					-35,
					26
				]
			],
			[
				[
					4445,
					5048
				],
				[
					44,
					109
				]
			],
			[
				[
					4489,
					5157
				],
				[
					87,
					57
				]
			],
			[
				[
					4592,
					5170
				],
				[
					22,
					-118
				]
			],
			[
				[
					5049,
					1272
				],
				[
					62,
					51
				]
			],
			[
				[
					5111,
					1323
				],
				[
					32,
					7
				],
				[
					19,
					-134
				],
				[
					68,
					-37
				]
			],
			[
				[
					5230,
					1159
				],
				[
					-36,
					-21
				]
			],
			[
				[
					5059,
					1209
				],
				[
					-10,
					63
				]
			],
			[
				[
					6386,
					2183
				],
				[
					-24,
					17
				]
			],
			[
				[
					6362,
					2200
				],
				[
					31,
					20
				]
			],
			[
				[
					6393,
					2220
				],
				[
					31,
					-8
				]
			],
			[
				[
					6424,
					2212
				],
				[
					15,
					2
				]
			],
			[
				[
					6439,
					2214
				],
				[
					5,
					2
				]
			],
			[
				[
					6449,
					2201
				],
				[
					-6,
					-5
				]
			],
			[
				[
					6421,
					2200
				],
				[
					-15,
					-32
				]
			],
			[
				[
					4226,
					4542
				],
				[
					38,
					39
				],
				[
					126,
					-80
				]
			],
			[
				[
					4390,
					4501
				],
				[
					-59,
					-153
				]
			],
			[
				[
					4331,
					4348
				],
				[
					-58,
					38
				]
			],
			[
				[
					5251,
					6667
				],
				[
					121,
					16
				]
			],
			[
				[
					5372,
					6683
				],
				[
					50,
					-50
				]
			],
			[
				[
					5422,
					6633
				],
				[
					20,
					-64
				]
			],
			[
				[
					5442,
					6569
				],
				[
					-28,
					-73
				],
				[
					-88,
					9
				]
			],
			[
				[
					5275,
					6519
				],
				[
					-93,
					70
				],
				[
					82,
					21
				],
				[
					-13,
					57
				]
			],
			[
				[
					7263,
					2592
				],
				[
					107,
					123
				],
				[
					80,
					-1
				]
			],
			[
				[
					7450,
					2714
				],
				[
					23,
					-42
				],
				[
					-129,
					-118
				],
				[
					-81,
					38
				]
			],
			[
				[
					6131,
					5147
				],
				[
					24,
					12
				]
			],
			[
				[
					6155,
					5159
				],
				[
					17,
					3
				]
			],
			[
				[
					6172,
					5162
				],
				[
					109,
					11
				],
				[
					144,
					-165
				]
			],
			[
				[
					6425,
					5008
				],
				[
					1,
					-92
				],
				[
					43,
					73
				]
			],
			[
				[
					6469,
					4989
				],
				[
					57,
					-61
				]
			],
			[
				[
					6526,
					4928
				],
				[
					-73,
					-25
				],
				[
					-49,
					-108
				]
			],
			[
				[
					6404,
					4795
				],
				[
					-59,
					68
				],
				[
					17,
					104
				],
				[
					-91,
					68
				],
				[
					-30,
					-74
				]
			],
			[
				[
					4135,
					4060
				],
				[
					-74,
					-31
				],
				[
					-97,
					34
				],
				[
					-82,
					-37
				]
			],
			[
				[
					3882,
					4026
				],
				[
					19,
					161
				]
			],
			[
				[
					3901,
					4187
				],
				[
					245,
					49
				],
				[
					2,
					69
				]
			],
			[
				[
					4217,
					4331
				],
				[
					27,
					-83
				],
				[
					106,
					12
				]
			],
			[
				[
					4350,
					4260
				],
				[
					20,
					-55
				],
				[
					82,
					-20
				]
			],
			[
				[
					4452,
					4185
				],
				[
					-2,
					-78
				],
				[
					-54,
					-40
				],
				[
					-30,
					62
				],
				[
					-123,
					22
				],
				[
					-108,
					-91
				]
			],
			[
				[
					3679,
					4637
				],
				[
					111,
					-35
				],
				[
					70,
					42
				]
			],
			[
				[
					3860,
					4644
				],
				[
					-15,
					-101
				],
				[
					44,
					-98
				],
				[
					148,
					8
				]
			],
			[
				[
					4037,
					4453
				],
				[
					79,
					-96
				]
			],
			[
				[
					3901,
					4187
				],
				[
					-169,
					3
				]
			],
			[
				[
					3493,
					8020
				],
				[
					-31,
					-28
				]
			],
			[
				[
					3462,
					7992
				],
				[
					-49,
					35
				]
			],
			[
				[
					3413,
					8027
				],
				[
					-43,
					66
				]
			],
			[
				[
					3370,
					8093
				],
				[
					-12,
					24
				]
			],
			[
				[
					3358,
					8117
				],
				[
					47,
					24
				]
			],
			[
				[
					3405,
					8141
				],
				[
					86,
					14
				]
			],
			[
				[
					7139,
					2721
				],
				[
					85,
					9
				],
				[
					-52,
					-77
				]
			],
			[
				[
					7172,
					2653
				],
				[
					-33,
					68
				]
			],
			[
				[
					5066,
					4933
				],
				[
					-75,
					106
				]
			],
			[
				[
					5135,
					5114
				],
				[
					32,
					-79
				]
			],
			[
				[
					5167,
					5035
				],
				[
					54,
					-73
				]
			],
			[
				[
					5221,
					4962
				],
				[
					-89,
					-52
				]
			],
			[
				[
					5132,
					4910
				],
				[
					-66,
					23
				]
			],
			[
				[
					4819,
					4344
				],
				[
					-33,
					-28
				]
			],
			[
				[
					4786,
					4316
				],
				[
					-26,
					1
				]
			],
			[
				[
					4760,
					4317
				],
				[
					-81,
					54
				]
			],
			[
				[
					4679,
					4371
				],
				[
					-27,
					105
				]
			],
			[
				[
					4652,
					4476
				],
				[
					114,
					63
				]
			],
			[
				[
					4766,
					4539
				],
				[
					68,
					-85
				],
				[
					59,
					1
				]
			],
			[
				[
					4893,
					4455
				],
				[
					-74,
					-111
				]
			],
			[
				[
					3813,
					6365
				],
				[
					55,
					-1
				],
				[
					30,
					79
				],
				[
					103,
					8
				],
				[
					4,
					84
				],
				[
					118,
					-162
				],
				[
					58,
					7
				]
			],
			[
				[
					4181,
					6380
				],
				[
					59,
					-23
				],
				[
					-5,
					-129
				]
			],
			[
				[
					4235,
					6228
				],
				[
					-115,
					-61
				],
				[
					39,
					-53
				]
			],
			[
				[
					4002,
					5784
				],
				[
					-89,
					230
				],
				[
					-134,
					202
				],
				[
					34,
					149
				]
			],
			[
				[
					6112,
					3287
				],
				[
					-88,
					-16
				],
				[
					4,
					76
				]
			],
			[
				[
					6028,
					3347
				],
				[
					3,
					99
				],
				[
					-83,
					31
				],
				[
					-44,
					79
				]
			],
			[
				[
					5904,
					3556
				],
				[
					176,
					94
				],
				[
					51,
					73
				]
			],
			[
				[
					6131,
					3723
				],
				[
					-2,
					-72
				],
				[
					55,
					-6
				],
				[
					54,
					-107
				],
				[
					-7,
					-94
				],
				[
					-79,
					-127
				]
			],
			[
				[
					6152,
					3317
				],
				[
					1,
					-22
				]
			],
			[
				[
					6153,
					3295
				],
				[
					-41,
					-8
				]
			],
			[
				[
					5368,
					3417
				],
				[
					7,
					51
				]
			],
			[
				[
					5375,
					3468
				],
				[
					22,
					8
				]
			],
			[
				[
					5397,
					3476
				],
				[
					29,
					-82
				]
			],
			[
				[
					5426,
					3394
				],
				[
					-58,
					23
				]
			],
			[
				[
					5303,
					3475
				],
				[
					72,
					-7
				]
			],
			[
				[
					5368,
					3417
				],
				[
					-71,
					-7
				]
			],
			[
				[
					5297,
					3410
				],
				[
					6,
					65
				]
			],
			[
				[
					5299,
					3385
				],
				[
					-2,
					25
				]
			],
			[
				[
					5426,
					3394
				],
				[
					-22,
					-29
				]
			],
			[
				[
					5404,
					3365
				],
				[
					-105,
					20
				]
			],
			[
				[
					6370,
					1738
				],
				[
					30,
					-34
				]
			],
			[
				[
					6400,
					1704
				],
				[
					-56,
					-75
				],
				[
					-32,
					71
				]
			],
			[
				[
					6312,
					1700
				],
				[
					58,
					38
				]
			],
			[
				[
					4760,
					4317
				],
				[
					-40,
					-90
				]
			],
			[
				[
					4720,
					4227
				],
				[
					-8,
					-22
				]
			],
			[
				[
					4712,
					4205
				],
				[
					-43,
					-17
				]
			],
			[
				[
					4669,
					4188
				],
				[
					-77,
					101
				],
				[
					87,
					82
				]
			],
			[
				[
					6475,
					1969
				],
				[
					-52,
					49
				]
			],
			[
				[
					6423,
					2018
				],
				[
					33,
					36
				]
			],
			[
				[
					6456,
					2054
				],
				[
					10,
					-5
				]
			],
			[
				[
					6501,
					1978
				],
				[
					4,
					-22
				]
			],
			[
				[
					6505,
					1956
				],
				[
					-30,
					13
				]
			],
			[
				[
					6402,
					2040
				],
				[
					5,
					28
				]
			],
			[
				[
					6407,
					2068
				],
				[
					12,
					15
				]
			],
			[
				[
					6419,
					2083
				],
				[
					25,
					-4
				]
			],
			[
				[
					6444,
					2079
				],
				[
					12,
					-25
				]
			],
			[
				[
					6423,
					2018
				],
				[
					-12,
					-6
				]
			],
			[
				[
					6475,
					1969
				],
				[
					-65,
					-70
				]
			],
			[
				[
					6410,
					1899
				],
				[
					-24,
					47
				]
			],
			[
				[
					3478,
					8287
				],
				[
					64,
					-88
				],
				[
					57,
					-4
				]
			],
			[
				[
					3599,
					8195
				],
				[
					-29,
					-31
				]
			],
			[
				[
					3405,
					8141
				],
				[
					-117,
					62
				]
			],
			[
				[
					3288,
					8203
				],
				[
					-18,
					81
				],
				[
					109,
					-24
				],
				[
					99,
					27
				]
			],
			[
				[
					3912,
					2613
				],
				[
					-7,
					-74
				],
				[
					105,
					-157
				]
			],
			[
				[
					4020,
					2336
				],
				[
					-60,
					15
				]
			],
			[
				[
					3960,
					2351
				],
				[
					-38,
					61
				],
				[
					-114,
					63
				]
			],
			[
				[
					3808,
					2475
				],
				[
					-7,
					55
				]
			],
			[
				[
					6645,
					2166
				],
				[
					-35,
					38
				]
			],
			[
				[
					6601,
					2276
				],
				[
					-1,
					21
				]
			],
			[
				[
					6600,
					2297
				],
				[
					15,
					23
				]
			],
			[
				[
					6615,
					2320
				],
				[
					38,
					-57
				]
			],
			[
				[
					6653,
					2263
				],
				[
					33,
					-44
				]
			],
			[
				[
					6686,
					2219
				],
				[
					-24,
					-51
				]
			],
			[
				[
					5292,
					6255
				],
				[
					13,
					50
				],
				[
					64,
					-6
				],
				[
					-58,
					-60
				]
			],
			[
				[
					5311,
					6239
				],
				[
					-19,
					16
				]
			],
			[
				[
					6761,
					1956
				],
				[
					-26,
					19
				]
			],
			[
				[
					6735,
					1975
				],
				[
					-8,
					73
				],
				[
					-108,
					16
				]
			],
			[
				[
					6619,
					2064
				],
				[
					13,
					43
				]
			],
			[
				[
					6672,
					2163
				],
				[
					70,
					-18
				]
			],
			[
				[
					6742,
					2145
				],
				[
					19,
					-189
				]
			],
			[
				[
					5558,
					3316
				],
				[
					41,
					79
				]
			],
			[
				[
					5599,
					3395
				],
				[
					57,
					28
				]
			],
			[
				[
					5656,
					3423
				],
				[
					119,
					80
				],
				[
					50,
					-23
				]
			],
			[
				[
					5825,
					3480
				],
				[
					85,
					-152
				]
			],
			[
				[
					5910,
					3328
				],
				[
					30,
					-136
				]
			],
			[
				[
					5940,
					3192
				],
				[
					-32,
					-5
				]
			],
			[
				[
					5908,
					3187
				],
				[
					-18,
					44
				]
			],
			[
				[
					5890,
					3231
				],
				[
					-88,
					-6
				]
			],
			[
				[
					5802,
					3225
				],
				[
					-24,
					-28
				]
			],
			[
				[
					5778,
					3197
				],
				[
					14,
					-77
				],
				[
					-137,
					-10
				],
				[
					-80,
					-51
				],
				[
					-36,
					60
				]
			],
			[
				[
					5539,
					3119
				],
				[
					50,
					97
				],
				[
					-31,
					100
				]
			],
			[
				[
					4037,
					4453
				],
				[
					-92,
					183
				],
				[
					25,
					53
				]
			],
			[
				[
					3970,
					4689
				],
				[
					113,
					-26
				]
			],
			[
				[
					4083,
					4663
				],
				[
					28,
					-27
				]
			],
			[
				[
					4111,
					4636
				],
				[
					38,
					-43
				]
			],
			[
				[
					4149,
					4593
				],
				[
					51,
					-45
				]
			],
			[
				[
					4867,
					4798
				],
				[
					19,
					44
				]
			],
			[
				[
					4886,
					4842
				],
				[
					-1,
					2
				]
			],
			[
				[
					4942,
					4855
				],
				[
					-13,
					-58
				]
			],
			[
				[
					4929,
					4797
				],
				[
					-29,
					3
				]
			],
			[
				[
					4900,
					4800
				],
				[
					-33,
					-2
				]
			],
			[
				[
					5075,
					4477
				],
				[
					78,
					74
				],
				[
					-23,
					59
				],
				[
					105,
					50
				],
				[
					24,
					76
				]
			],
			[
				[
					5259,
					4736
				],
				[
					41,
					-109
				]
			],
			[
				[
					5300,
					4627
				],
				[
					45,
					-188
				],
				[
					52,
					-70
				]
			],
			[
				[
					5389,
					4271
				],
				[
					-30,
					-155
				]
			],
			[
				[
					5359,
					4116
				],
				[
					-17,
					-11
				]
			],
			[
				[
					5342,
					4105
				],
				[
					-74,
					33
				],
				[
					-78,
					-107
				]
			],
			[
				[
					5165,
					4268
				],
				[
					-28,
					153
				],
				[
					-62,
					56
				]
			],
			[
				[
					5359,
					4116
				],
				[
					60,
					-28
				]
			],
			[
				[
					5419,
					4088
				],
				[
					-62,
					-32
				]
			],
			[
				[
					5357,
					4056
				],
				[
					-15,
					49
				]
			],
			[
				[
					5419,
					4088
				],
				[
					29,
					-15
				]
			],
			[
				[
					5448,
					4073
				],
				[
					-16,
					-47
				],
				[
					-75,
					30
				]
			],
			[
				[
					4994,
					1826
				],
				[
					-50,
					30
				],
				[
					6,
					102
				],
				[
					-39,
					11
				]
			],
			[
				[
					4951,
					2069
				],
				[
					66,
					-37
				],
				[
					72,
					77
				],
				[
					27,
					96
				]
			],
			[
				[
					5116,
					2205
				],
				[
					35,
					-39
				],
				[
					146,
					45
				]
			],
			[
				[
					5297,
					2211
				],
				[
					14,
					9
				]
			],
			[
				[
					5311,
					2220
				],
				[
					67,
					-209
				],
				[
					-2,
					-54
				]
			],
			[
				[
					5376,
					1957
				],
				[
					-28,
					-109
				],
				[
					-54,
					5
				],
				[
					-64,
					-66
				]
			],
			[
				[
					5230,
					1787
				],
				[
					-116,
					-16
				],
				[
					-50,
					81
				],
				[
					-70,
					-26
				]
			],
			[
				[
					5167,
					5035
				],
				[
					58,
					32
				],
				[
					-19,
					63
				]
			],
			[
				[
					5311,
					5155
				],
				[
					-1,
					-129
				]
			],
			[
				[
					5310,
					5026
				],
				[
					-89,
					-64
				]
			],
			[
				[
					5622,
					4891
				],
				[
					97,
					98
				]
			],
			[
				[
					5719,
					4989
				],
				[
					36,
					-61
				],
				[
					-64,
					-49
				],
				[
					-69,
					12
				]
			],
			[
				[
					5622,
					4891
				],
				[
					-90,
					-22
				]
			],
			[
				[
					5532,
					4869
				],
				[
					-31,
					97
				]
			],
			[
				[
					5489,
					4993
				],
				[
					87,
					51
				]
			],
			[
				[
					5576,
					5044
				],
				[
					138,
					47
				]
			],
			[
				[
					5836,
					5017
				],
				[
					-60,
					38
				],
				[
					-57,
					-66
				]
			],
			[
				[
					5664,
					4756
				],
				[
					-94,
					37
				]
			],
			[
				[
					5570,
					4793
				],
				[
					-38,
					76
				]
			],
			[
				[
					7423,
					1644
				],
				[
					-56,
					108
				]
			],
			[
				[
					7411,
					1845
				],
				[
					142,
					14
				]
			],
			[
				[
					7553,
					1859
				],
				[
					-19,
					-163
				],
				[
					-111,
					-52
				]
			],
			[
				[
					4886,
					3554
				],
				[
					12,
					53
				]
			],
			[
				[
					4898,
					3607
				],
				[
					42,
					-30
				]
			],
			[
				[
					4940,
					3577
				],
				[
					11,
					-43
				]
			],
			[
				[
					4951,
					3534
				],
				[
					-5,
					-11
				]
			],
			[
				[
					4946,
					3523
				],
				[
					-60,
					31
				]
			],
			[
				[
					4872,
					3495
				],
				[
					14,
					59
				]
			],
			[
				[
					4946,
					3523
				],
				[
					-1,
					-14
				]
			],
			[
				[
					4945,
					3509
				],
				[
					-73,
					-14
				]
			],
			[
				[
					6419,
					2083
				],
				[
					-3,
					51
				]
			],
			[
				[
					6416,
					2134
				],
				[
					13,
					16
				]
			],
			[
				[
					6457,
					2116
				],
				[
					-13,
					-37
				]
			],
			[
				[
					3409,
					7314
				],
				[
					16,
					143
				],
				[
					56,
					47
				]
			],
			[
				[
					3481,
					7504
				],
				[
					45,
					147
				],
				[
					-38,
					25
				]
			],
			[
				[
					3488,
					7676
				],
				[
					189,
					84
				]
			],
			[
				[
					3677,
					7760
				],
				[
					146,
					105
				],
				[
					25,
					93
				]
			],
			[
				[
					3848,
					7958
				],
				[
					101,
					49
				]
			],
			[
				[
					3949,
					8007
				],
				[
					19,
					6
				]
			],
			[
				[
					3968,
					8013
				],
				[
					72,
					-66
				],
				[
					67,
					35
				],
				[
					38,
					-121
				],
				[
					32,
					14
				]
			],
			[
				[
					4352,
					7048
				],
				[
					-126,
					-97
				],
				[
					-33,
					-88
				],
				[
					-85,
					-16
				]
			],
			[
				[
					4108,
					6847
				],
				[
					-106,
					-5
				]
			],
			[
				[
					4002,
					6842
				],
				[
					-164,
					-72
				]
			],
			[
				[
					3838,
					6770
				],
				[
					-51,
					219
				],
				[
					52,
					26
				],
				[
					-40,
					86
				],
				[
					8,
					182
				],
				[
					-69,
					-114
				],
				[
					-216,
					32
				],
				[
					-113,
					113
				]
			],
			[
				[
					4488,
					8929
				],
				[
					-39,
					-57
				],
				[
					-175,
					-4
				]
			],
			[
				[
					4274,
					8868
				],
				[
					-14,
					131
				]
			],
			[
				[
					4274,
					8868
				],
				[
					-54,
					-21
				]
			],
			[
				[
					4220,
					8847
				],
				[
					-134,
					109
				],
				[
					37,
					18
				]
			],
			[
				[
					3689,
					8353
				],
				[
					57,
					62
				],
				[
					160,
					33
				]
			],
			[
				[
					3906,
					8448
				],
				[
					100,
					-81
				],
				[
					-45,
					-81
				]
			],
			[
				[
					3961,
					8286
				],
				[
					-228,
					26
				],
				[
					-44,
					41
				]
			],
			[
				[
					6277,
					2186
				],
				[
					-14,
					19
				]
			],
			[
				[
					6263,
					2205
				],
				[
					13,
					25
				]
			],
			[
				[
					6318,
					2231
				],
				[
					-5,
					-43
				]
			],
			[
				[
					6220,
					2226
				],
				[
					-31,
					15
				]
			],
			[
				[
					6189,
					2241
				],
				[
					30,
					20
				]
			],
			[
				[
					6219,
					2261
				],
				[
					32,
					2
				]
			],
			[
				[
					6263,
					2205
				],
				[
					-43,
					21
				]
			],
			[
				[
					6227,
					2177
				],
				[
					-30,
					9
				]
			],
			[
				[
					6197,
					2186
				],
				[
					23,
					40
				]
			],
			[
				[
					5492,
					6486
				],
				[
					-50,
					83
				]
			],
			[
				[
					5422,
					6633
				],
				[
					51,
					77
				]
			],
			[
				[
					5473,
					6710
				],
				[
					17,
					4
				]
			],
			[
				[
					5490,
					6714
				],
				[
					81,
					-184
				]
			],
			[
				[
					5571,
					6530
				],
				[
					-79,
					-44
				]
			],
			[
				[
					6661,
					1158
				],
				[
					41,
					109
				]
			],
			[
				[
					6759,
					1242
				],
				[
					-98,
					-84
				]
			],
			[
				[
					5516,
					1300
				],
				[
					-16,
					9
				]
			],
			[
				[
					5500,
					1309
				],
				[
					-32,
					31
				]
			],
			[
				[
					5468,
					1340
				],
				[
					13,
					89
				]
			],
			[
				[
					5481,
					1429
				],
				[
					-26,
					36
				]
			],
			[
				[
					5455,
					1465
				],
				[
					75,
					26
				]
			],
			[
				[
					5530,
					1491
				],
				[
					21,
					-115
				]
			],
			[
				[
					5551,
					1376
				],
				[
					-35,
					-76
				]
			],
			[
				[
					3881,
					1093
				],
				[
					-9,
					89
				]
			],
			[
				[
					3926,
					1260
				],
				[
					172,
					-76
				],
				[
					9,
					-96
				]
			],
			[
				[
					4107,
					1088
				],
				[
					-151,
					-106
				],
				[
					-48,
					69
				]
			],
			[
				[
					3191,
					8212
				],
				[
					97,
					-9
				]
			],
			[
				[
					3358,
					8117
				],
				[
					-63,
					23
				]
			],
			[
				[
					3295,
					8140
				],
				[
					-47,
					-25
				]
			],
			[
				[
					3248,
					8115
				],
				[
					-40,
					28
				]
			],
			[
				[
					3208,
					8143
				],
				[
					-17,
					69
				]
			],
			[
				[
					5672,
					1635
				],
				[
					-20,
					71
				]
			],
			[
				[
					5652,
					1706
				],
				[
					46,
					60
				],
				[
					167,
					31
				]
			],
			[
				[
					5865,
					1797
				],
				[
					72,
					-168
				]
			],
			[
				[
					5795,
					1436
				],
				[
					-79,
					16
				],
				[
					-44,
					183
				]
			],
			[
				[
					6511,
					2192
				],
				[
					19,
					69
				]
			],
			[
				[
					6530,
					2261
				],
				[
					13,
					9
				]
			],
			[
				[
					6543,
					2270
				],
				[
					12,
					-24
				]
			],
			[
				[
					6579,
					2203
				],
				[
					-16,
					-15
				]
			],
			[
				[
					6563,
					2188
				],
				[
					-52,
					4
				]
			],
			[
				[
					3488,
					7676
				],
				[
					-164,
					-32
				],
				[
					22,
					67
				],
				[
					-38,
					106
				]
			],
			[
				[
					3308,
					7817
				],
				[
					-3,
					143
				]
			],
			[
				[
					3305,
					7960
				],
				[
					35,
					21
				]
			],
			[
				[
					3340,
					7981
				],
				[
					76,
					-74
				]
			],
			[
				[
					3416,
					7907
				],
				[
					148,
					-113
				],
				[
					113,
					-34
				]
			],
			[
				[
					3095,
					7905
				],
				[
					-16,
					30
				]
			],
			[
				[
					3079,
					7935
				],
				[
					127,
					76
				]
			],
			[
				[
					3206,
					8011
				],
				[
					41,
					-21
				]
			],
			[
				[
					3247,
					7990
				],
				[
					58,
					-30
				]
			],
			[
				[
					3308,
					7817
				],
				[
					-80,
					25
				],
				[
					-116,
					88
				],
				[
					-17,
					-25
				]
			],
			[
				[
					6370,
					1738
				],
				[
					-10,
					19
				]
			],
			[
				[
					6360,
					1757
				],
				[
					40,
					19
				],
				[
					10,
					123
				]
			],
			[
				[
					6505,
					1956
				],
				[
					30,
					-49
				]
			],
			[
				[
					6535,
					1907
				],
				[
					1,
					-91
				]
			],
			[
				[
					6536,
					1816
				],
				[
					5,
					-111
				]
			],
			[
				[
					6541,
					1705
				],
				[
					-17,
					-4
				]
			],
			[
				[
					6524,
					1701
				],
				[
					-63,
					-4
				]
			],
			[
				[
					6461,
					1697
				],
				[
					-61,
					7
				]
			],
			[
				[
					6233,
					1257
				],
				[
					-35,
					60
				]
			],
			[
				[
					6319,
					1329
				],
				[
					22,
					-49
				]
			],
			[
				[
					6341,
					1280
				],
				[
					-108,
					-23
				]
			],
			[
				[
					6014,
					5307
				],
				[
					-55,
					53
				],
				[
					-167,
					3
				]
			],
			[
				[
					5792,
					5363
				],
				[
					17,
					31
				]
			],
			[
				[
					5809,
					5394
				],
				[
					-2,
					149
				]
			],
			[
				[
					5807,
					5543
				],
				[
					35,
					35
				],
				[
					143,
					9
				],
				[
					95,
					94
				],
				[
					102,
					59
				],
				[
					162,
					28
				]
			],
			[
				[
					6344,
					5768
				],
				[
					98,
					-49
				],
				[
					-99,
					-111
				],
				[
					20,
					-107
				]
			],
			[
				[
					4350,
					4260
				],
				[
					-19,
					88
				]
			],
			[
				[
					4390,
					4501
				],
				[
					18,
					78
				]
			],
			[
				[
					4408,
					4579
				],
				[
					25,
					-56
				],
				[
					99,
					26
				],
				[
					30,
					-77
				],
				[
					66,
					66
				]
			],
			[
				[
					4628,
					4538
				],
				[
					24,
					-62
				]
			],
			[
				[
					4669,
					4188
				],
				[
					-72,
					-51
				],
				[
					-71,
					64
				],
				[
					-74,
					-16
				]
			],
			[
				[
					4140,
					8213
				],
				[
					50,
					-31
				]
			],
			[
				[
					4190,
					8182
				],
				[
					-11,
					-25
				]
			],
			[
				[
					4179,
					8157
				],
				[
					-22,
					-24
				]
			],
			[
				[
					4157,
					8133
				],
				[
					-67,
					32
				]
			],
			[
				[
					4090,
					8165
				],
				[
					0,
					17
				]
			],
			[
				[
					4090,
					8182
				],
				[
					50,
					31
				]
			],
			[
				[
					4090,
					8182
				],
				[
					-6,
					-4
				]
			],
			[
				[
					4084,
					8178
				],
				[
					-28,
					49
				]
			],
			[
				[
					4056,
					8227
				],
				[
					84,
					-14
				]
			],
			[
				[
					4086,
					8098
				],
				[
					4,
					67
				]
			],
			[
				[
					4157,
					8133
				],
				[
					-71,
					-35
				]
			],
			[
				[
					3955,
					8110
				],
				[
					129,
					68
				]
			],
			[
				[
					4086,
					8098
				],
				[
					-118,
					-85
				]
			],
			[
				[
					3949,
					8007
				],
				[
					6,
					103
				]
			],
			[
				[
					6436,
					2333
				],
				[
					11,
					53
				]
			],
			[
				[
					6447,
					2386
				],
				[
					48,
					1
				]
			],
			[
				[
					6495,
					2387
				],
				[
					-1,
					-3
				]
			],
			[
				[
					6478,
					2334
				],
				[
					-6,
					-5
				]
			],
			[
				[
					6472,
					2329
				],
				[
					-36,
					4
				]
			],
			[
				[
					4314,
					4644
				],
				[
					69,
					-7
				]
			],
			[
				[
					4383,
					4637
				],
				[
					21,
					-13
				]
			],
			[
				[
					4404,
					4624
				],
				[
					4,
					-45
				]
			],
			[
				[
					4149,
					4593
				],
				[
					165,
					51
				]
			],
			[
				[
					5390,
					5343
				],
				[
					-61,
					62
				]
			],
			[
				[
					5329,
					5405
				],
				[
					6,
					19
				]
			],
			[
				[
					5335,
					5424
				],
				[
					115,
					52
				],
				[
					70,
					-10
				],
				[
					4,
					-259
				]
			],
			[
				[
					5524,
					5207
				],
				[
					-95,
					-28
				]
			],
			[
				[
					5429,
					5179
				],
				[
					-67,
					40
				]
			],
			[
				[
					5362,
					5219
				],
				[
					35,
					34
				]
			],
			[
				[
					5397,
					5253
				],
				[
					51,
					31
				],
				[
					-58,
					59
				]
			],
			[
				[
					6526,
					2108
				],
				[
					-16,
					30
				]
			],
			[
				[
					6510,
					2138
				],
				[
					59,
					21
				]
			],
			[
				[
					6569,
					2159
				],
				[
					8,
					-5
				]
			],
			[
				[
					6577,
					2154
				],
				[
					-17,
					-59
				]
			],
			[
				[
					6495,
					2430
				],
				[
					0,
					-43
				]
			],
			[
				[
					6447,
					2386
				],
				[
					-67,
					51
				]
			],
			[
				[
					6380,
					2437
				],
				[
					0,
					3
				]
			],
			[
				[
					6366,
					2414
				],
				[
					14,
					23
				]
			],
			[
				[
					6436,
					2333
				],
				[
					-7,
					0
				]
			],
			[
				[
					6429,
					2333
				],
				[
					-30,
					2
				]
			],
			[
				[
					6601,
					2350
				],
				[
					-67,
					-7
				]
			],
			[
				[
					6493,
					2487
				],
				[
					128,
					12
				]
			],
			[
				[
					6260,
					1953
				],
				[
					59,
					72
				]
			],
			[
				[
					6319,
					2025
				],
				[
					32,
					-54
				]
			],
			[
				[
					6351,
					1971
				],
				[
					-52,
					-64
				]
			],
			[
				[
					6299,
					1907
				],
				[
					-39,
					46
				]
			],
			[
				[
					5472,
					4066
				],
				[
					29,
					112
				]
			],
			[
				[
					5571,
					4062
				],
				[
					-22,
					-25
				]
			],
			[
				[
					5549,
					4037
				],
				[
					-38,
					-1
				]
			],
			[
				[
					5511,
					4036
				],
				[
					-39,
					30
				]
			],
			[
				[
					6588,
					2151
				],
				[
					-11,
					3
				]
			],
			[
				[
					6569,
					2159
				],
				[
					-6,
					29
				]
			],
			[
				[
					6178,
					2030
				],
				[
					37,
					33
				]
			],
			[
				[
					6215,
					2063
				],
				[
					49,
					-20
				]
			],
			[
				[
					6264,
					2043
				],
				[
					-9,
					-87
				]
			],
			[
				[
					6255,
					1956
				],
				[
					-87,
					-3
				]
			],
			[
				[
					6168,
					1953
				],
				[
					10,
					77
				]
			],
			[
				[
					3478,
					8287
				],
				[
					148,
					31
				],
				[
					2,
					67
				]
			],
			[
				[
					3628,
					8385
				],
				[
					57,
					-38
				]
			],
			[
				[
					3685,
					8347
				],
				[
					40,
					-47
				]
			],
			[
				[
					3725,
					8300
				],
				[
					28,
					-70
				],
				[
					-154,
					-35
				]
			],
			[
				[
					5664,
					1322
				],
				[
					-45,
					-25
				]
			],
			[
				[
					5619,
					1297
				],
				[
					-51,
					-33
				]
			],
			[
				[
					5568,
					1264
				],
				[
					-52,
					36
				]
			],
			[
				[
					5551,
					1376
				],
				[
					113,
					-54
				]
			],
			[
				[
					6927,
					1969
				],
				[
					29,
					-7
				]
			],
			[
				[
					6956,
					1962
				],
				[
					60,
					-57
				],
				[
					107,
					5
				],
				[
					86,
					86
				]
			],
			[
				[
					6985,
					1703
				],
				[
					-86,
					87
				],
				[
					17,
					107
				],
				[
					-37,
					16
				]
			],
			[
				[
					6212,
					2118
				],
				[
					-3,
					-36
				]
			],
			[
				[
					6209,
					2082
				],
				[
					-51,
					46
				]
			],
			[
				[
					6158,
					2128
				],
				[
					39,
					58
				]
			],
			[
				[
					4471,
					2217
				],
				[
					-7,
					63
				]
			],
			[
				[
					4464,
					2280
				],
				[
					33,
					33
				]
			],
			[
				[
					4497,
					2313
				],
				[
					10,
					7
				]
			],
			[
				[
					4507,
					2320
				],
				[
					102,
					-45
				],
				[
					20,
					-75
				]
			],
			[
				[
					4629,
					2200
				],
				[
					-15,
					-50
				]
			],
			[
				[
					6375,
					2284
				],
				[
					-2,
					-2
				]
			],
			[
				[
					6373,
					2282
				],
				[
					-30,
					-21
				]
			],
			[
				[
					6329,
					2282
				],
				[
					28,
					54
				]
			],
			[
				[
					6386,
					2329
				],
				[
					-11,
					-45
				]
			],
			[
				[
					7145,
					1408
				],
				[
					-55,
					91
				]
			],
			[
				[
					7423,
					1644
				],
				[
					-129,
					-57
				],
				[
					-58,
					-93
				],
				[
					4,
					-99
				],
				[
					-95,
					13
				]
			],
			[
				[
					4497,
					2313
				],
				[
					-14,
					100
				],
				[
					26,
					213
				]
			],
			[
				[
					4509,
					2626
				],
				[
					158,
					95
				],
				[
					-21,
					55
				]
			],
			[
				[
					4646,
					2776
				],
				[
					-8,
					115
				],
				[
					96,
					-2
				]
			],
			[
				[
					4734,
					2889
				],
				[
					19,
					-62
				],
				[
					114,
					28
				]
			],
			[
				[
					4867,
					2855
				],
				[
					-64,
					-162
				]
			],
			[
				[
					4803,
					2693
				],
				[
					-29,
					-58
				]
			],
			[
				[
					4774,
					2635
				],
				[
					-182,
					-203
				]
			],
			[
				[
					4592,
					2432
				],
				[
					-85,
					-112
				]
			],
			[
				[
					4238,
					5321
				],
				[
					101,
					41
				],
				[
					95,
					-92
				]
			],
			[
				[
					4434,
					5270
				],
				[
					-11,
					-44
				]
			],
			[
				[
					4423,
					5226
				],
				[
					-88,
					-32
				],
				[
					-145,
					9
				]
			],
			[
				[
					4190,
					5203
				],
				[
					5,
					48
				]
			],
			[
				[
					6131,
					4511
				],
				[
					-119,
					23
				]
			],
			[
				[
					6012,
					4534
				],
				[
					-10,
					-4
				]
			],
			[
				[
					6002,
					4530
				],
				[
					-83,
					10
				],
				[
					17,
					99
				]
			],
			[
				[
					5947,
					4908
				],
				[
					87,
					-10
				],
				[
					-4,
					-73
				],
				[
					119,
					22
				],
				[
					50,
					58
				],
				[
					-65,
					38
				]
			],
			[
				[
					6404,
					4795
				],
				[
					-36,
					6
				],
				[
					-57,
					-130
				],
				[
					36,
					-94
				],
				[
					-55,
					-33
				],
				[
					-6,
					-95
				]
			],
			[
				[
					6286,
					4449
				],
				[
					-48,
					66
				],
				[
					-107,
					-4
				]
			],
			[
				[
					4314,
					4644
				],
				[
					-18,
					34
				]
			],
			[
				[
					4296,
					4678
				],
				[
					19,
					28
				]
			],
			[
				[
					4315,
					4706
				],
				[
					21,
					48
				]
			],
			[
				[
					4336,
					4754
				],
				[
					56,
					-9
				]
			],
			[
				[
					4392,
					4745
				],
				[
					22,
					-24
				]
			],
			[
				[
					4414,
					4721
				],
				[
					-31,
					-84
				]
			],
			[
				[
					5295,
					6859
				],
				[
					37,
					-10
				]
			],
			[
				[
					5332,
					6849
				],
				[
					10,
					-39
				]
			],
			[
				[
					5342,
					6810
				],
				[
					-19,
					-9
				]
			],
			[
				[
					5240,
					6854
				],
				[
					55,
					5
				]
			],
			[
				[
					5686,
					4138
				],
				[
					-50,
					65
				]
			],
			[
				[
					5636,
					4203
				],
				[
					-11,
					24
				]
			],
			[
				[
					5625,
					4227
				],
				[
					96,
					-19
				]
			],
			[
				[
					5721,
					4208
				],
				[
					25,
					-20
				]
			],
			[
				[
					5746,
					4188
				],
				[
					-60,
					-50
				]
			],
			[
				[
					6989,
					2070
				],
				[
					-33,
					-108
				]
			],
			[
				[
					6907,
					2023
				],
				[
					82,
					47
				]
			],
			[
				[
					3300,
					8075
				],
				[
					26,
					-19
				]
			],
			[
				[
					3326,
					8056
				],
				[
					14,
					-16
				]
			],
			[
				[
					3340,
					8040
				],
				[
					-23,
					-28
				]
			],
			[
				[
					3317,
					8012
				],
				[
					-56,
					22
				]
			],
			[
				[
					3261,
					8034
				],
				[
					0,
					33
				]
			],
			[
				[
					3261,
					8067
				],
				[
					4,
					4
				]
			],
			[
				[
					3265,
					8071
				],
				[
					35,
					4
				]
			],
			[
				[
					3413,
					8027
				],
				[
					-2,
					-5
				]
			],
			[
				[
					3411,
					8022
				],
				[
					-71,
					18
				]
			],
			[
				[
					3326,
					8056
				],
				[
					44,
					37
				]
			],
			[
				[
					3295,
					8140
				],
				[
					5,
					-65
				]
			],
			[
				[
					3265,
					8071
				],
				[
					-17,
					44
				]
			],
			[
				[
					3198,
					8100
				],
				[
					10,
					43
				]
			],
			[
				[
					3261,
					8067
				],
				[
					-34,
					12
				]
			],
			[
				[
					3227,
					8079
				],
				[
					-29,
					21
				]
			],
			[
				[
					3247,
					7990
				],
				[
					14,
					44
				]
			],
			[
				[
					3317,
					8012
				],
				[
					23,
					-31
				]
			],
			[
				[
					3206,
					8011
				],
				[
					9,
					25
				]
			],
			[
				[
					3215,
					8036
				],
				[
					12,
					43
				]
			],
			[
				[
					4252,
					8505
				],
				[
					-83,
					-73
				]
			],
			[
				[
					4169,
					8432
				],
				[
					-117,
					-30
				],
				[
					-42,
					73
				]
			],
			[
				[
					4010,
					8475
				],
				[
					25,
					89
				]
			],
			[
				[
					4035,
					8564
				],
				[
					196,
					11
				],
				[
					21,
					-70
				]
			],
			[
				[
					4803,
					2693
				],
				[
					54,
					-42
				]
			],
			[
				[
					4857,
					2651
				],
				[
					-83,
					-16
				]
			],
			[
				[
					5619,
					1297
				],
				[
					36,
					-39
				]
			],
			[
				[
					5655,
					1258
				],
				[
					2,
					-39
				]
			],
			[
				[
					5657,
					1219
				],
				[
					-89,
					45
				]
			],
			[
				[
					3317,
					2417
				],
				[
					112,
					-13
				],
				[
					65,
					152
				]
			],
			[
				[
					3541,
					2552
				],
				[
					67,
					-113
				]
			],
			[
				[
					3608,
					2439
				],
				[
					-114,
					-47
				]
			],
			[
				[
					3494,
					2392
				],
				[
					-39,
					-41
				],
				[
					53,
					-46
				]
			],
			[
				[
					3508,
					2305
				],
				[
					9,
					-30
				],
				[
					-132,
					-2
				],
				[
					-46,
					-39
				],
				[
					-81,
					98
				],
				[
					59,
					85
				]
			],
			[
				[
					6310,
					4081
				],
				[
					-16,
					-263
				],
				[
					-64,
					-68
				]
			],
			[
				[
					6230,
					3750
				],
				[
					-99,
					-27
				]
			],
			[
				[
					6131,
					3723
				],
				[
					49,
					88
				],
				[
					-175,
					67
				],
				[
					-76,
					227
				]
			],
			[
				[
					5929,
					4105
				],
				[
					202,
					41
				],
				[
					43,
					-91
				],
				[
					136,
					26
				]
			],
			[
				[
					6742,
					2145
				],
				[
					63,
					-28
				]
			],
			[
				[
					6805,
					2117
				],
				[
					35,
					20
				]
			],
			[
				[
					6840,
					2137
				],
				[
					32,
					-64
				],
				[
					-67,
					-85
				]
			],
			[
				[
					6797,
					1974
				],
				[
					-36,
					-18
				]
			],
			[
				[
					6425,
					5008
				],
				[
					44,
					-19
				]
			],
			[
				[
					7729,
					3569
				],
				[
					14,
					85
				]
			],
			[
				[
					7669,
					3778
				],
				[
					95,
					83
				]
			],
			[
				[
					7764,
					3861
				],
				[
					53,
					-158
				],
				[
					-4,
					-126
				]
			],
			[
				[
					7813,
					3577
				],
				[
					-84,
					-8
				]
			],
			[
				[
					6494,
					2145
				],
				[
					-8,
					24
				]
			],
			[
				[
					6486,
					2169
				],
				[
					23,
					25
				]
			],
			[
				[
					6509,
					2194
				],
				[
					2,
					-2
				]
			],
			[
				[
					6510,
					2138
				],
				[
					-16,
					7
				]
			],
			[
				[
					5977,
					1831
				],
				[
					74,
					68
				],
				[
					48,
					-24
				]
			],
			[
				[
					6099,
					1875
				],
				[
					24,
					-115
				],
				[
					66,
					-14
				],
				[
					-1,
					-91
				]
			],
			[
				[
					6188,
					1655
				],
				[
					-55,
					-15
				]
			],
			[
				[
					6085,
					1627
				],
				[
					21,
					112
				],
				[
					-65,
					54
				],
				[
					-99,
					18
				]
			],
			[
				[
					5942,
					1811
				],
				[
					35,
					20
				]
			],
			[
				[
					6457,
					2291
				],
				[
					13,
					-21
				]
			],
			[
				[
					6470,
					2270
				],
				[
					-24,
					-21
				]
			],
			[
				[
					6446,
					2249
				],
				[
					-21,
					25
				]
			],
			[
				[
					6425,
					2274
				],
				[
					32,
					17
				]
			],
			[
				[
					6440,
					2249
				],
				[
					6,
					0
				]
			],
			[
				[
					6470,
					2270
				],
				[
					11,
					-1
				]
			],
			[
				[
					6481,
					2269
				],
				[
					10,
					-13
				]
			],
			[
				[
					6491,
					2256
				],
				[
					0,
					-11
				]
			],
			[
				[
					6439,
					2214
				],
				[
					1,
					35
				]
			],
			[
				[
					4928,
					3460
				],
				[
					17,
					49
				]
			],
			[
				[
					4951,
					3534
				],
				[
					20,
					-8
				]
			],
			[
				[
					4971,
					3526
				],
				[
					18,
					-43
				]
			],
			[
				[
					5036,
					5267
				],
				[
					17,
					2
				]
			],
			[
				[
					5053,
					5269
				],
				[
					24,
					-9
				]
			],
			[
				[
					6229,
					5290
				],
				[
					-25,
					-49
				]
			],
			[
				[
					6204,
					5241
				],
				[
					-49,
					-82
				]
			],
			[
				[
					5821,
					5187
				],
				[
					-29,
					176
				]
			],
			[
				[
					4414,
					4721
				],
				[
					65,
					6
				]
			],
			[
				[
					4479,
					4727
				],
				[
					12,
					-43
				]
			],
			[
				[
					4491,
					4684
				],
				[
					-87,
					-60
				]
			],
			[
				[
					6332,
					2228
				],
				[
					24,
					-59
				]
			],
			[
				[
					6334,
					2162
				],
				[
					-14,
					8
				]
			],
			[
				[
					6373,
					2282
				],
				[
					10,
					-45
				]
			],
			[
				[
					6383,
					2237
				],
				[
					-42,
					-13
				]
			],
			[
				[
					6341,
					2224
				],
				[
					-6,
					3
				]
			],
			[
				[
					5656,
					3423
				],
				[
					50,
					190
				],
				[
					-63,
					39
				]
			],
			[
				[
					5643,
					3652
				],
				[
					38,
					38
				]
			],
			[
				[
					5681,
					3690
				],
				[
					17,
					3
				]
			],
			[
				[
					5698,
					3693
				],
				[
					141,
					-140
				]
			],
			[
				[
					5839,
					3553
				],
				[
					-14,
					-73
				]
			],
			[
				[
					6514,
					2543
				],
				[
					115,
					78
				]
			],
			[
				[
					6629,
					2621
				],
				[
					53,
					-57
				]
			],
			[
				[
					5493,
					5673
				],
				[
					34,
					-29
				]
			],
			[
				[
					5527,
					5644
				],
				[
					-185,
					-150
				]
			],
			[
				[
					5342,
					5494
				],
				[
					-60,
					54
				],
				[
					26,
					81
				],
				[
					185,
					44
				]
			],
			[
				[
					6265,
					2297
				],
				[
					-25,
					24
				]
			],
			[
				[
					6240,
					2321
				],
				[
					-14,
					28
				]
			],
			[
				[
					6226,
					2349
				],
				[
					5,
					4
				]
			],
			[
				[
					6231,
					2353
				],
				[
					43,
					17
				]
			],
			[
				[
					6274,
					2370
				],
				[
					29,
					-48
				]
			],
			[
				[
					6219,
					2261
				],
				[
					-6,
					21
				]
			],
			[
				[
					6213,
					2282
				],
				[
					27,
					39
				]
			],
			[
				[
					5464,
					6422
				],
				[
					28,
					64
				]
			],
			[
				[
					5571,
					6530
				],
				[
					69,
					-102
				]
			],
			[
				[
					5640,
					6428
				],
				[
					-8,
					-25
				]
			],
			[
				[
					5632,
					6403
				],
				[
					-168,
					19
				]
			],
			[
				[
					7184,
					2545
				],
				[
					-12,
					108
				]
			],
			[
				[
					7139,
					2721
				],
				[
					-78,
					-35
				],
				[
					-31,
					39
				]
			],
			[
				[
					7092,
					2815
				],
				[
					137,
					14
				],
				[
					41,
					-32
				],
				[
					152,
					-5
				]
			],
			[
				[
					7422,
					2792
				],
				[
					28,
					-78
				]
			],
			[
				[
					7263,
					2592
				],
				[
					-79,
					-47
				]
			],
			[
				[
					7145,
					1408
				],
				[
					-82,
					-6
				],
				[
					-56,
					-62
				],
				[
					-126,
					-41
				]
			],
			[
				[
					5731,
					1226
				],
				[
					-1,
					16
				]
			],
			[
				[
					5730,
					1242
				],
				[
					-20,
					78
				]
			],
			[
				[
					5710,
					1320
				],
				[
					87,
					23
				]
			],
			[
				[
					5802,
					1213
				],
				[
					-71,
					13
				]
			],
			[
				[
					6120,
					2145
				],
				[
					15,
					35
				]
			],
			[
				[
					6138,
					2200
				],
				[
					51,
					41
				]
			],
			[
				[
					6158,
					2128
				],
				[
					-38,
					17
				]
			],
			[
				[
					4929,
					4797
				],
				[
					50,
					-10
				]
			],
			[
				[
					4979,
					4787
				],
				[
					-4,
					-81
				]
			],
			[
				[
					4975,
					4706
				],
				[
					-73,
					-7
				]
			],
			[
				[
					4898,
					4741
				],
				[
					2,
					59
				]
			],
			[
				[
					6087,
					2627
				],
				[
					57,
					35
				]
			],
			[
				[
					6144,
					2662
				],
				[
					55,
					-16
				]
			],
			[
				[
					6199,
					2646
				],
				[
					-13,
					-135
				]
			],
			[
				[
					6186,
					2511
				],
				[
					-14,
					-54
				]
			],
			[
				[
					6172,
					2457
				],
				[
					-20,
					-6
				]
			],
			[
				[
					6152,
					2451
				],
				[
					-86,
					149
				]
			],
			[
				[
					5395,
					5117
				],
				[
					91,
					39
				],
				[
					73,
					-74
				]
			],
			[
				[
					5559,
					5082
				],
				[
					17,
					-38
				]
			],
			[
				[
					5374,
					5016
				],
				[
					21,
					101
				]
			],
			[
				[
					6274,
					2370
				],
				[
					28,
					8
				]
			],
			[
				[
					5829,
					2247
				],
				[
					-23,
					-104
				]
			],
			[
				[
					5806,
					2143
				],
				[
					-60,
					1
				]
			],
			[
				[
					5746,
					2144
				],
				[
					-72,
					29
				]
			],
			[
				[
					5674,
					2173
				],
				[
					-29,
					71
				]
			],
			[
				[
					5645,
					2244
				],
				[
					19,
					104
				],
				[
					-123,
					50
				]
			],
			[
				[
					5541,
					2398
				],
				[
					28,
					92
				]
			],
			[
				[
					5569,
					2490
				],
				[
					46,
					55
				],
				[
					-55,
					27
				]
			],
			[
				[
					5560,
					2572
				],
				[
					-62,
					70
				]
			],
			[
				[
					5498,
					2642
				],
				[
					26,
					83
				]
			],
			[
				[
					5800,
					2369
				],
				[
					29,
					-122
				]
			],
			[
				[
					4167,
					3018
				],
				[
					274,
					-88
				],
				[
					42,
					28
				],
				[
					59,
					-193
				],
				[
					104,
					11
				]
			],
			[
				[
					4509,
					2626
				],
				[
					-80,
					27
				],
				[
					-89,
					117
				],
				[
					-70,
					-38
				],
				[
					-75,
					106
				]
			],
			[
				[
					6597,
					2705
				],
				[
					45,
					12
				],
				[
					-13,
					-96
				]
			],
			[
				[
					6429,
					2504
				],
				[
					5,
					10
				]
			],
			[
				[
					6434,
					2514
				],
				[
					-16,
					89
				],
				[
					97,
					28
				],
				[
					82,
					74
				]
			],
			[
				[
					6231,
					2353
				],
				[
					-10,
					93
				]
			],
			[
				[
					6221,
					2446
				],
				[
					91,
					50
				]
			],
			[
				[
					6312,
					2496
				],
				[
					62,
					-36
				]
			],
			[
				[
					4745,
					7397
				],
				[
					124,
					-76
				],
				[
					30,
					-155
				],
				[
					95,
					0
				],
				[
					39,
					-92
				],
				[
					-27,
					-61
				],
				[
					105,
					-26
				],
				[
					15,
					99
				],
				[
					45,
					4
				]
			],
			[
				[
					5171,
					7090
				],
				[
					112,
					-35
				]
			],
			[
				[
					5275,
					6991
				],
				[
					-4,
					-2
				]
			],
			[
				[
					5271,
					6989
				],
				[
					-50,
					9
				],
				[
					-49,
					-121
				]
			],
			[
				[
					5133,
					6775
				],
				[
					-37,
					-74
				],
				[
					-83,
					24
				],
				[
					-120,
					-36
				],
				[
					-56,
					-78
				],
				[
					-73,
					10
				]
			],
			[
				[
					4764,
					6621
				],
				[
					-75,
					88
				],
				[
					-64,
					-63
				],
				[
					-82,
					100
				],
				[
					43,
					57
				],
				[
					-40,
					60
				],
				[
					89,
					97
				],
				[
					-131,
					126
				],
				[
					-25,
					71
				]
			],
			[
				[
					4848,
					5087
				],
				[
					33,
					-95
				]
			],
			[
				[
					4881,
					4992
				],
				[
					-23,
					-72
				]
			],
			[
				[
					4794,
					5035
				],
				[
					54,
					52
				]
			],
			[
				[
					5132,
					4910
				],
				[
					80,
					-138
				]
			],
			[
				[
					5212,
					4772
				],
				[
					47,
					-36
				]
			],
			[
				[
					5075,
					4477
				],
				[
					-67,
					18
				]
			],
			[
				[
					5008,
					4495
				],
				[
					-33,
					211
				]
			],
			[
				[
					4979,
					4787
				],
				[
					47,
					107
				]
			],
			[
				[
					5026,
					4894
				],
				[
					40,
					39
				]
			],
			[
				[
					6199,
					2646
				],
				[
					49,
					12
				],
				[
					-35,
					89
				]
			],
			[
				[
					6213,
					2747
				],
				[
					14,
					91
				],
				[
					64,
					24
				]
			],
			[
				[
					6291,
					2862
				],
				[
					17,
					-29
				]
			],
			[
				[
					6308,
					2833
				],
				[
					73,
					-80
				]
			],
			[
				[
					6381,
					2753
				],
				[
					-48,
					13
				],
				[
					-35,
					-121
				]
			],
			[
				[
					6298,
					2645
				],
				[
					5,
					-97
				]
			],
			[
				[
					6303,
					2548
				],
				[
					-117,
					-37
				]
			],
			[
				[
					6396,
					2280
				],
				[
					10,
					-28
				]
			],
			[
				[
					6406,
					2252
				],
				[
					18,
					-40
				]
			],
			[
				[
					6393,
					2220
				],
				[
					-10,
					17
				]
			],
			[
				[
					6375,
					2284
				],
				[
					21,
					-4
				]
			],
			[
				[
					6653,
					2263
				],
				[
					-1,
					93
				]
			],
			[
				[
					6739,
					2275
				],
				[
					7,
					-34
				]
			],
			[
				[
					6746,
					2241
				],
				[
					-60,
					-22
				]
			],
			[
				[
					6429,
					2333
				],
				[
					-5,
					-58
				]
			],
			[
				[
					6424,
					2275
				],
				[
					-28,
					5
				]
			],
			[
				[
					6188,
					1655
				],
				[
					124,
					45
				]
			],
			[
				[
					6461,
					1697
				],
				[
					-5,
					-139
				],
				[
					-79,
					37
				],
				[
					-58,
					-63
				]
			],
			[
				[
					5372,
					6683
				],
				[
					-2,
					46
				]
			],
			[
				[
					5370,
					6729
				],
				[
					59,
					28
				]
			],
			[
				[
					5429,
					6757
				],
				[
					44,
					-47
				]
			],
			[
				[
					6385,
					1273
				],
				[
					-44,
					7
				]
			],
			[
				[
					6152,
					3317
				],
				[
					129,
					-36
				],
				[
					2,
					91
				],
				[
					53,
					1
				],
				[
					133,
					-89
				]
			],
			[
				[
					6469,
					3284
				],
				[
					-113,
					-148
				],
				[
					72,
					-29
				],
				[
					-88,
					-33
				]
			],
			[
				[
					6340,
					3074
				],
				[
					-117,
					102
				],
				[
					-70,
					119
				]
			],
			[
				[
					4648,
					5260
				],
				[
					93,
					18
				]
			],
			[
				[
					4771,
					5216
				],
				[
					-3,
					-86
				],
				[
					-100,
					64
				]
			],
			[
				[
					6534,
					2289
				],
				[
					-10,
					18
				]
			],
			[
				[
					6607,
					2353
				],
				[
					8,
					-33
				]
			],
			[
				[
					6600,
					2297
				],
				[
					-66,
					-8
				]
			],
			[
				[
					6543,
					2270
				],
				[
					-9,
					19
				]
			],
			[
				[
					2928,
					8047
				],
				[
					-36,
					58
				],
				[
					-69,
					-24
				]
			],
			[
				[
					2823,
					8081
				],
				[
					9,
					91
				],
				[
					62,
					40
				],
				[
					93,
					-46
				]
			],
			[
				[
					2987,
					8166
				],
				[
					43,
					-1
				]
			],
			[
				[
					3030,
					8165
				],
				[
					4,
					-1
				]
			],
			[
				[
					3034,
					8164
				],
				[
					-16,
					-127
				]
			],
			[
				[
					3018,
					8037
				],
				[
					-90,
					10
				]
			],
			[
				[
					3102,
					9334
				],
				[
					-81,
					321
				],
				[
					-154,
					119
				],
				[
					-99,
					-45
				],
				[
					-94,
					32
				],
				[
					-5,
					75
				],
				[
					191,
					52
				],
				[
					60,
					130
				],
				[
					121,
					85
				],
				[
					70,
					111
				],
				[
					88,
					59
				]
			],
			[
				[
					3199,
					10273
				],
				[
					162,
					-13
				],
				[
					95,
					88
				],
				[
					16,
					62
				],
				[
					121,
					-17
				],
				[
					77,
					57
				]
			],
			[
				[
					3670,
					10450
				],
				[
					62,
					-193
				],
				[
					-11,
					-74
				],
				[
					142,
					34
				],
				[
					86,
					-120
				],
				[
					-76,
					-100
				],
				[
					34,
					-22
				],
				[
					-1,
					-139
				],
				[
					-175,
					-111
				]
			],
			[
				[
					3731,
					9725
				],
				[
					-88,
					-215
				]
			],
			[
				[
					3643,
					9510
				],
				[
					-124,
					-1
				],
				[
					-1,
					-48
				],
				[
					-165,
					10
				],
				[
					-31,
					-66
				],
				[
					-110,
					-34
				],
				[
					-51,
					-79
				],
				[
					-59,
					42
				]
			],
			[
				[
					7411,
					2916
				],
				[
					-27,
					-28
				]
			],
			[
				[
					7384,
					2888
				],
				[
					-36,
					55
				]
			],
			[
				[
					6424,
					2275
				],
				[
					1,
					-1
				]
			],
			[
				[
					6440,
					2249
				],
				[
					-34,
					3
				]
			],
			[
				[
					4073,
					2453
				],
				[
					5,
					34
				]
			],
			[
				[
					4159,
					2444
				],
				[
					25,
					-96
				]
			],
			[
				[
					4184,
					2348
				],
				[
					-17,
					-30
				]
			],
			[
				[
					5332,
					6849
				],
				[
					21,
					31
				]
			],
			[
				[
					5353,
					6880
				],
				[
					58,
					6
				]
			],
			[
				[
					5411,
					6886
				],
				[
					44,
					-65
				]
			],
			[
				[
					5455,
					6821
				],
				[
					-14,
					-5
				]
			],
			[
				[
					5441,
					6816
				],
				[
					-99,
					-6
				]
			],
			[
				[
					4952,
					5320
				],
				[
					12,
					33
				]
			],
			[
				[
					4964,
					5353
				],
				[
					48,
					25
				],
				[
					18,
					115
				],
				[
					136,
					-42
				]
			],
			[
				[
					5166,
					5451
				],
				[
					-112,
					-117
				],
				[
					-1,
					-65
				]
			],
			[
				[
					5167,
					3329
				],
				[
					132,
					56
				]
			],
			[
				[
					5404,
					3365
				],
				[
					154,
					-49
				]
			],
			[
				[
					5539,
					3119
				],
				[
					-38,
					-32
				]
			],
			[
				[
					5392,
					2997
				],
				[
					12,
					26
				],
				[
					-132,
					81
				],
				[
					47,
					48
				]
			],
			[
				[
					5319,
					3152
				],
				[
					62,
					41
				],
				[
					-22,
					91
				],
				[
					-111,
					-39
				]
			],
			[
				[
					5248,
					3245
				],
				[
					-81,
					84
				]
			],
			[
				[
					6341,
					2224
				],
				[
					21,
					-24
				]
			],
			[
				[
					5839,
					3553
				],
				[
					65,
					3
				]
			],
			[
				[
					6028,
					3347
				],
				[
					-118,
					-19
				]
			],
			[
				[
					3481,
					7504
				],
				[
					-58,
					-29
				],
				[
					-86,
					55
				],
				[
					-57,
					-17
				],
				[
					-102,
					64
				]
			],
			[
				[
					3178,
					7577
				],
				[
					7,
					71
				],
				[
					-68,
					12
				],
				[
					-104,
					143
				]
			],
			[
				[
					3013,
					7803
				],
				[
					82,
					102
				]
			],
			[
				[
					6264,
					2043
				],
				[
					7,
					27
				]
			],
			[
				[
					6271,
					2070
				],
				[
					47,
					-5
				]
			],
			[
				[
					6318,
					2065
				],
				[
					5,
					-28
				]
			],
			[
				[
					6323,
					2037
				],
				[
					-4,
					-12
				]
			],
			[
				[
					6260,
					1953
				],
				[
					-5,
					3
				]
			],
			[
				[
					6253,
					5189
				],
				[
					-2,
					41
				]
			],
			[
				[
					6251,
					5230
				],
				[
					31,
					46
				]
			],
			[
				[
					6314,
					5194
				],
				[
					-61,
					-5
				]
			],
			[
				[
					6251,
					5230
				],
				[
					-47,
					11
				]
			],
			[
				[
					6253,
					5189
				],
				[
					-81,
					-27
				]
			],
			[
				[
					4629,
					2200
				],
				[
					66,
					-106
				]
			],
			[
				[
					4695,
					2094
				],
				[
					-81,
					-3
				]
			],
			[
				[
					4336,
					4754
				],
				[
					-8,
					2
				]
			],
			[
				[
					4328,
					4756
				],
				[
					-1,
					76
				]
			],
			[
				[
					4327,
					4832
				],
				[
					-23,
					16
				]
			],
			[
				[
					4304,
					4848
				],
				[
					26,
					38
				]
			],
			[
				[
					4330,
					4886
				],
				[
					48,
					-25
				]
			],
			[
				[
					4378,
					4861
				],
				[
					15,
					-24
				]
			],
			[
				[
					4393,
					4837
				],
				[
					-1,
					-92
				]
			],
			[
				[
					3416,
					7907
				],
				[
					38,
					13
				],
				[
					-43,
					102
				]
			],
			[
				[
					3462,
					7992
				],
				[
					84,
					-82
				],
				[
					46,
					22
				]
			],
			[
				[
					3686,
					7956
				],
				[
					115,
					38
				],
				[
					47,
					-36
				]
			],
			[
				[
					4645,
					5617
				],
				[
					-77,
					-42
				],
				[
					-55,
					-163
				]
			],
			[
				[
					4513,
					5412
				],
				[
					-52,
					50
				],
				[
					-213,
					-50
				]
			],
			[
				[
					4201,
					5408
				],
				[
					-7,
					73
				],
				[
					70,
					39
				]
			],
			[
				[
					4264,
					5520
				],
				[
					103,
					36
				],
				[
					-2,
					61
				],
				[
					209,
					106
				]
			],
			[
				[
					4574,
					5723
				],
				[
					71,
					-106
				]
			],
			[
				[
					5310,
					5240
				],
				[
					8,
					57
				]
			],
			[
				[
					5318,
					5297
				],
				[
					14,
					15
				]
			],
			[
				[
					5332,
					5312
				],
				[
					22,
					-13
				]
			],
			[
				[
					5354,
					5299
				],
				[
					43,
					-46
				]
			],
			[
				[
					5362,
					5219
				],
				[
					-52,
					21
				]
			],
			[
				[
					5354,
					5299
				],
				[
					36,
					44
				]
			],
			[
				[
					5332,
					5312
				],
				[
					-3,
					93
				]
			],
			[
				[
					5289,
					5335
				],
				[
					-78,
					75
				]
			],
			[
				[
					5211,
					5410
				],
				[
					-7,
					24
				]
			],
			[
				[
					5204,
					5434
				],
				[
					108,
					-1
				]
			],
			[
				[
					5312,
					5433
				],
				[
					23,
					-9
				]
			],
			[
				[
					5318,
					5297
				],
				[
					-29,
					38
				]
			],
			[
				[
					5310,
					5240
				],
				[
					-49,
					1
				]
			],
			[
				[
					5269,
					5258
				],
				[
					20,
					77
				]
			],
			[
				[
					5681,
					3690
				],
				[
					-25,
					39
				]
			],
			[
				[
					5656,
					3729
				],
				[
					-2,
					28
				]
			],
			[
				[
					5714,
					3743
				],
				[
					-16,
					-50
				]
			],
			[
				[
					5628,
					3681
				],
				[
					28,
					48
				]
			],
			[
				[
					5643,
					3652
				],
				[
					-15,
					29
				]
			],
			[
				[
					5628,
					3681
				],
				[
					-28,
					24
				]
			],
			[
				[
					4630,
					4828
				],
				[
					-65,
					-20
				]
			],
			[
				[
					4565,
					4808
				],
				[
					-27,
					48
				]
			],
			[
				[
					4538,
					4856
				],
				[
					61,
					56
				]
			],
			[
				[
					4657,
					4916
				],
				[
					-27,
					-88
				]
			],
			[
				[
					6661,
					1158
				],
				[
					-136,
					61
				]
			],
			[
				[
					6413,
					1434
				],
				[
					78,
					82
				]
			],
			[
				[
					6491,
					1516
				],
				[
					56,
					-103
				],
				[
					80,
					-44
				],
				[
					21,
					-85
				],
				[
					56,
					8
				]
			],
			[
				[
					6481,
					2178
				],
				[
					5,
					-9
				]
			],
			[
				[
					6494,
					2145
				],
				[
					-16,
					-36
				]
			],
			[
				[
					6478,
					2109
				],
				[
					-9,
					10
				]
			],
			[
				[
					6498,
					2071
				],
				[
					-20,
					38
				]
			],
			[
				[
					6481,
					2269
				],
				[
					32,
					45
				]
			],
			[
				[
					6530,
					2261
				],
				[
					-39,
					-5
				]
			],
			[
				[
					5033,
					3981
				],
				[
					-12,
					72
				]
			],
			[
				[
					5247,
					3903
				],
				[
					-26,
					-56
				]
			],
			[
				[
					5221,
					3847
				],
				[
					-22,
					-106
				],
				[
					-97,
					23
				],
				[
					-32,
					-37
				]
			],
			[
				[
					5041,
					3903
				],
				[
					-8,
					78
				]
			],
			[
				[
					6131,
					4511
				],
				[
					2,
					-97
				],
				[
					-51,
					11
				],
				[
					-70,
					109
				]
			],
			[
				[
					3725,
					8300
				],
				[
					201,
					-56
				]
			],
			[
				[
					3926,
					8244
				],
				[
					-13,
					-43
				]
			],
			[
				[
					3913,
					8201
				],
				[
					-85,
					10
				],
				[
					6,
					-54
				],
				[
					-148,
					-123
				]
			],
			[
				[
					4242,
					4749
				],
				[
					-10,
					46
				]
			],
			[
				[
					4265,
					4805
				],
				[
					9,
					-39
				]
			],
			[
				[
					4274,
					4766
				],
				[
					41,
					-60
				]
			],
			[
				[
					4296,
					4678
				],
				[
					-31,
					26
				]
			],
			[
				[
					4276,
					4838
				],
				[
					28,
					10
				]
			],
			[
				[
					4327,
					4832
				],
				[
					-42,
					-57
				]
			],
			[
				[
					4285,
					4775
				],
				[
					-11,
					-9
				]
			],
			[
				[
					4285,
					4775
				],
				[
					43,
					-19
				]
			],
			[
				[
					3913,
					8201
				],
				[
					42,
					-91
				]
			],
			[
				[
					3192,
					2502
				],
				[
					10,
					6
				]
			],
			[
				[
					3317,
					2417
				],
				[
					-40,
					-15
				],
				[
					-85,
					100
				]
			],
			[
				[
					5565,
					3852
				],
				[
					-66,
					28
				],
				[
					55,
					72
				]
			],
			[
				[
					5554,
					3952
				],
				[
					24,
					-23
				],
				[
					146,
					30
				]
			],
			[
				[
					5724,
					3959
				],
				[
					-8,
					-47
				]
			],
			[
				[
					6356,
					4301
				],
				[
					-70,
					148
				]
			],
			[
				[
					6526,
					4928
				],
				[
					95,
					-56
				],
				[
					59,
					-112
				],
				[
					87,
					-271
				]
			],
			[
				[
					4072,
					3471
				],
				[
					152,
					65
				],
				[
					17,
					97
				],
				[
					-79,
					-43
				],
				[
					50,
					167
				]
			],
			[
				[
					4212,
					3757
				],
				[
					67,
					-6
				],
				[
					86,
					-133
				],
				[
					78,
					-28
				],
				[
					178,
					118
				]
			],
			[
				[
					4621,
					3708
				],
				[
					64,
					21
				]
			],
			[
				[
					4685,
					3729
				],
				[
					72,
					-41
				]
			],
			[
				[
					4757,
					3688
				],
				[
					45,
					-69
				],
				[
					-20,
					-145
				]
			],
			[
				[
					4782,
					3474
				],
				[
					-57,
					-22
				],
				[
					-39,
					-96
				]
			],
			[
				[
					4686,
					3356
				],
				[
					-153,
					-82
				]
			],
			[
				[
					4533,
					3274
				],
				[
					-71,
					1
				],
				[
					-70,
					108
				],
				[
					-112,
					-52
				]
			],
			[
				[
					6197,
					2740
				],
				[
					-58,
					-30
				]
			],
			[
				[
					6139,
					2710
				],
				[
					-5,
					24
				]
			],
			[
				[
					6134,
					2734
				],
				[
					63,
					6
				]
			],
			[
				[
					6144,
					2662
				],
				[
					-5,
					48
				]
			],
			[
				[
					6197,
					2740
				],
				[
					16,
					7
				]
			],
			[
				[
					5008,
					4495
				],
				[
					-115,
					-40
				]
			],
			[
				[
					4766,
					4539
				],
				[
					93,
					117
				]
			],
			[
				[
					5834,
					2106
				],
				[
					-28,
					37
				]
			],
			[
				[
					5829,
					2247
				],
				[
					79,
					11
				]
			],
			[
				[
					6005,
					2170
				],
				[
					-90,
					-26
				],
				[
					-11,
					-73
				]
			],
			[
				[
					5904,
					2071
				],
				[
					-70,
					35
				]
			],
			[
				[
					6793,
					1780
				],
				[
					51,
					99
				]
			],
			[
				[
					6950,
					1569
				],
				[
					-87,
					71
				],
				[
					28,
					56
				],
				[
					-98,
					84
				]
			],
			[
				[
					4449,
					4909
				],
				[
					19,
					56
				]
			],
			[
				[
					4468,
					4965
				],
				[
					102,
					-20
				]
			],
			[
				[
					4538,
					4856
				],
				[
					-89,
					53
				]
			],
			[
				[
					6904,
					2516
				],
				[
					30,
					10
				]
			],
			[
				[
					6934,
					2526
				],
				[
					22,
					-58
				],
				[
					71,
					57
				],
				[
					80,
					-37
				],
				[
					54,
					25
				]
			],
			[
				[
					7161,
					2513
				],
				[
					63,
					3
				],
				[
					10,
					-119
				],
				[
					-53,
					-49
				]
			],
			[
				[
					7181,
					2348
				],
				[
					-19,
					0
				]
			],
			[
				[
					7162,
					2348
				],
				[
					-170,
					23
				],
				[
					-116,
					-18
				]
			],
			[
				[
					6787,
					2454
				],
				[
					53,
					21
				]
			],
			[
				[
					4799,
					4844
				],
				[
					14,
					20
				]
			],
			[
				[
					4870,
					4913
				],
				[
					11,
					-11
				]
			],
			[
				[
					4886,
					4842
				],
				[
					-82,
					-16
				]
			],
			[
				[
					4804,
					4826
				],
				[
					-5,
					18
				]
			],
			[
				[
					4794,
					4815
				],
				[
					10,
					11
				]
			],
			[
				[
					4867,
					4798
				],
				[
					-13,
					-4
				]
			],
			[
				[
					4854,
					4794
				],
				[
					-60,
					21
				]
			],
			[
				[
					4819,
					4748
				],
				[
					-46,
					49
				]
			],
			[
				[
					4773,
					4797
				],
				[
					21,
					18
				]
			],
			[
				[
					4854,
					4794
				],
				[
					-16,
					-38
				]
			],
			[
				[
					5673,
					4525
				],
				[
					-56,
					-163
				]
			],
			[
				[
					5530,
					1491
				],
				[
					13,
					76
				],
				[
					129,
					68
				]
			],
			[
				[
					5710,
					1320
				],
				[
					-46,
					2
				]
			],
			[
				[
					5115,
					3398
				],
				[
					52,
					-10
				],
				[
					11,
					80
				]
			],
			[
				[
					5159,
					3547
				],
				[
					25,
					4
				]
			],
			[
				[
					5184,
					3551
				],
				[
					53,
					-98
				],
				[
					66,
					22
				]
			],
			[
				[
					5167,
					3329
				],
				[
					-72,
					27
				]
			],
			[
				[
					5538,
					6316
				],
				[
					64,
					24
				]
			],
			[
				[
					5602,
					6340
				],
				[
					6,
					-47
				]
			],
			[
				[
					5608,
					6293
				],
				[
					-71,
					-26
				]
			],
			[
				[
					5537,
					6267
				],
				[
					1,
					49
				]
			],
			[
				[
					5574,
					6242
				],
				[
					-37,
					25
				]
			],
			[
				[
					5608,
					6293
				],
				[
					155,
					59
				]
			],
			[
				[
					5763,
					6352
				],
				[
					146,
					-42
				]
			],
			[
				[
					5909,
					6310
				],
				[
					-50,
					-98
				],
				[
					-136,
					8
				]
			],
			[
				[
					5723,
					6220
				],
				[
					-149,
					22
				]
			],
			[
				[
					4179,
					8157
				],
				[
					90,
					-25
				],
				[
					93,
					-126
				]
			],
			[
				[
					6031,
					3105
				],
				[
					92,
					-85
				]
			],
			[
				[
					6166,
					3014
				],
				[
					39,
					-58
				],
				[
					92,
					29
				],
				[
					-6,
					-123
				]
			],
			[
				[
					6134,
					2734
				],
				[
					-121,
					83
				]
			],
			[
				[
					6012,
					2819
				],
				[
					-12,
					107
				]
			],
			[
				[
					6000,
					2926
				],
				[
					58,
					83
				],
				[
					-27,
					96
				]
			],
			[
				[
					5472,
					4066
				],
				[
					-24,
					7
				]
			],
			[
				[
					4799,
					1188
				],
				[
					250,
					84
				]
			],
			[
				[
					5036,
					1178
				],
				[
					-62,
					-52
				]
			],
			[
				[
					4974,
					1126
				],
				[
					-50,
					-44
				],
				[
					-104,
					51
				],
				[
					-21,
					55
				]
			],
			[
				[
					7043,
					3828
				],
				[
					-7,
					95
				]
			],
			[
				[
					7330,
					3736
				],
				[
					42,
					-82
				],
				[
					-48,
					-162
				]
			],
			[
				[
					7324,
					3492
				],
				[
					-142,
					61
				],
				[
					-98,
					72
				],
				[
					-41,
					203
				]
			],
			[
				[
					6524,
					1701
				],
				[
					-44,
					-61
				],
				[
					11,
					-124
				]
			],
			[
				[
					5040,
					3070
				],
				[
					133,
					-58
				]
			],
			[
				[
					5173,
					3012
				],
				[
					-76,
					-52
				],
				[
					23,
					-91
				]
			],
			[
				[
					5120,
					2869
				],
				[
					-56,
					51
				]
			],
			[
				[
					5064,
					2920
				],
				[
					-115,
					66
				],
				[
					-8,
					52
				],
				[
					-75,
					-29
				],
				[
					-21,
					77
				]
			],
			[
				[
					4845,
					3086
				],
				[
					35,
					62
				],
				[
					-65,
					11
				]
			],
			[
				[
					4815,
					3159
				],
				[
					-17,
					137
				]
			],
			[
				[
					4798,
					3296
				],
				[
					97,
					36
				]
			],
			[
				[
					4957,
					3244
				],
				[
					-36,
					-58
				],
				[
					119,
					-116
				]
			],
			[
				[
					5973,
					3118
				],
				[
					28,
					5
				]
			],
			[
				[
					6001,
					3123
				],
				[
					30,
					-18
				]
			],
			[
				[
					6000,
					2926
				],
				[
					-37,
					-41
				],
				[
					-101,
					62
				]
			],
			[
				[
					5862,
					2947
				],
				[
					-26,
					68
				],
				[
					137,
					103
				]
			],
			[
				[
					5848,
					2915
				],
				[
					14,
					32
				]
			],
			[
				[
					6353,
					2032
				],
				[
					-26,
					7
				]
			],
			[
				[
					6327,
					2039
				],
				[
					42,
					46
				]
			],
			[
				[
					6369,
					2085
				],
				[
					29,
					-7
				]
			],
			[
				[
					6398,
					2078
				],
				[
					9,
					-10
				]
			],
			[
				[
					6099,
					1875
				],
				[
					57,
					83
				]
			],
			[
				[
					6156,
					1958
				],
				[
					12,
					-5
				]
			],
			[
				[
					6299,
					1907
				],
				[
					61,
					-150
				]
			],
			[
				[
					4464,
					2280
				],
				[
					-11,
					-7
				]
			],
			[
				[
					4453,
					2273
				],
				[
					-13,
					54
				],
				[
					-126,
					26
				]
			],
			[
				[
					4314,
					2353
				],
				[
					-50,
					5
				]
			],
			[
				[
					4264,
					2358
				],
				[
					-5,
					117
				],
				[
					-57,
					94
				],
				[
					-57,
					12
				]
			],
			[
				[
					3549,
					3616
				],
				[
					92,
					158
				],
				[
					151,
					36
				],
				[
					13,
					165
				],
				[
					77,
					51
				]
			],
			[
				[
					4135,
					4060
				],
				[
					-8,
					-131
				],
				[
					139,
					-77
				]
			],
			[
				[
					4266,
					3852
				],
				[
					-54,
					-95
				]
			],
			[
				[
					3730,
					3356
				],
				[
					-65,
					100
				],
				[
					29,
					87
				],
				[
					-59,
					-38
				],
				[
					-22,
					98
				],
				[
					-64,
					13
				]
			],
			[
				[
					4264,
					5520
				],
				[
					58,
					145
				]
			],
			[
				[
					4322,
					5665
				],
				[
					-4,
					118
				],
				[
					79,
					38
				],
				[
					90,
					-49
				],
				[
					30,
					55
				],
				[
					135,
					33
				]
			],
			[
				[
					4652,
					5860
				],
				[
					-78,
					-137
				]
			],
			[
				[
					5429,
					5179
				],
				[
					-24,
					-44
				]
			],
			[
				[
					5405,
					5135
				],
				[
					-84,
					24
				]
			],
			[
				[
					3600,
					2418
				],
				[
					8,
					21
				]
			],
			[
				[
					5721,
					4208
				],
				[
					-19,
					60
				],
				[
					61,
					45
				],
				[
					30,
					169
				],
				[
					-63,
					77
				]
			],
			[
				[
					6002,
					4530
				],
				[
					-39,
					-84
				],
				[
					15,
					-137
				],
				[
					-80,
					-93
				],
				[
					20,
					-40
				]
			],
			[
				[
					5918,
					4176
				],
				[
					-72,
					-106
				]
			],
			[
				[
					5846,
					4070
				],
				[
					-97,
					73
				],
				[
					-3,
					45
				]
			],
			[
				[
					5311,
					2220
				],
				[
					189,
					48
				],
				[
					97,
					-43
				],
				[
					48,
					19
				]
			],
			[
				[
					5674,
					2173
				],
				[
					3,
					-41
				]
			],
			[
				[
					5677,
					2132
				],
				[
					-55,
					-69
				],
				[
					43,
					-45
				]
			],
			[
				[
					5665,
					2018
				],
				[
					-8,
					-23
				]
			],
			[
				[
					5657,
					1995
				],
				[
					-215,
					20
				],
				[
					-66,
					-58
				]
			],
			[
				[
					4786,
					4316
				],
				[
					56,
					-62
				]
			],
			[
				[
					4842,
					4254
				],
				[
					3,
					-71
				]
			],
			[
				[
					4845,
					4183
				],
				[
					-6,
					-2
				]
			],
			[
				[
					4839,
					4181
				],
				[
					-119,
					46
				]
			],
			[
				[
					5226,
					6862
				],
				[
					61,
					34
				]
			],
			[
				[
					5287,
					6896
				],
				[
					8,
					-37
				]
			],
			[
				[
					5287,
					6896
				],
				[
					12,
					19
				]
			],
			[
				[
					5299,
					6915
				],
				[
					54,
					-35
				]
			],
			[
				[
					5271,
					6989
				],
				[
					28,
					-74
				]
			],
			[
				[
					4188,
					2179
				],
				[
					-13,
					56
				]
			],
			[
				[
					4184,
					2348
				],
				[
					80,
					10
				]
			],
			[
				[
					4314,
					2353
				],
				[
					-63,
					-21
				],
				[
					13,
					-109
				]
			],
			[
				[
					4264,
					2223
				],
				[
					-76,
					-44
				]
			],
			[
				[
					3906,
					1031
				],
				[
					21,
					-44
				],
				[
					-64,
					-125
				]
			],
			[
				[
					3863,
					862
				],
				[
					-57,
					-53
				]
			],
			[
				[
					3806,
					809
				],
				[
					-64,
					-20
				],
				[
					-54,
					61
				]
			],
			[
				[
					5242,
					1445
				],
				[
					43,
					12
				]
			],
			[
				[
					5285,
					1457
				],
				[
					107,
					-40
				]
			],
			[
				[
					5392,
					1417
				],
				[
					44,
					-42
				]
			],
			[
				[
					5436,
					1375
				],
				[
					32,
					-35
				]
			],
			[
				[
					5500,
					1309
				],
				[
					-6,
					-85
				],
				[
					-130,
					-57
				]
			],
			[
				[
					5364,
					1167
				],
				[
					-127,
					65
				],
				[
					36,
					74
				],
				[
					-39,
					46
				],
				[
					8,
					93
				]
			],
			[
				[
					5364,
					1167
				],
				[
					-29,
					-35
				],
				[
					-105,
					27
				]
			],
			[
				[
					5111,
					1323
				],
				[
					30,
					91
				],
				[
					-47,
					-13
				],
				[
					-63,
					98
				]
			],
			[
				[
					5031,
					1499
				],
				[
					91,
					27
				],
				[
					120,
					-81
				]
			],
			[
				[
					5395,
					5117
				],
				[
					10,
					18
				]
			],
			[
				[
					5524,
					5207
				],
				[
					35,
					-125
				]
			],
			[
				[
					5890,
					3231
				],
				[
					-70,
					-33
				],
				[
					-18,
					27
				]
			],
			[
				[
					5908,
					3187
				],
				[
					-77,
					-38
				],
				[
					-53,
					48
				]
			],
			[
				[
					3566,
					1385
				],
				[
					-70,
					28
				],
				[
					-28,
					110
				],
				[
					-127,
					18
				],
				[
					4,
					52
				]
			],
			[
				[
					3345,
					1593
				],
				[
					-31,
					35
				],
				[
					26,
					155
				],
				[
					96,
					24
				],
				[
					268,
					21
				]
			],
			[
				[
					3792,
					1523
				],
				[
					-16,
					-115
				]
			],
			[
				[
					4686,
					1460
				],
				[
					67,
					160
				]
			],
			[
				[
					4753,
					1620
				],
				[
					61,
					-10
				],
				[
					108,
					-171
				],
				[
					50,
					37
				]
			],
			[
				[
					4972,
					1476
				],
				[
					59,
					23
				]
			],
			[
				[
					4799,
					1188
				],
				[
					-1,
					0
				]
			],
			[
				[
					4798,
					1188
				],
				[
					-96,
					135
				],
				[
					-40,
					101
				],
				[
					24,
					36
				]
			],
			[
				[
					5330,
					6743
				],
				[
					40,
					-14
				]
			],
			[
				[
					5251,
					6667
				],
				[
					-82,
					43
				],
				[
					57,
					66
				]
			],
			[
				[
					6001,
					3123
				],
				[
					11,
					99
				],
				[
					66,
					-20
				],
				[
					34,
					85
				]
			],
			[
				[
					6340,
					3074
				],
				[
					55,
					-28
				],
				[
					-10,
					-77
				]
			],
			[
				[
					6385,
					2969
				],
				[
					-77,
					-136
				]
			],
			[
				[
					6540,
					3340
				],
				[
					-65,
					196
				],
				[
					-58,
					-17
				],
				[
					-54,
					107
				]
			],
			[
				[
					6363,
					3626
				],
				[
					131,
					35
				],
				[
					-14,
					90
				]
			],
			[
				[
					6480,
					3751
				],
				[
					57,
					72
				],
				[
					96,
					32
				]
			],
			[
				[
					6633,
					3855
				],
				[
					-3,
					-16
				]
			],
			[
				[
					6630,
					3839
				],
				[
					-11,
					-60
				],
				[
					70,
					-245
				],
				[
					90,
					2
				],
				[
					48,
					-88
				]
			],
			[
				[
					6827,
					3448
				],
				[
					-5,
					-3
				]
			],
			[
				[
					6822,
					3445
				],
				[
					-167,
					-22
				],
				[
					-115,
					-83
				]
			],
			[
				[
					5300,
					4627
				],
				[
					78,
					7
				]
			],
			[
				[
					5378,
					4634
				],
				[
					40,
					28
				]
			],
			[
				[
					5418,
					4662
				],
				[
					89,
					-11
				]
			],
			[
				[
					5507,
					4651
				],
				[
					32,
					-27
				]
			],
			[
				[
					5652,
					1706
				],
				[
					-44,
					53
				]
			],
			[
				[
					5608,
					1759
				],
				[
					43,
					58
				]
			],
			[
				[
					5650,
					1887
				],
				[
					7,
					108
				]
			],
			[
				[
					5665,
					2018
				],
				[
					148,
					-14
				]
			],
			[
				[
					5898,
					1843
				],
				[
					-33,
					-46
				]
			],
			[
				[
					6555,
					2868
				],
				[
					42,
					-163
				]
			],
			[
				[
					6434,
					2514
				],
				[
					-35,
					-8
				],
				[
					-22,
					127
				]
			],
			[
				[
					6377,
					2633
				],
				[
					36,
					48
				],
				[
					-32,
					72
				]
			],
			[
				[
					6385,
					2969
				],
				[
					27,
					-82
				],
				[
					79,
					58
				],
				[
					64,
					-77
				]
			],
			[
				[
					4695,
					2094
				],
				[
					82,
					-3
				]
			],
			[
				[
					4777,
					2091
				],
				[
					9,
					-43
				]
			],
			[
				[
					4781,
					1951
				],
				[
					-142,
					-70
				]
			],
			[
				[
					4639,
					1881
				],
				[
					-115,
					14
				],
				[
					-48,
					47
				]
			],
			[
				[
					4476,
					1942
				],
				[
					-10,
					26
				]
			],
			[
				[
					4466,
					1968
				],
				[
					88,
					81
				]
			],
			[
				[
					4533,
					3274
				],
				[
					-8,
					-90
				],
				[
					151,
					41
				],
				[
					33,
					-62
				],
				[
					-38,
					-76
				],
				[
					58,
					-22
				],
				[
					5,
					-176
				]
			],
			[
				[
					4712,
					4205
				],
				[
					-68,
					-124
				],
				[
					72,
					-20
				],
				[
					-31,
					-87
				]
			],
			[
				[
					4685,
					3974
				],
				[
					-132,
					-38
				],
				[
					-54,
					-51
				]
			],
			[
				[
					4499,
					3885
				],
				[
					-83,
					46
				],
				[
					-46,
					-38
				],
				[
					-73,
					30
				],
				[
					-31,
					-71
				]
			],
			[
				[
					4466,
					1968
				],
				[
					-155,
					86
				]
			],
			[
				[
					4311,
					2054
				],
				[
					19,
					35
				]
			],
			[
				[
					5158,
					2412
				],
				[
					79,
					31
				]
			],
			[
				[
					5237,
					2443
				],
				[
					-6,
					-144
				]
			],
			[
				[
					5231,
					2299
				],
				[
					-102,
					-5
				]
			],
			[
				[
					5129,
					2294
				],
				[
					29,
					118
				]
			],
			[
				[
					7549,
					2045
				],
				[
					28,
					-19
				],
				[
					-76,
					-86
				],
				[
					-79,
					8
				]
			],
			[
				[
					7318,
					2017
				],
				[
					231,
					28
				]
			],
			[
				[
					5420,
					6910
				],
				[
					-9,
					-24
				]
			],
			[
				[
					5330,
					6976
				],
				[
					90,
					-66
				]
			],
			[
				[
					5307,
					3786
				],
				[
					29,
					-26
				]
			],
			[
				[
					5373,
					3621
				],
				[
					-107,
					-47
				],
				[
					136,
					-52
				]
			],
			[
				[
					5402,
					3522
				],
				[
					-5,
					-46
				]
			],
			[
				[
					5184,
					3551
				],
				[
					-26,
					101
				]
			],
			[
				[
					5158,
					3652
				],
				[
					105,
					15
				],
				[
					44,
					119
				]
			],
			[
				[
					6540,
					3340
				],
				[
					-40,
					-46
				]
			],
			[
				[
					6500,
					3294
				],
				[
					-31,
					-10
				]
			],
			[
				[
					6230,
					3750
				],
				[
					79,
					-12
				]
			],
			[
				[
					6309,
					3738
				],
				[
					-36,
					-107
				],
				[
					90,
					-5
				]
			],
			[
				[
					4753,
					6534
				],
				[
					11,
					87
				]
			],
			[
				[
					5257,
					1728
				],
				[
					-27,
					59
				]
			],
			[
				[
					5608,
					1759
				],
				[
					-89,
					16
				]
			],
			[
				[
					5519,
					1775
				],
				[
					-85,
					39
				],
				[
					-83,
					-105
				],
				[
					-94,
					19
				]
			],
			[
				[
					5307,
					3786
				],
				[
					-6,
					18
				]
			],
			[
				[
					5301,
					3804
				],
				[
					32,
					83
				],
				[
					67,
					8
				],
				[
					111,
					141
				]
			],
			[
				[
					5549,
					4037
				],
				[
					5,
					-85
				]
			],
			[
				[
					7092,
					4182
				],
				[
					4,
					-99
				]
			],
			[
				[
					7043,
					3828
				],
				[
					-158,
					-55
				],
				[
					-90,
					14
				],
				[
					-4,
					52
				],
				[
					-161,
					0
				]
			],
			[
				[
					6633,
					3855
				],
				[
					75,
					46
				],
				[
					-34,
					108
				]
			],
			[
				[
					6674,
					4009
				],
				[
					69,
					-25
				],
				[
					83,
					69
				],
				[
					54,
					103
				],
				[
					57,
					30
				],
				[
					155,
					-4
				]
			],
			[
				[
					4777,
					2091
				],
				[
					16,
					200
				]
			],
			[
				[
					4793,
					2291
				],
				[
					91,
					17
				],
				[
					71,
					111
				],
				[
					81,
					-48
				],
				[
					57,
					62
				],
				[
					65,
					-21
				]
			],
			[
				[
					5129,
					2294
				],
				[
					-13,
					-89
				]
			],
			[
				[
					7514,
					3702
				],
				[
					-10,
					-1
				]
			],
			[
				[
					7504,
					3701
				],
				[
					-61,
					32
				]
			],
			[
				[
					7443,
					3733
				],
				[
					90,
					-31
				]
			],
			[
				[
					7663,
					3609
				],
				[
					-149,
					93
				]
			],
			[
				[
					5686,
					4138
				],
				[
					-34,
					-7
				]
			],
			[
				[
					5652,
					4131
				],
				[
					-32,
					38
				]
			],
			[
				[
					5620,
					4169
				],
				[
					16,
					34
				]
			],
			[
				[
					5582,
					4218
				],
				[
					43,
					9
				]
			],
			[
				[
					5620,
					4169
				],
				[
					-53,
					-28
				]
			],
			[
				[
					5652,
					4131
				],
				[
					-62,
					-52
				]
			],
			[
				[
					5437,
					3580
				],
				[
					-35,
					-58
				]
			],
			[
				[
					3419,
					8876
				],
				[
					208,
					-25
				],
				[
					161,
					98
				],
				[
					89,
					-6
				],
				[
					28,
					-95
				],
				[
					-26,
					-75
				],
				[
					165,
					-39
				]
			],
			[
				[
					4044,
					8734
				],
				[
					-6,
					-12
				]
			],
			[
				[
					4038,
					8722
				],
				[
					-14,
					-82
				],
				[
					-67,
					-28
				],
				[
					78,
					-48
				]
			],
			[
				[
					4010,
					8475
				],
				[
					-104,
					-27
				]
			],
			[
				[
					3689,
					8353
				],
				[
					-4,
					-6
				]
			],
			[
				[
					3628,
					8385
				],
				[
					-48,
					38
				],
				[
					33,
					80
				],
				[
					-298,
					191
				],
				[
					26,
					170
				],
				[
					78,
					12
				]
			],
			[
				[
					3822,
					2383
				],
				[
					86,
					-60
				]
			],
			[
				[
					3908,
					2323
				],
				[
					30,
					-128
				]
			],
			[
				[
					3938,
					2195
				],
				[
					-75,
					2
				]
			],
			[
				[
					4929,
					4909
				],
				[
					-25,
					89
				]
			],
			[
				[
					4904,
					4998
				],
				[
					74,
					51
				]
			],
			[
				[
					5026,
					4894
				],
				[
					-74,
					17
				]
			],
			[
				[
					4881,
					4992
				],
				[
					23,
					6
				]
			],
			[
				[
					6619,
					2064
				],
				[
					-3,
					-1
				]
			],
			[
				[
					6616,
					2063
				],
				[
					-23,
					7
				]
			],
			[
				[
					6616,
					2063
				],
				[
					-9,
					-86
				],
				[
					-72,
					-70
				]
			],
			[
				[
					5569,
					2490
				],
				[
					-9,
					82
				]
			],
			[
				[
					5541,
					2398
				],
				[
					-85,
					66
				]
			],
			[
				[
					5456,
					2464
				],
				[
					42,
					178
				]
			],
			[
				[
					3215,
					8036
				],
				[
					-197,
					1
				]
			],
			[
				[
					3034,
					8164
				],
				[
					164,
					-64
				]
			],
			[
				[
					3079,
					7935
				],
				[
					-78,
					-9
				],
				[
					-73,
					121
				]
			],
			[
				[
					4763,
					5302
				],
				[
					6,
					79
				],
				[
					61,
					26
				],
				[
					30,
					84
				]
			],
			[
				[
					4860,
					5491
				],
				[
					104,
					-138
				]
			],
			[
				[
					5310,
					5026
				],
				[
					21,
					-2
				]
			],
			[
				[
					5408,
					4843
				],
				[
					6,
					-13
				]
			],
			[
				[
					5414,
					4830
				],
				[
					11,
					-32
				]
			],
			[
				[
					5425,
					4798
				],
				[
					-65,
					-17
				]
			],
			[
				[
					5360,
					4781
				],
				[
					-80,
					30
				],
				[
					-68,
					-39
				]
			],
			[
				[
					4181,
					6380
				],
				[
					-13,
					173
				],
				[
					-63,
					71
				],
				[
					105,
					54
				]
			],
			[
				[
					4157,
					6805
				],
				[
					-49,
					42
				]
			],
			[
				[
					4870,
					6172
				],
				[
					-103,
					-51
				],
				[
					-45,
					-86
				]
			],
			[
				[
					4722,
					6035
				],
				[
					-204,
					64
				],
				[
					-127,
					105
				],
				[
					-84,
					-22
				],
				[
					-72,
					46
				]
			],
			[
				[
					3643,
					9510
				],
				[
					167,
					-8
				],
				[
					67,
					-71
				],
				[
					89,
					-3
				]
			],
			[
				[
					4220,
					8847
				],
				[
					-176,
					-113
				]
			],
			[
				[
					3419,
					8876
				],
				[
					-42,
					61
				],
				[
					-107,
					-48
				],
				[
					-25,
					85
				],
				[
					-232,
					-83
				]
			],
			[
				[
					3013,
					8891
				],
				[
					-45,
					99
				],
				[
					74,
					36
				],
				[
					-20,
					53
				]
			],
			[
				[
					3022,
					9079
				],
				[
					-69,
					82
				],
				[
					95,
					22
				],
				[
					54,
					151
				]
			],
			[
				[
					6309,
					3738
				],
				[
					171,
					13
				]
			],
			[
				[
					3429,
					692
				],
				[
					-81,
					1
				]
			],
			[
				[
					3348,
					693
				],
				[
					-8,
					26
				]
			],
			[
				[
					3340,
					719
				],
				[
					5,
					25
				]
			],
			[
				[
					3345,
					744
				],
				[
					63,
					20
				],
				[
					21,
					-72
				]
			],
			[
				[
					3908,
					2323
				],
				[
					52,
					28
				]
			],
			[
				[
					3993,
					2198
				],
				[
					-55,
					-3
				]
			],
			[
				[
					5037,
					1084
				],
				[
					-63,
					42
				]
			],
			[
				[
					5073,
					1121
				],
				[
					-36,
					-37
				]
			],
			[
				[
					6493,
					2227
				],
				[
					16,
					-33
				]
			],
			[
				[
					5730,
					1242
				],
				[
					-75,
					16
				]
			],
			[
				[
					4434,
					5270
				],
				[
					89,
					-8
				]
			],
			[
				[
					4523,
					5262
				],
				[
					-55,
					-44
				]
			],
			[
				[
					4468,
					5218
				],
				[
					-45,
					8
				]
			],
			[
				[
					5216,
					5371
				],
				[
					-5,
					39
				]
			],
			[
				[
					6359,
					2124
				],
				[
					2,
					-16
				]
			],
			[
				[
					6361,
					2108
				],
				[
					-46,
					-12
				]
			],
			[
				[
					6315,
					2096
				],
				[
					22,
					53
				]
			],
			[
				[
					6988,
					2288
				],
				[
					-9,
					-6
				]
			],
			[
				[
					6929,
					2305
				],
				[
					-50,
					7
				]
			],
			[
				[
					7162,
					2348
				],
				[
					-11,
					-35
				],
				[
					-163,
					-25
				]
			],
			[
				[
					5834,
					2106
				],
				[
					-51,
					-27
				]
			],
			[
				[
					5783,
					2079
				],
				[
					-37,
					65
				]
			],
			[
				[
					5783,
					2079
				],
				[
					-106,
					53
				]
			],
			[
				[
					5602,
					6340
				],
				[
					30,
					63
				]
			],
			[
				[
					5640,
					6428
				],
				[
					123,
					-76
				]
			],
			[
				[
					5088,
					3279
				],
				[
					-42,
					-47
				],
				[
					-6,
					-162
				]
			],
			[
				[
					6351,
					1971
				],
				[
					14,
					-1
				]
			],
			[
				[
					4645,
					5617
				],
				[
					72,
					4
				],
				[
					16,
					-73
				],
				[
					127,
					-57
				]
			],
			[
				[
					4489,
					5157
				],
				[
					-21,
					61
				]
			],
			[
				[
					4523,
					5262
				],
				[
					-10,
					150
				]
			],
			[
				[
					4758,
					5901
				],
				[
					7,
					91
				],
				[
					-43,
					43
				]
			],
			[
				[
					5227,
					6277
				],
				[
					65,
					-22
				]
			],
			[
				[
					5311,
					6239
				],
				[
					113,
					-27
				]
			],
			[
				[
					5424,
					6212
				],
				[
					70,
					-31
				],
				[
					80,
					61
				]
			],
			[
				[
					5723,
					6220
				],
				[
					42,
					-49
				],
				[
					-59,
					-60
				]
			],
			[
				[
					5706,
					6111
				],
				[
					-29,
					-113
				],
				[
					-105,
					63
				],
				[
					-18,
					-99
				],
				[
					-85,
					30
				],
				[
					-87,
					-34
				],
				[
					35,
					-112
				]
			],
			[
				[
					5417,
					5846
				],
				[
					-148,
					-34
				],
				[
					-33,
					93
				],
				[
					-249,
					-117
				],
				[
					-64,
					79
				],
				[
					-165,
					34
				]
			],
			[
				[
					6315,
					2096
				],
				[
					3,
					-31
				]
			],
			[
				[
					6271,
					2070
				],
				[
					-9,
					70
				]
			],
			[
				[
					4848,
					5087
				],
				[
					40,
					40
				]
			],
			[
				[
					6840,
					2137
				],
				[
					78,
					53
				]
			],
			[
				[
					7014,
					2192
				],
				[
					46,
					-74
				]
			],
			[
				[
					7060,
					2118
				],
				[
					-71,
					-48
				]
			],
			[
				[
					7021,
					2222
				],
				[
					-33,
					66
				]
			],
			[
				[
					7181,
					2348
				],
				[
					80,
					13
				],
				[
					-51,
					-141
				],
				[
					-124,
					-25
				],
				[
					-58,
					24
				]
			],
			[
				[
					5519,
					1775
				],
				[
					-96,
					-111
				],
				[
					-15,
					-96
				],
				[
					47,
					-103
				]
			],
			[
				[
					5481,
					1429
				],
				[
					-16,
					-7
				]
			],
			[
				[
					5465,
					1422
				],
				[
					-73,
					-5
				]
			],
			[
				[
					5285,
					1457
				],
				[
					-5,
					214
				],
				[
					-23,
					57
				]
			],
			[
				[
					5444,
					4774
				],
				[
					-19,
					24
				]
			],
			[
				[
					5414,
					4830
				],
				[
					112,
					-56
				]
			],
			[
				[
					5526,
					4774
				],
				[
					-58,
					-56
				]
			],
			[
				[
					5468,
					4718
				],
				[
					-24,
					56
				]
			],
			[
				[
					5507,
					4651
				],
				[
					-39,
					67
				]
			],
			[
				[
					5526,
					4774
				],
				[
					44,
					19
				]
			],
			[
				[
					5506,
					3535
				],
				[
					93,
					-140
				]
			],
			[
				[
					6127,
					2321
				],
				[
					92,
					24
				]
			],
			[
				[
					6219,
					2345
				],
				[
					7,
					4
				]
			],
			[
				[
					6213,
					2282
				],
				[
					-68,
					-15
				]
			],
			[
				[
					6038,
					2042
				],
				[
					72,
					57
				]
			],
			[
				[
					6110,
					2099
				],
				[
					68,
					-69
				]
			],
			[
				[
					6156,
					1958
				],
				[
					-65,
					24
				]
			],
			[
				[
					6091,
					1982
				],
				[
					-53,
					60
				]
			],
			[
				[
					5846,
					4070
				],
				[
					-122,
					-111
				]
			],
			[
				[
					5918,
					4176
				],
				[
					11,
					-71
				]
			],
			[
				[
					6555,
					2868
				],
				[
					28,
					73
				],
				[
					98,
					39
				]
			],
			[
				[
					6681,
					2980
				],
				[
					116,
					-71
				]
			],
			[
				[
					6899,
					2657
				],
				[
					35,
					-131
				]
			],
			[
				[
					4751,
					4854
				],
				[
					-19,
					63
				]
			],
			[
				[
					4799,
					4844
				],
				[
					-48,
					10
				]
			],
			[
				[
					4972,
					1476
				],
				[
					-2,
					76
				],
				[
					96,
					50
				],
				[
					-5,
					70
				],
				[
					-75,
					-5
				],
				[
					8,
					159
				]
			],
			[
				[
					5909,
					6310
				],
				[
					164,
					-105
				],
				[
					77,
					-115
				],
				[
					78,
					-202
				],
				[
					48,
					-27
				]
			],
			[
				[
					6276,
					5861
				],
				[
					-191,
					-44
				],
				[
					-44,
					15
				],
				[
					35,
					148
				],
				[
					-49,
					81
				],
				[
					-118,
					-29
				],
				[
					-25,
					38
				],
				[
					-178,
					41
				]
			],
			[
				[
					5464,
					6422
				],
				[
					-54,
					-49
				],
				[
					23,
					-124
				]
			],
			[
				[
					5433,
					6249
				],
				[
					-9,
					-37
				]
			],
			[
				[
					4173,
					4999
				],
				[
					48,
					-3
				]
			],
			[
				[
					4221,
					4996
				],
				[
					109,
					-110
				]
			],
			[
				[
					4207,
					4847
				],
				[
					-47,
					85
				],
				[
					13,
					67
				]
			],
			[
				[
					5312,
					5433
				],
				[
					30,
					61
				]
			],
			[
				[
					5527,
					5644
				],
				[
					92,
					-86
				]
			],
			[
				[
					5619,
					5558
				],
				[
					-36,
					-37
				],
				[
					89,
					-134
				],
				[
					137,
					7
				]
			],
			[
				[
					6735,
					1975
				],
				[
					-35,
					-119
				],
				[
					-55,
					-49
				],
				[
					-109,
					9
				]
			],
			[
				[
					5366,
					4746
				],
				[
					-6,
					35
				]
			],
			[
				[
					5444,
					4774
				],
				[
					-39,
					-44
				]
			],
			[
				[
					5405,
					4730
				],
				[
					-39,
					16
				]
			],
			[
				[
					5405,
					4730
				],
				[
					41,
					-22
				]
			],
			[
				[
					5446,
					4708
				],
				[
					-65,
					-33
				]
			],
			[
				[
					5381,
					4675
				],
				[
					-15,
					71
				]
			],
			[
				[
					5381,
					4675
				],
				[
					-3,
					-41
				]
			],
			[
				[
					5446,
					4708
				],
				[
					-28,
					-46
				]
			],
			[
				[
					5166,
					5451
				],
				[
					38,
					-17
				]
			],
			[
				[
					4499,
					3885
				],
				[
					31,
					-83
				],
				[
					85,
					-82
				]
			],
			[
				[
					4615,
					3720
				],
				[
					6,
					-12
				]
			],
			[
				[
					7060,
					2118
				],
				[
					123,
					-41
				],
				[
					46,
					-59
				]
			],
			[
				[
					4652,
					5860
				],
				[
					106,
					41
				]
			],
			[
				[
					5417,
					5846
				],
				[
					84,
					-92
				],
				[
					-8,
					-81
				]
			],
			[
				[
					6318,
					4112
				],
				[
					-8,
					-31
				]
			],
			[
				[
					6103,
					2178
				],
				[
					-83,
					9
				]
			],
			[
				[
					4257,
					1463
				],
				[
					73,
					143
				]
			],
			[
				[
					4382,
					1658
				],
				[
					55,
					-17
				],
				[
					62,
					88
				],
				[
					108,
					18
				],
				[
					32,
					134
				]
			],
			[
				[
					4792,
					1950
				],
				[
					22,
					-95
				],
				[
					-90,
					-182
				],
				[
					29,
					-53
				]
			],
			[
				[
					4686,
					1460
				],
				[
					-65,
					45
				],
				[
					-62,
					-20
				]
			],
			[
				[
					4559,
					1485
				],
				[
					-58,
					71
				],
				[
					-93,
					-114
				],
				[
					-151,
					21
				]
			],
			[
				[
					5436,
					1375
				],
				[
					29,
					47
				]
			],
			[
				[
					4200,
					5138
				],
				[
					74,
					19
				],
				[
					2,
					-89
				]
			],
			[
				[
					4276,
					5068
				],
				[
					-55,
					-72
				]
			],
			[
				[
					4173,
					4999
				],
				[
					27,
					139
				]
			],
			[
				[
					6805,
					2117
				],
				[
					-59,
					124
				]
			],
			[
				[
					6500,
					3294
				],
				[
					21,
					-37
				],
				[
					133,
					39
				],
				[
					-91,
					-84
				],
				[
					17,
					-46
				]
			],
			[
				[
					6640,
					3089
				],
				[
					59,
					-51
				],
				[
					-18,
					-58
				]
			],
			[
				[
					5301,
					3804
				],
				[
					-80,
					43
				]
			],
			[
				[
					4619,
					969
				],
				[
					28,
					76
				],
				[
					70,
					22
				],
				[
					81,
					121
				]
			],
			[
				[
					5037,
					1084
				],
				[
					-1,
					-117
				],
				[
					-358,
					54
				],
				[
					-59,
					-52
				]
			],
			[
				[
					6822,
					3445
				],
				[
					-36,
					-33
				],
				[
					37,
					-108
				],
				[
					58,
					-54
				],
				[
					-58,
					-45
				],
				[
					-49,
					56
				],
				[
					-13,
					-74
				],
				[
					130,
					-21
				],
				[
					-21,
					-84
				],
				[
					-73,
					-63
				],
				[
					11,
					-71
				]
			],
			[
				[
					6524,
					4071
				],
				[
					46,
					49
				],
				[
					38,
					5
				],
				[
					55,
					45
				],
				[
					8,
					-20
				],
				[
					-64,
					-41
				],
				[
					45,
					-25
				],
				[
					22,
					-75
				]
			],
			[
				[
					7432,
					3751
				],
				[
					11,
					-18
				]
			],
			[
				[
					7504,
					3701
				],
				[
					10,
					1
				]
			],
			[
				[
					7729,
					3569
				],
				[
					40,
					-49
				],
				[
					-92,
					-43
				],
				[
					-60,
					19
				],
				[
					-100,
					-91
				]
			],
			[
				[
					7279,
					3370
				],
				[
					45,
					122
				]
			],
			[
				[
					5940,
					3192
				],
				[
					33,
					-74
				]
			],
			[
				[
					4445,
					5048
				],
				[
					-169,
					20
				]
			],
			[
				[
					4200,
					5138
				],
				[
					-10,
					65
				]
			],
			[
				[
					5478,
					6827
				],
				[
					-23,
					-6
				]
			],
			[
				[
					5420,
					6910
				],
				[
					7,
					3
				]
			],
			[
				[
					5427,
					6913
				],
				[
					51,
					-86
				]
			],
			[
				[
					4757,
					3688
				],
				[
					65,
					56
				]
			],
			[
				[
					4822,
					3744
				],
				[
					28,
					52
				],
				[
					83,
					-10
				],
				[
					46,
					65
				]
			],
			[
				[
					5005,
					3718
				],
				[
					-45,
					-22
				]
			],
			[
				[
					4960,
					3696
				],
				[
					-86,
					-5
				]
			],
			[
				[
					4874,
					3691
				],
				[
					18,
					-78
				]
			],
			[
				[
					4892,
					3613
				],
				[
					6,
					-6
				]
			],
			[
				[
					4872,
					3495
				],
				[
					2,
					-55
				]
			],
			[
				[
					4872,
					3431
				],
				[
					-90,
					43
				]
			],
			[
				[
					7384,
					2888
				],
				[
					89,
					-82
				]
			],
			[
				[
					7473,
					2806
				],
				[
					-51,
					-14
				]
			],
			[
				[
					6927,
					2956
				],
				[
					0,
					114
				],
				[
					115,
					30
				]
			],
			[
				[
					5231,
					2299
				],
				[
					66,
					-88
				]
			],
			[
				[
					7549,
					2045
				],
				[
					47,
					-22
				],
				[
					-45,
					-76
				],
				[
					2,
					-88
				]
			],
			[
				[
					6152,
					2451
				],
				[
					67,
					-106
				]
			],
			[
				[
					7232,
					3359
				],
				[
					-85,
					39
				],
				[
					-79,
					-22
				],
				[
					-61,
					36
				],
				[
					37,
					54
				],
				[
					-217,
					-18
				]
			],
			[
				[
					5942,
					1823
				],
				[
					0,
					-12
				]
			],
			[
				[
					6209,
					2082
				],
				[
					6,
					-19
				]
			],
			[
				[
					6110,
					2099
				],
				[
					10,
					46
				]
			],
			[
				[
					4939,
					4173
				],
				[
					-21,
					35
				]
			],
			[
				[
					4918,
					4208
				],
				[
					-15,
					87
				]
			],
			[
				[
					4903,
					4295
				],
				[
					-84,
					49
				]
			],
			[
				[
					5057,
					4158
				],
				[
					-25,
					60
				],
				[
					-93,
					-45
				]
			],
			[
				[
					4764,
					3858
				],
				[
					50,
					-34
				],
				[
					64,
					38
				],
				[
					-60,
					139
				],
				[
					215,
					-20
				]
			],
			[
				[
					4822,
					3744
				],
				[
					-58,
					114
				]
			],
			[
				[
					6377,
					2633
				],
				[
					-79,
					12
				]
			],
			[
				[
					3191,
					8212
				],
				[
					-79,
					117
				],
				[
					-69,
					34
				]
			],
			[
				[
					3043,
					8363
				],
				[
					-66,
					138
				],
				[
					14,
					188
				],
				[
					-89,
					-3
				],
				[
					-51,
					64
				],
				[
					32,
					62
				],
				[
					130,
					79
				]
			],
			[
				[
					5538,
					6316
				],
				[
					-105,
					-67
				]
			],
			[
				[
					4842,
					4254
				],
				[
					61,
					41
				]
			],
			[
				[
					4918,
					4208
				],
				[
					-73,
					-25
				]
			],
			[
				[
					4939,
					4173
				],
				[
					-72,
					-37
				],
				[
					-28,
					45
				]
			],
			[
				[
					4764,
					3858
				],
				[
					-79,
					116
				]
			],
			[
				[
					5248,
					3245
				],
				[
					71,
					-93
				]
			],
			[
				[
					5358,
					2856
				],
				[
					-68,
					-56
				],
				[
					-40,
					43
				]
			],
			[
				[
					5250,
					2843
				],
				[
					1,
					60
				],
				[
					-78,
					109
				]
			],
			[
				[
					6398,
					2078
				],
				[
					-3,
					30
				]
			],
			[
				[
					6391,
					2134
				],
				[
					25,
					0
				]
			],
			[
				[
					4657,
					4764
				],
				[
					3,
					4
				]
			],
			[
				[
					4660,
					4768
				],
				[
					91,
					86
				]
			],
			[
				[
					4773,
					4797
				],
				[
					-12,
					-4
				]
			],
			[
				[
					4857,
					2651
				],
				[
					40,
					-33
				]
			],
			[
				[
					4897,
					2618
				],
				[
					40,
					-122
				],
				[
					-96,
					-17
				],
				[
					-28,
					-55
				],
				[
					-115,
					-41
				]
			],
			[
				[
					4698,
					2383
				],
				[
					-106,
					49
				]
			],
			[
				[
					6303,
					2548
				],
				[
					9,
					-52
				]
			],
			[
				[
					6221,
					2446
				],
				[
					-49,
					11
				]
			],
			[
				[
					2636,
					710
				],
				[
					77,
					102
				]
			],
			[
				[
					2713,
					812
				],
				[
					147,
					-7
				],
				[
					33,
					-61
				]
			],
			[
				[
					2893,
					744
				],
				[
					43,
					-86
				],
				[
					59,
					33
				],
				[
					24,
					-69
				]
			],
			[
				[
					3019,
					622
				],
				[
					-94,
					-11
				],
				[
					-38,
					-150
				],
				[
					-43,
					21
				]
			],
			[
				[
					2844,
					482
				],
				[
					-28,
					117
				],
				[
					-70,
					26
				],
				[
					-5,
					74
				],
				[
					-105,
					11
				]
			],
			[
				[
					4565,
					4808
				],
				[
					-80,
					-9
				]
			],
			[
				[
					4485,
					4799
				],
				[
					-92,
					38
				]
			],
			[
				[
					4378,
					4861
				],
				[
					71,
					48
				]
			],
			[
				[
					4485,
					4799
				],
				[
					8,
					-37
				]
			],
			[
				[
					4493,
					4762
				],
				[
					-14,
					-35
				]
			],
			[
				[
					7564,
					3350
				],
				[
					153,
					36
				],
				[
					54,
					68
				],
				[
					33,
					-55
				]
			],
			[
				[
					7804,
					3399
				],
				[
					-74,
					-180
				],
				[
					-35,
					-236
				],
				[
					-79,
					-51
				],
				[
					-120,
					-163
				],
				[
					-23,
					37
				]
			],
			[
				[
					5429,
					6757
				],
				[
					12,
					59
				]
			],
			[
				[
					5478,
					6827
				],
				[
					12,
					-113
				]
			],
			[
				[
					5950,
					2005
				],
				[
					88,
					37
				]
			],
			[
				[
					6091,
					1982
				],
				[
					-105,
					-46
				],
				[
					-9,
					-105
				]
			],
			[
				[
					6323,
					2037
				],
				[
					4,
					2
				]
			],
			[
				[
					5094,
					3648
				],
				[
					64,
					4
				]
			],
			[
				[
					3579,
					2340
				],
				[
					-31,
					-8
				]
			],
			[
				[
					3548,
					2332
				],
				[
					-54,
					60
				]
			],
			[
				[
					3548,
					2332
				],
				[
					-40,
					-27
				]
			],
			[
				[
					4628,
					4538
				],
				[
					-76,
					36
				],
				[
					-1,
					68
				]
			],
			[
				[
					4551,
					4642
				],
				[
					126,
					88
				]
			],
			[
				[
					4762,
					4689
				],
				[
					55,
					3
				]
			],
			[
				[
					4257,
					1463
				],
				[
					-51,
					-74
				]
			],
			[
				[
					4206,
					1389
				],
				[
					-65,
					-22
				],
				[
					-18,
					73
				],
				[
					-69,
					-5
				],
				[
					-93,
					48
				],
				[
					-28,
					67
				]
			],
			[
				[
					4615,
					3720
				],
				[
					47,
					108
				],
				[
					23,
					-99
				]
			],
			[
				[
					4945,
					2678
				],
				[
					-48,
					-60
				]
			],
			[
				[
					4867,
					2855
				],
				[
					94,
					10
				],
				[
					103,
					55
				]
			],
			[
				[
					5120,
					2869
				],
				[
					-64,
					-96
				],
				[
					9,
					-64
				],
				[
					-74,
					20
				]
			],
			[
				[
					5250,
					2843
				],
				[
					38,
					-67
				],
				[
					-78,
					-208
				],
				[
					53,
					-133
				]
			],
			[
				[
					5263,
					2435
				],
				[
					-26,
					8
				]
			],
			[
				[
					4793,
					2291
				],
				[
					-91,
					27
				],
				[
					-4,
					65
				]
			],
			[
				[
					6276,
					5861
				],
				[
					68,
					-93
				]
			],
			[
				[
					5807,
					5543
				],
				[
					-101,
					88
				],
				[
					-87,
					-73
				]
			],
			[
				[
					4206,
					1389
				],
				[
					74,
					-117
				]
			],
			[
				[
					4280,
					1272
				],
				[
					51,
					-39
				],
				[
					-45,
					-100
				]
			],
			[
				[
					4286,
					1133
				],
				[
					-179,
					-45
				]
			],
			[
				[
					6793,
					1780
				],
				[
					-115,
					-18
				],
				[
					-54,
					-64
				]
			],
			[
				[
					6624,
					1698
				],
				[
					-83,
					7
				]
			],
			[
				[
					6369,
					2085
				],
				[
					-8,
					23
				]
			],
			[
				[
					3873,
					680
				],
				[
					-69,
					53
				],
				[
					2,
					76
				]
			],
			[
				[
					3863,
					862
				],
				[
					40,
					-158
				],
				[
					-30,
					-24
				]
			],
			[
				[
					3578,
					543
				],
				[
					44,
					26
				],
				[
					8,
					152
				],
				[
					-61,
					82
				]
			],
			[
				[
					3569,
					803
				],
				[
					18,
					94
				]
			],
			[
				[
					3873,
					680
				],
				[
					-87,
					-85
				],
				[
					-22,
					-132
				],
				[
					-60,
					-25
				],
				[
					-105,
					43
				],
				[
					-21,
					62
				]
			],
			[
				[
					6472,
					2329
				],
				[
					-15,
					-38
				]
			],
			[
				[
					6802,
					1625
				],
				[
					-54,
					54
				],
				[
					-124,
					19
				]
			],
			[
				[
					5404,
					7003
				],
				[
					23,
					-90
				]
			],
			[
				[
					3860,
					4644
				],
				[
					110,
					45
				]
			],
			[
				[
					4090,
					2141
				],
				[
					-23,
					-94
				]
			],
			[
				[
					4067,
					2047
				],
				[
					-79,
					-21
				],
				[
					-163,
					26
				],
				[
					-67,
					93
				]
			],
			[
				[
					4129,
					4783
				],
				[
					96,
					26
				]
			],
			[
				[
					4180,
					4743
				],
				[
					-51,
					40
				]
			],
			[
				[
					5021,
					3667
				],
				[
					-61,
					-36
				]
			],
			[
				[
					4960,
					3631
				],
				[
					-20,
					19
				]
			],
			[
				[
					4940,
					3650
				],
				[
					20,
					46
				]
			],
			[
				[
					5060,
					3598
				],
				[
					-61,
					24
				]
			],
			[
				[
					4999,
					3622
				],
				[
					-39,
					-17
				]
			],
			[
				[
					4960,
					3605
				],
				[
					0,
					26
				]
			],
			[
				[
					5171,
					7090
				],
				[
					56,
					110
				],
				[
					134,
					-19
				]
			],
			[
				[
					5361,
					7181
				],
				[
					21,
					-119
				]
			],
			[
				[
					5263,
					2435
				],
				[
					193,
					29
				]
			],
			[
				[
					4971,
					3526
				],
				[
					29,
					16
				]
			],
			[
				[
					5000,
					3542
				],
				[
					27,
					5
				]
			],
			[
				[
					4630,
					4828
				],
				[
					30,
					-60
				]
			],
			[
				[
					4638,
					4741
				],
				[
					-145,
					21
				]
			],
			[
				[
					4551,
					4642
				],
				[
					-60,
					42
				]
			],
			[
				[
					7813,
					3577
				],
				[
					21,
					-69
				],
				[
					-30,
					-109
				]
			],
			[
				[
					4231,
					1962
				],
				[
					92,
					-57
				],
				[
					59,
					48
				],
				[
					94,
					-11
				]
			],
			[
				[
					4241,
					1839
				],
				[
					-56,
					22
				],
				[
					46,
					101
				]
			],
			[
				[
					4322,
					5665
				],
				[
					-46,
					-49
				],
				[
					-53,
					75
				]
			],
			[
				[
					5000,
					3542
				],
				[
					-1,
					80
				]
			],
			[
				[
					4940,
					3577
				],
				[
					20,
					28
				]
			],
			[
				[
					4280,
					1272
				],
				[
					20,
					26
				],
				[
					240,
					68
				],
				[
					19,
					119
				]
			],
			[
				[
					4619,
					969
				],
				[
					-208,
					160
				],
				[
					-125,
					4
				]
			],
			[
				[
					3030,
					8165
				],
				[
					-28,
					82
				],
				[
					41,
					116
				]
			],
			[
				[
					4480,
					5022
				],
				[
					-12,
					-57
				]
			],
			[
				[
					4686,
					3356
				],
				[
					-16,
					-59
				],
				[
					128,
					-1
				]
			],
			[
				[
					4815,
					3159
				],
				[
					30,
					-73
				]
			],
			[
				[
					5900,
					2062
				],
				[
					4,
					9
				]
			],
			[
				[
					4111,
					4636
				],
				[
					87,
					56
				]
			],
			[
				[
					4083,
					4663
				],
				[
					-35,
					150
				],
				[
					81,
					-30
				]
			],
			[
				[
					7184,
					2545
				],
				[
					-23,
					-32
				]
			],
			[
				[
					4940,
					3650
				],
				[
					-33,
					0
				]
			],
			[
				[
					4907,
					3650
				],
				[
					-33,
					41
				]
			],
			[
				[
					4892,
					3613
				],
				[
					15,
					37
				]
			],
			[
				[
					3813,
					6365
				],
				[
					-3,
					69
				],
				[
					97,
					137
				],
				[
					-11,
					95
				],
				[
					91,
					107
				],
				[
					15,
					69
				]
			],
			[
				[
					6233,
					1257
				],
				[
					-123,
					-12
				]
			],
			[
				[
					5671,
					5485
				],
				[
					35,
					42
				],
				[
					12,
					-30
				],
				[
					-47,
					-12
				]
			],
			[
				[
					3549,
					3616
				],
				[
					-94,
					-28
				]
			],
			[
				[
					3455,
					3588
				],
				[
					-60,
					95
				],
				[
					53,
					103
				],
				[
					-69,
					157
				],
				[
					23,
					56
				],
				[
					-80,
					99
				],
				[
					-174,
					-65
				],
				[
					-21,
					-102
				],
				[
					-94,
					37
				],
				[
					-117,
					-38
				],
				[
					89,
					148
				],
				[
					113,
					64
				],
				[
					119,
					156
				]
			],
			[
				[
					3072,
					2919
				],
				[
					-80,
					19
				],
				[
					-18,
					67
				]
			],
			[
				[
					2974,
					3005
				],
				[
					128,
					38
				],
				[
					117,
					113
				],
				[
					118,
					60
				],
				[
					61,
					102
				],
				[
					57,
					270
				]
			],
			[
				[
					3184,
					4392
				],
				[
					-192,
					246
				],
				[
					75,
					-18
				],
				[
					-5,
					132
				],
				[
					111,
					35
				],
				[
					102,
					-24
				],
				[
					53,
					-119
				],
				[
					135,
					-20
				],
				[
					-33,
					-62
				],
				[
					-95,
					-72
				],
				[
					-89,
					-112
				],
				[
					-62,
					14
				]
			],
			[
				[
					4453,
					2273
				],
				[
					-32,
					-53
				]
			],
			[
				[
					4415,
					2220
				],
				[
					-13,
					-6
				]
			],
			[
				[
					4401,
					2213
				],
				[
					-137,
					10
				]
			],
			[
				[
					4188,
					2179
				],
				[
					-121,
					-132
				]
			],
			[
				[
					4157,
					2018
				],
				[
					1,
					1
				]
			],
			[
				[
					4231,
					1962
				],
				[
					80,
					92
				]
			],
			[
				[
					3081,
					1417
				],
				[
					17,
					127
				],
				[
					114,
					-43
				],
				[
					133,
					92
				]
			],
			[
				[
					3569,
					803
				],
				[
					-42,
					37
				],
				[
					-79,
					-63
				],
				[
					-103,
					-33
				]
			],
			[
				[
					3345,
					744
				],
				[
					-13,
					142
				],
				[
					-41,
					1
				]
			],
			[
				[
					3291,
					887
				],
				[
					-89,
					300
				],
				[
					-80,
					47
				],
				[
					52,
					105
				],
				[
					-24,
					78
				],
				[
					-69,
					0
				]
			],
			[
				[
					3291,
					887
				],
				[
					-20,
					-30
				],
				[
					-73,
					84
				],
				[
					-16,
					-44
				],
				[
					-147,
					-12
				],
				[
					-20,
					-123
				],
				[
					-122,
					-18
				]
			],
			[
				[
					2713,
					812
				],
				[
					89,
					155
				],
				[
					91,
					5
				],
				[
					26,
					98
				],
				[
					62,
					35
				],
				[
					84,
					109
				],
				[
					16,
					203
				]
			],
			[
				[
					5731,
					1226
				],
				[
					-74,
					-7
				]
			],
			[
				[
					5549,
					946
				],
				[
					-183,
					122
				],
				[
					-8,
					51
				],
				[
					182,
					80
				],
				[
					110,
					-38
				],
				[
					54,
					-73
				],
				[
					-155,
					-142
				]
			],
			[
				[
					7092,
					4182
				],
				[
					137,
					2
				],
				[
					214,
					-52
				],
				[
					126,
					-72
				],
				[
					195,
					-199
				]
			],
			[
				[
					4974,
					7996
				],
				[
					89,
					-135
				],
				[
					103,
					-36
				],
				[
					24,
					-84
				],
				[
					81,
					-58
				],
				[
					49,
					-197
				],
				[
					-20,
					-98
				],
				[
					61,
					-207
				]
			],
			[
				[
					3340,
					719
				],
				[
					-10,
					-22
				],
				[
					39,
					-63
				],
				[
					-206,
					16
				],
				[
					-28,
					-36
				],
				[
					-116,
					8
				]
			],
			[
				[
					3578,
					543
				],
				[
					-122,
					19
				],
				[
					-62,
					92
				]
			],
			[
				[
					3394,
					654
				],
				[
					35,
					38
				]
			],
			[
				[
					3394,
					654
				],
				[
					-46,
					39
				]
			],
			[
				[
					2413,
					430
				],
				[
					62,
					-45
				],
				[
					59,
					21
				],
				[
					28,
					-128
				],
				[
					50,
					10
				]
			],
			[
				[
					2612,
					288
				],
				[
					73,
					-6
				],
				[
					-20,
					-112
				],
				[
					-87,
					-59
				],
				[
					-88,
					176
				],
				[
					-147,
					45
				],
				[
					-19,
					-86
				],
				[
					-94,
					-33
				],
				[
					-24,
					123
				],
				[
					129,
					121
				],
				[
					78,
					-27
				]
			],
			[
				[
					2413,
					430
				],
				[
					147,
					134
				]
			],
			[
				[
					2560,
					564
				],
				[
					59,
					-18
				],
				[
					-17,
					-97
				],
				[
					71,
					-39
				],
				[
					0,
					-76
				]
			],
			[
				[
					2673,
					334
				],
				[
					-61,
					-46
				]
			],
			[
				[
					3194,
					10403
				],
				[
					-57,
					80
				],
				[
					-133,
					65
				],
				[
					22,
					133
				],
				[
					-157,
					5
				],
				[
					-90,
					68
				],
				[
					65,
					75
				],
				[
					-142,
					198
				],
				[
					-158,
					80
				]
			],
			[
				[
					2544,
					11107
				],
				[
					-76,
					130
				],
				[
					74,
					66
				],
				[
					175,
					-15
				],
				[
					-105,
					91
				],
				[
					28,
					121
				],
				[
					62,
					55
				],
				[
					-56,
					49
				],
				[
					97,
					185
				],
				[
					91,
					-16
				],
				[
					168,
					-87
				],
				[
					-76,
					-134
				],
				[
					171,
					173
				],
				[
					212,
					-71
				],
				[
					89,
					58
				],
				[
					260,
					-5
				],
				[
					98,
					76
				],
				[
					95,
					-33
				],
				[
					84,
					55
				],
				[
					169,
					26
				],
				[
					124,
					-20
				],
				[
					-81,
					-185
				],
				[
					62,
					-74
				],
				[
					-44,
					-107
				],
				[
					-87,
					-90
				],
				[
					-124,
					-53
				],
				[
					-97,
					-132
				],
				[
					-349,
					-267
				],
				[
					-23,
					-108
				],
				[
					166,
					-69
				],
				[
					-138,
					-194
				],
				[
					-65,
					32
				],
				[
					-122,
					-37
				],
				[
					-132,
					-124
				]
			],
			[
				[
					2669,
					8962
				],
				[
					-1,
					9
				]
			],
			[
				[
					2668,
					8971
				],
				[
					13,
					100
				],
				[
					-185,
					15
				]
			],
			[
				[
					2496,
					9086
				],
				[
					63,
					137
				],
				[
					-185,
					-152
				],
				[
					-54,
					-87
				],
				[
					-102,
					-45
				],
				[
					-158,
					53
				],
				[
					-73,
					93
				],
				[
					45,
					65
				],
				[
					-185,
					26
				],
				[
					0,
					91
				],
				[
					151,
					18
				],
				[
					61,
					-22
				],
				[
					34,
					104
				],
				[
					106,
					19
				],
				[
					-14,
					70
				],
				[
					-140,
					-4
				],
				[
					71,
					156
				],
				[
					94,
					44
				],
				[
					-69,
					29
				],
				[
					114,
					88
				],
				[
					-38,
					53
				],
				[
					44,
					112
				],
				[
					79,
					28
				],
				[
					-144,
					10
				],
				[
					80,
					166
				],
				[
					-129,
					-75
				],
				[
					-54,
					137
				],
				[
					17,
					177
				],
				[
					124,
					-71
				],
				[
					-74,
					142
				],
				[
					-13,
					89
				],
				[
					82,
					-8
				],
				[
					-100,
					79
				],
				[
					-1,
					145
				],
				[
					68,
					19
				],
				[
					79,
					-142
				],
				[
					27,
					93
				],
				[
					-55,
					56
				],
				[
					79,
					48
				],
				[
					65,
					-81
				],
				[
					32,
					76
				],
				[
					139,
					-86
				],
				[
					-76,
					82
				],
				[
					92,
					4
				],
				[
					17,
					64
				],
				[
					-86,
					28
				],
				[
					-87,
					81
				],
				[
					-1,
					93
				],
				[
					93,
					-57
				],
				[
					30,
					76
				]
			],
			[
				[
					3194,
					10403
				],
				[
					113,
					91
				],
				[
					192,
					15
				],
				[
					-182,
					-238
				],
				[
					-118,
					2
				]
			],
			[
				[
					3022,
					9079
				],
				[
					-353,
					-117
				]
			],
			[
				[
					1961,
					9885
				],
				[
					-35,
					-119
				],
				[
					-20,
					81
				],
				[
					-162,
					-31
				],
				[
					-119,
					200
				],
				[
					51,
					35
				],
				[
					-114,
					66
				],
				[
					1,
					-67
				],
				[
					-117,
					48
				],
				[
					-47,
					75
				],
				[
					50,
					116
				],
				[
					74,
					-103
				],
				[
					-13,
					81
				],
				[
					56,
					13
				],
				[
					-70,
					64
				],
				[
					14,
					73
				],
				[
					141,
					-166
				],
				[
					85,
					6
				],
				[
					-69,
					205
				],
				[
					88,
					89
				],
				[
					120,
					-163
				],
				[
					3,
					-215
				],
				[
					-38,
					-31
				],
				[
					74,
					-110
				],
				[
					155,
					-111
				],
				[
					115,
					47
				],
				[
					59,
					-15
				],
				[
					-5,
					-75
				],
				[
					-85,
					-57
				],
				[
					-107,
					-167
				],
				[
					-72,
					-31
				],
				[
					10,
					127
				],
				[
					67,
					69
				],
				[
					-90,
					66
				]
			],
			[
				[
					1711,
					9668
				],
				[
					81,
					-21
				],
				[
					-32,
					-136
				],
				[
					-118,
					97
				],
				[
					69,
					60
				]
			],
			[
				[
					1983,
					10204
				],
				[
					12,
					-124
				],
				[
					-55,
					-36
				],
				[
					-16,
					113
				],
				[
					59,
					47
				]
			],
			[
				[
					1893,
					9435
				],
				[
					-63,
					11
				],
				[
					54,
					77
				],
				[
					9,
					-88
				]
			],
			[
				[
					3670,
					10450
				],
				[
					176,
					42
				],
				[
					25,
					54
				],
				[
					166,
					21
				],
				[
					190,
					-75
				],
				[
					168,
					43
				]
			],
			[
				[
					4395,
					10535
				],
				[
					-7,
					-116
				],
				[
					98,
					-126
				]
			],
			[
				[
					4486,
					10293
				],
				[
					-109,
					30
				],
				[
					-121,
					-74
				],
				[
					-28,
					-106
				],
				[
					52,
					-36
				],
				[
					-22,
					-136
				]
			],
			[
				[
					4258,
					9971
				],
				[
					-120,
					0
				],
				[
					-73,
					-97
				],
				[
					-85,
					-37
				],
				[
					-19,
					-108
				],
				[
					-230,
					-4
				]
			],
			[
				[
					5488,
					13918
				],
				[
					-119,
					-60
				],
				[
					-5,
					89
				],
				[
					-78,
					-30
				],
				[
					-56,
					41
				],
				[
					4,
					86
				],
				[
					198,
					35
				],
				[
					62,
					42
				],
				[
					-79,
					76
				],
				[
					-13,
					101
				],
				[
					-107,
					-20
				],
				[
					38,
					99
				],
				[
					185,
					121
				],
				[
					93,
					-2
				],
				[
					44,
					119
				],
				[
					95,
					-12
				],
				[
					14,
					-107
				],
				[
					-44,
					-198
				],
				[
					-106,
					-37
				],
				[
					-51,
					-74
				],
				[
					85,
					8
				],
				[
					43,
					-121
				],
				[
					-84,
					-118
				],
				[
					43,
					-113
				],
				[
					-68,
					-69
				],
				[
					11,
					-140
				],
				[
					-48,
					-6
				],
				[
					-7,
					-147
				],
				[
					-71,
					7
				],
				[
					83,
					336
				],
				[
					-62,
					94
				]
			],
			[
				[
					4230,
					12048
				],
				[
					83,
					25
				],
				[
					10,
					77
				],
				[
					-65,
					89
				],
				[
					-165,
					-66
				],
				[
					-36,
					81
				],
				[
					-88,
					33
				],
				[
					36,
					189
				],
				[
					74,
					23
				],
				[
					165,
					-111
				],
				[
					-83,
					-87
				],
				[
					80,
					5
				],
				[
					66,
					-61
				],
				[
					90,
					36
				],
				[
					69,
					-26
				],
				[
					-166,
					-244
				],
				[
					-25,
					-84
				],
				[
					-45,
					121
				]
			],
			[
				[
					3936,
					12177
				],
				[
					52,
					25
				],
				[
					98,
					-74
				],
				[
					19,
					-137
				],
				[
					-77,
					-2
				],
				[
					-111,
					136
				],
				[
					19,
					52
				]
			],
			[
				[
					5775,
					14552
				],
				[
					70,
					226
				],
				[
					68,
					-19
				],
				[
					-1,
					-118
				],
				[
					-137,
					-89
				]
			],
			[
				[
					4522,
					12630
				],
				[
					55,
					77
				],
				[
					32,
					-96
				],
				[
					-87,
					19
				]
			],
			[
				[
					4364,
					12633
				],
				[
					-105,
					7
				],
				[
					-63,
					87
				],
				[
					122,
					-25
				],
				[
					46,
					-69
				]
			],
			[
				[
					4162,
					12508
				],
				[
					22,
					51
				],
				[
					98,
					-25
				],
				[
					-35,
					-72
				],
				[
					-85,
					46
				]
			],
			[
				[
					5819,
					14412
				],
				[
					32,
					80
				],
				[
					72,
					-55
				],
				[
					-104,
					-25
				]
			],
			[
				[
					4436,
					12501
				],
				[
					-60,
					50
				],
				[
					71,
					41
				],
				[
					-11,
					-91
				]
			],
			[
				[
					4320,
					12395
				],
				[
					75,
					14
				],
				[
					-3,
					-79
				],
				[
					-97,
					4
				],
				[
					25,
					61
				]
			],
			[
				[
					5643,
					13883
				],
				[
					69,
					-15
				],
				[
					-15,
					-91
				],
				[
					-54,
					106
				]
			],
			[
				[
					1283,
					10814
				],
				[
					91,
					-1
				],
				[
					-138,
					84
				],
				[
					-61,
					3
				],
				[
					30,
					89
				],
				[
					-71,
					120
				],
				[
					67,
					149
				],
				[
					113,
					-60
				],
				[
					124,
					-1
				],
				[
					-70,
					124
				],
				[
					353,
					243
				],
				[
					73,
					76
				],
				[
					68,
					-116
				],
				[
					-10,
					-112
				],
				[
					-101,
					-108
				],
				[
					22,
					-80
				],
				[
					91,
					74
				],
				[
					-57,
					-111
				],
				[
					-115,
					40
				],
				[
					18,
					-105
				],
				[
					-66,
					-36
				],
				[
					67,
					-39
				],
				[
					1,
					-79
				],
				[
					-66,
					-32
				],
				[
					-13,
					-76
				],
				[
					-147,
					-77
				],
				[
					-79,
					24
				],
				[
					-20,
					-90
				],
				[
					-132,
					-138
				],
				[
					-120,
					146
				],
				[
					59,
					-16
				],
				[
					89,
					105
				]
			],
			[
				[
					867,
					10479
				],
				[
					228,
					67
				],
				[
					1,
					-64
				],
				[
					93,
					-23
				],
				[
					-107,
					-225
				],
				[
					-49,
					19
				],
				[
					-32,
					-1
				],
				[
					-16,
					9
				],
				[
					0,
					38
				],
				[
					-33,
					-3
				],
				[
					-49,
					57
				],
				[
					-64,
					36
				],
				[
					28,
					90
				]
			],
			[
				[
					997,
					9734
				],
				[
					-58,
					12
				],
				[
					-35,
					178
				],
				[
					32,
					121
				],
				[
					-25,
					70
				],
				[
					42,
					25
				],
				[
					7,
					23
				],
				[
					73,
					-56
				],
				[
					-13,
					-11
				],
				[
					49,
					-28
				],
				[
					18,
					-59
				],
				[
					-63,
					-114
				],
				[
					41,
					-169
				],
				[
					-68,
					8
				]
			],
			[
				[
					1056,
					10146
				],
				[
					-51,
					-14
				],
				[
					-28,
					26
				],
				[
					-18,
					6
				],
				[
					-19,
					1
				],
				[
					-16,
					55
				],
				[
					56,
					47
				],
				[
					5,
					-7
				],
				[
					18,
					-9
				],
				[
					22,
					2
				],
				[
					56,
					-35
				],
				[
					-24,
					-2
				],
				[
					-1,
					-70
				]
			],
			[
				[
					839,
					9613
				],
				[
					53,
					61
				],
				[
					50,
					-74
				],
				[
					-112,
					-85
				],
				[
					9,
					98
				]
			],
			[
				[
					2987,
					8166
				],
				[
					-28,
					73
				],
				[
					-139,
					8
				],
				[
					-64,
					-186
				],
				[
					-165,
					129
				],
				[
					-30,
					-73
				],
				[
					29,
					-98
				],
				[
					-111,
					79
				],
				[
					5,
					165
				],
				[
					169,
					217
				],
				[
					-103,
					-77
				],
				[
					-96,
					-147
				],
				[
					-48,
					22
				],
				[
					21,
					-174
				],
				[
					59,
					-89
				],
				[
					9,
					-84
				],
				[
					-90,
					-72
				],
				[
					-47,
					-297
				],
				[
					-33,
					-93
				],
				[
					26,
					-80
				],
				[
					-66,
					-74
				],
				[
					-146,
					-10
				],
				[
					3,
					124
				],
				[
					56,
					55
				],
				[
					5,
					199
				],
				[
					108,
					253
				],
				[
					-75,
					63
				],
				[
					66,
					154
				],
				[
					-75,
					-55
				],
				[
					-19,
					102
				],
				[
					153,
					297
				],
				[
					-83,
					-70
				],
				[
					96,
					169
				],
				[
					-84,
					-4
				],
				[
					16,
					107
				],
				[
					72,
					140
				],
				[
					100,
					30
				],
				[
					74,
					-25
				],
				[
					46,
					9
				],
				[
					71,
					109
				]
			],
			[
				[
					1732,
					8973
				],
				[
					13,
					93
				],
				[
					146,
					69
				],
				[
					46,
					-25
				],
				[
					89,
					-160
				],
				[
					117,
					-7
				],
				[
					112,
					-91
				],
				[
					-46,
					-117
				],
				[
					-96,
					-67
				],
				[
					-42,
					57
				],
				[
					-42,
					-46
				],
				[
					-230,
					-46
				],
				[
					-101,
					7
				],
				[
					27,
					78
				],
				[
					119,
					-20
				],
				[
					141,
					80
				],
				[
					-145,
					-44
				],
				[
					59,
					124
				],
				[
					-84,
					104
				],
				[
					-83,
					11
				]
			],
			[
				[
					1744,
					7866
				],
				[
					40,
					63
				],
				[
					-59,
					26
				],
				[
					-48,
					-101
				],
				[
					-84,
					-17
				],
				[
					51,
					111
				],
				[
					1,
					103
				],
				[
					137,
					41
				],
				[
					110,
					75
				],
				[
					-3,
					-61
				],
				[
					85,
					-281
				],
				[
					-41,
					-57
				],
				[
					-107,
					-17
				],
				[
					-39,
					-69
				],
				[
					-53,
					15
				],
				[
					50,
					125
				],
				[
					-40,
					44
				]
			],
			[
				[
					2074,
					8208
				],
				[
					-91,
					7
				],
				[
					40,
					83
				],
				[
					184,
					153
				],
				[
					16,
					-48
				],
				[
					-109,
					-193
				],
				[
					-99,
					-241
				],
				[
					-88,
					41
				],
				[
					-9,
					95
				],
				[
					50,
					74
				],
				[
					106,
					29
				]
			],
			[
				[
					2668,
					8971
				],
				[
					-65,
					-100
				],
				[
					-35,
					-20
				],
				[
					-185,
					45
				],
				[
					113,
					190
				]
			],
			[
				[
					2645,
					7961
				],
				[
					-44,
					190
				],
				[
					122,
					-112
				],
				[
					15,
					-154
				],
				[
					-93,
					76
				]
			],
			[
				[
					1251,
					8870
				],
				[
					0,
					75
				],
				[
					170,
					55
				],
				[
					-101,
					-148
				],
				[
					-69,
					18
				]
			],
			[
				[
					1647,
					9177
				],
				[
					-39,
					-97
				],
				[
					-154,
					-50
				],
				[
					134,
					131
				],
				[
					59,
					16
				]
			],
			[
				[
					1848,
					8342
				],
				[
					-49,
					-93
				],
				[
					-23,
					50
				],
				[
					102,
					130
				],
				[
					-30,
					-87
				]
			],
			[
				[
					4258,
					9971
				],
				[
					48,
					-71
				],
				[
					247,
					8
				],
				[
					63,
					93
				],
				[
					1,
					-75
				],
				[
					82,
					21
				],
				[
					-10,
					-83
				],
				[
					99,
					4
				]
			],
			[
				[
					4799,
					9797
				],
				[
					-72,
					-53
				],
				[
					68,
					-40
				],
				[
					109,
					52
				],
				[
					30,
					-44
				]
			],
			[
				[
					4934,
					9712
				],
				[
					-89,
					-158
				],
				[
					6,
					-78
				],
				[
					-96,
					-157
				],
				[
					-75,
					-52
				]
			],
			[
				[
					5092,
					10110
				],
				[
					-91,
					38
				],
				[
					-52,
					70
				],
				[
					-111,
					-87
				],
				[
					-78,
					23
				],
				[
					-23,
					-65
				],
				[
					-183,
					83
				],
				[
					9,
					67
				],
				[
					-77,
					54
				]
			],
			[
				[
					4395,
					10535
				],
				[
					219,
					-40
				],
				[
					160,
					39
				],
				[
					92,
					-29
				],
				[
					44,
					37
				],
				[
					152,
					-40
				],
				[
					73,
					-77
				],
				[
					33,
					-189
				],
				[
					-76,
					-126
				]
			],
			[
				[
					4038,
					8722
				],
				[
					266,
					136
				],
				[
					90,
					-7
				],
				[
					3,
					-135
				],
				[
					163,
					-91
				],
				[
					-174,
					-129
				],
				[
					-134,
					9
				]
			],
			[
				[
					5092,
					10110
				],
				[
					-69,
					-73
				],
				[
					-77,
					-185
				]
			],
			[
				[
					4169,
					8432
				],
				[
					-53,
					-99
				],
				[
					-155,
					-47
				]
			],
			[
				[
					4985,
					9793
				],
				[
					-51,
					-81
				]
			],
			[
				[
					3926,
					8244
				],
				[
					130,
					-17
				]
			],
			[
				[
					4190,
					8182
				],
				[
					116,
					36
				],
				[
					79,
					120
				],
				[
					140,
					-15
				],
				[
					57,
					-67
				],
				[
					143,
					-78
				]
			],
			[
				[
					2514,
					7856
				],
				[
					101,
					-32
				],
				[
					64,
					-177
				],
				[
					-25,
					-153
				],
				[
					-150,
					34
				],
				[
					-61,
					197
				],
				[
					71,
					131
				]
			],
			[
				[
					3013,
					7803
				],
				[
					-46,
					-87
				]
			],
			[
				[
					2967,
					7716
				],
				[
					-155,
					129
				],
				[
					38,
					100
				],
				[
					-27,
					136
				]
			],
			[
				[
					2711,
					6899
				],
				[
					95,
					93
				],
				[
					28,
					-38
				],
				[
					122,
					-1
				],
				[
					67,
					40
				],
				[
					-27,
					63
				],
				[
					72,
					59
				],
				[
					94,
					-25
				],
				[
					107,
					231
				],
				[
					140,
					-7
				]
			],
			[
				[
					3838,
					6770
				],
				[
					-65,
					-75
				],
				[
					-96,
					17
				],
				[
					-159,
					-119
				],
				[
					-145,
					12
				],
				[
					-171,
					125
				],
				[
					35,
					-96
				],
				[
					-35,
					-165
				],
				[
					-83,
					32
				],
				[
					-159,
					161
				],
				[
					-98,
					42
				],
				[
					-84,
					-69
				],
				[
					55,
					-226
				],
				[
					-66,
					40
				],
				[
					-27,
					146
				],
				[
					-102,
					105
				],
				[
					-37,
					90
				],
				[
					12,
					112
				],
				[
					56,
					24
				],
				[
					49,
					-150
				],
				[
					-7,
					123
				]
			],
			[
				[
					2810,
					2553
				],
				[
					64,
					97
				],
				[
					95,
					-20
				],
				[
					-16,
					112
				],
				[
					169,
					66
				]
			],
			[
				[
					3192,
					2502
				],
				[
					-211,
					-15
				],
				[
					-22,
					-95
				],
				[
					-110,
					-8
				],
				[
					-56,
					-65
				],
				[
					-97,
					30
				],
				[
					-49,
					83
				],
				[
					174,
					34
				],
				[
					-11,
					87
				]
			],
			[
				[
					2711,
					6899
				],
				[
					-16,
					40
				],
				[
					52,
					157
				],
				[
					95,
					105
				],
				[
					15,
					141
				],
				[
					57,
					101
				],
				[
					106,
					108
				]
			],
			[
				[
					3020,
					7551
				],
				[
					67,
					-44
				],
				[
					91,
					70
				]
			],
			[
				[
					3020,
					7551
				],
				[
					-53,
					165
				]
			],
			[
				[
					2810,
					2553
				],
				[
					9,
					-84
				],
				[
					-221,
					-1
				],
				[
					-48,
					33
				],
				[
					112,
					71
				],
				[
					-24,
					103
				],
				[
					-138,
					-2
				],
				[
					93,
					121
				],
				[
					83,
					23
				],
				[
					16,
					85
				],
				[
					59,
					-41
				],
				[
					102,
					30
				],
				[
					90,
					128
				],
				[
					31,
					-14
				]
			],
			[
				[
					2844,
					482
				],
				[
					-71,
					-45
				],
				[
					-39,
					-84
				],
				[
					-20,
					87
				],
				[
					-41,
					-106
				]
			],
			[
				[
					2560,
					564
				],
				[
					76,
					146
				]
			],
			[
				[
					2348,
					6365
				],
				[
					-56,
					29
				],
				[
					-131,
					-15
				]
			],
			[
				[
					2161,
					6379
				],
				[
					-64,
					30
				]
			],
			[
				[
					2097,
					6409
				],
				[
					80,
					54
				],
				[
					129,
					2
				],
				[
					42,
					-100
				]
			],
			[
				[
					1810,
					6039
				],
				[
					-28,
					-42
				],
				[
					-11,
					-85
				],
				[
					-49,
					12
				]
			],
			[
				[
					1722,
					5924
				],
				[
					-35,
					167
				],
				[
					-60,
					-10
				],
				[
					-65,
					101
				]
			],
			[
				[
					1562,
					6182
				],
				[
					-16,
					57
				]
			],
			[
				[
					1546,
					6239
				],
				[
					122,
					81
				]
			],
			[
				[
					1668,
					6320
				],
				[
					77,
					32
				],
				[
					34,
					-46
				]
			],
			[
				[
					1779,
					6306
				],
				[
					52,
					-152
				],
				[
					-21,
					-115
				]
			],
			[
				[
					1965,
					7087
				],
				[
					-20,
					-100
				],
				[
					71,
					-20
				],
				[
					-22,
					-79
				],
				[
					47,
					-29
				],
				[
					100,
					-156
				],
				[
					53,
					-5
				],
				[
					29,
					-110
				],
				[
					-156,
					-125
				]
			],
			[
				[
					2067,
					6463
				],
				[
					-22,
					19
				]
			],
			[
				[
					2045,
					6482
				],
				[
					14,
					105
				],
				[
					-78,
					46
				]
			],
			[
				[
					1981,
					6633
				],
				[
					-9,
					187
				],
				[
					-81,
					66
				],
				[
					-73,
					129
				],
				[
					100,
					87
				],
				[
					47,
					-15
				]
			],
			[
				[
					1981,
					6633
				],
				[
					-247,
					1
				],
				[
					-105,
					-27
				]
			],
			[
				[
					1629,
					6607
				],
				[
					15,
					59
				],
				[
					-60,
					171
				]
			],
			[
				[
					1584,
					6837
				],
				[
					-11,
					42
				],
				[
					-23,
					36
				],
				[
					-18,
					90
				],
				[
					67,
					90
				],
				[
					-7,
					75
				],
				[
					-6,
					9
				],
				[
					0,
					4
				],
				[
					4,
					4
				],
				[
					-1,
					3
				],
				[
					1,
					3
				],
				[
					1,
					5
				],
				[
					-2,
					19
				],
				[
					123,
					16
				],
				[
					98,
					-55
				],
				[
					73,
					30
				],
				[
					82,
					-121
				]
			],
			[
				[
					2301,
					6083
				],
				[
					52,
					-91
				],
				[
					-100,
					-126
				],
				[
					-76,
					28
				],
				[
					-107,
					-68
				],
				[
					-9,
					-137
				],
				[
					-120,
					-104
				],
				[
					-11,
					39
				],
				[
					-78,
					31
				],
				[
					-16,
					33
				],
				[
					-37,
					-2
				],
				[
					-12,
					7
				],
				[
					-10,
					12
				],
				[
					-7,
					1
				],
				[
					-2,
					2
				],
				[
					-17,
					101
				],
				[
					-24,
					9
				],
				[
					10,
					30
				],
				[
					-8,
					19
				],
				[
					-19,
					12
				],
				[
					-3,
					7
				],
				[
					2,
					6
				],
				[
					1,
					0
				],
				[
					1,
					0
				],
				[
					2,
					3
				],
				[
					3,
					4
				],
				[
					1,
					8
				],
				[
					-4,
					11
				],
				[
					16,
					3
				],
				[
					42,
					-9
				],
				[
					11,
					85
				],
				[
					14,
					-9
				],
				[
					36,
					63
				],
				[
					44,
					0
				],
				[
					81,
					-52
				],
				[
					19,
					64
				],
				[
					136,
					37
				],
				[
					22,
					-38
				],
				[
					91,
					39
				],
				[
					19,
					-38
				],
				[
					57,
					20
				]
			],
			[
				[
					1629,
					6607
				],
				[
					-14,
					-91
				],
				[
					67,
					-87
				],
				[
					-14,
					-109
				]
			],
			[
				[
					1546,
					6239
				],
				[
					-138,
					41
				],
				[
					-121,
					-42
				],
				[
					-44,
					38
				]
			],
			[
				[
					1243,
					6276
				],
				[
					32,
					98
				],
				[
					-41,
					86
				],
				[
					8,
					93
				],
				[
					60,
					107
				]
			],
			[
				[
					1302,
					6660
				],
				[
					82,
					35
				],
				[
					21,
					91
				],
				[
					119,
					33
				],
				[
					24,
					-20
				],
				[
					33,
					19
				],
				[
					3,
					19
				]
			],
			[
				[
					1722,
					5924
				],
				[
					-9,
					-6
				],
				[
					4,
					-11
				],
				[
					-1,
					-8
				],
				[
					-3,
					-4
				],
				[
					-2,
					-2
				],
				[
					-1,
					-1
				],
				[
					-1,
					0
				],
				[
					-2,
					-3
				],
				[
					0,
					-3
				],
				[
					4,
					-3
				],
				[
					-1,
					-4
				],
				[
					27,
					-31
				],
				[
					-10,
					-30
				],
				[
					24,
					-9
				],
				[
					-11,
					-45
				],
				[
					12,
					-21
				],
				[
					9,
					-23
				],
				[
					5,
					-7
				],
				[
					2,
					-5
				],
				[
					2,
					-1
				],
				[
					-115,
					-76
				],
				[
					-170,
					23
				],
				[
					25,
					131
				],
				[
					-120,
					52
				],
				[
					-52,
					163
				]
			],
			[
				[
					1338,
					6000
				],
				[
					53,
					114
				],
				[
					63,
					-15
				],
				[
					42,
					87
				],
				[
					66,
					-4
				]
			],
			[
				[
					1036,
					6793
				],
				[
					-3,
					-42
				],
				[
					51,
					1
				],
				[
					8,
					-57
				],
				[
					96,
					-48
				],
				[
					114,
					13
				]
			],
			[
				[
					1243,
					6276
				],
				[
					-99,
					-81
				],
				[
					-227,
					-55
				],
				[
					-64,
					-39
				],
				[
					-56,
					93
				],
				[
					41,
					110
				],
				[
					-131,
					71
				]
			],
			[
				[
					707,
					6375
				],
				[
					-112,
					29
				],
				[
					-50,
					98
				],
				[
					61,
					45
				],
				[
					68,
					-43
				],
				[
					83,
					63
				],
				[
					74,
					-5
				],
				[
					-9,
					56
				],
				[
					119,
					211
				]
			],
			[
				[
					941,
					6829
				],
				[
					95,
					-36
				]
			],
			[
				[
					2161,
					6379
				],
				[
					-78,
					-62
				]
			],
			[
				[
					2083,
					6317
				],
				[
					-35,
					46
				]
			],
			[
				[
					2048,
					6363
				],
				[
					35,
					52
				]
			],
			[
				[
					2083,
					6415
				],
				[
					14,
					-6
				]
			],
			[
				[
					2083,
					6317
				],
				[
					-15,
					-91
				]
			],
			[
				[
					2068,
					6226
				],
				[
					-77,
					69
				]
			],
			[
				[
					1991,
					6295
				],
				[
					52,
					68
				]
			],
			[
				[
					2043,
					6363
				],
				[
					5,
					0
				]
			],
			[
				[
					2348,
					6365
				],
				[
					64,
					-195
				],
				[
					-59,
					-178
				],
				[
					-60,
					111
				],
				[
					-49,
					-40
				],
				[
					-19,
					38
				],
				[
					-91,
					-39
				],
				[
					-22,
					38
				],
				[
					-81,
					0
				]
			],
			[
				[
					2031,
					6100
				],
				[
					37,
					126
				]
			],
			[
				[
					1991,
					6295
				],
				[
					-52,
					26
				]
			],
			[
				[
					1939,
					6321
				],
				[
					33,
					77
				]
			],
			[
				[
					1972,
					6398
				],
				[
					71,
					-35
				]
			],
			[
				[
					2031,
					6100
				],
				[
					-55,
					-37
				],
				[
					-19,
					-64
				],
				[
					-81,
					52
				],
				[
					-23,
					-18
				],
				[
					-21,
					18
				],
				[
					-22,
					-12
				]
			],
			[
				[
					1779,
					6306
				],
				[
					160,
					15
				]
			],
			[
				[
					2045,
					6482
				],
				[
					-73,
					-84
				]
			],
			[
				[
					2067,
					6463
				],
				[
					16,
					-48
				]
			],
			[
				[
					1591,
					7198
				],
				[
					8,
					-103
				],
				[
					-67,
					-90
				],
				[
					25,
					-51
				],
				[
					-7,
					-39
				],
				[
					23,
					-36
				],
				[
					8,
					-61
				],
				[
					-57,
					1
				],
				[
					-119,
					-33
				],
				[
					-21,
					-91
				],
				[
					-63,
					9
				],
				[
					-133,
					-57
				],
				[
					-96,
					48
				],
				[
					-8,
					57
				],
				[
					-51,
					-1
				],
				[
					44,
					159
				],
				[
					34,
					38
				],
				[
					14,
					15
				],
				[
					12,
					-4
				],
				[
					43,
					5
				],
				[
					46,
					42
				],
				[
					46,
					156
				],
				[
					76,
					-35
				],
				[
					95,
					9
				],
				[
					13,
					27
				],
				[
					76,
					17
				],
				[
					40,
					19
				],
				[
					3,
					-6
				],
				[
					3,
					6
				],
				[
					10,
					-1
				],
				[
					1,
					2
				],
				[
					1,
					0
				],
				[
					1,
					-2
				],
				[
					0,
					0
				]
			],
			[
				[
					1338,
					6000
				],
				[
					-124,
					123
				],
				[
					-138,
					-165
				],
				[
					45,
					-106
				],
				[
					-141,
					-99
				],
				[
					-114,
					-32
				],
				[
					-89,
					28
				],
				[
					-59,
					80
				],
				[
					-130,
					20
				],
				[
					-20,
					111
				],
				[
					-128,
					88
				],
				[
					-90,
					133
				],
				[
					101,
					31
				],
				[
					28,
					78
				],
				[
					117,
					-17
				],
				[
					111,
					102
				]
			],
			[
				[
					941,
					6829
				],
				[
					27,
					135
				],
				[
					157,
					15
				],
				[
					0,
					-16
				],
				[
					-14,
					-15
				],
				[
					23,
					-40
				],
				[
					-57,
					2
				],
				[
					-41,
					-117
				]
			]
		],
		"transform": {
			"scale": [
				0.0013288693987711085,
				0.000742227465584959
			],
			"translate": [
				-8.642326988679672,
				49.8770376862216
			]
		},
		"objects": {
			"constituencies": {
				"type": "GeometryCollection",
				"geometries": [
					{
						"arcs": [
							[
								0,
								1,
								2,
								3,
								4,
								5
							]
						],
						"type": "Polygon",
						"id": "479"
					},
					{
						"arcs": [
							[
								6,
								7,
								8,
								9
							]
						],
						"type": "Polygon",
						"id": "512"
					},
					{
						"arcs": [
							[
								10,
								11,
								12,
								13
							]
						],
						"type": "Polygon",
						"id": "411"
					},
					{
						"arcs": [
							[
								14,
								15,
								16,
								17,
								18,
								19
							]
						],
						"type": "Polygon",
						"id": "420"
					},
					{
						"arcs": [
							[
								20,
								21,
								22,
								23
							]
						],
						"type": "Polygon",
						"id": "18"
					},
					{
						"arcs": [
							[
								24,
								25,
								26,
								27,
								28,
								29,
								30,
								31
							]
						],
						"type": "Polygon",
						"id": "25"
					},
					{
						"arcs": [
							[
								32,
								33,
								34,
								35,
								36
							]
						],
						"type": "Polygon",
						"id": "28"
					},
					{
						"arcs": [
							[
								37,
								38,
								39,
								40,
								41,
								42
							]
						],
						"type": "Polygon",
						"id": "456"
					},
					{
						"arcs": [
							[
								43,
								44,
								45,
								46,
								47,
								48
							]
						],
						"type": "Polygon",
						"id": "30"
					},
					{
						"arcs": [
							[
								49,
								50,
								51,
								52,
								53
							]
						],
						"type": "Polygon",
						"id": "424"
					},
					{
						"arcs": [
							[
								54,
								-7,
								55
							]
						],
						"type": "Polygon",
						"id": "508"
					},
					{
						"arcs": [
							[
								56,
								57,
								58,
								59,
								60,
								61,
								62,
								63,
								64
							]
						],
						"type": "Polygon",
						"id": "34"
					},
					{
						"arcs": [
							[
								65,
								66,
								67,
								68,
								-46
							]
						],
						"type": "Polygon",
						"id": "39"
					},
					{
						"arcs": [
							[
								69,
								70,
								71,
								72,
								73,
								74,
								75
							]
						],
						"type": "Polygon",
						"id": "45"
					},
					{
						"arcs": [
							[
								76,
								77,
								78,
								79,
								80
							]
						],
						"type": "Polygon",
						"id": "48"
					},
					{
						"arcs": [
							[
								81,
								82,
								83,
								84,
								85
							]
						],
						"type": "Polygon",
						"id": "55"
					},
					{
						"arcs": [
							[
								86,
								87,
								88,
								89,
								90,
								91
							]
						],
						"type": "Polygon",
						"id": "62"
					},
					{
						"arcs": [
							[
								92,
								93,
								94,
								95
							]
						],
						"type": "Polygon",
						"id": "68"
					},
					{
						"arcs": [
							[
								96,
								97,
								98,
								99
							]
						],
						"type": "Polygon",
						"id": "73"
					},
					{
						"arcs": [
							[
								100,
								101,
								102,
								103,
								-100
							]
						],
						"type": "Polygon",
						"id": "77"
					},
					{
						"arcs": [
							[
								104,
								105,
								106
							]
						],
						"type": "Polygon",
						"id": "83"
					},
					{
						"arcs": [
							[
								107,
								108,
								109,
								110
							]
						],
						"type": "Polygon",
						"id": "89"
					},
					{
						"arcs": [
							[
								111,
								112
							]
						],
						"type": "Polygon",
						"id": "96"
					},
					{
						"arcs": [
							[
								113,
								114,
								115,
								116,
								117,
								118,
								119,
								120
							]
						],
						"type": "Polygon",
						"id": "102"
					},
					{
						"arcs": [
							[
								121
							]
						],
						"type": "Polygon",
						"id": "108"
					},
					{
						"arcs": [
							[
								122,
								123,
								124,
								125,
								126,
								127
							]
						],
						"type": "Polygon",
						"id": "115"
					},
					{
						"arcs": [
							[
								128,
								129,
								130,
								131,
								132,
								133
							]
						],
						"type": "Polygon",
						"id": "120"
					},
					{
						"arcs": [
							[
								134,
								135,
								136,
								137,
								138,
								139,
								140,
								141,
								142,
								143
							]
						],
						"type": "Polygon",
						"id": "127"
					},
					{
						"arcs": [
							[
								144,
								145,
								146,
								147
							]
						],
						"type": "Polygon",
						"id": "133"
					},
					{
						"arcs": [
							[
								148,
								149
							]
						],
						"type": "Polygon",
						"id": "139"
					},
					{
						"arcs": [
							[
								150,
								151,
								152,
								153,
								154
							]
						],
						"type": "Polygon",
						"id": "145"
					},
					{
						"arcs": [
							[
								155,
								156,
								157,
								158,
								159,
								160,
								161
							]
						],
						"type": "Polygon",
						"id": "439"
					},
					{
						"arcs": [
							[
								162,
								163,
								164,
								165
							]
						],
						"type": "Polygon",
						"id": "158"
					},
					{
						"arcs": [
							[
								166,
								167,
								168,
								169,
								170
							]
						],
						"type": "Polygon",
						"id": "166"
					},
					{
						"arcs": [
							[
								171,
								-74,
								172,
								173,
								174,
								175,
								176
							]
						],
						"type": "Polygon",
						"id": "170"
					},
					{
						"arcs": [
							[
								177,
								178,
								179,
								180,
								181
							]
						],
						"type": "Polygon",
						"id": "178"
					},
					{
						"arcs": [
							[
								182,
								183,
								184,
								185
							]
						],
						"type": "Polygon",
						"id": "185"
					},
					{
						"arcs": [
							[
								186,
								187,
								188,
								189,
								190,
								191,
								192
							]
						],
						"type": "Polygon",
						"id": "192"
					},
					{
						"arcs": [
							[
								193,
								194,
								195,
								196,
								197
							]
						],
						"type": "Polygon",
						"id": "204"
					},
					{
						"arcs": [
							[
								-190,
								198,
								199,
								200,
								201
							]
						],
						"type": "Polygon",
						"id": "210"
					},
					{
						"arcs": [
							[
								202,
								203,
								204,
								-198
							]
						],
						"type": "Polygon",
						"id": "216"
					},
					{
						"arcs": [
							[
								205,
								206,
								207,
								-194,
								-205,
								208,
								-199,
								-189
							]
						],
						"type": "Polygon",
						"id": "221"
					},
					{
						"arcs": [
							[
								-192,
								209,
								210
							]
						],
						"type": "Polygon",
						"id": "228"
					},
					{
						"arcs": [
							[
								211,
								212,
								-31,
								213,
								-195,
								-208
							]
						],
						"type": "Polygon",
						"id": "237"
					},
					{
						"arcs": [
							[
								-191,
								-202,
								214,
								215,
								-210
							]
						],
						"type": "Polygon",
						"id": "242"
					},
					{
						"arcs": [
							[
								-200,
								-209,
								-204,
								216,
								217
							]
						],
						"type": "Polygon",
						"id": "248"
					},
					{
						"arcs": [
							[
								218,
								219,
								220,
								221,
								222
							]
						],
						"type": "Polygon",
						"id": "256"
					},
					{
						"arcs": [
							[
								223,
								224,
								225,
								226
							]
						],
						"type": "Polygon",
						"id": "263"
					},
					{
						"arcs": [
							[
								227,
								228,
								229,
								230,
								231
							]
						],
						"type": "Polygon",
						"id": "268"
					},
					{
						"arcs": [
							[
								232,
								233,
								234,
								235,
								236
							]
						],
						"type": "Polygon",
						"id": "273"
					},
					{
						"arcs": [
							[
								-236,
								237,
								238
							]
						],
						"type": "Polygon",
						"id": "281"
					},
					{
						"arcs": [
							[
								239,
								240,
								241,
								242,
								243
							]
						],
						"type": "Polygon",
						"id": "568"
					},
					{
						"arcs": [
							[
								244,
								245,
								246,
								247,
								248,
								249,
								250
							]
						],
						"type": "Polygon",
						"id": "285"
					},
					{
						"arcs": [
							[
								251,
								252,
								253,
								254,
								255
							]
						],
						"type": "Polygon",
						"id": "291"
					},
					{
						"arcs": [
							[
								-64,
								256,
								257,
								258
							]
						],
						"type": "Polygon",
						"id": "295"
					},
					{
						"arcs": [
							[
								259,
								260,
								-114,
								261,
								-66,
								-45,
								262,
								263,
								264
							]
						],
						"type": "Polygon",
						"id": "303"
					},
					{
						"arcs": [
							[
								265,
								266,
								267,
								268,
								269
							]
						],
						"type": "Polygon",
						"id": "309"
					},
					{
						"arcs": [
							[
								270,
								-266,
								271,
								272,
								273
							]
						],
						"type": "Polygon",
						"id": "314"
					},
					{
						"arcs": [
							[
								274,
								275,
								276,
								-267,
								-271,
								277,
								278,
								279
							]
						],
						"type": "Polygon",
						"id": "116"
					},
					{
						"arcs": [
							[
								280,
								281,
								282,
								283,
								284
							]
						],
						"type": "Polygon",
						"id": "122"
					},
					{
						"arcs": [
							[
								285,
								286,
								287,
								288
							]
						],
						"type": "Polygon",
						"id": "126"
					},
					{
						"arcs": [
							[
								289,
								290,
								291,
								292,
								293,
								294
							]
						],
						"type": "Polygon",
						"id": "132"
					},
					{
						"arcs": [
							[
								295,
								296,
								297
							]
						],
						"type": "Polygon",
						"id": "138"
					},
					{
						"arcs": [
							[
								-296,
								298,
								299,
								300,
								301
							]
						],
						"type": "Polygon",
						"id": "144"
					},
					{
						"arcs": [
							[
								302,
								303,
								-21,
								304,
								305
							]
						],
						"type": "Polygon",
						"id": "152"
					},
					{
						"arcs": [
							[
								306,
								307,
								308,
								309
							]
						],
						"type": "Polygon",
						"id": "160"
					},
					{
						"arcs": [
							[
								310,
								-309,
								311,
								312,
								313,
								-127,
								314,
								315
							]
						],
						"type": "Polygon",
						"id": "164"
					},
					{
						"arcs": [
							[
								-310,
								-311,
								316,
								317
							]
						],
						"type": "Polygon",
						"id": "174"
					},
					{
						"arcs": [
							[
								318,
								319,
								320,
								321,
								322,
								323
							]
						],
						"type": "Polygon",
						"id": "181"
					},
					{
						"arcs": [
							[
								-241,
								324,
								325,
								326,
								327,
								328,
								329,
								330,
								331,
								332,
								333
							]
						],
						"type": "Polygon",
						"id": "551"
					},
					{
						"arcs": [
							[
								334,
								335,
								336,
								337,
								338,
								339
							]
						],
						"type": "Polygon",
						"id": "203"
					},
					{
						"arcs": [
							[
								340,
								341,
								342,
								-108,
								343,
								344,
								345,
								346,
								347
							]
						],
						"type": "Polygon",
						"id": "211"
					},
					{
						"arcs": [
							[
								348,
								349,
								350,
								351,
								352,
								353,
								354
							]
						],
						"type": "Polygon",
						"id": "189"
					},
					{
						"arcs": [
							[
								355,
								356,
								-352,
								357,
								358,
								359
							]
						],
						"type": "Polygon",
						"id": "195"
					},
					{
						"arcs": [
							[
								-5,
								360,
								361,
								362
							]
						],
						"type": "Polygon",
						"id": "571"
					},
					{
						"arcs": [
							[
								363,
								364,
								365,
								366,
								367,
								368
							]
						],
						"type": "Polygon",
						"id": "218"
					},
					{
						"arcs": [
							[
								369,
								370,
								371,
								372,
								373,
								374,
								375,
								376,
								-117
							]
						],
						"type": "Polygon",
						"id": "223"
					},
					{
						"arcs": [
							[
								377,
								378,
								379
							]
						],
						"type": "Polygon",
						"id": "229"
					},
					{
						"arcs": [
							[
								-60,
								380,
								-378,
								381,
								382
							]
						],
						"type": "Polygon",
						"id": "236"
					},
					{
						"arcs": [
							[
								383,
								384,
								385,
								386,
								387,
								388
							]
						],
						"type": "Polygon",
						"id": "241"
					},
					{
						"arcs": [
							[
								389,
								390,
								391,
								392,
								393,
								-385,
								394,
								395,
								396,
								397,
								398,
								399
							]
						],
						"type": "Polygon",
						"id": "247"
					},
					{
						"arcs": [
							[
								400,
								-389,
								401,
								402
							]
						],
						"type": "Polygon",
						"id": "255"
					},
					{
						"arcs": [
							[
								403,
								-395,
								-384,
								-401
							]
						],
						"type": "Polygon",
						"id": "262"
					},
					{
						"arcs": [
							[
								404,
								405,
								406,
								407,
								408,
								409,
								410,
								411
							]
						],
						"type": "Polygon",
						"id": "265"
					},
					{
						"arcs": [
							[
								-146,
								412,
								413,
								414,
								415
							]
						],
						"type": "Polygon",
						"id": "275"
					},
					{
						"arcs": [
							[
								416,
								417,
								418,
								419,
								420,
								-193,
								-211,
								-216,
								421,
								422,
								423,
								424
							]
						],
						"type": "Polygon",
						"id": "279"
					},
					{
						"arcs": [
							[
								425,
								426,
								427,
								428,
								429,
								430
							]
						],
						"type": "Polygon",
						"id": "284"
					},
					{
						"arcs": [
							[
								431,
								432,
								433,
								-47,
								-69,
								434,
								435
							]
						],
						"type": "Polygon",
						"id": "292"
					},
					{
						"arcs": [
							[
								436,
								-91,
								437,
								438,
								439,
								440,
								441,
								442,
								-82
							]
						],
						"type": "Polygon",
						"id": "296"
					},
					{
						"arcs": [
							[
								443,
								444,
								445,
								446,
								447
							]
						],
						"type": "Polygon",
						"id": "302"
					},
					{
						"arcs": [
							[
								448,
								449,
								450,
								451,
								452
							]
						],
						"type": "Polygon",
						"id": "311"
					},
					{
						"arcs": [
							[
								453,
								454,
								-269,
								455
							]
						],
						"type": "Polygon",
						"id": "313"
					},
					{
						"arcs": [
							[
								-270,
								-455,
								456,
								-229,
								457,
								-272
							]
						],
						"type": "Polygon",
						"id": "320"
					},
					{
						"arcs": [
							[
								458,
								459,
								460,
								461,
								462
							]
						],
						"type": "Polygon",
						"id": "324"
					},
					{
						"arcs": [
							[
								463,
								464,
								465,
								466,
								467,
								468
							]
						],
						"type": "Polygon",
						"id": "582"
					},
					{
						"arcs": [
							[
								469,
								-446,
								470,
								471,
								472,
								-315,
								-126,
								473,
								474,
								475,
								476
							]
						],
						"type": "Polygon",
						"id": "326"
					},
					{
						"arcs": [
							[
								477,
								478,
								479,
								-154,
								480
							]
						],
						"type": "Polygon",
						"id": "330"
					},
					{
						"arcs": [
							[
								481,
								482
							]
						],
						"type": "Polygon",
						"id": "334"
					},
					{
						"arcs": [
							[
								483,
								-27,
								484,
								485
							]
						],
						"type": "Polygon",
						"id": "337"
					},
					{
						"arcs": [
							[
								486,
								487,
								488,
								489,
								490,
								491,
								492,
								-71
							]
						],
						"type": "Polygon",
						"id": "338"
					},
					{
						"arcs": [
							[
								493,
								494,
								495
							]
						],
						"type": "Polygon",
						"id": "483"
					},
					{
						"arcs": [
							[
								496,
								-465,
								497,
								498,
								-494,
								499
							]
						],
						"type": "Polygon",
						"id": "487"
					},
					{
						"arcs": [
							[
								500,
								-500,
								-496,
								501,
								502
							]
						],
						"type": "Polygon",
						"id": "594"
					},
					{
						"arcs": [
							[
								503,
								504
							]
						],
						"type": "Polygon",
						"id": "341"
					},
					{
						"arcs": [
							[
								505,
								506,
								507,
								508,
								509,
								510,
								-328
							]
						],
						"type": "Polygon",
						"id": "548"
					},
					{
						"arcs": [
							[
								511,
								512,
								513,
								514,
								515
							]
						],
						"type": "Polygon",
						"id": "344"
					},
					{
						"arcs": [
							[
								516,
								517,
								518,
								519,
								520,
								521
							]
						],
						"type": "Polygon",
						"id": "345"
					},
					{
						"arcs": [
							[
								522,
								523,
								524,
								525,
								526,
								527,
								528,
								529,
								530
							]
						],
						"type": "Polygon",
						"id": "346"
					},
					{
						"arcs": [
							[
								531,
								532,
								533,
								534,
								535,
								-462
							]
						],
						"type": "Polygon",
						"id": "347"
					},
					{
						"arcs": [
							[
								536,
								537,
								538,
								539,
								540,
								541,
								-290
							]
						],
						"type": "Polygon",
						"id": "350"
					},
					{
						"arcs": [
							[
								542,
								543,
								544,
								545,
								546,
								547
							]
						],
						"type": "Polygon",
						"id": "353"
					},
					{
						"arcs": [
							[
								548,
								549,
								550,
								551,
								552,
								553
							]
						],
						"type": "Polygon",
						"id": "354"
					},
					{
						"arcs": [
							[
								554,
								555
							]
						],
						"type": "Polygon",
						"id": "357"
					},
					{
						"arcs": [
							[
								556,
								557,
								558,
								559,
								-134,
								560
							]
						],
						"type": "Polygon",
						"id": "358"
					},
					{
						"arcs": [
							[
								561,
								562
							]
						],
						"type": "Polygon",
						"id": "19"
					},
					{
						"arcs": [
							[
								-84,
								563,
								-139,
								564
							]
						],
						"type": "Polygon",
						"id": "24"
					},
					{
						"arcs": [
							[
								565,
								-265
							]
						],
						"type": "Polygon",
						"id": "27"
					},
					{
						"arcs": [
							[
								566,
								567,
								568,
								569,
								570,
								571,
								-65,
								-259,
								572
							]
						],
						"type": "Polygon",
						"id": "31"
					},
					{
						"arcs": [
							[
								573,
								574,
								575,
								576,
								577
							]
						],
						"type": "Polygon",
						"id": "35"
					},
					{
						"arcs": [
							[
								578,
								579,
								580,
								581,
								582
							]
						],
						"type": "Polygon",
						"id": "40"
					},
					{
						"arcs": [
							[
								583,
								584,
								585,
								586,
								587
							]
						],
						"type": "Polygon",
						"id": "43"
					},
					{
						"arcs": [
							[
								-276,
								588,
								589,
								590,
								591,
								-224,
								592
							]
						],
						"type": "Polygon",
						"id": "49"
					},
					{
						"arcs": [
							[
								593,
								594,
								595,
								-297,
								-302,
								596
							]
						],
						"type": "Polygon",
						"id": "53"
					},
					{
						"arcs": [
							[
								-129,
								-560,
								597,
								598,
								599,
								600,
								601,
								-166,
								602,
								-151,
								603
							]
						],
						"type": "Polygon",
						"id": "58"
					},
					{
						"arcs": [
							[
								-40,
								604,
								605,
								606
							]
						],
						"type": "Polygon",
						"id": "64"
					},
					{
						"arcs": [
							[
								607,
								608,
								609,
								610,
								-219,
								611
							]
						],
						"type": "Polygon",
						"id": "69"
					},
					{
						"arcs": [
							[
								612,
								613
							]
						],
						"type": "Polygon",
						"id": "75"
					},
					{
						"arcs": [
							[
								-374,
								614,
								615,
								616,
								617,
								618,
								619,
								620
							]
						],
						"type": "Polygon",
						"id": "84"
					},
					{
						"arcs": [
							[
								621,
								622,
								623,
								-42,
								624,
								625,
								626
							]
						],
						"type": "Polygon",
						"id": "528"
					},
					{
						"arcs": [
							[
								-9,
								627,
								628,
								629,
								-43,
								-624,
								630
							]
						],
						"type": "Polygon",
						"id": "516"
					},
					{
						"arcs": [
							[
								631,
								632,
								633,
								634,
								635,
								636,
								-20
							]
						],
						"type": "Polygon",
						"id": "451"
					},
					{
						"arcs": [
							[
								637,
								638
							]
						],
						"type": "Polygon",
						"id": "90"
					},
					{
						"arcs": [
							[
								639,
								-475,
								640,
								641,
								642,
								643
							]
						],
						"type": "Polygon",
						"id": "94"
					},
					{
						"arcs": [
							[
								644,
								645,
								646,
								647,
								648,
								649,
								650
							]
						],
						"type": "Polygon",
						"id": "103"
					},
					{
						"arcs": [
							[
								651,
								652,
								653,
								-106,
								654
							]
						],
						"type": "Polygon",
						"id": "109"
					},
					{
						"arcs": [
							[
								655,
								656,
								657,
								658,
								659,
								660
							]
						],
						"type": "Polygon",
						"id": "113"
					},
					{
						"arcs": [
							[
								661,
								662,
								663,
								664
							]
						],
						"type": "Polygon",
						"id": "121"
					},
					{
						"arcs": [
							[
								665,
								-662,
								666,
								667
							]
						],
						"type": "Polygon",
						"id": "128"
					},
					{
						"arcs": [
							[
								668,
								-667,
								-665,
								669,
								670
							]
						],
						"type": "Polygon",
						"id": "131"
					},
					{
						"arcs": [
							[
								671,
								672,
								673
							]
						],
						"type": "Polygon",
						"id": "137"
					},
					{
						"arcs": [
							[
								-647,
								674,
								675,
								676,
								677
							]
						],
						"type": "Polygon",
						"id": "143"
					},
					{
						"arcs": [
							[
								678,
								679,
								680,
								-148,
								681,
								682
							]
						],
						"type": "Polygon",
						"id": "151"
					},
					{
						"arcs": [
							[
								683,
								684,
								685,
								686,
								-680,
								687,
								-514
							]
						],
						"type": "Polygon",
						"id": "157"
					},
					{
						"arcs": [
							[
								-515,
								-688,
								-679,
								688,
								689
							]
						],
						"type": "Polygon",
						"id": "167"
					},
					{
						"arcs": [
							[
								690,
								691,
								-15,
								-637,
								692,
								693
							]
						],
						"type": "Polygon",
						"id": "455"
					},
					{
						"arcs": [
							[
								694,
								-467,
								695,
								696,
								697,
								-326
							]
						],
						"type": "Polygon",
						"id": "559"
					},
					{
						"arcs": [
							[
								-180,
								698,
								-94,
								699,
								700,
								701,
								702,
								703
							]
						],
						"type": "Polygon",
						"id": "172"
					},
					{
						"arcs": [
							[
								704,
								705
							]
						],
						"type": "Polygon",
						"id": "182"
					},
					{
						"arcs": [
							[
								706,
								707,
								708,
								-182,
								709,
								710
							]
						],
						"type": "Polygon",
						"id": "190"
					},
					{
						"arcs": [
							[
								711,
								712,
								713,
								714,
								715,
								716,
								717,
								718,
								719,
								720,
								721
							]
						],
						"type": "Polygon",
						"id": "196"
					},
					{
						"arcs": [
							[
								722,
								723,
								724,
								725,
								726,
								-38,
								-630
							]
						],
						"type": "Polygon",
						"id": "453"
					},
					{
						"arcs": [
							[
								727,
								728,
								-81,
								729,
								730,
								731
							]
						],
						"type": "Polygon",
						"id": "201"
					},
					{
						"arcs": [
							[
								732,
								733,
								734,
								-263,
								-44,
								735,
								736,
								737,
								-450,
								738
							]
						],
						"type": "Polygon",
						"id": "222"
					},
					{
						"arcs": [
							[
								-737,
								739,
								740,
								741
							]
						],
						"type": "Polygon",
						"id": "209"
					},
					{
						"arcs": [
							[
								-741,
								742,
								743
							]
						],
						"type": "Polygon",
						"id": "217"
					},
					{
						"arcs": [
							[
								744,
								-583,
								745,
								746,
								747,
								748,
								749,
								750
							]
						],
						"type": "Polygon",
						"id": "230"
					},
					{
						"arcs": [
							[
								-642,
								751,
								-124,
								752,
								753
							]
						],
						"type": "Polygon",
						"id": "235"
					},
					{
						"arcs": [
							[
								754,
								755
							]
						],
						"type": "Polygon",
						"id": "246"
					},
					{
						"arcs": [
							[
								-755,
								756,
								757,
								-102,
								758,
								759,
								-371,
								760
							]
						],
						"type": "Polygon",
						"id": "254"
					},
					{
						"arcs": [
							[
								-370,
								-116,
								761,
								762,
								-757,
								-756,
								-761
							]
						],
						"type": "Polygon",
						"id": "244"
					},
					{
						"arcs": [
							[
								763,
								-492,
								764,
								765
							]
						],
						"type": "Polygon",
						"id": "261"
					},
					{
						"arcs": [
							[
								766,
								767,
								768,
								769,
								770
							]
						],
						"type": "Polygon",
						"id": "266"
					},
					{
						"arcs": [
							[
								771,
								-771,
								772,
								773
							]
						],
						"type": "Polygon",
						"id": "274"
					},
					{
						"arcs": [
							[
								774,
								775,
								-479,
								776,
								-686
							]
						],
						"type": "Polygon",
						"id": "282"
					},
					{
						"arcs": [
							[
								777,
								778,
								779,
								780,
								781,
								782,
								783,
								-156,
								784,
								785,
								786,
								787
							]
						],
						"type": "Polygon",
						"id": "463"
					},
					{
						"arcs": [
							[
								-52,
								788,
								789
							]
						],
						"type": "Polygon",
						"id": "466"
					},
					{
						"arcs": [
							[
								-53,
								-790,
								790,
								791
							]
						],
						"type": "Polygon",
						"id": "471"
					},
					{
						"arcs": [
							[
								792,
								793,
								794
							]
						],
						"type": "Polygon",
						"id": "475"
					},
					{
						"arcs": [
							[
								-336,
								795,
								796,
								-358,
								-351,
								797
							]
						],
						"type": "Polygon",
						"id": "286"
					},
					{
						"arcs": [
							[
								798,
								799,
								800,
								-359,
								-797,
								801
							]
						],
						"type": "Polygon",
						"id": "293"
					},
					{
						"arcs": [
							[
								802,
								803,
								-802,
								-796,
								-335
							]
						],
						"type": "Polygon",
						"id": "297"
					},
					{
						"arcs": [
							[
								804,
								-610,
								805,
								806,
								807,
								808
							]
						],
						"type": "Polygon",
						"id": "304"
					},
					{
						"arcs": [
							[
								809,
								-175,
								810
							]
						],
						"type": "Polygon",
						"id": "70"
					},
					{
						"arcs": [
							[
								811,
								812,
								813,
								814,
								815,
								816,
								817
							]
						],
						"type": "Polygon",
						"id": "78"
					},
					{
						"arcs": [
							[
								-526,
								818,
								-524,
								819,
								820
							]
						],
						"type": "Polygon",
						"id": "310"
					},
					{
						"arcs": [
							[
								821,
								-693,
								-636,
								822,
								823,
								824,
								825
							]
						],
						"type": "Polygon",
						"id": "478"
					},
					{
						"arcs": [
							[
								826,
								827,
								828,
								-569,
								829
							]
						],
						"type": "Polygon",
						"id": "51"
					},
					{
						"arcs": [
							[
								830,
								831,
								832,
								-96,
								833,
								834
							]
						],
						"type": "Polygon",
						"id": "315"
					},
					{
						"arcs": [
							[
								835,
								836,
								837,
								838,
								839,
								-780
							]
						],
						"type": "Polygon",
						"id": "482"
					},
					{
						"arcs": [
							[
								840,
								841,
								842,
								843,
								-837,
								844
							]
						],
						"type": "Polygon",
						"id": "489"
					},
					{
						"arcs": [
							[
								-672,
								845,
								846,
								-689,
								-683,
								847,
								848,
								849,
								850,
								851,
								852
							]
						],
						"type": "Polygon",
						"id": "52"
					},
					{
						"arcs": [
							[
								853,
								-62,
								854,
								855
							]
						],
						"type": "Polygon",
						"id": "59"
					},
					{
						"arcs": [
							[
								856,
								857,
								858,
								859,
								860,
								-170
							]
						],
						"type": "Polygon",
						"id": "63"
					},
					{
						"arcs": [
							[
								-626,
								861,
								-606,
								862,
								863,
								864,
								-648,
								-678,
								865
							]
						],
						"type": "Polygon",
						"id": "80"
					},
					{
						"arcs": [
							[
								866,
								867,
								868,
								869,
								870,
								871
							]
						],
						"type": "Polygon",
						"id": "492"
					},
					{
						"arcs": [
							[
								-872,
								872,
								873,
								874
							]
						],
						"type": "Polygon",
						"id": "496"
					},
					{
						"arcs": [
							[
								875,
								-870,
								876
							]
						],
						"type": "Polygon",
						"id": "500"
					},
					{
						"arcs": [
							[
								877,
								-873,
								-871,
								-876,
								878,
								-783,
								879
							]
						],
						"type": "Polygon",
						"id": "504"
					},
					{
						"arcs": [
							[
								880,
								881,
								882,
								-577,
								883,
								884
							]
						],
						"type": "Polygon",
						"id": "85"
					},
					{
						"arcs": [
							[
								885,
								886,
								887,
								-863,
								-605,
								-39,
								-727,
								888
							]
						],
						"type": "Polygon",
						"id": "88"
					},
					{
						"arcs": [
							[
								889,
								890,
								891,
								892,
								893,
								894,
								895
							]
						],
						"type": "Polygon",
						"id": "92"
					},
					{
						"arcs": [
							[
								896,
								897,
								898,
								899,
								-414
							]
						],
						"type": "Polygon",
						"id": "97"
					},
					{
						"arcs": [
							[
								900,
								-882,
								901,
								902,
								-431
							]
						],
						"type": "Polygon",
						"id": "99"
					},
					{
						"arcs": [
							[
								903,
								-902,
								-881,
								904,
								905,
								-584
							]
						],
						"type": "Polygon",
						"id": "104"
					},
					{
						"arcs": [
							[
								906,
								-578,
								-883,
								-901,
								-430,
								907,
								-348
							]
						],
						"type": "Polygon",
						"id": "107"
					},
					{
						"arcs": [
							[
								908,
								909,
								910,
								911
							]
						],
						"type": "Polygon",
						"id": "111"
					},
					{
						"arcs": [
							[
								912,
								-48,
								-434,
								913,
								914,
								915
							]
						],
						"type": "Polygon",
						"id": "118"
					},
					{
						"arcs": [
							[
								916,
								-899,
								917,
								-834,
								-95,
								-699,
								-179
							]
						],
						"type": "Polygon",
						"id": "124"
					},
					{
						"arcs": [
							[
								918,
								919,
								920,
								921,
								922
							]
						],
						"type": "Polygon",
						"id": "130"
					},
					{
						"arcs": [
							[
								-819,
								-525
							]
						],
						"type": "Polygon",
						"id": "135"
					},
					{
						"arcs": [
							[
								923,
								924,
								925,
								926,
								-691
							]
						],
						"type": "Polygon",
						"id": "517"
					},
					{
						"arcs": [
							[
								927,
								928,
								929,
								-818,
								930
							]
						],
						"type": "Polygon",
						"id": "141"
					},
					{
						"arcs": [
							[
								-548,
								931,
								932,
								-487,
								-70,
								933
							]
						],
						"type": "Polygon",
						"id": "147"
					},
					{
						"arcs": [
							[
								-803,
								-340,
								934,
								935,
								936
							]
						],
						"type": "Polygon",
						"id": "154"
					},
					{
						"arcs": [
							[
								937,
								938,
								939,
								940,
								941,
								-386,
								-394
							]
						],
						"type": "Polygon",
						"id": "159"
					},
					{
						"arcs": [
							[
								942,
								943,
								-354,
								944,
								-586,
								945
							]
						],
						"type": "Polygon",
						"id": "163"
					},
					{
						"arcs": [
							[
								946,
								-72,
								-493,
								-764,
								947
							]
						],
						"type": "Polygon",
						"id": "171"
					},
					{
						"arcs": [
							[
								-940,
								948,
								949,
								950,
								951,
								952,
								953,
								954,
								955
							]
						],
						"type": "Polygon",
						"id": "179"
					},
					{
						"arcs": [
							[
								-238,
								-235,
								956,
								957,
								958,
								959
							]
						],
						"type": "Polygon",
						"id": "187"
					},
					{
						"arcs": [
							[
								960,
								961,
								962,
								-118,
								-377,
								963,
								-375,
								-621,
								964,
								965
							]
						],
						"type": "Polygon",
						"id": "193"
					},
					{
						"arcs": [
							[
								966,
								967,
								968,
								969,
								970,
								971,
								-886
							]
						],
						"type": "Polygon",
						"id": "200"
					},
					{
						"arcs": [
							[
								972,
								973,
								974,
								-248,
								975
							]
						],
						"type": "Polygon",
						"id": "208"
					},
					{
						"arcs": [
							[
								976,
								977,
								978,
								979,
								980
							]
						],
						"type": "Polygon",
						"id": "215"
					},
					{
						"arcs": [
							[
								981,
								-932,
								-547,
								982
							]
						],
						"type": "Polygon",
						"id": "220"
					},
					{
						"arcs": [
							[
								983,
								984,
								985,
								986,
								987,
								988,
								989
							]
						],
						"type": "Polygon",
						"id": "521"
					},
					{
						"arcs": [
							[
								-634,
								990,
								991,
								-985,
								992
							]
						],
						"type": "Polygon",
						"id": "525"
					},
					{
						"arcs": [
							[
								993,
								-990,
								994,
								-824
							]
						],
						"type": "Polygon",
						"id": "529"
					},
					{
						"arcs": [
							[
								-984,
								-994,
								-823,
								-635,
								-993
							]
						],
						"type": "Polygon",
						"id": "533"
					},
					{
						"arcs": [
							[
								995,
								-825,
								-995,
								-989,
								996,
								997
							]
						],
						"type": "Polygon",
						"id": "537"
					},
					{
						"arcs": [
							[
								-838,
								-844,
								998,
								-987,
								999
							]
						],
						"type": "Polygon",
						"id": "541"
					},
					{
						"arcs": [
							[
								1000,
								1001,
								-997,
								-988,
								-999,
								-843
							]
						],
						"type": "Polygon",
						"id": "545"
					},
					{
						"arcs": [
							[
								1002,
								1003,
								1004,
								1005
							]
						],
						"type": "Polygon",
						"id": "549"
					},
					{
						"arcs": [
							[
								1006,
								1007,
								-954
							]
						],
						"type": "Polygon",
						"id": "227"
					},
					{
						"arcs": [
							[
								-929,
								1008,
								1009,
								1010
							]
						],
						"type": "Polygon",
						"id": "233"
					},
					{
						"arcs": [
							[
								1011,
								-507,
								1012,
								1013,
								1014,
								1015
							]
						],
						"type": "Polygon",
						"id": "467"
					},
					{
						"arcs": [
							[
								1016,
								1017,
								1018,
								1019
							]
						],
						"type": "Polygon",
						"id": "240"
					},
					{
						"arcs": [
							[
								1020,
								1021,
								1022,
								-545,
								1023,
								-711
							]
						],
						"type": "Polygon",
						"id": "245"
					},
					{
						"arcs": [
							[
								1024,
								-618
							]
						],
						"type": "Polygon",
						"id": "252"
					},
					{
						"arcs": [
							[
								1025,
								-411,
								1026,
								1027,
								1028
							]
						],
						"type": "Polygon",
						"id": "259"
					},
					{
						"arcs": [
							[
								1029,
								1030,
								1031,
								-835,
								-918,
								-898,
								1032
							]
						],
						"type": "Polygon",
						"id": "264"
					},
					{
						"arcs": [
							[
								1033,
								1034,
								1035,
								-571,
								1036,
								1037
							]
						],
						"type": "Polygon",
						"id": "271"
					},
					{
						"arcs": [
							[
								1038,
								1039,
								1040,
								1041
							]
						],
						"type": "Polygon",
						"id": "278"
					},
					{
						"arcs": [
							[
								1042,
								-1040,
								1043,
								1044,
								1045,
								-163,
								-602,
								1046
							]
						],
						"type": "Polygon",
						"id": "283"
					},
					{
						"arcs": [
							[
								1047,
								-773,
								-770,
								1048,
								1049,
								-187,
								-421
							]
						],
						"type": "Polygon",
						"id": "290"
					},
					{
						"arcs": [
							[
								1050,
								1051,
								-317,
								-316,
								-473
							]
						],
						"type": "Polygon",
						"id": "301"
					},
					{
						"arcs": [
							[
								1052,
								1053,
								-615,
								-373,
								1054,
								-857,
								-169
							]
						],
						"type": "Polygon",
						"id": "306"
					},
					{
						"arcs": [
							[
								-972,
								1055,
								1056,
								1057,
								-887
							]
						],
						"type": "Polygon",
						"id": "312"
					},
					{
						"arcs": [
							[
								-350,
								1058,
								-558,
								1059,
								-337,
								-798
							]
						],
						"type": "Polygon",
						"id": "319"
					},
					{
						"arcs": [
							[
								-944,
								1060,
								1061,
								1062,
								-355
							]
						],
						"type": "Polygon",
						"id": "321"
					},
					{
						"arcs": [
							[
								1063,
								1064,
								1065,
								1066,
								1067,
								-714
							]
						],
						"type": "Polygon",
						"id": "325"
					},
					{
						"arcs": [
							[
								-908,
								-429,
								1068,
								1069,
								-341
							]
						],
						"type": "Polygon",
						"id": "327"
					},
					{
						"arcs": [
							[
								1070,
								1071,
								1072
							]
						],
						"type": "Polygon",
						"id": "1"
					},
					{
						"arcs": [
							[
								1073,
								1074,
								1075,
								1076,
								1077,
								-356
							]
						],
						"type": "Polygon",
						"id": "2"
					},
					{
						"arcs": [
							[
								-801,
								1078,
								1079,
								-1074,
								-360
							]
						],
						"type": "Polygon",
						"id": "3"
					},
					{
						"arcs": [
							[
								1080,
								-809,
								1081,
								1082,
								1083
							]
						],
						"type": "Polygon",
						"id": "4"
					},
					{
						"arcs": [
							[
								1084,
								-638,
								1085,
								-322,
								1086,
								1087,
								-613,
								1088
							]
						],
						"type": "Polygon",
						"id": "5"
					},
					{
						"arcs": [
							[
								-173,
								-73,
								-947,
								1089
							]
						],
						"type": "Polygon",
						"id": "6"
					},
					{
						"arcs": [
							[
								1090,
								1091,
								1092,
								-567,
								1093
							]
						],
						"type": "Polygon",
						"id": "7"
					},
					{
						"arcs": [
							[
								1094,
								-143,
								1095,
								-799,
								-804,
								-937,
								1096
							]
						],
						"type": "Polygon",
						"id": "8"
					},
					{
						"arcs": [
							[
								-731,
								1097,
								1098,
								1099,
								-551,
								1100
							]
						],
						"type": "Polygon",
						"id": "9"
					},
					{
						"arcs": [
							[
								-442,
								1101,
								1102,
								1103,
								1104,
								1105,
								1106
							]
						],
						"type": "Polygon",
						"id": "10"
					},
					{
						"arcs": [
							[
								1107,
								1108,
								-759,
								-101,
								-99,
								1109
							]
						],
						"type": "Polygon",
						"id": "11"
					},
					{
						"arcs": [
							[
								1110,
								-587,
								-945,
								-353,
								-357,
								-1078
							]
						],
						"type": "Polygon",
						"id": "12"
					},
					{
						"arcs": [
							[
								1111,
								1112,
								1113,
								1114,
								1115,
								1116,
								1117,
								1118,
								1119,
								-92,
								-437,
								-86,
								1120
							]
						],
						"type": "Polygon",
						"id": "13"
					},
					{
						"arcs": [
							[
								-333,
								1121,
								-950,
								1122
							]
						],
						"type": "Polygon",
						"id": "14"
					},
					{
						"arcs": [
							[
								1123,
								-1069,
								-428,
								1124,
								1125
							]
						],
						"type": "Polygon",
						"id": "15"
					},
					{
						"arcs": [
							[
								-1111,
								-1077,
								1126,
								1127,
								1128,
								-426,
								-903,
								-904,
								-588
							]
						],
						"type": "Polygon",
						"id": "17"
					},
					{
						"arcs": [
							[
								1129,
								1130,
								-252,
								1131,
								1132,
								-245,
								1133,
								1134,
								-161
							]
						],
						"type": "Polygon",
						"id": "20"
					},
					{
						"arcs": [
							[
								1135,
								1136,
								-230,
								-457,
								-454,
								1137
							]
						],
						"type": "Polygon",
						"id": "23"
					},
					{
						"arcs": [
							[
								-644,
								1138,
								1139,
								-733,
								1140,
								1141,
								-1099,
								1142,
								1143
							]
						],
						"type": "Polygon",
						"id": "26"
					},
					{
						"arcs": [
							[
								-1104,
								1144,
								1145,
								1146,
								1147,
								1148,
								1149,
								1150
							]
						],
						"type": "Polygon",
						"id": "37"
					},
					{
						"arcs": [
							[
								1151,
								1152,
								-600,
								1153,
								-1061,
								-943,
								1154
							]
						],
						"type": "Polygon",
						"id": "42"
					},
					{
						"arcs": [
							[
								-703,
								1155,
								-345,
								1156,
								1157
							]
						],
						"type": "Polygon",
						"id": "50"
					},
					{
						"arcs": [
							[
								-946,
								-585,
								-906,
								1158,
								1159,
								-1155
							]
						],
						"type": "Polygon",
						"id": "54"
					},
					{
						"arcs": [
							[
								-57,
								-572,
								-1036,
								1160,
								-673,
								-853,
								1161
							]
						],
						"type": "Polygon",
						"id": "61"
					},
					{
						"arcs": [
							[
								1162,
								1163,
								1164,
								-806,
								-609
							]
						],
						"type": "Polygon",
						"id": "66"
					},
					{
						"arcs": [
							[
								-61,
								-383,
								1165,
								-855
							]
						],
						"type": "Polygon",
						"id": "71"
					},
					{
						"arcs": [
							[
								-474,
								-125,
								-752,
								-641
							]
						],
						"type": "Polygon",
						"id": "76"
					},
					{
						"arcs": [
							[
								-660,
								1166,
								1167,
								1168
							]
						],
						"type": "Polygon",
						"id": "81"
					},
					{
						"arcs": [
							[
								-226,
								1169,
								-448,
								1170
							]
						],
						"type": "Polygon",
						"id": "86"
					},
					{
						"arcs": [
							[
								1171,
								-574,
								-907,
								-347,
								1172,
								-701,
								1173
							]
						],
						"type": "Polygon",
						"id": "87"
					},
					{
						"arcs": [
							[
								-700,
								-93,
								-833,
								1174,
								-1174
							]
						],
						"type": "Polygon",
						"id": "93"
					},
					{
						"arcs": [
							[
								1175,
								1176,
								1177,
								1178,
								1179,
								1180
							]
						],
						"type": "Polygon",
						"id": "556"
					},
					{
						"arcs": [
							[
								1181,
								1182,
								1183,
								1184,
								1185
							]
						],
						"type": "Polygon",
						"id": "560"
					},
					{
						"arcs": [
							[
								-535,
								1186,
								1187
							]
						],
						"type": "Polygon",
						"id": "98"
					},
					{
						"arcs": [
							[
								-1160,
								1188,
								-1041,
								-1043,
								1189,
								-1152
							]
						],
						"type": "Polygon",
						"id": "105"
					},
					{
						"arcs": [
							[
								-1047,
								-601,
								-1153,
								-1190
							]
						],
						"type": "Polygon",
						"id": "106"
					},
					{
						"arcs": [
							[
								1190,
								-244,
								1191,
								1192,
								-469
							]
						],
						"type": "Polygon",
						"id": "586"
					},
					{
						"arcs": [
							[
								-974,
								1193,
								1194,
								1195,
								1196,
								1197
							]
						],
						"type": "Polygon",
						"id": "112"
					},
					{
						"arcs": [
							[
								1198,
								1199,
								1200,
								-1051,
								-472
							]
						],
						"type": "Polygon",
						"id": "117"
					},
					{
						"arcs": [
							[
								1201,
								-671,
								1202,
								-722,
								1203,
								-89,
								1204,
								1205,
								1206
							]
						],
						"type": "Polygon",
						"id": "123"
					},
					{
						"arcs": [
							[
								-559,
								-1059,
								-349,
								-1063,
								1207,
								-598
							]
						],
						"type": "Polygon",
						"id": "129"
					},
					{
						"arcs": [
							[
								-715,
								-1068,
								1208,
								-657,
								1209
							]
						],
						"type": "Polygon",
						"id": "136"
					},
					{
						"arcs": [
							[
								-779,
								1210,
								1211,
								1212,
								-845,
								-836
							]
						],
						"type": "Polygon",
						"id": "564"
					},
					{
						"arcs": [
							[
								1213,
								1214,
								1215,
								1216,
								-909,
								1217,
								-921
							]
						],
						"type": "Polygon",
						"id": "142"
					},
					{
						"arcs": [
							[
								1218,
								1219,
								-167,
								1220
							]
						],
						"type": "Polygon",
						"id": "148"
					},
					{
						"arcs": [
							[
								-1220,
								1221,
								-1053,
								-168
							]
						],
						"type": "Polygon",
						"id": "155"
					},
					{
						"arcs": [
							[
								-616,
								-1054,
								-1222,
								-1219,
								1222
							]
						],
						"type": "Polygon",
						"id": "165"
					},
					{
						"arcs": [
							[
								-387,
								-942,
								1223,
								1224
							]
						],
						"type": "Polygon",
						"id": "169"
					},
					{
						"arcs": [
							[
								-970,
								1225,
								1226,
								1227,
								1228,
								1229,
								1230,
								1231
							]
						],
						"type": "Polygon",
						"id": "177"
					},
					{
						"arcs": [
							[
								-840,
								1232,
								-991,
								-633,
								1233,
								-18,
								1234,
								-781
							]
						],
						"type": "Polygon",
						"id": "569"
					},
					{
						"arcs": [
							[
								1235,
								1236,
								-233,
								1237,
								1238,
								1239
							]
						],
						"type": "Polygon",
						"id": "186"
					},
					{
						"arcs": [
							[
								1240,
								1241,
								1242,
								1243,
								-895,
								1244
							]
						],
						"type": "Polygon",
						"id": "191"
					},
					{
						"arcs": [
							[
								-1244,
								1245,
								-896
							]
						],
						"type": "Polygon",
						"id": "199"
					},
					{
						"arcs": [
							[
								-1243,
								1246,
								-890,
								-1246
							]
						],
						"type": "Polygon",
						"id": "202"
					},
					{
						"arcs": [
							[
								1247,
								1248,
								1249,
								1250,
								-891,
								-1247,
								-1242,
								1251
							]
						],
						"type": "Polygon",
						"id": "16"
					},
					{
						"arcs": [
							[
								-1252,
								-1241,
								1252,
								-313,
								1253
							]
						],
						"type": "Polygon",
						"id": "22"
					},
					{
						"arcs": [
							[
								1254,
								1255,
								-540,
								1256,
								-1066
							]
						],
						"type": "Polygon",
						"id": "29"
					},
					{
						"arcs": [
							[
								1257,
								-1255,
								-1065,
								1258
							]
						],
						"type": "Polygon",
						"id": "32"
					},
					{
						"arcs": [
							[
								-1256,
								-1258,
								1259,
								-541
							]
						],
						"type": "Polygon",
						"id": "36"
					},
					{
						"arcs": [
							[
								1260,
								1261,
								1262,
								-279,
								1263
							]
						],
						"type": "Polygon",
						"id": "41"
					},
					{
						"arcs": [
							[
								-176,
								-810,
								1264,
								-379,
								-381,
								-59,
								1265,
								1266
							]
						],
						"type": "Polygon",
						"id": "44"
					},
					{
						"arcs": [
							[
								-153,
								1267,
								-1030,
								1268,
								1269,
								-481
							]
						],
						"type": "Polygon",
						"id": "60"
					},
					{
						"arcs": [
							[
								-897,
								-413,
								1270,
								-1269,
								-1033
							]
						],
						"type": "Polygon",
						"id": "47"
					},
					{
						"arcs": [
							[
								-777,
								-478,
								-1270,
								-1271,
								-145,
								-681,
								-687
							]
						],
						"type": "Polygon",
						"id": "56"
					},
					{
						"arcs": [
							[
								1271,
								-575,
								-1172,
								-1175,
								-832,
								1272,
								-1045
							]
						],
						"type": "Polygon",
						"id": "67"
					},
					{
						"arcs": [
							[
								1273,
								-452,
								1274,
								1275,
								-28,
								-484,
								1276
							]
						],
						"type": "Polygon",
						"id": "72"
					},
					{
						"arcs": [
							[
								-961,
								1277
							]
						],
						"type": "Polygon",
						"id": "79"
					},
					{
						"arcs": [
							[
								-692,
								-927,
								1278,
								1279,
								1280,
								-16
							]
						],
						"type": "Polygon",
						"id": "573"
					},
					{
						"arcs": [
							[
								-183,
								1281,
								-285,
								1282,
								1283,
								-968,
								1284
							]
						],
						"type": "Polygon",
						"id": "82"
					},
					{
						"arcs": [
							[
								-284,
								1285,
								-1228,
								1286,
								1287,
								-1283
							]
						],
						"type": "Polygon",
						"id": "91"
					},
					{
						"arcs": [
							[
								-1288,
								1288,
								-1226,
								-969,
								-1284
							]
						],
						"type": "Polygon",
						"id": "95"
					},
					{
						"arcs": [
							[
								-1227,
								-1289,
								-1287
							]
						],
						"type": "Polygon",
						"id": "101"
					},
					{
						"arcs": [
							[
								-17,
								-1281,
								1289,
								-880,
								-782,
								-1235
							]
						],
						"type": "Polygon",
						"id": "577"
					},
					{
						"arcs": [
							[
								1290,
								-508,
								-1012,
								1291
							]
						],
						"type": "Polygon",
						"id": "462"
					},
					{
						"arcs": [
							[
								-538,
								1292,
								1293,
								1294
							]
						],
						"type": "Polygon",
						"id": "110"
					},
					{
						"arcs": [
							[
								1295,
								-965,
								-620,
								1296,
								-289
							]
						],
						"type": "Polygon",
						"id": "114"
					},
					{
						"arcs": [
							[
								1297,
								1298,
								1299,
								1300,
								1301,
								1302,
								1303,
								1304,
								-331
							]
						],
						"type": "Polygon",
						"id": "119"
					},
					{
						"arcs": [
							[
								1305,
								1306,
								1307
							]
						],
						"type": "Polygon",
						"id": "125"
					},
					{
						"arcs": [
							[
								-1103,
								1308,
								-1306,
								1309,
								-1145
							]
						],
						"type": "Polygon",
						"id": "134"
					},
					{
						"arcs": [
							[
								-552,
								-1100,
								-1142,
								1310,
								-650,
								1311
							]
						],
						"type": "Polygon",
						"id": "140"
					},
					{
						"arcs": [
							[
								1312,
								-1112,
								1313,
								-137,
								1314,
								1315
							]
						],
						"type": "Polygon",
						"id": "146"
					},
					{
						"arcs": [
							[
								1316,
								-543,
								-934,
								-76,
								1317
							]
						],
						"type": "Polygon",
						"id": "150"
					},
					{
						"arcs": [
							[
								1318,
								1319,
								-280,
								-1263,
								1320
							]
						],
						"type": "Polygon",
						"id": "156"
					},
					{
						"arcs": [
							[
								-556,
								1321,
								1322,
								1323,
								1324,
								1325,
								-109,
								-343,
								1326
							]
						],
						"type": "Polygon",
						"id": "168"
					},
					{
						"arcs": [
							[
								1327,
								-232,
								1328,
								-77,
								-729,
								1329,
								1330
							]
						],
						"type": "Polygon",
						"id": "173"
					},
					{
						"arcs": [
							[
								1331,
								-1330,
								-728,
								1332,
								1333
							]
						],
						"type": "Polygon",
						"id": "180"
					},
					{
						"arcs": [
							[
								1334,
								1335,
								-1334,
								1336,
								-549
							]
						],
						"type": "Polygon",
						"id": "188"
					},
					{
						"arcs": [
							[
								1337,
								-67,
								-262,
								-121
							]
						],
						"type": "Polygon",
						"id": "194"
					},
					{
						"arcs": [
							[
								-817,
								1338,
								-830,
								-568,
								-1093,
								1339,
								-931
							]
						],
						"type": "Polygon",
						"id": "206"
					},
					{
						"arcs": [
							[
								-423,
								1340,
								-217,
								-203,
								-197,
								1341,
								1342,
								-668,
								-669,
								-1202,
								1343
							]
						],
						"type": "Polygon",
						"id": "212"
					},
					{
						"arcs": [
							[
								-325,
								-240,
								-1191,
								-468,
								-695
							]
						],
						"type": "Polygon",
						"id": "562"
					},
					{
						"arcs": [
							[
								1344,
								1345,
								1346,
								1347
							]
						],
						"type": "Polygon",
						"id": "253"
					},
					{
						"arcs": [
							[
								1348,
								-1347,
								1349,
								1350,
								1351,
								1352
							]
						],
						"type": "Polygon",
						"id": "260"
					},
					{
						"arcs": [
							[
								-784,
								-879,
								-877,
								-869,
								1353,
								-157
							]
						],
						"type": "Polygon",
						"id": "581"
					},
					{
						"arcs": [
							[
								1354,
								-150,
								1355,
								-1146,
								-1310,
								-1308,
								1356,
								-440,
								1357,
								1358
							]
						],
						"type": "Polygon",
						"id": "219"
					},
					{
						"arcs": [
							[
								-49,
								-913,
								1359,
								-743,
								-740,
								-736
							]
						],
						"type": "Polygon",
						"id": "224"
					},
					{
						"arcs": [
							[
								1360,
								-597,
								-301,
								1361,
								1362
							]
						],
						"type": "Polygon",
						"id": "231"
					},
					{
						"arcs": [
							[
								1363,
								-408,
								1364,
								1365
							]
						],
						"type": "Polygon",
						"id": "234"
					},
					{
						"arcs": [
							[
								-852,
								1366,
								-1266,
								-58,
								-1162
							]
						],
						"type": "Polygon",
						"id": "243"
					},
					{
						"arcs": [
							[
								1367,
								1368,
								1369,
								1370,
								1371,
								1372,
								1373,
								-417,
								1374
							]
						],
						"type": "Polygon",
						"id": "249"
					},
					{
						"arcs": [
							[
								1375,
								1376,
								-1359,
								1377,
								1378
							]
						],
						"type": "Polygon",
						"id": "267"
					},
					{
						"arcs": [
							[
								1379,
								-1378,
								-1358,
								-439
							]
						],
						"type": "Polygon",
						"id": "272"
					},
					{
						"arcs": [
							[
								-513,
								1380,
								1381,
								1382,
								1383,
								-684
							]
						],
						"type": "Polygon",
						"id": "280"
					},
					{
						"arcs": [
							[
								1384,
								1385,
								-922,
								-1218,
								-912,
								1386,
								-846,
								-674,
								-1161,
								-1035
							]
						],
						"type": "Polygon",
						"id": "287"
					},
					{
						"arcs": [
							[
								-1123,
								-949,
								-939,
								1387,
								1388,
								1389,
								1390,
								-242,
								-334
							]
						],
						"type": "Polygon",
						"id": "497"
					},
					{
						"arcs": [
							[
								1391,
								-622,
								1392,
								1393,
								-1298,
								-330,
								1394
							]
						],
						"type": "Polygon",
						"id": "532"
					},
					{
						"arcs": [
							[
								1395,
								1396,
								1397,
								-1239
							]
						],
						"type": "Polygon",
						"id": "294"
					},
					{
						"arcs": [
							[
								-314,
								-1253,
								-1245,
								-894,
								1398,
								1399,
								-128
							]
						],
						"type": "Polygon",
						"id": "299"
					},
					{
						"arcs": [
							[
								-632,
								-19,
								-1234
							]
						],
						"type": "Polygon",
						"id": "589"
					},
					{
						"arcs": [
							[
								-506,
								-327,
								-698,
								-2,
								1400,
								-1013
							]
						],
						"type": "Polygon",
						"id": "555"
					},
					{
						"arcs": [
							[
								-980,
								1401,
								-119,
								-963,
								1402,
								1403,
								1404
							]
						],
						"type": "Polygon",
						"id": "317"
					},
					{
						"arcs": [
							[
								-749,
								1405,
								-1115,
								1406,
								1407,
								1408,
								1409
							]
						],
						"type": "Polygon",
						"id": "21"
					},
					{
						"arcs": [
							[
								-675,
								-646,
								1410,
								1411,
								1412,
								1413
							]
						],
						"type": "Polygon",
						"id": "57"
					},
					{
						"arcs": [
							[
								-247,
								1414,
								1415,
								-976
							]
						],
						"type": "Polygon",
						"id": "33"
					},
					{
						"arcs": [
							[
								1416,
								1417,
								-1194,
								-973,
								-1416
							]
						],
						"type": "Polygon",
						"id": "38"
					},
					{
						"arcs": [
							[
								1418,
								-1417,
								-1415,
								-246,
								-1133
							]
						],
						"type": "Polygon",
						"id": "46"
					},
					{
						"arcs": [
							[
								1419,
								-498,
								-464,
								-1193,
								1420,
								-1390,
								1421,
								1422
							]
						],
						"type": "Polygon",
						"id": "505"
					},
					{
						"arcs": [
							[
								-528,
								1423,
								1424,
								1425
							]
						],
						"type": "Polygon",
						"id": "65"
					},
					{
						"arcs": [
							[
								1426,
								1427,
								1428,
								1429,
								-813,
								1430,
								1431
							]
						],
						"type": "Polygon",
						"id": "305"
					},
					{
						"arcs": [
							[
								1432,
								-595,
								1433,
								1434,
								-1432
							]
						],
						"type": "Polygon",
						"id": "308"
					},
					{
						"arcs": [
							[
								-1108,
								1435,
								-1399,
								-893,
								1436
							]
						],
						"type": "Polygon",
						"id": "74"
					},
					{
						"arcs": [
							[
								1437,
								-719
							]
						],
						"type": "Polygon",
						"id": "349"
					},
					{
						"arcs": [
							[
								-720,
								-1438,
								-718,
								1438
							]
						],
						"type": "Polygon",
						"id": "351"
					},
					{
						"arcs": [
							[
								1439,
								1440,
								-369,
								1441,
								-531
							]
						],
						"type": "Polygon",
						"id": "161"
					},
					{
						"arcs": [
							[
								1442,
								1443,
								1444,
								-1434,
								-594,
								-1361,
								1445,
								1446
							]
						],
						"type": "Polygon",
						"id": "176"
					},
					{
						"arcs": [
							[
								-250,
								1447,
								-1163,
								-608,
								1448
							]
						],
						"type": "Polygon",
						"id": "183"
					},
					{
						"arcs": [
							[
								-149,
								-1355,
								-1377,
								1449,
								-661,
								-1169,
								1450,
								1451,
								-1147,
								-1356
							]
						],
						"type": "Polygon",
						"id": "198"
					},
					{
						"arcs": [
							[
								1452,
								1453,
								1454,
								1455,
								1456,
								1457,
								1458
							]
						],
						"type": "Polygon",
						"id": "205"
					},
					{
						"arcs": [
							[
								1459,
								1460,
								1461,
								1462,
								-260,
								-566,
								-264,
								-735
							]
						],
						"type": "Polygon",
						"id": "214"
					},
					{
						"arcs": [
							[
								1463,
								1464,
								-112,
								1465,
								-1409,
								1466,
								-305,
								-24,
								1467,
								-828
							]
						],
						"type": "Polygon",
						"id": "225"
					},
					{
						"arcs": [
							[
								1468,
								-1126,
								1469,
								1470,
								-1148,
								-1452,
								1471
							]
						],
						"type": "Polygon",
						"id": "232"
					},
					{
						"arcs": [
							[
								[
									-402,
									-388,
									-1225,
									1472,
									1473,
									-581,
									1474,
									1475,
									1476,
									1477
								]
							],
							[
								[
									121
								]
							]
						],
						"type": "MultiPolygon",
						"id": "238"
					},
					{
						"arcs": [
							[
								-1305,
								1478,
								-951,
								-1122,
								-332
							]
						],
						"type": "Polygon",
						"id": "251"
					},
					{
						"arcs": [
							[
								-866,
								-677,
								1479,
								1480,
								1481,
								-1393,
								-627
							]
						],
						"type": "Polygon",
						"id": "270"
					},
					{
						"arcs": [
							[
								1482,
								1483,
								-396,
								-404,
								-403,
								-1478
							]
						],
						"type": "Polygon",
						"id": "276"
					},
					{
						"arcs": [
							[
								1484,
								1485,
								1486,
								1487
							]
						],
						"type": "Polygon",
						"id": "289"
					},
					{
						"arcs": [
							[
								1488,
								-490,
								1489
							]
						],
						"type": "Polygon",
						"id": "298"
					},
					{
						"arcs": [
							[
								1490,
								-1195,
								-1418,
								-1419,
								-1132,
								-256,
								1491
							]
						],
						"type": "Polygon",
						"id": "307"
					},
					{
						"arcs": [
							[
								1492,
								-294,
								1493,
								1494,
								-663,
								-666,
								-1343,
								1495,
								1496
							]
						],
						"type": "Polygon",
						"id": "316"
					},
					{
						"arcs": [
							[
								1497,
								1498,
								-1167,
								-659,
								-1018,
								1499,
								1500,
								-1453
							]
						],
						"type": "Polygon",
						"id": "323"
					},
					{
						"arcs": [
							[
								1501,
								-1134,
								-251,
								-1449,
								-612,
								-223
							]
						],
						"type": "Polygon",
						"id": "328"
					},
					{
						"arcs": [
							[
								1502,
								-750,
								-1410,
								-1466,
								-113,
								-1465,
								1503,
								1504
							]
						],
						"type": "Polygon",
						"id": "333"
					},
					{
						"arcs": [
							[
								-1493,
								1505,
								1506,
								-915,
								1507,
								-1293,
								-537,
								-295
							]
						],
						"type": "Polygon",
						"id": "335"
					},
					{
						"arcs": [
							[
								1508,
								-409,
								-1364,
								1509,
								-1456,
								1510,
								1511
							]
						],
						"type": "Polygon",
						"id": "340"
					},
					{
						"arcs": [
							[
								1512,
								1513,
								-1488,
								1514,
								-746,
								-582,
								-1474
							]
						],
						"type": "Polygon",
						"id": "342"
					},
					{
						"arcs": [
							[
								1515,
								1516,
								1517,
								-405,
								1518
							]
						],
						"type": "Polygon",
						"id": "359"
					},
					{
						"arcs": [
							[
								-977,
								1519,
								1520,
								1521
							]
						],
						"type": "Polygon",
						"id": "362"
					},
					{
						"arcs": [
							[
								-436,
								1522,
								-978,
								-1522,
								1523
							]
						],
						"type": "Polygon",
						"id": "363"
					},
					{
						"arcs": [
							[
								-1521,
								1524,
								-432,
								-1524
							]
						],
						"type": "Polygon",
						"id": "366"
					},
					{
						"arcs": [
							[
								-293,
								1525,
								-1494
							]
						],
						"type": "Polygon",
						"id": "367"
					},
					{
						"arcs": [
							[
								1526,
								1527,
								1528,
								-1005,
								1529,
								-793,
								1530,
								-925,
								1531
							]
						],
						"type": "Polygon",
						"id": "408"
					},
					{
						"arcs": [
							[
								-361,
								-4,
								1532,
								1533,
								1534
							]
						],
						"type": "Polygon",
						"id": "575"
					},
					{
						"arcs": [
							[
								-79,
								1535,
								1536,
								-476,
								-640,
								-1144,
								1537
							]
						],
						"type": "Polygon",
						"id": "371"
					},
					{
						"arcs": [
							[
								-1329,
								-231,
								-1137,
								1538,
								-1536,
								-78
							]
						],
						"type": "Polygon",
						"id": "374"
					},
					{
						"arcs": [
							[
								-415,
								-900,
								-917,
								-178,
								-709,
								1539,
								1540
							]
						],
						"type": "Polygon",
						"id": "370"
					},
					{
						"arcs": [
							[
								-682,
								-147,
								-416,
								-1541,
								1541,
								-848
							]
						],
						"type": "Polygon",
						"id": "375"
					},
					{
						"arcs": [
							[
								1542,
								-1118
							]
						],
						"type": "Polygon",
						"id": "378"
					},
					{
						"arcs": [
							[
								1543,
								1544,
								-1119,
								-1543,
								-1117
							]
						],
						"type": "Polygon",
						"id": "379"
					},
					{
						"arcs": [
							[
								-998,
								-1002,
								1545,
								-1180,
								1546
							]
						],
						"type": "Polygon",
						"id": "417"
					},
					{
						"arcs": [
							[
								-1181,
								-1546,
								-1001,
								-842,
								1547
							]
						],
						"type": "Polygon",
						"id": "421"
					},
					{
						"arcs": [
							[
								1548,
								1549,
								-1199,
								-471,
								-445
							]
						],
						"type": "Polygon",
						"id": "382"
					},
					{
						"arcs": [
							[
								-1139,
								-643,
								-754,
								1550,
								-97,
								-104,
								1551,
								1552,
								1553,
								1554
							]
						],
						"type": "Polygon",
						"id": "383"
					},
					{
						"arcs": [
							[
								-653,
								1555,
								-505,
								1556,
								-785,
								-162,
								-1135,
								-1502,
								-222,
								1557,
								1558
							]
						],
						"type": "Polygon",
						"id": "386"
					},
					{
						"arcs": [
							[
								1559,
								-54,
								-792,
								1560,
								-1527,
								1561,
								1562,
								1563,
								-1186
							]
						],
						"type": "Polygon",
						"id": "425"
					},
					{
						"arcs": [
							[
								-1501,
								1564,
								-1454
							]
						],
						"type": "Polygon",
						"id": "387"
					},
					{
						"arcs": [
							[
								1565,
								1566,
								1567,
								1568
							]
						],
						"type": "Polygon",
						"id": "390"
					},
					{
						"arcs": [
							[
								-1534,
								1569,
								-696,
								-466,
								-497,
								-501,
								1570
							]
						],
						"type": "Polygon",
						"id": "579"
					},
					{
						"arcs": [
							[
								1571,
								-1362,
								-300,
								1572
							]
						],
						"type": "Polygon",
						"id": "175"
					},
					{
						"arcs": [
							[
								-603,
								-165,
								1573,
								-1031,
								-1268,
								-152
							]
						],
						"type": "Polygon",
						"id": "184"
					},
					{
						"arcs": [
							[
								-1092,
								1574,
								-1009,
								-928,
								-1340
							]
						],
						"type": "Polygon",
						"id": "197"
					},
					{
						"arcs": [
							[
								-958,
								1575,
								1576,
								1577
							]
						],
						"type": "Polygon",
						"id": "213"
					},
					{
						"arcs": [
							[
								-308,
								1578,
								-1248,
								-1254,
								-312
							]
						],
						"type": "Polygon",
						"id": "226"
					},
					{
						"arcs": [
							[
								-561,
								-133,
								1579,
								1580,
								1581
							]
						],
						"type": "Polygon",
						"id": "239"
					},
					{
						"arcs": [
							[
								1582,
								-517,
								1583,
								-110,
								-1326,
								1584
							]
						],
						"type": "Polygon",
						"id": "250"
					},
					{
						"arcs": [
							[
								-1113,
								-1313,
								1585,
								1586
							]
						],
						"type": "Polygon",
						"id": "258"
					},
					{
						"arcs": [
							[
								-1407,
								-1114,
								-1587,
								1587
							]
						],
						"type": "Polygon",
						"id": "269"
					},
					{
						"arcs": [
							[
								-1346,
								1588,
								-1083,
								1589,
								-1350
							]
						],
						"type": "Polygon",
						"id": "277"
					},
					{
						"arcs": [
							[
								-425,
								1590,
								-1375
							]
						],
						"type": "Polygon",
						"id": "288"
					},
					{
						"arcs": [
							[
								-911,
								1591,
								-516,
								-690,
								-847,
								-1387
							]
						],
						"type": "Polygon",
						"id": "300"
					},
					{
						"arcs": [
							[
								-1533,
								-3,
								-697,
								-1570
							]
						],
						"type": "Polygon",
						"id": "488"
					},
					{
						"arcs": [
							[
								-1236,
								1592,
								-1549,
								-444,
								-1170,
								-225,
								-592,
								1593,
								-1577,
								1594
							]
						],
						"type": "Polygon",
						"id": "318"
					},
					{
						"arcs": [
							[
								1595,
								-1558,
								-221,
								1596,
								-706,
								1597,
								1598,
								-1353,
								1599,
								1600,
								1601
							]
						],
						"type": "Polygon",
						"id": "322"
					},
					{
						"arcs": [
							[
								-338,
								-1060,
								-557,
								-1582,
								1602,
								-1215,
								1603
							]
						],
						"type": "Polygon",
						"id": "329"
					},
					{
						"arcs": [
							[
								-1537,
								-1539,
								-1136,
								1604,
								-477
							]
						],
						"type": "Polygon",
						"id": "332"
					},
					{
						"arcs": [
							[
								-1023,
								1605,
								-521,
								1606,
								1607,
								-983,
								-546
							]
						],
						"type": "Polygon",
						"id": "336"
					},
					{
						"arcs": [
							[
								-519,
								1608,
								-1585,
								-1325,
								1609
							]
						],
						"type": "Polygon",
						"id": "339"
					},
					{
						"arcs": [
							[
								-702,
								-1173,
								-346,
								-1156
							]
						],
						"type": "Polygon",
						"id": "343"
					},
					{
						"arcs": [
							[
								1610,
								-815,
								1611,
								1612,
								-1428,
								1613,
								-1505
							]
						],
						"type": "Polygon",
						"id": "348"
					},
					{
						"arcs": [
							[
								-268,
								-277,
								-593,
								-227,
								-1171,
								-447,
								-470,
								-1605,
								-1138,
								-456
							]
						],
						"type": "Polygon",
						"id": "352"
					},
					{
						"arcs": [
							[
								1614,
								-1553,
								1615,
								1616,
								1617
							]
						],
						"type": "Polygon",
						"id": "360"
					},
					{
						"arcs": [
							[
								-1463,
								1618,
								-1617,
								1619,
								-762,
								-115,
								-261
							]
						],
						"type": "Polygon",
						"id": "355"
					},
					{
						"arcs": [
							[
								-670,
								-664,
								-1495,
								-1526,
								-292,
								1620,
								-712,
								-1203
							]
						],
						"type": "Polygon",
						"id": "361"
					},
					{
						"arcs": [
							[
								-141,
								1621,
								1622,
								-1075,
								-1080,
								1623
							]
						],
						"type": "Polygon",
						"id": "364"
					},
					{
						"arcs": [
							[
								1624,
								1625,
								-923,
								-1386,
								1626,
								1627
							]
						],
						"type": "Polygon",
						"id": "365"
					},
					{
						"arcs": [
							[
								-1294,
								-1508,
								-914,
								-433,
								-1525,
								-1520,
								-981,
								-1405,
								1628
							]
						],
						"type": "Polygon",
						"id": "368"
					},
					{
						"arcs": [
							[
								-839,
								-1000,
								-986,
								-992,
								-1233
							]
						],
						"type": "Polygon",
						"id": "432"
					},
					{
						"arcs": [
							[
								-1295,
								-1629,
								-1404,
								1629,
								-1019,
								-658,
								-1209,
								-1067,
								-1257,
								-539
							]
						],
						"type": "Polygon",
						"id": "369"
					},
					{
						"arcs": [
							[
								-1070,
								-1124,
								-1469,
								1630,
								1631,
								-324,
								1632,
								-1322,
								-555,
								-1327,
								-342
							]
						],
						"type": "Polygon",
						"id": "372"
					},
					{
						"arcs": [
							[
								1633,
								-273,
								-458,
								-228,
								-1328,
								1634
							]
						],
						"type": "Polygon",
						"id": "373"
					},
					{
						"arcs": [
							[
								-1427,
								-1435,
								-1445,
								1635,
								-751,
								-1503,
								-1614
							]
						],
						"type": "Polygon",
						"id": "376"
					},
					{
						"arcs": [
							[
								-1600,
								-1352,
								1636,
								1637
							]
						],
						"type": "Polygon",
						"id": "377"
					},
					{
						"arcs": [
							[
								-376,
								-964
							]
						],
						"type": "Polygon",
						"id": "380"
					},
					{
						"arcs": [
							[
								-611,
								-805,
								-1081,
								1638,
								1639,
								-1598,
								-705,
								-1597,
								-220
							]
						],
						"type": "Polygon",
						"id": "381"
					},
					{
						"arcs": [
							[
								1640,
								1641,
								-1229,
								-1286,
								-283,
								1642
							]
						],
						"type": "Polygon",
						"id": "384"
					},
					{
						"arcs": [
							[
								-1109,
								-1437,
								-892,
								-1251,
								1643,
								-1072,
								1644,
								1645,
								-858,
								-1055,
								-372,
								-760
							]
						],
						"type": "Polygon",
						"id": "385"
					},
					{
						"arcs": [
							[
								-849,
								-1542,
								-1540,
								-708,
								1646
							]
						],
						"type": "Polygon",
						"id": "388"
					},
					{
						"arcs": [
							[
								1647,
								-1554,
								-1615,
								1648,
								1649
							]
						],
						"type": "Polygon",
						"id": "392"
					},
					{
						"arcs": [
							[
								1650,
								1651,
								1652,
								-1650
							]
						],
						"type": "Polygon",
						"id": "389"
					},
					{
						"arcs": [
							[
								-1555,
								-1648,
								-1653,
								1653,
								-1460,
								-734,
								-1140
							]
						],
						"type": "Polygon",
						"id": "393"
					},
					{
						"arcs": [
							[
								-1652,
								1654,
								-1461,
								-1654
							]
						],
						"type": "Polygon",
						"id": "394"
					},
					{
						"arcs": [
							[
								-1655,
								-1651,
								-1649,
								-1618,
								-1619,
								-1462
							]
						],
						"type": "Polygon",
						"id": "391"
					},
					{
						"arcs": [
							[
								-979,
								-1523,
								-435,
								-68,
								-1338,
								-120,
								-1402
							]
						],
						"type": "Polygon",
						"id": "395"
					},
					{
						"arcs": [
							[
								-1052,
								-1201,
								1655,
								-1249,
								-1579,
								-307,
								-318
							]
						],
						"type": "Polygon",
						"id": "396"
					},
					{
						"arcs": [
							[
								-1394,
								-1482,
								1656,
								1657,
								-1299
							]
						],
						"type": "Polygon",
						"id": "397"
					},
					{
						"arcs": [
							[
								-1608,
								1658,
								-488,
								-933,
								-982
							]
						],
						"type": "Polygon",
						"id": "398"
					},
					{
						"arcs": [
							[
								-1398,
								1659,
								-1602,
								1660,
								-1073,
								-1644,
								-1250,
								-1656,
								-1200,
								-1550,
								-1593,
								-1240
							]
						],
						"type": "Polygon",
						"id": "399"
					},
					{
						"arcs": [
							[
								-1630,
								-1403,
								-962,
								-1278,
								-966,
								-1296,
								-288,
								1661,
								-1020
							]
						],
						"type": "Polygon",
						"id": "400"
					},
					{
						"arcs": [
							[
								-135,
								1662
							]
						],
						"type": "Polygon",
						"id": "401"
					},
					{
						"arcs": [
							[
								-215,
								-201,
								-218,
								-1341,
								-422
							]
						],
						"type": "Polygon",
						"id": "402"
					},
					{
						"arcs": [
							[
								1663,
								-366,
								1664,
								-1475,
								-580,
								1665,
								-1443,
								1666,
								1667
							]
						],
						"type": "Polygon",
						"id": "403"
					},
					{
						"arcs": [
							[
								1668,
								-1612,
								-814,
								-1430
							]
						],
						"type": "Polygon",
						"id": "626"
					},
					{
						"arcs": [
							[
								-1669,
								-1429,
								-1613
							]
						],
						"type": "Polygon",
						"id": "627"
					},
					{
						"arcs": [
							[
								-1583,
								-1609,
								-518
							]
						],
						"type": "Polygon",
						"id": "628"
					},
					{
						"arcs": [
							[
								1669,
								1670,
								-1641,
								1671
							]
						],
						"type": "Polygon",
						"id": "629"
					},
					{
						"arcs": [
							[
								-1022,
								1672,
								-1157,
								-344,
								-111,
								-1584,
								-522,
								-1606
							]
						],
						"type": "Polygon",
						"id": "404"
					},
					{
						"arcs": [
							[
								-1451,
								-1168,
								-1499,
								1673,
								-483,
								1674,
								-1631,
								-1472
							]
						],
						"type": "Polygon",
						"id": "406"
					},
					{
						"arcs": [
							[
								-1275,
								-451,
								-738,
								-742,
								-744,
								-1360,
								-916,
								-1507,
								1675
							]
						],
						"type": "Polygon",
						"id": "413"
					},
					{
						"arcs": [
							[
								1676,
								-1446,
								-1363,
								-1572,
								1677
							]
						],
						"type": "Polygon",
						"id": "607"
					},
					{
						"arcs": [
							[
								1678,
								-319,
								-1632,
								-1675,
								-482,
								-1674,
								-1498,
								-1459
							]
						],
						"type": "Polygon",
						"id": "608"
					},
					{
						"arcs": [
							[
								-1511,
								-1455,
								-1565,
								-1500,
								-1017,
								-1662,
								-287,
								1679
							]
						],
						"type": "Polygon",
						"id": "610"
					},
					{
						"arcs": [
							[
								-1621,
								-291,
								-542,
								-1260,
								-1259,
								-1064,
								-713
							]
						],
						"type": "Polygon",
						"id": "611"
					},
					{
						"arcs": [
							[
								-1365,
								-407,
								1680,
								-1517,
								1681,
								-1519,
								-412,
								-1026,
								1682,
								-532,
								-461,
								1683
							]
						],
						"type": "Polygon",
						"id": "612"
					},
					{
						"arcs": [
							[
								-1204,
								-721,
								-1439,
								-717,
								1684,
								-1379,
								-1380,
								-438,
								-90
							]
						],
						"type": "Polygon",
						"id": "613"
					},
					{
						"arcs": [
							[
								-959,
								-1578,
								-1594,
								-591,
								1685,
								-1670,
								1686
							]
						],
						"type": "Polygon",
						"id": "614"
					},
					{
						"arcs": [
							[
								1687,
								-1196,
								-1491,
								1688,
								1689
							]
						],
						"type": "Polygon",
						"id": "615"
					},
					{
						"arcs": [
							[
								-1302,
								1690,
								1691,
								-485,
								-26,
								1692,
								1693,
								1694,
								1695,
								-767,
								-772,
								1696,
								-419,
								1697
							]
						],
						"type": "Polygon",
						"id": "616"
					},
					{
						"arcs": [
							[
								-463,
								-536,
								-1188,
								1698,
								1699,
								-1087,
								-321,
								1700
							]
						],
						"type": "Polygon",
						"id": "617"
					},
					{
						"arcs": [
							[
								-1515,
								-1487,
								1701,
								-747
							]
						],
						"type": "Polygon",
						"id": "618"
					},
					{
						"arcs": [
							[
								-765,
								-491,
								-1489,
								1702
							]
						],
						"type": "Polygon",
						"id": "619"
					},
					{
						"arcs": [
							[
								-1357,
								-1307,
								-1309,
								-1102,
								-441
							]
						],
						"type": "Polygon",
						"id": "620"
					},
					{
						"arcs": [
							[
								-1107,
								1703,
								-1622,
								-140,
								-564,
								-83,
								-443
							]
						],
						"type": "Polygon",
						"id": "622"
					},
					{
						"arcs": [
							[
								-1510,
								-1366,
								-1684,
								-460,
								1704,
								-1457
							]
						],
						"type": "Polygon",
						"id": "623"
					},
					{
						"arcs": [
							[
								-570,
								-829,
								-1468,
								-23,
								1705,
								-1037
							]
						],
						"type": "Polygon",
						"id": "624"
					},
					{
						"arcs": [
							[
								-1666,
								-579,
								-745,
								-1636,
								-1444
							]
						],
						"type": "Polygon",
						"id": "625"
					},
					{
						"arcs": [
							[
								-936,
								1706,
								-919,
								-1626,
								1707,
								-1097
							]
						],
						"type": "Polygon",
						"id": "630"
					},
					{
						"arcs": [
							[
								1708,
								1709,
								1710,
								-651,
								-1311,
								-1141,
								-739,
								-449,
								1711
							]
						],
						"type": "Polygon",
						"id": "637"
					},
					{
						"arcs": [
							[
								1712,
								-1277,
								-486,
								-1692,
								1713
							]
						],
						"type": "Polygon",
						"id": "636"
					},
					{
						"arcs": [
							[
								-1098,
								-730,
								-80,
								-1538,
								-1143
							]
						],
						"type": "Polygon",
						"id": "638"
					},
					{
						"arcs": [
							[
								-1471,
								1714,
								-1149
							]
						],
						"type": "Polygon",
						"id": "639"
					},
					{
						"arcs": [
							[
								-1562,
								-1532,
								-924,
								-694,
								-822,
								1715,
								1716
							]
						],
						"type": "Polygon",
						"id": "436"
					},
					{
						"arcs": [
							[
								-550,
								-1337,
								-1333,
								-732,
								-1101
							]
						],
						"type": "Polygon",
						"id": "640"
					},
					{
						"arcs": [
							[
								-1589,
								-1345,
								1717,
								-1639,
								-1084
							]
						],
						"type": "Polygon",
						"id": "641"
					},
					{
						"arcs": [
							[
								-1640,
								-1718,
								-1348,
								-1349,
								-1599
							]
						],
						"type": "Polygon",
						"id": "642"
					},
					{
						"arcs": [
							[
								1718,
								-1710,
								1719,
								-1412
							]
						],
						"type": "Polygon",
						"id": "643"
					},
					{
						"arcs": [
							[
								-645,
								-1711,
								-1719,
								-1411
							]
						],
						"type": "Polygon",
						"id": "644"
					},
					{
						"arcs": [
							[
								-1413,
								-1720,
								-1709,
								1720
							]
						],
						"type": "Polygon",
						"id": "645"
					},
					{
						"arcs": [
							[
								1721,
								-1480,
								-676,
								-1414,
								-1721,
								-1712,
								-453,
								-1274,
								-1713
							]
						],
						"type": "Polygon",
						"id": "646"
					},
					{
						"arcs": [
							[
								-774,
								-1048,
								-420,
								-1697
							]
						],
						"type": "Polygon",
						"id": "647"
					},
					{
						"arcs": [
							[
								-1368,
								-1591,
								-424,
								-1344,
								-1207,
								1722,
								-1205,
								-88,
								1723,
								1724
							]
						],
						"type": "Polygon",
						"id": "648"
					},
					{
						"arcs": [
							[
								-685,
								-1384,
								1725,
								-131,
								1726,
								-775
							]
						],
						"type": "Polygon",
						"id": "649"
					},
					{
						"arcs": [
							[
								1727,
								1728,
								-1635,
								-1331,
								-1332,
								-1336,
								1729,
								-34
							]
						],
						"type": "Polygon",
						"id": "650"
					},
					{
						"arcs": [
							[
								-955,
								-1008,
								1730,
								1731,
								1732
							]
						],
						"type": "Polygon",
						"id": "409"
					},
					{
						"arcs": [
							[
								1733,
								-1128,
								1734,
								-1105,
								-1151
							]
						],
						"type": "Polygon",
						"id": "631"
					},
					{
						"arcs": [
							[
								1735,
								1736,
								1737,
								1738,
								1739
							]
						],
						"type": "Polygon",
						"id": "632"
					},
					{
						"arcs": [
							[
								-1262,
								1740,
								1741,
								-1231,
								1742,
								-1321
							]
						],
						"type": "Polygon",
						"id": "633"
					},
					{
						"arcs": [
							[
								-1742,
								1743,
								1744,
								-1056,
								-971,
								-1232
							]
						],
						"type": "Polygon",
						"id": "634"
					},
					{
						"arcs": [
							[
								-1699,
								-1187,
								-534,
								1745,
								1746
							]
						],
						"type": "Polygon",
						"id": "414"
					},
					{
						"arcs": [
							[
								-807,
								-1165,
								1747,
								-1197,
								-1688,
								1748
							]
						],
						"type": "Polygon",
						"id": "418"
					},
					{
						"arcs": [
							[
								-1706,
								-22,
								-304,
								1749,
								-1628,
								1750,
								-1038
							]
						],
						"type": "Polygon",
						"id": "422"
					},
					{
						"arcs": [
							[
								-1217,
								1751,
								-1381,
								-512,
								-1592,
								-910
							]
						],
						"type": "Polygon",
						"id": "426"
					},
					{
						"arcs": [
							[
								-214,
								-30,
								1752,
								-1496,
								-1342,
								-196
							]
						],
						"type": "Polygon",
						"id": "430"
					},
					{
						"arcs": [
							[
								-1401,
								-1,
								1753,
								1754,
								-1014
							]
						],
						"type": "Polygon",
						"id": "474"
					},
					{
						"arcs": [
							[
								-1755,
								1755,
								-1015
							]
						],
						"type": "Polygon",
						"id": "470"
					},
					{
						"arcs": [
							[
								-1753,
								-29,
								-1276,
								-1676,
								-1506,
								-1497
							]
						],
						"type": "Polygon",
						"id": "433"
					},
					{
						"arcs": [
							[
								1756,
								1757,
								-36,
								1758,
								-553,
								-1312,
								-649,
								-865
							]
						],
						"type": "Polygon",
						"id": "437"
					},
					{
						"arcs": [
							[
								-367,
								-1664,
								1759,
								1760
							]
						],
						"type": "Polygon",
						"id": "441"
					},
					{
						"arcs": [
							[
								-1658,
								1761,
								-1300
							]
						],
						"type": "Polygon",
						"id": "445"
					},
					{
						"arcs": [
							[
								-563,
								1762,
								-1731,
								-1007,
								-953,
								1763,
								-1370,
								1764
							]
						],
						"type": "Polygon",
						"id": "449"
					},
					{
						"arcs": [
							[
								-1732,
								-1763,
								-562,
								-1765,
								-1369,
								-1725,
								1765,
								1766,
								-1485,
								-1514,
								1767
							]
						],
						"type": "Polygon",
						"id": "454"
					},
					{
						"arcs": [
							[
								-1301,
								-1762,
								-1657,
								-1481,
								-1722,
								-1714,
								-1691
							]
						],
						"type": "Polygon",
						"id": "458"
					},
					{
						"arcs": [
							[
								1768,
								-860,
								1769,
								-1645,
								-1071,
								-1661,
								-1601,
								-1638
							]
						],
						"type": "Polygon",
						"id": "464"
					},
					{
						"arcs": [
							[
								-1733,
								-1768,
								-1513,
								-1473,
								-1224,
								-941,
								-956
							]
						],
						"type": "Polygon",
						"id": "469"
					},
					{
						"arcs": [
							[
								-1158,
								-1673,
								-1021,
								-710,
								-181,
								-704
							]
						],
						"type": "Polygon",
						"id": "473"
					},
					{
						"arcs": [
							[
								-820,
								-523,
								-1442,
								-368,
								-1761,
								1770,
								1771,
								1772
							]
						],
						"type": "Polygon",
						"id": "477"
					},
					{
						"arcs": [
							[
								-850,
								-1647,
								-707,
								-1024,
								-544,
								-1317,
								1773,
								1774
							]
						],
						"type": "Polygon",
						"id": "480"
					},
					{
						"arcs": [
							[
								1775,
								-1580,
								-132,
								-1726,
								-1383
							]
						],
						"type": "Polygon",
						"id": "485"
					},
					{
						"arcs": [
							[
								1776,
								-1425,
								1777
							]
						],
						"type": "Polygon",
						"id": "490"
					},
					{
						"arcs": [
							[
								-243,
								-1391,
								-1421,
								-1192
							]
						],
						"type": "Polygon",
						"id": "493"
					},
					{
						"arcs": [
							[
								1778,
								1779,
								-529,
								-1426,
								-1777,
								1780
							]
						],
						"type": "Polygon",
						"id": "498"
					},
					{
						"arcs": [
							[
								-905,
								-885,
								1781,
								-1042,
								-1189,
								-1159
							]
						],
						"type": "Polygon",
						"id": "502"
					},
					{
						"arcs": [
							[
								-1318,
								-75,
								-172,
								1782,
								-1774
							]
						],
						"type": "Polygon",
						"id": "510"
					},
					{
						"arcs": [
							[
								-1214,
								-920,
								-1707,
								-935,
								-339,
								-1604
							]
						],
						"type": "Polygon",
						"id": "515"
					},
					{
						"arcs": [
							[
								-255,
								1783,
								-1689,
								-1492
							]
						],
						"type": "Polygon",
						"id": "519"
					},
					{
						"arcs": [
							[
								-142,
								-1624,
								-1079,
								-800,
								-1096
							]
						],
						"type": "Polygon",
						"id": "522"
					},
					{
						"arcs": [
							[
								1784,
								-723,
								-629
							]
						],
						"type": "Polygon",
						"id": "520"
					},
					{
						"arcs": [
							[
								-362,
								-1535,
								-1571,
								-503,
								1785,
								1786
							]
						],
						"type": "Polygon",
						"id": "590"
					},
					{
						"arcs": [
							[
								-155,
								-480,
								-776,
								-1727,
								-130,
								-604
							]
						],
						"type": "Polygon",
						"id": "527"
					},
					{
						"arcs": [
							[
								-123,
								-1400,
								-1436,
								-1110,
								-98,
								-1551,
								-753
							]
						],
						"type": "Polygon",
						"id": "530"
					},
					{
						"arcs": [
							[
								1787,
								-281,
								-1282,
								-186,
								1788
							]
						],
						"type": "Polygon",
						"id": "535"
					},
					{
						"arcs": [
							[
								1789,
								1790,
								1791,
								-1693,
								-25
							]
						],
						"type": "Polygon",
						"id": "539"
					},
					{
						"arcs": [
							[
								-1790,
								-32,
								-213,
								1792,
								1793,
								1794
							]
						],
						"type": "Polygon",
						"id": "542"
					},
					{
						"arcs": [
							[
								-884,
								-576,
								-1272,
								-1044,
								-1039,
								-1782
							]
						],
						"type": "Polygon",
						"id": "546"
					},
					{
						"arcs": [
							[
								-253,
								-1131,
								1795,
								1796
							]
						],
						"type": "Polygon",
						"id": "550"
					},
					{
						"arcs": [
							[
								-1486,
								-1767,
								1797,
								-1544,
								-1116,
								-1406,
								-748,
								-1702
							]
						],
						"type": "Polygon",
						"id": "553"
					},
					{
						"arcs": [
							[
								-1050,
								1798,
								1799,
								-206,
								-188
							]
						],
						"type": "Polygon",
						"id": "557"
					},
					{
						"arcs": [
							[
								-1741,
								-1261,
								1800,
								-1728,
								-33,
								1801,
								-1744
							]
						],
						"type": "Polygon",
						"id": "561"
					},
					{
						"arcs": [
							[
								1802,
								-1057,
								-1745,
								-1802,
								-37,
								-1758
							]
						],
						"type": "Polygon",
						"id": "567"
					},
					{
						"arcs": [
							[
								-1206,
								-1723
							]
						],
						"type": "Polygon",
						"id": "572"
					},
					{
						"arcs": [
							[
								-975,
								-1198,
								-1748,
								-1164,
								-1448,
								-249
							]
						],
						"type": "Polygon",
						"id": "576"
					},
					{
						"arcs": [
							[
								-1106,
								-1735,
								-1127,
								-1076,
								-1623,
								-1704
							]
						],
						"type": "Polygon",
						"id": "580"
					},
					{
						"arcs": [
							[
								-533,
								-1683,
								-1029,
								1803,
								-1746
							]
						],
						"type": "Polygon",
						"id": "584"
					},
					{
						"arcs": [
							[
								-1267,
								-1367,
								-851,
								-1775,
								-1783,
								-177
							]
						],
						"type": "Polygon",
						"id": "588"
					},
					{
						"arcs": [
							[
								-888,
								-1058,
								-1803,
								-1757,
								-864
							]
						],
						"type": "Polygon",
						"id": "591"
					},
					{
						"arcs": [
							[
								-1210,
								-656,
								-1450,
								-1376,
								-1685,
								-716
							]
						],
						"type": "Polygon",
						"id": "598"
					},
					{
						"arcs": [
							[
								1804,
								-1476,
								-1665,
								-365,
								1805
							]
						],
						"type": "Polygon",
						"id": "600"
					},
					{
						"arcs": [
							[
								-1715,
								-1470,
								-1125,
								-427,
								-1129,
								-1734,
								-1150
							]
						],
						"type": "Polygon",
						"id": "601"
					},
					{
						"arcs": [
							[
								-1552,
								-103,
								-758,
								-763,
								-1620,
								-1616
							]
						],
						"type": "Polygon",
						"id": "603"
					},
					{
						"arcs": [
							[
								-1208,
								-1062,
								-1154,
								-599
							]
						],
						"type": "Polygon",
						"id": "434"
					},
					{
						"arcs": [
							[
								-654,
								-1559,
								-1596,
								-1660,
								-1397,
								1806,
								-107
							]
						],
						"type": "Polygon",
						"id": "438"
					},
					{
						"arcs": [
							[
								-1793,
								-212,
								-207,
								-1800,
								1807
							]
						],
						"type": "Polygon",
						"id": "605"
					},
					{
						"arcs": [
							[
								1808,
								-1794,
								-1808,
								-1799,
								-1049,
								-769
							]
						],
						"type": "Polygon",
						"id": "405"
					},
					{
						"arcs": [
							[
								-1772,
								1809,
								-1667,
								-1447,
								-1677,
								1810
							]
						],
						"type": "Polygon",
						"id": "410"
					},
					{
						"arcs": [
							[
								-1179,
								1811,
								-1716,
								-826,
								-996,
								-1547
							]
						],
						"type": "Polygon",
						"id": "444"
					},
					{
						"arcs": [
							[
								-1032,
								-1574,
								-164,
								-1046,
								-1273,
								-831
							]
						],
						"type": "Polygon",
						"id": "415"
					},
					{
						"arcs": [
							[
								-1642,
								-1671,
								-1686,
								-590,
								1812,
								-1319,
								-1743,
								-1230
							]
						],
						"type": "Polygon",
						"id": "419"
					},
					{
						"arcs": [
							[
								-320,
								-1679,
								-1458,
								-1705,
								-459,
								-1701
							]
						],
						"type": "Polygon",
						"id": "423"
					},
					{
						"arcs": [
							[
								-1304,
								1813,
								-1373,
								1814,
								-1371,
								-1764,
								-952,
								-1479
							]
						],
						"type": "Polygon",
						"id": "427"
					},
					{
						"arcs": [
							[
								-1813,
								-589,
								-275,
								-1320
							]
						],
						"type": "Polygon",
						"id": "446"
					},
					{
						"arcs": [
							[
								-1752,
								-1216,
								-1603,
								-1581,
								-1776,
								-1382
							]
						],
						"type": "Polygon",
						"id": "450"
					},
					{
						"arcs": [
							[
								-816,
								-1611,
								-1504,
								-1464,
								-827,
								-1339
							]
						],
						"type": "Polygon",
						"id": "452"
					},
					{
						"arcs": [
							[
								-136,
								-1663,
								-144,
								-1095,
								-1708,
								-1625,
								-1750,
								-303,
								1815,
								-1315
							]
						],
						"type": "Polygon",
						"id": "457"
					},
					{
						"arcs": [
							[
								-184,
								-1285,
								-967,
								-889,
								-726,
								1816
							]
						],
						"type": "Polygon",
						"id": "461"
					},
					{
						"arcs": [
							[
								-1789,
								-185,
								-1817,
								-725,
								1817
							]
						],
						"type": "Polygon",
						"id": "465"
					},
					{
						"arcs": [
							[
								-1633,
								-323,
								-1086,
								-639,
								-1085,
								1818,
								-1323
							]
						],
						"type": "Polygon",
						"id": "468"
					},
					{
						"arcs": [
							[
								-1724,
								-87,
								-1120,
								-1545,
								-1798,
								-1766
							]
						],
						"type": "Polygon",
						"id": "472"
					},
					{
						"arcs": [
							[
								-1408,
								-1588,
								-1586,
								-1316,
								-1816,
								-306,
								-1467
							]
						],
						"type": "Polygon",
						"id": "481"
					},
					{
						"arcs": [
							[
								-1627,
								-1385,
								-1034,
								-1751
							]
						],
						"type": "Polygon",
						"id": "476"
					},
					{
						"arcs": [
							[
								-1694,
								-1792,
								1819,
								1820
							]
						],
						"type": "Polygon",
						"id": "484"
					},
					{
						"arcs": [
							[
								-1809,
								-768,
								-1696,
								1821,
								-1820,
								-1791,
								-1795
							]
						],
						"type": "Polygon",
						"id": "491"
					},
					{
						"arcs": [
							[
								-1821,
								-1822,
								-1695
							]
						],
						"type": "Polygon",
						"id": "495"
					},
					{
						"arcs": [
							[
								-1372,
								-1815
							]
						],
						"type": "Polygon",
						"id": "499"
					},
					{
						"arcs": [
							[
								-1557,
								-504,
								-1556,
								-652,
								1822,
								-786
							]
						],
						"type": "Polygon",
						"id": "503"
					},
					{
						"arcs": [
							[
								-1264,
								-278,
								-274,
								-1634,
								-1729,
								-1801
							]
						],
						"type": "Polygon",
						"id": "506"
					},
					{
						"arcs": [
							[
								-854,
								1823,
								-257,
								-63
							]
						],
						"type": "Polygon",
						"id": "511"
					},
					{
						"arcs": [
							[
								-862,
								-625,
								-41,
								-607
							]
						],
						"type": "Polygon",
						"id": "460"
					},
					{
						"arcs": [
							[
								-85,
								-565,
								-138,
								-1314,
								-1121
							]
						],
						"type": "Polygon",
						"id": "514"
					},
					{
						"arcs": [
							[
								-1595,
								-1576,
								-957,
								-234,
								-1237
							]
						],
						"type": "Polygon",
						"id": "518"
					},
					{
						"arcs": [
							[
								-1303,
								-1698,
								-418,
								-1374,
								-1814
							]
						],
						"type": "Polygon",
						"id": "523"
					},
					{
						"arcs": [
							[
								-1730,
								-1335,
								-554,
								-1759,
								-35
							]
						],
						"type": "Polygon",
						"id": "526"
					},
					{
						"arcs": [
							[
								-1760,
								-1668,
								-1810,
								-1771
							]
						],
						"type": "Polygon",
						"id": "531"
					},
					{
						"arcs": [
							[
								1824
							]
						],
						"type": "Polygon",
						"id": "534"
					},
					{
						"arcs": [
							[
								[
									-1770,
									-859,
									-1646
								]
							],
							[
								[
									1824
								]
							]
						],
						"type": "MultiPolygon",
						"id": "538"
					},
					{
						"arcs": [
							[
								-623,
								-1392,
								1825,
								1826,
								-56,
								-10,
								-631
							]
						],
						"type": "Polygon",
						"id": "524"
					},
					{
						"arcs": [
							[
								1827,
								1828,
								-1826,
								-1395,
								-329,
								-511
							]
						],
						"type": "Polygon",
						"id": "536"
					},
					{
						"arcs": [
							[
								1829
							]
						],
						"type": "Polygon",
						"id": "448"
					},
					{
						"arcs": [
							[
								-1422,
								-1389,
								1830,
								-392,
								1831,
								-390,
								1832
							]
						],
						"type": "Polygon",
						"id": "501"
					},
					{
						"arcs": [
							[
								-1786,
								-502,
								-495,
								-499,
								-1420,
								1833
							]
						],
						"type": "Polygon",
						"id": "596"
					},
					{
						"arcs": [
							[
								1835,
								-1483,
								-1477,
								-1805
							]
						],
						"type": "Polygon",
						"id": "442"
					},
					{
						"arcs": [
							[
								1836,
								-1440,
								-530,
								-1780,
								1837,
								1838,
								1839
							]
						],
						"type": "Polygon",
						"id": "494"
					},
					{
						"arcs": [
							[
								1840,
								-1737,
								1841,
								-1840
							]
						],
						"type": "Polygon",
						"id": "149"
					},
					{
						"arcs": [
							[
								-1091,
								1842,
								-1010,
								-1575
							]
						],
						"type": "Polygon",
						"id": "207"
					},
					{
						"arcs": [
							[
								1843
							]
						],
						"type": "Polygon",
						"id": "100"
					},
					{
						"arcs": [
							[
								-1509,
								1844,
								-1027,
								-410
							]
						],
						"type": "Polygon",
						"id": "257"
					},
					{
						"arcs": [
							[
								1845,
								-1796,
								-1130,
								-160
							]
						],
						"type": "Polygon",
						"id": "153"
					},
					{
						"arcs": [
							[
								-1841,
								-1839,
								-1568,
								1846,
								-1738
							]
						],
						"type": "Polygon",
						"id": "609"
					},
					{
						"arcs": [
							[
								-1779,
								1847,
								1848,
								-1569,
								-1838
							]
						],
						"type": "Polygon",
						"id": "621"
					},
					{
						"arcs": [
							[
								1849,
								-1566,
								-1849
							]
						],
						"type": "Polygon",
						"id": "162"
					},
					{
						"arcs": [
							[
								-1518,
								-1681,
								-406
							]
						],
						"type": "Polygon",
						"id": "356"
					},
					{
						"arcs": [
							[
								1850,
								1851
							]
						],
						"type": "Polygon",
						"id": "635"
					},
					{
						"arcs": [
							[
								1852,
								1853,
								1854,
								-1851
							]
						],
						"type": "Polygon",
						"id": "331"
					},
					{
						"arcs": [
							[
								1855,
								1856
							]
						],
						"type": "Polygon",
						"id": "443"
					},
					{
						"arcs": [
							[
								[
									1857,
									1858,
									1859,
									-1856,
									1860,
									-1182,
									-1564,
									1861
								]
							],
							[
								[
									1862
								]
							],
							[
								[
									1863
								]
							],
							[
								[
									1864
								]
							],
							[
								[
									1865
								]
							]
						],
						"type": "MultiPolygon",
						"id": "429"
					},
					{
						"arcs": [
							[
								1866,
								1867,
								1868,
								1869,
								-1184
							]
						],
						"type": "Polygon",
						"id": "585"
					},
					{
						"arcs": [
							[
								[
									1870
								]
							],
							[
								[
									1871
								]
							],
							[
								[
									1872
								]
							],
							[
								[
									1873
								]
							],
							[
								[
									1874
								]
							],
							[
								[
									1875
								]
							],
							[
								[
									1876
								]
							],
							[
								[
									1877
								]
							],
							[
								[
									1878
								]
							],
							[
								[
									1879
								]
							],
							[
								[
									1880
								]
							]
						],
						"type": "MultiPolygon",
						"id": "412"
					},
					{
						"arcs": [
							[
								[
									1881
								]
							],
							[
								[
									1882
								]
							],
							[
								[
									1883
								]
							],
							[
								[
									1884
								]
							],
							[
								[
									1885
								]
							]
						],
						"type": "MultiPolygon",
						"id": "513"
					},
					{
						"arcs": [
							[
								[
									-1563,
									-1717,
									-1812,
									-1178,
									1886,
									-1862
								]
							],
							[
								[
									1887
								]
							],
							[
								[
									1888
								]
							],
							[
								[
									1889
								]
							],
							[
								[
									-1859,
									1890
								]
							],
							[
								[
									1891
								]
							],
							[
								[
									1892
								]
							],
							[
								[
									1893
								]
							],
							[
								[
									1894
								]
							]
						],
						"type": "MultiPolygon",
						"id": "428"
					},
					{
						"arcs": [
							[
								1895,
								-11,
								1896,
								1897,
								-50,
								-1560,
								-1185,
								-1870
							]
						],
						"type": "Polygon",
						"id": "440"
					},
					{
						"arcs": [
							[
								1898,
								-1868,
								1899
							]
						],
						"type": "Polygon",
						"id": "435"
					},
					{
						"arcs": [
							[
								-1006,
								-1529,
								1900
							]
						],
						"type": "Polygon",
						"id": "595"
					},
					{
						"arcs": [
							[
								-1869,
								-1899,
								1901,
								-12,
								-1896
							]
						],
						"type": "Polygon",
						"id": "552"
					},
					{
						"arcs": [
							[
								-794,
								-1530,
								-1004,
								1902
							]
						],
						"type": "Polygon",
						"id": "565"
					},
					{
						"arcs": [
							[
								-14,
								1903,
								-1897
							]
						],
						"type": "Polygon",
						"id": "416"
					},
					{
						"arcs": [
							[
								-1280,
								1904,
								-874,
								-878,
								-1290
							]
						],
						"type": "Polygon",
						"id": "509"
					},
					{
						"arcs": [
							[
								-158,
								-1354,
								-868,
								1905
							]
						],
						"type": "Polygon",
						"id": "486"
					},
					{
						"arcs": [
							[
								[
									1906
								]
							],
							[
								[
									-1176,
									-1548,
									-841,
									-1213,
									1907,
									1908
								]
							]
						],
						"type": "MultiPolygon",
						"id": "593"
					},
					{
						"arcs": [
							[
								1909,
								-788,
								1910
							]
						],
						"type": "Polygon",
						"id": "459"
					},
					{
						"arcs": [
							[
								1911,
								-509,
								-1291,
								1912
							]
						],
						"type": "Polygon",
						"id": "544"
					},
					{
						"arcs": [
							[
								1913,
								1914,
								-1211,
								-778,
								-1910
							]
						],
						"type": "Polygon",
						"id": "431"
					},
					{
						"arcs": [
							[
								-1908,
								-1212,
								-1915,
								1915
							]
						],
						"type": "Polygon",
						"id": "447"
					},
					{
						"arcs": [
							[
								-1828,
								-510,
								-1912,
								1916
							]
						],
						"type": "Polygon",
						"id": "540"
					},
					{
						"arcs": [
							[
								-1740,
								1917,
								-1854,
								1918
							]
						],
						"type": "Polygon",
						"id": "507"
					},
					{
						"arcs": [
							[
								1919,
								1920,
								1921
							]
						],
						"type": "Polygon",
						"id": "597"
					},
					{
						"arcs": [
							[
								1922,
								1923,
								1924,
								1925,
								1926,
								1927
							]
						],
						"type": "Polygon",
						"id": "606"
					},
					{
						"arcs": [
							[
								1928,
								1929,
								1930,
								1931
							]
						],
						"type": "Polygon",
						"id": "563"
					},
					{
						"arcs": [
							[
								-1932,
								1932,
								1933,
								1934
							]
						],
						"type": "Polygon",
						"id": "592"
					},
					{
						"arcs": [
							[
								1935
							]
						],
						"type": "Polygon",
						"id": "602"
					},
					{
						"arcs": [
							[
								1936,
								-1926,
								1937,
								1938,
								1939,
								-1934
							]
						],
						"type": "Polygon",
						"id": "583"
					},
					{
						"arcs": [
							[
								-1924,
								1940,
								1941
							]
						],
						"type": "Polygon",
						"id": "587"
					},
					{
						"arcs": [
							[
								1942,
								-1939,
								1943,
								1944,
								1945
							]
						],
						"type": "Polygon",
						"id": "407"
					},
					{
						"arcs": [
							[
								-1921,
								1946,
								1947,
								1948,
								1949
							]
						],
						"type": "Polygon",
						"id": "543"
					},
					{
						"arcs": [
							[
								-1948,
								1950,
								1951,
								1952,
								1953
							]
						],
						"type": "Polygon",
						"id": "554"
					},
					{
						"arcs": [
							[
								1954,
								1955,
								-1951,
								-1947,
								-1920
							]
						],
						"type": "Polygon",
						"id": "604"
					},
					{
						"arcs": [
							[
								-1953,
								1956,
								1957,
								1958
							]
						],
						"type": "Polygon",
						"id": "558"
					},
					{
						"arcs": [
							[
								-1952,
								-1956,
								1959,
								-1928,
								1960,
								-1957
							]
						],
						"type": "Polygon",
						"id": "578"
					},
					{
						"arcs": [
							[
								-1931,
								1961,
								-1958,
								-1961,
								-1927,
								-1937,
								-1933
							]
						],
						"type": "Polygon",
						"id": "599"
					},
					{
						"arcs": [
							[
								1962,
								-1949,
								-1954,
								-1959,
								-1962,
								-1930
							]
						],
						"type": "Polygon",
						"id": "547"
					},
					{
						"arcs": [
							[
								1963
							]
						],
						"type": "Polygon",
						"id": "566"
					},
					{
						"arcs": [
							[
								-1938,
								-1925,
								-1942,
								1964,
								-1944
							]
						],
						"type": "Polygon",
						"id": "570"
					},
					{
						"arcs": [
							[
								-1946,
								1965
							]
						],
						"type": "Polygon",
						"id": "574"
					}
				]
			}
		}
	};

/***/ },
/* 44 */
/***/ function(module, exports) {

	module.exports = {
		"type": "Topology",
		"arcs": [
			[
				[
					3321,
					9592
				],
				[
					-75,
					1
				],
				[
					-210,
					-159
				],
				[
					-25,
					-79
				],
				[
					-67,
					-29
				],
				[
					-1,
					-97
				],
				[
					-113,
					-15
				],
				[
					-17,
					-74
				]
			],
			[
				[
					2813,
					9140
				],
				[
					-84,
					-18
				],
				[
					-16,
					84
				],
				[
					-74,
					-7
				],
				[
					23,
					61
				],
				[
					42,
					-14
				],
				[
					56,
					100
				],
				[
					-37,
					88
				],
				[
					24,
					50
				],
				[
					-48,
					33
				],
				[
					-63,
					156
				],
				[
					-79,
					4
				],
				[
					38,
					113
				],
				[
					-6,
					111
				]
			],
			[
				[
					2589,
					9901
				],
				[
					102,
					-31
				],
				[
					8,
					-52
				],
				[
					74,
					-13
				],
				[
					31,
					51
				],
				[
					92,
					3
				],
				[
					69,
					58
				],
				[
					16,
					-41
				],
				[
					108,
					-41
				],
				[
					77,
					-84
				],
				[
					56,
					51
				],
				[
					40,
					-23
				],
				[
					62,
					-117
				],
				[
					-3,
					-70
				]
			],
			[
				[
					2264,
					9489
				],
				[
					-28,
					-82
				],
				[
					-66,
					44
				],
				[
					94,
					38
				]
			],
			[
				[
					1973,
					9659
				],
				[
					44,
					-97
				],
				[
					-81,
					74
				],
				[
					37,
					23
				]
			],
			[
				[
					2153,
					9742
				],
				[
					0,
					-94
				],
				[
					-135,
					32
				],
				[
					24,
					55
				],
				[
					111,
					7
				]
			],
			[
				[
					2813,
					9140
				],
				[
					29,
					-106
				]
			],
			[
				[
					2842,
					9034
				],
				[
					-147,
					-26
				],
				[
					-12,
					-45
				],
				[
					-238,
					-38
				]
			],
			[
				[
					2445,
					8925
				],
				[
					-59,
					-6
				],
				[
					-41,
					73
				],
				[
					28,
					134
				],
				[
					-147,
					7
				],
				[
					-45,
					42
				],
				[
					74,
					55
				],
				[
					-16,
					54
				],
				[
					191,
					23
				],
				[
					70,
					58
				],
				[
					-14,
					82
				],
				[
					-73,
					-84
				],
				[
					-67,
					12
				],
				[
					51,
					76
				],
				[
					17,
					89
				],
				[
					-109,
					108
				],
				[
					-56,
					146
				],
				[
					-62,
					64
				],
				[
					-4,
					59
				],
				[
					-72,
					-5
				],
				[
					-77,
					-45
				],
				[
					-61,
					43
				],
				[
					-35,
					-50
				],
				[
					1,
					89
				],
				[
					67,
					163
				],
				[
					46,
					-26
				],
				[
					-69,
					-63
				],
				[
					7,
					-74
				],
				[
					47,
					-41
				],
				[
					428,
					29
				],
				[
					124,
					-36
				]
			],
			[
				[
					2842,
					9034
				],
				[
					10,
					-44
				],
				[
					-110,
					-64
				],
				[
					7,
					-80
				],
				[
					205,
					38
				],
				[
					28,
					-57
				],
				[
					129,
					6
				],
				[
					87,
					-58
				],
				[
					54,
					17
				]
			],
			[
				[
					3252,
					8792
				],
				[
					47,
					-35
				],
				[
					26,
					-85
				]
			],
			[
				[
					3325,
					8672
				],
				[
					-167,
					-63
				],
				[
					30,
					-79
				]
			],
			[
				[
					3188,
					8530
				],
				[
					-90,
					94
				],
				[
					-84,
					-18
				],
				[
					24,
					-36
				],
				[
					-26,
					-101
				],
				[
					-61,
					-27
				],
				[
					13,
					-40
				],
				[
					-77,
					-19
				]
			],
			[
				[
					2887,
					8383
				],
				[
					-51,
					43
				],
				[
					-51,
					100
				],
				[
					-68,
					65
				]
			],
			[
				[
					2717,
					8591
				],
				[
					-200,
					15
				],
				[
					-86,
					60
				],
				[
					-65,
					128
				],
				[
					122,
					48
				],
				[
					-43,
					83
				]
			],
			[
				[
					3321,
					9592
				],
				[
					-4,
					-113
				],
				[
					-129,
					-132
				],
				[
					215,
					47
				],
				[
					29,
					-67
				]
			],
			[
				[
					3432,
					9327
				],
				[
					-53,
					-11
				],
				[
					-48,
					-133
				],
				[
					64,
					-87
				]
			],
			[
				[
					3395,
					9096
				],
				[
					-4,
					-160
				],
				[
					-98,
					22
				],
				[
					-35,
					-33
				],
				[
					-6,
					-133
				]
			],
			[
				[
					3435,
					9214
				],
				[
					25,
					-6
				],
				[
					-17,
					-115
				],
				[
					-48,
					3
				]
			],
			[
				[
					3432,
					9327
				],
				[
					3,
					-113
				]
			],
			[
				[
					3866,
					9161
				],
				[
					12,
					-46
				],
				[
					-42,
					-102
				],
				[
					-50,
					53
				],
				[
					-58,
					-6
				],
				[
					-47,
					-66
				],
				[
					38,
					-76
				],
				[
					-86,
					-3
				],
				[
					-4,
					-43
				]
			],
			[
				[
					3629,
					8872
				],
				[
					-107,
					22
				],
				[
					-103,
					-59
				],
				[
					104,
					-40
				],
				[
					-198,
					-123
				]
			],
			[
				[
					3435,
					9214
				],
				[
					34,
					78
				],
				[
					68,
					35
				],
				[
					69,
					-8
				],
				[
					200,
					-103
				],
				[
					60,
					-55
				]
			],
			[
				[
					3188,
					8530
				],
				[
					22,
					-89
				],
				[
					64,
					23
				],
				[
					-21,
					-153
				]
			],
			[
				[
					3253,
					8311
				],
				[
					-60,
					-51
				]
			],
			[
				[
					3193,
					8260
				],
				[
					-2,
					-5
				]
			],
			[
				[
					3191,
					8255
				],
				[
					-34,
					-33
				],
				[
					-43,
					42
				],
				[
					-33,
					-77
				]
			],
			[
				[
					3081,
					8187
				],
				[
					-143,
					76
				],
				[
					-34,
					98
				]
			],
			[
				[
					2904,
					8361
				],
				[
					-17,
					22
				]
			],
			[
				[
					3629,
					8872
				],
				[
					30,
					-31
				],
				[
					87,
					11
				],
				[
					-18,
					-66
				],
				[
					-72,
					-35
				],
				[
					63,
					-9
				],
				[
					16,
					-71
				],
				[
					-96,
					-40
				],
				[
					-30,
					-56
				],
				[
					72,
					-82
				],
				[
					-7,
					-33
				]
			],
			[
				[
					3674,
					8460
				],
				[
					-56,
					-121
				]
			],
			[
				[
					3618,
					8339
				],
				[
					-100,
					38
				],
				[
					-85,
					-45
				]
			],
			[
				[
					3433,
					8332
				],
				[
					-16,
					8
				]
			],
			[
				[
					3417,
					8340
				],
				[
					-5,
					2
				]
			],
			[
				[
					3412,
					8342
				],
				[
					21,
					79
				],
				[
					-71,
					-22
				],
				[
					-10,
					-53
				],
				[
					-72,
					-40
				]
			],
			[
				[
					3280,
					8306
				],
				[
					-3,
					1
				]
			],
			[
				[
					3277,
					8307
				],
				[
					-24,
					4
				]
			],
			[
				[
					3967,
					8753
				],
				[
					-17,
					-71
				],
				[
					-204,
					-69
				],
				[
					46,
					-48
				],
				[
					-53,
					-27
				],
				[
					-17,
					-84
				],
				[
					-48,
					6
				]
			],
			[
				[
					3866,
					9161
				],
				[
					60,
					9
				],
				[
					113,
					91
				],
				[
					73,
					-19
				],
				[
					85,
					29
				],
				[
					-46,
					-62
				],
				[
					18,
					-186
				],
				[
					-109,
					-75
				],
				[
					-74,
					-74
				],
				[
					-42,
					16
				],
				[
					-44,
					-53
				],
				[
					17,
					-68
				],
				[
					50,
					-16
				]
			],
			[
				[
					4163,
					9454
				],
				[
					118,
					-32
				],
				[
					62,
					-135
				],
				[
					-173,
					9
				],
				[
					1,
					45
				],
				[
					-74,
					7
				],
				[
					22,
					82
				],
				[
					44,
					24
				]
			],
			[
				[
					3905,
					8517
				],
				[
					-4,
					-82
				],
				[
					73,
					-61
				],
				[
					58,
					-2
				],
				[
					26,
					-53
				],
				[
					-35,
					-112
				],
				[
					-71,
					2
				],
				[
					8,
					-42
				],
				[
					-111,
					-113
				],
				[
					-46,
					1
				],
				[
					-32,
					-120
				]
			],
			[
				[
					3771,
					7935
				],
				[
					-100,
					29
				]
			],
			[
				[
					3671,
					7964
				],
				[
					-129,
					61
				]
			],
			[
				[
					3542,
					8025
				],
				[
					-77,
					113
				],
				[
					-38,
					2
				]
			],
			[
				[
					3427,
					8140
				],
				[
					-1,
					2
				]
			],
			[
				[
					3426,
					8142
				],
				[
					-10,
					51
				]
			],
			[
				[
					3416,
					8193
				],
				[
					-2,
					6
				]
			],
			[
				[
					3414,
					8199
				],
				[
					43,
					23
				],
				[
					-24,
					110
				]
			],
			[
				[
					3618,
					8339
				],
				[
					45,
					-54
				],
				[
					46,
					14
				],
				[
					23,
					79
				],
				[
					108,
					-34
				],
				[
					11,
					138
				],
				[
					54,
					35
				]
			],
			[
				[
					4017,
					8707
				],
				[
					-7,
					-41
				],
				[
					-99,
					-67
				],
				[
					-6,
					-82
				]
			],
			[
				[
					3967,
					8753
				],
				[
					50,
					-46
				]
			],
			[
				[
					4742,
					7792
				],
				[
					13,
					-33
				],
				[
					-80,
					-15
				],
				[
					-80,
					33
				],
				[
					-61,
					-44
				],
				[
					-14,
					-109
				],
				[
					-110,
					19
				],
				[
					-2,
					-38
				],
				[
					-102,
					15
				]
			],
			[
				[
					4306,
					7620
				],
				[
					-75,
					45
				],
				[
					19,
					26
				],
				[
					-106,
					77
				],
				[
					-60,
					127
				],
				[
					-54,
					20
				],
				[
					-67,
					-57
				],
				[
					-104,
					83
				],
				[
					-88,
					-6
				]
			],
			[
				[
					4017,
					8707
				],
				[
					58,
					37
				]
			],
			[
				[
					4075,
					8744
				],
				[
					51,
					-49
				],
				[
					5,
					-58
				],
				[
					-43,
					-34
				],
				[
					70,
					-39
				],
				[
					-6,
					-60
				],
				[
					85,
					-8
				],
				[
					68,
					-49
				],
				[
					111,
					24
				],
				[
					79,
					-52
				],
				[
					-25,
					-67
				],
				[
					27,
					-101
				],
				[
					-44,
					-44
				],
				[
					33,
					-121
				],
				[
					43,
					-44
				],
				[
					26,
					52
				],
				[
					50,
					-33
				],
				[
					-12,
					-54
				],
				[
					44,
					-38
				],
				[
					29,
					-103
				],
				[
					46,
					-8
				],
				[
					30,
					-66
				]
			],
			[
				[
					4471,
					8795
				],
				[
					-23,
					-83
				],
				[
					-53,
					47
				],
				[
					76,
					36
				]
			],
			[
				[
					4891,
					8715
				],
				[
					-56,
					29
				],
				[
					-68,
					-68
				],
				[
					-42,
					5
				],
				[
					-28,
					-145
				],
				[
					28,
					-62
				],
				[
					91,
					-59
				],
				[
					58,
					15
				],
				[
					57,
					-102
				],
				[
					119,
					-30
				],
				[
					8,
					-51
				],
				[
					77,
					-47
				],
				[
					-13,
					-64
				],
				[
					33,
					-52
				],
				[
					-11,
					-109
				],
				[
					-33,
					-20
				],
				[
					45,
					-80
				]
			],
			[
				[
					5156,
					7875
				],
				[
					-130,
					28
				],
				[
					-123,
					-6
				],
				[
					-48,
					-79
				],
				[
					-113,
					-26
				]
			],
			[
				[
					4075,
					8744
				],
				[
					163,
					39
				],
				[
					58,
					-36
				],
				[
					29,
					-72
				],
				[
					38,
					34
				],
				[
					79,
					-61
				],
				[
					34,
					27
				],
				[
					23,
					102
				],
				[
					93,
					86
				],
				[
					-74,
					-2
				],
				[
					118,
					101
				],
				[
					138,
					-9
				],
				[
					108,
					35
				]
			],
			[
				[
					4882,
					8988
				],
				[
					25,
					-57
				],
				[
					-28,
					-52
				],
				[
					31,
					-130
				],
				[
					-19,
					-34
				]
			],
			[
				[
					5417,
					8824
				],
				[
					-39,
					-55
				],
				[
					-47,
					2
				],
				[
					-30,
					-71
				],
				[
					-58,
					45
				],
				[
					-76,
					-28
				],
				[
					-6,
					46
				],
				[
					-102,
					-44
				],
				[
					-78,
					-82
				],
				[
					-10,
					-56
				],
				[
					-89,
					69
				],
				[
					9,
					65
				]
			],
			[
				[
					4882,
					8988
				],
				[
					96,
					8
				],
				[
					61,
					75
				],
				[
					80,
					50
				]
			],
			[
				[
					5119,
					9121
				],
				[
					67,
					-85
				],
				[
					12,
					-124
				],
				[
					137,
					-27
				],
				[
					82,
					-61
				]
			],
			[
				[
					5835,
					9407
				],
				[
					34,
					-31
				],
				[
					-84,
					-35
				],
				[
					50,
					66
				]
			],
			[
				[
					6088,
					8878
				],
				[
					30,
					-53
				],
				[
					-83,
					-8
				],
				[
					-19,
					-96
				],
				[
					-95,
					52
				],
				[
					-46,
					64
				],
				[
					-197,
					-68
				]
			],
			[
				[
					5678,
					8769
				],
				[
					-105,
					-35
				],
				[
					-90,
					72
				],
				[
					-66,
					18
				]
			],
			[
				[
					5119,
					9121
				],
				[
					40,
					28
				],
				[
					105,
					162
				],
				[
					34,
					81
				],
				[
					118,
					-51
				],
				[
					210,
					2
				],
				[
					-94,
					-47
				],
				[
					-89,
					29
				],
				[
					-75,
					-51
				],
				[
					-136,
					-24
				],
				[
					2,
					-104
				],
				[
					85,
					58
				],
				[
					16,
					49
				],
				[
					53,
					-5
				],
				[
					66,
					52
				],
				[
					57,
					-27
				],
				[
					26,
					-62
				],
				[
					70,
					75
				],
				[
					104,
					46
				],
				[
					70,
					-148
				],
				[
					7,
					56
				],
				[
					94,
					24
				],
				[
					-23,
					58
				],
				[
					-50,
					-9
				],
				[
					84,
					84
				],
				[
					-75,
					36
				],
				[
					-14,
					43
				],
				[
					124,
					10
				],
				[
					55,
					31
				],
				[
					64,
					-136
				],
				[
					52,
					51
				],
				[
					-18,
					64
				],
				[
					-36,
					-14
				],
				[
					-60,
					81
				],
				[
					-100,
					-73
				],
				[
					33,
					151
				],
				[
					112,
					14
				],
				[
					-35,
					-95
				],
				[
					61,
					-54
				],
				[
					142,
					18
				],
				[
					24,
					-83
				],
				[
					-77,
					-60
				],
				[
					41,
					-98
				],
				[
					40,
					3
				],
				[
					74,
					-80
				],
				[
					-51,
					-58
				],
				[
					-16,
					71
				],
				[
					-159,
					-20
				],
				[
					-73,
					-74
				],
				[
					2,
					-74
				],
				[
					-210,
					80
				],
				[
					122,
					-60
				],
				[
					31,
					-99
				],
				[
					79,
					14
				],
				[
					30,
					-105
				],
				[
					33,
					-3
				]
			],
			[
				[
					6108,
					9389
				],
				[
					-39,
					-73
				],
				[
					52,
					-7
				],
				[
					-13,
					80
				]
			],
			[
				[
					6815,
					7890
				],
				[
					-76,
					-22
				],
				[
					-40,
					-69
				],
				[
					-134,
					3
				],
				[
					100,
					126
				],
				[
					1,
					99
				],
				[
					-82,
					9
				],
				[
					-57,
					-37
				],
				[
					-40,
					29
				],
				[
					-66,
					-18
				],
				[
					-31,
					108
				],
				[
					-76,
					62
				],
				[
					-4,
					-101
				],
				[
					-51,
					10
				],
				[
					-71,
					-95
				],
				[
					-60,
					-13
				],
				[
					-22,
					-103
				],
				[
					-66,
					-27
				],
				[
					-29,
					-70
				],
				[
					-35,
					42
				],
				[
					-85,
					-20
				]
			],
			[
				[
					5891,
					7803
				],
				[
					9,
					72
				],
				[
					50,
					-18
				],
				[
					5,
					87
				],
				[
					70,
					42
				],
				[
					-36,
					44
				],
				[
					-119,
					-3
				],
				[
					-69,
					22
				],
				[
					26,
					66
				],
				[
					-64,
					98
				],
				[
					149,
					112
				],
				[
					108,
					61
				],
				[
					14,
					51
				],
				[
					-46,
					24
				],
				[
					18,
					82
				],
				[
					-48,
					24
				],
				[
					-82,
					-54
				],
				[
					-42,
					70
				],
				[
					27,
					62
				],
				[
					-48,
					46
				],
				[
					-73,
					13
				],
				[
					-62,
					65
				]
			],
			[
				[
					6088,
					8878
				],
				[
					-18,
					41
				],
				[
					175,
					38
				],
				[
					89,
					-63
				],
				[
					-53,
					-90
				],
				[
					137,
					-142
				],
				[
					-70,
					-58
				],
				[
					-2,
					-40
				],
				[
					130,
					-45
				],
				[
					153,
					-7
				],
				[
					73,
					-22
				],
				[
					26,
					-308
				],
				[
					55,
					-126
				],
				[
					32,
					-166
				]
			],
			[
				[
					6325,
					8990
				],
				[
					62,
					-96
				],
				[
					110,
					-59
				],
				[
					170,
					-166
				],
				[
					-11,
					-78
				],
				[
					-154,
					2
				],
				[
					-22,
					-27
				],
				[
					-132,
					2
				],
				[
					89,
					83
				],
				[
					-33,
					65
				],
				[
					121,
					22
				],
				[
					-63,
					103
				],
				[
					-90,
					-76
				],
				[
					-1,
					62
				],
				[
					-73,
					-29
				],
				[
					39,
					95
				],
				[
					-50,
					75
				],
				[
					38,
					22
				]
			],
			[
				[
					5891,
					7803
				],
				[
					-10,
					-39
				]
			],
			[
				[
					5881,
					7764
				],
				[
					-48,
					24
				],
				[
					-156,
					-112
				]
			],
			[
				[
					5677,
					7676
				],
				[
					-30,
					44
				],
				[
					-146,
					-13
				],
				[
					-5,
					46
				],
				[
					-166,
					49
				],
				[
					-83,
					-15
				],
				[
					-91,
					88
				]
			],
			[
				[
					3331,
					8252
				],
				[
					-9,
					-53
				],
				[
					27,
					-9
				],
				[
					48,
					10
				],
				[
					9,
					-1
				],
				[
					2,
					0
				],
				[
					6,
					-3
				],
				[
					1,
					0
				]
			],
			[
				[
					3415,
					8196
				],
				[
					1,
					-3
				]
			],
			[
				[
					3426,
					8142
				],
				[
					0,
					0
				],
				[
					0,
					0
				],
				[
					-1,
					0
				],
				[
					-1,
					0
				],
				[
					-1,
					0
				],
				[
					1,
					-1
				],
				[
					-3,
					-4
				],
				[
					-1,
					0
				],
				[
					-15,
					10
				],
				[
					-11,
					-9
				],
				[
					-10,
					7
				],
				[
					-16,
					-19
				],
				[
					-52,
					11
				],
				[
					-145,
					-4
				],
				[
					-56,
					36
				]
			],
			[
				[
					3115,
					8169
				],
				[
					1,
					14
				]
			],
			[
				[
					3116,
					8183
				],
				[
					149,
					-13
				],
				[
					13,
					25
				]
			],
			[
				[
					3278,
					8195
				],
				[
					22,
					15
				]
			],
			[
				[
					3300,
					8210
				],
				[
					31,
					42
				]
			],
			[
				[
					3193,
					8259
				],
				[
					0,
					0
				],
				[
					4,
					-4
				],
				[
					3,
					-4
				],
				[
					18,
					-12
				],
				[
					1,
					-13
				],
				[
					9,
					4
				],
				[
					16,
					-24
				],
				[
					34,
					-11
				]
			],
			[
				[
					3116,
					8183
				],
				[
					-35,
					4
				]
			],
			[
				[
					3191,
					8255
				],
				[
					2,
					4
				]
			],
			[
				[
					3278,
					8307
				],
				[
					1,
					-2
				],
				[
					0,
					0
				],
				[
					0,
					0
				],
				[
					0,
					-1
				],
				[
					1,
					-1
				],
				[
					5,
					-10
				],
				[
					-20,
					-26
				],
				[
					35,
					-57
				]
			],
			[
				[
					3193,
					8259
				],
				[
					0,
					1
				]
			],
			[
				[
					3277,
					8307
				],
				[
					1,
					0
				]
			],
			[
				[
					3412,
					8342
				],
				[
					1,
					-1
				]
			],
			[
				[
					3413,
					8341
				],
				[
					0,
					0
				],
				[
					0,
					0
				],
				[
					0,
					-2
				],
				[
					1,
					0
				],
				[
					-2,
					-7
				],
				[
					5,
					-12
				],
				[
					-7,
					-28
				],
				[
					-79,
					-40
				]
			],
			[
				[
					3278,
					8307
				],
				[
					2,
					-1
				]
			],
			[
				[
					3413,
					8341
				],
				[
					4,
					-1
				]
			],
			[
				[
					3414,
					8199
				],
				[
					1,
					-3
				]
			],
			[
				[
					3426,
					8142
				],
				[
					1,
					-2
				]
			],
			[
				[
					3542,
					8025
				],
				[
					-105,
					-47
				],
				[
					-99,
					87
				],
				[
					-54,
					-63
				],
				[
					-70,
					55
				],
				[
					-29,
					-27
				],
				[
					-73,
					89
				]
			],
			[
				[
					3112,
					8119
				],
				[
					3,
					50
				]
			],
			[
				[
					1343,
					8340
				],
				[
					-29,
					-61
				],
				[
					-74,
					-14
				],
				[
					6,
					-110
				],
				[
					177,
					36
				],
				[
					21,
					-127
				],
				[
					110,
					-114
				]
			],
			[
				[
					1554,
					7950
				],
				[
					-174,
					-56
				],
				[
					-100,
					50
				],
				[
					-49,
					-29
				],
				[
					-64,
					29
				],
				[
					-52,
					-59
				]
			],
			[
				[
					1115,
					7885
				],
				[
					-197,
					20
				],
				[
					-14,
					25
				],
				[
					23,
					224
				],
				[
					88,
					4
				],
				[
					-41,
					47
				],
				[
					124,
					127
				],
				[
					94,
					24
				],
				[
					151,
					-16
				]
			],
			[
				[
					1175,
					8407
				],
				[
					-55,
					-30
				],
				[
					-106,
					5
				],
				[
					161,
					25
				]
			],
			[
				[
					1554,
					7950
				],
				[
					56,
					-31
				]
			],
			[
				[
					1610,
					7919
				],
				[
					-28,
					-75
				],
				[
					-118,
					-93
				],
				[
					14,
					-57
				]
			],
			[
				[
					1478,
					7694
				],
				[
					-55,
					9
				],
				[
					-31,
					-167
				],
				[
					80,
					-54
				],
				[
					24,
					-90
				],
				[
					65,
					-25
				],
				[
					-38,
					-76
				],
				[
					-50,
					-24
				],
				[
					-24,
					-68
				]
			],
			[
				[
					1449,
					7199
				],
				[
					-187,
					-78
				],
				[
					-21,
					36
				],
				[
					-58,
					-41
				],
				[
					-66,
					42
				],
				[
					-101,
					-49
				],
				[
					41,
					-97
				],
				[
					-51,
					-20
				],
				[
					-15,
					-66
				],
				[
					-82,
					65
				]
			],
			[
				[
					909,
					6991
				],
				[
					39,
					7
				],
				[
					26,
					268
				],
				[
					75,
					119
				],
				[
					25,
					90
				],
				[
					-27,
					167
				],
				[
					31,
					78
				],
				[
					-21,
					155
				],
				[
					58,
					10
				]
			],
			[
				[
					749,
					8250
				],
				[
					-72,
					-60
				],
				[
					-46,
					31
				],
				[
					85,
					44
				],
				[
					33,
					-15
				]
			],
			[
				[
					1858,
					7994
				],
				[
					-18,
					-72
				]
			],
			[
				[
					1840,
					7922
				],
				[
					-88,
					-15
				],
				[
					-26,
					-42
				],
				[
					-116,
					54
				]
			],
			[
				[
					1343,
					8340
				],
				[
					124,
					37
				],
				[
					165,
					19
				],
				[
					95,
					-16
				],
				[
					8,
					-84
				],
				[
					36,
					3
				],
				[
					67,
					-141
				],
				[
					-87,
					-38
				],
				[
					9,
					-57
				],
				[
					63,
					-18
				],
				[
					35,
					-51
				]
			],
			[
				[
					1840,
					7922
				],
				[
					56,
					-59
				],
				[
					57,
					-146
				],
				[
					-28,
					-128
				],
				[
					-63,
					21
				],
				[
					-105,
					-32
				],
				[
					-15,
					-39
				]
			],
			[
				[
					1742,
					7539
				],
				[
					-68,
					21
				],
				[
					-100,
					85
				],
				[
					11,
					29
				],
				[
					-107,
					20
				]
			],
			[
				[
					2144,
					8145
				],
				[
					-50,
					-69
				]
			],
			[
				[
					2094,
					8076
				],
				[
					6,
					-137
				]
			],
			[
				[
					2100,
					7939
				],
				[
					-11,
					-182
				]
			],
			[
				[
					2089,
					7757
				],
				[
					102,
					-75
				],
				[
					76,
					-125
				]
			],
			[
				[
					2267,
					7557
				],
				[
					1,
					-3
				]
			],
			[
				[
					2268,
					7554
				],
				[
					1,
					-35
				]
			],
			[
				[
					2269,
					7519
				],
				[
					-55,
					-73
				],
				[
					37,
					-28
				],
				[
					-36,
					-137
				],
				[
					-147,
					-79
				]
			],
			[
				[
					2068,
					7202
				],
				[
					-102,
					108
				],
				[
					-77,
					-19
				],
				[
					-90,
					76
				],
				[
					2,
					93
				],
				[
					-59,
					79
				]
			],
			[
				[
					1858,
					7994
				],
				[
					40,
					-15
				],
				[
					55,
					83
				],
				[
					1,
					69
				],
				[
					-68,
					8
				],
				[
					9,
					81
				],
				[
					39,
					39
				],
				[
					74,
					-51
				],
				[
					102,
					-26
				],
				[
					34,
					-37
				]
			],
			[
				[
					2904,
					8361
				],
				[
					-88,
					-54
				],
				[
					9,
					-41
				],
				[
					-60,
					-109
				],
				[
					-118,
					-3
				],
				[
					-33,
					80
				],
				[
					-197,
					-100
				],
				[
					61,
					-62
				],
				[
					-53,
					-40
				],
				[
					38,
					-35
				],
				[
					-35,
					-41
				]
			],
			[
				[
					2428,
					7956
				],
				[
					-93,
					13
				],
				[
					-23,
					-66
				],
				[
					-83,
					-73
				],
				[
					-126,
					13
				],
				[
					-3,
					96
				]
			],
			[
				[
					2094,
					8076
				],
				[
					91,
					16
				],
				[
					35,
					34
				],
				[
					-46,
					107
				],
				[
					-57,
					18
				]
			],
			[
				[
					2117,
					8251
				],
				[
					-30,
					115
				],
				[
					66,
					197
				],
				[
					97,
					60
				],
				[
					79,
					-75
				],
				[
					93,
					-8
				],
				[
					142,
					40
				],
				[
					153,
					11
				]
			],
			[
				[
					3112,
					8119
				],
				[
					12,
					-84
				],
				[
					-105,
					-40
				],
				[
					-71,
					-94
				],
				[
					31,
					-102
				]
			],
			[
				[
					2979,
					7799
				],
				[
					-98,
					-35
				],
				[
					-31,
					18
				],
				[
					-64,
					-85
				],
				[
					-147,
					4
				]
			],
			[
				[
					2639,
					7701
				],
				[
					-7,
					-9
				]
			],
			[
				[
					2632,
					7692
				],
				[
					-17,
					-11
				]
			],
			[
				[
					2615,
					7681
				],
				[
					-59,
					-23
				],
				[
					-34,
					59
				],
				[
					-13,
					135
				],
				[
					-81,
					104
				]
			],
			[
				[
					1454,
					7043
				],
				[
					-62,
					-73
				],
				[
					-3,
					-194
				]
			],
			[
				[
					1389,
					6776
				],
				[
					-30,
					-124
				],
				[
					-85,
					-47
				]
			],
			[
				[
					1274,
					6605
				],
				[
					-132,
					-102
				],
				[
					-114,
					3
				],
				[
					-71,
					-33
				]
			],
			[
				[
					957,
					6473
				],
				[
					-32,
					66
				],
				[
					37,
					79
				],
				[
					-63,
					147
				],
				[
					-41,
					-39
				],
				[
					-134,
					31
				],
				[
					-61,
					35
				],
				[
					-13,
					88
				],
				[
					68,
					13
				],
				[
					-38,
					33
				],
				[
					19,
					74
				],
				[
					124,
					7
				],
				[
					86,
					-16
				]
			],
			[
				[
					1449,
					7199
				],
				[
					25,
					-40
				],
				[
					-63,
					-55
				],
				[
					43,
					-61
				]
			],
			[
				[
					2068,
					7202
				],
				[
					10,
					-85
				],
				[
					-129,
					-63
				],
				[
					2,
					-135
				],
				[
					25,
					-12
				],
				[
					-29,
					-98
				]
			],
			[
				[
					1947,
					6809
				],
				[
					-83,
					-23
				],
				[
					-35,
					-63
				],
				[
					-79,
					14
				],
				[
					-19,
					115
				],
				[
					29,
					147
				],
				[
					-77,
					67
				],
				[
					-47,
					-22
				],
				[
					-50,
					39
				],
				[
					-72,
					-42
				],
				[
					-60,
					2
				]
			],
			[
				[
					2432,
					7476
				],
				[
					-10,
					-57
				],
				[
					39,
					-103
				],
				[
					39,
					47
				],
				[
					133,
					-32
				],
				[
					41,
					-66
				],
				[
					-21,
					-43
				],
				[
					91,
					-6
				],
				[
					15,
					-57
				]
			],
			[
				[
					2759,
					7159
				],
				[
					-7,
					-12
				]
			],
			[
				[
					2752,
					7147
				],
				[
					-6,
					-34
				],
				[
					-76,
					21
				],
				[
					-165,
					-51
				],
				[
					-2,
					-75
				],
				[
					-107,
					-53
				],
				[
					68,
					-85
				],
				[
					-10,
					-62
				],
				[
					44,
					-53
				]
			],
			[
				[
					2498,
					6755
				],
				[
					-49,
					-72
				],
				[
					-65,
					-17
				],
				[
					-118,
					8
				],
				[
					-7,
					148
				],
				[
					-37,
					29
				],
				[
					-76,
					-42
				],
				[
					-39,
					20
				],
				[
					-72,
					-92
				],
				[
					-96,
					16
				]
			],
			[
				[
					1939,
					6753
				],
				[
					8,
					56
				]
			],
			[
				[
					2269,
					7519
				],
				[
					163,
					-43
				]
			],
			[
				[
					2615,
					7681
				],
				[
					17,
					11
				]
			],
			[
				[
					2639,
					7701
				],
				[
					-15,
					-127
				],
				[
					52,
					-57
				],
				[
					96,
					-38
				],
				[
					25,
					-41
				],
				[
					51,
					27
				],
				[
					12,
					-117
				],
				[
					-97,
					-125
				],
				[
					-4,
					-64
				]
			],
			[
				[
					2432,
					7476
				],
				[
					51,
					46
				],
				[
					3,
					103
				],
				[
					-31,
					34
				],
				[
					-63,
					-26
				]
			],
			[
				[
					2392,
					7633
				],
				[
					-1,
					0
				]
			],
			[
				[
					2391,
					7633
				],
				[
					-19,
					33
				],
				[
					-145,
					26
				],
				[
					-48,
					46
				],
				[
					-90,
					19
				]
			],
			[
				[
					3357,
					7629
				],
				[
					33,
					-30
				],
				[
					-57,
					-47
				],
				[
					80,
					-29
				]
			],
			[
				[
					3413,
					7523
				],
				[
					6,
					12
				]
			],
			[
				[
					3419,
					7535
				],
				[
					36,
					17
				]
			],
			[
				[
					3455,
					7552
				],
				[
					3,
					-2
				]
			],
			[
				[
					3458,
					7550
				],
				[
					7,
					-1
				]
			],
			[
				[
					3465,
					7549
				],
				[
					21,
					-171
				],
				[
					-59,
					1
				],
				[
					-145,
					-86
				],
				[
					-91,
					41
				],
				[
					-33,
					-108
				],
				[
					4,
					-95
				],
				[
					-84,
					-52
				],
				[
					7,
					-89
				]
			],
			[
				[
					3085,
					6990
				],
				[
					-71,
					-39
				],
				[
					-48,
					90
				],
				[
					-41,
					-22
				]
			],
			[
				[
					2925,
					7019
				],
				[
					-42,
					87
				],
				[
					-104,
					-2
				],
				[
					-27,
					43
				]
			],
			[
				[
					2979,
					7799
				],
				[
					17,
					-42
				],
				[
					140,
					-52
				],
				[
					42,
					30
				],
				[
					49,
					-47
				],
				[
					71,
					-1
				],
				[
					59,
					-58
				]
			],
			[
				[
					3671,
					7964
				],
				[
					-23,
					-40
				],
				[
					-56,
					20
				],
				[
					-127,
					-100
				],
				[
					37,
					-45
				],
				[
					-49,
					-46
				],
				[
					7,
					-56
				],
				[
					-74,
					-14
				],
				[
					-29,
					-54
				]
			],
			[
				[
					4306,
					7620
				],
				[
					70,
					-88
				],
				[
					86,
					28
				],
				[
					109,
					-52
				]
			],
			[
				[
					4571,
					7508
				],
				[
					-73,
					-47
				],
				[
					-11,
					-52
				],
				[
					-67,
					-71
				],
				[
					-90,
					-40
				],
				[
					-157,
					50
				],
				[
					-79,
					-2
				],
				[
					-48,
					-76
				],
				[
					-78,
					-1
				]
			],
			[
				[
					3968,
					7269
				],
				[
					-30,
					59
				],
				[
					46,
					41
				],
				[
					-17,
					66
				],
				[
					41,
					24
				],
				[
					-47,
					102
				],
				[
					-95,
					89
				],
				[
					-65,
					18
				],
				[
					11,
					36
				],
				[
					-87,
					-16
				],
				[
					-23,
					39
				],
				[
					-95,
					-118
				],
				[
					-48,
					1
				],
				[
					-94,
					-61
				]
			],
			[
				[
					3458,
					7550
				],
				[
					-3,
					2
				]
			],
			[
				[
					3419,
					7535
				],
				[
					-6,
					-12
				]
			],
			[
				[
					1939,
					6753
				],
				[
					13,
					-65
				],
				[
					103,
					-57
				],
				[
					18,
					-124
				]
			],
			[
				[
					2073,
					6507
				],
				[
					-7,
					-90
				],
				[
					48,
					-17
				],
				[
					-85,
					-91
				]
			],
			[
				[
					2029,
					6309
				],
				[
					-33,
					-1
				]
			],
			[
				[
					1996,
					6308
				],
				[
					-82,
					23
				],
				[
					-57,
					-76
				],
				[
					-78,
					-22
				]
			],
			[
				[
					1779,
					6233
				],
				[
					-53,
					14
				],
				[
					-40,
					-41
				],
				[
					-76,
					61
				]
			],
			[
				[
					1610,
					6267
				],
				[
					98,
					42
				],
				[
					7,
					74
				]
			],
			[
				[
					1715,
					6383
				],
				[
					63,
					-6
				],
				[
					44,
					52
				],
				[
					-16,
					60
				],
				[
					61,
					53
				],
				[
					-31,
					80
				],
				[
					-185,
					12
				]
			],
			[
				[
					1651,
					6634
				],
				[
					-103,
					9
				],
				[
					-75,
					38
				],
				[
					-20,
					69
				],
				[
					-64,
					26
				]
			],
			[
				[
					1715,
					6383
				],
				[
					-87,
					23
				],
				[
					18,
					146
				],
				[
					45,
					2
				],
				[
					-40,
					80
				]
			],
			[
				[
					2925,
					7019
				],
				[
					-152,
					-75
				],
				[
					20,
					-55
				],
				[
					-104,
					-40
				],
				[
					37,
					-119
				],
				[
					67,
					-3
				],
				[
					-19,
					-69
				],
				[
					53,
					28
				],
				[
					19,
					-53
				]
			],
			[
				[
					2846,
					6633
				],
				[
					-29,
					-40
				],
				[
					40,
					-77
				]
			],
			[
				[
					2857,
					6516
				],
				[
					-64,
					-69
				],
				[
					-69,
					-2
				],
				[
					-101,
					-49
				],
				[
					31,
					-52
				],
				[
					-31,
					-58
				]
			],
			[
				[
					2623,
					6286
				],
				[
					-8,
					48
				],
				[
					-73,
					18
				],
				[
					-54,
					60
				]
			],
			[
				[
					2488,
					6412
				],
				[
					47,
					-14
				],
				[
					25,
					65
				],
				[
					-83,
					39
				],
				[
					21,
					82
				],
				[
					47,
					17
				],
				[
					53,
					107
				],
				[
					10,
					70
				],
				[
					-67,
					32
				],
				[
					-43,
					-55
				]
			],
			[
				[
					3197,
					6609
				],
				[
					0,
					0
				],
				[
					0,
					0
				],
				[
					-1,
					0
				],
				[
					-5,
					1
				],
				[
					-2,
					1
				],
				[
					-2,
					-11
				],
				[
					-17,
					17
				],
				[
					-3,
					26
				],
				[
					-43,
					-14
				],
				[
					-95,
					47
				]
			],
			[
				[
					3029,
					6676
				],
				[
					-47,
					1
				]
			],
			[
				[
					2982,
					6677
				],
				[
					26,
					46
				],
				[
					98,
					-6
				],
				[
					47,
					26
				],
				[
					54,
					-42
				]
			],
			[
				[
					3207,
					6701
				],
				[
					-13,
					-86
				]
			],
			[
				[
					3194,
					6615
				],
				[
					3,
					-6
				]
			],
			[
				[
					3197,
					6609
				],
				[
					1,
					0
				]
			],
			[
				[
					3198,
					6609
				],
				[
					-13,
					-52
				],
				[
					-94,
					39
				],
				[
					-50,
					-30
				],
				[
					-12,
					110
				]
			],
			[
				[
					3085,
					6990
				],
				[
					55,
					-41
				],
				[
					143,
					-40
				],
				[
					3,
					-52
				],
				[
					75,
					-13
				]
			],
			[
				[
					3361,
					6844
				],
				[
					-4,
					-150
				],
				[
					-104,
					27
				],
				[
					-46,
					-20
				]
			],
			[
				[
					2982,
					6677
				],
				[
					-79,
					32
				],
				[
					-57,
					-76
				]
			],
			[
				[
					3968,
					7269
				],
				[
					-60,
					-13
				],
				[
					-6,
					-61
				]
			],
			[
				[
					3902,
					7195
				],
				[
					-71,
					-40
				],
				[
					-91,
					86
				],
				[
					-89,
					-20
				],
				[
					-62,
					-112
				],
				[
					40,
					-161
				],
				[
					-114,
					-124
				]
			],
			[
				[
					3515,
					6824
				],
				[
					-5,
					-29
				],
				[
					-149,
					49
				]
			],
			[
				[
					3902,
					7195
				],
				[
					30,
					-106
				],
				[
					22,
					5
				],
				[
					63,
					-111
				]
			],
			[
				[
					4017,
					6983
				],
				[
					-157,
					-42
				],
				[
					16,
					-81
				],
				[
					-66,
					-84
				],
				[
					22,
					-125
				],
				[
					-49,
					-44
				]
			],
			[
				[
					3783,
					6607
				],
				[
					-107,
					9
				],
				[
					-41,
					-27
				],
				[
					4,
					-142
				]
			],
			[
				[
					3639,
					6447
				],
				[
					-66,
					-59
				],
				[
					-71,
					9
				]
			],
			[
				[
					3502,
					6397
				],
				[
					-59,
					67
				],
				[
					-148,
					-5
				],
				[
					29,
					69
				]
			],
			[
				[
					3324,
					6528
				],
				[
					39,
					73
				],
				[
					46,
					0
				],
				[
					-8,
					71
				],
				[
					137,
					84
				],
				[
					-23,
					68
				]
			],
			[
				[
					3016,
					5576
				],
				[
					19,
					21
				]
			],
			[
				[
					3035,
					5597
				],
				[
					-19,
					-21
				]
			],
			[
				[
					3001,
					6330
				],
				[
					43,
					-33
				],
				[
					-39,
					-160
				],
				[
					42,
					-36
				],
				[
					62,
					34
				],
				[
					103,
					-98
				]
			],
			[
				[
					3212,
					6037
				],
				[
					-88,
					-55
				],
				[
					-52,
					23
				],
				[
					-60,
					-69
				],
				[
					1,
					-99
				],
				[
					88,
					16
				],
				[
					-48,
					-77
				],
				[
					56,
					-65
				],
				[
					-27,
					-56
				]
			],
			[
				[
					3082,
					5655
				],
				[
					-36,
					-40
				]
			],
			[
				[
					3046,
					5615
				],
				[
					-48,
					71
				],
				[
					-103,
					-8
				],
				[
					-45,
					26
				]
			],
			[
				[
					2850,
					5704
				],
				[
					-46,
					-5
				],
				[
					2,
					145
				],
				[
					50,
					48
				],
				[
					10,
					88
				],
				[
					-100,
					-12
				],
				[
					5,
					71
				],
				[
					-55,
					32
				],
				[
					2,
					54
				],
				[
					-63,
					-14
				]
			],
			[
				[
					2655,
					6111
				],
				[
					-32,
					175
				]
			],
			[
				[
					2857,
					6516
				],
				[
					54,
					-81
				],
				[
					-10,
					-66
				],
				[
					100,
					-39
				]
			],
			[
				[
					3324,
					6528
				],
				[
					-96,
					-4
				],
				[
					-98,
					-38
				],
				[
					21,
					-30
				],
				[
					-43,
					-76
				],
				[
					-20,
					37
				],
				[
					-36,
					-81
				],
				[
					-51,
					-6
				]
			],
			[
				[
					3198,
					6609
				],
				[
					-4,
					6
				]
			],
			[
				[
					3502,
					6397
				],
				[
					-36,
					-4
				],
				[
					-30,
					-92
				],
				[
					20,
					-39
				],
				[
					5,
					-146
				],
				[
					-95,
					-9
				],
				[
					-17,
					-43
				]
			],
			[
				[
					3349,
					6064
				],
				[
					-49,
					20
				],
				[
					-28,
					-59
				],
				[
					-60,
					12
				]
			],
			[
				[
					3936,
					6221
				],
				[
					-123,
					-8
				],
				[
					-69,
					-49
				]
			],
			[
				[
					3744,
					6164
				],
				[
					-22,
					-43
				],
				[
					-148,
					-18
				],
				[
					35,
					-47
				],
				[
					-94,
					-31
				],
				[
					32,
					41
				],
				[
					-83,
					2
				],
				[
					-21,
					-126
				],
				[
					-58,
					2
				],
				[
					-4,
					88
				],
				[
					-32,
					32
				]
			],
			[
				[
					3639,
					6447
				],
				[
					60,
					-45
				],
				[
					58,
					24
				],
				[
					52,
					118
				]
			],
			[
				[
					3809,
					6544
				],
				[
					58,
					10
				],
				[
					54,
					-126
				],
				[
					81,
					-35
				],
				[
					-66,
					-172
				]
			],
			[
				[
					3783,
					6607
				],
				[
					26,
					-63
				]
			],
			[
				[
					4101,
					6806
				],
				[
					-60,
					-47
				],
				[
					108,
					-134
				],
				[
					-68,
					-21
				],
				[
					42,
					-41
				],
				[
					33,
					-119
				],
				[
					-51,
					-48
				],
				[
					24,
					-63
				],
				[
					-53,
					-36
				],
				[
					-10,
					-64
				]
			],
			[
				[
					4066,
					6233
				],
				[
					-130,
					-12
				]
			],
			[
				[
					4017,
					6983
				],
				[
					45,
					-128
				],
				[
					39,
					-49
				]
			],
			[
				[
					3856,
					5693
				],
				[
					-47,
					-26
				],
				[
					11,
					-83
				],
				[
					-51,
					20
				]
			],
			[
				[
					3769,
					5604
				],
				[
					-22,
					48
				],
				[
					-58,
					-14
				],
				[
					-136,
					102
				],
				[
					-41,
					-72
				],
				[
					-106,
					23
				],
				[
					-53,
					-41
				],
				[
					-100,
					14
				],
				[
					-102,
					-27
				],
				[
					-69,
					18
				]
			],
			[
				[
					3744,
					6164
				],
				[
					69,
					-65
				],
				[
					1,
					-61
				],
				[
					-57,
					-83
				],
				[
					12,
					-99
				],
				[
					60,
					-74
				],
				[
					27,
					-89
				]
			],
			[
				[
					3769,
					5604
				],
				[
					-65,
					-23
				],
				[
					-53,
					44
				],
				[
					-52,
					-35
				],
				[
					-63,
					-90
				],
				[
					-146,
					-83
				],
				[
					-47,
					7
				],
				[
					-104,
					-78
				]
			],
			[
				[
					3239,
					5346
				],
				[
					-17,
					59
				],
				[
					-90,
					-18
				],
				[
					-73,
					-55
				],
				[
					53,
					-76
				],
				[
					-29,
					-15
				]
			],
			[
				[
					3083,
					5241
				],
				[
					-131,
					59
				],
				[
					29,
					82
				]
			],
			[
				[
					2981,
					5382
				],
				[
					31,
					82
				],
				[
					-43,
					73
				],
				[
					47,
					39
				]
			],
			[
				[
					3035,
					5597
				],
				[
					11,
					18
				]
			],
			[
				[
					2268,
					7555
				],
				[
					57,
					1
				],
				[
					36,
					35
				],
				[
					-6,
					22
				],
				[
					25,
					-2
				],
				[
					11,
					20
				],
				[
					0,
					0
				],
				[
					0,
					0
				],
				[
					0,
					1
				],
				[
					0,
					0
				],
				[
					1,
					1
				]
			],
			[
				[
					2268,
					7554
				],
				[
					0,
					1
				]
			],
			[
				[
					2391,
					7633
				],
				[
					1,
					0
				]
			],
			[
				[
					2268,
					7555
				],
				[
					-1,
					2
				]
			],
			[
				[
					2144,
					8145
				],
				[
					-57,
					98
				],
				[
					30,
					8
				]
			],
			[
				[
					5677,
					7676
				],
				[
					22,
					-26
				],
				[
					-60,
					-53
				],
				[
					70,
					-42
				],
				[
					20,
					-106
				],
				[
					-9,
					-177
				],
				[
					-51,
					10
				],
				[
					4,
					-58
				],
				[
					-48,
					-30
				],
				[
					1,
					-65
				],
				[
					-39,
					-47
				],
				[
					73,
					15
				],
				[
					-25,
					-106
				],
				[
					60,
					-34
				],
				[
					-76,
					-4
				],
				[
					-32,
					-75
				],
				[
					-54,
					8
				],
				[
					-46,
					-66
				]
			],
			[
				[
					5487,
					6820
				],
				[
					-45,
					55
				],
				[
					-92,
					-30
				],
				[
					-142,
					33
				],
				[
					7,
					135
				],
				[
					-133,
					13
				]
			],
			[
				[
					5082,
					7026
				],
				[
					-32,
					72
				],
				[
					47,
					109
				],
				[
					-48,
					95
				],
				[
					-139,
					16
				],
				[
					-33,
					-18
				],
				[
					-127,
					58
				],
				[
					19,
					25
				],
				[
					-198,
					125
				]
			],
			[
				[
					6815,
					7890
				],
				[
					30,
					-91
				],
				[
					-58,
					-75
				],
				[
					9,
					-77
				],
				[
					-40,
					-125
				],
				[
					-155,
					-111
				],
				[
					10,
					-86
				]
			],
			[
				[
					6611,
					7325
				],
				[
					-61,
					7
				],
				[
					-174,
					-185
				],
				[
					-104,
					-33
				],
				[
					23,
					-22
				],
				[
					-88,
					-33
				],
				[
					-42,
					52
				],
				[
					-103,
					1
				],
				[
					9,
					-76
				]
			],
			[
				[
					6071,
					7036
				],
				[
					-64,
					-33
				]
			],
			[
				[
					6007,
					7003
				],
				[
					6,
					172
				],
				[
					91,
					89
				],
				[
					-38,
					91
				],
				[
					-60,
					19
				],
				[
					96,
					72
				],
				[
					-92,
					56
				],
				[
					-92,
					141
				],
				[
					21,
					49
				],
				[
					-58,
					72
				]
			],
			[
				[
					6007,
					7003
				],
				[
					-25,
					-29
				]
			],
			[
				[
					5982,
					6974
				],
				[
					-1,
					0
				]
			],
			[
				[
					5981,
					6974
				],
				[
					-116,
					3
				],
				[
					-3,
					-53
				]
			],
			[
				[
					5862,
					6924
				],
				[
					-42,
					15
				],
				[
					-37,
					-107
				],
				[
					29,
					-20
				]
			],
			[
				[
					5812,
					6812
				],
				[
					-68,
					-52
				],
				[
					-52,
					69
				],
				[
					-112,
					-72
				]
			],
			[
				[
					5580,
					6757
				],
				[
					-80,
					8
				],
				[
					-13,
					55
				]
			],
			[
				[
					6611,
					7325
				],
				[
					-21,
					-87
				],
				[
					70,
					-15
				],
				[
					108,
					-86
				],
				[
					66,
					-92
				],
				[
					128,
					-91
				],
				[
					34,
					-54
				],
				[
					-27,
					-44
				],
				[
					21,
					-61
				],
				[
					-77,
					-122
				]
			],
			[
				[
					6913,
					6673
				],
				[
					-89,
					-27
				],
				[
					-86,
					11
				],
				[
					-32,
					104
				],
				[
					-69,
					47
				],
				[
					-17,
					-41
				],
				[
					-75,
					18
				],
				[
					-53,
					-44
				],
				[
					-45,
					39
				],
				[
					-100,
					-48
				],
				[
					-48,
					9
				],
				[
					-43,
					73
				],
				[
					-35,
					-38
				]
			],
			[
				[
					6221,
					6776
				],
				[
					-41,
					-5
				]
			],
			[
				[
					6180,
					6771
				],
				[
					-3,
					1
				]
			],
			[
				[
					6177,
					6772
				],
				[
					4,
					5
				],
				[
					-2,
					8
				],
				[
					13,
					17
				],
				[
					-5,
					2
				],
				[
					7,
					21
				],
				[
					20,
					19
				],
				[
					-72,
					62
				]
			],
			[
				[
					6142,
					6906
				],
				[
					-48,
					24
				]
			],
			[
				[
					6094,
					6930
				],
				[
					-7,
					17
				]
			],
			[
				[
					6087,
					6947
				],
				[
					19,
					52
				],
				[
					-35,
					37
				]
			],
			[
				[
					5580,
					6757
				],
				[
					-6,
					-71
				],
				[
					-37,
					11
				],
				[
					8,
					-143
				],
				[
					71,
					-38
				],
				[
					55,
					41
				],
				[
					70,
					-48
				],
				[
					29,
					-57
				]
			],
			[
				[
					5770,
					6452
				],
				[
					-14,
					-36
				],
				[
					-106,
					-71
				],
				[
					35,
					-63
				],
				[
					103,
					-12
				],
				[
					83,
					-127
				],
				[
					-86,
					-32
				],
				[
					-28,
					-116
				]
			],
			[
				[
					5757,
					5995
				],
				[
					-99,
					79
				],
				[
					-86,
					0
				],
				[
					-7,
					43
				],
				[
					-137,
					57
				],
				[
					-106,
					-35
				],
				[
					-47,
					63
				],
				[
					-84,
					16
				]
			],
			[
				[
					5191,
					6218
				],
				[
					-79,
					76
				]
			],
			[
				[
					5112,
					6294
				],
				[
					-48,
					86
				],
				[
					64,
					77
				],
				[
					-42,
					25
				],
				[
					51,
					126
				],
				[
					-19,
					25
				],
				[
					33,
					131
				],
				[
					-55,
					71
				],
				[
					-68,
					-17
				]
			],
			[
				[
					5028,
					6818
				],
				[
					-23,
					29
				],
				[
					24,
					127
				],
				[
					53,
					52
				]
			],
			[
				[
					5812,
					6812
				],
				[
					-28,
					-78
				]
			],
			[
				[
					5784,
					6734
				],
				[
					3,
					-3
				]
			],
			[
				[
					5787,
					6731
				],
				[
					0,
					-1
				]
			],
			[
				[
					5787,
					6730
				],
				[
					29,
					-58
				],
				[
					29,
					28
				],
				[
					93,
					-21
				]
			],
			[
				[
					5938,
					6679
				],
				[
					-49,
					-64
				],
				[
					113,
					-82
				],
				[
					-24,
					-40
				],
				[
					-127,
					21
				],
				[
					-81,
					-62
				]
			],
			[
				[
					6100,
					6682
				],
				[
					2,
					0
				]
			],
			[
				[
					6102,
					6682
				],
				[
					145,
					-31
				]
			],
			[
				[
					6247,
					6651
				],
				[
					28,
					-71
				],
				[
					84,
					-12
				],
				[
					-12,
					-92
				],
				[
					37,
					-163
				],
				[
					77,
					23
				],
				[
					115,
					-63
				],
				[
					13,
					-46
				],
				[
					106,
					-27
				],
				[
					74,
					53
				],
				[
					73,
					-60
				]
			],
			[
				[
					6842,
					6193
				],
				[
					-61,
					-34
				],
				[
					19,
					-84
				],
				[
					-135,
					-41
				],
				[
					-40,
					-61
				],
				[
					-75,
					6
				]
			],
			[
				[
					6550,
					5979
				],
				[
					-51,
					-29
				],
				[
					-65,
					-101
				],
				[
					-24,
					90
				],
				[
					-40,
					10
				],
				[
					-38,
					-69
				],
				[
					30,
					-66
				],
				[
					-91,
					32
				],
				[
					-144,
					-18
				],
				[
					-40,
					64
				],
				[
					-115,
					49
				],
				[
					-85,
					-13
				],
				[
					-14,
					72
				],
				[
					-64,
					-24
				]
			],
			[
				[
					5809,
					5976
				],
				[
					-52,
					19
				]
			],
			[
				[
					5938,
					6679
				],
				[
					25,
					16
				]
			],
			[
				[
					5963,
					6695
				],
				[
					62,
					-46
				],
				[
					-2,
					44
				]
			],
			[
				[
					6023,
					6693
				],
				[
					1,
					0
				]
			],
			[
				[
					6024,
					6693
				],
				[
					76,
					-11
				]
			],
			[
				[
					6913,
					6673
				],
				[
					46,
					-156
				],
				[
					97,
					-49
				],
				[
					-23,
					-167
				],
				[
					58,
					-54
				],
				[
					-33,
					-86
				]
			],
			[
				[
					7058,
					6161
				],
				[
					-101,
					43
				],
				[
					-71,
					-35
				],
				[
					-15,
					65
				],
				[
					-29,
					-41
				]
			],
			[
				[
					6247,
					6651
				],
				[
					43,
					91
				],
				[
					-69,
					34
				]
			],
			[
				[
					7058,
					6161
				],
				[
					-18,
					-129
				],
				[
					-83,
					-83
				],
				[
					45,
					-58
				],
				[
					8,
					-70
				],
				[
					63,
					-67
				],
				[
					21,
					-111
				],
				[
					-25,
					-29
				]
			],
			[
				[
					7069,
					5614
				],
				[
					-96,
					-41
				],
				[
					-32,
					41
				],
				[
					-97,
					-51
				]
			],
			[
				[
					6844,
					5563
				],
				[
					-84,
					-31
				],
				[
					-143,
					29
				]
			],
			[
				[
					6617,
					5561
				],
				[
					-14,
					44
				],
				[
					50,
					56
				],
				[
					-93,
					74
				],
				[
					37,
					86
				],
				[
					-47,
					158
				]
			],
			[
				[
					6617,
					5561
				],
				[
					-45,
					-25
				],
				[
					-85,
					-194
				],
				[
					-35,
					32
				],
				[
					-97,
					-27
				]
			],
			[
				[
					6355,
					5347
				],
				[
					-77,
					-20
				],
				[
					-156,
					11
				],
				[
					-112,
					110
				],
				[
					-93,
					-57
				],
				[
					-60,
					-7
				]
			],
			[
				[
					5857,
					5384
				],
				[
					-21,
					84
				],
				[
					19,
					72
				],
				[
					-37,
					88
				],
				[
					-88,
					72
				]
			],
			[
				[
					5730,
					5700
				],
				[
					108,
					89
				],
				[
					-31,
					66
				],
				[
					2,
					121
				]
			],
			[
				[
					5028,
					6818
				],
				[
					-75,
					44
				],
				[
					-93,
					-32
				],
				[
					33,
					-69
				],
				[
					-51,
					-115
				],
				[
					-69,
					-55
				],
				[
					-9,
					90
				],
				[
					-97,
					12
				],
				[
					-15,
					64
				],
				[
					-90,
					-1
				],
				[
					-19,
					-63
				],
				[
					-92,
					-30
				],
				[
					-52,
					57
				],
				[
					-183,
					4
				],
				[
					-115,
					82
				]
			],
			[
				[
					5112,
					6294
				],
				[
					-78,
					-35
				],
				[
					-83,
					-2
				],
				[
					-55,
					-59
				],
				[
					-91,
					-36
				]
			],
			[
				[
					4805,
					6162
				],
				[
					-46,
					79
				],
				[
					-89,
					48
				],
				[
					-38,
					167
				],
				[
					-84,
					-69
				],
				[
					-39,
					-140
				],
				[
					63,
					3
				],
				[
					3,
					-131
				]
			],
			[
				[
					4575,
					6119
				],
				[
					-75,
					-9
				],
				[
					-74,
					55
				],
				[
					-57,
					-55
				],
				[
					-3,
					-80
				]
			],
			[
				[
					4366,
					6030
				],
				[
					-65,
					-3
				],
				[
					-79,
					54
				],
				[
					-5,
					77
				],
				[
					-68,
					50
				],
				[
					-83,
					25
				]
			],
			[
				[
					4366,
					6030
				],
				[
					47,
					-82
				],
				[
					52,
					16
				],
				[
					13,
					-70
				],
				[
					107,
					-65
				],
				[
					-4,
					-72
				]
			],
			[
				[
					4581,
					5757
				],
				[
					-73,
					-4
				],
				[
					-17,
					37
				],
				[
					-77,
					17
				],
				[
					-4,
					-40
				],
				[
					-130,
					-74
				],
				[
					1,
					-59
				],
				[
					-86,
					-39
				],
				[
					-80,
					75
				],
				[
					-88,
					-11
				]
			],
			[
				[
					4027,
					5659
				],
				[
					-121,
					43
				],
				[
					-50,
					-9
				]
			],
			[
				[
					4805,
					6162
				],
				[
					-6,
					-31
				],
				[
					101,
					-115
				],
				[
					-58,
					-12
				],
				[
					-64,
					-57
				],
				[
					-24,
					45
				],
				[
					-91,
					0
				],
				[
					-10,
					76
				],
				[
					-62,
					2
				],
				[
					-16,
					49
				]
			],
			[
				[
					5730,
					5700
				],
				[
					-32,
					22
				],
				[
					-78,
					-26
				],
				[
					-56,
					53
				],
				[
					-63,
					-50
				],
				[
					-60,
					21
				],
				[
					-32,
					-55
				],
				[
					-55,
					7
				]
			],
			[
				[
					5354,
					5672
				],
				[
					-5,
					54
				],
				[
					-45,
					-9
				],
				[
					-33,
					55
				],
				[
					-101,
					-24
				],
				[
					-48,
					121
				],
				[
					-49,
					-27
				],
				[
					-85,
					33
				],
				[
					18,
					110
				],
				[
					-17,
					41
				],
				[
					68,
					83
				],
				[
					59,
					11
				],
				[
					75,
					98
				]
			],
			[
				[
					5354,
					5672
				],
				[
					-123,
					-57
				],
				[
					-62,
					6
				],
				[
					-92,
					-34
				],
				[
					-27,
					-38
				]
			],
			[
				[
					5050,
					5549
				],
				[
					-27,
					65
				],
				[
					-95,
					4
				],
				[
					-5,
					77
				],
				[
					-33,
					4
				]
			],
			[
				[
					4890,
					5699
				],
				[
					-106,
					37
				],
				[
					-96,
					-60
				],
				[
					-112,
					46
				],
				[
					5,
					35
				]
			],
			[
				[
					5050,
					5549
				],
				[
					3,
					-60
				],
				[
					-43,
					-29
				],
				[
					20,
					-69
				]
			],
			[
				[
					5030,
					5391
				],
				[
					-112,
					19
				],
				[
					-64,
					-23
				],
				[
					-18,
					41
				]
			],
			[
				[
					4836,
					5428
				],
				[
					-58,
					99
				],
				[
					46,
					141
				],
				[
					66,
					31
				]
			],
			[
				[
					5030,
					5391
				],
				[
					16,
					-101
				]
			],
			[
				[
					5046,
					5290
				],
				[
					-37,
					-17
				],
				[
					52,
					-177
				],
				[
					-13,
					-54
				],
				[
					70,
					-66
				]
			],
			[
				[
					5118,
					4976
				],
				[
					-25,
					-70
				],
				[
					31,
					-25
				],
				[
					-61,
					-105
				],
				[
					-102,
					50
				],
				[
					-53,
					-9
				]
			],
			[
				[
					4908,
					4817
				],
				[
					-32,
					58
				],
				[
					-84,
					57
				],
				[
					-82,
					-17
				],
				[
					-60,
					56
				]
			],
			[
				[
					4650,
					4971
				],
				[
					-100,
					41
				],
				[
					-69,
					-22
				],
				[
					-27,
					58
				],
				[
					14,
					60
				],
				[
					-83,
					37
				],
				[
					16,
					32
				]
			],
			[
				[
					4401,
					5177
				],
				[
					71,
					64
				]
			],
			[
				[
					4472,
					5241
				],
				[
					72,
					-21
				],
				[
					52,
					35
				],
				[
					56,
					-51
				],
				[
					46,
					20
				],
				[
					24,
					-45
				],
				[
					48,
					110
				],
				[
					41,
					16
				],
				[
					46,
					-63
				],
				[
					67,
					67
				],
				[
					-37,
					57
				],
				[
					-59,
					-46
				],
				[
					8,
					108
				]
			],
			[
				[
					4472,
					5241
				],
				[
					-59,
					65
				],
				[
					-2,
					47
				],
				[
					-61,
					38
				],
				[
					-134,
					-11
				],
				[
					-65,
					35
				],
				[
					-83,
					5
				],
				[
					-15,
					137
				],
				[
					-43,
					26
				],
				[
					17,
					76
				]
			],
			[
				[
					5929,
					6874
				],
				[
					70,
					24
				]
			],
			[
				[
					5999,
					6898
				],
				[
					21,
					-52
				]
			],
			[
				[
					6020,
					6846
				],
				[
					1,
					0
				]
			],
			[
				[
					6021,
					6846
				],
				[
					-37,
					-37
				]
			],
			[
				[
					5984,
					6809
				],
				[
					-23,
					7
				]
			],
			[
				[
					5961,
					6816
				],
				[
					-19,
					21
				]
			],
			[
				[
					5942,
					6837
				],
				[
					-13,
					37
				]
			],
			[
				[
					6092,
					6936
				],
				[
					0,
					0
				],
				[
					-3,
					-2
				],
				[
					-10,
					-7
				],
				[
					-7,
					-8
				],
				[
					11,
					-36
				],
				[
					-21,
					-23
				]
			],
			[
				[
					6062,
					6860
				],
				[
					-41,
					-14
				]
			],
			[
				[
					6021,
					6846
				],
				[
					-1,
					0
				]
			],
			[
				[
					5999,
					6898
				],
				[
					-33,
					29
				],
				[
					23,
					23
				],
				[
					-1,
					9
				],
				[
					-3,
					8
				],
				[
					-3,
					5
				],
				[
					0,
					1
				],
				[
					0,
					0
				],
				[
					0,
					0
				],
				[
					0,
					1
				]
			],
			[
				[
					6087,
					6947
				],
				[
					5,
					-11
				]
			],
			[
				[
					5929,
					6874
				],
				[
					-67,
					50
				]
			],
			[
				[
					5981,
					6974
				],
				[
					1,
					0
				]
			],
			[
				[
					5942,
					6837
				],
				[
					-76,
					7
				],
				[
					-27,
					-71
				]
			],
			[
				[
					5839,
					6773
				],
				[
					-52,
					-42
				]
			],
			[
				[
					5787,
					6731
				],
				[
					-3,
					3
				]
			],
			[
				[
					5944,
					6767
				],
				[
					19,
					-72
				]
			],
			[
				[
					5787,
					6730
				],
				[
					0,
					1
				]
			],
			[
				[
					5839,
					6773
				],
				[
					1,
					0
				]
			],
			[
				[
					5840,
					6773
				],
				[
					104,
					-6
				]
			],
			[
				[
					5961,
					6816
				],
				[
					-17,
					-49
				]
			],
			[
				[
					5840,
					6773
				],
				[
					-1,
					0
				]
			],
			[
				[
					6014,
					6792
				],
				[
					10,
					-99
				]
			],
			[
				[
					6024,
					6693
				],
				[
					-1,
					0
				]
			],
			[
				[
					5984,
					6809
				],
				[
					30,
					-17
				]
			],
			[
				[
					6040,
					6797
				],
				[
					60,
					-115
				]
			],
			[
				[
					6014,
					6792
				],
				[
					26,
					5
				]
			],
			[
				[
					6080,
					6794
				],
				[
					-40,
					3
				]
			],
			[
				[
					6062,
					6860
				],
				[
					-1,
					-1
				]
			],
			[
				[
					6061,
					6859
				],
				[
					19,
					-65
				]
			],
			[
				[
					6080,
					6794
				],
				[
					49,
					-18
				]
			],
			[
				[
					6129,
					6776
				],
				[
					1,
					0
				]
			],
			[
				[
					6130,
					6776
				],
				[
					27,
					9
				],
				[
					13,
					-10
				],
				[
					4,
					0
				],
				[
					0,
					-3
				],
				[
					2,
					0
				],
				[
					1,
					0
				]
			],
			[
				[
					6177,
					6772
				],
				[
					3,
					-1
				]
			],
			[
				[
					6102,
					6682
				],
				[
					-2,
					0
				]
			],
			[
				[
					6129,
					6776
				],
				[
					-26,
					52
				],
				[
					39,
					78
				]
			],
			[
				[
					6130,
					6776
				],
				[
					-1,
					0
				]
			],
			[
				[
					6061,
					6859
				],
				[
					1,
					1
				]
			],
			[
				[
					6092,
					6936
				],
				[
					2,
					-6
				]
			],
			[
				[
					153,
					4663
				],
				[
					15,
					-55
				],
				[
					90,
					-1
				],
				[
					3,
					-187
				]
			],
			[
				[
					261,
					4420
				],
				[
					-59,
					72
				],
				[
					-60,
					11
				],
				[
					-55,
					91
				],
				[
					66,
					69
				]
			],
			[
				[
					439,
					4348
				],
				[
					-41,
					-62
				],
				[
					4,
					-56
				],
				[
					-44,
					-28
				]
			],
			[
				[
					358,
					4202
				],
				[
					-71,
					-4
				],
				[
					-23,
					48
				],
				[
					54,
					146
				],
				[
					-57,
					28
				]
			],
			[
				[
					153,
					4663
				],
				[
					23,
					81
				]
			],
			[
				[
					176,
					4744
				],
				[
					41,
					-20
				],
				[
					45,
					68
				]
			],
			[
				[
					262,
					4792
				],
				[
					4,
					-62
				],
				[
					43,
					-53
				],
				[
					33,
					28
				],
				[
					46,
					-123
				],
				[
					-53,
					-134
				],
				[
					37,
					-45
				],
				[
					35,
					23
				],
				[
					32,
					-78
				]
			],
			[
				[
					340,
					5085
				],
				[
					54,
					-104
				],
				[
					67,
					-7
				]
			],
			[
				[
					461,
					4974
				],
				[
					12,
					-61
				]
			],
			[
				[
					473,
					4913
				],
				[
					-139,
					-42
				],
				[
					-72,
					-79
				]
			],
			[
				[
					176,
					4744
				],
				[
					-55,
					27
				],
				[
					7,
					64
				],
				[
					-97,
					-11
				],
				[
					-31,
					99
				],
				[
					73,
					-21
				],
				[
					32,
					65
				],
				[
					142,
					96
				],
				[
					-1,
					34
				]
			],
			[
				[
					246,
					5097
				],
				[
					94,
					-12
				]
			],
			[
				[
					473,
					4913
				],
				[
					17,
					-12
				]
			],
			[
				[
					490,
					4901
				],
				[
					-17,
					-14
				],
				[
					48,
					-166
				],
				[
					83,
					-96
				],
				[
					50,
					18
				]
			],
			[
				[
					654,
					4643
				],
				[
					11,
					-136
				],
				[
					-56,
					1
				],
				[
					-36,
					-43
				],
				[
					-19,
					-124
				],
				[
					-115,
					7
				]
			],
			[
				[
					724,
					4941
				],
				[
					52,
					-47
				],
				[
					-1,
					-61
				]
			],
			[
				[
					775,
					4833
				],
				[
					-8,
					-9
				]
			],
			[
				[
					767,
					4824
				],
				[
					23,
					-92
				],
				[
					49,
					-16
				],
				[
					1,
					-49
				]
			],
			[
				[
					840,
					4667
				],
				[
					-186,
					-24
				]
			],
			[
				[
					490,
					4901
				],
				[
					37,
					32
				]
			],
			[
				[
					527,
					4933
				],
				[
					41,
					-53
				],
				[
					109,
					-4
				],
				[
					47,
					65
				]
			],
			[
				[
					840,
					4667
				],
				[
					49,
					-17
				]
			],
			[
				[
					889,
					4650
				],
				[
					39,
					-53
				]
			],
			[
				[
					928,
					4597
				],
				[
					-127,
					-13
				],
				[
					36,
					-73
				],
				[
					-49,
					-55
				],
				[
					49,
					-82
				],
				[
					-25,
					-37
				],
				[
					35,
					-55
				]
			],
			[
				[
					847,
					4282
				],
				[
					-58,
					-136
				],
				[
					-44,
					48
				],
				[
					-45,
					-65
				],
				[
					45,
					-103
				]
			],
			[
				[
					745,
					4026
				],
				[
					-81,
					-34
				],
				[
					-76,
					68
				],
				[
					-95,
					-65
				],
				[
					-79,
					60
				],
				[
					16,
					-79
				]
			],
			[
				[
					430,
					3976
				],
				[
					-50,
					73
				],
				[
					23,
					99
				],
				[
					-45,
					54
				]
			],
			[
				[
					973,
					4802
				],
				[
					47,
					-17
				],
				[
					13,
					-101
				]
			],
			[
				[
					1033,
					4684
				],
				[
					-57,
					-44
				],
				[
					-85,
					14
				]
			],
			[
				[
					891,
					4654
				],
				[
					51,
					41
				],
				[
					-98,
					83
				]
			],
			[
				[
					844,
					4778
				],
				[
					41,
					19
				]
			],
			[
				[
					885,
					4797
				],
				[
					88,
					5
				]
			],
			[
				[
					891,
					4654
				],
				[
					-2,
					-4
				]
			],
			[
				[
					767,
					4824
				],
				[
					3,
					4
				]
			],
			[
				[
					770,
					4828
				],
				[
					3,
					-3
				],
				[
					1,
					1
				],
				[
					3,
					-3
				],
				[
					9,
					5
				],
				[
					19,
					-39
				],
				[
					39,
					-11
				]
			],
			[
				[
					770,
					4828
				],
				[
					5,
					5
				]
			],
			[
				[
					724,
					4941
				],
				[
					63,
					26
				]
			],
			[
				[
					787,
					4967
				],
				[
					36,
					-26
				]
			],
			[
				[
					823,
					4941
				],
				[
					60,
					-55
				],
				[
					2,
					-89
				]
			],
			[
				[
					1072,
					4400
				],
				[
					-12,
					-8
				]
			],
			[
				[
					1060,
					4392
				],
				[
					-134,
					15
				],
				[
					7,
					134
				],
				[
					23,
					19
				]
			],
			[
				[
					956,
					4560
				],
				[
					48,
					3
				]
			],
			[
				[
					1004,
					4563
				],
				[
					67,
					-49
				],
				[
					-33,
					-43
				],
				[
					34,
					-71
				]
			],
			[
				[
					1431,
					4623
				],
				[
					12,
					-54
				],
				[
					-156,
					-79
				],
				[
					-98,
					-27
				]
			],
			[
				[
					1189,
					4463
				],
				[
					-91,
					57
				],
				[
					2,
					55
				],
				[
					-56,
					22
				],
				[
					-40,
					-34
				]
			],
			[
				[
					956,
					4560
				],
				[
					-28,
					37
				]
			],
			[
				[
					1033,
					4684
				],
				[
					70,
					79
				],
				[
					77,
					-20
				],
				[
					42,
					48
				]
			],
			[
				[
					1222,
					4791
				],
				[
					64,
					-50
				],
				[
					-14,
					-39
				],
				[
					69,
					-66
				],
				[
					90,
					-13
				]
			],
			[
				[
					1189,
					4463
				],
				[
					-19,
					-77
				],
				[
					-96,
					-20
				]
			],
			[
				[
					1074,
					4366
				],
				[
					-2,
					34
				]
			],
			[
				[
					1060,
					4392
				],
				[
					-38,
					-56
				],
				[
					-73,
					8
				],
				[
					-46,
					-54
				],
				[
					-56,
					-8
				]
			],
			[
				[
					1250,
					5136
				],
				[
					-11,
					-34
				],
				[
					77,
					-114
				],
				[
					52,
					8
				],
				[
					36,
					-50
				],
				[
					52,
					23
				],
				[
					27,
					-115
				],
				[
					48,
					-75
				]
			],
			[
				[
					1531,
					4779
				],
				[
					-22,
					-126
				],
				[
					-78,
					-30
				]
			],
			[
				[
					1222,
					4791
				],
				[
					-116,
					48
				],
				[
					63,
					106
				],
				[
					-46,
					20
				],
				[
					-5,
					81
				]
			],
			[
				[
					1118,
					5046
				],
				[
					22,
					78
				]
			],
			[
				[
					1140,
					5124
				],
				[
					9,
					44
				]
			],
			[
				[
					1149,
					5168
				],
				[
					66,
					10
				],
				[
					35,
					-42
				]
			],
			[
				[
					973,
					4802
				],
				[
					-20,
					72
				],
				[
					44,
					65
				],
				[
					-34,
					44
				],
				[
					-66,
					-7
				]
			],
			[
				[
					897,
					4976
				],
				[
					5,
					34
				]
			],
			[
				[
					902,
					5010
				],
				[
					135,
					47
				],
				[
					81,
					-11
				]
			],
			[
				[
					823,
					4941
				],
				[
					74,
					35
				]
			],
			[
				[
					942,
					5127
				],
				[
					-4,
					62
				]
			],
			[
				[
					938,
					5189
				],
				[
					100,
					75
				]
			],
			[
				[
					1038,
					5264
				],
				[
					75,
					-11
				]
			],
			[
				[
					1113,
					5253
				],
				[
					36,
					-85
				]
			],
			[
				[
					1140,
					5124
				],
				[
					-47,
					58
				],
				[
					-151,
					-55
				]
			],
			[
				[
					902,
					5010
				],
				[
					-37,
					38
				],
				[
					77,
					79
				]
			],
			[
				[
					787,
					4967
				],
				[
					2,
					54
				]
			],
			[
				[
					789,
					5021
				],
				[
					56,
					14
				],
				[
					-39,
					102
				]
			],
			[
				[
					806,
					5137
				],
				[
					-2,
					4
				]
			],
			[
				[
					804,
					5141
				],
				[
					49,
					75
				]
			],
			[
				[
					853,
					5216
				],
				[
					38,
					25
				],
				[
					47,
					-52
				]
			],
			[
				[
					853,
					5216
				],
				[
					-108,
					4
				],
				[
					4,
					91
				]
			],
			[
				[
					749,
					5311
				],
				[
					20,
					5
				]
			],
			[
				[
					769,
					5316
				],
				[
					59,
					19
				]
			],
			[
				[
					828,
					5335
				],
				[
					48,
					-26
				],
				[
					122,
					43
				]
			],
			[
				[
					998,
					5352
				],
				[
					40,
					-88
				]
			],
			[
				[
					804,
					5141
				],
				[
					-1,
					-1
				],
				[
					-3,
					0
				],
				[
					-7,
					-2
				],
				[
					-3,
					0
				],
				[
					-2,
					5
				],
				[
					-24,
					5
				],
				[
					-7,
					-16
				],
				[
					-12,
					18
				],
				[
					-61,
					1
				]
			],
			[
				[
					684,
					5151
				],
				[
					-23,
					11
				]
			],
			[
				[
					661,
					5162
				],
				[
					26,
					29
				],
				[
					-10,
					100
				]
			],
			[
				[
					677,
					5291
				],
				[
					72,
					20
				]
			],
			[
				[
					804,
					5141
				],
				[
					2,
					-4
				]
			],
			[
				[
					789,
					5021
				],
				[
					-98,
					78
				],
				[
					-7,
					52
				]
			],
			[
				[
					527,
					4933
				],
				[
					-6,
					35
				],
				[
					70,
					73
				],
				[
					27,
					115
				],
				[
					43,
					6
				]
			],
			[
				[
					523,
					5151
				],
				[
					-26,
					2
				],
				[
					3,
					-101
				],
				[
					-39,
					-78
				]
			],
			[
				[
					340,
					5085
				],
				[
					30,
					64
				],
				[
					64,
					-7
				],
				[
					38,
					38
				],
				[
					51,
					-29
				]
			],
			[
				[
					523,
					5151
				],
				[
					63,
					22
				],
				[
					-13,
					58
				],
				[
					-68,
					2
				],
				[
					12,
					60
				]
			],
			[
				[
					517,
					5293
				],
				[
					-4,
					6
				]
			],
			[
				[
					513,
					5299
				],
				[
					93,
					-6
				],
				[
					2,
					63
				],
				[
					-2,
					8
				],
				[
					4,
					1
				],
				[
					1,
					0
				],
				[
					3,
					1
				]
			],
			[
				[
					614,
					5366
				],
				[
					0,
					-2
				]
			],
			[
				[
					614,
					5364
				],
				[
					63,
					-73
				]
			],
			[
				[
					513,
					5300
				],
				[
					4,
					-7
				]
			],
			[
				[
					246,
					5097
				],
				[
					-74,
					-17
				],
				[
					-7,
					93
				],
				[
					121,
					159
				]
			],
			[
				[
					286,
					5332
				],
				[
					76,
					-1
				],
				[
					62,
					64
				],
				[
					95,
					15
				]
			],
			[
				[
					519,
					5410
				],
				[
					-31,
					-50
				],
				[
					25,
					-60
				]
			],
			[
				[
					432,
					5935
				],
				[
					66,
					-22
				]
			],
			[
				[
					498,
					5913
				],
				[
					35,
					-60
				],
				[
					-41,
					-16
				],
				[
					-18,
					-66
				],
				[
					-42,
					24
				],
				[
					-43,
					-98
				],
				[
					-42,
					-31
				],
				[
					61,
					-72
				],
				[
					96,
					1
				],
				[
					-40,
					-49
				],
				[
					39,
					-70
				]
			],
			[
				[
					503,
					5476
				],
				[
					16,
					-66
				]
			],
			[
				[
					286,
					5332
				],
				[
					-16,
					45
				],
				[
					6,
					148
				],
				[
					-97,
					121
				],
				[
					22,
					65
				],
				[
					-65,
					22
				],
				[
					7,
					57
				],
				[
					-75,
					42
				],
				[
					31,
					23
				],
				[
					-36,
					63
				],
				[
					88,
					49
				],
				[
					88,
					-15
				],
				[
					-42,
					67
				],
				[
					35,
					17
				],
				[
					46,
					-49
				],
				[
					67,
					0
				],
				[
					87,
					-52
				]
			],
			[
				[
					833,
					5828
				],
				[
					22,
					-35
				],
				[
					-69,
					-146
				]
			],
			[
				[
					786,
					5647
				],
				[
					-132,
					-61
				]
			],
			[
				[
					654,
					5586
				],
				[
					11,
					-46
				],
				[
					-57,
					-27
				]
			],
			[
				[
					608,
					5513
				],
				[
					-105,
					-37
				]
			],
			[
				[
					498,
					5913
				],
				[
					62,
					-28
				],
				[
					151,
					-17
				],
				[
					80,
					-62
				],
				[
					42,
					22
				]
			],
			[
				[
					608,
					5513
				],
				[
					36,
					-92
				]
			],
			[
				[
					644,
					5421
				],
				[
					-30,
					-52
				]
			],
			[
				[
					614,
					5369
				],
				[
					0,
					-3
				]
			],
			[
				[
					513,
					5299
				],
				[
					0,
					1
				]
			],
			[
				[
					759,
					5420
				],
				[
					0,
					-9
				]
			],
			[
				[
					759,
					5411
				],
				[
					10,
					-95
				]
			],
			[
				[
					614,
					5364
				],
				[
					0,
					5
				]
			],
			[
				[
					644,
					5421
				],
				[
					83,
					20
				],
				[
					-1,
					-23
				],
				[
					12,
					2
				],
				[
					18,
					0
				],
				[
					3,
					0
				]
			],
			[
				[
					654,
					5586
				],
				[
					107,
					-69
				],
				[
					-8,
					-67
				]
			],
			[
				[
					753,
					5450
				],
				[
					6,
					-29
				]
			],
			[
				[
					759,
					5421
				],
				[
					0,
					-1
				]
			],
			[
				[
					847,
					5505
				],
				[
					-94,
					-55
				]
			],
			[
				[
					786,
					5647
				],
				[
					-15,
					-35
				],
				[
					76,
					-107
				]
			],
			[
				[
					891,
					5468
				],
				[
					-63,
					-133
				]
			],
			[
				[
					759,
					5411
				],
				[
					0,
					10
				]
			],
			[
				[
					847,
					5505
				],
				[
					37,
					9
				]
			],
			[
				[
					884,
					5514
				],
				[
					2,
					0
				]
			],
			[
				[
					886,
					5514
				],
				[
					0,
					0
				],
				[
					2,
					-3
				],
				[
					0,
					-26
				],
				[
					8,
					-12
				],
				[
					-5,
					-5
				]
			],
			[
				[
					886,
					5514
				],
				[
					26,
					37
				]
			],
			[
				[
					912,
					5551
				],
				[
					75,
					-68
				]
			],
			[
				[
					987,
					5483
				],
				[
					16,
					-64
				]
			],
			[
				[
					1003,
					5419
				],
				[
					0,
					-1
				]
			],
			[
				[
					1003,
					5418
				],
				[
					-99,
					13
				],
				[
					-13,
					36
				]
			],
			[
				[
					891,
					5467
				],
				[
					0,
					1
				]
			],
			[
				[
					1003,
					5418
				],
				[
					10,
					-6
				]
			],
			[
				[
					1013,
					5412
				],
				[
					-15,
					-60
				]
			],
			[
				[
					891,
					5468
				],
				[
					0,
					-1
				]
			],
			[
				[
					1237,
					5637
				],
				[
					-63,
					-29
				],
				[
					20,
					-61
				],
				[
					-39,
					-10
				]
			],
			[
				[
					1155,
					5537
				],
				[
					-25,
					45
				],
				[
					-83,
					-5
				]
			],
			[
				[
					1047,
					5577
				],
				[
					-18,
					95
				],
				[
					40,
					31
				],
				[
					78,
					-44
				],
				[
					90,
					60
				]
			],
			[
				[
					1237,
					5719
				],
				[
					34,
					-60
				],
				[
					-34,
					-22
				]
			],
			[
				[
					1231,
					5722
				],
				[
					6,
					-3
				]
			],
			[
				[
					1047,
					5577
				],
				[
					-27,
					-1
				]
			],
			[
				[
					1020,
					5576
				],
				[
					-90,
					102
				]
			],
			[
				[
					930,
					5678
				],
				[
					-9,
					51
				],
				[
					46,
					57
				],
				[
					-3,
					83
				]
			],
			[
				[
					964,
					5869
				],
				[
					78,
					58
				]
			],
			[
				[
					1042,
					5927
				],
				[
					73,
					-37
				],
				[
					27,
					-113
				],
				[
					89,
					-55
				]
			],
			[
				[
					1020,
					5576
				],
				[
					-5,
					-60
				]
			],
			[
				[
					1015,
					5516
				],
				[
					-28,
					-33
				]
			],
			[
				[
					912,
					5551
				],
				[
					-13,
					116
				],
				[
					31,
					11
				]
			],
			[
				[
					1267,
					6345
				],
				[
					-30,
					-79
				],
				[
					-184,
					-44
				],
				[
					-106,
					-58
				]
			],
			[
				[
					947,
					6164
				],
				[
					-81,
					28
				],
				[
					-62,
					73
				],
				[
					-6,
					61
				]
			],
			[
				[
					798,
					6326
				],
				[
					94,
					126
				],
				[
					65,
					21
				]
			],
			[
				[
					1274,
					6605
				],
				[
					79,
					-87
				],
				[
					19,
					-60
				],
				[
					-121,
					-51
				],
				[
					16,
					-62
				]
			],
			[
				[
					886,
					5514
				],
				[
					-2,
					0
				]
			],
			[
				[
					833,
					5828
				],
				[
					5,
					41
				],
				[
					82,
					30
				],
				[
					44,
					-30
				]
			],
			[
				[
					947,
					6164
				],
				[
					26,
					-32
				],
				[
					-24,
					-110
				],
				[
					21,
					-52
				],
				[
					72,
					-43
				]
			],
			[
				[
					432,
					5935
				],
				[
					-13,
					60
				],
				[
					65,
					-26
				],
				[
					161,
					80
				],
				[
					37,
					-25
				],
				[
					85,
					88
				],
				[
					-1,
					39
				],
				[
					-111,
					60
				],
				[
					58,
					103
				],
				[
					85,
					12
				]
			],
			[
				[
					1346,
					6214
				],
				[
					-61,
					-114
				],
				[
					26,
					-80
				],
				[
					82,
					-69
				]
			],
			[
				[
					1393,
					5951
				],
				[
					40,
					-20
				],
				[
					58,
					-114
				]
			],
			[
				[
					1491,
					5817
				],
				[
					-155,
					-69
				],
				[
					-59,
					68
				],
				[
					-46,
					-94
				]
			],
			[
				[
					1267,
					6345
				],
				[
					55,
					-15
				],
				[
					24,
					-116
				]
			],
			[
				[
					1610,
					6267
				],
				[
					-99,
					18
				],
				[
					-45,
					-81
				]
			],
			[
				[
					1466,
					6204
				],
				[
					-84,
					33
				],
				[
					-36,
					-23
				]
			],
			[
				[
					1466,
					6204
				],
				[
					43,
					-178
				],
				[
					-57,
					6
				],
				[
					-59,
					-81
				]
			],
			[
				[
					1779,
					6233
				],
				[
					-17,
					-60
				],
				[
					78,
					-119
				],
				[
					-18,
					-28
				],
				[
					135,
					-224
				]
			],
			[
				[
					1957,
					5802
				],
				[
					-20,
					-64
				],
				[
					-80,
					-20
				],
				[
					13,
					46
				],
				[
					-194,
					33
				],
				[
					-19,
					-28
				]
			],
			[
				[
					1657,
					5769
				],
				[
					-88,
					53
				],
				[
					-78,
					-5
				]
			],
			[
				[
					1996,
					6308
				],
				[
					73,
					-125
				],
				[
					-26,
					-94
				],
				[
					103,
					-35
				]
			],
			[
				[
					2146,
					6054
				],
				[
					35,
					-85
				],
				[
					-147,
					-124
				],
				[
					-11,
					-51
				]
			],
			[
				[
					2023,
					5794
				],
				[
					-66,
					8
				]
			],
			[
				[
					2223,
					6237
				],
				[
					-5,
					-130
				],
				[
					-33,
					-43
				]
			],
			[
				[
					2185,
					6064
				],
				[
					-39,
					-10
				]
			],
			[
				[
					2029,
					6309
				],
				[
					86,
					-5
				],
				[
					108,
					-67
				]
			],
			[
				[
					2441,
					6399
				],
				[
					-28,
					-94
				],
				[
					-113,
					12
				],
				[
					-77,
					-80
				]
			],
			[
				[
					2073,
					6507
				],
				[
					138,
					-10
				],
				[
					36,
					-36
				],
				[
					60,
					54
				],
				[
					90,
					-32
				],
				[
					-34,
					-39
				],
				[
					78,
					-45
				]
			],
			[
				[
					2488,
					6412
				],
				[
					-47,
					-13
				]
			],
			[
				[
					2655,
					6111
				],
				[
					-61,
					-57
				],
				[
					-81,
					-26
				],
				[
					-44,
					106
				],
				[
					-60,
					21
				],
				[
					-101,
					-98
				],
				[
					-61,
					-8
				]
			],
			[
				[
					2247,
					6049
				],
				[
					-62,
					15
				]
			],
			[
				[
					2850,
					5704
				],
				[
					-82,
					-47
				],
				[
					24,
					-27
				],
				[
					-47,
					-106
				],
				[
					-117,
					-89
				],
				[
					-47,
					-1
				],
				[
					-8,
					67
				],
				[
					-97,
					16
				]
			],
			[
				[
					2476,
					5517
				],
				[
					-52,
					32
				]
			],
			[
				[
					2424,
					5549
				],
				[
					89,
					57
				],
				[
					-31,
					59
				],
				[
					5,
					184
				],
				[
					-60,
					65
				],
				[
					-95,
					-18
				],
				[
					-85,
					153
				]
			],
			[
				[
					2424,
					5549
				],
				[
					-73,
					10
				],
				[
					18,
					-50
				],
				[
					-55,
					-70
				],
				[
					-92,
					44
				],
				[
					-83,
					-17
				]
			],
			[
				[
					2139,
					5466
				],
				[
					-57,
					104
				],
				[
					12,
					53
				],
				[
					75,
					35
				],
				[
					-14,
					56
				],
				[
					-132,
					80
				]
			],
			[
				[
					1373,
					5365
				],
				[
					-4,
					-123
				]
			],
			[
				[
					1369,
					5242
				],
				[
					-119,
					-106
				]
			],
			[
				[
					1113,
					5253
				],
				[
					55,
					81
				],
				[
					50,
					-16
				],
				[
					57,
					81
				]
			],
			[
				[
					1275,
					5399
				],
				[
					35,
					2
				]
			],
			[
				[
					1310,
					5401
				],
				[
					63,
					-36
				]
			],
			[
				[
					1277,
					5423
				],
				[
					1,
					-1
				]
			],
			[
				[
					1278,
					5422
				],
				[
					-3,
					-23
				]
			],
			[
				[
					1013,
					5412
				],
				[
					93,
					-17
				],
				[
					27,
					53
				]
			],
			[
				[
					1133,
					5448
				],
				[
					8,
					4
				]
			],
			[
				[
					1141,
					5452
				],
				[
					41,
					33
				]
			],
			[
				[
					1182,
					5485
				],
				[
					60,
					-64
				],
				[
					35,
					2
				]
			],
			[
				[
					1135,
					5449
				],
				[
					-2,
					-1
				]
			],
			[
				[
					1003,
					5418
				],
				[
					0,
					1
				]
			],
			[
				[
					1015,
					5516
				],
				[
					89,
					-1
				],
				[
					31,
					-66
				]
			],
			[
				[
					1155,
					5537
				],
				[
					27,
					-52
				]
			],
			[
				[
					1141,
					5452
				],
				[
					-6,
					-3
				]
			],
			[
				[
					1253,
					5616
				],
				[
					-1,
					-2
				],
				[
					-3,
					0
				],
				[
					-2,
					-5
				],
				[
					-7,
					0
				],
				[
					12,
					-34
				],
				[
					-11,
					-26
				],
				[
					67,
					-7
				],
				[
					-31,
					-119
				]
			],
			[
				[
					1237,
					5637
				],
				[
					8,
					-17
				]
			],
			[
				[
					1245,
					5620
				],
				[
					8,
					-4
				]
			],
			[
				[
					1253,
					5616
				],
				[
					7,
					-2
				]
			],
			[
				[
					1260,
					5614
				],
				[
					115,
					2
				]
			],
			[
				[
					1375,
					5616
				],
				[
					38,
					-72
				],
				[
					-103,
					-143
				]
			],
			[
				[
					1278,
					5422
				],
				[
					-1,
					1
				]
			],
			[
				[
					1564,
					5610
				],
				[
					8,
					-130
				]
			],
			[
				[
					1572,
					5480
				],
				[
					-110,
					-6
				],
				[
					-68,
					-35
				],
				[
					-21,
					-74
				]
			],
			[
				[
					1375,
					5616
				],
				[
					-18,
					61
				],
				[
					83,
					41
				],
				[
					13,
					-62
				],
				[
					98,
					9
				],
				[
					13,
					-55
				]
			],
			[
				[
					1657,
					5769
				],
				[
					-24,
					-136
				],
				[
					-69,
					-23
				]
			],
			[
				[
					1260,
					5614
				],
				[
					-15,
					6
				]
			],
			[
				[
					2139,
					5466
				],
				[
					-102,
					-75
				],
				[
					-97,
					-28
				],
				[
					-113,
					69
				],
				[
					-85,
					8
				],
				[
					-116,
					57
				],
				[
					-33,
					-43
				]
			],
			[
				[
					1593,
					5454
				],
				[
					-21,
					26
				]
			],
			[
				[
					2476,
					5517
				],
				[
					-64,
					-33
				],
				[
					46,
					-70
				],
				[
					-7,
					-50
				],
				[
					-191,
					-16
				],
				[
					-115,
					-130
				],
				[
					30,
					-39
				],
				[
					102,
					34
				],
				[
					21,
					-137
				],
				[
					-22,
					-70
				]
			],
			[
				[
					2276,
					5006
				],
				[
					-49,
					-25
				],
				[
					-88,
					8
				]
			],
			[
				[
					2139,
					4989
				],
				[
					-50,
					62
				],
				[
					-116,
					-74
				],
				[
					-81,
					16
				]
			],
			[
				[
					1892,
					4993
				],
				[
					-140,
					186
				],
				[
					-98,
					-17
				]
			],
			[
				[
					1654,
					5162
				],
				[
					-29,
					56
				],
				[
					25,
					55
				],
				[
					-57,
					181
				]
			],
			[
				[
					2139,
					4989
				],
				[
					-37,
					-29
				],
				[
					29,
					-78
				],
				[
					-48,
					-66
				]
			],
			[
				[
					2083,
					4816
				],
				[
					-98,
					-139
				]
			],
			[
				[
					1985,
					4677
				],
				[
					-68,
					25
				],
				[
					-115,
					-121
				],
				[
					33,
					-68
				],
				[
					-33,
					-65
				]
			],
			[
				[
					1802,
					4448
				],
				[
					-69,
					15
				]
			],
			[
				[
					1733,
					4463
				],
				[
					-56,
					99
				],
				[
					7,
					78
				],
				[
					-119,
					64
				],
				[
					18,
					56
				]
			],
			[
				[
					1583,
					4760
				],
				[
					48,
					-1
				],
				[
					31,
					131
				],
				[
					71,
					-26
				],
				[
					51,
					25
				],
				[
					54,
					-22
				],
				[
					59,
					62
				],
				[
					-5,
					64
				]
			],
			[
				[
					1369,
					5242
				],
				[
					56,
					-70
				],
				[
					49,
					3
				],
				[
					79,
					-70
				],
				[
					-5,
					-50
				],
				[
					107,
					46
				],
				[
					-1,
					61
				]
			],
			[
				[
					1583,
					4760
				],
				[
					-52,
					19
				]
			],
			[
				[
					5857,
					5384
				],
				[
					-22,
					-39
				],
				[
					27,
					-138
				],
				[
					-15,
					-50
				]
			],
			[
				[
					5847,
					5157
				],
				[
					-121,
					-22
				],
				[
					-96,
					6
				]
			],
			[
				[
					5630,
					5141
				],
				[
					0,
					67
				],
				[
					-43,
					40
				],
				[
					53,
					86
				],
				[
					3,
					56
				],
				[
					-123,
					77
				],
				[
					-113,
					-35
				],
				[
					1,
					-49
				],
				[
					-119,
					-57
				]
			],
			[
				[
					5289,
					5326
				],
				[
					-46,
					114
				],
				[
					-35,
					-39
				],
				[
					-103,
					2
				],
				[
					-19,
					-93
				]
			],
			[
				[
					5086,
					5310
				],
				[
					-40,
					-20
				]
			],
			[
				[
					5294,
					5252
				],
				[
					-1,
					1
				],
				[
					-2,
					0
				],
				[
					-1,
					7
				],
				[
					4,
					9
				],
				[
					-52,
					2
				],
				[
					-49,
					57
				],
				[
					-46,
					-54
				],
				[
					-49,
					20
				]
			],
			[
				[
					5098,
					5294
				],
				[
					-12,
					16
				]
			],
			[
				[
					5289,
					5326
				],
				[
					32,
					-71
				],
				[
					-27,
					-3
				]
			],
			[
				[
					5294,
					5252
				],
				[
					0,
					-1
				]
			],
			[
				[
					5294,
					5251
				],
				[
					-21,
					-59
				],
				[
					-102,
					51
				],
				[
					-30,
					-70
				],
				[
					-44,
					-6
				],
				[
					1,
					127
				]
			],
			[
				[
					5630,
					5141
				],
				[
					-61,
					-83
				],
				[
					32,
					-74
				]
			],
			[
				[
					5601,
					4984
				],
				[
					-115,
					11
				],
				[
					-23,
					-59
				],
				[
					12,
					-82
				],
				[
					-91,
					-22
				]
			],
			[
				[
					5384,
					4832
				],
				[
					-73,
					27
				],
				[
					-24,
					84
				],
				[
					-169,
					33
				]
			],
			[
				[
					5294,
					5251
				],
				[
					0,
					1
				]
			],
			[
				[
					6355,
					5347
				],
				[
					-30,
					-97
				],
				[
					19,
					-46
				],
				[
					-21,
					-90
				]
			],
			[
				[
					6323,
					5114
				],
				[
					-41,
					-27
				],
				[
					-45,
					-115
				],
				[
					-51,
					18
				],
				[
					-34,
					-49
				]
			],
			[
				[
					6152,
					4941
				],
				[
					-76,
					3
				],
				[
					-51,
					-43
				]
			],
			[
				[
					6025,
					4901
				],
				[
					-27,
					23
				],
				[
					-88,
					-27
				],
				[
					-19,
					171
				],
				[
					-44,
					89
				]
			],
			[
				[
					6878,
					4913
				],
				[
					-55,
					-31
				],
				[
					-83,
					46
				]
			],
			[
				[
					6740,
					4928
				],
				[
					-105,
					43
				],
				[
					-19,
					-27
				],
				[
					-92,
					23
				]
			],
			[
				[
					6524,
					4967
				],
				[
					-28,
					28
				],
				[
					80,
					55
				],
				[
					-147,
					23
				],
				[
					-4,
					47
				],
				[
					-102,
					-6
				]
			],
			[
				[
					6844,
					5563
				],
				[
					59,
					-143
				],
				[
					-51,
					-113
				],
				[
					60,
					4
				],
				[
					58,
					-54
				],
				[
					12,
					-100
				],
				[
					61,
					-65
				],
				[
					-111,
					-129
				],
				[
					-68,
					-15
				],
				[
					14,
					-35
				]
			],
			[
				[
					7069,
					5614
				],
				[
					4,
					-72
				],
				[
					169,
					-71
				],
				[
					21,
					-38
				],
				[
					-7,
					-105
				],
				[
					55,
					-88
				],
				[
					3,
					-65
				],
				[
					-35,
					-106
				],
				[
					-12,
					-112
				],
				[
					-66,
					-178
				],
				[
					-61,
					-72
				],
				[
					-16,
					-81
				],
				[
					-66,
					1
				],
				[
					-78,
					45
				],
				[
					25,
					96
				],
				[
					-71,
					-8
				],
				[
					30,
					80
				],
				[
					-86,
					73
				]
			],
			[
				[
					6740,
					4928
				],
				[
					-47,
					-87
				],
				[
					114,
					-84
				],
				[
					-11,
					-32
				],
				[
					-124,
					-15
				],
				[
					-7,
					-37
				],
				[
					-151,
					-70
				],
				[
					-35,
					19
				],
				[
					-69,
					-33
				],
				[
					-37,
					-86
				],
				[
					-164,
					3
				]
			],
			[
				[
					6209,
					4506
				],
				[
					-71,
					95
				],
				[
					-102,
					200
				],
				[
					31,
					26
				],
				[
					-42,
					74
				]
			],
			[
				[
					6152,
					4941
				],
				[
					75,
					-61
				]
			],
			[
				[
					6227,
					4880
				],
				[
					114,
					-56
				],
				[
					52,
					16
				]
			],
			[
				[
					6393,
					4840
				],
				[
					64,
					58
				],
				[
					-1,
					38
				],
				[
					68,
					31
				]
			],
			[
				[
					6227,
					4880
				],
				[
					100,
					57
				],
				[
					66,
					-97
				]
			],
			[
				[
					6209,
					4506
				],
				[
					-101,
					-34
				],
				[
					-19,
					-92
				]
			],
			[
				[
					6089,
					4380
				],
				[
					-103,
					104
				],
				[
					-7,
					51
				],
				[
					-66,
					-18
				],
				[
					-25,
					49
				],
				[
					-88,
					-9
				],
				[
					-72,
					48
				]
			],
			[
				[
					5728,
					4605
				],
				[
					-49,
					59
				],
				[
					2,
					52
				]
			],
			[
				[
					5681,
					4716
				],
				[
					18,
					68
				],
				[
					-64,
					-1
				],
				[
					-52,
					91
				],
				[
					67,
					-26
				],
				[
					-6,
					142
				],
				[
					-43,
					-6
				]
			],
			[
				[
					5728,
					4605
				],
				[
					-64,
					-68
				]
			],
			[
				[
					5664,
					4537
				],
				[
					-46,
					-13
				],
				[
					-56,
					75
				],
				[
					-50,
					-20
				],
				[
					-4,
					48
				],
				[
					60,
					97
				],
				[
					113,
					-8
				]
			],
			[
				[
					5664,
					4537
				],
				[
					8,
					-34
				],
				[
					-71,
					-31
				],
				[
					39,
					-20
				],
				[
					-66,
					-86
				],
				[
					-59,
					-32
				],
				[
					5,
					85
				],
				[
					-62,
					-28
				]
			],
			[
				[
					5458,
					4391
				],
				[
					7,
					60
				],
				[
					-75,
					52
				],
				[
					-32,
					78
				],
				[
					44,
					150
				]
			],
			[
				[
					5402,
					4731
				],
				[
					-18,
					101
				]
			],
			[
				[
					6089,
					4380
				],
				[
					-29,
					-42
				],
				[
					-70,
					33
				],
				[
					-69,
					-68
				],
				[
					-28,
					27
				],
				[
					-47,
					-118
				],
				[
					-132,
					5
				],
				[
					-6,
					-71
				],
				[
					-70,
					-55
				],
				[
					-92,
					62
				],
				[
					-118,
					-56
				],
				[
					-71,
					-12
				]
			],
			[
				[
					5357,
					4085
				],
				[
					-100,
					124
				],
				[
					55,
					57
				]
			],
			[
				[
					5312,
					4266
				],
				[
					70,
					33
				],
				[
					-20,
					51
				],
				[
					96,
					41
				]
			],
			[
				[
					5312,
					4266
				],
				[
					-79,
					38
				],
				[
					11,
					49
				],
				[
					-51,
					79
				],
				[
					-47,
					4
				]
			],
			[
				[
					5146,
					4436
				],
				[
					-74,
					84
				],
				[
					49,
					63
				],
				[
					-36,
					25
				],
				[
					159,
					46
				],
				[
					63,
					82
				],
				[
					95,
					-5
				]
			],
			[
				[
					5357,
					4085
				],
				[
					-57,
					-13
				],
				[
					-16,
					-56
				],
				[
					-75,
					-43
				],
				[
					-53,
					-102
				],
				[
					2,
					-93
				],
				[
					-32,
					65
				],
				[
					-74,
					67
				],
				[
					-13,
					64
				],
				[
					-67,
					-5
				]
			],
			[
				[
					4972,
					3969
				],
				[
					-100,
					44
				],
				[
					7,
					47
				],
				[
					-52,
					48
				]
			],
			[
				[
					4827,
					4108
				],
				[
					-24,
					24
				],
				[
					60,
					57
				],
				[
					-74,
					69
				],
				[
					58,
					67
				]
			],
			[
				[
					4847,
					4325
				],
				[
					49,
					27
				],
				[
					53,
					-75
				],
				[
					62,
					96
				],
				[
					33,
					-18
				],
				[
					102,
					81
				]
			],
			[
				[
					2981,
					5382
				],
				[
					-117,
					8
				],
				[
					-84,
					-54
				],
				[
					21,
					-111
				],
				[
					83,
					-27
				],
				[
					-7,
					-48
				]
			],
			[
				[
					2877,
					5150
				],
				[
					-140,
					27
				],
				[
					-26,
					-63
				],
				[
					-61,
					-35
				],
				[
					26,
					-55
				],
				[
					-65,
					-96
				],
				[
					-71,
					-17
				],
				[
					-76,
					90
				],
				[
					28,
					138
				],
				[
					-95,
					35
				],
				[
					5,
					-50
				],
				[
					-69,
					-130
				],
				[
					-57,
					12
				]
			],
			[
				[
					3083,
					5241
				],
				[
					-69,
					-21
				],
				[
					87,
					-21
				],
				[
					-54,
					-24
				],
				[
					-41,
					-80
				]
			],
			[
				[
					3006,
					5095
				],
				[
					-129,
					55
				]
			],
			[
				[
					3239,
					5346
				],
				[
					35,
					-118
				],
				[
					70,
					-12
				],
				[
					6,
					-63
				],
				[
					112,
					-48
				]
			],
			[
				[
					3462,
					5105
				],
				[
					-6,
					-53
				],
				[
					-65,
					-13
				],
				[
					46,
					-43
				],
				[
					-28,
					-63
				],
				[
					59,
					-42
				],
				[
					-19,
					-35
				],
				[
					-127,
					15
				],
				[
					17,
					-93
				],
				[
					-82,
					4
				],
				[
					86,
					-78
				],
				[
					-28,
					-66
				],
				[
					-57,
					-14
				],
				[
					-20,
					-70
				]
			],
			[
				[
					3238,
					4554
				],
				[
					-36,
					37
				],
				[
					-87,
					18
				],
				[
					-82,
					-118
				],
				[
					-78,
					61
				],
				[
					-52,
					-41
				],
				[
					-41,
					38
				]
			],
			[
				[
					2862,
					4549
				],
				[
					-11,
					42
				]
			],
			[
				[
					2851,
					4591
				],
				[
					62,
					57
				],
				[
					-29,
					74
				],
				[
					76,
					165
				],
				[
					94,
					72
				],
				[
					63,
					2
				],
				[
					0,
					84
				],
				[
					-111,
					50
				]
			],
			[
				[
					2851,
					4591
				],
				[
					-233,
					53
				]
			],
			[
				[
					2618,
					4644
				],
				[
					-31,
					107
				],
				[
					-66,
					-21
				],
				[
					-70,
					82
				],
				[
					-123,
					-12
				],
				[
					-90,
					53
				],
				[
					-60,
					-62
				],
				[
					-95,
					25
				]
			],
			[
				[
					2618,
					4644
				],
				[
					-98,
					-54
				],
				[
					-94,
					-94
				],
				[
					-165,
					-51
				],
				[
					-42,
					21
				]
			],
			[
				[
					2219,
					4466
				],
				[
					-46,
					-31
				],
				[
					-48,
					71
				],
				[
					-60,
					-11
				],
				[
					3,
					82
				],
				[
					-47,
					11
				],
				[
					-1,
					70
				],
				[
					-35,
					19
				]
			],
			[
				[
					2219,
					4466
				],
				[
					23,
					-113
				],
				[
					-74,
					-10
				],
				[
					27,
					-53
				],
				[
					-50,
					-38
				],
				[
					73,
					-20
				],
				[
					-94,
					-70
				],
				[
					38,
					-67
				]
			],
			[
				[
					2162,
					4095
				],
				[
					-50,
					-20
				]
			],
			[
				[
					2112,
					4075
				],
				[
					-97,
					74
				],
				[
					-29,
					69
				],
				[
					-59,
					34
				],
				[
					-44,
					65
				],
				[
					-60,
					18
				]
			],
			[
				[
					1823,
					4335
				],
				[
					-21,
					113
				]
			],
			[
				[
					2862,
					4549
				],
				[
					-152,
					-60
				],
				[
					-17,
					-132
				],
				[
					-40,
					-32
				],
				[
					-42,
					38
				],
				[
					-8,
					-93
				]
			],
			[
				[
					2603,
					4270
				],
				[
					-70,
					-67
				]
			],
			[
				[
					2533,
					4203
				],
				[
					-47,
					-12
				],
				[
					-28,
					-75
				],
				[
					-119,
					15
				],
				[
					-4,
					48
				],
				[
					-119,
					5
				],
				[
					-54,
					-89
				]
			],
			[
				[
					3238,
					4554
				],
				[
					12,
					-37
				],
				[
					-48,
					-86
				],
				[
					4,
					-51
				],
				[
					59,
					-6
				],
				[
					-10,
					43
				],
				[
					81,
					15
				],
				[
					22,
					-47
				]
			],
			[
				[
					3358,
					4385
				],
				[
					-32,
					-32
				],
				[
					4,
					-126
				]
			],
			[
				[
					3330,
					4227
				],
				[
					-45,
					-95
				],
				[
					-100,
					-60
				],
				[
					-80,
					35
				],
				[
					-21,
					-89
				]
			],
			[
				[
					3084,
					4018
				],
				[
					-96,
					49
				],
				[
					-42,
					-16
				],
				[
					-69,
					80
				],
				[
					-61,
					-69
				],
				[
					-35,
					60
				],
				[
					-86,
					43
				],
				[
					20,
					69
				],
				[
					-112,
					36
				]
			],
			[
				[
					3084,
					4018
				],
				[
					11,
					-54
				],
				[
					-99,
					-111
				]
			],
			[
				[
					2996,
					3853
				],
				[
					-97,
					19
				],
				[
					21,
					-98
				],
				[
					-22,
					-93
				],
				[
					-76,
					-12
				]
			],
			[
				[
					2822,
					3669
				],
				[
					-28,
					57
				],
				[
					-118,
					23
				],
				[
					-58,
					-76
				],
				[
					-62,
					37
				]
			],
			[
				[
					2556,
					3710
				],
				[
					67,
					59
				],
				[
					-56,
					26
				],
				[
					-13,
					77
				],
				[
					-89,
					5
				],
				[
					-45,
					37
				]
			],
			[
				[
					2420,
					3914
				],
				[
					69,
					90
				],
				[
					86,
					49
				],
				[
					25,
					54
				],
				[
					-67,
					96
				]
			],
			[
				[
					2112,
					4075
				],
				[
					78,
					-45
				],
				[
					30,
					-53
				],
				[
					-46,
					-44
				],
				[
					47,
					-12
				],
				[
					48,
					-72
				]
			],
			[
				[
					2269,
					3849
				],
				[
					-77,
					-55
				]
			],
			[
				[
					2192,
					3794
				],
				[
					-1,
					0
				]
			],
			[
				[
					2191,
					3794
				],
				[
					-20,
					-20
				]
			],
			[
				[
					2171,
					3774
				],
				[
					-86,
					73
				],
				[
					-61,
					-56
				],
				[
					-40,
					25
				]
			],
			[
				[
					1984,
					3816
				],
				[
					42,
					29
				],
				[
					1,
					59
				],
				[
					-74,
					94
				],
				[
					37,
					51
				],
				[
					-101,
					3
				],
				[
					-8,
					-31
				],
				[
					-111,
					74
				],
				[
					59,
					110
				],
				[
					-31,
					52
				]
			],
			[
				[
					1798,
					4257
				],
				[
					25,
					78
				]
			],
			[
				[
					2420,
					3914
				],
				[
					-43,
					-2
				],
				[
					-45,
					-128
				]
			],
			[
				[
					2332,
					3784
				],
				[
					-70,
					6
				],
				[
					7,
					59
				]
			],
			[
				[
					1984,
					3816
				],
				[
					-21,
					-71
				]
			],
			[
				[
					1963,
					3745
				],
				[
					-134,
					-28
				],
				[
					-39,
					-53
				],
				[
					51,
					-65
				]
			],
			[
				[
					1841,
					3599
				],
				[
					-165,
					-73
				],
				[
					-65,
					-8
				],
				[
					-90,
					123
				]
			],
			[
				[
					1521,
					3641
				],
				[
					64,
					81
				]
			],
			[
				[
					1585,
					3722
				],
				[
					59,
					-33
				],
				[
					-36,
					102
				],
				[
					30,
					34
				],
				[
					111,
					35
				],
				[
					-30,
					31
				],
				[
					80,
					25
				],
				[
					-16,
					64
				],
				[
					-65,
					94
				],
				[
					-30,
					147
				],
				[
					50,
					59
				],
				[
					60,
					-23
				]
			],
			[
				[
					1963,
					3745
				],
				[
					46,
					-88
				],
				[
					-44,
					-102
				]
			],
			[
				[
					1965,
					3555
				],
				[
					-34,
					-7
				]
			],
			[
				[
					1931,
					3548
				],
				[
					-90,
					51
				]
			],
			[
				[
					2556,
					3710
				],
				[
					-64,
					-68
				]
			],
			[
				[
					2492,
					3642
				],
				[
					-66,
					11
				]
			],
			[
				[
					2426,
					3653
				],
				[
					-17,
					64
				],
				[
					-85,
					16
				]
			],
			[
				[
					2324,
					3733
				],
				[
					8,
					51
				]
			],
			[
				[
					2171,
					3774
				],
				[
					1,
					-37
				],
				[
					-93,
					-52
				],
				[
					38,
					-50
				]
			],
			[
				[
					2117,
					3635
				],
				[
					-95,
					-85
				],
				[
					-57,
					5
				]
			],
			[
				[
					2121,
					3664
				],
				[
					-4,
					-29
				]
			],
			[
				[
					2191,
					3794
				],
				[
					1,
					0
				]
			],
			[
				[
					2192,
					3794
				],
				[
					50,
					-33
				],
				[
					-37,
					-90
				],
				[
					-84,
					-7
				]
			],
			[
				[
					2324,
					3733
				],
				[
					-51,
					-98
				],
				[
					-74,
					-9
				],
				[
					-26,
					-48
				]
			],
			[
				[
					2173,
					3578
				],
				[
					-52,
					86
				]
			],
			[
				[
					2173,
					3578
				],
				[
					23,
					-68
				]
			],
			[
				[
					2196,
					3510
				],
				[
					-56,
					-59
				],
				[
					-24,
					-71
				],
				[
					24,
					-57
				],
				[
					8,
					-122
				]
			],
			[
				[
					2148,
					3201
				],
				[
					-89,
					7
				]
			],
			[
				[
					2059,
					3208
				],
				[
					-84,
					202
				],
				[
					0,
					67
				]
			],
			[
				[
					1975,
					3477
				],
				[
					-44,
					71
				]
			],
			[
				[
					2426,
					3653
				],
				[
					-38,
					-15
				],
				[
					-27,
					-72
				],
				[
					-65,
					-63
				]
			],
			[
				[
					2296,
					3503
				],
				[
					-100,
					7
				]
			],
			[
				[
					2296,
					3503
				],
				[
					95,
					4
				],
				[
					36,
					-72
				],
				[
					-54,
					23
				],
				[
					-81,
					-44
				],
				[
					55,
					-18
				],
				[
					-20,
					-36
				],
				[
					5,
					-149
				]
			],
			[
				[
					2332,
					3211
				],
				[
					-184,
					-10
				]
			],
			[
				[
					2492,
					3642
				],
				[
					32,
					-36
				],
				[
					-12,
					-66
				],
				[
					27,
					-159
				]
			],
			[
				[
					2539,
					3381
				],
				[
					45,
					-141
				],
				[
					35,
					-20
				],
				[
					-45,
					-61
				],
				[
					-22,
					-100
				],
				[
					29,
					-55
				]
			],
			[
				[
					2581,
					3004
				],
				[
					-3,
					-22
				]
			],
			[
				[
					2578,
					2982
				],
				[
					-9,
					-15
				]
			],
			[
				[
					2569,
					2967
				],
				[
					-3,
					-30
				]
			],
			[
				[
					2566,
					2937
				],
				[
					-33,
					-35
				],
				[
					-72,
					9
				],
				[
					-16,
					-46
				]
			],
			[
				[
					2445,
					2865
				],
				[
					-26,
					18
				]
			],
			[
				[
					2419,
					2883
				],
				[
					0,
					25
				]
			],
			[
				[
					2419,
					2908
				],
				[
					-30,
					198
				],
				[
					-54,
					38
				],
				[
					-3,
					67
				]
			],
			[
				[
					2445,
					2865
				],
				[
					-62,
					-96
				],
				[
					-22,
					95
				],
				[
					58,
					19
				]
			],
			[
				[
					2419,
					2908
				],
				[
					-106,
					15
				]
			],
			[
				[
					2313,
					2923
				],
				[
					-60,
					53
				],
				[
					-11,
					92
				],
				[
					-67,
					-20
				],
				[
					22,
					-86
				],
				[
					-32,
					-33
				]
			],
			[
				[
					2165,
					2929
				],
				[
					-93,
					91
				],
				[
					-34,
					-8
				]
			],
			[
				[
					2038,
					3012
				],
				[
					-6,
					15
				]
			],
			[
				[
					2032,
					3027
				],
				[
					-46,
					108
				],
				[
					73,
					73
				]
			],
			[
				[
					4401,
					5177
				],
				[
					-37,
					52
				],
				[
					-29,
					-54
				],
				[
					-66,
					-12
				],
				[
					-120,
					114
				],
				[
					-51,
					-73
				],
				[
					-3,
					-59
				],
				[
					-63,
					-21
				]
			],
			[
				[
					4032,
					5124
				],
				[
					-85,
					22
				],
				[
					-85,
					-7
				],
				[
					-26,
					82
				],
				[
					-58,
					52
				],
				[
					-63,
					-19
				],
				[
					-33,
					47
				],
				[
					-73,
					3
				],
				[
					-59,
					-120
				],
				[
					-103,
					-39
				],
				[
					15,
					-40
				]
			],
			[
				[
					4032,
					5124
				],
				[
					-33,
					-139
				]
			],
			[
				[
					3999,
					4985
				],
				[
					-120,
					16
				],
				[
					-15,
					-76
				],
				[
					-74,
					-16
				],
				[
					-110,
					-60
				],
				[
					32,
					-36
				],
				[
					-69,
					-81
				],
				[
					-18,
					-70
				]
			],
			[
				[
					3625,
					4662
				],
				[
					-22,
					-83
				],
				[
					-97,
					-30
				],
				[
					-67,
					-120
				],
				[
					32,
					-41
				],
				[
					-46,
					-31
				],
				[
					-67,
					28
				]
			],
			[
				[
					4650,
					4971
				],
				[
					-36,
					-83
				],
				[
					-84,
					-44
				],
				[
					101,
					-50
				],
				[
					-7,
					-92
				],
				[
					-81,
					-32
				],
				[
					-45,
					66
				],
				[
					-54,
					-56
				],
				[
					15,
					-45
				],
				[
					-108,
					-46
				],
				[
					-80,
					12
				]
			],
			[
				[
					4271,
					4601
				],
				[
					-89,
					143
				]
			],
			[
				[
					4182,
					4744
				],
				[
					88,
					22
				],
				[
					62,
					-17
				],
				[
					83,
					61
				],
				[
					-8,
					41
				],
				[
					-115,
					53
				],
				[
					-100,
					-35
				],
				[
					-25,
					73
				],
				[
					-40,
					19
				],
				[
					-89,
					-81
				],
				[
					-53,
					11
				]
			],
			[
				[
					3985,
					4891
				],
				[
					14,
					94
				]
			],
			[
				[
					3985,
					4891
				],
				[
					0,
					-64
				],
				[
					93,
					-94
				],
				[
					104,
					11
				]
			],
			[
				[
					4271,
					4601
				],
				[
					-26,
					-87
				],
				[
					-72,
					-9
				],
				[
					-3,
					-41
				],
				[
					-67,
					-14
				],
				[
					43,
					-29
				],
				[
					20,
					-76
				],
				[
					-33,
					-73
				],
				[
					-64,
					2
				]
			],
			[
				[
					4069,
					4274
				],
				[
					-57,
					74
				],
				[
					-30,
					-53
				],
				[
					-100,
					124
				],
				[
					16,
					67
				],
				[
					-143,
					34
				],
				[
					-30,
					112
				],
				[
					-100,
					30
				]
			],
			[
				[
					4847,
					4325
				],
				[
					-47,
					46
				],
				[
					-14,
					106
				],
				[
					61,
					76
				],
				[
					-56,
					24
				],
				[
					13,
					143
				],
				[
					104,
					97
				]
			],
			[
				[
					4827,
					4108
				],
				[
					-76,
					-46
				],
				[
					-23,
					37
				],
				[
					-135,
					-40
				],
				[
					-18,
					15
				]
			],
			[
				[
					4575,
					4074
				],
				[
					-66,
					-32
				],
				[
					-30,
					74
				],
				[
					-50,
					16
				],
				[
					4,
					94
				],
				[
					-63,
					8
				],
				[
					-64,
					-55
				]
			],
			[
				[
					4306,
					4179
				],
				[
					-47,
					15
				],
				[
					-40,
					69
				],
				[
					-58,
					-44
				],
				[
					-92,
					55
				]
			],
			[
				[
					4306,
					4179
				],
				[
					15,
					-155
				],
				[
					-30,
					-121
				],
				[
					-81,
					23
				],
				[
					11,
					59
				],
				[
					-35,
					47
				],
				[
					-103,
					-25
				],
				[
					-43,
					59
				],
				[
					-117,
					-10
				],
				[
					-56,
					-83
				],
				[
					105,
					-60
				],
				[
					-18,
					-49
				],
				[
					-76,
					-10
				]
			],
			[
				[
					3878,
					3854
				],
				[
					-93,
					-8
				],
				[
					-10,
					143
				],
				[
					-67,
					22
				],
				[
					-50,
					66
				],
				[
					-52,
					-4
				],
				[
					-46,
					125
				],
				[
					-101,
					79
				],
				[
					-77,
					12
				],
				[
					-52,
					-62
				]
			],
			[
				[
					1733,
					4463
				],
				[
					-60,
					-25
				],
				[
					-58,
					49
				],
				[
					-13,
					-36
				],
				[
					-56,
					56
				],
				[
					-86,
					-32
				],
				[
					6,
					-189
				],
				[
					-28,
					-93
				],
				[
					-57,
					-33
				]
			],
			[
				[
					1381,
					4160
				],
				[
					-38,
					-60
				],
				[
					-79,
					13
				]
			],
			[
				[
					1264,
					4113
				],
				[
					-80,
					52
				],
				[
					-110,
					201
				]
			],
			[
				[
					1264,
					4113
				],
				[
					-45,
					-183
				],
				[
					19,
					-50
				],
				[
					-33,
					-51
				]
			],
			[
				[
					1205,
					3829
				],
				[
					-171,
					92
				],
				[
					-75,
					-2
				]
			],
			[
				[
					959,
					3919
				],
				[
					-76,
					35
				],
				[
					52,
					37
				],
				[
					-41,
					20
				],
				[
					-34,
					-48
				],
				[
					-103,
					20
				],
				[
					-12,
					43
				]
			],
			[
				[
					1521,
					3641
				],
				[
					-7,
					21
				]
			],
			[
				[
					1514,
					3662
				],
				[
					-50,
					106
				],
				[
					-99,
					101
				],
				[
					-50,
					16
				],
				[
					-37,
					-68
				],
				[
					-69,
					-53
				],
				[
					-4,
					65
				]
			],
			[
				[
					1381,
					4160
				],
				[
					60,
					-57
				],
				[
					-20,
					-49
				],
				[
					41,
					-33
				],
				[
					45,
					55
				],
				[
					12,
					-112
				],
				[
					-21,
					-156
				],
				[
					87,
					-86
				]
			],
			[
				[
					1514,
					3662
				],
				[
					-78,
					-67
				],
				[
					54,
					-42
				]
			],
			[
				[
					1490,
					3553
				],
				[
					-185,
					-175
				],
				[
					-62,
					-31
				],
				[
					-24,
					69
				],
				[
					-137,
					-11
				],
				[
					31,
					-41
				],
				[
					-107,
					-99
				],
				[
					-67,
					-115
				]
			],
			[
				[
					939,
					3150
				],
				[
					-31,
					-21
				],
				[
					-103,
					139
				],
				[
					59,
					38
				],
				[
					-62,
					92
				]
			],
			[
				[
					802,
					3398
				],
				[
					87,
					45
				],
				[
					-28,
					29
				],
				[
					23,
					93
				],
				[
					73,
					-62
				],
				[
					38,
					42
				],
				[
					-12,
					90
				],
				[
					-93,
					27
				],
				[
					-22,
					184
				],
				[
					42,
					-6
				],
				[
					49,
					79
				]
			],
			[
				[
					1490,
					3553
				],
				[
					131,
					-103
				]
			],
			[
				[
					1621,
					3450
				],
				[
					52,
					-113
				],
				[
					-47,
					-105
				]
			],
			[
				[
					1626,
					3232
				],
				[
					-85,
					8
				],
				[
					-61,
					-58
				],
				[
					-47,
					-101
				],
				[
					-4,
					85
				],
				[
					-47,
					-28
				],
				[
					-61,
					36
				],
				[
					-5,
					-40
				],
				[
					-72,
					-31
				],
				[
					-5,
					-83
				],
				[
					-45,
					8
				],
				[
					-69,
					-61
				]
			],
			[
				[
					1125,
					2967
				],
				[
					-100,
					72
				],
				[
					-50,
					-6
				],
				[
					-49,
					52
				]
			],
			[
				[
					926,
					3085
				],
				[
					13,
					65
				]
			],
			[
				[
					802,
					3398
				],
				[
					-59,
					-37
				],
				[
					-83,
					86
				],
				[
					-175,
					-125
				]
			],
			[
				[
					485,
					3322
				],
				[
					-34,
					-14
				],
				[
					-54,
					52
				],
				[
					-29,
					-19
				],
				[
					-148,
					207
				],
				[
					-23,
					92
				],
				[
					59,
					148
				],
				[
					-9,
					73
				],
				[
					81,
					41
				],
				[
					22,
					66
				],
				[
					80,
					8
				]
			],
			[
				[
					926,
					3085
				],
				[
					-108,
					-34
				]
			],
			[
				[
					818,
					3051
				],
				[
					-115,
					-72
				],
				[
					-127,
					-53
				],
				[
					-166,
					44
				]
			],
			[
				[
					410,
					2970
				],
				[
					-17,
					25
				],
				[
					50,
					66
				],
				[
					29,
					90
				],
				[
					39,
					29
				],
				[
					6,
					118
				],
				[
					-32,
					24
				]
			],
			[
				[
					1975,
					3477
				],
				[
					-50,
					1
				],
				[
					-26,
					-78
				],
				[
					-56,
					24
				],
				[
					-122,
					-18
				],
				[
					-23,
					46
				],
				[
					-77,
					-2
				]
			],
			[
				[
					2032,
					3027
				],
				[
					-106,
					-10
				]
			],
			[
				[
					1926,
					3017
				],
				[
					-103,
					52
				]
			],
			[
				[
					1823,
					3069
				],
				[
					-40,
					93
				],
				[
					-113,
					4
				],
				[
					-9,
					71
				],
				[
					-35,
					-5
				]
			],
			[
				[
					2038,
					3012
				],
				[
					-6,
					-36
				],
				[
					66,
					-188
				]
			],
			[
				[
					2098,
					2788
				],
				[
					0,
					-2
				]
			],
			[
				[
					2098,
					2786
				],
				[
					0,
					-2
				]
			],
			[
				[
					2098,
					2784
				],
				[
					-136,
					-17
				],
				[
					29,
					-77
				],
				[
					-36,
					-26
				],
				[
					-65,
					161
				],
				[
					38,
					9
				],
				[
					-22,
					117
				],
				[
					20,
					66
				]
			],
			[
				[
					2098,
					2784
				],
				[
					-1,
					-2
				]
			],
			[
				[
					2097,
					2782
				],
				[
					0,
					-6
				]
			],
			[
				[
					2097,
					2776
				],
				[
					-33,
					-93
				],
				[
					28,
					-49
				],
				[
					-61,
					-56
				]
			],
			[
				[
					2031,
					2578
				],
				[
					-76,
					76
				],
				[
					-244,
					21
				],
				[
					-22,
					23
				],
				[
					-93,
					-38
				]
			],
			[
				[
					1596,
					2660
				],
				[
					-22,
					60
				]
			],
			[
				[
					1574,
					2720
				],
				[
					97,
					55
				],
				[
					-5,
					114
				],
				[
					116,
					85
				],
				[
					41,
					95
				]
			],
			[
				[
					1574,
					2720
				],
				[
					-56,
					47
				],
				[
					-61,
					-13
				],
				[
					-67,
					109
				],
				[
					-99,
					28
				],
				[
					-71,
					-154
				]
			],
			[
				[
					1220,
					2737
				],
				[
					-83,
					47
				]
			],
			[
				[
					1137,
					2784
				],
				[
					-36,
					49
				],
				[
					43,
					27
				],
				[
					-19,
					107
				]
			],
			[
				[
					1596,
					2660
				],
				[
					-31,
					-61
				],
				[
					58,
					-44
				],
				[
					12,
					-71
				],
				[
					-36,
					-83
				],
				[
					31,
					-90
				]
			],
			[
				[
					1630,
					2311
				],
				[
					-34,
					-15
				],
				[
					-58,
					42
				],
				[
					-97,
					-27
				],
				[
					-115,
					68
				],
				[
					-28,
					94
				],
				[
					-38,
					19
				],
				[
					-62,
					-29
				]
			],
			[
				[
					1198,
					2463
				],
				[
					-63,
					90
				],
				[
					77,
					82
				],
				[
					8,
					102
				]
			],
			[
				[
					2031,
					2578
				],
				[
					-25,
					-84
				]
			],
			[
				[
					2006,
					2494
				],
				[
					-33,
					-137
				]
			],
			[
				[
					1973,
					2357
				],
				[
					-50,
					-118
				]
			],
			[
				[
					1923,
					2239
				],
				[
					-13,
					-11
				]
			],
			[
				[
					1910,
					2228
				],
				[
					-23,
					-19
				]
			],
			[
				[
					1887,
					2209
				],
				[
					-112,
					30
				],
				[
					-128,
					89
				],
				[
					-17,
					-17
				]
			],
			[
				[
					5645,
					1219
				],
				[
					-59,
					-6
				],
				[
					-95,
					-116
				]
			],
			[
				[
					5491,
					1097
				],
				[
					-41,
					-11
				],
				[
					-15,
					-77
				],
				[
					-52,
					1
				],
				[
					-33,
					87
				],
				[
					-68,
					56
				],
				[
					-36,
					-57
				],
				[
					-45,
					7
				]
			],
			[
				[
					5201,
					1103
				],
				[
					-81,
					-14
				],
				[
					-61,
					29
				],
				[
					-38,
					-60
				],
				[
					-25,
					64
				],
				[
					-36,
					-12
				]
			],
			[
				[
					4960,
					1110
				],
				[
					-43,
					47
				],
				[
					123,
					76
				],
				[
					26,
					-22
				],
				[
					25,
					158
				]
			],
			[
				[
					5091,
					1369
				],
				[
					130,
					51
				],
				[
					56,
					90
				]
			],
			[
				[
					5277,
					1510
				],
				[
					46,
					-10
				],
				[
					60,
					-105
				],
				[
					53,
					5
				],
				[
					115,
					-47
				],
				[
					94,
					-134
				]
			],
			[
				[
					4905,
					1511
				],
				[
					118,
					-13
				],
				[
					68,
					-129
				]
			],
			[
				[
					4960,
					1110
				],
				[
					-10,
					-191
				],
				[
					-56,
					-28
				],
				[
					-61,
					38
				],
				[
					2,
					-67
				],
				[
					-65,
					21
				]
			],
			[
				[
					4770,
					883
				],
				[
					-68,
					57
				],
				[
					21,
					37
				],
				[
					-31,
					160
				],
				[
					21,
					24
				],
				[
					-30,
					149
				]
			],
			[
				[
					4683,
					1310
				],
				[
					35,
					107
				],
				[
					46,
					69
				],
				[
					96,
					56
				],
				[
					45,
					-31
				]
			],
			[
				[
					4668,
					1969
				],
				[
					-51,
					-50
				],
				[
					32,
					-78
				],
				[
					-1,
					-86
				],
				[
					83,
					-5
				],
				[
					54,
					-46
				],
				[
					74,
					0
				],
				[
					10,
					-112
				],
				[
					29,
					5
				],
				[
					7,
					-86
				]
			],
			[
				[
					4683,
					1310
				],
				[
					-98,
					-8
				],
				[
					-29,
					38
				]
			],
			[
				[
					4556,
					1340
				],
				[
					-51,
					67
				],
				[
					9,
					52
				],
				[
					-42,
					66
				],
				[
					-49,
					-46
				],
				[
					-80,
					60
				]
			],
			[
				[
					4343,
					1539
				],
				[
					-148,
					132
				],
				[
					15,
					50
				]
			],
			[
				[
					4210,
					1721
				],
				[
					74,
					84
				],
				[
					85,
					18
				],
				[
					27,
					-44
				],
				[
					48,
					14
				],
				[
					12,
					104
				],
				[
					54,
					7
				],
				[
					65,
					106
				],
				[
					53,
					-51
				],
				[
					40,
					10
				]
			],
			[
				[
					4556,
					1340
				],
				[
					-63,
					-67
				]
			],
			[
				[
					4493,
					1273
				],
				[
					-19,
					-36
				]
			],
			[
				[
					4474,
					1237
				],
				[
					-67,
					-26
				],
				[
					-25,
					-55
				]
			],
			[
				[
					4382,
					1156
				],
				[
					-33,
					-44
				],
				[
					-54,
					15
				],
				[
					-53,
					-51
				],
				[
					-76,
					-11
				],
				[
					-24,
					66
				],
				[
					-54,
					48
				],
				[
					34,
					23
				]
			],
			[
				[
					4122,
					1202
				],
				[
					29,
					115
				],
				[
					36,
					-17
				],
				[
					9,
					71
				],
				[
					69,
					140
				]
			],
			[
				[
					4265,
					1511
				],
				[
					78,
					28
				]
			],
			[
				[
					4572,
					2189
				],
				[
					92,
					-42
				],
				[
					4,
					-178
				]
			],
			[
				[
					4210,
					1721
				],
				[
					-76,
					12
				],
				[
					-53,
					119
				],
				[
					12,
					94
				],
				[
					-41,
					60
				],
				[
					47,
					14
				],
				[
					-55,
					54
				]
			],
			[
				[
					4044,
					2074
				],
				[
					109,
					67
				],
				[
					10,
					61
				],
				[
					92,
					111
				]
			],
			[
				[
					4255,
					2313
				],
				[
					100,
					-63
				],
				[
					44,
					25
				],
				[
					3,
					80
				]
			],
			[
				[
					4402,
					2355
				],
				[
					126,
					-19
				],
				[
					-22,
					-42
				],
				[
					66,
					-105
				]
			],
			[
				[
					4595,
					1184
				],
				[
					-50,
					-52
				]
			],
			[
				[
					4545,
					1132
				],
				[
					-59,
					34
				],
				[
					-12,
					71
				]
			],
			[
				[
					4493,
					1273
				],
				[
					120,
					-40
				],
				[
					-18,
					-49
				]
			],
			[
				[
					4595,
					1184
				],
				[
					0,
					-3
				]
			],
			[
				[
					4595,
					1181
				],
				[
					54,
					-4
				],
				[
					22,
					-49
				],
				[
					-30,
					-77
				],
				[
					-55,
					14
				]
			],
			[
				[
					4586,
					1065
				],
				[
					-38,
					44
				]
			],
			[
				[
					4548,
					1109
				],
				[
					0,
					1
				]
			],
			[
				[
					4548,
					1110
				],
				[
					-3,
					22
				]
			],
			[
				[
					4586,
					1065
				],
				[
					-3,
					0
				]
			],
			[
				[
					4583,
					1065
				],
				[
					-113,
					-7
				],
				[
					-5,
					58
				]
			],
			[
				[
					4465,
					1116
				],
				[
					0,
					1
				]
			],
			[
				[
					4465,
					1117
				],
				[
					83,
					-8
				]
			],
			[
				[
					4465,
					1117
				],
				[
					-1,
					1
				]
			],
			[
				[
					4464,
					1118
				],
				[
					-41,
					-2
				]
			],
			[
				[
					4423,
					1116
				],
				[
					-41,
					40
				]
			],
			[
				[
					4770,
					883
				],
				[
					-33,
					-29
				]
			],
			[
				[
					4737,
					854
				],
				[
					-23,
					21
				],
				[
					-120,
					-28
				],
				[
					-49,
					49
				],
				[
					-109,
					26
				]
			],
			[
				[
					4436,
					922
				],
				[
					-21,
					123
				],
				[
					8,
					71
				]
			],
			[
				[
					4464,
					1118
				],
				[
					1,
					-2
				]
			],
			[
				[
					4583,
					1065
				],
				[
					3,
					0
				]
			],
			[
				[
					4595,
					1181
				],
				[
					0,
					3
				]
			],
			[
				[
					5201,
					1103
				],
				[
					-42,
					-35
				],
				[
					18,
					-65
				],
				[
					-24,
					-81
				],
				[
					93,
					-73
				],
				[
					-64,
					-68
				],
				[
					20,
					-73
				],
				[
					-41,
					-152
				]
			],
			[
				[
					5161,
					556
				],
				[
					-66,
					-23
				],
				[
					8,
					69
				],
				[
					-78,
					-64
				],
				[
					31,
					-98
				],
				[
					-116,
					14
				]
			],
			[
				[
					4940,
					454
				],
				[
					-26,
					36
				],
				[
					-24,
					160
				],
				[
					-66,
					54
				],
				[
					26,
					44
				],
				[
					-74,
					24
				],
				[
					-39,
					82
				]
			],
			[
				[
					4940,
					454
				],
				[
					-38,
					6
				],
				[
					-185,
					-42
				],
				[
					-139,
					-12
				],
				[
					-30,
					-89
				],
				[
					-127,
					-24
				]
			],
			[
				[
					4421,
					293
				],
				[
					-116,
					109
				],
				[
					15,
					112
				],
				[
					52,
					13
				],
				[
					53,
					91
				],
				[
					-68,
					99
				]
			],
			[
				[
					4357,
					717
				],
				[
					3,
					147
				],
				[
					48,
					-18
				],
				[
					28,
					76
				]
			],
			[
				[
					4357,
					717
				],
				[
					-35,
					86
				],
				[
					-80,
					-5
				],
				[
					38,
					47
				],
				[
					-67,
					45
				],
				[
					-52,
					-61
				],
				[
					-78,
					-15
				],
				[
					-55,
					-48
				],
				[
					-39,
					20
				],
				[
					-81,
					-39
				]
			],
			[
				[
					3908,
					747
				],
				[
					46,
					204
				],
				[
					-51,
					44
				],
				[
					33,
					91
				]
			],
			[
				[
					3936,
					1086
				],
				[
					-13,
					59
				],
				[
					60,
					10
				],
				[
					34,
					103
				]
			],
			[
				[
					4017,
					1258
				],
				[
					46,
					-49
				],
				[
					59,
					-7
				]
			],
			[
				[
					5491,
					1097
				],
				[
					13,
					-59
				],
				[
					71,
					-78
				],
				[
					20,
					-62
				],
				[
					45,
					-22
				],
				[
					52,
					-126
				],
				[
					-79,
					-155
				],
				[
					83,
					-6
				],
				[
					57,
					-46
				],
				[
					12,
					-77
				],
				[
					-41,
					-58
				],
				[
					3,
					-119
				],
				[
					-33,
					-37
				],
				[
					-78,
					43
				],
				[
					-103,
					107
				],
				[
					36,
					43
				],
				[
					-64,
					83
				],
				[
					-118,
					-12
				],
				[
					-17,
					-45
				],
				[
					-60,
					-9
				],
				[
					-56,
					93
				],
				[
					-73,
					1
				]
			],
			[
				[
					4421,
					293
				],
				[
					9,
					-66
				],
				[
					-68,
					5
				],
				[
					-50,
					-66
				],
				[
					-19,
					45
				],
				[
					-120,
					-49
				],
				[
					-103,
					7
				],
				[
					11,
					39
				],
				[
					-90,
					90
				],
				[
					12,
					49
				]
			],
			[
				[
					4003,
					347
				],
				[
					-10,
					47
				],
				[
					56,
					32
				],
				[
					-23,
					82
				],
				[
					-109,
					2
				],
				[
					8,
					57
				],
				[
					-45,
					-23
				],
				[
					28,
					203
				]
			],
			[
				[
					6021,
					2226
				],
				[
					63,
					-50
				],
				[
					72,
					35
				],
				[
					69,
					-115
				],
				[
					47,
					9
				],
				[
					86,
					-150
				],
				[
					-34,
					-76
				]
			],
			[
				[
					6324,
					1879
				],
				[
					-50,
					-30
				],
				[
					-114,
					-9
				],
				[
					-65,
					60
				],
				[
					-37,
					-21
				],
				[
					-31,
					55
				],
				[
					-75,
					-29
				],
				[
					26,
					-74
				],
				[
					-52,
					-24
				],
				[
					-55,
					36
				],
				[
					-49,
					-45
				],
				[
					-43,
					19
				],
				[
					-17,
					-50
				],
				[
					-78,
					-35
				]
			],
			[
				[
					5684,
					1732
				],
				[
					-39,
					68
				],
				[
					-71,
					16
				],
				[
					-48,
					73
				],
				[
					-25,
					100
				]
			],
			[
				[
					5501,
					1989
				],
				[
					4,
					51
				],
				[
					63,
					4
				],
				[
					-9,
					65
				],
				[
					43,
					84
				],
				[
					18,
					-24
				],
				[
					89,
					8
				],
				[
					30,
					-78
				],
				[
					89,
					-22
				],
				[
					84,
					10
				],
				[
					3,
					111
				],
				[
					37,
					-15
				],
				[
					69,
					43
				]
			],
			[
				[
					4999,
					1948
				],
				[
					98,
					-58
				],
				[
					57,
					0
				]
			],
			[
				[
					5154,
					1890
				],
				[
					55,
					-100
				],
				[
					-35,
					-24
				],
				[
					-30,
					-103
				],
				[
					12,
					-59
				],
				[
					121,
					-94
				]
			],
			[
				[
					4572,
					2189
				],
				[
					11,
					74
				],
				[
					37,
					10
				]
			],
			[
				[
					4620,
					2273
				],
				[
					99,
					-35
				],
				[
					19,
					39
				],
				[
					66,
					-7
				],
				[
					30,
					-88
				],
				[
					30,
					24
				],
				[
					92,
					-35
				],
				[
					39,
					-98
				],
				[
					-23,
					-15
				],
				[
					-1,
					-105
				],
				[
					28,
					-5
				]
			],
			[
				[
					6324,
					1879
				],
				[
					23,
					-124
				],
				[
					-78,
					-137
				],
				[
					-102,
					74
				],
				[
					-72,
					27
				],
				[
					-56,
					-42
				],
				[
					15,
					-62
				],
				[
					-41,
					-182
				],
				[
					-125,
					-101
				],
				[
					-58,
					2
				]
			],
			[
				[
					5830,
					1334
				],
				[
					-73,
					116
				],
				[
					67,
					34
				],
				[
					-67,
					103
				],
				[
					12,
					71
				],
				[
					-62,
					20
				],
				[
					-23,
					54
				]
			],
			[
				[
					5830,
					1334
				],
				[
					-121,
					-47
				],
				[
					-64,
					-68
				]
			],
			[
				[
					5154,
					1890
				],
				[
					79,
					58
				],
				[
					69,
					-10
				],
				[
					65,
					-45
				],
				[
					134,
					96
				]
			],
			[
				[
					4999,
					1948
				],
				[
					83,
					93
				],
				[
					69,
					32
				],
				[
					37,
					-20
				],
				[
					68,
					94
				],
				[
					18,
					147
				]
			],
			[
				[
					5274,
					2294
				],
				[
					86,
					88
				],
				[
					140,
					17
				],
				[
					145,
					35
				],
				[
					21,
					35
				],
				[
					62,
					-14
				],
				[
					67,
					-57
				],
				[
					30,
					80
				]
			],
			[
				[
					5825,
					2478
				],
				[
					0,
					-38
				],
				[
					95,
					-33
				],
				[
					82,
					-84
				],
				[
					19,
					-97
				]
			],
			[
				[
					4597,
					3243
				],
				[
					8,
					-168
				],
				[
					81,
					-7
				],
				[
					54,
					34
				],
				[
					131,
					-16
				],
				[
					8,
					-81
				],
				[
					69,
					-1
				],
				[
					36,
					-38
				]
			],
			[
				[
					4984,
					2966
				],
				[
					-66,
					-71
				],
				[
					0,
					-83
				],
				[
					-38,
					-17
				],
				[
					62,
					-48
				],
				[
					-96,
					-134
				],
				[
					-6,
					-107
				]
			],
			[
				[
					4840,
					2506
				],
				[
					-73,
					-57
				],
				[
					-26,
					31
				],
				[
					-48,
					-89
				],
				[
					-61,
					-44
				],
				[
					-12,
					-74
				]
			],
			[
				[
					4402,
					2355
				],
				[
					-49,
					50
				],
				[
					-2,
					111
				],
				[
					-38,
					93
				],
				[
					-56,
					5
				],
				[
					30,
					61
				],
				[
					68,
					-29
				],
				[
					44,
					31
				],
				[
					66,
					125
				],
				[
					57,
					-15
				],
				[
					44,
					72
				],
				[
					-43,
					52
				],
				[
					51,
					153
				],
				[
					-33,
					119
				]
			],
			[
				[
					4541,
					3183
				],
				[
					56,
					60
				]
			],
			[
				[
					4840,
					2506
				],
				[
					128,
					-67
				],
				[
					67,
					103
				],
				[
					39,
					-80
				],
				[
					63,
					-6
				],
				[
					22,
					-55
				],
				[
					72,
					-28
				],
				[
					-3,
					-60
				],
				[
					46,
					-19
				]
			],
			[
				[
					5365,
					2958
				],
				[
					40,
					-24
				],
				[
					10,
					-116
				],
				[
					81,
					-52
				],
				[
					36,
					-69
				],
				[
					117,
					2
				],
				[
					63,
					-50
				],
				[
					4,
					-53
				],
				[
					109,
					-118
				]
			],
			[
				[
					4984,
					2966
				],
				[
					59,
					54
				],
				[
					84,
					-94
				],
				[
					117,
					6
				],
				[
					32,
					41
				],
				[
					89,
					-15
				]
			],
			[
				[
					4597,
					3243
				],
				[
					4,
					56
				],
				[
					165,
					81
				],
				[
					-25,
					123
				],
				[
					74,
					24
				]
			],
			[
				[
					4815,
					3527
				],
				[
					152,
					-3
				],
				[
					75,
					31
				],
				[
					58,
					76
				]
			],
			[
				[
					5100,
					3631
				],
				[
					45,
					-7
				],
				[
					145,
					-106
				],
				[
					-17,
					-47
				],
				[
					55,
					-20
				],
				[
					-64,
					-176
				],
				[
					-51,
					-30
				],
				[
					30,
					-74
				],
				[
					65,
					-24
				],
				[
					57,
					-189
				]
			],
			[
				[
					4204,
					3346
				],
				[
					-14,
					-95
				],
				[
					30,
					-9
				],
				[
					52,
					-115
				],
				[
					-42,
					-11
				],
				[
					93,
					-58
				]
			],
			[
				[
					4323,
					3058
				],
				[
					-5,
					-19
				]
			],
			[
				[
					4318,
					3039
				],
				[
					-137,
					-20
				],
				[
					-43,
					119
				],
				[
					-93,
					24
				],
				[
					-18,
					112
				],
				[
					-89,
					-61
				],
				[
					-71,
					65
				],
				[
					-49,
					-87
				]
			],
			[
				[
					3818,
					3191
				],
				[
					-82,
					46
				]
			],
			[
				[
					3736,
					3237
				],
				[
					-12,
					49
				],
				[
					-70,
					33
				],
				[
					9,
					78
				],
				[
					36,
					-3
				]
			],
			[
				[
					3699,
					3394
				],
				[
					74,
					-28
				],
				[
					93,
					88
				]
			],
			[
				[
					3866,
					3454
				],
				[
					95,
					-58
				],
				[
					10,
					89
				],
				[
					69,
					18
				],
				[
					-15,
					-45
				],
				[
					67,
					-36
				],
				[
					58,
					8
				],
				[
					54,
					-84
				]
			],
			[
				[
					4541,
					3183
				],
				[
					-11,
					-97
				],
				[
					-60,
					5
				],
				[
					-36,
					-39
				],
				[
					-41,
					72
				],
				[
					-70,
					-66
				]
			],
			[
				[
					4204,
					3346
				],
				[
					75,
					-3
				],
				[
					-32,
					57
				],
				[
					21,
					120
				],
				[
					133,
					-51
				],
				[
					9,
					35
				],
				[
					165,
					73
				],
				[
					68,
					94
				],
				[
					-8,
					46
				]
			],
			[
				[
					4635,
					3717
				],
				[
					77,
					3
				],
				[
					18,
					-66
				],
				[
					56,
					-45
				],
				[
					29,
					-82
				]
			],
			[
				[
					4575,
					4074
				],
				[
					-59,
					-91
				],
				[
					10,
					-83
				]
			],
			[
				[
					4526,
					3900
				],
				[
					-44,
					-21
				],
				[
					-100,
					-107
				],
				[
					-63,
					-8
				],
				[
					-39,
					52
				],
				[
					-43,
					-20
				],
				[
					-116,
					43
				],
				[
					-21,
					-53
				],
				[
					-71,
					-45
				],
				[
					23,
					-20
				],
				[
					-70,
					-47
				]
			],
			[
				[
					3982,
					3674
				],
				[
					15,
					65
				],
				[
					-81,
					11
				],
				[
					3,
					58
				],
				[
					-41,
					46
				]
			],
			[
				[
					4972,
					3969
				],
				[
					-3,
					-73
				],
				[
					83,
					-96
				],
				[
					6,
					-112
				],
				[
					42,
					-57
				]
			],
			[
				[
					4635,
					3717
				],
				[
					-19,
					137
				],
				[
					-39,
					50
				],
				[
					-51,
					-4
				]
			],
			[
				[
					3866,
					3454
				],
				[
					37,
					66
				],
				[
					-5,
					65
				],
				[
					68,
					35
				],
				[
					16,
					54
				]
			],
			[
				[
					3989,
					2716
				],
				[
					36,
					-142
				],
				[
					-43,
					-35
				],
				[
					-4,
					-76
				],
				[
					66,
					-40
				],
				[
					48,
					31
				],
				[
					163,
					-141
				]
			],
			[
				[
					4044,
					2074
				],
				[
					-93,
					46
				],
				[
					-11,
					66
				],
				[
					-63,
					-58
				],
				[
					-68,
					146
				],
				[
					-69,
					23
				],
				[
					-8,
					-33
				],
				[
					-80,
					-2
				],
				[
					-29,
					-39
				]
			],
			[
				[
					3623,
					2223
				],
				[
					-47,
					66
				],
				[
					-75,
					41
				]
			],
			[
				[
					3501,
					2330
				],
				[
					-41,
					50
				],
				[
					40,
					53
				],
				[
					-92,
					91
				],
				[
					-21,
					62
				],
				[
					25,
					79
				],
				[
					-26,
					89
				]
			],
			[
				[
					3386,
					2754
				],
				[
					39,
					7
				],
				[
					-34,
					108
				]
			],
			[
				[
					3391,
					2869
				],
				[
					92,
					19
				],
				[
					49,
					-98
				],
				[
					86,
					26
				],
				[
					36,
					-21
				],
				[
					130,
					42
				],
				[
					73,
					-15
				],
				[
					32,
					-48
				],
				[
					100,
					-58
				]
			],
			[
				[
					4318,
					3039
				],
				[
					-72,
					-57
				],
				[
					-10,
					-112
				]
			],
			[
				[
					4236,
					2870
				],
				[
					-52,
					54
				],
				[
					-100,
					27
				]
			],
			[
				[
					4084,
					2951
				],
				[
					-137,
					-1
				],
				[
					-47,
					60
				],
				[
					25,
					90
				],
				[
					-47,
					45
				],
				[
					-100,
					-8
				],
				[
					40,
					54
				]
			],
			[
				[
					4084,
					2951
				],
				[
					17,
					-95
				]
			],
			[
				[
					4101,
					2856
				],
				[
					0,
					-2
				]
			],
			[
				[
					4101,
					2854
				],
				[
					12,
					-88
				],
				[
					-25,
					-17
				]
			],
			[
				[
					4088,
					2749
				],
				[
					-99,
					-33
				]
			],
			[
				[
					3391,
					2869
				],
				[
					-28,
					91
				]
			],
			[
				[
					3363,
					2960
				],
				[
					-11,
					64
				],
				[
					33,
					38
				]
			],
			[
				[
					3385,
					3062
				],
				[
					37,
					-36
				],
				[
					53,
					50
				],
				[
					47,
					-17
				],
				[
					84,
					19
				],
				[
					-29,
					86
				],
				[
					67,
					65
				],
				[
					92,
					8
				]
			],
			[
				[
					4236,
					2870
				],
				[
					-37,
					-42
				],
				[
					2,
					-11
				],
				[
					19,
					-13
				]
			],
			[
				[
					4220,
					2804
				],
				[
					1,
					-1
				]
			],
			[
				[
					4221,
					2803
				],
				[
					0,
					-1
				],
				[
					-3,
					-1
				],
				[
					-6,
					3
				],
				[
					-14,
					12
				],
				[
					-19,
					-17
				],
				[
					-2,
					18
				],
				[
					-34,
					14
				],
				[
					-28,
					18
				],
				[
					-6,
					0
				],
				[
					-6,
					4
				],
				[
					0,
					2
				],
				[
					-2,
					1
				]
			],
			[
				[
					4221,
					2803
				],
				[
					2,
					-1
				]
			],
			[
				[
					4223,
					2802
				],
				[
					23,
					-41
				],
				[
					-60,
					-1
				],
				[
					-23,
					-98
				],
				[
					-61,
					-24
				],
				[
					-32,
					79
				],
				[
					18,
					32
				]
			],
			[
				[
					4101,
					2854
				],
				[
					0,
					2
				]
			],
			[
				[
					4223,
					2802
				],
				[
					-3,
					2
				]
			],
			[
				[
					2822,
					3669
				],
				[
					3,
					-118
				],
				[
					35,
					-63
				],
				[
					-15,
					-85
				],
				[
					-54,
					-67
				],
				[
					-85,
					50
				],
				[
					-20,
					85
				],
				[
					-95,
					3
				],
				[
					-16,
					-82
				],
				[
					-36,
					-11
				]
			],
			[
				[
					3699,
					3394
				],
				[
					8,
					73
				],
				[
					-93,
					98
				],
				[
					-56,
					18
				],
				[
					83,
					79
				],
				[
					-41,
					14
				],
				[
					56,
					135
				],
				[
					-61,
					45
				],
				[
					-25,
					-57
				],
				[
					-67,
					-56
				],
				[
					-63,
					12
				],
				[
					-32,
					-51
				],
				[
					-101,
					-8
				],
				[
					-39,
					-70
				]
			],
			[
				[
					3268,
					3626
				],
				[
					-31,
					-33
				],
				[
					-92,
					22
				],
				[
					-6,
					89
				],
				[
					-44,
					16
				],
				[
					-54,
					130
				],
				[
					-45,
					3
				]
			],
			[
				[
					3268,
					3626
				],
				[
					60,
					-27
				],
				[
					-7,
					-107
				]
			],
			[
				[
					3321,
					3492
				],
				[
					-93,
					-23
				],
				[
					12,
					-53
				],
				[
					-79,
					1
				],
				[
					-82,
					-81
				],
				[
					-44,
					2
				],
				[
					-19,
					-55
				]
			],
			[
				[
					3016,
					3283
				],
				[
					-101,
					-39
				],
				[
					-81,
					35
				],
				[
					-82,
					-25
				],
				[
					-17,
					-40
				],
				[
					83,
					-12
				],
				[
					16,
					-92
				],
				[
					-92,
					-5
				],
				[
					-44,
					-91
				],
				[
					-117,
					-10
				]
			],
			[
				[
					3385,
					3062
				],
				[
					18,
					61
				],
				[
					-54,
					66
				],
				[
					-7,
					105
				],
				[
					24,
					49
				],
				[
					61,
					13
				],
				[
					20,
					58
				],
				[
					-126,
					78
				]
			],
			[
				[
					3363,
					2960
				],
				[
					-50,
					-75
				],
				[
					-53,
					-7
				],
				[
					-31,
					133
				],
				[
					-45,
					-48
				],
				[
					-39,
					15
				],
				[
					50,
					69
				],
				[
					-39,
					69
				],
				[
					6,
					53
				],
				[
					-97,
					30
				],
				[
					-67,
					-30
				],
				[
					18,
					114
				]
			],
			[
				[
					4017,
					1258
				],
				[
					-39,
					12
				],
				[
					15,
					62
				],
				[
					-85,
					5
				],
				[
					29,
					70
				],
				[
					43,
					-6
				],
				[
					-8,
					79
				],
				[
					30,
					67
				],
				[
					58,
					-102
				],
				[
					-13,
					-147
				],
				[
					-30,
					-40
				]
			],
			[
				[
					3936,
					1086
				],
				[
					-86,
					-6
				],
				[
					2,
					84
				],
				[
					-123,
					13
				],
				[
					25,
					49
				]
			],
			[
				[
					3754,
					1226
				],
				[
					7,
					137
				],
				[
					-70,
					0
				],
				[
					27,
					201
				]
			],
			[
				[
					3718,
					1564
				],
				[
					68,
					35
				],
				[
					87,
					-18
				],
				[
					41,
					64
				],
				[
					2,
					108
				],
				[
					85,
					27
				],
				[
					3,
					-49
				],
				[
					76,
					-68
				],
				[
					-88,
					-21
				],
				[
					116,
					-73
				],
				[
					28,
					62
				],
				[
					123,
					-61
				],
				[
					6,
					-59
				]
			],
			[
				[
					3718,
					1564
				],
				[
					-79,
					12
				],
				[
					-2,
					60
				],
				[
					-82,
					-61
				],
				[
					-37,
					47
				]
			],
			[
				[
					3518,
					1622
				],
				[
					27,
					9
				],
				[
					-15,
					87
				],
				[
					24,
					25
				],
				[
					-55,
					72
				],
				[
					12,
					51
				],
				[
					66,
					-63
				],
				[
					115,
					44
				],
				[
					-64,
					77
				],
				[
					25,
					84
				],
				[
					8,
					137
				],
				[
					-38,
					78
				]
			],
			[
				[
					3754,
					1226
				],
				[
					-44,
					17
				],
				[
					-102,
					-57
				],
				[
					68,
					-31
				],
				[
					38,
					-59
				],
				[
					-71,
					-54
				],
				[
					-3,
					-65
				],
				[
					-38,
					7
				],
				[
					-73,
					-48
				],
				[
					-28,
					71
				],
				[
					-96,
					-26
				]
			],
			[
				[
					3405,
					981
				],
				[
					0,
					114
				],
				[
					-32,
					69
				]
			],
			[
				[
					3373,
					1164
				],
				[
					-24,
					153
				],
				[
					-79,
					121
				],
				[
					110,
					134
				],
				[
					23,
					-29
				],
				[
					83,
					59
				]
			],
			[
				[
					3486,
					1602
				],
				[
					-2,
					6
				]
			],
			[
				[
					3484,
					1608
				],
				[
					-3,
					7
				]
			],
			[
				[
					3481,
					1615
				],
				[
					37,
					7
				]
			],
			[
				[
					3673,
					412
				],
				[
					-14,
					-40
				]
			],
			[
				[
					3659,
					372
				],
				[
					-18,
					-68
				],
				[
					35,
					-93
				],
				[
					-101,
					-150
				],
				[
					-93,
					-61
				],
				[
					-47,
					0
				],
				[
					51,
					134
				],
				[
					-94,
					3
				],
				[
					-11,
					69
				],
				[
					-49,
					77
				],
				[
					-34,
					-7
				],
				[
					-29,
					72
				],
				[
					-74,
					-10
				],
				[
					-76,
					85
				],
				[
					-38,
					-77
				],
				[
					-102,
					63
				]
			],
			[
				[
					2979,
					409
				],
				[
					72,
					34
				]
			],
			[
				[
					3051,
					443
				],
				[
					39,
					-8
				],
				[
					74,
					90
				],
				[
					109,
					-26
				],
				[
					71,
					35
				],
				[
					12,
					-52
				],
				[
					44,
					47
				],
				[
					-11,
					111
				],
				[
					-41,
					31
				],
				[
					54,
					45
				]
			],
			[
				[
					3402,
					716
				],
				[
					139,
					57
				],
				[
					54,
					-74
				],
				[
					49,
					-11
				],
				[
					50,
					-146
				],
				[
					-21,
					-130
				]
			],
			[
				[
					4003,
					347
				],
				[
					-86,
					-30
				],
				[
					-69,
					58
				],
				[
					-75,
					15
				],
				[
					-19,
					-47
				],
				[
					-95,
					29
				]
			],
			[
				[
					3659,
					372
				],
				[
					14,
					40
				]
			],
			[
				[
					3402,
					716
				],
				[
					-44,
					62
				]
			],
			[
				[
					3358,
					778
				],
				[
					23,
					20
				],
				[
					-15,
					87
				],
				[
					39,
					96
				]
			],
			[
				[
					2714,
					1934
				],
				[
					-44,
					-31
				],
				[
					25,
					-48
				]
			],
			[
				[
					2695,
					1855
				],
				[
					-112,
					19
				]
			],
			[
				[
					2583,
					1874
				],
				[
					-32,
					60
				]
			],
			[
				[
					2551,
					1934
				],
				[
					15,
					56
				]
			],
			[
				[
					2566,
					1990
				],
				[
					1,
					0
				],
				[
					0,
					1
				],
				[
					2,
					0
				],
				[
					4,
					1
				],
				[
					3,
					-3
				],
				[
					3,
					3
				],
				[
					10,
					-7
				],
				[
					8,
					-30
				],
				[
					38,
					49
				],
				[
					19,
					-67
				],
				[
					60,
					-3
				]
			],
			[
				[
					2566,
					1990
				],
				[
					1,
					4
				]
			],
			[
				[
					2567,
					1994
				],
				[
					39,
					73
				],
				[
					88,
					-14
				]
			],
			[
				[
					2694,
					2053
				],
				[
					12,
					-66
				],
				[
					43,
					-28
				]
			],
			[
				[
					2749,
					1959
				],
				[
					-33,
					-24
				]
			],
			[
				[
					2716,
					1935
				],
				[
					-2,
					-1
				]
			],
			[
				[
					2415,
					2025
				],
				[
					-7,
					6
				]
			],
			[
				[
					2408,
					2031
				],
				[
					7,
					-6
				]
			],
			[
				[
					2583,
					1874
				],
				[
					-6,
					-114
				]
			],
			[
				[
					2577,
					1760
				],
				[
					-50,
					-59
				],
				[
					-69,
					12
				],
				[
					-78,
					-63
				],
				[
					-3,
					-49
				],
				[
					-62,
					29
				]
			],
			[
				[
					2315,
					1630
				],
				[
					-17,
					108
				],
				[
					104,
					156
				],
				[
					-59,
					69
				]
			],
			[
				[
					2343,
					1963
				],
				[
					76,
					49
				]
			],
			[
				[
					2419,
					2012
				],
				[
					101,
					17
				],
				[
					31,
					-95
				]
			],
			[
				[
					2900,
					1932
				],
				[
					-12,
					-87
				]
			],
			[
				[
					2888,
					1845
				],
				[
					-87,
					-42
				],
				[
					-86,
					12
				],
				[
					-20,
					40
				]
			],
			[
				[
					2714,
					1934
				],
				[
					2,
					1
				]
			],
			[
				[
					2749,
					1959
				],
				[
					151,
					-27
				]
			],
			[
				[
					2888,
					1845
				],
				[
					86,
					-99
				],
				[
					-10,
					-94
				]
			],
			[
				[
					2964,
					1652
				],
				[
					-92,
					-29
				],
				[
					-137,
					64
				],
				[
					-56,
					0
				],
				[
					-18,
					50
				],
				[
					-59,
					-4
				]
			],
			[
				[
					2602,
					1733
				],
				[
					-25,
					27
				]
			],
			[
				[
					2999,
					1959
				],
				[
					93,
					0
				],
				[
					39,
					-71
				],
				[
					75,
					-7
				],
				[
					3,
					38
				],
				[
					78,
					-22
				]
			],
			[
				[
					3287,
					1897
				],
				[
					-35,
					-124
				]
			],
			[
				[
					3252,
					1773
				],
				[
					-42,
					-12
				],
				[
					-62,
					-84
				],
				[
					-67,
					7
				],
				[
					-56,
					-57
				],
				[
					-59,
					22
				]
			],
			[
				[
					2966,
					1649
				],
				[
					-2,
					3
				]
			],
			[
				[
					2900,
					1932
				],
				[
					99,
					27
				]
			],
			[
				[
					2694,
					2053
				],
				[
					55,
					70
				]
			],
			[
				[
					2749,
					2123
				],
				[
					50,
					21
				]
			],
			[
				[
					2799,
					2144
				],
				[
					64,
					-32
				],
				[
					102,
					8
				],
				[
					16,
					52
				],
				[
					58,
					2
				],
				[
					51,
					-50
				],
				[
					22,
					-89
				],
				[
					-102,
					-17
				],
				[
					-11,
					-59
				]
			],
			[
				[
					2567,
					1994
				],
				[
					-1,
					-4
				]
			],
			[
				[
					2419,
					2012
				],
				[
					-4,
					13
				]
			],
			[
				[
					2408,
					2031
				],
				[
					35,
					46
				],
				[
					-21,
					96
				],
				[
					34,
					6
				],
				[
					-33,
					101
				]
			],
			[
				[
					2423,
					2280
				],
				[
					64,
					-22
				],
				[
					46,
					-76
				],
				[
					67,
					-48
				],
				[
					26,
					22
				],
				[
					120,
					-7
				],
				[
					3,
					-26
				]
			],
			[
				[
					2831,
					2314
				],
				[
					-72,
					-62
				],
				[
					33,
					-27
				],
				[
					-42,
					-57
				],
				[
					49,
					-24
				]
			],
			[
				[
					2423,
					2280
				],
				[
					-21,
					49
				]
			],
			[
				[
					2402,
					2329
				],
				[
					11,
					31
				]
			],
			[
				[
					2413,
					2360
				],
				[
					67,
					-4
				],
				[
					78,
					45
				],
				[
					12,
					72
				],
				[
					57,
					-26
				],
				[
					1,
					-73
				],
				[
					32,
					25
				],
				[
					114,
					-9
				],
				[
					57,
					-76
				]
			],
			[
				[
					2853,
					2727
				],
				[
					56,
					-79
				],
				[
					-65,
					-27
				],
				[
					9,
					-85
				],
				[
					-58,
					-67
				],
				[
					69,
					-70
				],
				[
					27,
					35
				],
				[
					8,
					-79
				]
			],
			[
				[
					2899,
					2355
				],
				[
					-68,
					-41
				]
			],
			[
				[
					2413,
					2360
				],
				[
					-59,
					98
				]
			],
			[
				[
					2354,
					2458
				],
				[
					0,
					48
				]
			],
			[
				[
					2354,
					2506
				],
				[
					111,
					24
				],
				[
					73,
					104
				]
			],
			[
				[
					2538,
					2634
				],
				[
					81,
					-24
				],
				[
					9,
					71
				],
				[
					64,
					-41
				],
				[
					72,
					117
				],
				[
					89,
					-30
				]
			],
			[
				[
					3501,
					2330
				],
				[
					-46,
					-24
				],
				[
					-173,
					5
				],
				[
					26,
					-82
				],
				[
					-77,
					-17
				],
				[
					-14,
					-34
				]
			],
			[
				[
					3217,
					2178
				],
				[
					-17,
					-31
				],
				[
					-65,
					48
				],
				[
					-67,
					0
				],
				[
					-92,
					66
				],
				[
					-1,
					64
				],
				[
					-76,
					30
				]
			],
			[
				[
					2853,
					2727
				],
				[
					2,
					34
				],
				[
					100,
					-20
				],
				[
					-1,
					54
				],
				[
					57,
					17
				],
				[
					56,
					-40
				],
				[
					70,
					11
				],
				[
					42,
					-51
				],
				[
					207,
					22
				]
			],
			[
				[
					3217,
					2178
				],
				[
					93,
					-1
				],
				[
					16,
					-77
				],
				[
					-46,
					-9
				],
				[
					-14,
					-126
				],
				[
					21,
					-68
				]
			],
			[
				[
					3486,
					1602
				],
				[
					-2,
					6
				]
			],
			[
				[
					3481,
					1615
				],
				[
					-41,
					53
				],
				[
					-53,
					6
				],
				[
					-59,
					66
				],
				[
					-60,
					-15
				],
				[
					-16,
					48
				]
			],
			[
				[
					1973,
					2357
				],
				[
					143,
					-64
				],
				[
					-9,
					-116
				],
				[
					-96,
					19
				],
				[
					-88,
					43
				]
			],
			[
				[
					2006,
					2036
				],
				[
					-2,
					-4
				]
			],
			[
				[
					2004,
					2032
				],
				[
					2,
					4
				]
			],
			[
				[
					2402,
					2329
				],
				[
					-98,
					-18
				],
				[
					-34,
					-73
				],
				[
					-108,
					1
				],
				[
					-67,
					-221
				]
			],
			[
				[
					2095,
					2018
				],
				[
					-61,
					20
				]
			],
			[
				[
					2034,
					2038
				],
				[
					-89,
					36
				],
				[
					-8,
					65
				],
				[
					47,
					29
				],
				[
					-74,
					60
				]
			],
			[
				[
					2006,
					2494
				],
				[
					30,
					30
				],
				[
					82,
					-44
				],
				[
					11,
					-129
				],
				[
					47,
					-22
				],
				[
					71,
					40
				],
				[
					-34,
					68
				],
				[
					26,
					34
				],
				[
					115,
					-13
				]
			],
			[
				[
					2034,
					2038
				],
				[
					-28,
					-2
				]
			],
			[
				[
					2004,
					2032
				],
				[
					43,
					-79
				],
				[
					41,
					-17
				],
				[
					-33,
					-129
				],
				[
					-99,
					-90
				],
				[
					-77,
					19
				]
			],
			[
				[
					1879,
					1736
				],
				[
					-18,
					33
				],
				[
					-176,
					76
				],
				[
					-16,
					41
				]
			],
			[
				[
					1669,
					1886
				],
				[
					17,
					55
				],
				[
					98,
					77
				],
				[
					25,
					88
				],
				[
					78,
					103
				]
			],
			[
				[
					2097,
					2782
				],
				[
					0,
					-6
				]
			],
			[
				[
					2103,
					2788
				],
				[
					-5,
					-2
				]
			],
			[
				[
					2098,
					2788
				],
				[
					5,
					0
				]
			],
			[
				[
					2313,
					2923
				],
				[
					-16,
					-52
				],
				[
					38,
					-91
				],
				[
					-56,
					-62
				],
				[
					-72,
					-7
				]
			],
			[
				[
					2207,
					2711
				],
				[
					-48,
					83
				]
			],
			[
				[
					2159,
					2794
				],
				[
					-22,
					80
				],
				[
					28,
					55
				]
			],
			[
				[
					2159,
					2794
				],
				[
					-56,
					-6
				]
			],
			[
				[
					2538,
					2634
				],
				[
					-1,
					41
				],
				[
					-65,
					30
				],
				[
					-22,
					53
				],
				[
					88,
					74
				],
				[
					-19,
					34
				],
				[
					47,
					71
				]
			],
			[
				[
					2569,
					2967
				],
				[
					9,
					15
				]
			],
			[
				[
					2354,
					2506
				],
				[
					-197,
					78
				],
				[
					50,
					127
				]
			],
			[
				[
					2343,
					1963
				],
				[
					-71,
					66
				],
				[
					-82,
					-1
				],
				[
					-51,
					-51
				],
				[
					-44,
					41
				]
			],
			[
				[
					2315,
					1630
				],
				[
					48,
					-77
				],
				[
					-44,
					-61
				]
			],
			[
				[
					2319,
					1492
				],
				[
					-30,
					-50
				]
			],
			[
				[
					2289,
					1442
				],
				[
					-112,
					43
				],
				[
					-89,
					-37
				],
				[
					8,
					-88
				],
				[
					-107,
					31
				],
				[
					-25,
					63
				],
				[
					-20,
					-49
				]
			],
			[
				[
					1944,
					1405
				],
				[
					-57,
					68
				]
			],
			[
				[
					1887,
					1473
				],
				[
					27,
					116
				],
				[
					-42,
					41
				],
				[
					7,
					106
				]
			],
			[
				[
					1582,
					1018
				],
				[
					61,
					-50
				],
				[
					-1,
					-96
				],
				[
					-32,
					-46
				]
			],
			[
				[
					1610,
					826
				],
				[
					-98,
					-35
				],
				[
					-43,
					87
				],
				[
					-76,
					18
				]
			],
			[
				[
					1393,
					896
				],
				[
					-35,
					100
				],
				[
					7,
					105
				]
			],
			[
				[
					1365,
					1101
				],
				[
					137,
					-3
				],
				[
					80,
					-80
				]
			],
			[
				[
					1610,
					826
				],
				[
					5,
					-32
				],
				[
					97,
					-18
				],
				[
					-9,
					-125
				],
				[
					-35,
					-53
				],
				[
					16,
					-45
				],
				[
					-85,
					-65
				],
				[
					18,
					-76
				]
			],
			[
				[
					1617,
					412
				],
				[
					-60,
					1
				],
				[
					-18,
					-39
				],
				[
					-80,
					-32
				],
				[
					-61,
					57
				],
				[
					-78,
					114
				],
				[
					21,
					98
				],
				[
					-12,
					63
				],
				[
					21,
					122
				],
				[
					43,
					100
				]
			],
			[
				[
					1824,
					1391
				],
				[
					-27,
					-89
				],
				[
					44,
					-29
				],
				[
					4,
					-83
				],
				[
					-42,
					-76
				],
				[
					31,
					-65
				],
				[
					-45,
					-16
				],
				[
					22,
					-71
				]
			],
			[
				[
					1811,
					962
				],
				[
					-51,
					64
				],
				[
					-121,
					9
				],
				[
					-57,
					-17
				]
			],
			[
				[
					1365,
					1101
				],
				[
					72,
					143
				],
				[
					19,
					96
				],
				[
					43,
					43
				],
				[
					5,
					131
				]
			],
			[
				[
					1504,
					1514
				],
				[
					135,
					-36
				],
				[
					45,
					-44
				],
				[
					13,
					-107
				],
				[
					31,
					47
				],
				[
					96,
					17
				]
			],
			[
				[
					1887,
					1473
				],
				[
					-63,
					-82
				]
			],
			[
				[
					1504,
					1514
				],
				[
					43,
					109
				],
				[
					-1,
					99
				],
				[
					34,
					71
				],
				[
					89,
					93
				]
			],
			[
				[
					2289,
					1442
				],
				[
					-14,
					-82
				],
				[
					-57,
					-34
				],
				[
					40,
					-56
				],
				[
					17,
					-83
				],
				[
					76,
					1
				],
				[
					56,
					-100
				],
				[
					55,
					2
				],
				[
					34,
					-51
				],
				[
					-49,
					-13
				],
				[
					58,
					-42
				],
				[
					4,
					-116
				]
			],
			[
				[
					2509,
					868
				],
				[
					-106,
					-32
				],
				[
					-27,
					-45
				],
				[
					-85,
					9
				],
				[
					-79,
					-39
				]
			],
			[
				[
					2212,
					761
				],
				[
					-41,
					118
				],
				[
					59,
					34
				],
				[
					-15,
					81
				],
				[
					-80,
					104
				],
				[
					-21,
					69
				],
				[
					-64,
					20
				],
				[
					-89,
					-26
				],
				[
					-37,
					167
				],
				[
					35,
					2
				],
				[
					-15,
					75
				]
			],
			[
				[
					2212,
					761
				],
				[
					-21,
					-70
				]
			],
			[
				[
					2191,
					691
				],
				[
					-83,
					-32
				]
			],
			[
				[
					2108,
					659
				],
				[
					-3,
					70
				],
				[
					-57,
					39
				],
				[
					-18,
					56
				],
				[
					-109,
					73
				],
				[
					31,
					43
				],
				[
					-94,
					-11
				],
				[
					-47,
					33
				]
			],
			[
				[
					2581,
					832
				],
				[
					34,
					-14
				],
				[
					-20,
					-75
				],
				[
					-40,
					23
				],
				[
					0,
					-67
				]
			],
			[
				[
					2555,
					699
				],
				[
					-3,
					-35
				],
				[
					85,
					-60
				],
				[
					36,
					-89
				],
				[
					-34,
					-15
				],
				[
					-73,
					70
				],
				[
					-80,
					42
				],
				[
					-34,
					-11
				],
				[
					46,
					-58
				],
				[
					-84,
					-46
				],
				[
					-17,
					69
				],
				[
					-51,
					42
				],
				[
					-64,
					-58
				],
				[
					-63,
					138
				],
				[
					-28,
					3
				]
			],
			[
				[
					2509,
					868
				],
				[
					72,
					-36
				]
			],
			[
				[
					2108,
					659
				],
				[
					-28,
					-15
				],
				[
					-55,
					-118
				],
				[
					52,
					-46
				],
				[
					102,
					44
				],
				[
					-13,
					-100
				],
				[
					-53,
					49
				],
				[
					-47,
					-41
				],
				[
					30,
					-26
				],
				[
					-129,
					-15
				],
				[
					-28,
					46
				],
				[
					-75,
					20
				],
				[
					-90,
					-82
				],
				[
					-138,
					-14
				],
				[
					-19,
					51
				]
			],
			[
				[
					2966,
					1649
				],
				[
					-1,
					-60
				],
				[
					42,
					-94
				],
				[
					-45,
					-31
				],
				[
					9,
					-58
				],
				[
					-68,
					-93
				],
				[
					-13,
					-60
				]
			],
			[
				[
					2890,
					1253
				],
				[
					6,
					-26
				],
				[
					-88,
					-18
				],
				[
					-32,
					53
				]
			],
			[
				[
					2776,
					1262
				],
				[
					-44,
					60
				],
				[
					-84,
					-6
				]
			],
			[
				[
					2648,
					1316
				],
				[
					19,
					35
				],
				[
					-25,
					78
				],
				[
					-40,
					7
				],
				[
					-10,
					71
				],
				[
					43,
					160
				],
				[
					-33,
					66
				]
			],
			[
				[
					2648,
					1316
				],
				[
					-92,
					-29
				],
				[
					-69,
					70
				],
				[
					-57,
					-43
				],
				[
					-51,
					71
				],
				[
					10,
					80
				],
				[
					-70,
					27
				]
			],
			[
				[
					3373,
					1164
				],
				[
					-37,
					-28
				],
				[
					-7,
					111
				],
				[
					-127,
					86
				],
				[
					-111,
					-117
				],
				[
					2,
					-36
				],
				[
					-68,
					-9
				],
				[
					-51,
					49
				],
				[
					-40,
					-22
				],
				[
					-44,
					55
				]
			],
			[
				[
					3358,
					778
				],
				[
					-71,
					19
				],
				[
					-66,
					-50
				],
				[
					47,
					-55
				],
				[
					-21,
					-69
				],
				[
					-48,
					-29
				],
				[
					-59,
					71
				],
				[
					25,
					68
				],
				[
					-29,
					81
				],
				[
					22,
					85
				],
				[
					-99,
					29
				],
				[
					-63,
					-23
				],
				[
					-15,
					48
				]
			],
			[
				[
					2981,
					953
				],
				[
					-82,
					96
				],
				[
					-118,
					24
				],
				[
					-51,
					84
				],
				[
					15,
					85
				],
				[
					31,
					20
				]
			],
			[
				[
					2801,
					796
				],
				[
					25,
					-78
				],
				[
					42,
					-18
				],
				[
					-15,
					-61
				],
				[
					100,
					-31
				],
				[
					43,
					-47
				],
				[
					82,
					-21
				],
				[
					15,
					-40
				],
				[
					-42,
					-57
				]
			],
			[
				[
					2979,
					409
				],
				[
					-41,
					4
				],
				[
					-44,
					82
				],
				[
					-116,
					14
				],
				[
					-69,
					44
				],
				[
					-31,
					59
				],
				[
					-123,
					87
				]
			],
			[
				[
					2581,
					832
				],
				[
					32,
					89
				],
				[
					124,
					4
				],
				[
					-8,
					-71
				],
				[
					72,
					-58
				]
			],
			[
				[
					2801,
					796
				],
				[
					35,
					103
				],
				[
					76,
					38
				],
				[
					36,
					-30
				],
				[
					33,
					46
				]
			],
			[
				[
					899,
					2670
				],
				[
					113,
					-134
				],
				[
					-27,
					-80
				]
			],
			[
				[
					985,
					2456
				],
				[
					-35,
					-58
				],
				[
					-37,
					99
				],
				[
					-58,
					45
				],
				[
					-81,
					-14
				],
				[
					-2,
					-79
				],
				[
					-76,
					17
				],
				[
					-12,
					71
				]
			],
			[
				[
					684,
					2537
				],
				[
					105,
					70
				],
				[
					15,
					71
				]
			],
			[
				[
					804,
					2678
				],
				[
					95,
					-8
				]
			],
			[
				[
					818,
					3051
				],
				[
					53,
					-36
				],
				[
					-3,
					-96
				],
				[
					-125,
					-68
				],
				[
					-2,
					-55
				],
				[
					98,
					-70
				],
				[
					-35,
					-48
				]
			],
			[
				[
					684,
					2537
				],
				[
					-43,
					80
				],
				[
					-65,
					55
				],
				[
					11,
					58
				],
				[
					-36,
					69
				],
				[
					-109,
					74
				],
				[
					-36,
					-16
				],
				[
					4,
					113
				]
			],
			[
				[
					1137,
					2784
				],
				[
					-110,
					-24
				],
				[
					-26,
					-67
				],
				[
					-80,
					16
				],
				[
					-22,
					-39
				]
			],
			[
				[
					1198,
					2463
				],
				[
					-60,
					-61
				],
				[
					-107,
					10
				],
				[
					-46,
					44
				]
			]
		],
		"transform": {
			"scale": [
				0.0012539581947004495,
				0.0007679418528290547
			],
			"translate": [
				5.866250350509938,
				47.270265005580185
			]
		},
		"objects": {
			"constituencies": {
				"type": "GeometryCollection",
				"geometries": [
					{
						"arcs": [
							[
								0,
								1,
								2
							]
						],
						"type": "Polygon",
						"id": "1"
					},
					{
						"arcs": [
							[
								[
									3
								]
							],
							[
								[
									4
								]
							],
							[
								[
									5
								]
							],
							[
								[
									-2,
									6,
									7,
									8
								]
							]
						],
						"type": "MultiPolygon",
						"id": "2"
					},
					{
						"arcs": [
							[
								9,
								10,
								11,
								12,
								13,
								14,
								-8
							]
						],
						"type": "Polygon",
						"id": "3"
					},
					{
						"arcs": [
							[
								15,
								16,
								17,
								-10,
								-7,
								-1
							]
						],
						"type": "Polygon",
						"id": "4"
					},
					{
						"arcs": [
							[
								18,
								-17,
								19
							]
						],
						"type": "Polygon",
						"id": "5"
					},
					{
						"arcs": [
							[
								20,
								21,
								-11,
								-18,
								-19,
								22
							]
						],
						"type": "Polygon",
						"id": "6"
					},
					{
						"arcs": [
							[
								23,
								24,
								25,
								26,
								27,
								28,
								-13
							]
						],
						"type": "Polygon",
						"id": "7"
					},
					{
						"arcs": [
							[
								29,
								30,
								31,
								32,
								33,
								34,
								35,
								36,
								-24,
								-12,
								-22
							]
						],
						"type": "Polygon",
						"id": "8"
					},
					{
						"arcs": [
							[
								[
									37,
									-30,
									-21,
									38
								]
							],
							[
								[
									39
								]
							]
						],
						"type": "MultiPolygon",
						"id": "9"
					},
					{
						"arcs": [
							[
								40,
								41,
								42,
								43,
								44,
								45,
								46,
								47,
								-32,
								48
							]
						],
						"type": "Polygon",
						"id": "10"
					},
					{
						"arcs": [
							[
								49,
								-49,
								-31,
								-38,
								50
							]
						],
						"type": "Polygon",
						"id": "11"
					},
					{
						"arcs": [
							[
								51,
								52,
								-41,
								-50,
								53,
								54
							]
						],
						"type": "Polygon",
						"id": "12"
					},
					{
						"arcs": [
							[
								[
									55
								]
							],
							[
								[
									56,
									57,
									-55,
									58,
									59
								]
							]
						],
						"type": "MultiPolygon",
						"id": "13"
					},
					{
						"arcs": [
							[
								60,
								-60,
								61,
								62
							]
						],
						"type": "Polygon",
						"id": "14"
					},
					{
						"arcs": [
							[
								[
									63
								]
							],
							[
								[
									64,
									65,
									-63,
									66
								],
								[
									67
								]
							]
						],
						"type": "MultiPolygon",
						"id": "15"
					},
					{
						"arcs": [
							[
								[
									68,
									69,
									-65,
									70
								]
							],
							[
								[
									71
								]
							]
						],
						"type": "MultiPolygon",
						"id": "16"
					},
					{
						"arcs": [
							[
								-70,
								72,
								73,
								74,
								-57,
								-61,
								-66
							]
						],
						"type": "Polygon",
						"id": "17"
					},
					{
						"arcs": [
							[
								75,
								76,
								-46,
								77,
								78,
								79,
								80,
								81
							]
						],
						"type": "Polygon",
						"id": "18"
					},
					{
						"arcs": [
							[
								82,
								-80,
								83,
								-27,
								84
							]
						],
						"type": "Polygon",
						"id": "19"
					},
					{
						"arcs": [
							[
								85,
								-81,
								-83,
								86,
								-25,
								-37,
								87
							]
						],
						"type": "Polygon",
						"id": "20"
					},
					{
						"arcs": [
							[
								88,
								89,
								-82,
								-86,
								90,
								-35
							]
						],
						"type": "Polygon",
						"id": "21"
					},
					{
						"arcs": [
							[
								-90,
								91,
								-33,
								-48,
								92,
								-76
							]
						],
						"type": "Polygon",
						"id": "22"
					},
					{
						"arcs": [
							[
								93,
								-44,
								94,
								95,
								-78
							]
						],
						"type": "Polygon",
						"id": "23"
					},
					{
						"arcs": [
							[
								[
									96,
									97,
									98
								]
							],
							[
								[
									99
								]
							]
						],
						"type": "MultiPolygon",
						"id": "24"
					},
					{
						"arcs": [
							[
								[
									100,
									101,
									102,
									103,
									104,
									-98
								]
							],
							[
								[
									105
								]
							]
						],
						"type": "MultiPolygon",
						"id": "25"
					},
					{
						"arcs": [
							[
								106,
								107,
								-101,
								-97,
								108
							]
						],
						"type": "Polygon",
						"id": "26"
					},
					{
						"arcs": [
							[
								109,
								110,
								-102,
								-108
							]
						],
						"type": "Polygon",
						"id": "27"
					},
					{
						"arcs": [
							[
								111,
								112,
								113,
								114,
								115,
								116,
								117,
								118,
								-110,
								-107,
								119
							]
						],
						"type": "Polygon",
						"id": "28"
					},
					{
						"arcs": [
							[
								-14,
								-29,
								120,
								121,
								-113,
								122,
								123
							]
						],
						"type": "Polygon",
						"id": "29"
					},
					{
						"arcs": [
							[
								-84,
								-79,
								-96,
								124,
								125,
								126,
								127,
								128,
								-121,
								-28
							]
						],
						"type": "Polygon",
						"id": "30"
					},
					{
						"arcs": [
							[
								129,
								130,
								131,
								132,
								-104,
								133
							]
						],
						"type": "Polygon",
						"id": "31"
					},
					{
						"arcs": [
							[
								-111,
								-119,
								134,
								135,
								-134,
								-103
							]
						],
						"type": "Polygon",
						"id": "32"
					},
					{
						"arcs": [
							[
								136,
								137,
								138,
								139,
								140,
								-135,
								-118,
								141
							]
						],
						"type": "Polygon",
						"id": "33"
					},
					{
						"arcs": [
							[
								-129,
								142,
								-127,
								143,
								-137,
								144,
								145,
								146,
								-114,
								-122
							]
						],
						"type": "Polygon",
						"id": "34"
					},
					{
						"arcs": [
							[
								147,
								148,
								149,
								150,
								151,
								152,
								153,
								154,
								-138,
								-144,
								-126,
								155
							]
						],
						"type": "Polygon",
						"id": "35"
					},
					{
						"arcs": [
							[
								-43,
								156,
								-156,
								-125,
								-95
							]
						],
						"type": "Polygon",
						"id": "36"
					},
					{
						"arcs": [
							[
								-53,
								157,
								158,
								159,
								-152,
								160,
								-150,
								161,
								-148,
								-157,
								-42
							]
						],
						"type": "Polygon",
						"id": "37"
					},
					{
						"arcs": [
							[
								-141,
								162,
								163,
								164,
								165,
								166,
								167,
								168,
								169,
								-130,
								-136
							]
						],
						"type": "Polygon",
						"id": "38"
					},
					{
						"arcs": [
							[
								170,
								-169
							]
						],
						"type": "Polygon",
						"id": "39"
					},
					{
						"arcs": [
							[
								-155,
								171,
								172,
								173,
								174,
								175,
								-139
							]
						],
						"type": "Polygon",
						"id": "40"
					},
					{
						"arcs": [
							[
								176,
								177,
								178,
								179,
								180
							]
						],
						"type": "Polygon",
						"id": "41"
					},
					{
						"arcs": [
							[
								181,
								182,
								-177
							]
						],
						"type": "Polygon",
						"id": "42"
					},
					{
						"arcs": [
							[
								183,
								184,
								-179,
								185,
								-172,
								-154
							]
						],
						"type": "Polygon",
						"id": "43"
					},
					{
						"arcs": [
							[
								186,
								187,
								188,
								-184,
								-153,
								-160
							]
						],
						"type": "Polygon",
						"id": "44"
					},
					{
						"arcs": [
							[
								189,
								190,
								191,
								192,
								193,
								194,
								-188
							]
						],
						"type": "Polygon",
						"id": "45"
					},
					{
						"arcs": [
							[
								197,
								198,
								199,
								200,
								201,
								202,
								-174,
								203
							]
						],
						"type": "Polygon",
						"id": "46"
					},
					{
						"arcs": [
							[
								-195,
								204,
								-204,
								-173,
								-186,
								-178,
								-183,
								205,
								-180,
								-185,
								-189
							]
						],
						"type": "Polygon",
						"id": "47"
					},
					{
						"arcs": [
							[
								-194,
								206,
								207,
								-198,
								-205
							]
						],
						"type": "Polygon",
						"id": "48"
					},
					{
						"arcs": [
							[
								208,
								209,
								-207,
								-193,
								210,
								211
							]
						],
						"type": "Polygon",
						"id": "49"
					},
					{
						"arcs": [
							[
								212,
								-211,
								-192
							]
						],
						"type": "Polygon",
						"id": "50"
					},
					{
						"arcs": [
							[
								213,
								214,
								-212,
								-213,
								-191,
								215
							]
						],
						"type": "Polygon",
						"id": "51"
					},
					{
						"arcs": [
							[
								216,
								217,
								-199,
								-208,
								-210,
								218
							]
						],
						"type": "Polygon",
						"id": "52"
					},
					{
						"arcs": [
							[
								219,
								220,
								221,
								222,
								-197,
								223,
								-200,
								-218
							]
						],
						"type": "Polygon",
						"id": "53"
					},
					{
						"arcs": [
							[
								224,
								-145,
								-142,
								-117,
								225
							]
						],
						"type": "Polygon",
						"id": "54"
					},
					{
						"arcs": [
							[
								[
									226,
									-225,
									227,
									-115,
									-147
								]
							],
							[
								[
									-112,
									228,
									-123
								]
							]
						],
						"type": "MultiPolygon",
						"id": "55"
					},
					{
						"arcs": [
							[
								-75,
								229,
								230,
								231,
								-158,
								-52,
								-58
							]
						],
						"type": "Polygon",
						"id": "56"
					},
					{
						"arcs": [
							[
								232,
								233,
								234,
								235,
								-73,
								-69
							]
						],
						"type": "Polygon",
						"id": "57"
					},
					{
						"arcs": [
							[
								-236,
								236,
								237,
								238,
								239,
								240,
								241,
								-230,
								-74
							]
						],
						"type": "Polygon",
						"id": "58"
					},
					{
						"arcs": [
							[
								242,
								243,
								244,
								245,
								246,
								247,
								248,
								249,
								-234
							]
						],
						"type": "Polygon",
						"id": "59"
					},
					{
						"arcs": [
							[
								-242,
								250,
								251,
								252,
								253,
								254,
								255,
								-231
							]
						],
						"type": "Polygon",
						"id": "60"
					},
					{
						"arcs": [
							[
								256,
								257,
								258,
								259,
								260,
								-251,
								-241
							]
						],
						"type": "Polygon",
						"id": "61"
					},
					{
						"arcs": [
							[
								261,
								262,
								263,
								264,
								265,
								266,
								-252,
								-261,
								267,
								268,
								269,
								270
							]
						],
						"type": "Polygon",
						"id": "62"
					},
					{
						"arcs": [
							[
								271,
								272,
								-264,
								273,
								-244
							]
						],
						"type": "Polygon",
						"id": "63"
					},
					{
						"arcs": [
							[
								274,
								275,
								276,
								277,
								-265,
								-273
							]
						],
						"type": "Polygon",
						"id": "64"
					},
					{
						"arcs": [
							[
								278,
								279,
								280,
								281,
								-266,
								-278
							]
						],
						"type": "Polygon",
						"id": "65"
					},
					{
						"arcs": [
							[
								-256,
								282,
								-216,
								-190,
								-187,
								-159,
								-232
							]
						],
						"type": "Polygon",
						"id": "66"
					},
					{
						"arcs": [
							[
								-255,
								283,
								284,
								285,
								286,
								-214,
								-283
							]
						],
						"type": "Polygon",
						"id": "67"
					},
					{
						"arcs": [
							[
								-287,
								287,
								288,
								289,
								-219,
								-209,
								-215
							]
						],
						"type": "Polygon",
						"id": "68"
					},
					{
						"arcs": [
							[
								290,
								-285
							]
						],
						"type": "Polygon",
						"id": "69"
					},
					{
						"arcs": [
							[
								-267,
								-282,
								291,
								292,
								-253
							]
						],
						"type": "Polygon",
						"id": "70"
					},
					{
						"arcs": [
							[
								-293,
								293,
								294,
								295,
								-288,
								-286,
								-291,
								-284,
								-254
							]
						],
						"type": "Polygon",
						"id": "71"
					},
					{
						"arcs": [
							[
								296,
								297,
								298,
								-295
							]
						],
						"type": "Polygon",
						"id": "72"
					},
					{
						"arcs": [
							[
								299,
								300,
								301,
								302,
								303,
								304,
								305,
								-298
							]
						],
						"type": "Polygon",
						"id": "73"
					},
					{
						"arcs": [
							[
								-296,
								-299,
								-306,
								306,
								-289
							]
						],
						"type": "Polygon",
						"id": "74"
					},
					{
						"arcs": [
							[
								307,
								308,
								309,
								310,
								311,
								312,
								313
							]
						],
						"type": "Polygon",
						"id": "75"
					},
					{
						"arcs": [
							[
								314,
								315,
								316,
								-309,
								317,
								-237,
								-235,
								-250,
								318
							]
						],
						"type": "Polygon",
						"id": "76"
					},
					{
						"arcs": [
							[
								-308,
								319,
