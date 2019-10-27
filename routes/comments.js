const express = require("express"),
      router  = express.Router({mergeParams: true});

const Campground = require("../models/campground"),
      Comment    = require("../models/comment");

//Comments New
router.get("/new", isLoggedIn, function(req, res){
    // res.send("THIS WILL BE THE COMMENT FORM");
    //find campground by Id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            //render and pass in the campground coming out from the database
            res.render("comments/new", {campground: campground});
        }
    });
});

//Comments Create
//Set up the POST route to submit the comments
router.post("/", isLoggedIn, function(req, res){
    //look up campground using Id  
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            //we can use just one piece of data req.body.comment since we use name=comment[text] and name=comment[author] in the form
            // console.log(req.body.comment);
            //create new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                    //redirect to show page
                    res.redirect("/campgrounds");
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    //associate the comment to the campground
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});

//Middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;