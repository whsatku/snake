/* global cc */
/* jshint unused:false */
"use strict";

window.KeyboardControlLayer = cc.Layer.extend({
	ctor: function(root){
		this._super();
		this._root = root;
	},

	init: function() {
		this.setKeyboardEnabled(true);
	},

	onKeyDown: function(e){
		var key;

		if(e === cc.KEY.v){
			var webrtc = this._root.webrtc;
			if(webrtc){
				webrtc.muteMic(false);
			}
			return;
		}

		var map = {};
		map[cc.KEY.up] = "up";
		map[cc.KEY.down] = "down";
		map[cc.KEY.left] = "left";
		map[cc.KEY.right] = "right";

		if(map[e]){
			this._root.input(map[e]);
		}
	},

	onKeyUp: function(e){
		if(e === cc.KEY.v){
			var webrtc = this._root.webrtc;
			if(webrtc){
				webrtc.muteMic(true);
			}
			return;
		}
	}
});