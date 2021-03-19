const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const DirectmessageSchema = new mongoose.Schema({

    userTo:  {type: Schema.Types.ObjectId, ref:"Users", required: true},
    // arrays are collections , obejcts are documents
    conversation : [
        {
            userFrom:{type: Schema.Types.ObjectId, ref:"Users", required: true},

            message: {
                type: String
            } ,
            timestamp: {
                type: Date,
                default:Date.now
            },
        }
    ]
})

// export default mongoose.model()

module.exports= mongoose.model("DirectMessage", DirectmessageSchema)

    