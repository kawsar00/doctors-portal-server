const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
// const ObjectId = require('mongodb').ObjectId
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ggbl3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

// console.log(process.env.DB_USER, process.env.DB_PASS, process.env.DB_NAME);
const app = express()
app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello its working!')
})

const port = 5000
app.listen(process.env.PORT || port)



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("doctorsPortal").collection("appointments");

  app.post('/addAppointment', (req, res) => {
    const appointment = req.body
    console.log(appointment);
    appointmentCollection.insertOne(appointment)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  app.get('/appointments', (req, res) => {
    appointmentCollection.find({})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

  app.post('/appointmentByDate', (req, res) => {
    const date = req.body
    // console.log(date.date);
    appointmentCollection.find({date: date.date})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })
  

});