import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectdb = async() =>{
    try {

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n monggose connected! host ${connectionInstance}`)
        console.log(connectionInstance.connection.host)
        


        
    } catch (error) {
        console.log(`mongodb connection error at ${process.env.MONGODB_URI}/${DB_NAME}`,error)
        
        process.exit(1)
    }
}

export default connectdb