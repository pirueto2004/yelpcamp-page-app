const express  = require("express"),
      router   = express.Router(),
      passport = require("passport");

const User    = require("../models/user");

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

//show the register fomr
router.get("/register", function(req, res){
    res.render("register");
});

//handle sign up logic
router.post("/register", function(req, res){
    // res.send("Signing you up ...");
    const newUser = new User({username: req.body.username});
    const userPassword = req.body.password;
    User.register(newUser, userPassword, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/campgrounds");
        })
    });
});

//show login form
router.get("/login", function(req, res){
    res.render("login");
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
    res.redirect("/login");
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;