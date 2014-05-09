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
		this.initGamepad();
		this.scheduleUpdate();
	},

	initGamepad: function(){
		navigator.getGamepads = navigator.getGamepads || navigator.webkitGetGamepads || navigator.mozGetGamepads;
		this.hasGamepad = false;
		this.lastPadKey = "";
	},

	voice: function(value){
		if(this._root.netcode){
			var webrtc = this._root.netcode.rtc;
			if(webrtc){
				webrtc.muteMic(!value);
			}
		}
	},

	onKeyDown: function(e){
		var key;

		switch(e){
			case cc.KEY.v:
				this.voice(true);
				return;
			case cc.KEY.tab:
				return this._root.showScoreboard(true);
		}

		if(window.KeyboardControlLayer.map[e]){
			this._root.input(window.KeyboardControlLayer.map[e]);
		}
	},

	onKeyUp: function(e){
		switch(e){
			case cc.KEY.v:
				this.voice(false);
				return;
			case cc.KEY.tab:
				return this._root.showScoreboard(false);
		}
	},

	update: function(){
		this._super();

		this.pollGamepad();
	},

	pollGamepad: function(){
		var gamepads = navigator.getGamepads();
		var pad;
		if(gamepads.length > 0 && gamepads[0] !== undefined){
			pad = gamepads[0];
			if(!this.hasGamepad){
				this.hasGamepad = true;
				this._root.log("Detected "+pad.id.substr(0, pad.id.indexOf(" (")));
			}
		}else{
			if(this.hasGamepad){
				this.hasGamepad = false;
				this.log("Gamepad disconnected");
			}
			this.lastPadKey = "";
		}

		if(pad){
			for(var key in KeyboardControlLayer.KP_BIND){
				var gameKey = KeyboardControlLayer.KP_BIND[key];
				if(gameKey === "scoreboard"){
					var value = !!pad.buttons[key];
					if(value != this.lastGamepadScoreboard){
						this.lastGamepadScoreboard = value;
						this._root.showScoreboard(value);
					}
				}else if(gameKey === "voice"){
					var value = pad.buttons[key];
					if(value != this.lastGamepadVoice){
						this.lastGamepadVoice = value;
						this.voice(value);
					}
				}else if(pad.buttons[key]){
					if(gameKey != this.lastPadKey){
						this._root.input(gameKey);
						this.lastPadKey = gameKey;
					}
				}
			}
		}
	},
});

window.KeyboardControlLayer.map = {};
window.KeyboardControlLayer.map[cc.KEY.up] = "up";
window.KeyboardControlLayer.map[cc.KEY.w] = "up";
window.KeyboardControlLayer.map[cc.KEY.down] = "down";
window.KeyboardControlLayer.map[cc.KEY.s] = "down";
window.KeyboardControlLayer.map[cc.KEY.left] = "left";
window.KeyboardControlLayer.map[cc.KEY.a] = "left";
window.KeyboardControlLayer.map[cc.KEY.right] = "right";
window.KeyboardControlLayer.map[cc.KEY.d] = "right";

window.KeyboardControlLayer.KP_BIND = {
	12: "up",
	14: "left",
	15: "right",
	13: "down",
	0: "voice",
	1: "scoreboard"
}