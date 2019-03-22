const _data = require("./data");
const helpers = require("./helpers");

var handlers = {};

//Users
handlers.users = function(data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"];

  if (acceptableMethods.indexOf(data.method) > -1) {
    //A submethod to the users hanlders to holds CRUD object methods
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._users = {};

//Required data: firstname, lastname, phone, password, tosAgreement
//Optional data: none
handlers._users.post = function(data, callback) {
  // Check that all required fields are filled out
  var firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  var lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  var tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure the user doesnt already exist
    _data.read("users", phone, function(err, data) {
      if (err) {
        // Hash the password
        var hashedPassword = helpers.hash(password);

        // Create the user object
        if (hashedPassword) {
          var userObject = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            hashedPassword: hashedPassword,
            tosAgreement: true
          };

          // Store the user
          _data.create("users", phone, userObject, function(err) {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: "Could not create the new user" });
            }
          });
        } else {
          callback(500, { Error: "Could not hash the user's password." });
        }
      } else {
        // User alread exists
        callback(400, {
          Error: "A user with that phone number already exists"
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

//Users - get
//Required data: phone
//Optional data: none
// @TODO: Only allow authenticated user access there own objects

handlers._users.get = function(data, callback) {
  var phone =
    typeof data.queryParams.phone == "string" &&
    data.queryParams.phone.trim().length == 10
      ? data.queryParams.phone.trim()
      : false;

  if (phone) {
    //Get token from the header
    var token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    //Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, function(isTokenValid) {
      if (isTokenValid) {
        _data.read("users", phone, function(err, data) {
          if (!err && data) {
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {
          message: "Missing required token in header or token is invalid"
        });
      }
    });
  } else {
    callback(400, { message: "Missing required field" });
  }
};

//User - put
//Required data: phone
//Optional data: firstName, lastName, password (at least one of them must be required);
// @TODO: Only allow authenticated user access there own objects
handlers._users.put = function(data, callback) {
  //Check for required field
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;

  //Check for optional fields

  var firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;

  var lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;

  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (phone) {
    //validate optional fields
    if (firstName || lastName || password) {
      var token =
        typeof data.headers.token == "string" ? data.headers.token : false;

      handlers._tokens.verifyToken(token, phone, function(isTokenValid) {
        if (isTokenValid) {
          _data.read("users", phone, function(err, userData) {
            if (!err && userData) {
              //update the fields
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }

              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }

              _data.update("users", phone, userData, function(err) {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { message: "Could not update the user" });
                }
              });
            } else {
              callback(400, {
                message: "The specified user doesn't not exist"
              });
            }
          });
        } else {
          callback(403, {
            message: "Missing required token in header or token is invalid"
          });
        }
      });
      //look up the user;
    } else {
      callback(400, { message: "Missing fields to update" });
    }
  } else {
    callback(400, { message: "Missing required field" });
  }
};

//Users - delete
//Required data: phone
//Optional data: none
// @TODO: Only allow authenticated user access there own objects
// @TODO: cleanup (delete) any data files associated with this user

handlers._users.delete = function(data, callback) {
  var phone =
    typeof data.queryParams.phone == "string" &&
    data.queryParams.phone.trim().length == 10
      ? data.queryParams.phone.trim()
      : false;

  if (phone) {
    var token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    handlers._tokens.verifyToken(token, phone, function(isTokenValid) {
      if (isTokenValid) {
        _data.read("users", phone, function(err, data) {
          if (!err && data) {
            _data.delete("users", phone, function(err) {
              if (!err) {
                callback(200);
              } else {
                callback(500, "Could not delete the specified user");
              }
            });
          } else {
            callback(400, { message: "Could not find specified user" });
          }
        });
      } else {
        callback(403, {
          message: "Missing required token in header or token is invalid"
        });
      }
    });
  } else {
    callback(400, { message: "Missing required field" });
  }
};

//tokens
handlers.tokens = function(data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"];

  if (acceptableMethods.indexOf(data.method) > -1) {
    //A submethod to the users hanlders to holds CRUD object methods
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._tokens = {};

//Token - post
//Required data: phone, password
//Optional data: none
handlers._tokens.post = function(data, callback) {
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  if (phone && password) {
    //Look up the user who matches the phone number
    _data.read("users", phone, function(err, userData) {
      if (!err && userData) {
        //hash the passed password and compare it with the stored userData.password
        var hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashedPassword) {
          //if valid a new token with a random name. set expiration date 1 hour in future
          var tokenId = helpers.createRandomString(20);
          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            phone: phone,
            id: tokenId,
            expires: expires
          };

          //Store the token

          _data.create("tokens", tokenId, tokenObject, function(err) {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { message: "Could not create the new token" });
            }
          });
        } else {
          callback(400, { message: "incorrect phone or password" });
        }
      } else {
        callback(400, { message: "Could not find the specified user" });
      }
    });
  } else {
    callback(400, { message: "messing required fields" });
  }
};

//Token - get
//Required Data: id
//Optional data: none
handlers._tokens.get = function(data, callback) {
  var id =
    typeof data.queryParams.id == "string" &&
    data.queryParams.id.trim().length == 20
      ? data.queryParams.id.trim()
      : false;

  if (id) {
    //Lookup the token
    _data.read("tokens", id, function(err, tokenData) {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { message: "Missing required field" });
  }
};

//Tokens put
//Required data: id, extend
//Optional data: none
handlers._tokens.put = function(data, callback) {
  var id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;

  var extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? true
      : false;

  if (id && extend) {
    _data.read("tokens", id, function(err, tokenData) {
      if (!err && tokenData) {
        //Check if token has expired
        if (tokenData.expires > Date.now()) {
          //Set token to expires 1 hour from now (extend the expiration time)
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          //Persisit the data
          _data.update("tokens", id, tokenData, function(err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, {
                message: "Could not update the token's expiration"
              });
            }
          });
        } else {
          callback(400, {
            message: "Token has already expired and cannot be extended"
          });
        }
      } else {
        callback(400, { message: "Specified token doesn't exist" });
      }
    });
  } else {
    callback(400, {
      message: "Missing some required field(s) or field(s) are invalid"
    });
  }
};

//Token - delete
//Required data: id
//Optional data: none
handlers._tokens.delete = function(data, callback) {
  var id =
    typeof data.queryParams.id == "string" &&
    data.queryParams.id.trim().length == 20
      ? data.queryParams.id.trim()
      : false;

  if (id) {
    _data.read("tokens", id, function(err, tokenData) {
      if (!err && tokenData) {
        _data.delete("tokens", id, function(err) {
          if (!err) {
            callback(200);
          } else {
            callback(500, "Could not delete the specified token");
          }
        });
      } else {
        callback(400, { message: "Could not find specified token" });
      }
    });
  } else {
    callback(400, { message: "Missing required field" });
  }
};

//Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function(id, phone, callback) {
  //lookup the token
  _data.read("tokens", id, function(err, tokenData) {
    if (!err && tokenData) {
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

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
