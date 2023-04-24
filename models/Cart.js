const mongoose = require("mongoose")

const CartSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: [true, "User Id Must Be Required"]
    },
    productid: {
        type: String,
        required: [true, "Product Id Must Be Required"]
    },
    name: {
        type: String,
        required: [true, "Product name Must Be Required"]
    },
    maincategory: {
        type: String,
        required: [true, "Product maincategory Must Be Required"]
    },
    subcategory: {
        type: String,
        required: [true, "Product subcategory Must Be Required"]
    },
    brand: {
        type: String,
        required: [true, "Product brand Must Be Required"]
    },
    color: {
        type: String,
        required: [true, "Product color Must Be Required"]
    },
    size: {
        type: String,
        required: [true, "Product size Must Be Required"]
    },
    price: {
        type: Number,
        required: [true, "Product price Must Be Required"]
    },
    qty: {
        type: Number,
        default:1
    },
    total: {
        type: Number,
        required: [true, "Product total Must Be Required"]
    },
    date: {
        type: String,
        default:""
    },
    pic: {
        type: String,
        default:""
    }
})
const Cart = new mongoose.model("Cart", CartSchema)
module.exports = Cart