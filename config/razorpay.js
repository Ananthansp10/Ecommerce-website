const Razorpay = require('razorpay');
require('dotenv').config();

const razorpay = new Razorpay({
    key_id:'rzp_test_eYEkAK8go023r8',
    key_secret:'VQvZkTc0GqjyY1N3cg0acQYU',
});

module.exports = razorpay;
