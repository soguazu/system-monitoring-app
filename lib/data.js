var fs = require("fs");
var path = require("path");
var helpers = require("./helpers");

//Container
var lib = {};

//base directory

lib.baseDir = path.dirname(process.mainModule.filename);

//write data to file
lib.create = function(dir, file, data, callback) {
  var path = lib.baseDir + "/.data" + "/" + dir + "/" + file + ".json";
  fs.open(path, "wx", function(err, fileDescriptor) {
    if (!err && fileDescriptor) {
      //Convert data to string
      var stringData = JSON.stringify(data);
      fs.writeFile(fileDescriptor, stringData, function(err) {
        if (!err) {
          fs.close(fileDescriptor, function(err) {
            if (!err) {
              callback(false);
            } else {
              callback("Error closing file");
            }
          });
        } else {
          callback("Error writing to file");
        }
      });
    } else {
      callback("Could not create the file, it may already exist");
    }
  });
};

// Read data from a file
lib.read = function(dir, file, callback) {
  var path = lib.baseDir + "/.data" + "/" + dir + "/" + file + ".json";

  fs.readFile(path, "utf8", function(err, data) {
    if (!err && data) {
      var parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
};

//Updating a file
lib.update = function(dir, file, data, callback) {
  var path = lib.baseDir + "/.data" + "/" + dir + "/" + file + ".json";
  fs.open(path, "r+", function(err, fileDescriptor) {
    if (!err && fileDescriptor) {
      //Convert data to json string
      var stringData = JSON.stringify(data);

      //Truncate the content of that file before writing to it

      fs.ftruncate(fileDescriptor, function(err) {
        if (!err) {
          fs.writeFile(fileDescriptor, stringData, function(err) {
            if (!err) {
              fs.close(fileDescriptor, function(err) {
                if (!err) {
                  callback(false);
                } else {
                  callback("Error closing the existing file");
                }
              });
            } else {
              callback("Error writing to an existing file");
            }
          });
        } else {
          callback("Error cleaning up the file before writing");
        }
      });
    } else {
      callback("Could not open the file for updating, it may not exist..");
    }
  });
};

//Deleting a file
lib.delete = function(dir, file, callback) {
  var path = lib.baseDir + "/.data" + "/" + dir + "/" + file + ".json";

  fs.unlink(path, function(err) {
    if (!err) {
      callback(false);
    } else {
      callback("Error deleting the existing file");
    }
  });
};

//List all the items in a directory
lib.list = function(dir, callback) {
  var path = lib.baseDir + "/.data" + "/" + dir + "/";

  fs.readdir(path, function(err, data) {
    if (!err && data && data.length > 0) {
      var trimmedFilename = [];
      data.forEach(filename => {
        trimmedFilename.push(filename.replace('.json',''));
      });
      callback(false, trimmedFilename); 
    } else{
      callback(err, data); 
    }
  });
};

//export container
module.exports = lib;
