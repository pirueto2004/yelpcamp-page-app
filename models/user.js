const mongoose               = require("mongoose"),
      passportLocalMongoose  = require("passport-local-mongoose");

//define the User model
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: String,
    firstName: String,
    lastName: String,
    email: String,
    isAdmin: {type: Boolean, default: false},
    notifications: [
    	{
    	   type: mongoose.Schema.Types.ObjectId,
    	   ref: 'Notification'
    	}
    ],
    followers: [
    	{
    		type: mongoose.Schema.Types.ObjectId,
    		ref: 'User'
    	}
    ]
});

//register a plugin for userSchema that adds methods to the user
userSchema.plugin(passportLocalMongoose);

//export the User model
module.exports = mongoose.model("User", userSchema);