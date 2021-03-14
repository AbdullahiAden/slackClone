const mongoose = require("mongoose")

const Schema = mongoose.Schema;

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
            }
            // ,

            // // * user id 
            // user:{
            //     type:Schema.Types.ObjectId, ref:"Users"

            // }
            

       
        }
    ]
})

// export default mongoose.model()

module.exports= mongoose.model("Channel", slackSchema)

    