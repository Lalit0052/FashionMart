const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name Must Be Required"]
    },
    username: {
        type: String,
        unique: true,
        required: [true, "Username Must Be Required"]
    },
    gmail: {
        type: String,
        unique:[true,"User Name & Email is Already Registered"],
        required: [true, "Gmail Must Be Required"]
    },
    phone: {
        type: Number,
        required: [true, "Phone Number Must Be Required"]
    },
    password: {
        type: String,
        required: [true, "Password Must Be Required"]
    },
    role: {
        type: String,
        default: "User"
    },
    addressline1: {
        type: String,
        default: ""
    },
    addressline2: {
        type: String,
        default: ""
    },
    addressline3: {
        type: String,
        default: ""
    },
    pin: {
        type: Number,
        default: 0
    },
    city: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    pic: {
        type: String,
        default: ""
    },
    otp: {
        type: Number,
        default: 0
    },
    tokens: []

})
const User = new mongoose.model("User", UserSchema)
module.exports = User