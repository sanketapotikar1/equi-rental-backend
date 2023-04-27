const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
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
    // maxlength: 256,
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
});

// createing model

const productdb = new mongoose.model("products", productSchema);

module.exports = productdb;
