const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const slackSchema = new mongoose.Schema({

    channelName: String,
    admin:{type: Schema.Types.ObjectId, ref:"Users", required: true},

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
            
            user: {type: Schema.Types.ObjectId, ref:"Users", required: true

            }
            

       
        }
    ]
})

// export default mongoose.model()

module.exports= mongoose.model("Channel", slackSchema)

    