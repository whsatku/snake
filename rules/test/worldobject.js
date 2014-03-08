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

	before(function(){
		this.game = new GameLogic.Game();
	});

	it("should be a constructor", function(){
		expect(new WorldObject(this.game)).to.be.an.instanceOf(WorldObject);
	});

	it("should have x, y position", function(){
		expect((new WorldObject(this.game)).x).to.be.a("Number");
		expect((new WorldObject(this.game)).y).to.be.a("Number");
	});

	it("should have link to the world state", function(){
		expect((new WorldObject(this.game)).world).to.be.an.instanceOf(GameLogic.Game);
	});

	describe("#isOffScreen", function(){

		before(function(){
			this.object = new WorldObject(this.game);
		});

		it("should return true on (-1, 0)", function(){
			this.object.x = -1;
			this.object.y = 0;
			expect(this.object.isOffScreen()).to.be.true;
		});

		it("should return true on (0, -1)", function(){
			this.object.x = 0;
			this.object.y = -1;
			expect(this.object.isOffScreen()).to.be.true;
		});

		it("should return false on (0, 0)", function(){
			this.object.x = 0;
			this.object.y = 0;
			expect(this.object.isOffScreen()).to.be.false;
		});

		it("should return true on (screenWidth, 0)", function(){
			this.object.x = this.game.state.width;
			this.object.y = 0;
			expect(this.object.isOffScreen()).to.be.true;
		});

		it("should return true on (0, screenHeight)", function(){
			this.object.x = 0;
			this.object.y = this.game.state.height;
			expect(this.object.isOffScreen()).to.be.true;
		});

		it("should return true on (screenWidth, screenHeight)", function(){
			this.object.x = this.game.state.width;
			this.object.y = this.game.state.height;
			expect(this.object.isOffScreen()).to.be.true;
		})

		it("should return false on (screenWidth - 1, 0)", function(){
			this.object.x = this.game.state.width - 1;
			this.object.y = 0;
			expect(this.object.isOffScreen()).to.be.false;
		});

		it("should return false on (0, screenHeight - 1)", function(){
			this.object.x = 0;
			this.object.y = this.game.state.height - 1;
			expect(this.object.isOffScreen()).to.be.false;
		});
	});

});