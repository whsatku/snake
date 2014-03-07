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

	var game = new GameLogic.Game();

	it("should be a constructor", function(){
		expect(new MovingWorldObject(game)).to.be.an.instanceOf(MovingWorldObject);
	});

	it("should be a WorldObject", function(){
		expect(new MovingWorldObject(game)).to.be.an.instanceOf(GameLogic.WorldObject);
	});

	it("should have direction definition", function(){
		expect(MovingWorldObject.DIR).to.have.keys(["UP", "DOWN", "LEFT", "RIGHT"]);
	});

	it("should have direction", function(){
		expect((new MovingWorldObject(game)).direction).to.exist;
	});

	describe("#update", function(){
		var obj;

		beforeEach(function(){
			obj = new MovingWorldObject(game);
			obj.x = 5;
			obj.y = 5;
			obj.speed = 5;
		});

		it("should be a method", function(){
			expect(MovingWorldObject).to.respondTo("update");
		});

		it("should move to the left when direction is left", function(){
			obj.direction = MovingWorldObject.DIR.LEFT;
			obj.update();
			expect(obj.x).to.eql(0);
			expect(obj.y).to.eql(5);
		});

		it("should move to the right when direction is right", function(){
			obj.direction = MovingWorldObject.DIR.RIGHT;
			obj.update();
			expect(obj.x).to.eql(10);
			expect(obj.y).to.eql(5);
		});

		it("should move up when direction is up", function(){
			obj.direction = MovingWorldObject.DIR.UP;
			obj.update();
			expect(obj.y).to.eql(0);
			expect(obj.x).to.eql(5);
		});

		it("should move down when direction is down", function(){
			obj.direction = MovingWorldObject.DIR.DOWN;
			obj.update();
			expect(obj.y).to.eql(10);
			expect(obj.x).to.eql(5);
		});
	});

});