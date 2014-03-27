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

var Obstacle = GameLogic.Obstacle;

describe("Obstacle", function(){

	before(function(){
		this.game = new GameLogic.Game();
	});

	it("should be a WorldObject", function(){
		expect(new Obstacle(this.game)).to.be.an.instanceOf(GameLogic.WorldObject);
	});

	describe("#getState", function(){
		it("return empty object", function(){
			var obj = new Obstacle(this.game);
			expect(obj.getState()).to.eql({});
		});
	});

});