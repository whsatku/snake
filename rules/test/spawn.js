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

var Spawn = GameLogic.Spawn;

describe("Spawn", function(){

	before(function(){
		this.game = new GameLogic.Game();
	});

	it("should be a WorldObject", function(){
		expect(new Spawn(this.game)).to.be.an.instanceOf(GameLogic.WorldObject);
	});

	it("should be deadly", function(){
		expect(new Spawn(this.game).deadly).to.be.true;
	});

	describe("#fromSnake", function(){
		beforeEach(function(){
			this.snake = this.game.addSnake();
			this.spawn = new Spawn(this.game);
			this.spawn.fromSnake(this.snake);
		});
		it("set owner to snake", function(){
			expect(this.spawn.owner).to.eql(this.snake.index);
		});
		it("set x,y to snake's", function(){
			expect(this.spawn.x).to.eql(this.snake.x);
			expect(this.spawn.y).to.eql(this.snake.y);
		});
	});

	describe("#getState", function(){
		it("return owner", function(){
			var obj = new Spawn(this.game);
			obj.owner = 1;
			expect(obj.getState().owner).to.eql(1);
		});
	});

	describe("#loadState", function(){
		it("load owner", function(){
			var obj = new Spawn(this.game);
			obj.loadState({owner: 5})
			expect(obj.owner).to.eql(5);
		});
	});

});