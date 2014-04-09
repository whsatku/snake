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
		expect(MovingWorldObject.DIR).to.have.keys(["UP", "DOWN", "LEFT", "RIGHT", "STOP"]);
	});

	it("should have direction string map", function(){
		expect(MovingWorldObject.DIR_S[MovingWorldObject.DIR.UP]).to.eql("U");
		expect(MovingWorldObject.DIR_S[MovingWorldObject.DIR.DOWN]).to.eql("D");
		expect(MovingWorldObject.DIR_S[MovingWorldObject.DIR.LEFT]).to.eql("L");
		expect(MovingWorldObject.DIR_S[MovingWorldObject.DIR.RIGHT]).to.eql("R");
		expect(MovingWorldObject.DIR_S[MovingWorldObject.DIR.STOP]).to.eql("S");
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

	describe("#getOpposite", function(){
		it("should return left when given right", function(){
			expect(MovingWorldObject.getOpposite(MovingWorldObject.DIR.RIGHT)).to
				.eql(MovingWorldObject.DIR.LEFT);
		});
		it("should return right when given left", function(){
			expect(MovingWorldObject.getOpposite(MovingWorldObject.DIR.LEFT)).to
				.eql(MovingWorldObject.DIR.RIGHT);
		});
		it("should return up when given down", function(){
			expect(MovingWorldObject.getOpposite(MovingWorldObject.DIR.DOWN)).to
				.eql(MovingWorldObject.DIR.UP);
		});
		it("should return down when given up", function(){
			expect(MovingWorldObject.getOpposite(MovingWorldObject.DIR.UP)).to
				.eql(MovingWorldObject.DIR.DOWN);
		});
		it("should return stop when given unknown value", function(){
			expect(MovingWorldObject.getOpposite(9999)).to.eql(MovingWorldObject.DIR.STOP);
		})
	});

	describe("#getState", function(){
		it("dump position", function(){
			var obj = new MovingWorldObject(this.game);
			expect(obj.getState().x).to.eql(obj.x);
			expect(obj.getState().y).to.eql(obj.y);
		});
		it("dump direction", function(){
			var obj = new MovingWorldObject(this.game);
			expect(obj.getState().direction).to.eql(obj.direction);
		});
		it("dump speed", function(){
			var obj = new MovingWorldObject(this.game);
			expect(obj.getState().speed).to.eql(obj.speed);
		});
	});

	describe("#loadState", function(){
		it("load position", function(){
			var obj = new MovingWorldObject(this.game);
			var state = {x: 5, y: 5, deadly: false, direction: MovingWorldObject.DIR.LEFT, speed: 5};
			obj.loadState(state);

			expect(obj.x).to.eql(state.x);
			expect(obj.y).to.eql(state.y);
		});
		it("load direction", function(){
			var obj = new MovingWorldObject(this.game);
			var state = {x: 5, y: 5, deadly: false, direction: MovingWorldObject.DIR.LEFT, speed: 5};
			obj.loadState(state);

			expect(obj.direction).to.eql(state.direction);
		});
		it("load speed", function(){
			var obj = new MovingWorldObject(this.game);
			var state = {x: 5, y: 5, deadly: false, direction: MovingWorldObject.DIR.LEFT, speed: 5};
			obj.loadState(state);

			expect(obj.speed).to.eql(state.speed);
		});
	});

});