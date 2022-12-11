const express = require("express");
const mongoose = require("mongoose");
const path = require('path');
const cors = require('cors');
const app = express();
global.appRoot = path.resolve(__dirname);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));


const eventsRouter = require("./routes/events-routes");
const pastEventsRouter = require("./routes/pastEvents-routes");
const tourJournRouter = require("./routes/tour-journey-routes");


// database connection => move this to data-methods.js and just await connection here!
const dbURI =
    process.env.MONGO_URL ||
    "mongodb+srv://cvt:abcdef21@cluster0.cxpra.mongodb.net/hfl?retryWrites=true&w=majority";

console.log(dbURI)
mongoose
    .connect(dbURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(async result => {
        console.log('Node version is: ' + process.version);
        console.log("mongo connected");
        console.log(mongoose.connection.db.databaseName)
        
    })
    .catch(err => console.log(err));
app.use(express.json());

app.use(cors({ origin: true }),
    eventsRouter,
    pastEventsRouter,
    tourJournRouter
);


module.exports = app;