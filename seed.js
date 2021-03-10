const mongoose = require("mongoose");

const channeldb = require("./models/channel");

mongoose
  .connect("mongodb://localhost:27017/channel", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log("Connection Open ");
  })
  .catch((err) => {
    console.log("Erorrr");
    console.log(err);
  });

//   const channel = new channeldb({
//       channelName:"youtube", 

//       conversation:[
//           {
//               message: "youtube message"
//           }
          
//       ]
//   })

//   channel.save().then(c=>{
//       console.log(c);
//   })
//   .catch(e=>{
//       console.log(e);
//   })

const seedData = [
    {
        channelName:"INSTA",
        conversation:[
            {
                message:"INSTA message"
            },

            {
                message:"INSTA message 2"
            },

            {
                message:"INSTA message 3"
            }
        ]

    },
    {
        channelName:"YOUTUBE",
        conversation:[
            {
                message:"YOUTUBE message"
            },

            {
                message:"YOUTUBE message 2"
            },

            {
                message:"YOUTUBE message 3"
            }
        ]

    },
    {
        channelName:"Facebook",
        conversation:[
            {
                message:"facebook message"
            },

            {
                message:"facebook message 2"
            },

            {
                message:"facebook message 3"
            }
        ]

    },


    {
        channelName:"twitter",
        conversation:[
            {
                message:"twiter message"
            },

            {
                message:"twiter message 2"
            },

            {
                message:"twiter message 3"
            }
        ]

    },


    {
        channelName:"nogozone",
        conversation:[
            {
                message:"nogozone message"
            },

            {
                message:"nogozone message 1"
            },

            {
                message:"nogozone message 2"
            }
        ]

    },
]


// channeldb.insertMany(seedData).then(res=>{
//     console.log(res);
// }).catch(e=>{
//     console.log(e);
// })