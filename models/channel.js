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
            }

       
        }
    ]
})

// export default mongoose.model()

module.exports= mongoose.model("Channel", slackSchema)

    