var net = require("net");
var HTTPParser = process.binding("http_parser").HTTPParser;
var url = require("url");
var fs = require("fs");
var crypto = require("crypto");
var constants = process.binding("constants");

var mimeTypes = {
  "aiff": "audio/x-aiff",
  "arj": "application/x-arj-compressed",
  "asf": "video/x-ms-asf",
  "asx": "video/x-ms-asx",
  "au": "audio/ulaw",
  "avi": "video/x-msvideo",
  "bcpio": "application/x-bcpio",
  "ccad": "application/clariscad",
  "cod": "application/vnd.rim.cod",
  "com": "application/x-msdos-program",
  "cpio": "application/x-cpio",
  "cpt": "application/mac-compactpro",
  "csh": "application/x-csh",
  "css": "text/css",
  "deb": "application/x-debian-package",
  "dl": "video/dl",
  "doc": "application/msword",
  "drw": "application/drafting",
  "dvi": "application/x-dvi",
  "dwg": "application/acad",
  "dxf": "application/dxf",
  "dxr": "application/x-director",
  "etx": "text/x-setext",
  "ez": "application/andrew-inset",
  "fli": "video/x-fli",
  "flv": "video/x-flv",
  "gif": "image/gif",
  "gl": "video/gl",
  "gtar": "application/x-gtar",
  "gz": "application/x-gzip",
  "hdf": "application/x-hdf",
  "hqx": "application/mac-binhex40",
  "html": "text/html",
  "ice": "x-conference/x-cooltalk",
  "ico": "image/x-icon",
  "ief": "image/ief",
  "igs": "model/iges",
  "ips": "application/x-ipscript",
  "ipx": "application/x-ipix",
  "jad": "text/vnd.sun.j2me.app-descriptor",
  "jar": "application/java-archive",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "js": "text/javascript",
  "json": "application/json",
  "latex": "application/x-latex",
  "lsp": "application/x-lisp",
  "lzh": "application/octet-stream",
  "m": "text/plain",
  "m3u": "audio/x-mpegurl",
  "man": "application/x-troff-man",
  "manifest": "text/cache-manifest",
  "me": "application/x-troff-me",
  "midi": "audio/midi",
  "mif": "application/x-mif",
  "mime": "www/mime",
  "movie": "video/x-sgi-movie",
  "mp4": "video/mp4",
  "mpg": "video/mpeg",
  "mpga": "audio/mpeg",
  "ms": "application/x-troff-ms",
  "nc": "application/x-netcdf",
  "oda": "application/oda",
  "ogm": "application/ogg",
  "pbm": "image/x-portable-bitmap",
  "pdf": "application/pdf",
  "pgm": "image/x-portable-graymap",
  "pgn": "application/x-chess-pgn",
  "pgp": "application/pgp",
  "pm": "application/x-perl",
  "png": "image/png",
  "pnm": "image/x-portable-anymap",
  "ppm": "image/x-portable-pixmap",
  "ppz": "application/vnd.ms-powerpoint",
  "pre": "application/x-freelance",
  "prt": "application/pro_eng",
  "ps": "application/postscript",
  "qt": "video/quicktime",
  "ra": "audio/x-realaudio",
  "rar": "application/x-rar-compressed",
  "ras": "image/x-cmu-raster",
  "rgb": "image/x-rgb",
  "rm": "audio/x-pn-realaudio",
  "rpm": "audio/x-pn-realaudio-plugin",
  "rtf": "text/rtf",
  "rtx": "text/richtext",
  "scm": "application/x-lotusscreencam",
  "set": "application/set",
  "sgml": "text/sgml",
  "sh": "application/x-sh",
  "shar": "application/x-shar",
  "silo": "model/mesh",
  "sit": "application/x-stuffit",
  "skt": "application/x-koan",
  "smil": "application/smil",
  "snd": "audio/basic",
  "sol": "application/solids",
  "spl": "application/x-futuresplash",
  "src": "application/x-wais-source",
  "stl": "application/SLA",
  "stp": "application/STEP",
  "sv4cpio": "application/x-sv4cpio",
  "sv4crc": "application/x-sv4crc",
  "svg": "image/svg+xml",
  "swf": "application/x-shockwave-flash",
  "tar": "application/x-tar",
  "tcl": "application/x-tcl",
  "tex": "application/x-tex",
  "texinfo": "application/x-texinfo",
  "tgz": "application/x-tar-gz",
  "tiff": "image/tiff",
  "tr": "application/x-troff",
  "tsi": "audio/TSP-audio",
  "tsp": "application/dsptype",
  "tsv": "text/tab-separated-values",
  "txt": "text/plain",
  "unv": "application/i-deas",
  "ustar": "application/x-ustar",
  "vcd": "application/x-cdlink",
  "vda": "application/vda",
  "vivo": "video/vnd.vivo",
  "vrm": "x-world/x-vrml",
  "wav": "audio/x-wav",
  "wax": "audio/x-ms-wax",
  "wma": "audio/x-ms-wma",
  "wmv": "video/x-ms-wmv",
  "wmx": "video/x-ms-wmx",
  "wrl": "model/vrml",
  "wvx": "video/x-ms-wvx",
  "xbm": "image/x-xbitmap",
  "xlw": "application/vnd.ms-excel",
  "xml": "text/xml",
  "xpm": "image/x-xpixmap",
  "xwd": "image/x-xwindowdump",
  "xyz": "chemical/x-pdb",
  "zip": "application/zip"
};

var _GET = "GET";
var _HEAD = "HEAD";
var _POST = "POST";
var _PUT = "PUT";
var _DELETE = "DELETE";
var _IF_MODIFIED = "if-modified-since";
var _ETAG = "etag";
var _RANGE = "range";
var _IF_RANGE = "if-range";
var _OK_STATUS = "HTTP/1.1 200 OK\r\n";
var _NOT_MODIFIED_STATUS = "HTTP/1.1 304 Not Modified\r\n";

function f2s(file, socket, off, chunksize, chunked, cb) {
	var fd = file.fd;
	var len = file.size;
	file.written = 0;
	var chunksize = len < chunksize?len:chunksize;
	function chunk() {
		try {
			if(chunked) {
				if(socket.fd) {
					if(off + chunksize > len) {
						chunksize = len - off;
					}
					socket.write(chunksize.toString(16) + "\r\n", "ascii", function() {
						fs.sendfile(socket.fd, fd, off, chunksize, function(ex, written) {
							if(ex && (ex.errno == constants.EAGAIN)) {
								socket.once("drain", chunk);
								socket._writeWatcher.start();
							}
							else if(ex) {
								cb(ex);
							}
							else {
								socket.write("\r\n", "ascii", function() {
									file.written += written;
									if(file.written < len) {
										off += written;
										process.nextTick(chunk);
									}
									else {
										socket.write("0\r\n\r\n");
										cb(null, file);
									}
								});
							}
						});
					});
				}
				else {
					cb(new Error("socket not connected"));
				}
			}
			else {
				if(socket.fd) {
					fs.sendfile(socket.fd, fd, off, len, function(ex, written) {
						if(ex && (ex.errno == constants.EAGAIN)) {
							socket.once("drain", chunk);
							socket._writeWatcher.start();
						}
						else if(ex) {
							cb(ex);
						}
						else {
							file.written += written;
							if(file.written < len) {
								off += written;
								process.nextTick(chunk);
							}
							else {
								cb(null, file);
							}
						}
					});
				}
				else {
					cb(new Error("socket not connected"));
				}
			}
		}
		catch(ex) {
			cb(ex);
		}
	}
	chunk();
}

function getCredentials(cred) {
	var obj = {};
	for(name in cred) {
		switch(name) {
			case "key":
			case "cert":
				obj[name] = fs.readFileSync(cred[name]);
				break;
			default:
				obj[name] = cred[name];
				break;
		}
	}
	return obj;
}

function getServer(options, cb) {
	if(options.secure) {
		return require("tls").createServer(getCredentials(options.credentials), cb);
	}
	else {
		return net.createServer(cb);
	}
}

var openfiles = {};
var urlcache = {};

function parseURL(fullpath) {
	var myurl = urlcache[fullpath];
	if(!myurl) {
		myurl = url.parse(fullpath, true);
		myurl.pathname = decodeURIComponent(myurl.pathname);
		urlcache[fullpath] = myurl;
	}
	return myurl;
}

function decodeHTTPBasic(headerValue)
{
	var value;
	if (value = headerValue.match("^Basic\\s([A-Za-z0-9+/=]+)$"))
	{
		var auth = (new Buffer(value[1] || "", "base64")).toString("ascii");
		return {
			username : auth.slice(0, auth.indexOf(':')),
			password : auth.slice(auth.indexOf(':') + 1, auth.length)
		};
	}
	else
	{
		return null;
	}
}

function loadFile(fn, cb, cachecontrol) {
	var file = null;
	if(openfiles[fn]) {
		cb(null, openfiles[fn]);
		return;
	}
	try {
		var fd = fs.openSync(fn, "r");
		var fstat = fs.fstatSync(fd);
    	var extension = fn.split(".").pop();
		var cachecontrol = cachecontrol || "public, max-age=3600, s-maxage=3600";
		file = {
			path: fn,
			size: fstat.size,
			fd: fd,
			mime: mimeTypes[extension] || "application/octet-stream",
			modified: Date.parse(fstat.mtime),
			stat: fstat
		};
		file.etag = [fstat.ino.toString(16), fstat.size.toString(16), Date.parse(fstat.mtime).toString(16)].join("-");
		file.headers = "Accept-Ranges: bytes\r\nCache-Control: " + cachecontrol + "\r\nEtag: " + file.etag + "\r\nLast-Modified: " + new(Date)(fstat.mtime).toUTCString() + "\r\nConnection: Keep-Alive\r\nContent-Type: " + file.mime + "\r\n\r\n";
		fs.watchFile(fn, { persistent: false, interval: 3000 }, function (curr, prev) {
			if(Date.parse(curr.mtime) === Date.parse(prev.mtime)) {
				var f = openfiles[fn];
				f.modified = Date.parse(curr.mtime);
				f.size = curr.size;
				f.etag = [curr.ino.toString(16), curr.size.toString(16), Date.parse(curr.mtime).toString(16)].join("-")
				f.headers = "Accept-Ranges: bytes\r\nCache-Control: public, max-age=3600, s-maxage=1200, must-revalidate\r\nEtag: " + f.etag + "\r\nLast-Modified: " + new(Date)(curr.mtime).toUTCString() + "\r\nConnection: Keep-Alive\r\nContent-Type: " + f.mime + "\r\n\r\n";
			}
		});
		openfiles[fn] = file;
		cb(null, file);
	}
	catch(ex) {
		cb(ex, file);
	}
}

function Connection() {
	this.id = 0;
	this.socket = null;
}

Connection.prototype.write = function(o, cb) {
	if(this.socket.fd && this.socket.writable) {
		this.socket.write(o, cb);
	}
	else {
		cb(new Error("not writable"));
	}
}

function IncomingMessage() {
	this.url = "";
	this.headers = {};
	this.info = null;
	this.complete = false;
}

function Server(options) {
	var _server = this;
	var _errorHandler = null;
	var logger = options.logger;
	var _connections = {};
	var nextconn = 0;
	
	var parsers = [];
	
	options.maxconn = options.maxconn || 1000;
	options.index = options.index || "index.html";
	
	var httpd = getServer(options, function (socket) {
		var thisfd = socket.fd;
		var connection = new Connection();
		connection.id = nextconn++;
		connection.socket = socket;
		_connections[connection.id] = connection;
		socket.setNoDelay(options.nodelay);
		if(options.timeout) {
			socket.setTimeout(options.timeout, function() {
				if(logger) logger.debug("jhttpd.socket.timeout", {fd: thisfd, remoteAddress: socket.remoteAddress});
				socket.end();
			});
		}
		socket.on("error", function(err) {
			if(logger) logger.error("jhttpd.socket.error", {fd: thisfd, err: err});
			if(connection.onError) connection.onError(err, connection);
			socket.end();
		});

		socket.on("end", function() {
			if(logger) logger.debug("jhttpd.socket.end", {fd: thisfd});
			if(connection.onEnd && !connection.ended) {
				connection.onEnd(connection);
				delete _connections[connection.id];
				connection.ended = true;
			}
			if(parser) {
				parser.incoming = null;
				parser.reinitialize("request");
				parsers.push(parser);
				parser = null;
			}
		});

		socket.on("close", function() {
			if(logger) logger.debug("jhttpd.socket.close", {fd: thisfd});
			if(connection.onEnd && !connection.ended) {
				connection.onEnd(connection);
				delete _connections[connection.id];
				connection.ended = true;
			}
			if(parser) {
				parser.incoming = null;
				parser.reinitialize("request");
				parsers.push(parser);
				parser = null;
			}
		});
		
		if(_server.onConnection) {
			if(!_server.onConnection(connection)) return;
		}
		var parser = parsers.shift();
		if(!parser) parser = new HTTPParser("request");
		connection.upgrade = function() {
			// free the parser and the incoming http message
			if(parser) {
				parser.incoming = null;
				parser.reinitialize("request");
				parsers.push(parser);
				//parser = null;
			}
		}

		socket.ondata = function(buffer, start, end) {
			var read = parser.execute(buffer, start, end-start);
			if(connection.onBody && !parser.incoming.complete && (read < (end - start))) {
				connection.onBody(parser.incoming, buffer, start + read + 1, end - (read + start + 1));
			}
		}

		connection.sendFile = function(request, cb, cachecontrol) {
			var fn = options.home + request.url.pathname;
			if(fn.indexOf("..") > -1) {
				cb(new Error("Illegal Path"));
				return;
			}
 			if ("/" === fn[fn.length - 1]) fn += options.index;
			loadFile(fn, function(err, file) {
				if(err) {
					cb(err, file);
					return;
				}
				var statusLine = _OK_STATUS;
				file.status = 200;
				var isHead = (request.info.method === "HEAD");
				var sendbody = !isHead;
				if((_ETAG in request.headers)) {
					if(file.etag === request.headers[_ETAG][0]) {
						file.status = 304;
						statusLine = _NOT_MODIFIED_STATUS; 
						sendbody = false;
					}
				}
				else if((_IF_MODIFIED in request.headers)) {
					if(file.modified <= Date.parse(request.headers[_IF_MODIFIED][0])) {
						file.status = 304;
						statusLine = _NOT_MODIFIED_STATUS; 
						sendbody = false;
					}
				}
				request.chunked = request.chunked && options.sendfile;
				if(isHead) {
					statusLine += "Content-Length: " + file.size + "\r\n";
				}
				else if(request.chunked && sendbody) {
					statusLine += "Transfer-Encoding: chunked\r\n";
				}
				else if(sendbody) {
					statusLine += "Content-Length: " + file.size + "\r\n";
				}
				else {
					statusLine += "Content-Length: 0\r\n";
				}
				socket.write(statusLine + file.headers, "ascii", function() {
					if(!sendbody) {
						file.written = 0;
						cb(null, file);
						return;
					}
					if(options.sendfile && !options.secure) {
						f2s(file, socket, 0, 4096, request.chunked, cb);
					}
					else {
						file.written = 0;
						fs.createReadStream(fn, {
							flags: "r",
							mode: 0666
						}).on("data", function (chunk) {
							file.written += chunk.length;
						}).on("close", function () {
							cb(null, file);
						}).on("error", function (err) {
							cb(err);
						}).pipe(socket, { end: false });
					}
				});
			}, cachecontrol);
		}
		
		parser.onMessageBegin = function() {
			parser.incoming = new IncomingMessage();
			if(logger) logger.debug("jhttpd.onMessageBegin", {fd: thisfd});
			parser.incoming.socket = socket;
		}
	
		parser.onURL = function (b, start, len) {
			parser.incoming.url += b.toString("ascii", start, start+len);
		};
	
		parser.onHeaderField = function (b, start, len) {
			var slice = b.toString('ascii', start, start+len).toLowerCase();
			if (parser.value != undefined) {
				var dest = parser.incoming.headers;
				if (parser.field in dest) {
					dest[parser.field].push(parser.value);
				} else {
					dest[parser.field] = [parser.value];
				}
				parser.field = "";
				parser.value = "";
			}
			if (parser.field) {
				parser.field += slice;
			} else {
				parser.field = slice;
			}
		};
		
		parser.onHeaderValue = function (b, start, len) {
			var slice = b.toString('ascii', start, start+len);
			if (parser.value) {
				parser.value += slice;
			} else {
				parser.value = slice;
			}
		};
	
		parser.onHeadersComplete = function (info) {
			parser.incoming.url = parseURL(parser.incoming.url);
			if (parser.field && (parser.value != undefined)) {
				var dest = parser.incoming.headers;
				if (parser.field in dest) {
					dest[parser.field].push(parser.value);
				} else {
					dest[parser.field] = [parser.value];
				}
				parser.field = null;
				parser.value = null;
			}
			parser.incoming.info = info;
			if(logger) logger.debug("jhttpd.onHeadersComplete", {fd: thisfd, info: parser.incoming.info, headers: parser.incoming.header, url: parser.incoming.url});
			var request = parser.incoming;
			if(connection.onAuth) {
				switch(connection.authType) {
					case "basic":
					default:
						if("authorization" in request.headers) {
							connection.credentials = decodeHTTPBasic(request.headers["authorization"][0]);
							connection.onAuth(request, function(ok) {
								if(!ok) {
									request.socket.write("HTTP/1.1 401 Not Authorized\r\nContent-Length: 0\r\nConnection: Keep-Alive\r\nWWW-Authenticate: Basic realm=\"" + connection.authRealm + "\"\r\n\r\n", "ascii");
									request.socket.end();
									request.complete = true;
								}
							});
						}
						else {
							request.socket.write("HTTP/1.1 401 Not Authorized\r\nContent-Length: 0\r\nConnection: Keep-Alive\r\nWWW-Authenticate: Basic realm=\"" + connection.authRealm + "\"\r\n\r\n", "ascii");
							request.socket.end();
							request.complete = true;
						}
						break;
				}
			}
			else {
				if(connection.onRequestHeaders) connection.onRequestHeaders(parser.incoming);
			}
		}
	
		parser.onBody = function(buffer, start, len) {
			if(connection.onBody && !parser.incoming.complete) {
				connection.onBody(parser.incoming, buffer, start, len);
			}
		}
		
		parser.onMessageComplete = function () {
			if(logger) logger.debug("jhttpd.onMessageComplete", {fd: thisfd});
			if(connection.onRequestComplete && !parser.incoming.complete) connection.onRequestComplete(parser.incoming);
			//parser.incoming.complete = true;
		}
	});
	
	_server.parsers = parsers;
	_server.httpd = httpd;
	
	httpd.maxConnections = options.maxconn;
	
	_server.listen = function() {
		if(!httpd.fd) {
			if(_server.onError) httpd.once("error", _server.onError);
			httpd.once("listening", function() {
				if(logger) logger.info("jhttpd.server.listen", httpd.address());
				if(_server.onListen) _server.onListen(httpd.address());
			});
			httpd.once("close", function() {
				if(logger) logger.info("jhttpd.server.close");
				if(_server.onClose) _server.onClose();
			});
			if(options.multi) {
				var nodes = require("multi-node").listen({
					port: options.port,
					host: options.host,
					nodes: options.multi.nodes,
					masterListen: options.multi.masterListen
				}, httpd);
				if(_server.onMulti) _server.onMulti(nodes);
			}
			else {
				httpd.listen(options.port, options.host);
			}
		}
		else {
			if(_server.onListen) _server.onListen(httpd.address());
		}
	};
	
	_server.close = function() {
		if(logger) logger.debug("jhttpd.server.close", httpd.address());
		httpd.close();
	};

	_server.shutdown = function() {
		if(logger) logger.debug("jhttpd.server.shutdown", httpd.address());
		//TODO: look at this...
		for(id in _connections) {
			var connection = _connections[id];
			if(connection.socket.fd) {
				connection.socket.end();
			}
		}
		httpd.close();
	};
}
exports.server = Server;
exports.mime = mimeTypes;