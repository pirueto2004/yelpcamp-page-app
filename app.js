const express               = require('express'),
      expressSession        = require("express-session"),
      bodyParser            = require('body-parser'),
      mongoose              = require("mongoose"),
      passport              = require("passport"),
      localStrategy         = require("passport-local"),
      passportLocalMongoose = require("passport-local-mongoose"),
      DATABASE_NAME = 'yelp_camp',
      mongoURI = `mongodb://localhost:27017/${DATABASE_NAME}`;

      //Creates an Express application and saves it to a variable
const app = express();

      //Require models      
const Campground = require("./models/campground"),
      Comment    = require("./models/comment"),
      User       = require("./models/user"),  
      seedDB = require("./seeds");  

const PORT = process.env.PORT || 3000;
const IP = process.env.IP; //set the IP for using it in Cloud9, Heroku doesn't needs it    

    //Initialize database with new seeds
    seedDB();

    //PASSPORT CONFIGURATION

    app.use(expressSession({
        secret: "floppy is the sweetest dog in the world",
        resave: false,
        saveUninitialized: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new localStrategy(User.authenticate()));
    //encode and decode sessions
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

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

//====================
//       ROUTES
//====================

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
                    //redirect to show page
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
});

// ====================
//     AUTH ROUTES
// ====================

//show the register fomr
app.get("/register", function(req, res){
    res.render("register");
});

//handle sign up logic
app.post("/register", function(req, res){
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
app.get("/login", function(req, res){
    res.render("login");
});

//handling login logic
app.post("/login", function(req, res){
    res.send("LOGIN LOGIC HAPPENS HERE!");
});

//Tell Express to listen for requests (start server)
app.listen(PORT, IP, function(){
    console.log("Server listening on PORT " + PORT);
});