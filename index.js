var mongodb = require('mongodb');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('mongoUri', (process.env.MONGOLAB_URI));

var router = express.Router();

router.use(function (request, response, next) {
    console.log('A request is being made:');
    //validate request here
    next();
});

router.route('blobs')
    .get(function (request, response) {
        find('blobs', request, response);
    })
    .post(function (request, response) {
        var documents = [{
            name: request.body.name,
            body: request.body.body,
            created: Date.now()
        }];
        insert('blobs', request, response, documents);
    });


router.get('/', function (request, response) {
    response.json({message: 'hooray!'});
});

app.use('/wikitext', router);

app.listen(app.get('port'), function () {
    console.log('Running on port', app.get('port'));
});


function find(collectionName, request, response) {
    var results = [];
    mongodb.MongoClient.connect(mongoUri, function (err, db) {
        if (err) {
            console.log('Unable to connect to mongodb: ', err);
            response.send(err);
        }
        else {
            console.log('Connected to mongodb!');
            findDocuments(db, collectionName, results, function () {
                db.close();
                response.json(results);
            });
        }
    });
}

function insert(collectionName, request, response, documentsToInsert) {
    mongodb.MongoClient.connect(mongoUri, function (err, db) {
        if (err) {
            console.log('Unable to connect to mongodb: ', err);
            response.send(err);
        }
        else {
            console.log('Connected to mongodb!');
            insertDocuments(db, collectionName, documentsToInsert, function () {
                db.close();
                response.json({message: 'Blob saved!'});
            });
        }
    });
}


function findDocuments(db, collectionName, collectionArray, callback) {
    var cursor = db.collection(collectionName).find();
    cursor.each(function (err, doc) {
        try {
            if (err) {
                console.log('Error reading from mongodb: ', err);
            }
            if (doc != null) {
                console.dir(doc);
                collectionArray.push(doc);
            } else {
                callback();
            }
        }
        catch (ex) {
            console.log(ex);
        }
    });
}

function insertDocuments(db, collectionName, documentsToInsert, callback) {
    var collection = db.collection(collectionName);
    collection.insert(documentsToInsert, function (err, result) {
        try {
            if (err) {
                console.log('Error inserting into %s: ', collectionName, err);
            }
            else {
                console.log('Succesfully inserted into %s: ', collectionName, result);
            }
            callback();
        }
        catch (ex) {
            console.log(ex);
        }
    });
}

