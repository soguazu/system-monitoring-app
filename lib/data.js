var fs = require('fs');
var path = require('path');



//Container
var lib = {};


//base directory

lib.baseDir = path.dirname(process.mainModule.filename);

//write data to file 
lib.create = function(dir, file, data, callback) {
    var path = lib.baseDir + '/.data' + '/' + dir + '/' + file + '.json';
    fs.open(path, 'wx', function(err, fileDescriptor) {
        if (!err && fileDescriptor) {

            //Convert data to string
            var stringData = JSON.stringify(data);
            fs.writeFile(fileDescriptor, stringData, function(err) {
                if (!err) {
                    fs.close(fileDescriptor, function(err) {
                        if(!err) {
                            callback(false);
                        } else {
                            callback('Error closing file');
                        }
                    })
                } else {
                    callback('Error writing to file');
                }
            })

        } else {
            callback('Could not create the file, it may already exist');
        }
    });
}

lib.read = function(dir, file, callback) {
    var path = lib.baseDir + '/.data' + '/' + dir + '/' + file + '.json';
    fs.readFile(path, 'utf8', function(err, data) {
        if (!err) {
            callback(data);
        } else {
            callback(err.message);
        }
    })
} 







//export container
module.exports = lib;