/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.SnakeNode = WorldObjectNode.extend({
	_tails: [],

	init: function(){
		this._super("res/snake.png", cc.rect(0, 0, 16, 16));
	},

	syncFromEngine: function(obj){
		var self = this;

		this._super(obj);

		if(!(obj instanceof GameLogic.Snake)){
			throw new Error("SnakeNode is given an unsupported object");
		}

		this._cutTails(obj);
		this._createTails(obj);
		this._updateTails(obj);
		this._updateRotation(obj);
	},

	_cutTails: function(obj){
		var root = this.getRoot();
		var pos = Math.max(0, obj.positions.length - 1);
		var remove = this._tails.slice(pos);
		for(var i = 0; i < remove.length; i++){
			root.removeChild(remove[i]);
		}
		this._tails = this._tails.slice(0, pos);
	},

	_createTails: function(obj){
		// we need to add to scene otherwise the tail will be relatively positioned

		var root = this.getRoot();
		for(var i = this._tails.length; i < obj.positions.length - 1; i++){
			var child = new SnakeBitsNode();
			root.addChild(child);
			child.init();
			this._tails.push(child);
		}
	},

	_updateTails: function(obj){
		var root = this.getRoot();

		for(var i = 0; i < this._tails.length; i++){
			var position = obj.positions[i + 1];

			this._tails[i].index = i;
			this._tails[i].setPosition(root.toUIPosition(position[0], position[1]));
			this._tails[i].setFlippedX(false);
			this._tails[i].setRotation(0);

			var dir = this.getTailDirection(obj.positions, i+1);
			var map = {
				"U": [-90, false],
				"D": [90, false],
				"R": [0, true],
				"LU": [90, false],
				"RU": [-90, true],
				"RD": [0, true],
				"DL": [90, false],
				"DR": [180, false],
				"UR": [0, true]
			};
			if(map[dir] !== undefined){
				this._tails[i].setRotation(map[dir][0]);
				this._tails[i].setFlippedX(map[dir][1]);
			}

			if(i == this._tails.length - 1){
				this._tails[i].setTextureRect(cc.rect(32, 0, 16, 16));
			}else if(dir.length == 2){
				this._tails[i].setTextureRect(cc.rect(48, 0, 16, 16));
			}else{
				this._tails[i].setTextureRect(cc.rect(16, 0, 16, 16));
			}
		}
	},

	/**
	 * @param {Array} Array of tail positions from latest to oldest
	 * @param {Number} Index of array to inspect
	 * @return {String} LeftDir+RightDir (eg. L junction to right will be UR)
	 */
	getTailDirection: function(positions, i){
		var lastTail = positions[i-1];
		var thisTail = positions[i];
		var nextTail = positions[i+1];

		var out = null;
		var junction = null;
		if(lastTail[0] - thisTail[0] > 0){
			out = GameLogic.MovingWorldObject.DIR.RIGHT;
		}else if(lastTail[0] - thisTail[0] < 0){
			out = GameLogic.MovingWorldObject.DIR.LEFT;
		}else if(lastTail[1] - thisTail[1] > 0){
			out = GameLogic.MovingWorldObject.DIR.UP;
		}else if(lastTail[1] - thisTail[1] < 0){
			out = GameLogic.MovingWorldObject.DIR.DOWN;
		}

		if(nextTail !== undefined){
			switch(out){
				case GameLogic.MovingWorldObject.DIR.RIGHT:
				case GameLogic.MovingWorldObject.DIR.LEFT:
					if(nextTail[1] - thisTail[1] > 0){
						junction = GameLogic.MovingWorldObject.DIR.DOWN;
					}else if(nextTail[1] - thisTail[1] < 0){
						junction = GameLogic.MovingWorldObject.DIR.UP;
					}
					break;
				case GameLogic.MovingWorldObject.DIR.UP:
				case GameLogic.MovingWorldObject.DIR.DOWN:
					if(nextTail[0] - thisTail[0] > 0){
						junction = GameLogic.MovingWorldObject.DIR.RIGHT;
					}else if(nextTail[0] - thisTail[0] < 0){
						junction = GameLogic.MovingWorldObject.DIR.LEFT;
					}
			}
		}

		out = GameLogic.MovingWorldObject.DIR_S[out] || "";
		junction = GameLogic.MovingWorldObject.DIR_S[junction] || "";

		return out + junction;
	},

	_updateRotation: function(obj){
		var map = {};
		map[GameLogic.MovingWorldObject.DIR.UP] = [90, false];
		map[GameLogic.MovingWorldObject.DIR.DOWN] = [-90, false];
		map[GameLogic.MovingWorldObject.DIR.RIGHT] = [0, true];
		map[GameLogic.MovingWorldObject.DIR.LEFT] = [0, false];
		this.setRotation(map[obj.direction][0]);
		this.setFlippedX(map[obj.direction][1]);
	},
});