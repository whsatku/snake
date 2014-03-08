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

var Snake = GameLogic.Snake;

describe("Snake", function(){

	before(function(){
		this.game = new GameLogic.Game();
		this.snake = this.game.addSnake();
	});

	it("should be a MovingWorldObject", function(){
		expect(this.snake).to.be.an.instanceOf(GameLogic.MovingWorldObject);
	});

	it("should have maxLength", function(){
		expect(this.snake.maxLength).to.be.a("Number");
	});

	it("should have positions list", function(){
		expect(this.snake.positions).to.be.an("Array");
	});

	it("should respond to update", function(){
		expect(Snake).to.respondTo("update");
	});

	describe("#update", function(){
		it("should store past positions in speed = 1", function(){
			var snake = this.game.addSnake();
			snake.x = 0;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.RIGHT;

			snake.update();
			expect(snake.positions).to.eql([
				[1, 0],
				[0, 0]
			]);

			snake.update();
			expect(snake.positions).to.eql([
				[2, 0],
				[1, 0],
				[0, 0]
			]);
		});

		it("should trim the snake to the maximum length", function(){
			var snake = this.game.addSnake();
			snake.x = 0;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.RIGHT;
			snake.maxLength = 2;

			for(var i = 0; i < 3; i++){
				snake.update();
			}

			expect(snake.positions).to.eql([
				[3, 0],
				[2, 0]
			]);
		});
	});

	describe("#_wrapAround", function(){
		before(function(){
			this.game.state.width = 5;
			this.game.state.height = 2;
		});

		it("should wrap left", function(){
			var snake = this.game.addSnake();
			snake.x = 0;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.LEFT;
			snake.update();

			expect(snake.x).to.eql(4);
			expect(snake.y).to.eql(0);
			expect(snake.positions).to.eql([
				[4, 0],
				[0, 0]
			]);
		});

		it("should wrap right", function(){
			var snake = this.game.addSnake();
			snake.x = 4;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.RIGHT;
			snake.update();

			expect(snake.x).to.eql(0);
			expect(snake.y).to.eql(0);
			expect(snake.positions).to.eql([
				[0, 0],
				[4, 0]
			]);
		});

		it("should wrap top", function(){
			var snake = this.game.addSnake();
			snake.x = 0;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.UP;
			snake.update();

			expect(snake.x).to.eql(0);
			expect(snake.y).to.eql(1);
			expect(snake.positions).to.eql([
				[0, 1],
				[0, 0]
			]);
		});

		it("should wrap bottom", function(){
			var snake = this.game.addSnake();
			snake.x = 0;
			snake.y = 1;
			snake.direction = GameLogic.MovingWorldObject.DIR.DOWN;
			snake.update();

			expect(snake.x).to.eql(0);
			expect(snake.y).to.eql(0);
			expect(snake.positions).to.eql([
				[0, 0],
				[0, 1]
			]);
		});

	});

	describe("#input", function(){

		before(function(){
			this.snake.direction = null;
		});

		it("should be a function", function(){
			expect(Snake).to.respondTo("input");
		});

		it("should accept left as input", function(){
			this.snake.input("left");
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.LEFT);
		});

		it("should accept up as input", function(){
			this.snake.input("down");
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.DOWN);
		});

		it("should accept right as input", function(){
			this.snake.input("right");
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.RIGHT);
		});

		it("should accept down as input", function(){
			this.snake.input("down");
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.DOWN);
		});

		it("should not allow moving in opposite direction", function(){
			this.snake.input("up");
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.DOWN);
		});

		it("should not error when invalid input is given", function(){
			this.snake.input("nonexistingkey");
		});

	});

});