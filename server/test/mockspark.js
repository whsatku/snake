var sinon = require("sinon");

var MockSpark = function(){
	if(!(this instanceof MockSpark)){
		return new MockSpark();
	}
	this.write = sinon.spy();
	this.id = Math.random().toString();
};
MockSpark.prototype.address = {ip: "", port: 0}

// hack
var winston = require("winston");
winston.remove(winston.transports.Console);

module.exports = MockSpark;