const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jfe1h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const clothCollection = client.db("clothingProducts").collection("clothes");

        // get all item from database
        app.get('/cloth', async (req, res) => {
            const query = {};
            const cursor = clothCollection.find(query);
            const clothes = await cursor.toArray();
            res.send(clothes)
        })
        // 
        app.get('/clothes', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = clothCollection.find(query);
            const clothes = await cursor.toArray();
            res.send(clothes)
        })
        // get specific one item from database( by id)
        app.get('/cloth/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const cloth = await clothCollection.findOne(query);
            res.send(cloth);
        })
        // post :received data from the client and send to database
        app.post('/cloth', async (req, res) => {
            const newCloth = req.body;
            const result = await clothCollection.insertOne(newCloth);
            res.send(result);
        })
        // delete: 
        app.delete('/cloth/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await clothCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("No tension, It works");
})
app.listen(port, () => {
    console.log("Listening to port", port);
})