var expect = require("chai").expect;
var SnakeServer = require("../snakeserver");
var Lobby = require("../lobby");
var GameLogic = require("../../rules/");
var _ = require("underscore");

var MockSpark = function(){
	if(!(this instanceof MockSpark)){
		return new MockSpark();
	}
};
MockSpark.prototype.write = function(){
};

describe("SnakeServer", function(){
	beforeEach(function(){
		this.server = new SnakeServer();
	});

	it("has a list of lobby", function(){
		expect(this.server.lobby).to.be.an("Object");
	});

	describe("#id", function(){
		it("generate unique id", function(){
			var generatedId = [];
			for(var i = 0; i<500; i++){
				generatedId.push(this.server.id());
			}
			expect(_.uniq(generatedId)).to.have.length(generatedId.length);
		});
		it("generate int id", function(){
			expect(this.server.id()).to.be.a("Number");
			expect(this.server.id()).to.gte(0);
		});
	});

	describe("#handleMessage", function(){
		it("handle lobbycreate message", function(done){
			this.server.createLobby = function(){
				done();
			};
			this.server.handleMessage({}, {"command": "lobbycreate"});
		});
		it("handle lobbyjoin message", function(done){
			this.server.joinLobby = function(spark, lobby){
				expect(lobby).to.eql("unittest");
				done();
			};
			this.server.handleMessage({}, {"command": "lobbyjoin", "lobby": "unittest"});
		});
		it("handle lobbystart message", function(done){
			this.server.startLobby = function(){
				done();
			};
			this.server.handleMessage({}, {"command": "lobbystart"});
		});
	});

	describe("#createLobby", function(){
		it("returns a lobby", function(){
			var spark = MockSpark();
			expect(this.server.createLobby(spark)).to.be.an.instanceof(Lobby);
		});
		it("add spark to lobby", function(){
			var spark = MockSpark();
			var lobby = this.server.createLobby(spark);
			expect(lobby.clients).to.include(spark);
		});
		it("set spark's lobby property", function(){
			var spark = MockSpark();
			var lobby = this.server.createLobby(spark);
			expect(spark.lobby).to.eql(lobby);
		});
		it("store lobby by id", function(){
			var spark = MockSpark();
			var lobby = this.server.createLobby(spark);
			expect(this.server.lobby[lobby.id]).to.eql(lobby);
		});
		it("disconnect spark from old lobby", function(){
			var spark = MockSpark();
			var lobby = this.server.createLobby(spark);
			var lobby2 = this.server.createLobby(spark);
			expect(lobby.clients).to.have.length(0);
			expect(lobby2.clients).to.include(spark);
			expect(spark.lobby).to.eql(lobby2);
		});
	});

	describe("#cleanup", function(){
		it("remove lobby with no clients", function(){
			var spark = MockSpark();
			var lobby = this.server.createLobby(spark);
			var lobby2 = this.server.createLobby(spark);
			
			expect(Object.keys(this.server.lobby)).to.have.length(2);

			this.server.cleanup();

			expect(Object.keys(this.server.lobby)).to.have.length(1);
			expect(this.server.lobby[lobby2.id]).to.eql(lobby2);
		});
	});

	describe("#autoCleanup", function(){
		it("fire cleanup after an interval", function(done){
			this.server.cleanupInterval = 1;
			this.server.cleanup = function(){
				clearInterval(this.server._cleanupTimer);
				done();
			}.bind(this);
			this.server.autoCleanup();
		});
	});

	describe("#joinLobby", function(){
		beforeEach(function(){
			this.spark = MockSpark();
			this.lobby = this.server.createLobby(this.spark);
		});

		it("add spark to lobby", function(){
			var spark = MockSpark();
			this.server.joinLobby(spark, this.lobby.id);
			expect(this.lobby.clients).to.include(spark);
		});
		it("set spark's lobby property", function(){
			var spark = MockSpark();
			this.server.joinLobby(spark, this.lobby.id);
			expect(spark.lobby).to.eql(this.lobby);
		});
		it("disconnect spark from old lobby", function(){
			var spark = MockSpark();
			var lobby = this.server.createLobby(spark);
			this.server.joinLobby(spark, this.lobby.id);
			expect(lobby.clients).to.have.length(0);
			expect(this.lobby.clients).to.include(spark);
			expect(spark.lobby).to.eql(this.lobby);
		});
	});

	describe("#startLobby", function(){
		it("do nothing if spark is not connected to lobby", function(){
			var spark = MockSpark();
			var lobby = this.server.createLobby(spark);

			this.server.startLobby({});
		});
		it("start game if spark is the host of lobby", function(){
			var spark = {};
			var lobby = this.server.createLobby(spark);

			this.server.startLobby(spark);

			expect(lobby.state).to.eql(Lobby.STATE.IN_GAME);
			expect(lobby.game).to.be.instanceof(GameLogic.Game);
		});
		it("do nothing if spark is not host of lobby", function(){
			var spark = MockSpark();
			var lobby = this.server.createLobby(spark);
			var spark2 = MockSpark();
			this.server.joinLobby(spark2, lobby.id);

			this.server.startLobby(spark2);

			expect(lobby.state).to.eql(Lobby.STATE.LOBBY);
		});
	});
});
