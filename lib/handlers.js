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
    _data.read("users", phone, function(err, data) {
      if (!err && data) {
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
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
      //look up the user;
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
          callback(400, { message: "The specified user doesn't not exist" });
        }
      });
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
