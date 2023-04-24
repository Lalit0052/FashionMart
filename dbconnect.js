const mongoose=require("mongoose")

mongoose.connect(process.env.DBKEY)
.then(()=>console.log("Data Base IS Connected"))
.catch((error)=>console.log(error))