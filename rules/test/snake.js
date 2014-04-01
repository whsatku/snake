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
if(typeof sinon == "undefined"){
	var sinon = require("sinon");
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
		it("should store past positions", function(){
			var snake = this.game.addSnake();
			snake.x = 0;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.RIGHT;

			snake.update();
			expect(snake.positions).to.eql([
				[1, 0, GameLogic.MovingWorldObject.DIR.RIGHT],
				[0, 0]
			]);

			snake.update();
			expect(snake.positions).to.eql([
				[2, 0, GameLogic.MovingWorldObject.DIR.RIGHT],
				[1, 0, GameLogic.MovingWorldObject.DIR.RIGHT],
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
				[3, 0, GameLogic.MovingWorldObject.DIR.RIGHT],
				[2, 0, GameLogic.MovingWorldObject.DIR.RIGHT]
			]);
		});

		it("should respawn snake", function(){
			var snake = this.game.addSnake();
			snake.die();

			var spy = sinon.stub(snake, "respawn");
			for(var i = 0; i < Snake.RESPAWN_DELAY; i++){
				expect(spy.called).to.be.false;
				snake.update();
			}
			expect(spy.called).to.be.true;
		});
	});

	describe("#_wrapAround", function(){
		before(function(){
			this.game.state.width = 20;
			this.game.state.height = 20;
		});

		it("should wrap left", function(){
			var snake = this.game.addSnake();
			snake.x = 0;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.LEFT;
			snake.update();

			expect(snake.x).to.eql(19);
			expect(snake.y).to.eql(0);
			expect(snake.positions).to.eql([
				[19, 0, GameLogic.MovingWorldObject.DIR.LEFT],
				[0, 0]
			]);
		});

		it("should wrap right", function(){
			var snake = this.game.addSnake();
			snake.x = 19;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.RIGHT;
			snake.update();

			expect(snake.x).to.eql(0);
			expect(snake.y).to.eql(0);
			expect(snake.positions).to.eql([
				[0, 0, GameLogic.MovingWorldObject.DIR.RIGHT],
				[19, 0]
			]);
		});

		it("should wrap top", function(){
			var snake = this.game.addSnake();
			snake.x = 0;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.UP;
			snake.update();

			expect(snake.x).to.eql(0);
			expect(snake.y).to.eql(19);
			expect(snake.positions).to.eql([
				[0, 19, GameLogic.MovingWorldObject.DIR.UP],
				[0, 0]
			]);
		});

		it("should wrap bottom", function(){
			var snake = this.game.addSnake();
			snake.x = 0;
			snake.y = 19;
			snake.direction = GameLogic.MovingWorldObject.DIR.DOWN;
			snake.update();

			expect(snake.x).to.eql(0);
			expect(snake.y).to.eql(0);
			expect(snake.positions).to.eql([
				[0, 0, GameLogic.MovingWorldObject.DIR.DOWN],
				[0, 19]
			]);
		});

	});

	describe("#input", function(){

		before(function(){
			this.snake.direction = null;
		});

		it("should accept left as input", function(){
			expect(this.snake.input("left")).to.be.true;
			this.snake.update();
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.LEFT);
		});

		it("should accept up as input", function(){
			expect(this.snake.input("down")).to.be.true;
			this.snake.update();
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.DOWN);
		});

		it("should accept right as input", function(){
			expect(this.snake.input("right")).to.be.true;
			this.snake.update();
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.RIGHT);
		});

		it("should accept down as input", function(){
			expect(this.snake.input("down")).to.be.true;
			this.snake.update();
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.DOWN);
		});

		it("should not allow moving in opposite direction", function(){
			this.snake.input("up");
			this.snake.update();
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.DOWN);
		});

		it("should not allow moving in opposite direction when two keys are pressed in the same tick", function(){
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.DOWN);
			this.snake.input("left");
			this.snake.input("up");
			this.snake.update();
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.LEFT);
		});

		it("should return false on invalid input", function(){
			expect(this.snake.input("nonexistingkey")).to.be.false;
			this.snake.update();
		});

		it("should return false on input in moving direction", function(){
			this.snake.direction = GameLogic.MovingWorldObject.DIR.RIGHT;
			expect(this.snake.input("right")).to.be.false;
		});

	});

	describe("#isCollideWith", function(){
		it("should return true when colliding head to head", function(){
			var a = new Snake(this.game);
			a.positions = [[5, 5]];
			a.x = 5;
			a.y = 5;

			var b = new Snake(this.game);
			b.positions = [[5, 5]];
			b.x = 5;
			b.y = 5;

			expect(a.isCollideWith(b)).to.be.true;
			expect(b.isCollideWith(a)).to.be.true;
		});
		it("should return false when not colliding head to head", function(){
			var a = new Snake(this.game);
			a.positions = [[5, 3]];
			a.x = 5;
			a.y = 3;

			var b = new Snake(this.game);
			b.positions = [[7, 8]];
			b.x = 7;
			b.y = 8;

			expect(a.isCollideWith(b)).to.be.false;
			expect(b.isCollideWith(a)).to.be.false;
		});

		it("should return true when colliding head on body", function(){
			var a = new Snake(this.game);
			a.positions = [[5, 5], [5, 4], [5, 3], [5, 2]];
			a.x = 5;
			a.y = 5;

			var b = new Snake(this.game);
			b.positions = [[5, 3], [4, 3], [3, 3], [2, 3]];
			b.x = 5;
			b.y = 3;

			expect(a.isCollideWith(b)).to.be.true;
			expect(b.isCollideWith(a)).to.be.true;
		});
		it("should return true on colliding head on with other object", function(){
			var snake = new Snake(this.game);
			snake.x = 0;
			snake.y = 0;
			var object = new GameLogic.WorldObject(this.game);
			object.x = 0;
			object.y = 0;
			expect(snake.isCollideWith(object)).to.be.true;
		});
		it("should return false on not colliding head on with other object", function(){
			var snake = new Snake(this.game);
			snake.x = 0;
			snake.y = 0;
			var object = new GameLogic.WorldObject(this.game);
			object.x = 0;
			object.y = 1;
			expect(snake.isCollideWith(object)).to.be.false;
			expect(object.isCollideWith(snake)).to.be.false;
		});
		it("should return true when self colliding", function(){
			var a = new Snake(this.game);
			a.positions = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
			a.x = 0;
			a.y = 0;

			expect(a.isCollideWith(a)).to.be.true;
		});
		it("should return false when moving and not self colliding", function(){
			var a = new Snake(this.game);
			a.x = 0;
			a.y = 0;
			a.direction = GameLogic.MovingWorldObject.DIR.RIGHT;
			a.update();

			expect(a.isCollideWith(a)).to.be.false;
		});
		// this should be in worldobject test suite
		it("should return true for object when colliding tail to object", function(){
			var a = new Snake(this.game);
			a.x = 0;
			a.y = 0;
			a.positions = [[0, 0], [0, 1]];
			var object = new GameLogic.WorldObject(this.game);
			object.x = 0;
			object.y = 1;
			expect(object.isCollideWith(a)).to.be.true;
		});
	});

	describe("#reset", function(){
		it("should reset x, y", function(){
			this.snake.x = -1;
			this.snake.y = -1;
			this.snake.reset();

			expect(this.snake.x).to.not.eql(-1);
			expect(this.snake.y).to.not.eql(-1);
		});

		it("should reset maxLength", function(){
			this.snake.maxLength = 1;
			this.snake.reset();

			expect(this.snake.maxLength).to.eql(Snake.DEFAULT_MAX_LENGTH);
		});

		it("should reset tails", function(){
			this.snake.update();
			this.snake.update();
			this.snake.update();
			this.snake.reset();

			expect(this.snake.positions).to.have.length(0);
		});

		it("should emit reset action", function(done){
			var snake = this.game.addSnake();
			snake.on("reset", done);
			snake.reset();
		});
	});

	describe("#onCollide", function(){

		it("should reset if the target is deadly", function(done){
			var object = new GameLogic.WorldObject(this.game);
			object.deadly = true;
			this.snake.once("reset", done);
			this.snake.emit("collision", object);
		});

		it("should not reset if the target is not deadly", function(){
			var snake = this.game.addSnake();
			var object = new GameLogic.WorldObject(this.game);
			object.deadly = false;

			var spy = sinon.spy();
			snake.once("reset", spy);
			snake.emit("collision", object);
			expect(spy.called).to.be.false;
		});

		it("should make the snake goes longer when collecting a powerup", function(){
			var snake = this.game.addSnake();
			var object = new GameLogic.Powerup(this.game);
			var initialLength = snake.maxLength;
			snake.emit("collision", object);
			expect(snake.maxLength).to.eql(initialLength + object.growth);
		});

		it("should make the snake goes longer by specified size when collecting a powerup", function(){
			var snake = this.game.addSnake();
			var object = new GameLogic.Powerup(this.game);
			object.growth = 5;
			var initialLength = snake.maxLength;
			snake.emit("collision", object);
			expect(snake.maxLength).to.eql(initialLength + 5);
		});

		it("should reset the snake who does head-on-tail collision", function(){
			var game = new GameLogic.Game();
			var snake1 = game.addSnake();
			var snake2 = game.addSnake();
			snake1.positions = [[0, 0], [0, 1], [0, 2], [0,3]];
			snake1.x = 0; snake1.y = 0;
			snake2.positions = [[0, 2]];
			snake2.x = 0; snake2.y = 2;

			var spy1 = sinon.spy();
			var spy2 = sinon.spy();
			snake1.on("reset", spy1);
			snake2.on("reset", spy2);

			game.checkAllCollision();

			expect(spy1.called).to.be.false;
			expect(spy2.calledOnce).to.be.true;
		});
		it("should reset both snakes when doing head-on-head collision", function(){
			var game = new GameLogic.Game();
			var snake1 = game.addSnake();
			var snake2 = game.addSnake();
			snake1.x = 0; snake1.y = 0; snake1.direction = GameLogic.MovingWorldObject.DIR.RIGHT;
			snake2.x = 2; snake2.y = 0; snake2.direction = GameLogic.MovingWorldObject.DIR.LEFT;

			var spy = sinon.spy();
			snake1.on("reset", spy);
			snake2.on("reset", spy);

			game.step();

			expect(spy.callCount).to.eql(2);
		});
	});

	describe("#getState", function(){
		it("dump length", function(){
			var obj = new Snake(this.game);
			obj.maxLength = 50;

			expect(obj.getState().maxLength).to.eql(obj.maxLength);
		});
		it("dump positions", function(){
			var obj = new Snake(this.game);
			obj.positions = [[0,0], [1,1]];

			expect(obj.getState().positions).to.eql(obj.positions);
		});
		it("dump index", function(){
			var obj = new Snake(this.game);
			obj.index = 5;

			expect(obj.getState().index).to.eql(obj.index);
		});
	});

	describe("#loadState", function(){
		it("load position", function(){
			var obj = new Snake(this.game);
			var state = {x: 5, y: 5, deadly: false, maxLength: 50, positions: [[0,0]]};
			obj.loadState(state);

			expect(obj.positions).to.eql(state.positions);
			expect(obj.x).to.eql(state.x);
			expect(obj.y).to.eql(state.y);
		});
		it("load max length", function(){
			var obj = new Snake(this.game);
			var state = {x: 5, y: 5, deadly: false, maxLength: 50, positions: [[0,0]]};
			obj.loadState(state);

			expect(obj.maxLength).to.eql(state.maxLength);
		});
		it("load index", function(){
			var obj = new Snake(this.game);
			var state = {x: 5, y: 5, deadly: false, maxLength: 50, positions: [[0,0]], index: 5};
			obj.loadState(state);

			expect(obj.index).to.eql(state.index);
		});
	});

	describe("#die", function(){
		it("should reset", function(done){
			this.snake.once("reset", done);
			this.snake.die();
		});
		it("should hide the snake", function(){
			this.snake.die();
			expect(this.snake.hidden).to.be.true;
		});
		it("should create spawner at the location of snake", function(){
			this.snake.die();
			var spawner = this.game.objects[this.game.objects.length-1];
			expect(spawner).to.be.an.instanceof(GameLogic.Spawn);
			expect(spawner.x).to.eql(this.snake.x);
			expect(spawner.y).to.eql(this.snake.y);
		});
		it("should set spawn ticks", function(){
			this.snake.die();
			expect(this.snake.tickToSpawn).to.eql(Snake.RESPAWN_DELAY);
		});
	});

});