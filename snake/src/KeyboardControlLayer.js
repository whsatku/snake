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

		switch(e){
			case cc.KEY.v:
				if(this._root.netcode){
					var webrtc = this._root.netcode.rtc;
					if(webrtc){
						webrtc.muteMic(false);
					}
				}
				return;
			case cc.KEY.tab:
				return this._root.showScoreboard(true);
		}

		var map = {};
		map[cc.KEY.up] = "up";
		map[cc.KEY.w] = "up";
		map[cc.KEY.down] = "down";
		map[cc.KEY.s] = "down";
		map[cc.KEY.left] = "left";
		map[cc.KEY.a] = "left";
		map[cc.KEY.right] = "right";
		map[cc.KEY.d] = "right";

		if(map[e]){
			this._root.input(map[e]);
		}
	},

	onKeyUp: function(e){
		switch(e){
			case cc.KEY.v:
				if(this._root.netcode){
					var webrtc = this._root.netcode.rtc;
					if(webrtc){
						webrtc.muteMic(true);
					}
				}
				return;
			case cc.KEY.tab:
				return this._root.showScoreboard(false);
		}
	}
});