/* Alex Liu
 * October 11, 2019
 * a recreation of Super Mario Kart for the SNES (Super Nintendo Entertainment System)
 */

/*
TODO:
 - Refactor [DONE]
  L Sprite loader must include frames, etc.
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
var error_img = new Image()
error_img.src = "sprites/placeholder.png"
function initialize() {
	canvas = document.getElementById("display-surface") // find the HTML element with id "display-surface" and store it's instance into a variable
	ctx = canvas.getContext("2d") // take the canvas and pass in the "2d" parameter, meaning it will use the Canvas2D library; ctx will be used for the visible display
	canvas.width = 256; // give the canvas a horizontal resolution in pixels
	canvas.height = 224; // give the canvas a vertical resolution in pixels
	canvas.style.width = (canvas.width * scale) + "px" // give the canvas a horizontal size in pixels
	canvas.style.height = (canvas.height * scale) + "px" // give the canvas a vertical size in pixels
	WIDTH = ctx.canvas.width; // storing the canvas's width into the width variable (the variable name is uppercase to differentiate between variable and constant)
	HEIGHT = ctx.canvas.height; // storing the canvas's height into the height variable (the variable name is uppercase to differentiate between variable and constant)
	gameState = "load"
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
	clearCanvas(ctx)
	ctx.drawImage(error_img, 0, 0);
	if (gameState === "load") {
		resources.load(['sprites/nintendo_logo.png', 'sprites/title_screen/title_background.png', 'sprites/title_screen/int_game_title.png'])
		resources.onReady(function() {gameState = "title_screen"})
	} else if (gameState === "title_screen") {
		drawRect(ctx, 0, 0, WIDTH, HEIGHT, true, [0, 0, 0])
	}
	if (debug) {
		drawText(ctx, 4, 10, fps.toString(), 8, "#FFFF00", "Arial")
		drawText(ctx, 4, 20, "gameState: " + gameState, 8, "#FFFFFF", "Arial")
	}
	deltaTime2 = performance.now() // ALWAYS BE RIGHT BEFORE REQUEST ANIMATION FRAME
	window.requestAnimationFrame(main) // the function proceeds to call itself again for another update
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

				if(isReady()) {
					readyCallbacks.forEach(function(func) { func(); });
				}
			};
			resourceCache[url] = false;
			img.src = url;
			console.log("loaded: " + url)
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