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
var Game = GameLogic.Game;

describe("Game", function(){

	it("should be a constructor", function(){
		expect(new Game()).to.be.an.instanceOf(Game);
	});

	it("should be an EventEmitter", function(){
		expect(new Game()).to.be.an.instanceOf(require("events").EventEmitter);
	});

	describe(".objects", function(){
		it("should have object storage", function(){
			expect((new Game()).objects).to.be.an("Array");
		});
	});

	describe(".state", function(){
		it("should have states", function(){
			expect((new Game()).state.state).to.be.a("Number");
		});

		it("should have screen size", function(){
			expect((new Game()).state.width).to.be.a("Number");
			expect((new Game()).state.width).to.be.gt(0);
			expect((new Game()).state.height).to.be.a("Number");
			expect((new Game()).state.height).to.be.gt(0);
		});

		it("should have data about powerup collected", function(){
			expect((new Game()).state.powerUpCollected).to.eql(0);
		});

		it("should have a number of powerup required for end game", function(){
			expect((new Game()).state.powerUpToEnd).to.be.a("Number");
		});
	});

	describe("#addSnake", function(){
		var game = new Game();

		it("should be able to execute", function(){
			expect(Game).to.respondTo("addSnake");
		});
		it("should return a Snake object", function(){
			expect(game.addSnake()).to.be.an.instanceOf(GameLogic.Snake);
		});
		it("should add the returned snake to objects array", function(){
			var returned = game.addSnake();
			expect(game.objects).to.include.members([returned]);
		});
	});

	describe("#step", function(){
		var game = new Game();
		game.addSnake();

		it("should be a function", function(){
			expect(Game).to.respondTo("step");
		});

		it("should make snake move", function(){
			var snakePos = game.objects[0].x;
			game.step();
			expect(game.objects[0].x).to.not.eql(snakePos);
		});

		it("should fire step event", function(next){
			game.once("step", next);
			game.step();
		});
	});

});