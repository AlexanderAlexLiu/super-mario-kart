/* Alex Liu
 * October 7, 2019
 * A recreation of Super Mario Circuit for the SNES (Super Nintendo Entertainment System)
 */

/*
TODO:
 - Create a sprite loader
  L Sprite loader must include frames, etc.
  L Somehow get frame counting onKeyDown
 - Create map and make moveable camera
 - Create vector physics engine
 - ??
 - Profit
 - Use draw offsets to scroll the map rather than changing sprite's x, and y locations.
*/

var canvas;
var ctx;
var game_state = "load";
var camera;
var WIDTH, HEIGHT;
var dt;
var dt_1;
var dt_2 = 0;
var debug = false;
var body = document.getElementsByTagName("body")[0];
var fps = 0;
var fps_smoothing = 0.9;

function init() {
	// load the canvas from the html document into a variable called "canvas"
	canvas = document.getElementById("display-surface");
	// takes the canvas object and creating a 2d rendering context
	ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	canvas.width = 256;
	canvas.height = 224;
	canvas.style.width = (canvas.width * 2) + "px";
	canvas.style.height = (canvas.height * 2) + "px";
	canvas_2 = document.createElement("canvas");
	ctx_2 = canvas_2.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	canvas_2.width = 1024;
	canvas_2.height = 1024;
	canvas_2.style.width = (canvas_2.width * 1) + "px";
	canvas_2.style.height = (canvas_2.height * 1) + "px";
	// create a camera object to control the in-game camera
	camera = { pos_x: 0, pos_y: 0, angle: 0, camera_speed: 4, up: false, down: false, left: false, right: false };
	// storing the canvas's width into our WIDTH constant
	WIDTH = ctx.canvas.width;
	// storing the canvas's height into our HEIGHT constant
	HEIGHT = ctx.canvas.height;
	// random background color for fun :>
	body.style.background = getRandomColor();
	// give the canvas focus so the user doesn't need to click on the window every time the game loads
	document.getElementById('display-surface').focus();
	window.requestAnimationFrame(main);
};
function main() {
	// math
	dt_1 = performance.now();
	dt = (dt_1 - dt_2) / 1000;

	// logic
	// drawing
	clearScreen();

	ctx.drawImage(canvas_2, 0, 0);
	if (debug) {
		ctx.fillStyle = '#FFFFFF';
		fps = Math.round((fps * fps_smoothing) + ((1 / dt) * (1 - fps_smoothing)));
		ctx.font = "8px Arial";
		ctx.fillText(fps.toString(), 4, 10);
	};
	dt_2 = performance.now();
	window.requestAnimationFrame(main);
};

// functions to handle key events
function onKeyDown(event) {
	console.log(event.keyCode);
	if (event.keyCode == 107) {
		debug = !debug;
		console.log(debug);
	};
	if (game_state == 'load' && event.keyCode == 32) {
		game_state = 'test';
	}
	if (event.keyCode == 39) {
		camera.right = true;
	} else if (event.keyCode == 37) {
		camera.left = true;
	}
	if (event.keyCode == 40) {
		camera.down = true;
	} else if (event.keyCode == 38) {
		camera.up = true;
	}
};

function onKeyUp(event) {
	console.log(event.keyCode);
	if (event.keyCode == 39) {
		camera.right = false;
	} else if (event.keyCode == 37) {
		camera.left = false;
	}
	if (event.keyCode == 40) {
		camera.down = false;
	} else if (event.keyCode == 38) {
		camera.up = false;
	}
};

// a function used to clear the screen for the next render (improve this later)
function clearScreen() {
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
};

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	};
	return color;
};

// function to convert component to hex code
function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
};

// function to convert rgb to hex codes

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

// function to convert hex to rgb
function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};

// a function to draw rectangles
function drawRect(x, y, w, h, color, fill = false, stroke = false, stroke_weight = 0) {
	ctx.beginPath()
	if (Array.isArray(color)) {
		ctx.fillStyle = rgbToHex(color[0], color[1], color[2]);
	} else {
		ctx.fillStyle = color;
	};
	if (fill) {
		ctx.fillRect(x, y, w, h);
	};
	if (stroke) {
		ctx.lineWidth = stroke_weight;
		ctx.rect(x, y, w, h);
		ctx.stroke();
	};
	ctx.closePath();
};

// an event listener for when the page loads. Just so the game loads when the page is finished loading
window.addEventListener("load", init, false);
// an event listener for when the page gets a keydown event
window.addEventListener("keydown", onKeyDown, false);
// an event listener for when the page gets a keyup event
window.addEventListener("keyup", onKeyUp, false);