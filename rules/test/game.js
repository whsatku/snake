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
var Game = GameLogic.Game;

describe("Game", function(){

	it("should be a constructor", function(){
		expect(new Game()).to.be.an.instanceOf(Game);
	});

	it("should be an EventEmitter", function(){
		["emit", "once", "on"].forEach(function(item){
			expect(new Game()).to.respondTo(item);
		});
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
		beforeEach(function(){
			this.game = new Game();
		});

		it("should be able to execute", function(){
			expect(Game).to.respondTo("addSnake");
		});
		it("should return a Snake object", function(){
			expect(this.game.addSnake()).to.be.an.instanceOf(GameLogic.Snake);
		});
		it("should add the returned snake to objects array", function(){
			var returned = this.game.addSnake();
			expect(this.game.objects).to.include.members([returned]);
		});
		it("should set snake index property", function(){
			this.game.addSnake();
			var snake = this.game.addSnake();
			expect(snake.index).to.eql(1);
		});
	});

	describe("#removeSnake", function(){
		beforeEach(function(){
			this.game = new Game();
			this.snake = this.game.addSnake();
		});

		it("remove snake by object", function(){
			this.game.removeSnake(this.snake);
			expect(this.game.objects).to.have.length(0);
		});

		it("remove snake by index", function(){
			this.game.removeSnake(0);
			expect(this.game.objects).to.have.length(0);
		});

		it("return index of snake", function(){
			expect(this.game.removeSnake(this.snake)).to.eql(0);
		});

		it("return false for non existing snake", function(){
			expect(this.game.removeSnake(new GameLogic.Snake(this.game))).to.be.false;
		});

		it("remove snake spawn", function(){
			this.snake.die();
			var spawn = this.game.objects[1];
			expect(spawn).to.be.an.instanceof(GameLogic.Spawn);
			this.game.removeSnake(this.snake);
			expect(this.game.objects).to.have.length(0);
		});
	});

	describe("#getSnake", function(){
		before(function(){
			this.game = new Game();
			this.snake0 = this.game.addSnake();
			this.snake1 = this.game.addSnake();
			this.snake2 = this.game.addSnake();
		});

		it("should return a snake", function(){
			expect(this.game.getSnake(0)).to.eql(this.snake0);
			expect(this.game.getSnake(1)).to.eql(this.snake1);
			expect(this.game.getSnake(2)).to.eql(this.snake2);
		});
	});

	describe("#hasActivePowerup", function(){
		it("should be able to ask for any powerup", function(){
			var game = new Game();
			expect(game.hasActivePowerup()).to.be.false;

			var item = new GameLogic.Powerup(game);
			game.objects.push(item);
			expect(game.hasActivePowerup()).to.be.true;

			item = new GameLogic.PerkPowerup(game);
			game.objects = [item];
			expect(game.hasActivePowerup()).to.be.true;
		});
		it("should be able to ask for only plain powerup", function(){
			var game = new Game();
			expect(game.hasActivePowerup(true)).to.be.false;

			var item = new GameLogic.Powerup(game);
			game.objects.push(item);
			expect(game.hasActivePowerup(true)).to.be.true;

			item = new GameLogic.PerkPowerup(game);
			game.objects = [item];
			expect(game.hasActivePowerup(true)).to.be.false;
		});
		it("should be able to ask for only non-plain powerup", function(){
			var game = new Game();
			expect(game.hasActivePowerup(false)).to.be.false;

			var item = new GameLogic.Powerup(game);
			game.objects.push(item);
			expect(game.hasActivePowerup(false)).to.be.false;

			item = new GameLogic.PerkPowerup(game);
			game.objects = [item];
			expect(game.hasActivePowerup(false)).to.be.true;
		});
	});

	describe("#step", function(){

		before(function(){
			this.game = new Game();
			this.game.addSnake(undefined, true);
		});

		it("change game state to in_progress", function(){
			var game = new Game();
			game.step();
			expect(game.state.state).to.eql(Game.STATES.IN_PROGRESS);
		});

		it("change game step", function(){
			var game = new Game();
			var oldStep = game.state.step;
			game.step();
			expect(game.state.step).to.eql(oldStep+1);
		});

		it("should call child's update function", function(done){
			var game = new Game();
			var MockWorldObject = new GameLogic.WorldObject(game);
			MockWorldObject.update = done;

			game.objects.push(MockWorldObject);
			game.step();
		});

		it("should make snake move", function(){
			var snakePos = this.game.objects[0].x;
			this.game.step();
			expect(this.game.objects[0].x).to.not.eql(snakePos);
		});

		it("should fire step event", function(next){
			this.game.once("step", next);
			this.game.step();
		});

		it("should check collision between objects and fire collision event", function(){
			var game = new Game();

			var a = new GameLogic.WorldObject(game);
			a.x = 0;
			a.y = 0;
			game.objects.push(a);

			var b = new GameLogic.WorldObject(game);
			b.x = 0;
			b.y = 0;
			game.objects.push(b);

			var c = new GameLogic.WorldObject(game);
			c.x = 0;
			c.y = 1;
			game.objects.push(c);

			var spy = sinon.spy();
			var spy2 = sinon.spy();

			a.once("collision", spy);
			b.once("collision", spy);
			c.once("collision", spy);

			game.step();

			expect(spy.calledWith(a)).to.be.true;
			expect(spy.calledWith(b)).to.be.true;
			expect(spy2.called).to.be.false;
		});

		it("should still run collision check if the object is removed during processing", function(){
			var game = new Game();

			var snake = game.addSnake(null, true);
			snake.x = 1;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.LEFT;

			game.addSnake(null, true);

			var powerup = new GameLogic.Powerup(game);
			powerup.x = 0;
			powerup.y = 0;
			game.objects.push(powerup);

			expect(game.objects).to.include.members([powerup]);

			game.step();

			expect(game.objects).not.to.include.members([powerup]);
		});

		it("should generate powerup is one is not active", function(){
			var game = new Game();
			game.step();
			expect(game.objects[game.objects.length - 1]).to.be.instanceOf(GameLogic.Powerup);
			var oldLength = game.objects.length;
			game.step();
			expect(game.objects).to.have.length(oldLength);
		});

		it("should sometimes generate perk powerup is one is not active", function(){
			var game = new Game();
			for(var i = 0; i < 1000000; i++){
				game.step();
				var lastItem = game.objects[game.objects.length - 1];
				if(lastItem instanceof GameLogic.PerkPowerup){
					return;
				}
			}
			throw new Error("PerkPowerup is not generated");
		});

		it("should fire snakeDie event if snake dies", function(){
			var game = new Game();
			var object = new GameLogic.WorldObject(game);
			object.x = 0;
			object.y = 0;
			game.objects.push(object);
			var snake = game.addSnake(null, true);
			snake.x = 0;
			snake.y = 0;

			var spy = sinon.spy();
			game.once("snakeDie", spy);
			game.step();

			expect(spy.calledWith(snake)).to.be.true;
		});
	});

	describe("#checkCollision", function(){
		it("return list of colliding objects", function(){
			var game = new Game();
			var a = new GameLogic.WorldObject(game);
			a.x = 0; a.y = 0;
			game.objects.push(a);
			var b = new GameLogic.WorldObject(game);
			b.x = 0; b.y = 0;
			game.objects.push(b);

			expect(game.checkCollision(a)).to.eql([b]);
		});
	});

	describe("#input", function(){

		beforeEach(function(){
			this.game = new Game();
			this.snake = this.game.addSnake();
			this.game.addSnake();
			this.game.addSnake();
			this.game.addSnake();
		});

		it("should be a function", function(){
			expect(Game).to.respondTo("input");
		});

		it("should give input to snake", function(){
			var stub = sinon.stub(this.snake, "input");
			this.game.input(0, "command");
			expect(stub.calledWith("command")).to.be.true;
		});

		it("should return snake output", function(){
			var stub = sinon.stub(this.snake, "input").returns(false);
			expect(this.game.input(0, "command")).to.be.false;
			stub.returns(true);
			expect(this.game.input(0, "command")).to.be.true;
		});
		it("should ignore if snake does not exists", function(){
			this.game.input(9999, "command");
		});

	});

	describe("#removeChild", function(){
		it("should remove a child", function(){
			var game = new Game();
			var snake = game.addSnake();
			game.removeChild(snake);
			expect(game.objects).to.have.length(0);
		});

		it("should do nothing when child is not existing", function(){
			var game = new Game();
			game.addSnake();
			game.removeChild(new GameLogic.WorldObject(game));
			expect(game.objects).to.have.length(2);
		});
	});

	describe("#loadMap", function(){
		it("should throw exception when map is not defined", function(){
			expect(function(){
				this.game.loadMap("unitTest_nomap");
			}).to.throw(Error);
		});
		it("should set game state map size and name", function(){
			this.game.loadMap("unitTest");
			expect(this.game.state.map).to.eql("unitTest");
			expect(this.game.state.width).to.eql(3);
			expect(this.game.state.height).to.eql(3);
		});
		it("should create obstacles", function(){
			this.game.loadMap("unitTest");
			expect(this.game.objects).to.have.length(8);
			expect(this.game.objects[0].x).to.eql(0);
			expect(this.game.objects[0].y).to.eql(0);
		});
		it("should set obstacle type", function(){
			this.game.loadMap("unitTest");
			expect(this.game.objects[1].type).to.eql("D");
		});
	});

	describe("#prepareState", function(){
		it("send getState to every objects", function(){
			var object = new GameLogic.WorldObject(this.game);
			object.getState = function(){
				return {success: true};
			};
			this.game.objects = [object];
			this.game.prepareState();
			expect(this.game.state.objects[0].success).to.be.true;
			this.game.objects = [];
		});
		it("ignore object with empty state", function(){
			var object = new GameLogic.WorldObject(this.game);
			object.getState = function(){
				return {};
			};
			this.game.objects = [object];
			expect(this.game.prepareState().objects).to.eql([]);
			this.game.objects = [];
		});
		it("dump object constructor name", function(){
			this.game.addSnake();
			this.game.prepareState();
			expect(this.game.state.objects[0]._type).to.eql("Snake");
		});
		it("dump rng state", function(){
			this.game.prepareState();
			expect(this.game.state.rng).to.be.an("Object");
		});
	});

	describe("#loadState", function(){
		var state = JSON.parse('{"state":1,"powerUpCollected":0,"powerUpToEnd":5,"width":37,"height":29,"updateRate":150,"map":"plain","step":1187,"objects":[{"x":22,"y":17,"deadly":true,"hidden":false,"direction":1,"speed":1,"positions":[[22,17,1],[21,17,1],[20,17,1],[19,17,1]],"maxLength":4,"index":0,"_type":"Snake"},{"x":2,"y":20,"deadly":true,"hidden":false,"direction":1,"speed":1,"positions":[[2,20,1],[1,20,1],[0,20,1],[36,20,1]],"maxLength":4,"index":1,"_type":"Snake"},{"x":27,"y":3,"deadly":false,"hidden":false,"_type":"Powerup"}],"rng":{"seed":[53382134,-1969390042,-157402938,-1970437036,-430692248,13994957,-105937504,-2071646456,364434566,1927284333,-573882883,-1599859988,-496542456,122684582,790803653,771424503,757039233,1892530146,-18026704,1436900270,626601444,-348180747,-1236774357,370976472,642988923,170244552,-294296117,582472710,2130458906,-437129898,-1568311299,1275592537],"idx":3},"snake":[0,1]}');
		before(function(){
			this.game.loadState(state);
		});
		it("update state", function(){
			expect(this.game.state.state).to.eql(1);
			expect(this.game.state.width).to.eql(37);
			expect(this.game.state.height).to.eql(29);
			expect(this.game.state.updateRate).to.eql(150);
			expect(this.game.state.step).to.eql(1187);
		});
		it("load rng state", function(){
			expect(this.game.random.randInt()).to.eql(1472122519);
		});
		it("create objects from state", function(){
			expect(this.game.objects[this.game.objects.length - 1]).to.be.instanceof(GameLogic.Powerup);
		});
		it("emit loadState event", function(done){
			this.game.once("loadState", done)
			this.game.loadState(state);
		});
	});

	describe("#prepareState", function(){
		it("return crc32 of state json", function(){
			var state = JSON.parse('{"state":1,"powerUpCollected":0,"powerUpToEnd":5,"width":37,"height":29,"updateRate":150,"map":"plain","step":1187,"objects":[{"x":22,"y":17,"deadly":true,"hidden":false,"direction":1,"speed":1,"positions":[[22,17,1],[21,17,1],[20,17,1],[19,17,1]],"maxLength":4,"index":0,"_type":"Snake"},{"x":2,"y":20,"deadly":true,"hidden":false,"direction":1,"speed":1,"positions":[[2,20,1],[1,20,1],[0,20,1],[36,20,1]],"maxLength":4,"index":1,"_type":"Snake"},{"x":27,"y":3,"deadly":false,"hidden":false,"_type":"Powerup"}],"rng":{"seed":[53382134,-1969390042,-157402938,-1970437036,-430692248,13994957,-105937504,-2071646456,364434566,1927284333,-573882883,-1599859988,-496542456,122684582,790803653,771424503,757039233,1892530146,-18026704,1436900270,626601444,-348180747,-1236774357,370976472,642988923,170244552,-294296117,582472710,2130458906,-437129898,-1568311299,1275592537],"idx":3},"snake":[0,1]}');
			this.game.loadState(state);
			this.game.prepareState();
			expect(this.game.hashState()).to.eql("e677d7b0");
		});
	});

});