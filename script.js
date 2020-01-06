/*
Author: Alex Liu
Creation Date: October 11, 2019
Purpose: Final project for ICS3U
Description: A (really garbage) recreation of Super Mario KarT for the SNES
/*
/*
TODO:
1. Noting
*/
var countah = 0
var body // stores a Element object representing the HTML body
var canvas // stores a Element object representing the element with the "display-surface" id
var ctx  // stores the drawing context of whatever element the canvas variable has stored
var WIDTH, HEIGHT // stores constants of the canvas's width and height respectively
var game = { gameScale: 2, debug: false, gameState: "", subGameState: "" }
var fps = { deltaTime: 1, pastTime: 0, presentTime: 0, framesPerSecond: 0, fpsSmoothing: 0.9 }
var clock = { frameInterval: undefined, then: undefined, now: undefined, startTime: undefined, fpsCap: undefined, elapsed: undefined }
var menuBackgroundValues = { backgroundXPos1: undefined, backgroundXPos2: undefined, scrollSpeed: 90}
var controlBooleans = { up: false, down: false, right: false, left: false, b: false, a: false, x: false, y: false, start: false, select: false, l: false, r: false }
var controlBinds = { debug: 77, up: 38, left: 37, down: 40, right: 39, b: 67, a: 86, y: 88, x: 68, start: 32, select: 13, l: 65, r: 83 }
var mainMenu = {startTime: 0, initialized: false, sinceStart: 0, fadeOutStart: 0, fadeOutInit: false}
var raceSetupValues = {playerCount: 0, mode: 0, speed: 0, ok: 0}
var characterMenu = {startTime: 0, init: false, character: 0, isSelected: false, flash: 0, characterAngle: 90, confirmSelect: false}
var characterLayers = ["character0", "character1", "character2", "character3", "character4", "character5", "character6", "character7"]
var resourcePaths = [
	'sprites/nintendo_logo.png',
	'sprites/title_screen/title_background.png',
	'sprites/title_screen/int_game_title.png',
	'sprites/title_screen/title_credits.png',
	'sprites/title_screen/selector_mushroom.png',
	'sprites/character_screen/frame.png',
	"sprites/character_screen/banner.png",
	"sprites/character_screen/select_background.png",
	"sprites/character_screen/player_1_select.png",
	"sprites/character_screen/p1_check.png",
	"sprites/character_screen/p1_confirm.png",
	"sprites/maps/mario_circuit_2.png",
	"sprites/maps/mc2_background_0.png",
	"sprites/maps/mc2_background_1.png",
	"sprites/maps/mc2_scuffed_minimap.png",
	"sprites/driver/yoshi/idle.png"
]
var raceValues = {isFinished: false, background_0_x: 0, background_1_x: 0, mapBoundingBoxes: 
	[
		[0, 0, 744, 8],
		[736, 0, 8, 160],
		[736, 152, 288, 8],
		[1016, 152, 8, 872],
		[472, 1016, 552, 8],
		[472, 872, 8, 144],
		[0, 872, 480, 8],
		[0, 0, 8, 880],
		[136, 552, 40, 112],
		[168, 160, 104, 432],
		[263, 376, 424, 120],
		[680, 416, 136, 80],
		[736, 495, 80, 321]
	]
}
var player = {x: -920, y: -595, angle: 0, net_force: new Victor(0, 0), accleration_force: new Victor(0, 0), turn_accel: 0, checkpointCollected: false, laps: 0, hit: true}
var camera = {x: 0, y: 0}
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
	this.canvas.width = layerWidth;
	this.canvas.height = layerHeight;
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
	// character layers?
	layers.createLayer("character0", 38, 35)
	layers.createLayer("character1", 38, 35)
	layers.createLayer("character2", 38, 35)
	layers.createLayer("character3", 38, 35)
	layers.createLayer("character4", 38, 35)
	layers.createLayer("character5", 38, 35)
	layers.createLayer("character6", 38, 35)
	layers.createLayer("character7", 38, 35)
	layers.createLayer("map", 1024, 1024)
	layers.createLayer("perspectiveMap", 256, 448)
	layers.createLayer("mode7", 256, 448)
	resources.onReady(function () {
		gameFont.createRecolor(0, 0, "debugFont", [0, 0, 0], [255, 255, 255]);
		gameFont.createRecolor(0, 0, "font", [255, 20, 147], [255, 255, 255]);
		gameFont.createRecolor(0, 0, "blue", [0, 104, 248], [248, 248, 248])
		gameFont.createRecolor(0, 0, "pink", [208, 0, 208], [248, 248, 248])
		gameFont.createRecolor(0, 0, "magenta", [0, 0, 0], [255, 123, 231])
		gameFont.createRecolor(0, 1, "blueGloss", [0, 104, 248], [248, 248, 248], [200, 200, 232])
		gameFont.createRecolor(0, 1, "pinkGloss", [208, 0, 208], [248, 248, 248], [200, 200, 232])
		gameFont.createRecolor(0, 0, "mapSelectFont", [0, 0, 0], [255, 255, 255]);
		gameFont.createRecolor(0, 1, "mapSelectFontGloss", [0, 0, 0], [248, 248, 248], [206, 206, 239])
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
				xOffset -= 4
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
			if (game.subGameState == "title" || game.subGameState == "nintendo") {
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
			} else if (game.subGameState == "mode_select") {
				drawRect(ctx, 64, 120, 125, 40, true, "#000000")
				gameFont.drawText(ctx, "blue", "mariokart gp", 88, 128)
				gameFont.drawText(ctx, "pink", "time trial", 88, 144)
				if (raceSetupValues.mode == 0) {
					ctx.drawImage(resources.get("sprites/title_screen/selector_mushroom.png"), 71, 127)
				} else {
					ctx.drawImage(resources.get("sprites/title_screen/selector_mushroom.png"), 71, 143)
				}
			} else if (game.subGameState == "speed_select") {
				drawRect(ctx, 64, 120, 125, 40, true, "#000000")
				gameFont.drawText(ctx, "blueGloss", "50", 92, 128)
				gameFont.drawText(ctx, "blue", "^ class", 108, 128)
				gameFont.drawText(ctx, "pinkGloss", "100", 92, 144)
				gameFont.drawText(ctx, "pink", "^ class", 116, 144)
				if (raceSetupValues.speed == 0) {
					ctx.drawImage(resources.get("sprites/title_screen/selector_mushroom.png"), 75, 127)
				} else {
					ctx.drawImage(resources.get("sprites/title_screen/selector_mushroom.png"), 75, 143)
				}
			} else if (game.subGameState == "confirm_select") {
				if (raceSetupValues.mode == 0) {
					drawRect(ctx, 64, 112, 125, 86, true, "#000000")
					ctx.drawImage(resources.get("sprites/title_screen/selector_mushroom.png"), 71, 119)
					ctx.drawImage(resources.get("sprites/title_screen/selector_mushroom.png"), 71, 135)
					ctx.drawImage(resources.get("sprites/title_screen/selector_mushroom.png"), 71, 151)
					if (raceSetupValues.playerCount == 0) {
						gameFont.drawText(ctx, "blueGloss", "1", 88, 120)
						gameFont.drawText(ctx, "blue", "p game", 96, 120)
					} else {
						gameFont.drawText(ctx, "blueGloss", "2", 88, 120)
						gameFont.drawText(ctx, "blue", "p game", 96, 120)
					}
					if (raceSetupValues.mode == 0) {
						gameFont.drawText(ctx, "blue", "mariokart gp", 88, 136)
					} else {
						gameFont.drawText(ctx, "blue", "time trial", 88, 136)
					}
					if (raceSetupValues.speed == 0) {
						gameFont.drawText(ctx, "blueGloss", "50", 88, 152)
						gameFont.drawText(ctx, "blue", "^ class", 104, 152)
					} else {
						gameFont.drawText(ctx, "blueGloss", "100", 88, 152)
						gameFont.drawText(ctx, "blue", "^ class", 112, 152)
					}
					gameFont.drawText(ctx, "pink", "is this ok+", 96, 168)
					gameFont.drawText(ctx, "pink", "yes", 120, 184)
					gameFont.drawText(ctx, "pink", "no", 160, 184)
					if (raceSetupValues.ok == 0) {
						gameFont.drawText(ctx, "blue", "(   )", 112, 184)
					} else {
						gameFont.drawText(ctx, "blue", "(  )", 152, 184)
					}
				} else if (raceSetupValues.mode == 1) {
					drawRect(ctx, 64, 112, 125, 72, true, "#000000")
					ctx.drawImage(resources.get("sprites/title_screen/selector_mushroom.png"), 71, 119)
					ctx.drawImage(resources.get("sprites/title_screen/selector_mushroom.png"), 71, 135)
					ctx.drawImage(resources.get("sprites/title_screen/selector_mushroom.png"), 71, 151)
					if (raceSetupValues.playerCount == 0) {
						gameFont.drawText(ctx, "blueGloss", "1", 88, 120)
						gameFont.drawText(ctx, "blue", "p game", 96, 120)
					} else {
						gameFont.drawText(ctx, "blueGloss", "2", 88, 120)
						gameFont.drawText(ctx, "blue", "p game", 96, 120)
					}
					if (raceSetupValues.mode == 0) {
						gameFont.drawText(ctx, "blue", "mariokart gp", 88, 136)
					} else {
						gameFont.drawText(ctx, "blue", "time trial", 88, 136)
					}
					gameFont.drawText(ctx, "pink", "is this ok+", 96, 152)
					gameFont.drawText(ctx, "pink", "yes", 120, 168)
					gameFont.drawText(ctx, "pink", "no", 160, 168)
					if (raceSetupValues.ok == 0) {
						gameFont.drawText(ctx, "blue", "(   )", 112, 168)
					} else {
						gameFont.drawText(ctx, "blue", "(  )", 152, 168)
					}
				}
			} else if (game.subGameState == "fade_select") {
				if (!mainMenu.fadeOutInit) {
					mainMenu.fadeOutStart = performance.now()
					mainMenu.fadeOutInit = true
				}
				if (performance.now() - mainMenu.fadeOutStart <= 1000) {
					ctx.globalAlpha = 0.001 * (performance.now() - mainMenu.fadeOutStart)
					drawRect(ctx, 0, 0, WIDTH, HEIGHT, true, [0, 0, 0])
					ctx.globalAlpha = 0
				} else {
					game.gameState = "character_select"
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
		} else if (game.gameState == "character_select") {
			if (!characterMenu.init) {
				characterMenu.startTime = Math.floor(performance.now())
				characterMenu.init = true
			}
			ctx.drawImage(resources.get("sprites/character_screen/banner.png"), 176 - (((performance.now() - characterMenu.startTime) / 25) % 256), 23)
			ctx.drawImage(resources.get("sprites/character_screen/select_background.png"), 37, 77)
			ctx.drawImage(resources.get("sprites/character_screen/select_background.png"), 85, 77)
			characterLayers.forEach(
				layerName => {
					if (!(characterMenu.isSelected && characterMenu.character == layerName.charAt(9))) {
						layers.getLayer(layerName).ctx.drawImage(resources.get("sprites/character_screen/select_background.png"), 0 - (((performance.now() - characterMenu.startTime) / 12) % 49), -6);
						layers.getLayer(layerName).ctx.drawImage(resources.get("sprites/character_screen/select_background.png"), 48 - (((performance.now() - characterMenu.startTime) / 12) % 49), -6)	
					}
				}
			)
			for (let y = 0; y < 2; y++) {
				for (let x = 0; x < 4; x++) {
					ctx.drawImage(layers.getLayer(`character${x + (y * 4)}`).canvas, 37 + 48 * x, 77 + 64 * y)
				}
			}
			ctx.drawImage(resources.get("sprites/character_screen/frame.png"), 0, -1)
			characterMenu.flash = (characterMenu.flash + 1) % 4
			if (!characterMenu.flash == 0 || characterMenu.isSelected || characterMenu.confirmSelect) {
				switch (characterMenu.character) {
					case 0:
						ctx.drawImage(resources.get("sprites/character_screen/player_1_select.png"), 48, 63)
						break;
					case 1:
						ctx.drawImage(resources.get("sprites/character_screen/player_1_select.png"), 96, 63)
						break;
					case 2:
						ctx.drawImage(resources.get("sprites/character_screen/player_1_select.png"), 144, 63)
						break;
					case 3:
						ctx.drawImage(resources.get("sprites/character_screen/player_1_select.png"), 192, 63)
						break;
					case 4:
						ctx.drawImage(resources.get("sprites/character_screen/player_1_select.png"), 48, 127)
						break;
					case 5:
						ctx.drawImage(resources.get("sprites/character_screen/player_1_select.png"), 96, 127)
						break;
					case 6:
						ctx.drawImage(resources.get("sprites/character_screen/player_1_select.png"), 144, 127)
						break;
					case 7:
						ctx.drawImage(resources.get("sprites/character_screen/player_1_select.png"), 192, 127)
						break;
				}
			}
			if (characterMenu.isSelected && !characterMenu.confirmSelect) {
				ctx.drawImage(resources.get("sprites/character_screen/p1_check.png"), 151, 190)
			} else if (characterMenu.confirmSelect) {
				ctx.drawImage(resources.get("sprites/character_screen/p1_confirm.png"), 151, 190)
				if (!(characterMenu.characterAngle == 0)) {
					characterMenu.characterAngle -= 1
				} else {
					game.gameState = "tmap_select"
				}
			}
			if (performance.now() - characterMenu.startTime <= 500) {
				ctx.globalAlpha = 1 - 0.002 * (performance.now() - characterMenu.startTime)
				drawRect(ctx, 0, 0, WIDTH, HEIGHT, true, [0, 0, 0])
				ctx.globalAlpha = 1
			}
		} else if (game.gameState == "tmap_select") {
			drawRect(ctx, 0, 0, 256, 3, true, "#000000")
			drawRect(ctx, 0, 107, 256, 8, true, "#000000")
			drawRect(ctx, 0, 219, 256, 5, true, "#000000")
			drawRect(ctx, 80, 16, 88, 8, true, "#000000")
			gameFont.drawText(ctx, "mapSelectFont", "course select", 80, 16)
			gameFont.drawText(ctx, "magenta", "mushroom", 24, 32)
			gameFont.drawText(ctx, "magenta", "cup", 92, 32)
			gameFont.drawText(ctx, "mapSelectFont", "mario", 128, 32)
			gameFont.drawText(ctx, "mapSelectFont", "circuit", 172, 32)
			gameFont.drawText(ctx, "mapSelectFontGloss", "1", 232, 32)
		} else if (game.gameState == "in_game") {
			clearCanvas(ctx)
			if (!raceValues.isFinished) {
				console.log(player.angle)
				if (controlBooleans.b) {
					player.accleration_force.y = 5
				}
				if (controlBooleans.left) {
					player.turn_accel -= 1
					raceValues.background_0_x = mod(raceValues.background_0_x + 1, 768)
					raceValues.background_1_x = mod(raceValues.background_1_x + 2, 1280)
				} else if (player.turn_accel < 0) {
					player.turn_accel += 1
				}
				if (controlBooleans.right) {
					player.turn_accel += 1
					raceValues.background_0_x = mod(raceValues.background_0_x - 1, 768)
					raceValues.background_1_x = mod(raceValues.background_1_x - 2, 1280)
				} else if (player.turn_accel > 0) {
					player.turn_accel -= 1
				} 
				if (player.accleration_force.y > 0) {
					player.accleration_force.y -= 0.2
				}
				if (player.turn_accel > 3) {
					player.turn_accel = 3
				} else if (player.turn_accel < -3) {
					player.turn_accel = -3
				}
				player.angle += player.turn_accel
				player.net_force.x = 0
				player.net_force.y = 0
				player.net_force.add(player.accleration_force)
				player.net_force.rotateDeg(player.angle)
				player.hit = false
				raceValues.mapBoundingBoxes.forEach(box => {
					if ((-player.x + player.net_force.x > box[0] && -player.x + player.net_force.x < box[0] + box[2]) && (-player.y + player.net_force.y > box[1] && -player.y + player.net_force.y < box[1] + box[3])) {
						player.x -= player.net_force.x * 2
						player.y -= player.net_force.y * 2
						player.hit = true
					}
				})
				if (!player.hit) {
					player.x += player.net_force.x
					player.y += player.net_force.y
				}
			}
			camera.x = player.x
			camera.y = player.y
			if ((-player.x > 815 && -player.x< 1015) && (-player.y > 552 && -player.y < 560) && player.checkpointCollected) {
				player.laps += 1
				player.checkpointCollected = false
			}
			if ((-player.x > 5 && -player.x< 160) && (-player.y > 295 && -player.y < 330)) {
				player.checkpointCollected = true
			}
			player.milliseconds = performance.now() - player.dt
			layers.getLayer("map").ctx.drawImage(resources.get("sprites/maps/mario_circuit_2.png"), 0, 0)
			drawRect(layers.getLayer("perspectiveMap").ctx, 0, 0, 256, 448, true, "#00D000")
			layers.getLayer("perspectiveMap").ctx.save()
			layers.getLayer("perspectiveMap").ctx.translate(WIDTH / 2, HEIGHT / 2)
			layers.getLayer("perspectiveMap").ctx.rotate(-player.angle * (Math.PI/180))
			layers.getLayer("perspectiveMap").ctx.drawImage(layers.getLayer("map").canvas, camera.x, camera.y)
			//drawRect(layers.getLayer("perspectiveMap").ctx, 0, 0, 100, 100, true, "#FF0000")
			layers.getLayer("perspectiveMap").ctx.restore()
			for (let i =0 ; i < 83; i++) {
				ctx.drawImage(layers.getLayer("perspectiveMap").canvas, 0, (448 / 83) * i, 256, 1, -i/2, 24 + i, 256 + i, 1)
			}
			ctx.drawImage(resources.get("sprites/maps/mc2_background_0.png"), raceValues.background_0_x - 768, -8)
			ctx.drawImage(resources.get("sprites/maps/mc2_background_0.png"), raceValues.background_0_x, -8)
			ctx.drawImage(resources.get("sprites/maps/mc2_background_1.png"), raceValues.background_1_x - 1280, -8)
			ctx.drawImage(resources.get("sprites/maps/mc2_background_1.png"), raceValues.background_1_x, -8)
			ctx.drawImage(resources.get("sprites/maps/mc2_scuffed_minimap.png"), 0, 115)
			ctx.drawImage(resources.get("sprites/driver/yoshi/idle.png"), WIDTH / 2 - 16, 24)
			drawRect(ctx, 0, 0, 256, 3, true, "#000000")
			drawRect(ctx, 0, 107, 256, 8, true, "#000000")
			drawRect(ctx, 0, 219, 256, 5, true, "#000000")
			gameFont.drawText(ctx, "debugFont", "Laps " + player.laps, 0, 16)
			gameFont.drawText(ctx, "debugFont", "Time " + Math.round(player.milliseconds) + " ms", 0, 32)
		}
		if (game.debug) {
			gameFont.drawText(ctx, "debugFont", "FPS-" + Math.round(fps.framesPerSecond), 0, 0)
			gameFont.drawText(ctx, "debugFont", "gamestate-" + game.gameState.replace("_", "."), 0, 8)
			gameFont.drawText(ctx, "debugFont", "subgamestate-" + game.subGameState.replace("_", "."), 0, 16)
		}
		fps.pastTime = performance.now()
	}
};
//https://gamedev.stackexchange.com/questions/24957/doing-an-snes-mode-7-affine-transform-effect-in-pygame
/*	
	copy pasted because I didn't feel like coding one and because it works.
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
	// DON"T FORGET BATTLE MODE
	console.log(event)
	if (event.keyCode == controlBinds.debug && !event.repeat) {
		game.debug = !game.debug
	}
	if (event.keyCode == controlBinds.up && !controlBooleans.up) { // UP
		if (game.gameState == "menu_screen") {
			if (game.subGameState == "player_select") {
				raceSetupValues.playerCount = mod(raceSetupValues.playerCount - 1, 2)
			} else if (game.subGameState == "mode_select") {
				raceSetupValues.mode = mod(raceSetupValues.mode - 1, 2)
			} else if (game.subGameState == "speed_select") {
				raceSetupValues.speed = mod(raceSetupValues.speed - 1, 2)
			} else if (game.subGameState == "confirm_select") {
				raceSetupValues.ok = mod(raceSetupValues.ok - 1, 2)
			}
		} else if (game.gameState == "character_select" && !characterMenu.isSelected) {
			characterMenu.character = mod(characterMenu.character - 4, 8) 
		}
		controlBooleans.up = true
	}
	if (event.keyCode == controlBinds.left && !controlBooleans.left) { // LEFT
		if (game.gameState == "menu_screen") {
			if (game.subGameState == "confirm_select") {
				raceSetupValues.ok = mod(raceSetupValues.ok + 1, 2)
			}
		} else if (game.gameState == "character_select" && !characterMenu.isSelected) {
			characterMenu.character = mod(characterMenu.character - 1, 8) 
		}
		controlBooleans.left = true
	}
	if (event.keyCode == controlBinds.down && !controlBooleans.down) { // DOWN
		if (game.gameState == "menu_screen") {
			if (game.subGameState == "player_select") {
				raceSetupValues.playerCount = mod(raceSetupValues.playerCount + 1, 2)
			} else if (game.subGameState == "mode_select") {
				raceSetupValues.mode = mod(raceSetupValues.mode + 1, 2)
			} else if (game.subGameState == "speed_select") {
				raceSetupValues.speed = mod(raceSetupValues.speed + 1, 2)
			}
		} else if (game.gameState == "character_select" && !characterMenu.isSelected) {
			characterMenu.character = mod(characterMenu.character + 4, 8) 
		}
		controlBooleans.down = true
	}
	if (event.keyCode == controlBinds.right && !controlBooleans.right) { // RIGHT
		if (game.gameState == "menu_screen") {
			if (game.subGameState == "confirm_select") {
				raceSetupValues.ok = mod(raceSetupValues.ok + 1, 2)
			}
		} else if (game.gameState == "character_select" && !characterMenu.isSelected) {
			characterMenu.character = mod(characterMenu.character + 1, 8) 
		}
		controlBooleans.right = true
	}
	if (event.keyCode == controlBinds.b && !controlBooleans.b) { // C to B
		if (game.gameState == "menu_screen") {
			if (game.subGameState == "title") {
				game.subGameState = "player_select"
			} else if (game.subGameState == "player_select") {
				game.subGameState = "mode_select"
			} else if (game.subGameState == "mode_select") {
				if (raceSetupValues.mode != 1) {
					game.subGameState = "speed_select"
				} else {
					game.subGameState = "confirm_select"
				}
			} else if (game.subGameState == "speed_select") {
				game.subGameState = "confirm_select"
			} else if (game.subGameState == "confirm_select") {
				if (raceSetupValues.ok == 1) {
					game.subGameState = "title"
					raceSetupValues = {playerCount: 0, mode: 0, speed: 0, ok: 0}
				} else {
					game.subGameState = "fade_select"
				}
			}
		} else if (game.gameState == "character_select") {
			if (!characterMenu.isSelected) {
				characterMenu.isSelected = true
			} else {
				characterMenu.confirmSelect = true
			}
		} else if (game.gameState == "tmap_select") {
			player.dt = performance.now()
			game.gameState = "in_game"
		}
		controlBooleans.b = true
	}
	if (event.keyCode == controlBinds.a && !controlBooleans.a) { // V to A
		controlBooleans.a = true
	}
	if (event.keyCode == controlBinds.y && !controlBooleans.y) { // X to Y
		controlBooleans.y = true
	}
	if (event.keyCode == controlBinds.x && !controlBooleans.x) { // D to X
		controlBooleans.x = true
	}
	if (event.keyCode == controlBinds.start && !controlBooleans.start) { // Space to Start
		if (game.gameState == "menu_screen") {
			if (game.gameState == "menu_screen") {
				if (game.subGameState == "title") {
					game.subGameState = "player_select"
				} else if (game.subGameState == "player_select") {
					game.subGameState = "mode_select"
				} else if (game.subGameState == "mode_select") {
					if (raceSetupValues.mode != 1) {
						game.subGameState = "speed_select"
					} else {
						game.subGameState = "confirm_select"
					}
				} else if (game.subGameState == "speed_select") {
					game.subGameState = "confirm_select"
				} else if (game.subGameState == "confirm_select") {
					if (raceSetupValues.ok == 1) {
						game.subGameState = "title"
						raceSetupValues = {playerCount: 0, mode: 0, speed: 0, ok: 0}
					} else {
						game.subGameState = "fade_to_select"
					}
				}
			}
		} else if (game.gameState == "character_select") {
			if (!characterMenu.isSelected) {
				characterMenu.isSelected = true
			} else {
				characterMenu.confirmSelect = true
			}
		} else if (game.gameState == "time_map_select") {
			player.dt = performance.now()
			game.gameState = "in_game"
		}
		controlBooleans.start = true
	}
	if (event.keyCode == controlBinds.select && !controlBooleans.select) { // Enter to Select
		controlBooleans.select = true
	}
	if (event.keyCode == controlBinds.l && !controlBooleans.l) { // A to L
		controlBooleans.l = true
	}
	if (event.keyCode == controlBinds.r && !controlBooleans.r) { // S to R
		controlBooleans.r = true
	}
};

/*
	onKeyUp is a function takes a keyboard "keyup" event
	and processes it
*/
function onKeyUp(event) {
	console.log(event)
	if (event.keyCode == controlBinds.debug && event.repeat) {
	}
	if (event.keyCode == controlBinds.up && controlBooleans.up) { // UP
		controlBooleans.up = false
	}
	if (event.keyCode == controlBinds.left && controlBooleans.left) { // LEFT
		controlBooleans.left = false
	}
	if (event.keyCode == controlBinds.down && controlBooleans.down) { // DOWN
		controlBooleans.down = false
	}
	if (event.keyCode == controlBinds.right && controlBooleans.right) { // RIGHT
		controlBooleans.right = false
	}
	if (event.keyCode == controlBinds.b && controlBooleans.b) { // C to B
		controlBooleans.b = false
	}
	if (event.keyCode == controlBinds.a && controlBooleans.a) { // V to A
		controlBooleans.a = false
	}
	if (event.keyCode == controlBinds.y && controlBooleans.y) { // X to Y
		controlBooleans.y = false
	}
	if (event.keyCode == controlBinds.x && controlBooleans.x) { // D to X
		controlBooleans.x = false
	}
	if (event.keyCode == controlBinds.start && controlBooleans.start) { // Space to Start
		controlBooleans.start = false
	}
	if (event.keyCode == controlBinds.select && controlBooleans.select) { // Enter to Select
		controlBooleans.select = false
	}
	if (event.keyCode == controlBinds.l && controlBooleans.l) { // A to L
		controlBooleans.l = false
	}
	if (event.keyCode == controlBinds.r && controlBooleans.r) { // S to R
		controlBooleans.r = false
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