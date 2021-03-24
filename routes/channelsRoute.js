const express = require('express')
const router = express.Router()

const mongoose = require("mongoose");
const channeldb = require("./models/channel");
const usersdb = require("./models/user");


router.get("/channels/:id", async (req, res) => {
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
  
  router.get("/api/channels", async (req, res) => {
    await channeldb.find({}, (err, data) => {
      if (err) {
       throw(err);
      }
      res.json(data);
  
  
    });
  });