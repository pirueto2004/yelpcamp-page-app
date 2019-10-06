const express = require('express');
const app = express(); //Creates an Express application and saves it to a variable
const bodyParser = require('body-parser');
const mongoose = require("mongoose"),
      DATABASE_NAME = 'yelp_camp',
      mongoURI = `mongodb://localhost:27017/${DATABASE_NAME}`,
      MONGOLAB_URI = `mongodb://juliobell2014@gmail.com:Timbre@1966@ds229078.mlab.com:29078/heroku_r654fzpr`

mongoose.connect(MONGOLAB_URI || mongoURI, { useNewUrlParser: true });
// mongoose.connect(mongoURI, { useNewUrlParser: true });

//SCHEMA SETUP
const campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

const Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create(
//     {
//         name: "Delta Old Growth", 
//         image: "https://assets.simpleviewinc.com/simpleview/image/fetch/c_fill,h_452,q_75,w_982/http://res.cloudinary.com/simpleview/image/upload/v1469218578/clients/lanecounty/constitution_grove_campground_by_natalie_inouye_417476ef-05c3-464d-99bd-032bb0ee0bd5.png",
//         description: "This easy 0.5 mile (0,8 km) wheelchair accessible loop trail winds through a diverse, ancient and beautiful forest ecosystem where 650 year old trees tower over 200 feet (61 m) above a variety of native plants and animals. "
// }, function(err, campground){
//     if(err){
//         console.log(err);
//     } else {
//         console.log("NEWLY CREATED CAMPGROUND: ", campground);
//     }
// });

//Tell Express to use 'body-parser'
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");//Setting the default extension file '.ejs' for all the files that contain the HTML

const PORT = process.env.PORT || 3000;
// var IP = process.env.IP || '192.168.0.1'; set the IP for using it in Cloud9, Heroku doesn't needs it

//Define the array of campgrounds
let campgrounds = [
    {name: "Delta Old Growth", image: "https://assets.simpleviewinc.com/simpleview/image/fetch/c_fill,h_452,q_75,w_982/http://res.cloudinary.com/simpleview/image/upload/v1469218578/clients/lanecounty/constitution_grove_campground_by_natalie_inouye_417476ef-05c3-464d-99bd-032bb0ee0bd5.png"},
    {name: "Big Meadows", image: "http://seattlemag.com/sites/default/files/field/image/1-lead_23.jpg"},
    {name: "Mount Desert", image: "https://acadiamagic.com/280x187/md-campground.jpg"},
    {name: "New KOA", image: "https://koa.com/blog/images/Lake-milton-koa.jpg?preset=blogPhoto"},
    {name: "Helen, GA", image: "http://helenga.s3.amazonaws.com/images/weddings/_750x550_crop_center-center_75_none/lucilles.jpg"},
    {name: "West Thompson Lake", image: "https://blog-assets.thedyrt.com/uploads/2018/10/connecticut-west-thompson-lake-campground_f94e0d004899b303ea1ca3fb2ba03dfb.jpg"}
];

//Defining the routes

//"/" => "The Landing Page"
app.get("/", function(req, res) {
    //Here we render the page
    res.render("landing");
});

//INDEX ROUTE - show all campgrounds

//"/campgrounds" => "The Campgrounds Page"
app.get("/campgrounds", function(req, res) {
    //Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            //Here we render the page
            res.render("index", {campgroundsData: allCampgrounds});
        }
    })
});


//CREATE ROUTE - add new campground to DB

//POST route by using the same GET route following the REST convention
app.post("/campgrounds", function(req, res){
    // res.send("YOU HIT THE POST ROUTE!")
    //Get data from form and add to campgrounds array
    let campgroundName = req.body.name;
    let campgroundImage = req.body.image;
    let campgroundDescription = req.body.description;
    let newCampground = {
        name: campgroundName,
        image: campgroundImage,
        description: campgroundDescription
    };
    // campgrounds.push(newCampground);

    //Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //Redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    })
    
});

//NEW ROUTE - show form to create a new campaground

//"/campgrounds/new" => "The Form Page"
app.get("/campgrounds/new", function(req, res) {
    //Here we render the page
    res.render("new");
});

//SHOW ROUTE - shows info about one single campground

app.get("/campgrounds/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err) {
            console.log(err);
        } else {
            //render show template with that campground
            res.render("show", {campground: foundCampground});
        }
    });
})



//Tell Express to listen for requests (start server)
//when using an IP
// app.listen(PORT, IP);
app.listen(PORT, function(){
    console.log("The YelpCamp App Server listening on PORT " + PORT);
});