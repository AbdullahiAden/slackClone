const mongoose = require("mongoose")
const UserSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profilePic:{
        type:String,
        default:"default.png"

    }
   
})


module.exports = mongoose.model('Users', UserSchema)
