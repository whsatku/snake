"use strict";

var PerkPowerup = function BitePowerup(){
	PerkPowerup.super_.apply(this, arguments);
};

require("util").inherits(PerkPowerup, require("./powerup"));

PerkPowerup.cls = "PerkPowerup";

PerkPowerup.prototype.perkTime = 0;
PerkPowerup.prototype.perk = "";
PerkPowerup.prototype.growth = 0;

PerkPowerup.prototype.getState = function(){
	var state = PerkPowerup.super_.prototype.getState.apply(this);
	state.perkTime = this.perkTime;
	state.perk = this.perk;
	return state;
};

PerkPowerup.prototype.loadState = function(state){
	PerkPowerup.super_.prototype.loadState.call(this, state);
	this.perkTime = state.perkTime;
	this.perk = state.perk;
};

PerkPowerup.prototype.onCollide = function(who){
	PerkPowerup.super_.prototype.onCollide.call(this, who);
	this.world.emit("perkCollect", this.perk, who);
};

module.exports = PerkPowerup;
