const mongoose = require("mongoose")

const slackSchema = new mongoose.Schema({

    channelName: String,
    // arrays are collections , obejcts are documents
    conversation : [
        {
            message: {
                type: String
            } ,
            timestamp: {
                type: Date,
                default:Date.now
            }, 

            user:{
                name:{
                    type:String, 
                    // required:true
                },
                email:{
                    type: String,
                    // required:true
                }
            },
            userImage:String
        }
    ]
})

// export default mongoose.model()

module.exports= mongoose.model("Conversation", slackSchema)

    