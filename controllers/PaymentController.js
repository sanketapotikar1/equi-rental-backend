const Payment = require("../models/paymentModel.js");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Razorpay key

const key_ID = "rzp_test_REhVavqqHmIlnX";
const Secret_Key_ID = "7SMy71EeMCn89taQhhoYIEQm";




module.exports.orders = (req, res) => {

  let instance = new Razorpay({ key_id: key_ID, key_secret: Secret_Key_ID })

  var options = {
      amount: req.body.amount * 100,  // amount in the smallest currency unit
      currency: "INR",
  };

  instance.orders.create(options, function (err, order) {
      if (err) {
          return res.send({ code: 500, message: 'Server Err.' })
      }
      return res.send({ code: 200, message: 'order created', data: order })
  });
}



module.exports.verfiy = (req, res) => {


  let body = req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;

  var expectedSignature = crypto.createHmac('sha256', Secret_Key_ID)
      .update(body.toString())
      .digest('hex');

  if (expectedSignature === req.body.response.razorpay_signature) {
      res.send({ code: 200, message: 'Sign Valid' });
  } else {

      res.send({ code: 500, message: 'Sign Invalid' });
  }
}

// store the data into data base
// functionlity yet to be implemented - half done

    // const finalPayment = new Payment({
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature,
    // });

    // const storeData = await finalPayment.save();
    // console.log(storeData);