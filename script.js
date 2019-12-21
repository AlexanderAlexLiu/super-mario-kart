/*
Author: Alex Liu
Creation Date: October 11, 2019
Purpose: Final project for ICS3U
Description: A recreation of Supeer Mario Kar for the SNES
/*
/*
TODO:
1. Noting
*/

var body // stores a Element object representing the HTML body
var canvas // stores a Element object representing the element with the "display-surface" id
var ctx  // stores the drawing context of whatever element the canvas variable has stored
var WIDTH, HEIGHT // stores constants of the canvas's width and height respectively
var game = { gameScale: 3, debug: false, gameState: "", subGameState: "" }
var fps = { deltaTime: 1, pastTime: 0, presentTime: 0, framesPerSecond: 0, fpsSmoothing: 0.9 }
var clock = { frameInterval: undefined, then: undefined, now: undefined, startTime: undefined, fpsCap: undefined, elapsed: undefined }
var menuBackgroundValues = { backgroundXPos1: undefined, backgroundXPos2: undefined, scrollSpeed: 90}
var controlBooleans = { up: false, down: false, right: false, left: false, b: false, a: false, x: false, y: false, start: false, select: false, l: false, r: false }
var controlBinds = { debug: 77, up: 38, left: 37, down: 40, right: 39, b: 67, a: 86, y: 88, x: 68, start: 32, select: 13, l: 65, r: 83 }
var mainMenu = {startTime: 0, initialized: false, sinceStart: 0}
var raceSetupValues = {playerCount: 0}
var resourcePaths = [
	'sprites/nintendo_logo.png',
	'sprites/title_screen/title_background.png',
	'sprites/title_screen/int_game_title.png',
	'sprites/title_screen/title_credits.png',
	'sprites/title_screen/selector_mushroom.png'
]
var layers = {
	layerDictionary: {},
	createLayer: function (layerName, layerWidth, layerHeight) {
		if (!(layerName in this.layerDictionary)) {
			console.log(`Creating a ${layerWidth}px by ${layerHeight}px layer named ${layerName}`)
			this.layerDictionary[layerName] = new Layer(layerName, layerWidth, layerHeight)
			this.layerDictionary[layerName].ctx.imageSmoothingEnabled = false
		} else {
			throw `A layer called ${layerName} already exists.`;
		}
	},
	getLayer: function (layerName) {
		layer = this.layerDictionary[layerName];
		if (typeof layer == 'undefined') {
			throw `Layer "${layerName}" doesn't exist.`
		} else {
			return layer;
		}
	}
}
function Layer(layerName, layerWidth, layerHeight) {
	this.name = layerName;
	this.canvas = document.createElement('canvas');
	this.ctx = this.canvas.getContext("2d");
	this.canvas.width = layerHeight;
	this.canvas.height = layerWidth;
}
function init() {
	canvas = document.getElementById("display-surface");
	ctx = canvas.getContext("2d");
	canvas.width = 256;
	canvas.height = 224;
	const canvasScaledWidth = canvas.width * game.gameScale
	const canvasScaledHeight = canvas.height * game.gameScale
	canvas.style.width = `${canvasScaledWidth}px`
	canvas.style.height = `${canvasScaledHeight}px`
	WIDTH = ctx.canvas.width;
	HEIGHT = ctx.canvas.height;
	game.gameState = "menu_screen"
	game.subGameState = "nintendo"
	document.getElementById('display-surface').focus()
	body = document.getElementsByTagName("body")[0]
	body.style.background = getRandomColor(1, 270)
	menuBackgroundValues.backgroundXPos2 = 0
	menuBackgroundValues.backgroundXPos1 = 0
	ctx.imageSmoothingEnabled = false;
	clock.fpsCap = 60
	clock.frameInterval = 1000.0 / clock.fpsCap
	clock.then = performance.now()
	clock.startTime = clock.then
	for (let i = 0; i < gameFont.gameFont1String.length; i++) {
		gameFont.gameFont1ResourcePaths.push(`font/normal/${gameFont.gameFont1String.charAt(i)}.png`)
		gameFont.gameFont1ResourcePaths.push(`font/gloss/${gameFont.gameFont1String.charAt(i)}.png`)
	}
	for (let i = 1; i <= 4; i++) {
		gameFont.gameFont1ResourcePaths.push(`font/normal/${i}_cc.png`)
		gameFont.gameFont1ResourcePaths.push(`font/gloss/${i}_cc.png`)
	}
	resourcePaths = resourcePaths.concat(gameFont.gameFont1ResourcePaths)
	resources.load(resourcePaths)
	layers.createLayer("recolorFontLayer", 8, 8)
	resources.onReady(function () {
		gameFont.createRecolor(0, 0, "debugFont", [0, 0, 0], [255, 255, 255]);
		gameFont.createRecolor(0, 0, "font", [255, 20, 147], [255, 255, 255]);
		gameFont.createRecolor(0, 0, "blue", [0, 104, 248], [248, 248, 248])
		gameFont.createRecolor(0, 0, "pink", [208, 0, 208], [248, 248, 248])
		gameFont.createRecolor(0, 1, "blueGloss", [0, 104, 248], [248, 248, 248], [200, 200, 232])
		gameFont.createRecolor(0, 1, "pinkGloss", [208, 0, 208], [248, 248, 248], [200, 200, 232])
		})
	resources.onReady(function () { main() })
}
var gameFont = {
	gameFont1ResourcePaths: [],
	gameFont1String: "!().'-@+0123456789abcdefghijklmnopqrstuvwxyz",
	gameFont1ExtendedString: "!().'-@+0123456789abcdefghijklmnopqrstuvwxyz^*<>",
	recolorDict: {},
	createRecolor: function (style, type, fontName, color1, color2, color3 = [0, 0, 0]) {
		if (style == 0) {
			if (type == 0) {
				let gameFontDict = {}
				for (var i in this.gameFont1ExtendedString) {
					gameFontDict[this.gameFont1ExtendedString.charAt(i)] = new Image(8, 8)
					layers.getLayer("recolorFontLayer").ctx.clearRect(0, 0, 8, 8)
					layers.getLayer("recolorFontLayer").ctx.drawImage(resources.get(this.gameFont1ResourcePaths[i * 2]), 0, 0)
					var imageData = layers.getLayer("recolorFontLayer").ctx.getImageData(0, 0, 8, 8)
					for (let y = 0; y < 8; y++) {
						for (let x = 0; x < 8; x++) {
							let index = (x * 4) * 8 + (y * 4)
							let red = imageData.data[index];
							if (red == 0) {
								imageData.data[index] = color1[0]
								imageData.data[index + 1] = color1[1]
								imageData.data[index + 2] = color1[2]
							} else if (red == 248) {
								imageData.data[index] = color2[0]
								imageData.data[index + 1] = color2[1]
								imageData.data[index + 2] = color2[2]
							}
						}
					}
					console.log(`recolored: ${this.gameFont1ExtendedString[i]} ${i}`)
					layers.getLayer("recolorFontLayer").ctx.putImageData(imageData, 0, 0, 0, 0, 8, 8)
					gameFontDict[this.gameFont1ExtendedString.charAt(i)].src = layers.getLayer("recolorFontLayer").canvas.toDataURL()
				}
				this.recolorDict[fontName] = gameFontDict
			} else if (type == 1) {
				let gameFontDict = {}
				for (var i in this.gameFont1ExtendedString) {
					gameFontDict[this.gameFont1ExtendedString.charAt(i)] = new Image(8, 8)
					layers.getLayer("recolorFontLayer").ctx.clearRect(0, 0, 8, 8)
					layers.getLayer("recolorFontLayer").ctx.drawImage(resources.get(this.gameFont1ResourcePaths[i * 2 + 1]), 0, 0)
					var imageData = layers.getLayer("recolorFontLayer").ctx.getImageData(0, 0, 8, 8)
					for (let y = 0; y < 8; y++) {
						for (let x = 0; x < 8; x++) {
							let index = (x * 4) * 8 + (y * 4)
							let red = imageData.data[index];
							if (red == 0) {
								imageData.data[index] = color1[0]
								imageData.data[index + 1] = color1[1]
								imageData.data[index + 2] = color1[2]
							} else if (red == 248) {
								imageData.data[index] = color2[0]
								imageData.data[index + 1] = color2[1]
								imageData.data[index + 2] = color2[2]
							} else if (red == 200) {
								imageData.data[index] = color3[0]
								imageData.data[index + 1] = color3[1]
								imageData.data[index + 2] = color3[2]
							}
						}
					}
					console.log(`recolored: ${this.gameFont1ExtendedString[i]} ${i}`)
					layers.getLayer("recolorFontLayer").ctx.putImageData(imageData, 0, 0, 0, 0, 8, 8)
					gameFontDict[this.gameFont1ExtendedString.charAt(i)].src = layers.getLayer("recolorFontLayer").canvas.toDataURL()
				}
				this.recolorDict[fontName] = gameFontDict
			}
		}
	},
	drawText: function (ctx, fontName, string, x, y) {
		let fontDictionary = this.recolorDict[fontName]
		string = string.toLowerCase()
		var xOffset = 0;
		for (let i in string) {
			if (string.charAt(i) == " ") {
				xOffset += 8
			} else if (string.charAt(i) == "^") {
				xOffset += 4
				ctx.drawImage(fontDictionary["^"], x + xOffset, y - 4)
				ctx.drawImage(fontDictionary["<"], x + xOffset, y + 4)
				xOffset += 8
				ctx.drawImage(fontDictionary["*"], x + xOffset, y - 4)
				ctx.drawImage(fontDictionary[">"], x + xOffset, y + 4)
				xOffset += 4
			} else {
				ctx.drawImage(fontDictionary[string.charAt(i)], x + xOffset, y)
				xOffset += 8
			}
		}
	}
}
function main() {
	window.requestAnimationFrame(main)
	clock.now = performance.now();
	clock.elapsed = clock.now - clock.then
	fps.presentTime = performance.now()
	fps.framesPerSecond = (fps.framesPerSecond * fps.fpsSmoothing) + ((1.0 / fps.deltaTime) * (1 - fps.fpsSmoothing))
	if (clock.elapsed >= clock.frameInterval) {
		fps.deltaTime = (fps.presentTime - fps.pastTime) / 1000.0
		clock.then = clock.now - (clock.elapsed % clock.frameInterval)
		if (game.gameState == "menu_screen") {
			if (!mainMenu.initialized) {
				mainMenu.startTime = performance.now()
				mainMenu.initialized = true
			}
			mainMenu.sinceStart = performance.now() - mainMenu.startTime 
			if (game.subGameState != "player_select") {
				menuBackgroundValues.backgroundXPos1 = -((mainMenu.sinceStart / 1000 * menuBackgroundValues.scrollSpeed) % WIDTH)
				menuBackgroundValues.backgroundXPos2 = WIDTH - ((mainMenu.sinceStart / 1000 * menuBackgroundValues.scrollSpeed) % WIDTH)
			}
			ctx.drawImage(resources.get("sprites/title_screen/title_background.png"), menuBackgroundValues.backgroundXPos1, 0)
			ctx.drawImage(resources.get("sprites/title_screen/title_background.png"), menuBackgroundValues.backgroundXPos2, 0)
			ctx.drawImage(resources.get("sprites/title_screen/int_game_title.png"), 11, 25)
			ctx.drawImage(resources.get("sprites/title_screen/title_credits.png"), 84, 199)
			if (game.subGameState == "player_select") {
				drawRect(ctx, 64, 120, 125, 40, true, "#000000")
				gameFont.drawText(ctx, "blueGloss", "1", 100, 128)
				gameFont.drawText(ctx, "pinkGloss", "2", 100, 144)
				gameFont.drawText(ctx, "blue", "p game", 108, 128)
				gameFont.drawText(ctx, "pink", "p game", 108, 144)
				if (raceSetupValues.playerCount == 0) {
					ctx.drawImage(resources.get("sprites/title_screen/selector_mushroom.png"), 83, 127)
				} else {
					ctx.drawImage(resources.get("sprites/title_screen/selector_mushroom.png"), 83, 143)
				}
			}
			if (mainMenu.sinceStart <= 4000 && game.subGameState === "nintendo") {
				ctx.globalAlpha = 2 - 0.0005 * mainMenu.sinceStart
				drawRect(ctx, 0, 0, WIDTH, HEIGHT, true, [0, 0, 0])
				ctx.globalAlpha = 1
				if (mainMenu.sinceStart <= 2000) {
					ctx.globalAlpha = 1 - 0.0005 * mainMenu.sinceStart
					ctx.drawImage(resources.get("sprites/nintendo_logo.png"), 99, 113)
					ctx.globalAlpha = 1
				}
			} else if (game.subGameState === "nintendo") {
				game.subGameState = "title"
			}
		} else if (game.gameState == "game_screen") {
		}
		if (game.debug) {
			gameFont.drawText(ctx, "debugFont", "FPS-" + Math.round(fps.framesPerSecond), 0, 0)
			gameFont.drawText(ctx, "debugFont", "gamestate-" + game.gameState.replace("_", "."), 0, 8)
			gameFont.drawText(ctx, "debugFont", "subgamestate-" + game.subGameState.replace("_", "."), 0, 16)
		}
		fps.pastTime = performance.now()
	}
};
/*	
	copy pasted because I didn't feel like coding one on the spot.
	might refactor to be more readable
	use: load, get, isReady, onReady.
*/
(function () {
	var resourceCache = {};
	var loading = [];
	var readyCallbacks = [];

	// Load an image url or an array of image urls
	function load(urlOrArr) {
		if (urlOrArr instanceof Array) {
			urlOrArr.forEach(function (url) {
				_load(url);
			});
		}
		else {
			_load(urlOrArr);
		}
	}
	function _load(url) {
		if (resourceCache[url]) {
			return resourceCache[url];
		}
		else {
			var img = new Image();
			img.onload = function () {
				resourceCache[url] = img;
				console.log("loaded: " + url)

				if (isReady()) {
					readyCallbacks.forEach(function (func) { func(); });
				}
			};
			resourceCache[url] = false;
			img.src = url;
		}
	}
	function get(url) {
		return resourceCache[url];
	}
	function isReady() {
		var ready = true;
		for (var k in resourceCache) {
			if (resourceCache.hasOwnProperty(k) &&
				!resourceCache[k]) {
				ready = false;
			}
		}
		return ready;
	}
	function onReady(func) {
		readyCallbacks.push(func);
	}
	window.resources = {
		load: load,
		get: get,
		onReady: onReady,
		isReady: isReady
	};
})();

/*
	clearCanvas is a function that will clear a given canvas
*/
function clearCanvas(context) {
	context.fillStyle = "#000000"
	context.clearRect(0, 0, context.canvas.width, context.canvas.height)
};

/*
	onKeyDown is a function takes a keyboard "keydown" event
	and processes it
*/
function onKeyDown(event) {
	console.log(event)
	if (event.keyCode == controlBinds.debug && !event.repeat) {
		game.debug = !game.debug
	}
	if (event.keyCode == controlBinds.up && !controlBooleans.up) { // UP
		if (game.gameState == "menu_screen") {
			if (game.subGameState == "player_select") {
				raceSetupValues.playerCount = mod(raceSetupValues.playerCount - 1, 2)
			}
		}
	}
	if (event.keyCode == controlBinds.left && !controlBooleans.left) { // LEFT
	}
	if (event.keyCode == controlBinds.down && !controlBooleans.down) { // DOWN
		if (game.gameState == "menu_screen") {
			if (game.subGameState == "player_select") {
				raceSetupValues.playerCount = mod(raceSetupValues.playerCount + 1, 2)
			}
		}
	}
	if (event.keyCode == controlBinds.right && !controlBooleans.right) { // RIGHT
	}
	if (event.keyCode == controlBinds.b && !controlBooleans.b) { // C to B
		if (game.gameState == "menu_screen") {
			if (game.subGameState == "title") {
				game.subGameState = "player_select"
			}
		}
	}
	if (event.keyCode == controlBinds.a && !controlBooleans.a) { // V to A
	}
	if (event.keyCode == controlBinds.y && !controlBooleans.y) { // X to Y
	}
	if (event.keyCode == controlBinds.x && !controlBooleans.x) { // D to X
	}
	if (event.keyCode == controlBinds.start && !controlBooleans.start) { // Space to Start
		if (game.gameState == "menu_screen") {
			if (game.subGameState == "title") {
				game.subGameState = "player_select"
			}
		}
	}
	if (event.keyCode == controlBinds.select && !controlBooleans.select) { // Enter to Select
	}
	if (event.keyCode == controlBinds.l && !controlBooleans.l) { // A to L
	}
	if (event.keyCode == controlBinds.r && !controlBooleans.r) { // S to R
	}
};

/*
	onKeyUp is a function takes a keyboard "keyup" event
	and processes it
*/
function onKeyUp(event) {
	console.log(event)
	if (event.keyCode == controlBinds.debug && !event.repeat) {
	}
	if (event.keyCode == controlBinds.up && !controlBooleans.up) { // UP
	}
	if (event.keyCode == controlBinds.left && !controlBooleans.left) { // LEFT
	}
	if (event.keyCode == controlBinds.down && !controlBooleans.down) { // DOWN
	}
	if (event.keyCode == controlBinds.right && !controlBooleans.right) { // RIGHT
	}
	if (event.keyCode == controlBinds.b && !controlBooleans.b) { // C to B
	}
	if (event.keyCode == controlBinds.a && !controlBooleans.a) { // V to A
	}
	if (event.keyCode == controlBinds.y && !controlBooleans.y) { // X to Y
	}
	if (event.keyCode == controlBinds.x && !controlBooleans.x) { // D to X
	}
	if (event.keyCode == controlBinds.start && !controlBooleans.start) { // Space to Start
	}
	if (event.keyCode == controlBinds.select && !controlBooleans.select) { // Enter to Select
	}
	if (event.keyCode == controlBinds.l && !controlBooleans.l) { // A to L
	}
	if (event.keyCode == controlBinds.r && !controlBooleans.r) { // S to R
	}
};

/*
	getRandomColor is a function that generates a 
	random 6 digit hexidecimal number and returns it to the caller
	mode 1 generates a random variation of a given hue
*/
function getRandomColor(mode = 0, hue = 0) {
	if (mode === 0) {
		var letters = '0123456789ABCDEF'
		var color = '#'
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)]
		};
		return color;
	} else if (mode === 1) {
		var h = hue;
		var s = Math.floor(Math.random() * 100);
		var l = Math.floor(Math.random() * 100);
		var color = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
		return color;
	};
};

/*
	componentToHex is a function that returns the corresponding hex value given a unsigned byte
*/
function componentToHex(component) {
	var hex = component.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
};

/*
	rgbToHex is a function that converts a rgb color code to a hex color code
*/
function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

/*
	hexToRgb is a function that takes a 6 digit hex number and returns an array of rgb to the caller
*/
function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};

/*
	drawRect is a function that draws a rectangle on a specified canvas
*/
function drawRect(context, x, y, w, h, fill = true, fillColor = "#000000", stroke = false, strokeColor = "#FFFFFF", strokeWeight = 1) {
	context.beginPath()
	if (fill) {
		if (Array.isArray(fillColor)) {
			context.fillStyle = rgbToHex(fillColor[0], fillColor[1], fillColor[2])
		} else {
			context.fillStyle = fillColor
		};
		context.fillRect(x, y, w, h)
	};
	context.closePath()
	context.beginPath()
	if (stroke) {
		context.lineWidth = strokeWeight
		context.rect(x, y, w, h)
		context.stroke()
	};
	context.closePath()
};

/* 
	drawText is a function to draw text on a given canvas
	used for debug purposes so it's minimally developed
*/
function drawText(context, x, y, text, size, color, name) {
	context.beginPath()
	context.fillStyle = color
	context.font = size + "px " + name
	context.fillText(text, x, y)
};
function mod(n, m) {
	return ((n % m) + m) % m;
}
window.addEventListener("keydown", onKeyDown, false); // an event listener for when the user presses down on a keyboard key
window.addEventListener("keyup", onKeyUp, false); // an event listener for when the user lifts up off a keyboard key
window.addEventListener("load", init, false); // an event listener for when the page and all it's code, calls the "initialize" function