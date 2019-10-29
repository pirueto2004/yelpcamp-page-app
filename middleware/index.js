const Campground = require("../models/campground"),
      Comment    = require("../models/comment");

//All the middleware goes here
const middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    //is user logged in?
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err) {
                res.redirect("back");
            } else {
                //does user own the campground post?
                console.log(foundCampground.author.id);//this a mongoose object
                console.log(req.user._id);//this a string
                if(foundCampground.author.id.equals(req.user._id)){
                    // res.render("campgrounds/edit", {campground: foundCampground});
                    next();
                } else {
                    // res.send("YOU DO NOT HAVE PERMISSION TO DO THAT!");
                    res.redirect("back");
                }
            }
        });
    }else {
        //if not, redirect
        // console.log("YOU NEED TO BE LOGGED IN TO DO THAT");
        // res.send("YOU NEED TO BE LOGGED IN TO DO THAT");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    //is user logged in?
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err) {
                res.redirect("back");
            } else {
                //does user own the comment?
                console.log(foundComment.author.id);//this a mongoose object
                console.log(req.user._id);//this a string
                if(foundComment.author.id.equals(req.user._id)){
                    // res.render("campgrounds/edit", {campground: foundCampground});
                    next();
                } else {
                    // res.send("YOU DO NOT HAVE PERMISSION TO DO THAT!");
                    res.redirect("back");
                }
            }
        });
    }else {
        //if not, redirect
        // console.log("YOU NEED TO BE LOGGED IN TO DO THAT");
        // res.send("YOU NEED TO BE LOGGED IN TO DO THAT");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

module.exports = middlewareObj;