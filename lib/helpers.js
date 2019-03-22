//Dependencies 
const crypto = require('crypto');
const config = require('./config');


//container
var helpers = {};

helpers.hash = function(str) {
    if (typeof(str) == 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
}

helpers.parseJsonToObject = function(buffer) {
    try {
        var obj = JSON.parse(buffer);
        return obj;
    } catch(e) {
        return {};
    }
}

module.exports = helpers; 