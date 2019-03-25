//Dependencies 
const crypto = require('crypto');
const config = require('./config');
var querystring = require('querystring');
var https = require('https');


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

//Create random alphanumeric character, of a specified length 
helpers.createRandomString  = function(strLength) {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;

    if (strLength) {
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var str = '';

        for (let i = 1; i <=  strLength; i++) {
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str +=  randomCharacter;
        }

        return str;
    } else {
        return false;
    }
}


//Send sms via Twilio 

// @FIXME: fix this twilio API later
helpers.sendTwilioSms =  function(phone, msg, callback) {

    //Validate the parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length  > 0 && msg.trim().length <=  1600 ? msg.trim() : false;
  
    if (phone && msg) {
  
  
      //Configure the request payload
      var payload =  {
        'from': config.twilio.fromPhone,
         'to': '+234'+phone,
         'body': msg
      };
  
      //stringify the payload
      var stringPayload = querystring.stringify(payload);
  
      //Congifure the request
      var requestDetails = {
          'protocol': 'https:',
          'hostname': 'api.twilio.com',
          'method': 'POST',
          'path': '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
          'auth': config.twilio.accountSid+':'+config.twilio.authToken,
          'headers': {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(stringPayload)
          }
      }

      //Instatiate the request details
      var req = https.request(requestDetails, function(res) {
          //Grab the status of the sent request
          var status = res.statusCode;
          //Callback successfully if the request went through
          if (status ==  200 || status == 201) {
            callback(false); 
          } else {
            callback('Status code returned was ' + status); 
          }
      });

      //Bind to the error event so it doesn't get thrown
      req.on('error', function(e) {
          callback(e);
      })

      //Add the payload
      req.write(stringPayload);

      //End the request 
      req.end();
  
    } else {
      callback('Given parameters where missing or invalid');
    }
  } 

module.exports = helpers; 