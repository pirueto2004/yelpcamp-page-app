const Campground = require("../models/campground"),
      Comment    = require("../models/comment"),
      User       = require("../models/user");

//All the middleware goes here
const middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    //is user logged in?
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err || !foundCampground) {
                req.flash("error", "Campground not found!");
                res.redirect("back");
            } else {
                //does user own the campground post?
                console.log(foundCampground.author.id);//this a mongoose object
                console.log(req.user._id);//this a string
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    req.campground = foundCampground;
                    // res.render("campgrounds/edit", {campground: foundCampground});
                    next();
                } else {
                    // res.send("YOU DO NOT HAVE PERMISSION TO DO THAT!");
                    req.flash("error", "You do not have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    }else {
        //if not, redirect
        // console.log("YOU NEED TO BE LOGGED IN TO DO THAT");
        // res.send("YOU NEED TO BE LOGGED IN TO DO THAT");
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    //is user logged in?
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment) {
                req.flash("error","Comment not found!");
                res.redirect("back");
            } else {
                //does user own the comment?
                console.log(foundComment.author.id);//this a mongoose object
                console.log(req.user._id);//this a string
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    req.comment = foundComment;
                    // res.render("campgrounds/edit", {campground: foundCampground});
                    next();
                } else {
                    // res.send("YOU DO NOT HAVE PERMISSION TO DO THAT!");
                    req.flash("error","You do not have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    }else {
        //if not, redirect
        // console.log("YOU NEED TO BE LOGGED IN TO DO THAT");
        // res.send("YOU NEED TO BE LOGGED IN TO DO THAT");
        req.flash("error","You need to be logged in to do that!");
        res.redirect("back");
    }
};

middlewareObj.checkProfileOwnership = function(req, res, next) {
    User.findById(req.params.user_id, function(err, foundUser) {
      if (err || !foundUser) {
        req.flash("error", "Sorry, that user doesn't exist");
        res.redirect("/campgrounds");
      } else if (foundUser._id.equals(req.user._id) || req.user.isAdmin) {
        req.user = foundUser;
        next();
      } else {
        req.flash("error", "You don't have permission to do that!");
        res.redirect("/campgrounds/" + req.params.user_id);
      }
    });
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
};

module.exports = middlewareObj;