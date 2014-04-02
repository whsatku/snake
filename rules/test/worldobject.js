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

var WorldObject = GameLogic.WorldObject;

describe("WorldObject", function(){

	before(function(){
		this.game = new GameLogic.Game();
	});

	it("should be a constructor", function(){
		expect(new WorldObject(this.game)).to.be.an.instanceOf(WorldObject);
	});

	it("should be an EventEmitter", function(){
		["emit", "once", "on"].forEach(function(item){
			expect(new WorldObject(this.game)).to.respondTo(item);
		}, this);
	});

	it("should have x, y position", function(){
		expect((new WorldObject(this.game)).x).to.be.a("Number");
		expect((new WorldObject(this.game)).y).to.be.a("Number");
	});

	it("should have link to the world state", function(){
		expect((new WorldObject(this.game)).world).to.be.an.instanceOf(GameLogic.Game);
	});

	describe("#cleanup", function(){
		it("is a function", function(){
			expect(new WorldObject(this.game)).to.respondTo("cleanup");
		});
	})

	describe("#isOffScreen", function(){

		before(function(){
			this.object = new WorldObject(this.game);
		});

		it("should return true on (-1, 0)", function(){
			this.object.x = -1;
			this.object.y = 0;
			expect(this.object.isOffScreen()).to.be.true;
		});

		it("should return true on (0, -1)", function(){
			this.object.x = 0;
			this.object.y = -1;
			expect(this.object.isOffScreen()).to.be.true;
		});

		it("should return false on (0, 0)", function(){
			this.object.x = 0;
			this.object.y = 0;
			expect(this.object.isOffScreen()).to.be.false;
		});

		it("should return true on (screenWidth, 0)", function(){
			this.object.x = this.game.state.width;
			this.object.y = 0;
			expect(this.object.isOffScreen()).to.be.true;
		});

		it("should return true on (0, screenHeight)", function(){
			this.object.x = 0;
			this.object.y = this.game.state.height;
			expect(this.object.isOffScreen()).to.be.true;
		});

		it("should return true on (screenWidth, screenHeight)", function(){
			this.object.x = this.game.state.width;
			this.object.y = this.game.state.height;
			expect(this.object.isOffScreen()).to.be.true;
		})

		it("should return false on (screenWidth - 1, 0)", function(){
			this.object.x = this.game.state.width - 1;
			this.object.y = 0;
			expect(this.object.isOffScreen()).to.be.false;
		});

		it("should return false on (0, screenHeight - 1)", function(){
			this.object.x = 0;
			this.object.y = this.game.state.height - 1;
			expect(this.object.isOffScreen()).to.be.false;
		});
	});

	describe("#isCollideWith", function(){
		it("should return true when two object collide in same position", function(){
			var a = new WorldObject(this.game);
			a.x = 5;
			a.y = 5;

			var b = new WorldObject(this.game);
			b.x = 5;
			b.y = 5;

			expect(a.isCollideWith(b)).to.be.true;
			expect(b.isCollideWith(a)).to.be.true;
		});
		it("should return false when two object are not in the same x position", function(){
			var a = new WorldObject(this.game);
			a.x = 3;
			a.y = 5;

			var b = new WorldObject(this.game);
			b.x = 5;
			b.y = 5;

			expect(a.isCollideWith(b)).to.be.false;
			expect(b.isCollideWith(a)).to.be.false;
		});
		it("should return false when two object are not in the same y position", function(){
			var a = new WorldObject(this.game);
			a.x = 5;
			a.y = 3;

			var b = new WorldObject(this.game);
			b.x = 5;
			b.y = 5;

			expect(a.isCollideWith(b)).to.be.false;
			expect(b.isCollideWith(a)).to.be.false;
		});
		it("should return false when two object are not in the same position", function(){
			var a = new WorldObject(this.game);
			a.x = 5;
			a.y = 3;

			var b = new WorldObject(this.game);
			b.x = 7;
			b.y = 8;

			expect(a.isCollideWith(b)).to.be.false;
			expect(b.isCollideWith(a)).to.be.false;
		});
	});

	describe("#randomPosition", function(){
		it("should not random into obstacle", function(){
			var game = new GameLogic.Game();
			game.state.width = 2;
			game.state.height = 2;

			[[0, 0], [1, 0], [0, 1]].forEach(function(pos){
				var object = new GameLogic.WorldObject(game);
				object.x = pos[0];
				object.y = pos[1];
				game.objects.push(object);
			});

			var testObject = new GameLogic.WorldObject(game);
			game.objects.push(testObject);
			testObject.randomPosition();

			expect(testObject.x).to.eql(1);
			expect(testObject.y).to.eql(1);
		});
	});

	describe("#getState", function(){
		it("dump position", function(){
			var obj = new WorldObject(this.game);
			expect(obj.getState().x).to.eql(obj.x);
			expect(obj.getState().y).to.eql(obj.y);
		});
		it("dump deadly type", function(){
			var obj = new WorldObject(this.game);
			expect(obj.getState().deadly).to.eql(obj.deadly);
		});
		it("dump hidden type", function(){
			var obj = new WorldObject(this.game);
			expect(obj.getState().hidden).to.eql(obj.hidden);
		});
	});

	describe("#loadState", function(){
		it("load position", function(){
			var obj = new WorldObject(this.game);
			var state = {x: 5, y: 5, deadly: false};
			obj.loadState(state);

			expect(obj.x).to.eql(state.x);
			expect(obj.y).to.eql(state.y);
		});
		it("load deadly type", function(){
			var obj = new WorldObject(this.game);
			var state = {x: 5, y: 5, deadly: false};
			obj.loadState(state);

			expect(obj.deadly).to.eql(state.deadly);
		});
		it("load hidden type", function(){
			var obj = new WorldObject(this.game);
			var state = {x: 5, y: 5, hidden: true};
			obj.loadState(state);

			expect(obj.hidden).to.eql(state.hidden);
		});
	});

});