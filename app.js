require("dotenv").config()

const express = require("express"),
  expressSession = require("express-session"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),
  passport = require("passport"),
  localStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  methodOverride = require("method-override"),
  database_name = process.env.DATABASE_NAME,
  port = process.env.PORT,
  mongodbPassword = process.env.MONGOPASSWORD,
  MONGODB_URI = process.env.CONNECTIONSTRING,
  mongoURI = `mongodb://localhost:27017/${database_name}`

//Creates an Express application and saves it to a variable
const app = express()

//Require models
const User = require("./models/user")

const seedDB = require("./seeds")

//Requiring routes
const campgroundRoutes = require("./routes/campgrounds"),
  commentRoutes = require("./routes/comments"),
  indexRoutes = require("./routes/index")

//Initialize database with new seeds
// seedDB();

//Require moment.js and add it to app.locals
app.locals.moment = require("moment")

//Use Flash Messages in the app
app.use(flash())

//PASSPORT CONFIGURATION

app.use(
  expressSession({
    secret: "floppy is the sweetest dog in the world",
    resave: false,
    saveUninitialized: false
  })
)

app.use(passport.initialize())
app.use(passport.session())

passport.use(new localStrategy(User.authenticate()))
//encode and decode sessions
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//Set up promises with mongoose
mongoose.Promise = Promise

//if there's a shell environment variable named MONGODB_URI (deployed), use it; otherwise, connect to localhost
// const dbUrl = process.env.MONGODB_URI || mongoURI

// mongoose.connect(MONGOLAB_URI || mongoURI, { useNewUrlParser: true });

//Connecting our app to mongoDB Atlas
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// mongoose.connect(dbUrl, { useNewUrlParser: true })

//Tell Express to use 'body-parser'
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(__dirname + "/public"))

app.use(async function (req, res, next) {
  res.locals.currentUser = req.user
  // res.locals.error = req.flash("error");
  // res.locals.success = req.flash("success");
  // next();
  if (req.user) {
    try {
      let user = await User.findById(req.user._id).populate("notifications", null, { isRead: false }).exec()
      res.locals.notifications = user.notifications.reverse()
    } catch (err) {
      console.log(err.message)
    }
  }
  res.locals.error = req.flash("error")
  res.locals.success = req.flash("success")
  next()
})

app.use(methodOverride("_method"))

app.set("view engine", "ejs") //Setting the default extension file '.ejs' for all the files that contain the HTML

//Use the routes
app.use("/", indexRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/comments", commentRoutes)

//Tell Express to listen for requests (start server)
app.listen(port, () => {
  console.log(`Server listening on PORT ${port}`)
})
