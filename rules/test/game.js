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
		it("should be able to ask for any powerup");
		it("should be able to ask for only plain powerup", function(){
			var game = new Game();
			expect(game.hasActivePowerup(true)).to.be.false;

			var item = new GameLogic.Powerup(game);
			game.objects.push(item);
			expect(game.hasActivePowerup(true)).to.be.true;
		});
	});

	describe("#step", function(){

		before(function(){
			this.game = new Game();
			this.game.addSnake();
		});

		it("should be a function", function(){
			expect(Game).to.respondTo("step");
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

			var snake = game.addSnake();
			snake.x = 1;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.LEFT;

			game.addSnake();

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
			expect(game.objects).to.have.length(1);
		});
	});

	describe("#loadMap", function(){
		it("should throw exception when map is not defined", function(){
			expect(function(){
				this.game.loadMap("unitTest_nomap")
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
	});

});