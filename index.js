const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const port = 5000;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const dbname = process.env.DB_NAME;
const volunteeringTbl = process.env.DB_VOLUNTEER_FIELD_TBL
const userTbl = process.env.DB_USER_TBL;

app.get('/', (req, res) => {
    res.send('backend working');
});


const uri = `mongodb+srv://${user}:${password}@cluster0.ou4zy.mongodb.net/${dbname}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const volunteeringTblCollection = client.db(dbname).collection(volunteeringTbl);
    const userTblCollection = client.db(dbname).collection(userTbl);

    app.post('/uploadAllData', (req, res) => {
        const volunteeringFields = req.body;
        volunteeringTblCollection.insertMany(volunteeringFields)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    app.get('/getAllEvents', (req, res) => {
        volunteeringTblCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.get('/getEventById/:id', (req, res) => {
        let id = req.params.id;
        id = Number(id);
        volunteeringTblCollection.find({ id: id })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    });

    app.get('/getRegisteredEvents/:email', (req, res) => {
        userTblCollection.find({ email: req.params.email })
            .toArray((err, documents) => {
                if(documents.length) res.send(documents);
                else res.send("null");
            })
    });

    app.post('/register', (req, res) => {
        const register = req.body;
        
        userTblCollection.insertOne(register)
        .then(result => res.send(result.insertedCount > 0));
        
    });

    app.post('/deleteRegisteredEvent/:id', (req, res) => {
        const id = req.params.id;
        userTblCollection.deleteOne({ _id: ObjectId(id) })
        .then(result => res.send(result.deletedCount > 0));
    });
});



app.listen(process.env.PORT || port);