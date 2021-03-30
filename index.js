const express = require('express')
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config()

const app = express()
app.use(cors());
app.use(express.json());

app.get('/', (req, res)=> {
  res.send("Hello from db, it's  working")
})

var serviceAccount = require('./burj-al-arab-fb-firebase-adminsdk-fhfg7-c5f2132465.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Arabian:ArabianHorse79@cluster0.kypi0.mongodb.net/burjAlArab?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  // create data in server
  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
    console.log(newBooking);
  })
  // read data from backend/server
  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer")) {
      const idToken = bearer.split(' ')[1];
      // idToken comes from the client app
      console.log({idToken});
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          if(tokenEmail == req.query.email){
            bookings.find({ email: req.query.email })
            .toArray((err, documents) => {
              res.status(200).send(documents);
            })
          }
          else{
            res.status(401).send("un-authorized access")
          }
        })
          .catch((error) => {
            res.status(401).send("un-authorized access")
          });
    }

     else{
            res.status(401).send("un-authorized access")
          }
       
        
    
  })

})




app.listen(process.env.PORT || 5000, () => {
  console.log(`Example app listening at http://localhost:${5000}`)
})