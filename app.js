const express = require("express");
const app = express();
const cors = require("cors");
const config = require("dotenv");
require("./config/config.env");
require("./db/conn");
const router = require("./routes/router");
const Auth = require("./routes/Auth");

const cookiParser = require("cookie-parser")
const port = process.env.PORT || 8000;


// middleware function
app.use(cors());
app.use(express.json());
app.use(cookiParser());
app.use(router);
app.use(Auth);
app.use(express.urlencoded({ extended: true }));



//Testing - failed
// console.log(process.env.PORT);
// console.log(process.env.RAZORPAY_API_KEY);
// console.log(process.env.RAZORPAY_API_SECRET);



app.get("/", (req,res)=>{
    res.status(201).json("server created");
})

app.listen(port, ()=>{
    console.log(`server start at port no: ${port}`);
})
