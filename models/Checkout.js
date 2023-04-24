const mongoose = require("mongoose")

const CheckoutSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: [true, "User Id Must Required"]
    },
    mode:{
        type:String,
        default:"COD"
    },
    paymentstatus:{
        type:String,
        default:"Panding"
    },
    date:{
        type:String,
        default:""
    },
    status:{
        type:String,
        default:"Order Placed"
    },
    totalAmount:{
        type:Number,
        required: [true, "Total Amount Must Required"]

    },
    shippingAmount:{
        type:Number,
        required: [true, "Shipping Amount Must Required"]

    },
    finalAmount:{
        type:Number,
        required: [true, "Final Amount Must Required"]

    },
    city:{
        type:String,
        required: [true, "Address Must Required"]

    },
    rzpid:{
        type:String,
        default:"0"

    },
   products:[{
    productid: {
        type: String,
        required: [true, "Product Id Must Required"]
    },
    name: {
        type: String,
        required: [true, "Product name Must Required"]
    },
    maincategory: {
        type: String,
        required: [true, "Product maincategory Must Required"]
    },
    subcategory: {
        type: String,
        required: [true, "Product subcategory Must Required"]
    },
    brand: {
        type: String,
        required: [true, "Product brand Must Required"]
    },
    color: {
        type: String,
        required: [true, "Product color Must Required"]
    },
    size: {
        type: String,
        required: [true, "Product size Must Required"]
    },
    price: {
        type: Number,
        required: [true, "Product price Must Required"]
    },
    qty: {
        type: Number,
        default:1
    },
    total: {
        type: Number,
        required: [true, "Product total Must Required"]
    },
    pic: {
        type: String,
        default:""
    }
   }]
})
const Checkout = new mongoose.model("Checkout", CheckoutSchema)
module.exports = Checkout