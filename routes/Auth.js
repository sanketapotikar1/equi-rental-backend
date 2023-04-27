const express = require("express");
const Auth = new express.Router();
const userdb = require("../models/userSchema");
const CartProductdb = require("../models/cartProductSchema");
const authenticate = require("../middleware/authenticate");
// const paymentController = require('../controllers/paymentController')
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// const keysecret = process.env.SECRET_KEY
const keysecret = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";

// email config

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // user:process.env.EMAIL,
    // pass:process.env.PASSWORD
    user: "sanketapotikar1@gmail.com",
    pass: "rfxsqakiarkpiqcm",
  },
});

// get the all users from userdb

Auth.get("/users", async (req, res) => {
  const body = req.body;
  console.log(body);

  const users = await userdb.find();

  res.status(201).json({ status: 201, users: users });
});

// for user registration.

Auth.post("/registration", async (req, res) => {
  const { fname, email, password, cpassword } = req.body;

  // validate all data from request body
  if (!fname || !email || !password || !cpassword) {
    res.status(422).json({ error: "fill all the details" });
  }

  //validate - user is already exist or not.
  try {
    const preuser = await userdb.findOne({ email: email });

    if (preuser) {
      res.status(422).json({ error: "This Email is Already Exist" });
    } else if (password !== cpassword) {
      res
        .status(422)
        .json({ error: "Password and Confirm Password Not Match" });
    } else {
      // set new user into user database.
      const finalUser = new userdb({
        fname,
        email,
        password,
        cpassword,
      });

      // here password hasing

      const storeData = await finalUser.save();

      console.log(storeData);

      res.status(201).json({ status: 201, storeData });
    }
  } catch (error) {
    res.status(422).json(error);
    console.log("catch block error");
  }
});

// user Login

Auth.post("/login", async (req, res) => {
  // console.log(req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(422).json({ error: "fill all the details" });
  }

  try {
    const userValid = await userdb.findOne({ email: email });

    if (userValid) {
      const isMatch = await bcrypt.compare(password, userValid.password);

      if (!isMatch) {
        res.status(422).json({ error: "invalid details" });
      } else {
        // token generate
        const token = await userValid.generateAuthtoken();

        // cookiegenerate
        res.cookie("usercookie", token, {
          expires: new Date(Date.now() + 9000000),
          httpOnly: true,
        });

        const result = {
          userValid,
          token,
        };
        res.status(201).json({ status: 201, result });
      }
    }
  } catch (error) {
    res.status(401).json(error);
    console.log("catch block");
    console.log(error);
  }
});

// user valid

Auth.get("/validuser", authenticate, async (req, res) => {
  try {
    const User = await userdb.findOne({ _id: req.userId });
    res.status(201).json({ status: 201, User });
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

// user logout

Auth.get("/logout", authenticate, async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
      return curelem.token !== req.token;
    });

    res.clearCookie("usercookie", { path: "/" });

    req.rootUser.save();

    res.status(201).json({ status: 201, message: "user has been logout" });
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

// send email Link For reset Password

Auth.post("/sendpasswordlink", async (req, res) => {
  console.log(req.body);

  const { email } = req.body;
  console.log(email);

  if (!email) {
    res.status(401).json({ status: 401, message: "Enter Your Email" });
  }

  try {
    const userfind = await userdb.findOne({ email: email });

    // token generate for reset password
    const token = jwt.sign({ _id: userfind._id }, keysecret, {
      expiresIn: "120s",
    });

    const setusertoken = await userdb.findByIdAndUpdate(
      { _id: userfind._id },
      { verifytoken: token },
      { new: true }
    );

    if (setusertoken) {
      const mailOptions = {
        from: "sanketapotikar1@gmail.com",
        to: email,
        subject: "Sending Email For password Reset",
        text: `This Link Valid For 2 MINUTES http://localhost:3000/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("error", error);
          res.status(401).json({ status: 401, message: "email not send" });
        } else {
          console.log("Email sent", info.response);
          res
            .status(201)
            .json({ status: 201, message: "Email sent Succsfully" });
        }
      });
    }
  } catch (error) {
    res.status(401).json({ status: 401, message: "invalid user" });
  }
});

// verify user for forgot password time

Auth.get("/forgotpassword/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  try {
    const validuser = await userdb.findOne({ _id: id, verifytoken: token });

    const verifyToken = jwt.verify(token, keysecret);

    console.log(verifyToken);

    if (validuser && verifyToken._id) {
      res.status(201).json({ status: 201, validuser });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

// change password

Auth.post("/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  const { password } = req.body;

  try {
    const validuser = await userdb.findOne({ _id: id, verifytoken: token });

    const verifyToken = jwt.verify(token, keysecret);

    if (validuser && verifyToken._id) {
      const newpassword = await bcrypt.hash(password, 12);

      const setnewuserpass = await userdb.findByIdAndUpdate(
        { _id: id },
        { password: newpassword }
      );

      setnewuserpass.save();
      res.status(201).json({ status: 201, setnewuserpass });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});


// POST :- Create new cart List

Auth.post("/newCartList", async (req, res) => {

  const CartList = new CartProductdb({});

  const List = await CartList.save();

  console.log(List);

  res
    .status(201)
    .json({ status: 201, message: `new list has been created`, List });
});

// get the cartProduct by user id

Auth.get("/cartlist", async (req, res) => {

  let cartList = [];

  try {

    const productCart = await CartProductdb.find();

    console.log(productCart);

    console.log(productCart.cartList);

    productCart ? (cartList = productCart.cartList) : cartList;

    res.status(201).json({ cartList , message:`cartlist recived`});

  } catch (error) {

    res.status(401).json({ status: 401, error });

  }
});

// Put method : to update cart list of user.

Auth.put("/updateCartList", async (req, res) => {
  const { cartList, userID } = req.body;
  console.log(cartList, userID);

  try {
    const newCartList = await CartProductdb.updateOne(
      { _id: userID },
      {
        $set: { cartList: cartList },
      }
    );

    console.log(newCartList);

    res.status(201).json({ newCartList });
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

module.exports = Auth;
