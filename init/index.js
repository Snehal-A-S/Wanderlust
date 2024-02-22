const mongoose = require("mongoose");
const inidata = require("./data.js");
const Listing = require("../models/listing.js");

mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("connected to DB");
}).catch(err=>{
    console.log(err);
})

async function main(){
   await  mongoose.connect(mongo_url);
}

const initDB = async()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(inidata.data);
    console.log("Data was initialized");
}

initDB();