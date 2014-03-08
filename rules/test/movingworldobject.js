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

var MovingWorldObject = GameLogic.MovingWorldObject;

describe("MovingWorldObject", function(){

	before(function(){
		this.game = new GameLogic.Game();
	});

	it("should be a constructor", function(){
		expect(new MovingWorldObject(this.game)).to.be.an.instanceOf(MovingWorldObject);
	});

	it("should be a WorldObject", function(){
		expect(new MovingWorldObject(this.game)).to.be.an.instanceOf(GameLogic.WorldObject);
	});

	it("should have direction definition", function(){
		expect(MovingWorldObject.DIR).to.have.keys(["UP", "DOWN", "LEFT", "RIGHT"]);
	});

	it("should have direction", function(){
		expect((new MovingWorldObject(this.game)).direction).to.exist;
	});

	describe("#update", function(){

		beforeEach(function(){
			this.obj = new MovingWorldObject(this.game);
			this.obj.x = 5;
			this.obj.y = 5;
			this.obj.speed = 5;
		});

		it("should be a method", function(){
			expect(MovingWorldObject).to.respondTo("update");
		});

		it("should move to the left when direction is left", function(){
			this.obj.direction = MovingWorldObject.DIR.LEFT;
			this.obj.update();
			expect(this.obj.x).to.eql(0);
			expect(this.obj.y).to.eql(5);
		});

		it("should move to the right when direction is right", function(){
			this.obj.direction = MovingWorldObject.DIR.RIGHT;
			this.obj.update();
			expect(this.obj.x).to.eql(10);
			expect(this.obj.y).to.eql(5);
		});

		it("should move up when direction is up", function(){
			this.obj.direction = MovingWorldObject.DIR.UP;
			this.obj.update();
			expect(this.obj.y).to.eql(0);
			expect(this.obj.x).to.eql(5);
		});

		it("should move down when direction is down", function(){
			this.obj.direction = MovingWorldObject.DIR.DOWN;
			this.obj.update();
			expect(this.obj.y).to.eql(10);
			expect(this.obj.x).to.eql(5);
		});
	});

	describe("#isOpposite", function(){

		before(function(){
			this.obj = new MovingWorldObject(this.game);
		});

		it("should have static version", function(){
			expect(MovingWorldObject).itself.to.respondTo("isOpposite");
		});

		it("left is opposite to only right", function(){
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.LEFT,
				MovingWorldObject.DIR.RIGHT
			)).to.be.true;
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.LEFT,
				MovingWorldObject.DIR.UP
			)).to.be.false;
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.LEFT,
				MovingWorldObject.DIR.DOWN
			)).to.be.false;
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.LEFT,
				MovingWorldObject.DIR.LEFT
			)).to.be.false;
		});

		it("right is opposite to only left", function(){
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.RIGHT,
				MovingWorldObject.DIR.LEFT
			)).to.be.true;
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.RIGHT,
				MovingWorldObject.DIR.UP
			)).to.be.false;
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.RIGHT,
				MovingWorldObject.DIR.DOWN
			)).to.be.false;
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.RIGHT,
				MovingWorldObject.DIR.RIGHT
			)).to.be.false;
		});

		it("up is opposite to only down", function(){
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.UP,
				MovingWorldObject.DIR.DOWN
			)).to.be.true;
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.UP,
				MovingWorldObject.DIR.LEFT
			)).to.be.false;
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.UP,
				MovingWorldObject.DIR.RIGHT
			)).to.be.false;
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.UP,
				MovingWorldObject.DIR.UP
			)).to.be.false;
		});

		it("down is opposite to only up", function(){
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.DOWN,
				MovingWorldObject.DIR.UP
			)).to.be.true;
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.DOWN,
				MovingWorldObject.DIR.LEFT
			)).to.be.false;
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.DOWN,
				MovingWorldObject.DIR.RIGHT
			)).to.be.false;
			expect(MovingWorldObject.isOpposite(
				MovingWorldObject.DIR.DOWN,
				MovingWorldObject.DIR.DOWN
			)).to.be.false;
		});

		it("instance version should accept 1 arguments which default to current direction", function(){
			this.obj.direction = MovingWorldObject.DIR.RIGHT;
			expect(this.obj.isOpposite(MovingWorldObject.DIR.LEFT)).to.be.true;
			expect(this.obj.isOpposite(MovingWorldObject.DIR.UP)).to.be.false;
		});

		it("instance version should accept 2 arguments", function(){
			expect(this.obj.isOpposite(MovingWorldObject.DIR.DOWN, MovingWorldObject.DIR.UP)).to.be.true;
			expect(this.obj.isOpposite(MovingWorldObject.DIR.DOWN, MovingWorldObject.DIR.LEFT)).to.be.false;
		});

	});

});