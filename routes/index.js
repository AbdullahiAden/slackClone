const express = require('express')
const router = express.Router()

router.get("/", async (req, res) => {
    res.render("signup")
    });
    
router.get("/login", (req, res)=>{
      res.render("login")
})
    