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

var PerkPowerup = GameLogic.PerkPowerup;

describe("PerkPowerup", function(){

	beforeEach(function(){
		this.game = new GameLogic.Game();
		this.perk = new PerkPowerup(this.game);
		this.game.objects.push(this.perk);
	});

	it("should be a Powerup", function(){
		expect(this.perk).to.be.an.instanceof(GameLogic.Powerup);
	});

	it("should disappear when collected", function(){
		this.perk.emit("collision", new Object());
		expect(this.game.objects).to.have.length(0);
	});

	it("should have perkTime attribute", function(){
		expect(this.perk.perkTime).to.be.a("Number");
	});

	it("should have perk attribute", function(){
		expect(this.perk.perk).to.be.a("string");
	});

	it("should not provide growth", function(){
		expect(this.perk.growth).to.eql(0);
	});

});