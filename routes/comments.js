const express = require("express"),
      router  = express.Router({mergeParams: true});

const Campground = require("../models/campground"),
      Comment    = require("../models/comment"),
      middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
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
router.post("/", middleware.isLoggedIn, function(req, res){
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
                    req.flash("error","Something went wrong");
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
                    req.flash("success","Comment successfully added");
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});

//COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "No campground found!");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            }
        });
    });
});

//COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    // res.send("YOU HIT THE UPDATE ROUTE FOR COMMENT");
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    // res.send("DESTROY COMENT ROUTE");
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success","Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
        
    });
});


module.exports = router;