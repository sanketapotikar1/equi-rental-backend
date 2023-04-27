const express = require("express");
const router = new express.Router();
const userdb = require("../models/userSchema");
const productdb = require("../models/productSchema");
const authenticate = require("../middleware/authenticate");
const paymentController = require('../controllers/PaymentController')
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// GET - get all Product list

router.get("/products", async (req, res) => {
  const products = await productdb.find();

  res.status(201).json({ status: 201, products: products });
});

// GET - get single product -- having problem with id

router.get("/products/:id", async (req, res) => {
  const body = req.body;
  console.log(body);

  const products = await productdb.findOne(body);

  res.status(201).json({ status: 201, products: products });
});

// POST - add single product

router.post("/addproducts", async (req, res) => {
  const body = req.body;
  console.log(body);

  const { pname, price, picture, description,category } = req.body;

  if (!pname || !price || !picture || !description) {
    res.status(422).json({ error: "fill all the details" });
  }

  try {
    const finalUser = new productdb({
      pname,
      price,
      picture,
      description,
      category
    });

    const storeData = await finalUser.save();

    console.log(storeData);
    res.status(201).json({ status: 201, storeData });
  } catch (error) {
    res.status(422).json(error);
    console.log("catch block error");
  }
});

// update single product

router.put("/products/:id", async (req, res) => {
  res
    .status(201)
    .json({ status: 201, message: "your product has been updated" });
});

// delete single product

router.get("/products/:id", async (req, res) => {
  res
    .status(201)
    .json({ status: 201, message: "your product has been deleted" });
});


// Razorpay order API
router.post('/orders', paymentController.orders)


// Razorpay verify API
router.post('/verify', paymentController.verfiy)



module.exports = router;
