const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json())

// 
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }
    // -----------
    // const token = authHeader.split(' ')[1];
    // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //     if (err) {
    //         return res.status(403).send({ message: 'Forbidden access' });
    //     }
    //     // console.log('decoded', decoded);
    //     req.decoded = decoded;
    // })
    // ----------
    next();
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jfe1h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const clothCollection = client.db("clothingProducts").collection("clothes");
        // auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '30d'
            });
            res.send({ accessToken });
        })

        // get all item from database
        app.get('/cloth', async (req, res) => {
            const query = {};
            const cursor = clothCollection.find(query);
            const clothes = await cursor.toArray();
            res.send(clothes)
        })
        // -----------
        // app.get('/clothes', verifyJWT, async (req, res) => {
        //     const emailDecoded = req.decoded.email;
        //     const email = req.query.email;
        //     if (email === emailDecoded) {
        //         const query = { email: email };
        //         const cursor = clothCollection.find(query);
        //         const clothes = await cursor.toArray();
        //         res.send(clothes)
        //     }
        //     else {
        //         res.status(403).send({ message: 'Forbidden access' });
        //     }
        // })
        // ---------
        app.get('/clothes', verifyJWT, async (req, res) => {
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
        // put: update stock
        app.put('/cloth/:id', async (req, res) => {
            const id = req.params.id;
            const newStock = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateStock = {
                $set: {
                    quantity: newStock.quantity
                }
            };
            const result = await clothCollection.updateOne(filter, updateStock, options);
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