const express = require("express")
const Maincategory = require("./models/Maincategory")
const Subcategory = require("./models/Subcategory")
const Brand = require("./models/brand")
const Product = require("./models/Product")
const User = require("./models/user")
const Cart = require("./models/Cart")
const Wishlist = require("./models/Wishlist")
const Newslatter = require("./models/Newslatter")
const Contact = require("./models/Contact")
const Checkout = require("./models/Checkout")

const Razorpay = require("razorpay")
const cors = require("cors")
const nodemailer = require("nodemailer")
const jsonwabtoken = require("jsonwebtoken")
const passwordValidator = require('password-validator')
const bcrypt = require('bcrypt')
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const dotenv = require("dotenv")
dotenv.config()
require("./dbconnect")

const app = express()
app.use(express.static(path.join(__dirname, "build")))
app.set(express.static(path.join(__dirname, "public")))
app.use(express.json())
app.use(cors())

app.use("/public", express.static("public"))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/images")
    },
    filename: function (req, file, cb) {

        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })
const schema = new passwordValidator();
schema
    .is().min(8)                                    // Minimum length 8
    .is().max(50)                                  // Maximum length 50
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits()                                // Must have at least 1 digits
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Password@123', 'Password123']);


const transpoter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.MAILSENDER,
        pass: process.env.PASSWORD
    }
})
function varifyTokenAdmin(req, res, next) {
    var token = req.headers["authorization"]
    var role = req.headers["role"]
    if (token) {
        jsonwabtoken.verify(token, process.env.JSONSALTKEY, (error, data) => {
            if (error) {
                res.send({ result: "Fail", message: "You Are Not Authorized For Access This Data" })
            }
            else {
                if (role == "Admin")
                    next()
                else
                    res.send({ result: "Fail", message: "You Are Not Authorized For Access This Data" })
            }
        })
    }
    else {
        res.send({ result: "Fail", message: "You Are Not Authorized For Access This Data" })
    }
}
function varifyToken(req, res, next) {
    var token = req.headers["authorization"]
    if (token) {
        jsonwabtoken.verify(token, process.env.JSONSALTKEY, (error, data) => {
            if (error) {
                res.send({ result: "Fail", message: "You Are Not Authorized For Access This Data" })
            }
            else {
                next()
            }
        })
    }
    else {
        res.send({ result: "Fail", message: "You Are Not Authorized For Access This Data" })
    }
}
//Api For Payment
app.post("/orders", varifyToken, async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.KEYID,
            key_secret: process.env.KEYSECRET
        })
        const options = {
            amount: req.body.amount * 100,
            currency: "INR"
        }
        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Internal Server Error" })
            }
            res.status(200).json({ data: order })
        })
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
        console.log(error);
    }
})
app.put("/verify", varifyToken, async (req, res) => {
    try {
        var check = await Checkout.findOne({ _id: req.body.checkid })
        check.rzpid = req.body.razorpay_payment_id
        check.paymentstatus = "Done"
        check.mode = "Net Banking"
        await check.save()
        var user = await User.findOne({ _id: check.userid })
        let mailOption = {
            from: process.env.MAILSENDER,
            to: user.gmail,
            subject: "Payment Successfull Thankyou  || Team VTSFashion ",
            text: "Thanks for The Shop On Fashion Mart your product Will devivered As Soon As Possible |||Team VTSFashion",
            attachments: {
                filename: 'success.jpg',
                path: __dirname + '/success.jpg',
                cid: 'success'
            }
        }
        transpoter.sendMail(mailOption, (error, data) => {
            if (error)
                console.log(error);
        })
        res.status(200).json({ result: "Done" })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })

    }
})
//Api For Maincategory
app.post("/maincategory", varifyTokenAdmin, async (req, res) => {
    try {
        const data = new Maincategory(req.body)
        await data.save()
        res.send({ result: "Done", message: "Maincategory Is Created|||" })
    }
    catch (error) {
        //  console.log(error);
        if (error.keyValue)
            res.status(400).send({ result: "Fail", message: "Maincategory Name is Already Exist" })
        else if (error.errors.name)
            res.status(400).send({ result: "Fail", message: error.errors.name.message })
        else
            res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }

})
app.get("/maincategory", async (req, res) => {
    try {
        const data = await Maincategory.find()
        res.send({ result: "Done", data: data })
    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.get("/maincategory/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Maincategory.findOne({ _id: req.params._id })
        if (data)
            res.send({ result: "Done", data: data })
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.put("/maincategory/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Maincategory.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name
            await data.save()
            res.send({ result: "Done", message: "Maincategory Updated|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.delete("/maincategory/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Maincategory.findOne({ _id: req.params._id })
        if (data) {
            await data.delete()
            res.send({ result: "Done", message: "Maincategory Deleted|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
//Api For Subcategory
app.post("/subcategory", varifyTokenAdmin, async (req, res) => {
    try {
        const data = new Subcategory(req.body)
        await data.save()
        res.send({ result: "Done", message: "Subcategory Is Created|||" })
    }
    catch (error) {
        //  console.log(error);
        if (error.keyValue)
            res.status(400).send({ result: "Fail", message: "Subcategory Name is Already Exist" })
        else if (error.errors.name)
            res.status(400).send({ result: "Fail", message: error.errors.name.message })
        else
            res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }

})
app.get("/subcategory", async (req, res) => {
    try {
        const data = await Subcategory.find()
        res.send({ result: "Done", data: data })
    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.get("/subcategory/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Subcategory.findOne({ _id: req.params._id })
        if (data)
            res.send({ result: "Done", data: data })
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.put("/subcategory/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Subcategory.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name
            await data.save()
            res.send({ result: "Done", message: "Subcategory Updated|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.delete("/subcategory/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Subcategory.findOne({ _id: req.params._id })
        if (data) {
            await data.delete()
            res.send({ result: "Done", message: "Subcategory Deleted|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
//Api For Brand
app.post("/brand", varifyTokenAdmin, async (req, res) => {
    try {
        const data = new Brand(req.body)
        await data.save()
        res.send({ result: "Done", message: "Brand Is Created|||" })
    }
    catch (error) {
        //  console.log(error);
        if (error.keyValue)
            res.status(400).send({ result: "Fail", message: "Brand Name is Already Exist" })
        else if (error.errors.name)
            res.status(400).send({ result: "Fail", message: error.errors.name.message })
        else
            res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }

})
app.get("/brand", async (req, res) => {
    try {
        const data = await Brand.find()
        res.send({ result: "Done", data: data })
    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.get("/brand/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Brand.findOne({ _id: req.params._id })
        if (data)
            res.send({ result: "Done", data: data })
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.put("/brand/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Brand.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name
            await data.save()
            res.send({ result: "Done", message: "Brand Updated|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.delete("/brand/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Brand.findOne({ _id: req.params._id })
        if (data) {
            await data.delete()
            res.send({ result: "Done", message: "Brand Deleted|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
//Api For product

app.post("/product", varifyTokenAdmin, upload.fields([
    { name: "pic1", maxcount: 1 },
    { name: "pic2", maxcount: 1 },
    { name: "pic3", maxcount: 1 },
    { name: "pic4", maxcount: 1 }
]), async (req, res) => {
    try {
        const data = new Product(req.body)
        if (req.files.pic1) {
            data.pic1 = req.files.pic1[0].filename
        }
        if (req.files.pic2) {
            data.pic2 = req.files.pic2[0].filename
        }
        if (req.files.pic3) {
            data.pic3 = req.files.pic3[0].filename
        }
        if (req.files.pic4) {
            data.pic4 = req.files.pic4[0].filename
        }
        await data.save()
        res.send({ result: "Done", message: "Product Is Created|||" })
    }
    catch (error) {
        //  console.log(error);

        if (error.errors.name)
            res.status(400).send({ result: "Fail", message: error.errors.name.message })
        else if (error.errors.maincategory)
            res.status(400).send({ result: "Fail", message: error.errors.maincategory.message })
        else if (error.errors.subcategory)
            res.status(400).send({ result: "Fail", message: error.errors.subcategory.message })
        else if (error.errors.brand)
            res.status(400).send({ result: "Fail", message: error.errors.brand.message })
        else if (error.errors.color)
            res.status(400).send({ result: "Fail", message: error.errors.color.message })
        else if (error.errors.size)
            res.status(400).send({ result: "Fail", message: error.errors.size.message })
        else if (error.errors.baseprice)
            res.status(400).send({ result: "Fail", message: error.errors.baseprice.message })
        else if (error.errors.finalprice)
            res.status(400).send({ result: "Fail", message: error.errors.finalprice.message })

        else
            res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }

})
app.get("/product", async (req, res) => {
    try {
        const data = await Product.find()
        res.send({ result: "Done", data: data })
    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.get("/product/:_id", async (req, res) => {
    try {
        const data = await Product.findOne({ _id: req.params._id })
        if (data)
            res.send({ result: "Done", data: data })
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.put("/product/:_id", varifyTokenAdmin, upload.fields([
    { name: "pic1", maxcount: 1 },
    { name: "pic2", maxcount: 1 },
    { name: "pic3", maxcount: 1 },
    { name: "pic4", maxcount: 1 }
]), async (req, res) => {
    try {
        const data = await Product.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name ?? data.name
            data.maincategory = req.body.maincategory ?? data.maincategory
            data.subcategory = req.body.subcategory ?? data.subcategory
            data.brand = req.body.brand ?? data.brand
            data.color = req.body.color ?? data.color
            data.size = req.body.size ?? data.size
            data.baseprice = req.body.baseprice ?? data.baseprice
            data.discount = req.body.discount ?? data.discount
            data.finalprice = req.body.finalprice ?? data.finalprice
            data.description = req.body.description ?? data.description
            data.stock = req.body.stock ?? data.stock
            if (req.files.pic1) {
                try {
                    fs.unlinkSync(`./public/images/${data.pic1}`)
                } catch (error) { }
                data.pic1 = req.files.pic1[0].filename
            }
            if (req.files.pic2) {
                try {
                    fs.unlinkSync(`./public/images/${data.pic2}`)
                } catch (error) { }
                data.pic2 = req.files.pic2[0].filename
            }
            if (req.files.pic3) {
                try {
                    fs.unlinkSync(`./public/images/${data.pic3}`)
                } catch (error) { }
                data.pic3 = req.files.pic3[0].filename
            }
            if (req.files.pic4) {
                try {
                    fs.unlinkSync(`./public/images/${data.pic4}`)
                } catch (error) { }
                data.pic4 = req.files.pic4[0].filename
            }
            await data.save()
            res.send({ result: "Done", message: "Product Updated|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.delete("/product/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Product.findOne({ _id: req.params._id })
        if (data) {
            await data.delete()
            fs.unlinkSync(`./public/images/${data.pic1}`)
            fs.unlinkSync(`./public/images/${data.pic2}`)
            fs.unlinkSync(`./public/images/${data.pic3}`)
            fs.unlinkSync(`./public/images/${data.pic4}`)
            res.send({ result: "Done", message: "Product Deleted|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
//Api For User
app.post("/user", async (req, res) => {
    try {
        if (schema.validate(req.body.password)) {
            bcrypt.hash(req.body.password, 5, async function (err, hash) {
                const data = new User(req.body)
                data.password = hash
                await data.save()
                let mailOption = {
                    from: process.env.MAILSENDER,
                    to: data.gmail,
                    subject: "Thanks To Create Account ON  FashionMart || Team VTSFashion ",
                    text: "Your Account has been Created Please Do Not Shere Your Account Details To AnyOne ThankYou||| We Send Email Regarding Latest Product & Offers"
                }
                transpoter.sendMail(mailOption, (error, data) => {
                    if (error)
                        console.log(error);
                })
                res.send({ result: "Done", message: "User Is Created|||" })
            })
        }
        else
            res.send({ result: "Fail", message: "Invalid Password!!Password Must Have MIN 8 Length & One Lowercase,Uppercase & Digit" })

    }
    catch (error) {
        console.log(error);
        if (error.errors.keyValue)
            res.status(400).send({ result: "Fail", message: "User Name & Email is Already Registered" })
        else if (error.errors.name)
            res.status(400).send({ result: "Fail", message: error.errors.name.message })
        else if (error.errors.username)
            res.status(400).send({ result: "Fail", message: error.errors.username.message })
        else if (error.errors.gmail)
            res.status(400).send({ result: "Fail", message: error.errors.gmail.message })
        else if (error.errors.phone)
            res.status(400).send({ result: "Fail", message: error.errors.phone.message })
        else if (error.errors.password)
            res.status(400).send({ result: "Fail", message: error.errors.password.message })

        else
            res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }

})
app.get("/user", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await User.find()
        res.send({ result: "Done", data: data })
    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.get("/user/:_id", varifyToken, async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.params._id })
        if (data)
            res.send({ result: "Done", data: data })
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.put("/user/:_id", varifyToken, upload.single("pic"), async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name ?? data.name
            data.phone = req.body.phone ?? data.phone
            data.addressline1 = req.body.addressline1 ?? data.addressline1
            data.addressline2 = req.body.addressline2 ?? data.addressline2
            data.addressline3 = req.body.addressline3 ?? data.addressline3
            data.pin = req.body.pin ?? data.pin
            data.city = req.body.city ?? data.city
            data.state = req.body.state ?? data.state
            if (req.file) {
                try {
                    fs.unlinkSync(`./public/images/${data.pic}`)
                }
                catch (error) { }
                data.pic = req.file.filename
            }
            await data.save()
            res.send({ result: "Done", message: "User Updated|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.delete("/user/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.params._id })
        if (data) {
            if (data.pic) {
                fs.unlinkSync(`./public/images/${data.pic}`)
            }
            await data.delete()
            res.send({ result: "Done", message: "User Deleted|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
//Api For Cart
app.post("/cart", async (req, res) => {
    try {
        const data = new Cart(req.body)
        await data.save()
        res.send({ result: "Done", message: "Cart Is Created|||" })
    }
    catch (error) {
        console.log(error);
        if (error.errors.userid)
            res.status(400).send({ result: "Fail", message: error.errors.userid.message })
        else if (error.errors.productid)
            res.status(400).send({ result: "Fail", message: error.errors.productid.message })
        else if (error.errors.name)
            res.status(400).send({ result: "Fail", message: error.errors.name.message })
        else if (error.errors.maincategory)
            res.status(400).send({ result: "Fail", message: error.errors.maincategory.message })
        else if (error.errors.subcategory)
            res.status(400).send({ result: "Fail", message: error.errors.subcategory.message })
        else if (error.errors.brand)
            res.status(400).send({ result: "Fail", message: error.errors.brand.message })
        else if (error.errors.color)
            res.status(400).send({ result: "Fail", message: error.errors.color.message })
        else if (error.errors.size)
            res.status(400).send({ result: "Fail", message: error.errors.size.message })
        else if (error.errors.price)
            res.status(400).send({ result: "Fail", message: error.errors.price.message })
        else if (error.errors.total)
            res.status(400).send({ result: "Fail", message: error.errors.total.message })

        else
            res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }

})
app.get("/cartAll/:userid", varifyToken, async (req, res) => {
    try {
        const data = await Cart.find({ userid: req.params.userid })
        res.send({ result: "Done", data: data })
    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.get("/cart/:_id", varifyToken, async (req, res) => {
    try {
        const data = await Cart.findOne({ _id: req.params._id })
        if (data)
            res.send({ result: "Done", data: data })
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.put("/cart/:_id", varifyToken, async (req, res) => {
    try {
        const data = await Cart.findOne({ _id: req.params._id })
        if (data) {
            data.qty = req.body.qty
            data.total = req.body.total
            await data.save()
            res.send({ result: "Done", message: "Cart Updated|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.delete("/cart/:_id", varifyToken, async (req, res) => {
    try {
        const data = await Cart.findOne({ _id: req.params._id })
        if (data) {
            await data.delete()
            res.send({ result: "Done", message: "Cart Deleted|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.delete("/cartAll/:userid", varifyToken, async (req, res) => {
    try {
        const data = await Cart.deleteMany({ userid: req.params.userid })

        res.send({ result: "Done", message: "All Cart Deleted|||" })
    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
//Api For Wishlist
app.post("/wishlist", varifyToken, async (req, res) => {
    try {
        const data = new Wishlist(req.body)
        await data.save()
        res.send({ result: "Done", message: "Wishlist Is Created|||" })
    }
    catch (error) {
        //  console.log(error);
        if (error.errors.userid)
            res.status(400).send({ result: "Fail", message: error.errors.userid.message })
        else if (error.errors.productid)
            res.status(400).send({ result: "Fail", message: error.errors.productid.message })
        else if (error.errors.name)
            res.status(400).send({ result: "Fail", message: error.errors.name.message })
        else if (error.errors.maincategory)
            res.status(400).send({ result: "Fail", message: error.errors.maincategory.message })
        else if (error.errors.subcategory)
            res.status(400).send({ result: "Fail", message: error.errors.subcategory.message })
        else if (error.errors.brand)
            res.status(400).send({ result: "Fail", message: error.errors.brand.message })
        else if (error.errors.color)
            res.status(400).send({ result: "Fail", message: error.errors.color.message })
        else if (error.errors.size)
            res.status(400).send({ result: "Fail", message: error.errors.size.message })
        else if (error.errors.price)
            res.status(400).send({ result: "Fail", message: error.errors.price.message })
        else if (error.errors.total)
            res.status(400).send({ result: "Fail", message: error.errors.total.message })

        else
            res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }

})
app.get("/wishlist/:userid", varifyToken, async (req, res) => {
    try {
        const data = await Wishlist.find({ userid: req.params.userid })
        res.send({ result: "Done", data: data })
    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})


app.delete("/wishlist/:_id", varifyToken, async (req, res) => {
    try {
        const data = await Wishlist.findOne({ _id: req.params._id })
        if (data) {
            await data.delete()
            res.send({ result: "Done", message: "Wishlist Deleted|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
//Api For Newslatter
app.post("/newslatter", async (req, res) => {
    try {
        const data = new Newslatter(req.body)
        await data.save()
        let mailOption = {
            from: process.env.MAILSENDER,
            to: data.gmail,
            subject: "Thanks for Subscribe|| Team VTSFashion ",
            text: "Thanks to Subscribe Our Newslatter Services||| We Send Email Regarding Latest Product & Offers"
        }
        transpoter.sendMail(mailOption, (error, data) => {
            if (error)
                console.log(error);
        })
        res.send({ result: "Done", message: "Thanks to Subscribe Our Newslatter Services||| We Send Email Regarding Latest Product & Offers" })
    }
    catch (error) {
        //  console.log(error);
        if (error.keyValue)
            res.status(400).send({ result: "Fail", message: "You Already Subscribe" })
        else if (error.errors.gmail)
            res.status(400).send({ result: "Fail", message: error.errors.gmail.message })
        else
            res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }

})
app.get("/newslatter", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Newslatter.find()
        res.send({ result: "Done", data: data })
    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})

app.delete("/newslatter/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Newslatter.findOne({ _id: req.params._id })
        if (data) {
            await data.delete()
            res.send({ result: "Done", message: "Newslatter Deleted|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
//Api For Contact
app.post("/contact", varifyToken, async (req, res) => {
    try {
        const data = new Contact(req.body)
        await data.save()
        res.send({ result: "Done", message: "Our Team Will Contact You To As Soon As Possible|||Team VtsFashion" })
    }
    catch (error) {

        if (error.errors.name)
            res.status(400).send({ result: "Fail", message: error.errors.name.message })

        else if (error.errors.gmail)
            res.status(400).send({ result: "Fail", message: error.errors.gmail.message })

        else if (error.errors.phone)
            res.status(400).send({ result: "Fail", message: error.errors.phone.message })

        else if (error.errors.subject)
            res.status(400).send({ result: "Fail", message: error.errors.subject.message })

        else if (error.errors.message)
            res.status(400).send({ result: "Fail", message: error.errors.message.message })
        else
            res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }

})
app.get("/contact", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Contact.find()
        res.send({ result: "Done", data: data })
    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.get("/contact/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Contact.findOne({ _id: req.params._id })
        if (data)
            res.send({ result: "Done", data: data })
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.put("/contact/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Contact.findOne({ _id: req.params._id })
        if (data) {
            data.status = req.body.status
            await data.save()
            res.send({ result: "Done", message: "Contact Updated|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.delete("/contact/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Contact.findOne({ _id: req.params._id })
        if (data) {
            await data.delete()
            res.send({ result: "Done", message: "Contact Deleted|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
//Api For Checkout
app.post("/checkout", varifyToken, async (req, res) => {
    try {
        const data = new Checkout(req.body)
        await data.save()
        var user = await User.findOne({ _id: data.userid })
        let mailOption = {
            from: process.env.MAILSENDER,
            to: user.gmail,
            subject: "Thanks for Shop on VTS Fashion || Team VTSFashion ",
            text: "Thanks for The Shop On Fashion Mart your product Will devivered As Soon As Possible |||Team VTSFashion",
        }
        transpoter.sendMail(mailOption, (error, data) => {
            if (error)
                console.log(error);
        })
        res.send({ result: "Done", message: "Checkout Is Created|||" })

    }
    catch (error) {
        //  console.log(error);
        if (error.errors.userid)
            res.status(400).send({ result: "Fail", message: error.errors.userid.message })
        else if (error.errors.totalAmount)
            res.status(400).send({ result: "Fail", message: error.errors.totalAmount.message })
        else if (error.errors.shippingAmount)
            res.status(400).send({ result: "Fail", message: error.errors.shippingAmount.message })
        else if (error.errors.finalAmount)
            res.status(400).send({ result: "Fail", message: error.errors.finalAmount.message })
        else if (error.errors.city)
            res.status(400).send({ result: "Fail", message: error.errors.city.message })
        else if (error.errors.productid)
            res.status(400).send({ result: "Fail", message: error.errors.productid.message })
        else if (error.errors.name)
            res.status(400).send({ result: "Fail", message: error.errors.name.message })
        else if (error.errors.maincategory)
            res.status(400).send({ result: "Fail", message: error.errors.maincategory.message })
        else if (error.errors.subcategory)
            res.status(400).send({ result: "Fail", message: error.errors.subcategory.message })
        else if (error.errors.brand)
            res.status(400).send({ result: "Fail", message: error.errors.brand.message })
        else if (error.errors.color)
            res.status(400).send({ result: "Fail", message: error.errors.color.message })
        else if (error.errors.size)
            res.status(400).send({ result: "Fail", message: error.errors.size.message })
        else if (error.errors.price)
            res.status(400).send({ result: "Fail", message: error.errors.price.message })
        else if (error.errors.total)
            res.status(400).send({ result: "Fail", message: error.errors.total.message })
        else
            res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }

})
app.get("/checkoutAll", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Checkout.find()
        res.send({ result: "Done", data: data })
    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.get("/checkout/:_id", varifyToken, async (req, res) => {
    try {
        const data = await Checkout.findOne({ _id: req.params._id })
        if (data)
            res.send({ result: "Done", data: data })
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.get("/checkoutUser/:userid", varifyToken, async (req, res) => {
    try {
        const data = await Checkout.find({ userid: req.params.userid })
        if (data)
            res.send({ result: "Done", data: data })
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID" })

    }
    catch (error) {
        console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})
app.put("/checkout/:_id", varifyTokenAdmin, async (req, res) => {
    try {
        const data = await Checkout.findOne({ _id: req.params._id })
        if (data) {
            data.mode = req.body.mode ?? data.mode
            data.status = req.body.status ?? data.status
            data.paymentstatus = req.body.paymentstatus ?? data.paymentstatus
            data.rzpid = req.body.rzpid ?? data.rzpid
            await data.save()
            res.send({ result: "Done", message: "Checkout Updated|||" })
        }
        else
            res.status(404).send({ result: "Fail", message: "Invelid Request and ID |||" })

    }
    catch (error) {
        //  console.log(error);
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
    }
})

//Api For Login
app.post("/login", async (req, res) => {
    try {
        const data = await User.findOne({ username: req.body.username })
        if (data) {
            if (await bcrypt.compare(req.body.password, data.password)) {

                jsonwabtoken.sign({ data }, process.env.JSONSALTKEY, async (error, token) => {
                    if (error) {
                        console.log(error)
                        res.status(500).send({ result: "Fail", message: "Internal Server Error" })
                    }
                    else {
                        if (data.tokens.length < 5) {
                            data.tokens.push(token)
                            await data.save()
                            res.send({ result: "Done", data: data, token: token })
                        }
                        else
                            res.status(400).send({ result: "Fail", message: "Account Is Logged In From Another Devices !! Reset Your Password" })
                    }
                })
            }
            else
                res.send({ result: "Fail", message: "UserName and Password Incorrect " })

        }
        else
            res.send({ result: "Fail", message: "UserName and Password Incorrect " })
    }
    catch (error) {
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }

})
//Api For Logout
app.post("/logout", async (req, res) => {
    try {
        const data = await User.findOne({ username: req.body.username })
        if (data) {
            let index = data.tokens.findIndex((item) => item === req.body.token)
            if (index !== -1) {
                data.tokens.splice(index, 1)
                await data.save()
            }
        }
        res.send({ result: "Done", message: "Loguot Successfull" })
    }
    catch (error) {
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }

})

//Api For Reset Password
app.post("/resetpassword-user", async (req, res) => {
    try {
        const data = await User.findOne({ username: req.body.username })
        if (data) {
            let num = parseInt(Math.random() * 1000000)
            data.otp = num
            await data.save()
            let mailOption = {
                from: process.env.MAILSENDER,
                to: data.gmail,
                subject: "Your OTP For Reset Password || Team VTSFashion ",
                text: `Your OTP Is ${num} For Reset Password !!! Please Do Not Share Your OTP With Anyone!!Team VTSFashion`
            }
            transpoter.sendMail(mailOption, (error, data) => {
                if (error)
                    console.log(error);
            })

            res.send({ result: "Done", message: "OTP Sent On Your Register Email ID" })
        }
        else
            resstatus(404).send({ result: "Fail", message: "Invalid UserName" })
    }

    catch (error) {
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }

})
app.post("/resetpassword-otp", async (req, res) => {
    try {
        const data = await User.findOne({ username: req.body.username })

        if (data.otp === req.body.otp) {
            res.send({ result: "Done" })
        }
        else
            res.status(404).send({ result: "Done", message: "Invalid OTP !! Try Again" })
    }
    catch (error) {
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }

})
app.post("/resetpassword-password", async (req, res) => {
    try {
        const data = await User.findOne({ username: req.body.username })
        if (data) {
            if (schema.validate(req.body.password)) {
                bcrypt.hash(req.body.password, 5, async function (err, hash) {
                    data.password = hash
                    data.tokens = []
                    await data.save()
                    res.send({ result: "Done", message: "Your password is reset|||" })
                    let mailOption = {
                        from: process.env.MAILSENDER,
                        to: data.gmail,
                        subject: "Your Reset Password Successful || Team VTSFashion ",
                        text: "Your Account Password Is Reset Successfull!!! Please Do Not Share Your Password With Anyone!!Team VTSFashion"
                    }
                    transpoter.sendMail(mailOption, (error, data) => {
                        if (error)
                            console.log(error);
                    })
                })
            }
            else
                res.send({ result: "Fail", message: "Invalid Password!!Password Must Have MIN 8 Length & One Lowercase,Uppercase & Digit" })


        }
    }
    catch (error) {
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }

})
//Api For Search
app.post("/search", async (req, res) => {
    try {
        const data = await Product.find({
            $or: [
                { name: { $regex: `.*${req.body.search}.*`, $options: "i" } },
                { maincategory: { $regex: `.*${req.body.search}.*`, $options: "i" } },
                { subcategory: { $regex: `.*${req.body.search}.*`, $options: "i" } },
                { brand: { $regex: `.*${req.body.search}.*`, $options: "i" } },
                { size: { $regex: `.*${req.body.search}.*`, $options: "i" } },
                { color: { $regex: `.*${req.body.search}.*`, $options: "i" } },
                { description: { $regex: `.*${req.body.search}.*`, $options: "i" } }
            ]
        })
        res.send({ result: "Done", data: data })
    }
    catch (error) {
        res.status(500).send({ result: "Fail", message: "Internal Server Error" })

    }
})
app.use("*", express.static(path.join(__dirname, "build")))

app.listen(process.env.PORT || 8080, () => {
    console.log("server is running at port 8080");
})