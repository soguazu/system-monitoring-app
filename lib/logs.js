/*
 *
 * Library for storing and rotating logs
 *
 */

//Dependencies

var fs = require("fs");
var path = require("path");
var zlib = require("zlib");

//Container

var lib = {};

//Base Directory
lib.baseDir = path.dirname(process.mainModule.filename);
// var path = lib.baseDir + "/.logs" + "/" + dir + "/" + file + ".json";

//Append a string to the file. Create the file if it doesn't exist

lib.append = function(file, str, callback) {
    var path = lib.baseDir + "/.logs" + "/" + file + ".log";
    fs.open(path,'a', function(err, fileDescriptor) {
        if(!err && fileDescriptor) {
            //Append to the file and close it
            fs.appendFile(fileDescriptor, str+'\n', function(err) {
                if (!err) {
                    fs.close(fileDescriptor, function(err) {
                        if(!err) {
                            callback(false);
                        } else {
                            callback('Error closing file that was being appended');
                        }
                    });
                } else {
                    callback('Error appending to the file')
                }
            })
        } else {
            callback('Could not open file for appending');
        }
    })
};

module.exports = lib;
