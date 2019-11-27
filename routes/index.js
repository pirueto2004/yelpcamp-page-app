const express  = require("express"),
      router   = express.Router(),
      passport = require("passport"),
      middleware = require("../middleware");

const User       = require("../models/user"),
      Campground = require("../models/campground"),
      Comment = require("../models/comment"),
      Notification = require("../models/notification");

//Add multer and cloudinary configuration

const multer = require('multer');
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
const imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter})

const cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'deoettl1w', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
router.post("/register", upload.single("image"),function(req, res){
    // res.send("Signing you up ...");
    if (req.file === undefined) {
      const newUser = new User({
          username: req.body.username, 
          firstName: req.body.firstName, 
          lastName: req.body.lastName,
          email: req.body.email,
          phone: req.body.phone,
          image: "",
          imageId: ""
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
    } else {
      cloudinary.uploader.upload(
        req.file.path, {
          width: 400,
          height: 400,
          gravity: "center",
          crop: "scale"
        },
        function(err, result) {
          if (err) {
            req.flash("error", err.messsage);
            return res.redirect("back");
          }
          req.body.image = result.secure_url;
          req.body.imageId = result.public_id;
          var newUser = new User({
            username: req.body.username,
            firstName: req.body.firstName, 
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            image: req.body.image,
            imageId: req.body.imageId
          });
          User.register(newUser, req.body.password, function(err, user) {
            if (err) {
              return res.render("register", {
                error: err.message
              });
            }
            passport.authenticate("local")(req, res, function() {
              res.redirect("/campgrounds");
            });
          });
        }, {
          moderation: "webpurify"
        }
      );
    }
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
router.get("/users/:user_id", function(req, res){
    User.findById(req.params.user_id, function(err, foundUser){
        if(err || !foundUser){
            req.flash("error","This user doesn't exist");
            res.redirect("back");
        }
        Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
            if(err){
                req.flash("error","Something went wrong");
                res.redirect("back");
            }
            Comment.find()
              .where("author.id")
              .equals(foundUser._id)
              .exec(function(err, ratedCount) {
                if (err) {
                  req.flash("error", "Something went wrong");
                  res.render("error");
                }
                
                res.render("users/show", {
                  user: foundUser,
                  campgrounds: campgrounds,
                  reviews: ratedCount
                });
            });
        });
    });
});

// edit profile
router.get(
  "/users/:user_id/edit",
  middleware.isLoggedIn,
  middleware.checkProfileOwnership,
  function(req, res) {
    User.findById(req.params.user_id, function(err, user){
      res.render("users/edit", {user: user});
    });
    
});



// update profile
router.put(
  "/users/:user_id",
  upload.single("image"),
  middleware.checkProfileOwnership,
  function(req, res) {
    User.findById(req.params.user_id, async function(err, user) {
      if (err) {
        req.flash("error", err.message);
      } else {
        if (req.file) {
          try {
            await cloudinary.uploader.destroy(user.imageId);
            const result = await cloudinary.uploader.upload(req.file.path, {
              width: 400,
              height: 400,
              gravity: "center",
              crop: "scale"
            }, {
              moderation: "webpurify"
            });
            user.imageId = result.public_id;
            user.image = result.secure_url;
          } catch (err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
        }
        user.email = req.body.email;
        user.phone = req.body.phone;
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.save();
        
        req.flash("success", "Updated your profile!");
        res.redirect("/users/" + user._id);
       
      }
    });
  }
);



// follow user
router.get('/follow/:id', middleware.isLoggedIn, async function(req, res) {
    try {
      let user = await User.findById(req.params.id);
      user.followers.push(req.user._id);
      user.save();
      req.flash('success', 'Successfully followed ' + user.username + '!');
      res.redirect('/users/' + req.params.id);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  });

// view all notifications
router.get('/notifications', middleware.isLoggedIn, async function(req, res) {
    try {
      let user = await User.findById(req.user._id).populate({
        path: 'notifications',
        options: { sort: { "_id": -1 } }
      }).exec();
      let allNotifications = user.notifications;
      res.render('notifications/index', { allNotifications });
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  });
  
  // handle notification
  router.get('/notifications/:id', middleware.isLoggedIn, async function(req, res) {
    try {
      let notification = await Notification.findById(req.params.id);
      notification.isRead = true;
      notification.save();
      res.redirect(`/campgrounds/${notification.campgroundId}`);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  });





module.exports = router;