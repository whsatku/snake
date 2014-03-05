/* global cc */
/* jshint unused:false */
"use strict";

window.createSprite = function(file){
	var sprite = cc.TextureCache.getInstance().textureForKey(file);
	if(!sprite){
		sprite = cc.TextureCache.getInstance().addImage(file);
	}

	return cc.Sprite.extend({
		ctor: function() {
			this._super();
			this.initWithTexture(sprite);
		}
	});
}