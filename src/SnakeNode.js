/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.SnakeNode = WorldObjectNode.extend({
	_tails: [],
	name: "",

	init: function(){
		this.index = this.object.index % 6 + 1;
		this._super("res/snake-"+this.index+".png", cc.rect(0, 0, 16, 16));
		this.createPlayerName();
		this.createTailLayer();
	},

	createTailLayer: function(){
		var root = this.getRoot();
		this.removeFromParent(false);
		this.tailLayer = cc.SpriteBatchNode.createWithTexture(this.getTexture());
		this.tailLayer.addChild(this);
		root.addChild(this.tailLayer);
	},

	syncFromEngine: function(obj){
		var self = this;

		this._super(obj);

		if(!(obj instanceof GameLogic.Snake)){
			throw new Error("SnakeNode is given an unsupported object");
		}

		this.name = obj.index + 1;
		this.updatePlayerName();

		this.tailLayer.setVisible(!obj.hidden);

		this._cutTails(obj);
		this._createTails(obj);
		this._updateTails(obj);
		this._updateRotation(this, GameLogic.MovingWorldObject.DIR_S[obj.direction]);
	},

	_cutTails: function(obj){
		var pos = Math.max(0, obj.positions.length - 1);
		var remove = this._tails.slice(pos);
		for(var i = 0; i < remove.length; i++){
			this.tailLayer.removeChild(remove[i]);
		}
		this._tails = this._tails.slice(0, pos);
	},

	_createTails: function(obj){
		for(var i = this._tails.length; i < obj.positions.length - 1; i++){
			var child = new SnakeBitsNode();
			child.index = this.index;
			child.init();
			this.tailLayer.addChild(child);
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
		var rotation = map[direction] && map[direction][0] || 0;
		var flip = map[direction] && map[direction][1] || false;
		obj.setRotation(rotation);
		obj.setFlippedX(flip);
	},

	cleanup: function(){
		this._super();

		this.cleanup = function(){
		};

		// this will call this.cleanup again so we have to
		// stop recursion.
		this.tailLayer.removeFromParent();
		if(this.playerName){
			this.playerName.removeFromParent();
		}
	},

	createPlayerName: function(){
		this.playerName = cc.LabelTTF.create(this.name, "Tahoma", 18);
		this.playerName.setAnchorPoint(0.5, 0);
		this.playerName.setFontFillColor(cc.c3b(255, 255, 255));
		this.playerName.enableStroke(cc.c3b(0, 0, 0), 2);
		this.playerName.setOpacity(180);
		this.getRoot().addChild(this.playerName, 5);
	},

	updatePlayerName: function(){
		this.playerName.setString(this.name);

		var pos = this.getBoundingBox();

		this.playerName.setPosition(pos.x + (pos.width/2), pos.y + pos.height+1);
	}
});