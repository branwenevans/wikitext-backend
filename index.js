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

    performOnCollection(response, findDocuments, collectionName, params, results, function callback() {
        response.json(results);
    });
}

function insert(collectionName, response, documentsToInsert) {
    console.log("Inserting into %s", collectionName);

    performOnCollection(response, insertDocuments, collectionName, documentsToInsert, [], function () {
        response.json({message: 'Blob saved!'});
    });
}

function remove(collectionName, response, id) {
    console.log("Removing from %s", collectionName);

    performOnCollection(response, deleteDocument, collectionName, id, [], function () {
        response.json({message: 'Blob deleted!'});
    });
}


function performOnCollection(response, operation, collectionName, params, results, callback) {
    mongodb.MongoClient.connect(app.get('mongoUri'), function (err, db) {
        if (err) {
            console.log('Unable to connect to mongodb: ', err);
            response.send(err);
        }
        else {
            console.log('Connected to mongodb!');
            operation(db, collectionName, params, results, function callbackAndClose() {
                callback();
                db.close();
            });
        }
    });
}

function findDocuments(db, collectionName, searchParams, results, callback) {
    var params = searchParams || {};
    var cursor = db.collection(collectionName).find(params);
    cursor.each(function (err, doc) {
        try {
            if (err) {
                console.log('Error reading from mongodb: ', err);
            }
            if (doc != null) {
                console.dir(doc);
                results.push(doc);
            } else {
                callback();
            }
        }
        catch (ex) {
            console.log(ex);
        }
    });
}

function insertDocuments(db, collectionName, documentsToInsert, results, callback) {
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

function deleteDocument(db, collectionName, id, results, callback) {
    db.collection(collectionName).deleteOne({_id: mongodb.ObjectID(id)}, function (err) {
        if (err) {
            console.log('Error deleting from mongodb: ', err);
        }
        callback();
    });
}

