const mongoose = require("mongoose");

const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

//cart schema
const cartSchema = new mongoose.Schema({
  pname: {
    type: String,
    required: true,
    trim: true,
  },

  price: {
    type: Number,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  picture: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: false,
    default: "other",
  },

  quantity: {
    type: Number,
    default: 1,
  },
});

//user details schema
const userdetails = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  mobile: { type: Number },
  city: { type: String },
  pincode: { type: Number },
  address1: { type: String },
  address2: { type: String },
});

// cart product schema
const cartProductSchema = new mongoose.Schema({


  cartList: {
    type: [cartSchema],
  },

  userdetails: {
    type: userdetails,
  },
});

// createing model

const CartProductdb = new mongoose.model("CartProducts", cartProductSchema);

module.exports = CartProductdb;
