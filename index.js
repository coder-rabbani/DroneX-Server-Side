const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
//require ObjectId from mongodb
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v05ft.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run(){
  try{
      await client.connect();
      const database = client.db('drone_portal');
      const dronesCollection = database.collection('products');
      const reviewsCollection = database.collection('reviews');
      const usersCollection = database.collection('users');

      //GET API-for home
      app.get('/homeProducts', async(req, res)=>{
        const cursor = dronesCollection.find({}).limit(6);
        const drones = await cursor.toArray();
        res.send(drones);
      });

      //GET API-All Products
      app.get('/allProducts', async(req, res)=>{
        const cursor = dronesCollection.find({});
        const drones = await cursor.toArray();
        res.send(drones);
      });

      //post api for products collection
      app.post('/products', async(req, res)=>{
        const drones = req.body;
        const result = await dronesCollection.insertOne(drones);
        res.json(result)
      });

      //GET API for single query
      app.get('/allProducts/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const drone = await dronesCollection.findOne(query);
        res.send(drone);
    });

      // POST API for adding reviews to the database
      app.post('/reviews', async(req, res)=>{
        const reviews = req.body;
        const result = await reviewsCollection.insertOne(reviews);
        res.json(result)
      });

      //GET API for reviews
      app.get('/allReviews', async(req, res)=>{
        const cursor = reviewsCollection.find({});
        const reviews = await cursor.toArray();
        res.json(reviews);
      });

      app.post('/users', async(req, res)=>{
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result);
      })

      // update or insert user
      app.put('/users', async(req, res)=>{
        const user = req.body;
        const filter = {email: user.email};
        const options = {upsert: true}
        const updateDoc = {$set: user};
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
      })

      // make user an admin
      app.put('/users/admin', async(req, res)=>{
        const user = req.body;
        const filter = {email: user.email};
        const updateDoc = {$set: {role:'admin'}};
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
      })

      //check if user an admin or not
      app.get('/users/:email', async(req, res)=>{
        const email = req.params.email;
        const query = {email: email};
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin'){
          isAdmin=true;
        }
        res.json({admin: isAdmin});
      })
  }
  finally{ 
      // await client.close();
  }
}
run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('Welcome to Drones Portal')
})

app.listen(port, () => {
  console.log(`Listening at ${port}`)
})