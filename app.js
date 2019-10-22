const express = require('express'),
      app = express(), //Creates an Express application and saves it to a variable
      bodyParser = require('body-parser'),
      mongoose = require("mongoose"),
      DATABASE_NAME = 'yelp_camp',
      mongoURI = `mongodb://localhost:27017/${DATABASE_NAME}`;

//Require models      
const Campground = require("./models/campground"),
      Comment = require("./models/comment"),
      seedDB = require("./seeds");      
 
//Initialize database with new seeds
seedDB();

//Set up promises with mongoose
mongoose.Promise = Promise; 

//if there's a shell environment variable named MONGODB_URI (deployed), use it; otherwise, connect to localhost
const dbUrl = process.env.MONGODB_URI || mongoURI;

// mongoose.connect(MONGOLAB_URI || mongoURI, { useNewUrlParser: true });
mongoose.connect(dbUrl, { useNewUrlParser: true });

//Tell Express to use 'body-parser'
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + '/public'));

app.set("view engine", "ejs");//Setting the default extension file '.ejs' for all the files that contain the HTML

const PORT = process.env.PORT || 3000;
// var IP = process.env.IP || '192.168.0.1'; set the IP for using it in Cloud9, Heroku doesn't needs it

//Defining the routes

//"/" => "The Landing Page"
app.get("/", function(req, res) {
    //Here we render the page
    res.render("landing");
});

//INDEX ROUTE - show all campgrounds

//"/campgrounds" => "The Campgrounds Page"
app.get("/campgrounds", function(req, res) {
    //Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            //Here we render the page
            res.render("campgrounds/index", {campgroundsData: allCampgrounds});
        }
    })
});


//CREATE ROUTE - add new campground to DB

//POST route by using the same GET route following the REST convention
app.post("/campgrounds", function(req, res){
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
app.get("/campgrounds/new", function(req, res) {
    //Here we render the page
    res.render("campgrounds/new");
});

//SHOW ROUTE - shows info about one single campground

app.get("/campgrounds/:id", function(req, res){
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

// ======================================
//           COMMENTS ROUTES
// ======================================

app.get("/campgrounds/:id/comments/new", function(req, res){
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

//Set up the POST route to submit the comments
app.post("/campgrounds/:id/comments", function(req, res){
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
                    res.redirect("/campgrounds");
                } else {
                    //associate the comment to the campground
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
    
    
    //redirect to campground show page

});

//Tell Express to listen for requests (start server)
//when using an IP
// app.listen(PORT, IP);
app.listen(PORT, function(){
    console.log("The YelpCamp App Server listening on PORT " + PORT);
});