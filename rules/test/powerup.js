/* globals chai, describe, it, beforeEach */
"use strict";

if(!GameLogic){
	var GameLogic = require("../index");
}
if(typeof chai == "undefined"){
	var expect = require("chai").expect;
}else{
	var expect = chai.expect;
}

var Powerup = GameLogic.Powerup;

describe("Powerup", function(){

	before(function(){
		this.game = new GameLogic.Game();
	});

	it("should be a WorldObject", function(){
		expect(new Powerup(this.game)).to.be.an.instanceOf(GameLogic.WorldObject);
	});

	it("should not be deadly", function(){
		expect(new Powerup(this.game).deadly).to.be.false;
	});

	it("should remove itself out of the game when collected", function(){
		var powerup = new Powerup(this.game);
		this.game.objects.push(powerup);
		powerup.emit("collision");
		expect(this.game.objects).to.have.length(0);
	});

});