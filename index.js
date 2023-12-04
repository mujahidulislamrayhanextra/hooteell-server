const express = require('express')
const app = express()
const port = 5000;
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeApp } = require('firebase-admin/app');
const  {getAuth}  = require('firebase-admin')

require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());




var admin = require("firebase-admin");

var serviceAccount = require("./configs/hooteell-firebase-adminsdk-2flko-c150af4a5c.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tuib1aw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const database = client.db("hooteell")
    const coll = database.collection("booking");

    app.post('/addBooking', async (req, res) => {
      const newBooking = req.body;

      await coll.insertOne(newBooking)
        .then(result => {

          res.send(result.acknowledged === true);


        })

    })



    app.get('/booking', async (req, res) => {

      console.log(req.headers.authorization);

      const bearer = req.headers.authorization;

      if (bearer && bearer.startsWith('Bearer ')) {

        const idToken = bearer.split(' ')[1];
        console.log({ idToken });
        // idToken comes from the client app
       admin.auth()
          .verifyIdToken(idToken)
          .then((decodedToken) => {
            const tokenEamil = decodedToken.email;
            const queryEamil = req.query.email;
            console.log(tokenEamil, req.query.email);


            if (tokenEamil === req.query.email) {
              const findOp = coll.find({ email: req.query.email });

              const result = findOp.toArray();
              res.status(200).send(result);
            }
            // ...
          })
          .catch((error) => {
            res.status(401).send("unauthenticated access")
          });

      }
      else{
        res.status(401).send("unauthorized access");
      }






    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);








app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)