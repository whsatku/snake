var MockSpark = function(){
	if(!(this instanceof MockSpark)){
		return new MockSpark();
	}
};
MockSpark.prototype.address = {ip: "", port: 0}
MockSpark.prototype.write = function(){
};

// hack
var winston = require("winston");
winston.remove(winston.transports.Console);

module.exports = MockSpark;