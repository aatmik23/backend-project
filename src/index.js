import dotenv from "dotenv"
dotenv.config({
    'path': './.env'
})
import {app} from "./app.js"

import mongoose from "mongoose";
import connectdb from "./db/index.js"

console.log("process.env.PORT",process.env.PORT )

console.log("process.env.MONGODB_URI",process.env.MONGODB_URI)

connectdb()
.then(()=>{


    app.on("error",(error)=>{
        console.log("can talk error",error)
        throw error
    })

    app.listen(process.env.PORT || 8000,()=>{
        console.log(`serving on the port ${process.env.PORT || 8000}`)
    })
})
.catch((err)=>{
    console.log(`error in connection ${err}`)
})
/*
import express from "express"

const app = express()

(async ()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error",(error)=>{
        console.log("can talk error",error)
        throw error
       })

       app.listen(process.env.PORT,()=>{
        console.log(`server is running on port ${process.env.PORT}`)
       })
    } catch (error) {
        console.error("error",error)
    }

})()
    */