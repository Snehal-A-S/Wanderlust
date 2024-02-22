const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./Utils/wrapAsync.js");
const ExpressError = require("./Utils/ExpressError.js");
const { listingSchema } = require("./schema.js");


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("connected to DB");
}).catch(err=>{
    console.log(err);
})

async function main(){
   await  mongoose.connect(mongo_url);
}

app.get("/",(req,res)=>{
    res.send("home directory");
})

//Index Route
   app.get("/listings",wrapAsync(async(req,res)=>{
    let alldata = await Listing.find();
    // console.log(alldata);
    res.render("listing/index.ejs",{alldata});
}))

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listing/new.ejs");
})

//Show Route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listing/show.ejs",{listing});
}))

//Create Route
app.post("/listings",wrapAsync(async(req,res)=>{
    let result = listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError(400,result.error);
    }
    let newlisting = new Listing(req.body.listing);
    await newlisting.save();
    res.redirect("/listings");

}))

//Edit route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listing/edit.ejs",{listing});
}))

//Update Route
app.put("/listings/:id",wrapAsync(async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send a valid listing");
    }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}))

//Delete Route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deletedData = await Listing.findByIdAndDelete(id);
    console.log(deletedData);
    res.redirect("/listings");
}))


// app.get("/testListing",async(req,res)=>{
//     let sampleListing = new Listing({
//         title : "My New Villa",
//         description:"By the beach",
//         price : 1200,
//         location:"Calangute,Goa",
//         country:"India"
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");

// });

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
})

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong"}=err;
    res.render("error.ejs",{err})
    // res.status(statusCode).send(message);
})

app.listen(8080,()=>{
    console.log("app is listening at port 8080");
})