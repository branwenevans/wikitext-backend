var mongodb = require('mongodb');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('mongoUri', (process.env.MONGOLAB_URI));

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

var findBlobs = function (db, callback) {
    var cursor = db.collection('blobs').find();
    cursor.each(function (err, doc) {
        if (err) {
            console.log('Error reading from mongodb: ', err);
        }
        if (doc != null) {
            console.dir(doc);
        } else {
            callback();
        }
    });
};

app.get('/db', function (request, response) {
    response.send('Reading some data!');

    var collectionName = 'blobs';

    try {
        mongodb.MongoClient.connect(app.get('mongoUri'), function (err, db) {
            if (err) {
                console.log('Unable to connect to mongodb: ', err);
            }
            else {
                console.log('Connected to mongodb!');
                findBlobs(db, function() {
                    db.close();
                });
            }
        });
    }
    catch (ex) {
        console.log("fsafsadfassdfasgadgha;oeihtogadfb;obihdafog ", ex);
        throw ex;
    }
});


function insertDocuments(collectionName, documentsToInsert) {
    mongodb.MongoClient.connect(app.get('mongoUri'), function (err, db) {
        if (err) {
            console.log('Unable to connect to mongodb: ', err);
        }
        else {
            console.log('Connected to mongodb!');
            var collection = db.collection(collectionName);
            collection.insert(documentsToInsert, function (err, result) {
                try {
                    if (err) {
                        console.log('Error inserting into %s: ', collectionName, err);
                    }
                    else {
                        console.log('Succesfully inserted into %s: ', collectionName, result);
                    }
                }
                catch (ex) {
                    console.log(ex);
                }
                finally {
                    db.close();
                }
            });
        }
    });
}

app.get('/insert', function (request, response) {
    response.send('Inserting some data!');

    var collectionName = 'blobs';

    var documentsToInsert = [{
        name: 'testBlob',
        head: 'Hello Blob',
        body: 'This is some testing text!!',
        created: Date.now()
    }];
    insertDocuments(collectionName, documentsToInsert);
});

