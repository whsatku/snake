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
		this._updateRotation(this, GameLogic.MovingWorldObject.DIR_S[obj.direction]);
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

			var dir = this.getTailDirection(obj.positions, i+1);
			this._updateRotation(this._tails[i], dir);

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
	 * @return {String} LeftDir+RightDir (eg. L junction to right will be RD)
	 */
	getTailDirection: function(positions, i){
		var lastTail = positions[i-1];
		var thisTail = positions[i];
		var nextTail = positions[i+1];

		var out = lastTail[2];
		var junction = nextTail === undefined || thisTail[2] == out ? null : thisTail[2];

		out = GameLogic.MovingWorldObject.DIR_S[out] || "";
		junction = GameLogic.MovingWorldObject.DIR_S[junction] || "";

		return out + junction;
	},

	_updateRotation: function(obj, direction){
		var map = {
			"U": [90, false],
			"D": [-90, false],
			"R": [0, true],
			"RU": [0, true],
			"RD": [-90, true],
			"UR": [90, false],
			"UL": [180, false],
			"DL": [0, true],
			"LD": [90, false],
		};
		if(map[direction] === undefined){
			obj.setRotation(0);
			obj.setFlippedX(false);
			return;
		}
		obj.setRotation(map[direction][0]);
		obj.setFlippedX(map[direction][1]);
	},
});