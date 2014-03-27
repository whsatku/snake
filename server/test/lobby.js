var expect = require("chai").expect;
var Lobby = require("../lobby");
var GameLogic = require("../../rules/");

describe("Lobby", function(){
	beforeEach(function(){
		this.lobby = new Lobby();
	});

	it("has a list of clients", function(){
		expect(this.lobby.clients).to.be.an("Array");
	});

	describe("#addClient", function(){
		it("add client to the list of clients", function(){
			var spark = {};
			this.lobby.addClient(spark);

			expect(this.lobby.clients).to.include(spark);
		});

		it("set spark's lobby property", function(){
			var spark = {};
			this.lobby.addClient(spark);

			expect(spark.lobby).to.eql(this.lobby);
		});
	});

	describe("#removeClient", function(){
		beforeEach(function(){
			this.spark = {};
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
			var spark = {};
			lobby.addClient(spark);

			this.lobby.removeClient(this.spark);
			expect(spark.lobby).to.eql(lobby);
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
			this.lobby.addClient({});
			this.lobby.addClient({});
			this.lobby.addClient({});
			this.lobby.startGame();
			expect(this.lobby.game.getSnake(2)).to.be.instanceof(GameLogic.Snake);
		});
	});
});