module.exports = {
	"Game": require("./game"),
	"WorldObject": require("./worldobject"),
	"MovingWorldObject": require("./movingworldobject"),
	"Obstacle": require("./obstacle"),
	"Snake": require("./snake"),
	"AISnake": require("./aisnake"),
	"Powerup": require("./powerup"),
	"PerkPowerup": require("./perkpowerup"),
	"Spawn": require("./spawn"),
	"map": require("./maps"),
	"event": require("eventemitter2").EventEmitter2,
};