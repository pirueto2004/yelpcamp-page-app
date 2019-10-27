const express = require("express"),
      router  = express.Router();

const Campground = require("../models/campground");

//INDEX ROUTE - show all campgrounds

//"/campgrounds" => "The Campgrounds Page"
router.get("/", function(req, res) {
    // const currentUser = req.user;
    //Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            //Here we render the page
            res.render("campgrounds/index", {campgroundsData: allCampgrounds, currentUser: req.user});
        }
    })
});


//CREATE ROUTE - add new campground to DB

//POST route by using the same GET route following the REST convention
router.post("/", function(req, res){
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
router.get("/new", function(req, res) {
    //Here we render the page
    res.render("campgrounds/new");
});

//SHOW ROUTE - shows info about one single campground

router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err) {
            console.log(err);
        } else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

module.exports = router;