const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");

const channeldb = require("./models/channel");
const Usersdb = require("./models/user");
const server = http.createServer(app);
const io = socketio(server);
require("./config/passport")(passport)
//  db config
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

app.use(express.urlencoded({ extended: false }));

// EJS
app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "public")));
// Sessions
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect Flash
app.use(flash())

// global veriable . diff colors for diff msges
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})

// routes

// * REGISTER
app.get("/", async (req, res) => {
  res.render("signup");
});

// handle signup
app.post("/user/register", (req, res) => {
  const { name, email, password } = req.body;
  let errors = [];

  if (!name || !email || !password) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("signup", { errors, name, email, password });

    // if there are errors in filling form, we search db for such email
  } else {
    Usersdb.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("signup", { errors, name, email, password });
        
        // if email is not in db, instanciate user 
      } else {
        const newUser = new Usersdb({ name, email, password });

        // hash the password
        bcrypt.hash(password, 10, function (error, hash) {
          // Store hashed  password in db
          newUser.password = hash

          // save user to db after hashing and pass redirect
          newUser
              .save()
              .then(value => {
                  req.flash('success_msg', 'You have been registered, login!')
                  res.redirect('/user/login')
              })
              .catch(error => console.log(error))
      });
        
      }
    });
  }
});

// * LOGIN
app.get("/user/login", (req, res) => {
  res.render("login");
  
});

app.post("/user/login", (req, res,next)=>{
  passport.authenticate('local', {
    successRedirect: '/channels',
    failureRedirect: '/user/login',
    failureFlash: true
  })(req, res, next);
})

app.get("/channels", async (req, res) => {
  // res.render("signup")

  await channeldb.find({}, (err, data) => {
    if (channeldb) {
      res.render("home", { data });
    } else {
      console.log(err);
    }
  });
});

// handle channnel creation
app.post("/channels/new", (req, res) => {
  const channelName = req.body.channelInput;
  const newChannel = channeldb({ channelName });

  console.log(newChannel);
  // if there is channel written
  if (channelName) {
    newChannel.save();
  }
  res.redirect("/");
});

app.get("/channels/:id", async (req, res) => {
  const { id } = req.params;
  // const channelName= req.body.
  // * we are only showing the channel that we are, should shows all channels on the sidebar
  // * -- remove the filter in find

  await channeldb.find({ _id: id }, (err, data) => {
    if (err) {
      console.log(err);
    }
    res.render("home", { data });
  });
});

// json
app.get("/api/channels", async (req, res) => {
  await channeldb.find({}, (err, data) => {
    if (err) {
      throw err;
    }
    res.json(data);
  });
});

//*___________________________________________________________________________________________________
//*___________________________________________________________________________________________________
io.on("connection", (socket) => {
  io.on("chatMessage", async (allMessages) => {
    // * save message to db before emitting to  the browser
    // receive an object from client, the channel name and the message that will be sent to to the database
    let { channel, allMessage } = allMessages;

    console.log(channel);
    console.log(message);

    // take whatever the user types and save it the db
    let channelMessages = await channeldb.findOne({ _id: channel });

    console.log(channelMessages);

    // emit to the user after saving it
    socket.emit("outputmsg", messages);
  });
  // ***********************************************************************

  console.log("user connected");
  // socket.emit("message", "welcome to slack clone");
  // * find the RIGHT message from db ..................
  channeldb.find().then((messages) => {
    // console.log(messages.conversation);
    // ***** make the channel dynamic, ...... get the the clickd channels messages
    // messages = messages[0].conversation;

    socket.emit("outputmsg", messages);
  });

  // * send your message to everyone except you
  // listen for chatMessage that is sent from client
  socket.on("chatMessage", async (msg) => {
    // * save message to db before emitting to  the browser
    // receive an object from client, the channel name and the message that will be sent to to the database
    let { channel, message } = msg;

    console.log(channel);
    console.log(message);

    // take whatever the user types and save it the db
    let chatMessage = await channeldb.updateOne(
      { _id: channel },
      { $push: { conversation: { message: message } } }
    );

    // emit to the user after saving it
    io.emit("message", msg);
  });

  // when user disconnects
  socket.on("disconnect", () => {
    console.log("disconnect ");
    io.emit("message", " a user disconnected........");
  });
});

server.listen(3001);
