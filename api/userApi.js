require("dotenv").config();
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const router  = express.Router()

router.post('/signup', async(req, res) => {
    console.log("Request body:", req.body);

    const name = req.body.name
    const email = req.body.email
    const role = req.body.role
    const password = req.body.password

  if (!email || !password) {
        return res.json({"message":"invalid request fields"})
    }
  else if (role!= "ADMIN" && role!= "EMPLOYEE"){
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
router.post("/login", async (req, res) => {
    try {
        console.log("LOGIN BODY:", req.body);

        const { email, password } = req.body;

        console.log("LOGIN SEARCH EMAIL:", email);

        const user = await User.findOne({ email });

        console.log("LOGIN USER FOUND:", user);

        if (!user) {
            return res.json({
    message: "Login successful",
    token,
    role: user.role
});

        }

        if (user.status === "REVOKED") {
            return res.status(403).json({ message: "Access revoked by admin" });
        }

        if (user.status === "PENDING") {
            return res.status(403).json({ message: "Waiting for admin approval" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, status: user.status },
            process.env.SECRET_CODE,
            { expiresIn: "1h" }
        );

        return res.json({
            message: "Login successful",
            token,
            role: user.role
});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
});



module.exports = router