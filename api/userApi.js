require("dotenv").config();
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const router  = express.Router()

router.post('/signup', async(req, res) => {
    const name = req.body.name
    const email = req.body.email
    const role = req.body.role
    const password = req.body.password

  if (!email || !password) {
        return res.json({"message":"invalid request fields"})
    }
  else if (role!= "MANAGER" && role!= "EMPLOYEE"){
     return res.json({"message":"invalid request role"})
  }
  else if(password.length <= 5){
     return res.json({"message":"invalid request password"})
  }

  
    const usercheck = await User.findOne({email:email})
    console.log("userCheck: ",usercheck)
        if(usercheck){
            return res.json({"mesage":"email already exists"})
        }

  const hashPassword = await bcrypt.hash(password, 10)
    const user = new User({
        name: name,
        email: email,
        password: hashPassword,
        role: role,
    })
    await user.save()
    return res.json({"message":"success"})
}) 

router.post("/login", async(req,res) => {
    console.log(req.body)
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return res.json({message: "Email is invalid"})
    }
    console.log(user,user.password,req.body.password)
    const isPasswordMatching = await bcrypt.compare(req.body.password , user.password)
    if(!isPasswordMatching){
        return res.json({"message":"password invalid"})
    }
    try{
    const token = jwt.sign(
        {user: user._id},
        process.env.SECRET_CODE,
        {expiresIn:"1h"}
    )
    return res.json({message:"login sucessfull",token: token})
}
catch(err){
    console.log(err)
    return res.json({"message":"Server error"})
}
})
module.exports = router