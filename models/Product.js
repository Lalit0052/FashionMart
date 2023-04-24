const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name Must Be Required"]
    },
    maincategory: {
        type: String,
        required: [true, "maincategory Must Be Required"]
    },
    subcategory: {
        type: String,
        required: [true, "subcategory Must Be Required"]
    },
    brand: {
        type: String,
        required: [true, "brand Must Be Required"]
    },
    color: {
        type: String,
        required: [true, "color Must Be Required"]
    },
    size: {
        type: String,
        required: [true, "size Must Be Required"]
    },
    baseprice: {
        type: Number,
        required: [true, "baseprice Must Be Required"]
    },
    discount: {
        type: Number,
        default:0
    },
    finalprice: {
        type: Number,
        required: [true, "finalprice Must Be Required"]
    },
    description: {
        type: String,
        default:"This is a Sample Product"
    },
    stock: {
        type: String,
        default:"In Stock"
    },
    pic1: {
        type: String,
        default:""
    },
    pic2: {
        type: String,
        default:""
    },
    pic3: {
        type: String,
        default:""
    },
    pic4: {
        type: String,
        default:""
    },
    date:{
        type: String,
        default:""
    }

})
const Product = new mongoose.model("Product", ProductSchema)
module.exports = Product