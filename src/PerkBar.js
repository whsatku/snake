/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.PerkBar = cc.Node.extend({
	progressColor: cc.c4b(255, 255, 255, 100),

	iconMap: {
		"bite": ["res/buff.png", cc.rect(0, 0, 52, 52)],
		"respawn": ["res/buff.png", cc.rect(52, 0, 52, 52)],
		"inverse": ["res/buff.png", cc.rect(104, 0, 52, 52)]
	},

	spriteWidth: 52,
	spritePad: 5,

	ctor: function(game){
		this.game = game;
		this.perks = {};
		this.perkMap = {};
		this._super();
	},

	init: function(){
		// this._super("res/buff.png");
		this.setContentSize(this.spriteWidth, this.spriteWidth);
	},

	syncFromEngine: function(obj){
		if(!obj){
			this.perks = [];
		}else{
			this.perks = [];
			for(var perk in obj.perks){
				this.perks.push([perk, obj.perks[perk]]);
			}
		}
		this.updateBar();
	},

	updateBar: function(){
		for(var i = 0; i < this.perks.length; i++){
			var perk = this.perks[i], sprite;
			if(!this.perkMap[perk[0]]){
				sprite = cc.Sprite.create.apply(null, this.iconMap[perk[0]]);
				sprite.setAnchorPoint(0, 0);

				sprite.progress = cc.LayerColor.create(this.progressColor, this.spriteWidth, this.spriteWidth);
				sprite.progress.setAnchorPoint(0, 0);
				sprite.progress.setPosition(0, 0);
				sprite.addChild(sprite.progress);

				sprite.initialValue = 0;
				sprite.value = 0;

				this.perkMap[perk[0]] = sprite;
				this.addChild(sprite);
			}

			sprite = this.perkMap[perk[0]];

			var left = perk[1] - this.game.state.step;
			var animateDuration = this.game.state.updateRate;

			if(left > sprite.value){
				sprite.value = left;
				sprite.initialValue = left;
				animateDuration = 0;
			}

			sprite.value--;

			sprite.setPosition(cc.p(i * (this.spriteWidth + this.spritePad), 0));

			var action = cc.ScaleTo.create(animateDuration / 1000, 1, sprite.value / sprite.initialValue);
			sprite.progress.runAction(action);
		}
		for(var perk in this.perkMap){
			var found = false;
			for(var i = 0; i < this.perks.length; i++){
				if(this.perks[i][0] == perk){
					found = true;
					break;
				}
			}
			if(found){
				continue;
			}
			var sprite = this.perkMap[perk];
			delete this.perkMap[perk];
			this.removeChild(sprite);
		}
		this.setContentSize((this.spriteWidth + this.spritePad) * this.perks.length, this.spriteWidth);
	},
});