const mongoose               = require("mongoose"),
      passportLocalMongoose  = require("passport-local-mongoose");

//define the User model
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

//register a plugin for userSchema that adds methods to the user
userSchema.plugin(passportLocalMongoose);

//export the User model
module.exports = mongoose.model("User", userSchema);