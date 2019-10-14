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
var deltaTime, deltaTime1, deltaTime2 = 0; // declaring variables to store and calculate the time it took to update the display (very important for physics!)
var fps = 0 // declaring and initializing a variable to track the updates per second
var fpsSmoothing = 0.9 // declaring and initializing a variable that will be used to keep the tracker for updates per second less variable; the higher, the more smoothing (up to 1)
var menuTimings = {backgroundScrollSpeed: 90, ticks: 0, delta: 0, init: false, firstLoad: true}
var setupTimings = {setupState: 0, menuRectX: 0, menuRectY: 0, menuRectW:0, menuRectH:0, ticks: 0, delta: 0, init: false}
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
			layers.layerArray.push(new layer(name, width, height))
			layers.layerDictionary[name] = layers.layerArray[layers.layerArray.length - 1]
		} else {
			throw "A layer with this name already exists!"
		}
	},
	getLayer: function(name) {
		return layers.layerDictionary[name];
	}
};
var errorImg = new Image() // manually loading in a error image to help figure out what is wrong if a bug happens to appear
errorImg.src = "sprites/placeholder.png" // defining the location of the error image.
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
	if (gameState === "load") {
		resources.load(['sprites/nintendo_logo.png', 'sprites/title_screen/title_background.png', 'sprites/title_screen/int_game_title.png', 'sprites/title_screen/title_credits.png']) 
		resources.onReady(function() {gameState = "title_screen"}) // push a function that changes the game state to title_screen to a stack that will call the pushed function when done loading sprites 
	} else if (gameState === "title_screen") {
		// ALL THIS HAS TO BE REFACTORED
		if (!menuTimings.init) {
			menuTimings.delta = performance.now()
			menuTimings.init = true;
		}
		menuTimings.ticks = performance.now() - menuTimings.delta;
		ctx.drawImage(resources.get("sprites/title_screen/title_background.png"), 0 - ((menuTimings.ticks / 1000 * menuTimings.backgroundScrollSpeed) % 512), 0)
		ctx.drawImage(resources.get("sprites/title_screen/title_background.png"), 512 - ((menuTimings.ticks / 1000 * menuTimings.backgroundScrollSpeed) % 512), 0)
		ctx.drawImage(resources.get("sprites/title_screen/int_game_title.png"), 11, 25)
		ctx.drawImage(resources.get("sprites/title_screen/title_credits.png"), 84, 199)
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
		}
	} else if (gameState === "race_setup") {
		ctx.drawImage(layers.getLayer("title_frozen").canvas, 0, 0)
		if (setupTimings.setupState == 0) {
			// CLEAN THESE UGLY CALCULATIONS UP
			if (!setupTimings.init) {
				setupTimings.delta = performance.now()
				setupTimings.init = true
				setupTimings.menuRectX = 128;
				setupTimings.menuRectY = 112;
			};
			setupTimings.ticks = performance.now() - setupTimings.delta;
			if (setupTimings.ticks <= 500) {
				setupTimings.menuRectW = 0.252 * setupTimings.ticks;
				setupTimings.menuRectH = 0.082 * setupTimings.ticks;
				setupTimings.menuRectX = 128 - 0.128 * setupTimings.ticks;
				setupTimings.menuRectY = 112 + 0.016 * setupTimings.ticks;
			};
			drawRect(ctx, Math.ceil(setupTimings.menuRectX), Math.ceil(setupTimings.menuRectY), Math.ceil(setupTimings.menuRectW), Math.ceil(setupTimings.menuRectH), true, [0, 0, 0])
			/*
			if (!setupTimings.animationSetup) {
				setupTimings.menuRectW = 0;
				setupTimings.menuRectH = 0;
				setupTimings.menuRectX = 128;
				setupTimings.menuRectY = 122;
				setupTimings.animationSetup = true;
			};
			if (setupTimings.menuRectW < 126) {
				setupTimings.menuRectW += (124 / 6)
			} else {
				setupTimings.menuRectW = 124
			};
			if (setupTimings.menuRectH < 41) {
				setupTimings.menuRectH += (41 / 6)
			} else {
				setupTimings.menuRectH = 41
			}
			if (setupTimings.menuRectX > 64) {
				setupTimings.menuRectX -= (64 / 6)
			} else {
				setupTimings.menuRectX = 64
			};
			if (setupTimings.menuRectY > 120) {
				setupTimings.menuRectY -= (120 / 6)
			} else {
				setupTimings.menuRectY = 120
			};
			drawRect(ctx, setupTimings.menuRectX, setupTimings.menuRectY, setupTimings.menuRectW, setupTimings.menuRectH, true, [0, 0, 0])
			*/
		};
	}; // END
	if (debug) {
		drawText(ctx, 4, 10, fps.toString(), 8, "#FFFF00", "Arial")
		drawText(ctx, 4, 20, "gameState: " + gameState, 8, "#FFFFFF", "Arial")
	}
	deltaTime2 = performance.now() // ALWAYS BE RIGHT BEFORE REQUEST ANIMATION FRAME
	window.requestAnimationFrame(main) // the function proceeds to call itself again for another update
};

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
	if (gameState === "title_screen" && menuTimings.ticks > 4200 && event.keyCode == 66) {
		layers.createLayer("title_frozen", 256, 244)
		layers.getLayer("title_frozen").ctx.drawImage(canvas, 0, 0)
		gameState = "race_setup"
	};
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