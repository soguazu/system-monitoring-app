var handlers = {};

handlers.ping = function(data, callback) {
  callback(200, data);
};

handlers.sample = function(data, callback) {
  //Callback a http status code and a payload
  callback(406, { sample: "handler" });
};

handlers.notFound = function(data, callback) {
  callback(404);
};


module.exports = handlers;