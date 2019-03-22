/*
 *  Primary file for the API
 */

var http = require("http");
var https = require("https");
var url = require("url");
var StringDecoder = require("string_decoder").StringDecoder;
var fs = require('fs');


var config = require("./config");
var _data = require('./lib/data');



//TESTING

// @TODO delete this
_data.read('test', 08066698729, function(content) {
    console.log(content)
})

// The server should respond to all requests with a string

//Instatiating the HTTP server

var httpServer = http.createServer(function(req, res) {
  unifiedServer(req, res);
});

httpServer.listen(config.httpPort, function() {
  console.log(`The server is listening on port ${config.httpPort}`);
});

//Instatiating the HTTPS server

var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
}

var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, function() {
  console.log(`The server is listening on port ${config.httpsPort}`);
});

var unifiedServer = function(req, res) {
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
      typeof routers[trimmedPath] !== "undefined"
        ? routers[trimmedPath]
        : handlers.notFound;

    var data = {
      trimmedPath: trimmedPath,
      queryParams: queryParams,
      method: method,
      headers: headers,
      payload: buffer
    };
    chosenHandler(data, function(statusCode, payload) {
      //use the status code called back or default
      statusCode = typeof statusCode === "number" ? statusCode : 200;

      //use payload called back or default
      payload = typeof payload === "object" ? data : {};
      res.setHeader("Content-Type", "application/json");

      res.writeHead(statusCode);

      res.end(JSON.stringify(payload));
      //   console.log(payload);
    });
  });
};

//Defining request controllers
var handlers = {};

handlers.ping = function(data, callback) {
    callback(200, data);
}

handlers.sample = function(data, callback) {
  //Callback a http status code and a payload
  callback(406, { sample: "handler" });
};

handlers.notFound = function(data, callback) {
  callback(404);
};

//Defining request routers
var routers = {
  'sample': handlers.sample,
  'ping': handlers.ping
};
