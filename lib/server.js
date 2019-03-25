/*
 *  Primary file for the API
 */

var http = require("http");
var https = require("https");
var url = require("url");
var StringDecoder = require("string_decoder").StringDecoder;
var fs = require("fs");
var path = require("path");

var config = require("./config");
var _data = require("./data");
var handlers = require("./handlers");
var helpers = require("./helpers.js");

var server = {};
//TESTING

// The server should respond to all requests with a string

//Instatiating the HTTP server

server.httpServer = http.createServer(function(req, res) {
  server.unifiedServer(req, res);
});

//Instatiating the HTTPS server
server.httpsServerOptions = { 
  key: fs.readFileSync(path.join(__dirname,"/../https/key.pem")),
  cert: fs.readFileSync(path.join(__dirname,"/../https/cert.pem"))
};

server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res) {
  server.unifiedServer(req, res);
});

server.unifiedServer = function(req, res) {
  //Get the URL and parse it
  var parsedUrl = url.parse(req.url, true);

  //Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, "");

  //Getting the query string as an object
  var queryParams = parsedUrl.query;

  //Get the HTTP method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  //Get the payload if there is any
  var decoder = new StringDecoder("utf-8");
  var buffer = "";

  req.on("data", data => {
    buffer += decoder.write(data);
  });

  req.on("end", () => {
    buffer += decoder.end();

    var chosenHandler =
      typeof server.routers[trimmedPath] !== "undefined"
        ? server.routers[trimmedPath]
        : handlers.notFound;

    var data = {
      trimmedPath: trimmedPath,
      queryParams: queryParams,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer)
    };
    chosenHandler(data, function(statusCode, payload) {
      //use the status code called back or default
      statusCode = typeof statusCode === "number" ? statusCode : 200;

      //use payload called back or default
      payload = typeof payload === "object" ? payload : {};

      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);
      res.setHeader("Content-Type", "application/json");

      res.writeHead(statusCode);

      res.end(payloadString);
      // console.log(data.headers.token);
    });
  });
};

//Defining request controllers

//Defining request routers
server.routers = {
  sample: handlers.sample,
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks
};

server.init = function() {
  //start the http server
  server.httpServer.listen(config.httpPort, function() {
    console.log(`The server is listening on port ${config.httpPort}`);
  });

  //Starting the Https server
  server.httpsServer.listen(config.httpsPort, function() {
    console.log(`The server is listening on port ${config.httpsPort}`);
  });
};

module.exports = server;
