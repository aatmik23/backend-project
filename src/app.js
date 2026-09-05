import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,

}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true,limit: '16kb'})) //express struglle with nested object use true
app.use(express.static("public"))
app.use(cookieParser())




//routes import 
import userRoutes from "./routes/user.route.js"

//routes declaration 
app.use("/api/v1/users", userRoutes)

app.use((err, req, res, next) => {
    const statuscode = err.statuscode || 500
    const message = err.message || "Internal Server Error"

    return res.status(statuscode).json({
        success: false,
        message: message,
        
    })
})

//http://localhost:8000/api/v1/users/register

export {app}