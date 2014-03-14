/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.SnakeNode = WorldObjectNode.extend({
	_tails: [],

	init: function(){
		this._super("res/snakehead.png");
		this.createColor();
	},

	createColor: function(){
		this.colorSprite = cc.Sprite.create("res/snakehead_c.png");
		this.colorSprite.setAnchorPoint(0, 0);
		this.addChild(this.colorSprite);
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
		var scene = this.getScene();
		var pos = Math.max(0, obj.positions.length - 1);
		var remove = this._tails.slice(pos);
		for(var i = 0; i < remove.length; i++){
			scene.removeChild(remove[i]);
		}
		this._tails = this._tails.slice(0, pos);
	},

	_createTails: function(obj){
		// we need to add to scene otherwise the tail will be relatively positioned

		var scene = this.getScene();
		for(var i = this._tails.length; i < obj.positions.length - 1; i++){
			var child = new SnakeBitsNode();
			scene.addChild(child);
			child.init();
			this._tails.push(child);
		}
	},

	_updateTails: function(obj){
		var scene = this.getScene();

		for(var i = 0; i < this._tails.length; i++){
			var position = obj.positions[i + 1];

			this._tails[i].index = i;
			this._tails[i].setPosition(scene.toUIPosition(position[0], position[1]));

			var dir = this.getTailDirection(obj.positions, i+1);
			switch(dir){
				case GameLogic.MovingWorldObject.DIR.UP:
				case GameLogic.MovingWorldObject.DIR.DOWN:
					this._tails[i].setRotation(90);
					break;
				case GameLogic.MovingWorldObject.DIR.LEFT:
				case GameLogic.MovingWorldObject.DIR.RIGHT:
				default:
					this._tails[i].setRotation(0);
			}
		}
	},

	getTailDirection: function(positions, i){
		var lastTail = positions[i-1];
		var thisTail = positions[i];
		var nextTail = positions[i+1];

		var out = null;
		if(lastTail[0] - thisTail[0] > 0){
			out = GameLogic.MovingWorldObject.DIR.RIGHT;
		}else if(lastTail[0] - thisTail[0] < 0){
			out = GameLogic.MovingWorldObject.DIR.LEFT;
		}else if(lastTail[1] - thisTail[1] > 0){
			out = GameLogic.MovingWorldObject.DIR.UP;
		}else if(lastTail[1] - thisTail[1] < 0){
			out = GameLogic.MovingWorldObject.DIR.DOWN;
		}

		// TODO: Junction
		return out;
	},

	_updateRotation: function(obj){
		switch(obj.direction){
			case GameLogic.MovingWorldObject.DIR.UP:
				this.setFlippedX(false);
				this.setRotation(90);
				break;
			case GameLogic.MovingWorldObject.DIR.DOWN:
				this.setFlippedX(false);
				this.setRotation(-90);
				break;
			case GameLogic.MovingWorldObject.DIR.RIGHT:
				this.setFlippedX(true);
				this.setRotation(0);
				break;
			case GameLogic.MovingWorldObject.DIR.LEFT:
			default:
				this.setFlippedX(false);
				this.setRotation(0);
		}
	},

	setFlippedX: function(flip){
		this._super(flip);
		this.colorSprite.setFlippedX(flip);
	},
});