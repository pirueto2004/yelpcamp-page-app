const express = require("express"),
      router  = express.Router();

const Campground = require("../models/campground"),
      middleware = require("../middleware");

const NodeGeocoder = require("node-geocoder");

const options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

const geocoder = NodeGeocoder(options);

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

//INDEX ROUTE - show all campgrounds

//"/campgrounds" => "The Campgrounds Page"
router.get("/", function(req, res) {
    // eval(require('locus'));
    // const currentUser = req.user;
    if(req.query.search){
        
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        //Get requested campground from DB
        Campground.find({name: regex}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            }
            if(!allCampgrounds.length){
                    req.flash("error","No campground found!");
                    return res.redirect("back");
            } else {
                
                //Here we render the page
                res.render("campgrounds/index", {campgroundsData: allCampgrounds, currentUser: req.user, page: 'campgrounds'});
            }
        });
    } else {
        //Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else {
                console.log(allCampgrounds);
                //Here we render the page
                res.render("campgrounds/index", {campgroundsData: allCampgrounds, currentUser: req.user});
            }
        });
    }
    
});


//CREATE ROUTE - add new campground to DB

//POST route by using the same GET route following the REST convention
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
    // res.send("YOU HIT THE POST ROUTE!")
    geocoder.geocode(req.body.location, function(err, data){
        if(err || !data.length) {
            req.flash("error", "Invalid address!");
            return res.redirect("back");
        }
        const lat = data[0].latitude;
        const lng = data[0].longitude;
        const location = data[0].formattedAddress;

            cloudinary.uploader.upload(req.file.path, function(result) {
                // add cloudinary url for the image to the campground object under image property
                req.body.campground.image = result.secure_url;
                //add image's public_id to campground object
                req.body.campground.imageId = result.public_id;
                //add author to campground
                req.body.campground.author = {
                    id: req.user._id,
                    username: req.user.username
                }

                const newCampground = {
                    name: req.body.campground.name,
                    price: req.body.campground.price,
                    image: req.body.campground.image,
                    imageId: req.body.campground.imageId,
                    description: req.body.campground.description,
                    author: req.body.campground.author,
                    location: location,
                    lat: lat,
                    lng: lng
                };
        
                //Create a new campground and save to DB
                Campground.create(newCampground, function(err, newlyCreated){
                    if(err){
                        req.flash("error", err.message);
                        return res.redirect("back");
                    } else {
                        console.log(newlyCreated);
                        //Redirect back to campgrounds page
                        res.redirect("/campgrounds/" + newlyCreated.id);
                    }
                });
            });
    });
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
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
    
        geocoder.geocode(req.body.location, function (err, data) {
            if(err || !data.length) {
                req.flash("error", "Invalid address!");
                return res.redirect("back");
            } 
            req.body.campground.lat = data[0].latitude;
            req.body.campground.lng= data[0].longitude;
            req.body.campground.location = data[0].formattedAddress;
            
            //find and update the correct campground
            Campground.findById(req.params.id, async function(err, campground){
                if(err){
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    if (req.file) {
                      try {
                          await cloudinary.uploader.destroy(campground.imageId);
                          var result = await cloudinary.uploader.upload(req.file.path);
                          campground.imageId = result.public_id;
                          campground.image = result.secure_url;
                      } catch(err) {
                          req.flash("error", err.message);
                          return res.redirect("back");
                      }
                    }
                    campground.name = req.body.campground.name;
                    campground.description = req.body.campground.description;
                    campground.save();
                    req.flash("success","Successfully Updated!");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    // res.send("YOU ARE TRYING TO DELETE A CAMPGROUND!");
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err) {
            res.redirect("/campgrounds");
        } else {
            req.flash("success","Campground deleted!");
            res.redirect("/campgrounds");
        }
    });
});

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};      

module.exports = router;