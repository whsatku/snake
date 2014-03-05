/* global cc */
/* jshint unused:false */
"use strict";

window.KeyboardControlLayer = cc.Layer.extend({
	canCollideWithPlayer: true,
	onHitGameOver: false,

	ctor: function(main){
		this._super();
		this.main = main;
	},

	init: function() {
		this.setKeyboardEnabled(true);
		this.setMouseEnabled(true);
	},

	onKeyDown: function(e){
		if(e == cc.KEY.space){
			this.main.onAction();
		}
	},

	bb: cc.p(0,0),
	cursorWidth: 16,
	cursorHeight: 18,

	onMouseMoved: function(e){
		this.bb = e._point;
	},

	getBoundingBox: function(){
		return new cc.Rect(this.bb.x, this.bb.y - this.cursorHeight, this.cursorWidth, this.cursorHeight);
	}
});