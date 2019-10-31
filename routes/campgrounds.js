const express = require("express"),
      router  = express.Router();


const Campground = require("../models/campground"),
      middleware = require("../middleware");

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
router.post("/", middleware.isLoggedIn, function(req, res){
    // res.send("YOU HIT THE POST ROUTE!")
    //Get data from form and add to campgrounds array
    const campgroundName = req.body.name;
    const campgroundPrice = req.body.price;
    const campgroundImage = req.body.image;
    const campgroundDescription = req.body.description;
    const author = {
        id: req.user._id,
        username: req.user.username
    }
    const newCampground = {
        name: campgroundName,
        price: campgroundPrice,
        image: campgroundImage,
        description: campgroundDescription,
        author: author
    };
    
    // campgrounds.push(newCampground);

    //Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            console.log(newlyCreated);
            //Redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    })
    
});

//NEW ROUTE - show form to create a new campaground

//"/campgrounds/new" => "The Form Page"
router.get("/new", middleware.isLoggedIn, function(req, res) {
    //Here we render the page
    res.render("campgrounds/new");
});

//SHOW ROUTE - shows info about one single campground

router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground) {
            req.flash("error", "Campground not found!");
            res.redirect("back");
        } else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err) {
            res.reditect("/campgrounds");
        } else {
            //redirect somewhere(show page)
            res.redirect("/campgrounds/" + updatedCampground._id);
        }
    });
    
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    // res.send("YOU ARE TRYING TO DELETE A CAMPGROUND!");
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;