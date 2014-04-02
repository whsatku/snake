var Primus = require("primus");
var http = require("http");

var server = http.createServer();
var primus = new Primus(server, {
	transformer: "socket.io"
});

var winston = new require("winston");
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
	level: "debug",
	colorize: true
});

var snake = new (require("./snakeserver"))();
snake.motd = "Welcome to Snake Run: Epic Twisted Battle";
snake.bind(primus);
// snake.autoCleanup();
snake.demoServer();

server.listen(45634);
console.log("port 45634");