/*
 *  Primary file for the API
 */

var http = require("http");
var url = require("url");
var StringDecoder = require("string_decoder").StringDecoder;

// The server should respond to all requests with a string

//Start the server and have it listen on port 3000

var server = http.createServer(function(req, res) {
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
      res.writeHead(statusCode);

      res.end(JSON.stringify(payload));
    });

    //Log the request path
    // console.log('Request received on path: ' + trimmedPath + ' with this method: ' + method + 'and  with this query paramters: ', queryParams, ' with this headers: ', headers);

    // console.log('Request was received with payload: ', buffer);
  });
});

server.listen(3000, function() {
  console.log("The server is listening on port 3000 now");
});

//Defining request controllers
var handlers = {};

handlers.sample = function(data, callback) {
  //Callback a http status code and a payload
  callback(406, { sample: "handler" });
};

handlers.notFound = function(data, callback) {
  callback(404);
};

//Defining request routers
var routers = {
  sample: handlers.sample
};
