var Primus = require("primus");
var http = require("http");

var server = http.createServer();
var primus = new Primus(server, {
	transformer: "socket.io"
});

var snake = new require("./snakeserver")();
snake.bind(primus);
snake.autoCleanup();

server.listen(45634);
console.log("port 45634");