require("dotenv").config();

const express               = require("express"),
      expressSession        = require("express-session"),
      bodyParser            = require("body-parser"),
      mongoose              = require("mongoose"),
      flash                 = require("connect-flash"),
      passport              = require("passport"),
      localStrategy         = require("passport-local"),
      passportLocalMongoose = require("passport-local-mongoose"),
      methodOverride        = require("method-override"),
      DATABASE_NAME         = 'yelp_camp2',
      mongoURI              = `mongodb://localhost:27017/${DATABASE_NAME}`;

      //Creates an Express application and saves it to a variable
const app = express();

      //Require models      
const User             = require("./models/user");

const seedDB           = require("./seeds");
      
      //Requiring routes
const campgroundRoutes = require("./routes/campgrounds"), 
      commentRoutes    = require("./routes/comments"),
      indexRoutes    = require("./routes/index");

const PORT = process.env.PORT || 3000;
const IP = process.env.IP; //set the IP for using it in Cloud9, Heroku doesn't needs it    

    //Initialize database with new seeds
    // seedDB();

    //Require moment.js and add it to app.locals
    app.locals.moment = require('moment');

    //Use Flash Messages in the app
    app.use(flash());

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

    app.use(function(req, res, next){
        res.locals.currentUser = req.user;
        res.locals.error = req.flash("error");
        res.locals.success = req.flash("success");
        next();
    });

    app.use(methodOverride("_method"));

    app.set("view engine", "ejs");//Setting the default extension file '.ejs' for all the files that contain the HTML

    

    //Use the routes
    app.use("/", indexRoutes);
    app.use("/campgrounds", campgroundRoutes);
    app.use("/campgrounds/:id/comments", commentRoutes);

    //Tell Express to listen for requests (start server)
    app.listen(PORT, IP, function(){
        console.log("Server listening on PORT " + PORT);
    });