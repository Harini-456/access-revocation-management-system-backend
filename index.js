require("dotenv").config();
const express = require("express")
const connectDB = require("./config/db") 
const userApi =require("./api/userApi")
const requestApi = require("./api/requestApi")
const app = express()
app.use(express.json())

connectDB()
app.use("/users",userApi)
app.use("/requests", requestApi)
app.listen(process.env.PORT, () =>{
    console.log("Server is running on ",3000)
})