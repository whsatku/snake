/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.SnakeNode = WorldObjectNode.extend({
	_tails: [],

	syncFromEngine: function(obj){
		var self = this;

		this._super(obj);

		if(!(obj instanceof GameLogic.Snake)){
			throw new Error("SnakeNode is given an unsupported object");
		}

		this._cutTails(obj);
		this._createTails(obj);
		this._updateTails(obj);
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
		}
	}
});