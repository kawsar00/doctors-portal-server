const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
// const ObjectId = require('mongodb').ObjectId
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ggbl3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

// console.log(process.env.DB_USER, process.env.DB_PASS, process.env.DB_NAME);
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.static('doctors'));
app.use(fileUpload());

app.get('/', (req, res) => {
  res.send('Hello its working!')
})

const port = 5000
app.listen(process.env.PORT || port)



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("doctorsPortal").collection("appointments");
  const doctorCollection = client.db("doctorsPortal").collection("doctors");

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
    const date = req.body;
    const email = req.body.email;
    doctorCollection.find({ email: email })
      .toArray((err, doctors) => {
        const filter = { date: date.date }
        if (doctors.length === 0) {
          filter.email = email;
        }
        appointmentCollection.find(filter)
          .toArray((err, documents) => {
            console.log(email, date.date, doctors, documents)
            res.send(documents);
          })
      })
  })


  app.post('/addADoctor', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    console.log(file, name, email);
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    doctorCollection.insertOne({ name, email, image })
      .then(result => {
        res.send(result.insertedCount > 0);
      })

    // file.mv(`${__dirname}/doctors/${file.name}`, err => {
    //   if (err) {
    //     console.log(err);
    //     return res.status(500).send({ msg: 'Failed to upload Image' })
    //   }
    //   return res.send({ name: file.name, path: `/${file.name}` })
    // })
  })

  app.get('/doctors', (req, res) => {
    doctorCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  app.post('/isDoctor', (req, res) => {
    const email = req.body.email;
    doctorCollection.find({ email: email })
      .toArray((err, doctors) => {
        res.send(doctors.length > 0);
      })
  })

});