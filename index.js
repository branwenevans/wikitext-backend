var mongodb = require('mongodb');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));
app.set('mongoUri', (process.env.MONGOLAB_URI));

var router = express.Router();

router.use(function (request, response, next) {
    console.log('A request is being made:');
    //validate request here
    next();
});

router.get('/', function (request, response) {
    response.json({message: 'hooray!'});
});

router.route('/blobs')
    .post(function (request, response) {
        console.log(request.body);
        var documents = [{
            name: request.body.name,
            body: request.body.body,
            created: Date.now()
        }];
        insert('blobs', response, documents);
    })
    .get(function (request, response) {
        find('blobs', response);
    });


router.route('/blobs/:id')
    .get(function (request, response) {
        console.log("Finding in blobs with id %s", request.params.id);
        find('blobs', response, {_id: mongodb.ObjectID(request.params.id)});
    });


app.use('/wikitext', router);
app.listen(app.get('port'), function () {
    console.log('Running on port', app.get('port'));
});


function find(collectionName, response, searchParams) {
    console.log("Finding in %s ", collectionName);
    var params = searchParams || {};
    var results = [];
    mongodb.MongoClient.connect(app.get('mongoUri'), function (err, db) {
        if (err) {
            console.log('Unable to connect to mongodb: ', err);
            response.send(err);
        }
        else {
            console.log('Connected to mongodb!');
            findDocuments(db, collectionName, results, params, function () {
                db.close();
                response.json(results);
            });
        }
    });
}

function insert(collectionName, response, documentsToInsert) {
    console.log("Inserting into %s", collectionName);
    mongodb.MongoClient.connect(app.get('mongoUri'), function (err, db) {
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


function findDocuments(db, collectionName, collectionArray, searchParams, callback) {
    var params = searchParams || {};
    var cursor = db.collection(collectionName).find(params);
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

