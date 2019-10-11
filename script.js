/* Alex Liu
 * October 11, 2019
 * a recreation of Super Mario Kart for the SNES (Super Nintendo Entertainment System)
 */

/*
TODO:
 - Refactor
 - Create a sprite loader
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
*/

var canvas, ctx, WIDTH, HEIGHT // declaring the variables (and constants) that will be used for the game's display
var scale = 1 // a variable used to change the scaling of the game's display
var debug = false // declaring and initializing a variable to turn on or off debug mode
var gameState // declaring a variable to keep track of the game's state
var deltaTime, deltaTime1, deltaTime2 // declaring variables to store and calculate the time it took to update the display (very important for physics!)
var fps // declaring a variable to track the updates per second
var fpsSmoothing = 0.9 // declaring and initializing a variable that will be used to keep the tracker for updates per second less variable; the higher, the more smoothing (up to 1)

function initialize() {
	canvas = document.getElementById("display-surface") // find the HTML element with id "display-surface" and store it's instance into a variable
	ctx = canvas.getContext("2d") // take the canvas and pass in the "2d" parameter, meaning it will use the Canvas2D library; ctx will be used for the visible display
	canvas.width = 256; // give the canvas a horizontal resolution in pixels
	canvas.height = 224; // give the canvas a vertical resolution in pixels
	canvas.style.width = (canvas.width * scale) + "px" // give the canvas a horizontal size in pixels
	canvas.style.height = (canvas.height * scale) + "px" // give the canvas a vertical size in pixels
	WIDTH = ctx.canvas.width; // storing the canvas's width into the width variable (the variable name is uppercase to differentiate between variable and constant)
	HEIGHT = ctx.canvas.height; // storing the canvas's height into the height variable (the variable name is uppercase to differentiate between variable and constant)
	document.getElementById('display-surface').focus() // focus the HTML element the game is taking input from so the player doesn't need to click the window every single time they load the game
	window.requestAnimationFrame(main) // request a screen update from the browser (basically calls main to update)
};

/*
	main is a function used as the main loop for the game
*/
function main() {
	window.requestAnimationFrame(main) // the function proceeds to call itself again for another update
};

/*
	onKeyDown is a function takes a keyboard "keydown" event
	and processes it
*/
function onKeyDown(event) {
	console.log(event)
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
*/ 
function getRandomColor() {
	var letters = '0123456789ABCDEF'
	var color = '#'
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)]
	};
	return color;
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

window.addEventListener("keydown", onKeyDown, false); // an event listener for when the user presses down on a keyboard key
window.addEventListener("keyup", onKeyUp, false); // an event listener for when the user lifts up off a keyboard key
window.addEventListener("load", init, false); // an event listener for when the page and all it's code, calls the "initialize" function