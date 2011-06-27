var f2d = require("../f2d");

var options = {
	secure: false,
	maxconn: 1000,
	host: "0.0.0.0",
	port: 80,
	home: "examples/home",
	nodelay: true,
	sendfile: true,
// if you have node-multi installed you can comment this in to get multi processor support
// with multi-node, a master process will listen on the specified port and the kernel will load balance
// requests "automagically" across all children
/*
	multi: {
		nodes: 4,
		masterListen: false,
	}
*/
	index: "index.html"
}

function connectionHandler(connection) {
	connection.onRequestComplete = function(request) {
		connection.sendFile(request, function(err, file) {
			if(err) {
				connection.write("HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: Keep-Alive\r\n\r\n");
				return;
			}
		}, "public, max-age=3600, s-maxage=3600, must-revalidate");
	};
	return true;
}

function listenHandler(address) {
	console.log("listen: " + JSON.stringify(address));
}

function errorHandler(err) {
	console.log("error: " + JSON.stringify(err));
}

var httpd = new f2d.server(options);
httpd.onConnection = connectionHandler;
httpd.onError = errorHandler;
httpd.onListen = listenHandler;
httpd.listen();
