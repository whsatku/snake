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

var WorldObject = GameLogic.WorldObject;

describe("WorldObject", function(){

	var game = new GameLogic.Game();

	it("should be a constructor", function(){
		expect(new WorldObject(game)).to.be.an.instanceOf(WorldObject);
	});

	it("should have x, y position", function(){
		expect((new WorldObject(game)).x).to.be.a("Number");
		expect((new WorldObject(game)).y).to.be.a("Number");
	});

	it("should have link to the world state", function(){
		expect((new WorldObject(game)).world).to.be.an.instanceOf(GameLogic.Game);
	});

	describe("#isOffScreen", function(){
		var object = new WorldObject(game);

		it("should return true on (-1, 0)", function(){
			object.x = -1;
			object.y = 0;
			expect(object.isOffScreen()).to.be.true;
		});

		it("should return true on (0, -1)", function(){
			object.x = 0;
			object.y = -1;
			expect(object.isOffScreen()).to.be.true;
		});

		it("should return false on (0, 0)", function(){
			object.x = 0;
			object.y = 0;
			expect(object.isOffScreen()).to.be.false;
		});

		it("should return true on (screenWidth, 0)", function(){
			object.x = game.state.width;
			object.y = 0;
			expect(object.isOffScreen()).to.be.true;
		});

		it("should return true on (0, screenHeight)", function(){
			object.x = 0;
			object.y = game.state.height;
			expect(object.isOffScreen()).to.be.true;
		});

		it("should return true on (screenWidth, screenHeight)", function(){
			object.x = game.state.width;
			object.y = game.state.height;
			expect(object.isOffScreen()).to.be.true;
		})

		it("should return false on (screenWidth - 1, 0)", function(){
			object.x = game.state.width - 1;
			object.y = 0;
			expect(object.isOffScreen()).to.be.false;
		});

		it("should return false on (0, screenHeight - 1)", function(){
			object.x = 0;
			object.y = game.state.height - 1;
			expect(object.isOffScreen()).to.be.false;
		});
	});

});