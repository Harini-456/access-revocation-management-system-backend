require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userApi = require("./api/userApi");
const requestApi = require("./api/requestApi");
const accessHistory = require("./models/accessHistory");

const app = express();

app.use(cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

const startServer = async () => {
    try {
        await connectDB();   

        app.use("/users", userApi);
        app.use("/requests", requestApi);

        app.listen(process.env.PORT, () => {
            console.log("Server is running on", process.env.PORT);
        });

    } catch (err) {
        console.log("Database connection failed:", err);
    }
};

startServer();
