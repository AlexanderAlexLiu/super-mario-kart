/* Alex Liu
 * October 11, 2019
 * a recreation of Super Mario Kart for the SNES (Super Nintendo Entertainment System)
 */

/*
TODO:
 - Refactor [DONE]
  L Sprite loader must include frames, etc. [SEMI-DONE]
  L Make it so the player can go back from race_setup
  L Somehow get frame counting onKeyDown
 - Create map and make moveable camera
 - Create vector physics engine
 - ??
 - Profit
 - Use draw offsets to scroll the map rather than changing sprite's x, and y locations.
 - LIMIT FPS !!!!!!!!!!!! <<<<<=======<<<<<<=============<<<=====
 - BUTTON PRESS LIMIT <<<++++++
*/

/*
JUNK CODE:
var body = document.getElementsByTagName("body")[0]; // brings the "body" tag into javascript so we can mess with it
body.style.background = getRandomColor(); // random background color just for fun :>
//ctx.drawImage(resources.get("sprites/nintendo_logo.png"), 0, 0)
*/

var body, canvas, ctx, WIDTH, HEIGHT // declaring the variables (and constants) that will be used for the game's display
var scale = 2 // a variable used to change the scaling of the game's display
var debug = false // declaring and initializing a variable to turn on or off debug mode
var gameState // declaring a variable to keep track of the game's state
var subGameState
var loaded = false;
var deltaTime, deltaTime1, deltaTime2 = 0; // declaring variables to store and calculate the time it took to update the display (very important for physics!)
var fps = 0 // declaring and initializing a variable to track the updates per second
var fpsSmoothing = 0.9 // declaring and initializing a variable that will be used to keep the tracker for updates per second less variable; the higher, the more smoothing (up to 1)
var menuTimings = {backgroundScrollSpeed: 90, ticks: 0, delta: 0, init: false, firstLoad: true}
var menuValues = {background1XPos: 0, background2XPos: 0}
var gameSelectValues = {playerCount: 0}
var gameFont1Paths = []
var count = 0
var controlBooleans = {up: false, down: false, right: false, left: false, b: false, a: false, x: false, y: false, start: false, select: false, l: false, r: false}
var gameFont1String = "!().'-@+0123456789abcdefghijklmnopqrstuvwxyz"
var extendedFontCharacters = gameFont1String + "^>;*"
var gameFont1 = {
	baseGlossDictionary: {},
	baseNormalDictionary: {},
	recolorDict: {},
	init: function(fontCharacters) {
		for (var i in fontCharacters) {
			this.baseNormalDictionary[fontCharacters.charAt(i)] = resources.get("font/normal/" + fontCharacters.charAt(i) + ".png")
			this.baseGlossDictionary[fontCharacters.charAt(i)] = resources.get("font/gloss/" + fontCharacters.charAt(i) + ".png")
		}
		this.baseNormalDictionary["^"] = resources.get("font/normal/1_cc.png")
		this.baseNormalDictionary[">"] = resources.get("font/normal/2_cc.png")
		this.baseNormalDictionary[";"] = resources.get("font/normal/3_cc.png")
		this.baseNormalDictionary["*"] = resources.get("font/normal/4_cc.png")
		this.baseGlossDictionary["^"] = resources.get("font/gloss/1_cc.png")
		this.baseGlossDictionary[">"] = resources.get("font/gloss/2_cc.png")
		this.baseGlossDictionary[";"] = resources.get("font/gloss/3_cc.png")
		this.baseGlossDictionary["*"] = resources.get("font/gloss/4_cc.png")
	},
	createRecolor: function(name, type, color1, color2, color3) {
		if (type == 0) {
			fontDictionary = this.baseNormalDictionary
			for (var i in extendedFontCharacters) {
				layers.getLayer("gameFont1RecolorLayer").ctx.clearRect(0, 0, 8, 8)
				layers.getLayer("gameFont1RecolorLayer").ctx.drawImage(this.baseNormalDictionary[extendedFontCharacters.charAt(i)], 0, 0)
				var imageData = layers.getLayer("gameFont1RecolorLayer").ctx.getImageData(0, 0, 8, 8);
				for (var y = 0; y < 8; y++) {
					for (var x = 0; x < 8; x++) {
						var index=(y * 4) * 8 + (x * 4);
						var red = imageData.data[index];
						var green = imageData.data[index +1];
						var blue = imageData.data[index +2];
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
				console.log("recolored " + "\"" + extendedFontCharacters.charAt(i) + "\"")
				layers.getLayer("gameFont1RecolorLayer").ctx.putImageData(imageData, 0 , 0 , 0 , 0, 8, 8);
				fontDictionary[extendedFontCharacters.charAt(i)].src = layers.getLayer("gameFont1RecolorLayer").canvas.toDataURL();
				this.recolorDict[name] = fontDictionary
			}
		} else if (type == 1) { // glossed
			fontDictionary = this.baseGlossDictionary
			for (var i in extendedFontCharacters) {
				layers.getLayer("gameFont1RecolorLayer").ctx.clearRect(0, 0, 8, 8)
				layers.getLayer("gameFont1RecolorLayer").ctx.drawImage(this.baseNormalDictionary[extendedFontCharacters.charAt(i)], 0, 0)
				var imageData = layers.getLayer("gameFont1RecolorLayer").ctx.getImageData(0, 0, 8, 8);
				for (var y = 0; y < 8; y++) {
					for (var x = 0; x < 8; x++) {
						var index=(y * 4) * 8 + (x * 4);
						var red = imageData.data[index];
						var green = imageData.data[index +1];
						var blue = imageData.data[index +2];
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
				console.log("recolored " + "\"" + extendedFontCharacters.charAt(i) + "\"")
				layers.getLayer("gameFont1RecolorLayer").ctx.putImageData(imageData, 0 , 0 , 0 , 0, 8, 8);
				fontDictionary[extendedFontCharacters.charAt(i)].src = layers.getLayer("gameFont1RecolorLayer").canvas.toDataURL();
				this.recolorDict[name] = fontDictionary
			}
		}
	},
	drawText: function(string, x, y, name, context) {
		var xOffset = 0;
		string = string.toLowerCase();
		for (var i in string) {
			if (string.charAt(i) == " ") {
				xOffset += 8
			} else if (string.charAt(i) == "^") {
				xOffset += 4
				layer.ctx.drawImage(this.recolorDict[name]["^"], x + xOffset, y - 4)
				layer.ctx.drawImage(this.recolorDict[name][">"], x + xOffset, y - 4)
				xOffset += 8
				layer.ctx.drawImage(this.recolorDict[name]["^"], x + xOffset, y + 4)
				layer.ctx.drawImage(this.recolorDict[name][">"], x + xOffset, y + 4)
				xOffset += 4
			} else {
				context.drawImage(this.recolorDict[name][string.charAt(i)], x + xOffset, y)
				xOffset += 8
			}
		}
	}
}
/* 
since javascript doesn't have true mod, we're creating a function for it!
*/
function mod(n, m) {
	return ((n % m) + m) % m;
}  
/*
	this layer object will be used to create, store, and return multiple layers (other canvases)
	used for more complicated screen transformations and edits
*/
var layers = {
	layerArray: [], 
	layerDictionary: {},
	createLayer: function(name, width, height) {
		if (!(name in layers.layerDictionary)) {
			console.log("creating layer with name " + name)
			this.layerArray.push(new layer(name, width, height))
			this.layerArray[layers.layerArray.length - 1].ctx.imageSmoothingEnabled = false;
			this.layerDictionary[name] = layers.layerArray[layers.layerArray.length - 1]
		} else {
			throw "A layer with this name already exists!"
		}
	},
	getLayer: function(name) {
		return layers.layerDictionary[name];
	}
};

function initialize() {
	canvas = document.getElementById("display-surface") // find the HTML element with id "display-surface" and store it's instance into a variable
	ctx = canvas.getContext("2d") // take the canvas and pass in the "2d" parameter, meaning it will use the Canvas2D library; ctx will be used for the visible display
	canvas.width = 256; // give the canvas a horizontal resolution in pixels
	canvas.height = 224; // give the canvas a vertical resolution in pixels
	canvas.style.width = (canvas.width * scale) + "px" // give the canvas a horizontal size in pixels
	canvas.style.height = (canvas.height * scale) + "px" // give the canvas a vertical size in pixels
	WIDTH = ctx.canvas.width; // storing the canvas's width into the width variable (the variable name is uppercase to differentiate between variable and constant)
	HEIGHT = ctx.canvas.height; // storing the canvas's height into the height variable (the variable name is uppercase to differentiate between variable and constant)
	gameState = "load" // set the game state to load
	document.getElementById('display-surface').focus() // focus the HTML element the game is taking input from so the player doesn't need to click the window every single time they load the game
	body = document.getElementsByTagName("body")[0] // getting and importing the body element into javascript
	body.style.background = getRandomColor(1, 270) // changing the background color for cosmetics
	menuValues.background2XPos = WIDTH
	ctx.imageSmoothingEnabled = false;
	window.requestAnimationFrame(main) // request a screen update from the browser (basically calls main to update)
};

/*
	main is a function used as the main loop for the game
*/
function main() {
	deltaTime1 = performance.now() // ALWAYS BE THE FIRST LINE AFTER THE FUNCTION
	deltaTime = (deltaTime1 - deltaTime2) / 1000 // this calculation should be done before it is used on that current frame
	fps = Math.round((fps * fpsSmoothing) + ((1 / deltaTime) * (1 - fpsSmoothing)))
	clearCanvas(ctx) // clearing the main canvas PUT THIS HERE FOR NOW
	if (gameState === "load" && !loaded) {
		var resource_paths = [
		'sprites/nintendo_logo.png',
		'sprites/title_screen/title_background.png',
		'sprites/title_screen/int_game_title.png',
		'sprites/title_screen/title_credits.png',
		'sprites/title_screen/selector_mushroom.png'
		]
		gameFont1String = "!().'-@+0123456789abcdefghijklmnopqrstuvwxyz"
		for (let i = 0; i < gameFont1String.length; i++) {
			gameFont1Paths.push("font/normal/" + gameFont1String.charAt(i) + ".png")
			gameFont1Paths.push("font/gloss/" + gameFont1String.charAt(i) + ".png")
		}
		gameFont1Paths.push("font/normal/" + "1_cc.png")
		gameFont1Paths.push("font/normal/" + "2_cc.png")
		gameFont1Paths.push("font/normal/" + "3_cc.png")
		gameFont1Paths.push("font/normal/" + "4_cc.png")
		gameFont1Paths.push("font/gloss/" + "1_cc.png")
		gameFont1Paths.push("font/gloss/" + "2_cc.png")
		gameFont1Paths.push("font/gloss/" + "3_cc.png")
		gameFont1Paths.push("font/gloss/" + "4_cc.png")
		layers.createLayer("gameFont1RecolorLayer", 8, 8)
		resource_paths = resource_paths.concat(gameFont1Paths)
		resources.load(resource_paths)
		resources.onReady(function() {gameState = "title_screen"}) // push a function that changes the game state to title_screen to a stack that will call the pushed function when done loading sprites
		loaded = true
	} else if (gameState === "title_screen") {
		if (!menuTimings.init) {
			gameFont1.init(gameFont1String)
			// outside, inside, gloss
			gameFont1.createRecolor("yeet", 0, [0, 0, 0], [255, 255, 255])
			//gameFont1.createRecolor("blue", 0, [0, 104, 248], [248, 248, 248])
			//gameFont1.createRecolor("pink", 0, [208, 0, 208], [248, 248, 248])
			//gameFont1.createRecolor("blueGloss", 1, [0, 104, 248], [248, 248, 248], [200, 200, 232])
			//gameFont1.createRecolor("pinkGloss", 1, [208, 0, 208], [248, 248, 248], [200, 200, 232])
			menuTimings.delta = performance.now() // get the amount of time that has passed since the program has sucessfully loaded resources. used for animations
			menuTimings.init = true;
			subGameState = "nintendo"
		}
		menuTimings.ticks = performance.now() - menuTimings.delta;
		if (subGameState != "player_select") {
			menuValues.background1XPos = -((menuTimings.ticks / 1000 * menuTimings.backgroundScrollSpeed) % WIDTH)
			menuValues.background2XPos = WIDTH - ((menuTimings.ticks / 1000 * menuTimings.backgroundScrollSpeed) % WIDTH)
		}
		ctx.drawImage(resources.get("sprites/title_screen/title_background.png"), menuValues.background1XPos, 0)
		ctx.drawImage(resources.get("sprites/title_screen/title_background.png"), menuValues.background2XPos, 0)
		ctx.drawImage(resources.get("sprites/title_screen/int_game_title.png"), 11, 25)
		ctx.drawImage(resources.get("sprites/title_screen/title_credits.png"), 84, 199)
		/*
		count += 1;
		for (let x = 0; x < 32; x++) {
			for (let y = 0; y < 28; y++) {
				ctx.drawImage(gameFont1.recolorDict["yeet"][extendedFontCharacters.charAt((Math.floor(count)) % extendedFontCharacters.length)], x * 8, y * 8)
			}
		}
		*/
		if (subGameState == "player_select") {
			drawRect(ctx, 64, 120, 125, 40, true, "#000000")
			if (gameSelectValues.playerCount == 0) {
				ctx.drawImage(resources.get("sprites/title_screen/selector_mushroom.png"), 83, 127)
			} else if (gameSelectValues.playerCount == 1) {
				ctx.drawImage(resources.get("sprites/title_screen/selector_mushroom.png"), 83, 144)
			}
			gameFont1.drawText("1", 100, 128, "blueGloss", ctx)
			gameFont1.drawText("2", 100, 144, "pinkGloss", ctx)
			gameFont1.drawText("p game", 108, 128, "blue", ctx)
			gameFont1.drawText("p game", 108, 144, "pink", ctx)
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
		console.log("debug")
		gameFont1.drawText("fps-" + fps.toString(), 0, 0, "yeet", ctx)
		gameFont1.drawText("gameState-" + gameState.replace("_", "."), 0, 8, "yeet", ctx)
		gameFont1.drawText("subGameState-" + subGameState.replace("_", "."), 0, 16, "yeet", ctx)
	}
	deltaTime2 = performance.now() // ALWAYS BE RIGHT BEFORE REQUEST ANIMATION FRAME
	window.requestAnimationFrame(main) // the function proceeds to call itself again for another update
};
/*
	layer class to create multiple "drawing surfaces". Makes overlays and stuff easier
*/
function layer(name, width, height) {
	this.name = name
	this.canvas = document.createElement('canvas');
	this.ctx = this.canvas.getContext("2d")
	this.canvas.width = width
	this.canvas.height = height
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
				img.crossOrigin = "Anonymous";
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
		debug = !debug
	};
	if (event.keyCode == 38 && !controlBooleans.up) { // UP
		if (gameState == "title_screen") {
			if (subGameState == "player_select") {
				gameSelectValues.playerCount = mod(gameSelectValues.playerCount + 1, 2)
			}
		}
	}
	if (event.keyCode == 37 && !controlBooleans.left) { // LEFT
	}
	if (event.keyCode == 40 && !controlBooleans.down) { // DOWN
		if (gameState == "title_screen") {
			if (subGameState == "player_select") {
				gameSelectValues.playerCount = mod(gameSelectValues.playerCount - 1, 2)
			}
		}
	}
	if (event.keyCode == 39 && !controlBooleans.right) { // RIGHT
	}
	if (event.keyCode == 67 && !controlBooleans.b) { // C to B
		if (gameState == "title_screen") {
			if (subGameState == "title") {
				subGameState = "player_select"
			}
		}
	}
	if (event.keyCode == 86 && !controlBooleans.a) { // V to A
	}
	if (event.keyCode == 88 && !controlBooleans.y) { // X to Y
	}
	if (event.keyCode == 68 && !controlBooleans.x) { // D to X
	}
	if (event.keyCode == 32 && !controlBooleans.start) { // Space to Start
		if (gameState == "title_screen") {
			if (subGameState == "title") {
				subGameState = "player_select"
			}
		}
	}
	if (event.keyCode == 13 && !controlBooleans.select) { // Enter to Select
	}
	if (event.keyCode == 65 && !controlBooleans.l) { // A to L
	}
	if (event.keyCode == 83 && !controlBooleans.r) { // S to R
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
window.addEventListener("load", initialize, false); // an event listener for when the page and all it's code, calls the "initialize" function