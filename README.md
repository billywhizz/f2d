# f2d
an experimental node.js web server with support for sendfile static file serving

## Summary
* sendfile for static files
* file metadata/headers are cached so they don't have to be regenerated on every request
* fs.watchFile used to monitor for changes in cached files so no need to reboot server if static files change

## Dependencies
No dependencies other than node.js > 0.4.0 (has only been tested on 0.4.8 or greater so let me know of issues on other versions)

## Usage
see examples/static.js

## Todo
* gzip support
* pluggable protocol support for websockets/fastcgi etc
* virtual hosts
* url rewriting
* pluggable authentication (http basic/digest etc)