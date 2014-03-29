var expect = require("chai").expect;
var Lobby = require("../lobby");
var GameLogic = require("../../rules/");
var MockSpark = require("./mockspark");

describe("Lobby", function(){
	beforeEach(function(){
		this.lobby = new Lobby();
	});

	it("has a list of clients", function(){
		expect(this.lobby.clients).to.be.an("Array");
	});

	it("has state lists", function(){
		expect(Lobby.STATE).to.have.keys(["LOBBY", "IN_GAME", "FINISHED"]);
	});

	describe("#addClient", function(){
		it("add client to the list of clients", function(){
			var spark = MockSpark();
			this.lobby.addClient(spark);

			expect(this.lobby.clients).to.include(spark);
		});

		it("set spark's lobby property", function(){
			var spark = MockSpark();
			this.lobby.addClient(spark);

			expect(spark.lobby).to.eql(this.lobby);
		});

		it("add snake to game if game is in progress", function(){
			this.lobby.startGame();
			this.lobby.addClient(MockSpark());
			expect(this.lobby.game.getSnake(0)).to.be.instanceof(GameLogic.Snake);
		});
	});

	describe("#removeClient", function(){
		beforeEach(function(){
			this.spark = MockSpark();
			this.lobby.addClient(this.spark);
		});

		it("remove client from the list of clients", function(){
			this.lobby.removeClient(this.spark);
			expect(this.lobby.clients).to.not.include(this.spark);
		});

		it("unset spark's lobby property", function(){
			this.lobby.removeClient(this.spark);
			expect(this.spark.lobby).to.not.eql(this.lobby);
		});

		it("unset spark's lobby property only if client is in this lobby", function(){
			var lobby = new Lobby();
			var spark = MockSpark();
			lobby.addClient(spark);

			lobby.removeClient(this.spark);
			expect(spark.lobby).to.eql(lobby);
		});

		it("remove spark's snake", function(){
			this.lobby.startGame();
			this.lobby.removeClient(this.spark);
			expect(this.lobby.game.getSnake(0)).to.be.undefined;
		});

		it("replicate removeSnake command", function(){
			this.lobby.startGame();
			this.lobby.removeClient(this.spark);
			var state = this.lobby.getState(true);
			expect(state.cmd[0]).to.eql(["removeSnake", 0]);
		});

		it("broadcast disconnect to all clients", function(done){
			var otherClient = MockSpark();
			this.lobby.addClient(otherClient);
			this.lobby.startGame();
			otherClient.write = function(message){
				expect(message.disconnect).to.eql(0);
				done();
			};
			this.lobby.removeClient(this.spark);
		});

		it("broadcast disconnect to disconnected clients", function(done){
			this.lobby.startGame();
			this.spark.write = function(message){
				expect(message.disconnect).to.eql(0);
				done();
			};
			this.lobby.removeClient(this.spark);
		});
	});

	describe("#startGame", function(){
		it("change lobby state", function(){
			this.lobby.startGame();
			expect(this.lobby.state).to.eql(Lobby.STATE.IN_GAME);
		});
		it("create game object", function(){
			this.lobby.startGame();
			expect(this.lobby.game).to.be.instanceof(GameLogic.Game);
		});
		it("create snakes for connected players", function(){
			this.lobby.addClient(MockSpark());
			this.lobby.addClient(MockSpark());
			this.lobby.addClient(MockSpark());
			this.lobby.startGame();
			expect(this.lobby.game.getSnake(2)).to.be.instanceof(GameLogic.Snake);
		});
		it("does nothing if game is already started", function(){
			this.lobby.startGame();
			var game = this.lobby.game;
			this.lobby.startGame();
			expect(game === this.lobby.game).to.be.true;
		});
		it("send game state", function(done){
			var spark = MockSpark();
			this.lobby.addClient(spark);
			spark.write = function(state){
				expect(state.game).to.be.an("Object");
				done();
			};
			this.lobby.startGame();
		});
	});

	describe("#createSnakeForClient", function(){
		beforeEach(function(){
			this.lobby.startGame();
		});
		it("create snake", function(){
			var spark = MockSpark();
			this.lobby.createSnakeForClient(spark);
			expect(spark.snake).to.be.instanceof(GameLogic.Snake);
		});
		it("set snake index", function(){
			var spark = MockSpark();
			this.lobby.createSnakeForClient(spark);
			expect(spark.snakeIndex).to.eql(0);
		});
		it("replicate addSnake command", function(){
			var spark = MockSpark();
			this.lobby.createSnakeForClient(spark);
			var state = this.lobby.getState(true);
			expect(state.cmd[0]).to.eql(["addSnake"]);
		});
		it("make sequential snake index even if a snake is disconnected", function(){
			var spark = MockSpark();
			this.lobby.addClient(spark);
			this.lobby.removeClient(spark);
			this.lobby.addClient(spark);
			expect(spark.snakeIndex).to.eql(1);
		});
	});

	describe("#getState", function(){
		it("send lobby id and state", function(){
			this.lobby.id = 50;
			var state = this.lobby.getState();
			expect(state.lobby).to.eql(this.lobby.id);
			expect(state.state).to.eql(this.lobby.state);
		});
		it("send game state if game is in progress", function(){
			this.lobby.startGame();
			var state = this.lobby.getState();
			expect(state.state).to.eql(Lobby.STATE.IN_GAME);
			expect(state.game).to.be.an("Object");
		});
		it("return hashed state if argument 1 is true", function(){
			this.lobby.startGame();
			var state = this.lobby.getState(true);
			expect(state.hash).to.be.a("String");
			expect(state.cmd).to.be.an("Array");
			expect(state.game).to.be.undefined;
		});
	});

	describe("#broadcast", function(){
		it("send message to all objects", function(done){
			this.lobby.addClient(MockSpark());
			this.lobby.addClient(MockSpark());
			var spark = MockSpark();
			this.lobby.addClient(spark);
			spark.write = function(data){
				expect(data).to.eql("hello world");
				done();
			};
			this.lobby.broadcast("hello world");
		});
	});

	describe("#sendStateToAll", function(){
		it("send state to all objects", function(done){
			this.lobby.addClient(MockSpark());
			this.lobby.addClient(MockSpark());
			var spark = MockSpark();
			this.lobby.addClient(spark);
			spark.write = function(state){
				expect(state.state).to.eql(Lobby.STATE.LOBBY);
				done();
			};
			this.lobby.sendStateToAll();
		});
		it("send hashed state to all objects", function(done){
			var spark = MockSpark();
			this.lobby.addClient(spark);
			this.lobby.startGame();
			spark.write = function(state){
				expect(state.hash).to.be.a("String");
				done();
			};
			this.lobby.sendStateToAll(true);
		});
	});

	describe("#sendState", function(){
		it("send entire state to given client", function(done){
			var spark = MockSpark();
			this.lobby.addClient(spark);
			this.lobby.startGame();
			spark.write = function(state){
				expect(state.game).to.be.an("Object");
				done();
			};
			this.lobby.sendState(spark);
		});
		it("send hashed state to given client", function(done){
			var spark = MockSpark();
			this.lobby.addClient(spark);
			this.lobby.startGame();
			spark.write = function(state){
				expect(state.hash).to.be.a("String");
				done();
			};
			this.lobby.sendState(spark, true);
		});
	});

	describe("#setAllReady", function(){
		it("set all clients ready state", function(){
			var spark1 = MockSpark();
			var spark2 = MockSpark();
			this.lobby.addClient(spark1);
			this.lobby.addClient(spark2);

			this.lobby.setAllReady(true);

			expect(spark1.ready).to.be.true;
			expect(spark2.ready).to.be.true;
		});
		it("emit ready if ready is true", function(done){
			var spark = MockSpark();
			this.lobby.addClient(spark);
			this.lobby.once("ready", done);
			this.lobby.setAllReady(true);
		});
	});

	describe("#isAllReady", function(){
		it("return true when all client is ready", function(){
			var spark1 = MockSpark();
			var spark2 = MockSpark();
			this.lobby.addClient(spark1);
			this.lobby.addClient(spark2);

			this.lobby.setAllReady(true);

			expect(this.lobby.isAllReady()).to.be.true;
		});
		it("return false when some client is ready", function(){
			var spark1 = MockSpark();
			spark1.ready = true;
			var spark2 = MockSpark();
			spark2.ready = false;
			this.lobby.addClient(spark1);
			this.lobby.addClient(spark2);

			expect(this.lobby.isAllReady()).to.be.false;
		});
		it("return false when all client is not ready", function(){
			var spark1 = MockSpark();
			var spark2 = MockSpark();
			this.lobby.addClient(spark1);
			this.lobby.addClient(spark2);

			this.lobby.setAllReady(false);

			expect(this.lobby.isAllReady()).to.be.false;
		});
		it("defaults to false if no client is connected", function(){
			expect(this.lobby.isAllReady()).to.be.false;
		});
	});

	describe("#setReady", function(){
		it("set ready of spark to value given", function(){
			var spark = MockSpark();
			this.lobby.setReady(spark, true);
			expect(spark.ready).to.be.true;
		});
		it("emit ready if all clients are ready", function(done){
			var spark = MockSpark();
			this.lobby.addClient(spark);
			this.lobby.once("ready", done);
			this.lobby.setReady(spark, true);
		});
	});

	describe("#nextTick", function(){
		it("run game step", function(done){
			this.lobby.startGame();
			this.lobby.game.on("step", done);
			this.lobby.nextTick();
		});
		it("send game state", function(done){
			var spark = MockSpark();
			this.lobby.addClient(spark);
			this.lobby.startGame();
			spark.write = function(state){
				expect(state.hash).to.be.a("String");
				done();
			};
			this.lobby.nextTick();
		});
	});

	describe("#onReady", function(){
		beforeEach(function(){
			this.lobby.startGame();
			this.lobby.game.state.updateRate = 10;
		});
		it("call nextTick", function(done){
			this.lobby.nextTick = done;
			this.lobby.lastTick = 0;
			this.lobby.onReady();
		});
		it("ignore repeated call", function(done){
			this.lobby.nextTick = done;
			this.lobby.onReady();
			this.lobby.onReady();
		});
		it("call lobby by the game updateRate", function(done){
			this.lobby.game.once("step", function(){
				this.lobby.game.once("step", function(){
					expect(new Date().getTime() - tick).to.be.closeTo(10, 5);
					done();
				});
				var tick = new Date().getTime();
				this.lobby.onReady();
			}.bind(this));
			this.lobby.onReady();
		});
	});

	describe("#input", function(){
		beforeEach(function(){
			this.lobby.startGame();
		});
		it("ignore invalid spark", function(){
			this.lobby.input(MockSpark(), "left");
		});
		it("replicate valid input", function(done){
			var spark = MockSpark();
			this.lobby.addClient(spark);
			this.lobby.nextTick();
			this.lobby.input(spark, "up");
			spark.write = function(state){
				expect(state.cmd[0]).to.eql(["input", spark.snakeIndex, "up"]);
				done();
			};
			this.lobby.nextTick();
		});
		it("ignore invalid input", function(done){
			var spark = MockSpark();
			this.lobby.addClient(spark);
			this.lobby.nextTick();
			this.lobby.input(spark, "asdf");
			spark.write = function(state){
				expect(state.cmd).to.have.length(0);
				done();
			};
			this.lobby.nextTick();
		});
	});
});