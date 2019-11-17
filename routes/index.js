const express  = require("express"),
      router   = express.Router(),
      passport = require("passport");

const User       = require("../models/user"),
      Campground = require("../models/campground");


//====================
//       ROUTES
//====================

//"/" => Root route "The Landing Page"
router.get("/", function(req, res) {
    //Here we render the page
    res.render("landing");
});
// ====================
//     AUTH ROUTES
// ====================

//show the register form
router.get("/register", function(req, res){
    res.render("register", {page: 'register'});
});

//handle sign up logic
router.post("/register", function(req, res){
    // res.send("Signing you up ...");
    const newUser = new User({
        username: req.body.username, 
        firstName: req.body.firstName, 
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    });

    const userPassword = req.body.password;
    if(req.body.adminCode === 'secretcode123') {
        newUser.isAdmin = true;
    }
    User.register(newUser, userPassword, function(err, user){
        if(err){
            // req.flash("error", err.message);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success","Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        })
    });
});

//show login form
router.get("/login", function(req, res){
    res.render("login", {page: 'login'});
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
    // res.send("LOGIN LOGIC HAPPENS HERE!");
});

//LOGOUT ROUTE

router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged You Out. See You Later!");
    res.redirect("/login");
});

//USER PROFILE
router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error","Something went wrong");
            res.redirect("back");
        }
        Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
            if(err){
                req.flash("error","Something went wrong");
                res.redirect("back");
            }
            res.render("users/show", {user: foundUser, campgrounds: campgrounds});
        });
        
    })
});





module.exports = router;