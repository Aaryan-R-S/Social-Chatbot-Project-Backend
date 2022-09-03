const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI_REMOTE;

const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=>{
        console.log("Connected to MongoDB successfully");
    })
}

module.exports = connectToMongo;