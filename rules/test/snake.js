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

	beforeEach(function(){
		this.game = new GameLogic.Game();
		this.snake = this.game.addSnake(undefined, true);
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

	it("should have perk list", function(){
		expect(this.snake.perks).to.be.an("Object");
	});

	describe("#update", function(){
		it("should store past positions", function(){
			this.snake.x = 0;
			this.snake.y = 0;
			this.snake.direction = GameLogic.MovingWorldObject.DIR.RIGHT;

			this.snake.update();
			expect(this.snake.positions).to.eql([
				[1, 0, GameLogic.MovingWorldObject.DIR.RIGHT],
				[0, 0, GameLogic.MovingWorldObject.DIR.RIGHT]
			]);

			this.snake.update();
			expect(this.snake.positions).to.eql([
				[2, 0, GameLogic.MovingWorldObject.DIR.RIGHT],
				[1, 0, GameLogic.MovingWorldObject.DIR.RIGHT],
				[0, 0, GameLogic.MovingWorldObject.DIR.RIGHT]
			]);
		});

		it("should trim the snake to the maximum length", function(){
			this.snake.x = 0;
			this.snake.y = 0;
			this.snake.direction = GameLogic.MovingWorldObject.DIR.RIGHT;
			this.snake.maxLength = 2;

			for(var i = 0; i < 3; i++){
				this.snake.update();
			}

			expect(this.snake.positions).to.eql([
				[3, 0, GameLogic.MovingWorldObject.DIR.RIGHT],
				[2, 0, GameLogic.MovingWorldObject.DIR.RIGHT]
			]);
		});

		it("should respawn snake", function(){
			this.snake.die();

			var spy = sinon.stub(this.snake, "respawn");
			for(var i = 0; i < Snake.RESPAWN_DELAY; i++){
				expect(spy.called).to.be.false;
				this.game.step();
			}
			expect(spy.called).to.be.true;
		});

		it("should expire perk", function(){
			this.snake.perks["test"] = this.game.state.step - 1;

			this.snake.update();

			expect(this.snake.perks["test"]).to.be.undefined;
		});

		it("should ignore when respawning", function(){
			this.snake.update();
			expect(this.snake.positions).to.have.length(2);

			this.snake.addPerk("respawn", 10);
			expect(this.snake.positions).to.have.length(2);
		});
	});

	describe("#_wrapAround", function(){
		beforeEach(function(){
			this.game.state.width = 20;
			this.game.state.height = 20;
		});

		it("should wrap left", function(){
			this.snake.x = 0;
			this.snake.y = 0;
			this.snake.direction = GameLogic.MovingWorldObject.DIR.LEFT;
			this.snake.update();

			expect(this.snake.x).to.eql(19);
			expect(this.snake.y).to.eql(0);
			expect(this.snake.positions).to.eql([
				[19, 0, GameLogic.MovingWorldObject.DIR.LEFT],
				[0, 0, GameLogic.MovingWorldObject.DIR.LEFT]
			]);
		});

		it("should wrap right", function(){
			this.snake.x = 19;
			this.snake.y = 0;
			this.snake.direction = GameLogic.MovingWorldObject.DIR.RIGHT;
			this.snake.update();

			expect(this.snake.x).to.eql(0);
			expect(this.snake.y).to.eql(0);
			expect(this.snake.positions).to.eql([
				[0, 0, GameLogic.MovingWorldObject.DIR.RIGHT],
				[19, 0, GameLogic.MovingWorldObject.DIR.RIGHT]
			]);
		});

		it("should wrap top", function(){
			this.snake.x = 0;
			this.snake.y = 0;
			this.snake.direction = GameLogic.MovingWorldObject.DIR.UP;
			this.snake.update();

			expect(this.snake.x).to.eql(0);
			expect(this.snake.y).to.eql(19);
			expect(this.snake.positions).to.eql([
				[0, 19, GameLogic.MovingWorldObject.DIR.UP],
				[0, 0, GameLogic.MovingWorldObject.DIR.UP]
			]);
		});

		it("should wrap bottom", function(){
			this.snake.x = 0;
			this.snake.y = 19;
			this.snake.direction = GameLogic.MovingWorldObject.DIR.DOWN;
			this.snake.update();

			expect(this.snake.x).to.eql(0);
			expect(this.snake.y).to.eql(0);
			expect(this.snake.positions).to.eql([
				[0, 0, GameLogic.MovingWorldObject.DIR.DOWN],
				[0, 19, GameLogic.MovingWorldObject.DIR.DOWN]
			]);
		});

	});

	describe("#input", function(){

		beforeEach(function(){
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
			this.snake.direction = GameLogic.MovingWorldObject.DIR.DOWN;
			this.snake.input("up");
			this.snake.update();
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.DOWN);
		});

		it("should not allow moving in opposite direction when two keys are pressed in the same tick", function(){
			this.snake.direction = GameLogic.MovingWorldObject.DIR.DOWN;
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
			this.snake.on("reset", done);
			this.snake.reset();
		});

		it("should reset perk", function(){
			this.snake.addPerk("test", 10);
			this.snake.reset();
			expect(this.snake.perks.test).to.be.undefined;
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
			var object = new GameLogic.WorldObject(this.game);
			object.deadly = false;

			var spy = sinon.spy();
			this.snake.once("reset", spy);
			this.snake.emit("collision", object);
			expect(spy.called).to.be.false;
		});

		it("should make the snake goes longer when collecting a powerup", function(){
			var object = new GameLogic.Powerup(this.game);
			var initialLength = this.snake.maxLength;
			this.snake.emit("collision", object);
			expect(this.snake.maxLength).to.eql(initialLength + object.growth);
		});

		it("should make the snake goes longer by specified size when collecting a powerup", function(){
			var object = new GameLogic.Powerup(this.game);
			object.growth = 5;
			var initialLength = this.snake.maxLength;
			this.snake.emit("collision", object);
			expect(this.snake.maxLength).to.eql(initialLength + 5);
		});

		it("should reset the snake who does head-on-tail collision", function(){
			var snake1 = this.snake;
			var snake2 = this.game.addSnake(undefined, true);
			snake1.positions = [[0, 0], [0, 1], [0, 2], [0,3]];
			snake1.x = 0; snake1.y = 0;
			snake2.positions = [[0, 2]];
			snake2.x = 0; snake2.y = 2;

			var spy1 = sinon.spy();
			var spy2 = sinon.spy();
			snake1.on("reset", spy1);
			snake2.on("reset", spy2);

			this.game.checkAllCollision();

			expect(spy1.called).to.be.false;
			expect(spy2.calledOnce).to.be.true;
		});
		it("should reset both snakes when doing head-on-head collision", function(){
			var snake1 = this.snake;
			var snake2 = this.game.addSnake(undefined, true);
			snake1.x = 0; snake1.y = 0; snake1.direction = GameLogic.MovingWorldObject.DIR.RIGHT;
			snake2.x = 2; snake2.y = 0; snake2.direction = GameLogic.MovingWorldObject.DIR.LEFT;

			var spy = sinon.spy();
			snake1.on("reset", spy);
			snake2.on("reset", spy);

			this.game.step();

			expect(spy.callCount).to.eql(2);
		});
		it("should create one spawn when self-colliding", function(){
			this.snake.x = 0;
			this.snake.y = 0;
			this.snake.positions = [
				[0, 0],
				[0, 1],
				[1, 1],
				[1, 0],
				[0, 0]
			];
			this.game.checkAllCollision();
			expect(this.game.objects).to.have.length(2);
		});
		it("should add perk when collecting one", function(){
			var object = new GameLogic.PerkPowerup(this.game);
			object.perk = "bite";
			object.perkTime = 10;

			this.snake.emit("collision", object);

			expect(this.snake.perks.bite).to.eql(this.game.state.step + object.perkTime);
		});
		it("should not kill the snake on snake head-on-snake head collision when it is invulnerable", function(){
			var snake1 = this.snake;
			var snake2 = this.game.addSnake(undefined, true);
			snake1.x = 0; snake1.y = 0; snake1.direction = GameLogic.MovingWorldObject.DIR.RIGHT;
			snake1.invulnerable = true;
			snake2.x = 2; snake2.y = 0; snake2.direction = GameLogic.MovingWorldObject.DIR.LEFT;

			var spy = sinon.spy();
			snake1.on("reset", spy);
			var spy2 = sinon.spy();
			snake2.on("reset", spy2);

			this.game.step();

			expect(spy.called).to.be.false;
			expect(spy2.called).to.be.true;
		});
		it("should chop other snake when one have bite perk", function(){
			var snake1 = this.snake;
			var snake2 = this.game.addSnake(undefined, true);
			snake1.x = 0; snake1.y = 0; snake1.direction = GameLogic.MovingWorldObject.DIR.RIGHT;
			snake1.addPerk("bite", 10);
			snake2.x = 2; snake2.y = 0; snake2.direction = GameLogic.MovingWorldObject.DIR.UP;
			snake2.positions = [
				[2, 0],
				[1, 0],
				[0, 0]
			];

			this.game.step();

			expect(snake2.positions).to.have.length(2);
			expect(snake2.maxLength).to.eql(2);
		});
		it("should kill if chop next to the head", function(){
			var snake1 = this.snake;
			var snake2 = this.game.addSnake(undefined, true);
			snake1.x = 2; snake1.y = 1; snake1.direction = GameLogic.MovingWorldObject.DIR.UP;
			snake1.addPerk("bite", 10);
			snake2.x = 2; snake2.y = 0; snake2.direction = GameLogic.MovingWorldObject.DIR.UP;
			snake2.positions = [
				[2, 0],
				[1, 0],
				[0, 0]
			];

			var spy = sinon.spy();
			snake2.on("reset", spy);

			this.game.step();

			expect(spy.called).to.be.true;
		});
	});

	describe("#getState", function(){
		it("dump length", function(){
			this.snake.maxLength = 50;

			expect(this.snake.getState().maxLength).to.eql(this.snake.maxLength);
		});
		it("dump positions", function(){
			this.snake.positions = [[0,0], [1,1]];

			expect(this.snake.getState().positions).to.eql(this.snake.positions);
		});
		it("dump index", function(){
			this.snake.index = 5;

			expect(this.snake.getState().index).to.eql(this.snake.index);
		});
		it("dump perks list", function(){
			this.snake.perks = {
				"bite": 100
			};
			expect(this.snake.getState().perks).to.eql(this.snake.perks);
		});
		it("dump invulnerable", function(){
			this.snake.invulnerable = true;
			expect(this.snake.getState().invulnerable).to.be.true;
		});
	});

	describe("#loadState", function(){
		it("load position", function(){
			var state = {x: 5, y: 5, deadly: false, maxLength: 50, positions: [[0,0]]};
			this.snake.loadState(state);

			expect(this.snake.positions).to.eql(state.positions);
			expect(this.snake.x).to.eql(state.x);
			expect(this.snake.y).to.eql(state.y);
		});
		it("load max length", function(){
			var state = {x: 5, y: 5, deadly: false, maxLength: 50, positions: [[0,0]]};
			this.snake.loadState(state);

			expect(this.snake.maxLength).to.eql(state.maxLength);
		});
		it("load index", function(){
			var state = {x: 5, y: 5, deadly: false, maxLength: 50, positions: [[0,0]], index: 5};
			this.snake.loadState(state);

			expect(this.snake.index).to.eql(state.index);
		});
		it("load perks list", function(){
			var state = {x: 5, y: 5, deadly: false, maxLength: 50, positions: [[0,0]], index: 5, perks: {
				"bite": 100
			}};
			this.snake.loadState(state);

			expect(this.snake.perks).to.eql(state.perks);
		});
		it("load invulnerable", function(){
			var state = {x: 5, y: 5, deadly: false, maxLength: 50, positions: [[0,0]], index: 5, invulnerable: true};
			this.snake.loadState(state);

			expect(this.snake.invulnerable).to.be.true;
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
		it("should add respawn perk", function(){
			this.snake.die();
			expect(this.snake.perks.respawn).to.eql(this.game.state.step + Snake.RESPAWN_DELAY);
		});
	});

	describe("#cleanup", function(){
		it("remove snake spawn", function(){
			this.snake.die();
			expect(this.game.objects).to.have.length(2);
			this.snake.cleanup();
			expect(this.game.objects).to.have.length(1);
		});
	});

	describe("#addPerk", function(){
		it("should add perk", function(){
			this.snake.addPerk("test", 10);
			expect(this.snake.perks["test"]).to.eql(this.game.state.step + 10);
		});
		it("should emit perkAdd", function(){
			var spy = sinon.spy();
			this.snake.once("perkAdd", spy);

			this.snake.addPerk("test", 10);

			expect(spy.calledWith("test")).to.be.true;
		});
	});

	describe("#expirePerk", function(){
		it("should expire perk", function(){
			this.snake.perks["test"] = this.game.state.step - 1;

			this.snake.expirePerk();

			expect(this.snake.perks["test"]).to.be.undefined;
		});
		it("should emit perkRemove", function(){
			var spy = sinon.spy();
			this.snake.once("perkRemove", spy);

			this.snake.perks["test"] = this.game.state.step - 1;
			this.snake.expirePerk();

			expect(spy.calledWith("test")).to.be.true;
		});
	});

	describe("#hasPerk", function(){
		it("should return true when perk exists and not expiring", function(){
			this.snake.addPerk("test", 1);
			expect(this.snake.hasPerk("test")).to.be.true;
		});
		it("should return false when perk does note xists", function(){
			expect(this.snake.hasPerk("test")).to.be.false;
		});
		it("should return false when perk is expired", function(){
			this.snake.addPerk("test", -1);
			expect(this.snake.hasPerk("test")).to.be.false;
		});
	});

});