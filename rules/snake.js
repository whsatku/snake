"use strict";

var Spawn = require("./spawn");

var Snake = function Snake(){
	Snake.super_.apply(this, arguments);

	this.positions = [];
	this.maxLength = Snake.DEFAULT_MAX_LENGTH;
	this._turning = null;
	this.index = -1;
	this.perks = {};
	this.invulnerable = false;
	this.name = "";
	this.color = 1;
	this.kill = 0;
	this.killStreak = 0;
	this.maxKillStreak = 0;
	this.longest = 0;
	this.death = 0;
	this.score = 0;
	this.itemsCollected = 0;
	this.powerupCollected = {};
	this.killDetails = {};
	this.dead = false;

	this.on("collision", this.onCollide.bind(this));
	this.on("perkAdd", this.onAddPerk.bind(this));
	this.on("perkRemove", this.onRemovePerk.bind(this));
	this.on("bitten", this.onBitten.bind(this));
};

Snake.cls = "Snake";
Snake.DEFAULT_MAX_LENGTH = 4;
Snake.RESPAWN_DELAY = 10; // ticks
Snake.PERK_PRESERVE_ON_DEATH = ["inverse"];
Snake.SCORE_PER_POWERUP = 4;
Snake.SCORE_PER_PERK = 2;
Snake.SCORE_PER_DEATH = 3;

var MovingWorldObject = require("./movingworldobject");
var Powerup = require("./powerup");
var PerkPowerup = require("./perkpowerup");

require("util").inherits(Snake, MovingWorldObject);

Snake.prototype.update = function(){
	if(this.dead){
		return;
	}
	this.maxKillStreak = Math.max(this.killStreak, this.maxKillStreak);

	this.expirePerk();

	if(this.hasPerk("respawn")){
		return;
	}

	if(this._turning !== null){
		this.direction = this._turning;
		this._turning = null;
	}

	if(this.positions.length === 0){
		this.positions.unshift([this.x, this.y, this.direction]);
	}

	Snake.super_.prototype.update.apply(this, arguments);

	this._wrapAround();

	this.positions.unshift([this.x, this.y, this.direction]);

	this._trimPositionToLength();

	this.longest = Math.max(this.positions.length, this.longest);
};

Snake.prototype._trimPositionToLength = function(){
	if(this.positions.length > this.maxLength){
		this.positions = this.positions.slice(0, this.maxLength);
	}
};

Snake.prototype._wrapAround = function(){
	if(!this.isOffScreen()){
		return;
	}
	if(this.x < 0){
		this.x = this.world.width - 1;
	}
	if(this.y < 0){
		this.y = this.world.height - 1;
	}
	if(this.x >= this.world.width){
		this.x = 0;
	}
	if(this.y >= this.world.height){
		this.y = 0;
	}
};

Snake.prototype.input = function(input){
	switch(input){
		case "left": case "right": case "down": case "up":
			var map = {
				"left": MovingWorldObject.DIR.LEFT,
				"right": MovingWorldObject.DIR.RIGHT,
				"down": MovingWorldObject.DIR.DOWN,
				"up": MovingWorldObject.DIR.UP
			};

			if(this.hasPerk("inverse")){
				map = {
					"left": MovingWorldObject.DIR.RIGHT,
					"right": MovingWorldObject.DIR.LEFT,
					"down": MovingWorldObject.DIR.UP,
					"up": MovingWorldObject.DIR.DOWN
				};
			}

			if(map[input] === this.direction){
				return false;
			}else if(this.isOpposite(map[input])){
				return false;
			}
			this._turning = map[input];
			return true;
	}
	return false;
};

Snake.prototype.isCollideWith = function(b, crosscheck){
	if(this.dead){
		return false;
	}
	var target, checkObject;
	if(b instanceof Snake){
		target = b.positions;
		if(this === b){
			target = this.positions.slice(1);
		}
		checkObject = this;
	}else{
		target = this.positions;
		checkObject = b;
	}
	for(var position in target){
		if(target[position][0] === checkObject.x && target[position][1] === checkObject.y){
			return true;
		}
	}
	if(crosscheck === false){
		return false;
	}
	return b.isCollideWith(this, false);
};

Snake.prototype.die = function(dontCountDead, killer){
	this.reset();
	this.addPerk("respawn", Snake.RESPAWN_DELAY);

	if(dontCountDead !== true){
		this.death++;
		this.score -= Snake.SCORE_PER_DEATH;
		this.emit("dead", killer);
	}
};

Snake.prototype._makeSpawn = function(){
	if(!this.spawn){
		this.spawn = new Spawn(this.world);
		this.world.objects.push(this.spawn);
	}
	this.spawn.fromSnake(this);
	return this.spawn;
};

Snake.prototype.respawn = function(){
	this.world.removeChild(this.spawn);
	this.spawn = null;

	this.hidden = false;
	this.direction = this._turning !== null ? this._turning : MovingWorldObject.DIR.RIGHT;
};

Snake.prototype.reset = function(){
	this.maxLength = Snake.DEFAULT_MAX_LENGTH;
	this.positions = [];
	this.killStreak = 0;
	this.randomPosition();
	for(var perk in this.perks){
		if(Snake.PERK_PRESERVE_ON_DEATH.indexOf(perk) == -1){
			this.removePerk(perk);
		}
	}
	this.emit("reset");
};

Snake.prototype.cleanup = function(){
	Snake.super_.prototype.cleanup.apply(this);
	if(this.spawn){
		this.world.removeChild(this.spawn);
	}
	this.removed = true;
};

Snake.prototype.onCollide = function(target){
	if(this.hidden){
		return false;
	}
	if(target instanceof PerkPowerup){
		if(this.powerupCollected[target.perk] === undefined){
			this.powerupCollected[target.perk] = 0;
		}
		this.powerupCollected[target.perk]++;

		this.addPerk(target.perk, target.perkTime);
		this.score += Snake.SCORE_PER_PERK;
	}else if(target instanceof Powerup){
		this.maxLength += target.growth;
		this.score += Snake.SCORE_PER_POWERUP;
		this.itemsCollected++;
	}
	if(target instanceof Snake){
		if(target !== this && this.x == target.x && this.y == target.y){
			// head-on-head collision
			if(!this.invulnerable){
				this.nextTick("die", null, target.index);
			}
		}else if(this.isCollideWith(target, false)){
			// head-on-body collision
			if(!this.invulnerable){
				this.nextTick("die", null, target.index);
				if(target !== this){
					target.kill++;
					target.killStreak++;
					target.score += Math.floor(this.positions.length / 4);

					if(target.killDetails[this.name] === undefined){
						target.killDetails[this.name] = {
							color: this.color,
							count: 0
						}
					}
					target.killDetails[this.name].count++;
				}
			}
			if(this.hasPerk("bite")){
				target.emit("bitten", this);
			}
		}
	}else if(target.deadly){
		this.die();
	}
};

Snake.prototype.getState = function(){
	var state = Snake.super_.prototype.getState.apply(this);
	state.positions = this.positions.slice(0);
	state.maxLength = this.maxLength;
	state.index = this.index;
	// FIXME: not a clone
	state.perks = this.perks;
	state.invulnerable = this.invulnerable;
	state.name = this.name;
	state.color = this.color;
	state.kill = this.kill;
	state.death = this.death;
	state.score = this.score;
	state.killStreak = this.killStreak;
	state.dead = this.dead;
	return state;
};

Snake.prototype.loadState = function(state){
	Snake.super_.prototype.loadState.call(this, state);
	this.positions = state.positions;
	this.maxLength = state.maxLength;
	this.index = state.index;
	this.perks = state.perks;
	this.invulnerable = state.invulnerable;
	this.name = state.name;
	this.color = state.color;
	this.kill = state.kill;
	this.death = state.death;
	this.score = state.score;
	this.killStreak = state.killStreak;
	this.dead = state.dead;
};

Snake.prototype.addPerk = function(name, duration){
	this.perks[name] = this.world.state.step + duration;
	this.emit("perkAdd", name);
};

Snake.prototype.removePerk = function(name){
	delete this.perks[name];
	this.emit("perkRemove", name);
};

Snake.prototype.expirePerk = function(){
	for(var perk in this.perks){
		var expire = this.perks[perk];
		if(expire - this.world.state.step <= 0){
			this.removePerk(perk);
		}
	}
};

Snake.prototype.onAddPerk = function(perk){
	var self = this;
	switch(perk){
		case "respawn":
			this.hidden = true;
			this.direction = MovingWorldObject.DIR.STOP;
			this._makeSpawn();
			break;
		case "bite":
			this.invulnerable = true;
			break;
		case "inverse_collect":
			var duration = self.perks.inverse_collect - self.world.state.step;
			this.world._snakes.forEach(function(snake){
				if(snake !== self && snake instanceof Snake){
					snake.addPerk("inverse", duration);
				}
			});
			this.removePerk("inverse_collect");
			break;
		case "reverse_collect":
			this.world._snakes.forEach(function(snake){
				if(snake instanceof Snake){
					snake.reverse();
				}
			});
			this.removePerk("reverse_collect");
			break;
	}
};

Snake.prototype.onRemovePerk = function(perk){
	switch(perk){
		case "respawn":
			this.respawn();
			break;
		case "bite":
			this.invulnerable = false;
			break;
	}
};

Snake.prototype.onBitten = function(snake){
	var chopIndex = false;
	for(var i = 0; i < this.positions.length; i++){
		if(i === 0 && snake === this){
			continue;
		}
		if(this.positions[i][0] === snake.x && this.positions[i][1] === snake.y){
			chopIndex = i;
			break;
		}
	}
	if(chopIndex === false){
		return;
	}else if(chopIndex <= 1){
		snake.kill++;
		snake.killStreak++;
		snake.score += Math.floor(this.positions.length / 4);
		this.die();
		return;
	}

	if(snake !== this){
		snake.score += Math.min(8, Math.floor((this.positions.length - chopIndex) / 3));
	}
	this.positions = this.positions.slice(0, chopIndex);
	this.maxLength = chopIndex;
};

Snake.prototype.hasPerk = function(perk){
	return this.perks[perk] - this.world.state.step > 0;
};

Snake.prototype.reverse = function(){
	this.positions.reverse();
	for(var i = 0; i < this.positions.length; i++){
		if(i+1 <= this.positions.length - 1 && this.positions[i+1][2] != this.positions[i][2]){
			this.positions[i][2] = this.positions[i+1][2];
		}
		this.positions[i][2] = MovingWorldObject.getOpposite(this.positions[i][2]);
	}
	if(this.positions.length > 0){
		this.x = this.positions[0][0];
		this.y = this.positions[0][1];
		this.direction = this.positions[0][2];
	}
};

Snake.prototype.getEndscreenData = function(){
	return {
		name: this.name,
		color: this.color,
		kill: this.kill,
		maxStreak: this.maxKillStreak,
		death: this.death,
		score: this.score,
		items: this.itemsCollected,
		powerup: this.powerupCollected,
		killDetails: this.killDetails,
		longest: this.longest
	};
};

module.exports = Snake;