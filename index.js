var cool = require('cool-ascii-faces');
var mongodb = require('mongodb');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
    response.render('pages/index')
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

app.get('/cool', function (request, response) {
    response.send(cool());
    var uri = 'mongodb://heroku_5zwwx9n1:j9s6g90476417qbdum0qkidjfm@ds033123.mongolab.com:33123/heroku_5zwwx9n1';

    mongodb.MongoClient.connect(uri, function (err, db) {

        if (err) {
            console.log('Unable to connect to mongodb: ', err);
        }
        else {
            console.log('Connected to mongodb!');

            var blobsToInsert = [{name: 'testBlob', head: 'Hello Blob', body: 'This is some testing text!!'}];

            insertIntoCollection('blobs', blobsToInsert);

            db.close();
        }

    });
});

function insertIntoCollection(collectionName, itemsToInsert) {
    var collection = db.collection(collectionName);

    collection.insert(itemsToInsert, function (err, result) {
        if (err) {
            console.log('Error inserting into %s: ', collectionName, err);
        }
        else {
            console.log('Succesfully inserted into %s: ', collectionName, result);
        }
    });
}


