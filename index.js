#!/usr/bin/env node

var httpProxy = require('http-proxy'),
    auth = require('basic-auth'),
    argv = require('optimist').argv,
    port = argv.port || 8080;

var help = [
    "usage: basic-auth-proxy [options] target_host[:port]",
    "       route requests through to a target host requiring basic-auth",
    "",
    "Options:",
    "  --username   USER        User name",
    "  --password   PASSWORD    Password",
    "  --port       PORT        Port that the proxy server should run on",
    "  -h, --help               Help"
].join('\n');

if (argv.h || argv.help || argv._.length !== 1) {
  return console.log(help);
}

function splitHostPort(hostPort) {
    var location = hostPort.split(':'),
        port = location.length === 1 ? 80 : parseInt(location[1], 10);

    return {
        host: location[0],
        port: port
    };
}

var target = splitHostPort(argv._[0]);

httpProxy.createServer({changeOrigin: true}, function (req, res, proxy) {
    var credentials = auth(req);

    if (!credentials || credentials.name !== argv.username || credentials.pass !== argv.password) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="something"');
        res.end('Access denied');
    } else {
        proxy.proxyRequest(req, res, {
            host: target.host,
            port: target.port
        });
    }
}).listen(port);

console.log("Listening on http://localhost:" + port);
