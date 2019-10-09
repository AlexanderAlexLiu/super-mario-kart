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
*/

var canvas;
var ctx;
var game_state = "load";
var camera;
var WIDTH, HEIGHT;
var dt_1;
var dt_2;
var debug = false;
var body = document.getElementsByTagName("body")[0];

// FOR TEST
var blockArray = []

// game initialization function
function init() {
	// load the canvas from the html document into a variable called "canvas"
	canvas = document.getElementById("display-surface");
	// takes the canvas object and creating a 2d rendering context
	ctx = canvas.getContext("2d");
	canvas.width = 256;
	canvas.height = 224;
	canvas.style.width = (canvas.width * 2) + "px";
	canvas.style.height = (canvas.height * 2) + "px";
	// create a camera object to control the in-game camera
	camera = {pos_x:0, pos_y:0, angle:0};
	// storing the canvas's width into our WIDTH constant
	WIDTH = ctx.canvas.width;
	// storing the canvas's height into our HEIGHT constant
	HEIGHT = ctx.canvas.height;
	// random background color for fun :>
	body.style.background = getRandomColor();
	// give the canvas focus so the user doesn't need to click on the window every time the game loads

	// FOR TEST
	for (var i = 0; i < 200; i++) {
		blockArray.push(new block());
	};

	document.getElementById('display-surface').focus();
	window.requestAnimationFrame(main);
};

var logo = new Image();
logo.src = 'sprites/nintendo_logo.png';

// main game function
function main() {
	// FOR TEST
	for (var i = 0; i < blockArray.length; i++) {
		blockArray[i].x += blockArray[i].speed / 10;
		updateBlokkk(blockArray[i]);
		if (blockArray[i].x > 256) {
			blockArray[i].x = -20;
		};
	};

	// math
	dt_1 = performance.now();
	// logic
	// drawing
	ctx.imageSmoothingEnabled = false;
	ctx.imageSmoothingQuality
	clearScreen();
	if (debug) {
		var fps = 1 / ((dt_2 - dt_1) / 1000)
		ctx.font = "12px Arial";
		ctx.fillText(fps, 0, 0);
	}
	if (game_state == "load") {
		drawRect(0, 0, WIDTH, HEIGHT, "#000000", true);
		ctx.drawImage(logo, 99, 113, logo.width, logo.height)
		drawRect(99, 113, logo.width, logo.height, [255, 0, 0], false, true, 2);
	};

	// FOR TEST
	for (var i = 0; i < blockArray.length; i++) {
		drawRect(blockArray[i].x % 256, 107 + (Math.sin(blockArray[i].x / (blockArray[i].speed * 2)) * 100), 10, 10, [blockArray[i].r, blockArray[i].g, blockArray[i].b], true)
	};
	for (var i = 0; i < blockArray.length; i++) {
		drawRect(blockArray[i].x % 256, 107 - (Math.sin(blockArray[i].x / (blockArray[i].speed * 2)) * 100), 10, 10, [blockArray[i].r, blockArray[i].g, blockArray[i].b], true)
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
};

function onKeyUp(event) {
	console.log(event.keyCode);
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
	return result ? {r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16)} : null;
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


var block = function() {
	this.r = 255;
	this.g = 255;
	this.b = 255;
	this.speed = Math.random() * (20 - 8 + 1) + 8;
	this.x = 0;
}

function updateBlokkk(me_secret_formuler) {
	me_secret_formuler.r = Math.round((me_secret_formuler.r + (Math.random() * 2))) % 255;
	me_secret_formuler.g = Math.round((me_secret_formuler.g + (Math.random() * 2))) % 255;
	me_secret_formuler.b = Math.round((me_secret_formuler.b + (Math.random() * 2))) % 255;
}


// an event listener for when the page loads. Just so the game loads when the page is finished loading
window.addEventListener("load", init, false);

// an event listener for when the page gets a keydown event
window.addEventListener("keydown", onKeyDown, false);

// an event listener for when the page gets a keyup event
window.addEventListener("keyup", onKeyUp, false);