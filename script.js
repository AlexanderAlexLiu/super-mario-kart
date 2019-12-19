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
var game = {gameScale: 2, debug: false, gameState: "", subGameState: ""}
var fps = {deltaTime: undefined, pastTime: 0, presentTime: undefined, framesPerSecond: 0, fpsSmoothing: 0.9}
var clock = {frameInterval: undefined, then: undefined, now: undefined, startTime: undefined, fpsCap: undefined, elapsed: undefined}
var menuBackgroundValues = {backgroundXPos1: undefined, backgroundXPos2: undefined}
var resourcePaths = [
	'sprites/nintendo_logo.png',
	'sprites/title_screen/title_background.png',
	'sprites/title_screen/int_game_title.png',
	'sprites/title_screen/title_credits.png'
]
/*
var menuTimings = {backgroundScrollSpeed: 90, ticks: 0, delta: 0, init: false, firstLoad: true}
var menuValues = {background1XPos: 0, background2XPos: 0}
var game_font_1_paths = []
*/

var layers = {
	layerDictionary: {},
	createLayer: function(layerName, layerWidth, layerHeight) {
		if (!layerName in this.layerDictionary) {
			console.log(`Creating a ${layerWidth}px by ${layerHeight}px layer named ${layerName}`);
			this.layerDictionary[layerName] = new Layer(layerName, layerWidth, layerHeight);
			this.layerDictionary[layerName].ctx.imageSmoothingEnabled = false;
		} else {
			throw `A layer called ${layerName} already exists.`;
		}
	},
	getLayer: function(layerName) {
		layer = layers.layerDictionary[layerName];
		if (typeof layer !== 'undefined') {
			throw `Layer "${layerName}" doesn't exist.`;
		} else {
			return layer;
		}
	}
};
function Layer(layerName, layerWidth, layerHeight) {
	this.name = layerName;
	this.canvas = document.createElement('canvas');
	this.ctx = this.canvas.getContext("2d");
	this.canvas.width = layerHeight;
	this.canvas.height = layerWidth;
};
function init() {
	canvas = document.getElementById("display-surface");
	ctx = canvas.getContext("2d");
	canvas.width = 256;
	canvas.height = 224;
	const canvasScaledWidth = canvas.width * game.gameScale
	const canvasScaledHeight = canvas.height * game.gameScale
	canvas.style.width = `${canvasScaledHeight}px`
	canvas.style.height = `${canvasScaledWidth}px`
	WIDTH = ctx.canvas.width;
	HEIGHT = ctx.canvas.height;
	game.gameState = "load"
	document.getElementById('display-surface').focus()
	body = document.getElementsByTagName("body")[0]
	body.style.background = getRandomColor(1, 270)
	menuBackgroundValues.backgroundXPos2 = WIDTH
	menuBackgroundValues.backgroundXPos1 = 0
	ctx.imageSmoothingEnabled = false;
	clock.fpsCap = 60
	clock.frameInterval = 1000 / clock.fpsCap
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
	resources.onReady(function() {main()})
};
var gameFont = {
	gameFont1ResourcePaths: [],
	gameFont1String: "!().'-@+0123456789abcdefghijklmnopqrstuvwxyz"
}
function main() {
	window.requestAnimationFrame(main) 
	fps.presentTime = performance.now()
	fps.deltaTime = (fps.presentTime - fps.pastTime) / 1000
	fps.framesPerSecond = Math.round((fps.framesPerSecond * fps.fpsSmoothing) + ((1 / fps.deltaTime) * (1 - fps.fpsSmoothing)))
	clock.now = performance.now();
	clock.elapsed = clock.now - clock.then
	/*
	if (clock.elapsed > clock.frameInterval) {
		clock.then = clock.now - (clock.elapsed - clock.frameInterval)
		clearCanvas(ctx)
		console.log("yes")
		if (game.debug) {
			drawText(ctx, 4, 10, fps.framesPerSecond.toString(), 8, "#FFFF00", "Arial")
			drawText(ctx, 4, 20, "gameState: " + game.gameState, 8, "#FFFFFF", "Arial")
		}
	}*/
	clearCanvas(ctx)
	if (game.debug) {
		drawText(ctx, 4, 10, fps.framesPerSecond.toString(), 8, "#FFFF00", "Arial")
		drawText(ctx, 4, 20, "gameState: " + game.gameState, 8, "#FFFFFF", "Arial")
	}
	/*
	if (gameState === "title_screen") {
		if (!menuTimings.init) {
			menuTimings.delta = performance.now() // get the amount of time that has passed since the program has sucessfully loaded resources. used for animations
			menuTimings.init = true;
			subGameState = "nintendo"
		}
		menuTimings.ticks = performance.now() - menuTimings.delta;
		if (subGameState != "game_select") {
			menuValues.background1XPos = -((menuTimings.ticks / 1000 * menuTimings.backgroundScrollSpeed) % WIDTH)
			menuValues.background2XPos = WIDTH - ((menuTimings.ticks / 1000 * menuTimings.backgroundScrollSpeed) % WIDTH)
		}
		ctx.drawImage(resources.get("sprites/title_screen/title_background.png"), menuValues.background1XPos, 0)
		ctx.drawImage(resources.get("sprites/title_screen/title_background.png"), menuValues.background2XPos, 0)
		ctx.drawImage(resources.get("sprites/title_screen/int_game_title.png"), 11, 25)
		ctx.drawImage(resources.get("sprites/title_screen/title_credits.png"), 84, 199)
		count += 0.1;
		for (let x = 0; x < 32; x++) {
			for (let y = 0; y < 28; y++) {
				ctx.drawImage(resources.get(game_font_1_paths[Math.floor(count) % game_font_1_paths.length]), x * 8, y * 8)
			}
		}
		if (menuTimings.ticks <= 4000 && menuTimings.firstLoad) {
			ctx.globalAlpha = 2 - 0.0005 * menuTimings.ticks
			drawRect(ctx, 0, 0, WIDTH, HEIGHT, true, [0, 0, 0])
			ctx.globalAlpha = 1
			if (menuTimings.ticks <= 2000) {
				ctx.globalAlpha = 1 - 0.0005 * menuTimings.ticks
				ctx.drawImage(resources.get("sprites/nintendo_logo.png"), 99, 113)
				ctx.globalAlpha = 1
			}
		} else if (menuTimings.firstLoad) {
			menuTimings.firstLoad = false;
			subGameState = "title"
		}
	}
	if (debug) {
		drawText(ctx, 4, 10, fps.toString(), 8, "#FFFF00", "Arial")
		drawText(ctx, 4, 20, "gameState: " + gameState, 8, "#FFFFFF", "Arial")
	}
	*/
	fps.pastTime = performance.now() // ALWAYS BE RIGHT BEFORE REQUEST ANIMATION FRAME
};


/*	
	copy pasted because I didn't feel like coding one on the spot.
	might refactor to be more readable
	use: load, get, isReady, onReady.
*/
(function() {
	var resourceCache = {};
	var loading = [];
	var readyCallbacks = [];

	// Load an image url or an array of image urls
	function load(urlOrArr) {
		if(urlOrArr instanceof Array) {
			urlOrArr.forEach(function(url) {
				_load(url);
			});
		}
		else {
			_load(urlOrArr);
		}
	}
	function _load(url) {
		if(resourceCache[url]) {
			return resourceCache[url];
		}
		else {
			var img = new Image();
			img.onload = function() {
				resourceCache[url] = img;
				console.log("loaded: " + url)

				if(isReady()) {
					readyCallbacks.forEach(function(func) { func(); });
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
		for(var k in resourceCache) {
			if(resourceCache.hasOwnProperty(k) &&
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
	if (event.keyCode == 77 && !event.repeat) {
		game.debug = !game.debug
	};
	if (event.keyCode == 38) { // UP
	}
	if (event.keyCode == 37) { // LEFT
	}
	if (event.keyCode == 40) { // DOWN
	}
	if (event.keyCode == 39) { // RIGHT
	}
	if (event.keyCode == 67) { // C to B
		if (gameState == "title_screen") {
			if (subGameState == "title") {
				subGameState = "game_select"
			}
		}
	}
	if (event.keyCode == 86) { // V to A
	}
	if (event.keyCode == 88) { // X to Y
	}
	if (event.keyCode == 68) { // D to X
	}
	if (event.keyCode == 32) { // Space to Start
		if (gameState == "title_screen") {
			if (subGameState == "title") {
				subGameState = "game_select"
			}
		}
	}
	if (event.keyCode == 13) { // Enter to Select
	}
	if (event.keyCode == 65) { // A to L
	}
	if (event.keyCode == 83) { // S to R
	}
};

/*
	onKeyUp is a function takes a keyboard "keyup" event
	and processes it
*/
function onKeyUp(event) {
	console.log(event)
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
	return result ? {r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16)} : null;
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

window.addEventListener("keydown", onKeyDown, false); // an event listener for when the user presses down on a keyboard key
window.addEventListener("keyup", onKeyUp, false); // an event listener for when the user lifts up off a keyboard key
window.addEventListener("load", init, false); // an event listener for when the page and all it's code, calls the "initialize" function