import { Apierror } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken
        console.log("token:",token)
        if(!token){
            throw new Apierror(401,"Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user =  await User.findById(decodedToken._id).
        select("-password -refreshtoken")
    
        if(!user){
            throw new Apierror(401,"invalid access token")
            
        }
    
        req.user = user
        console.log(req.user)
        console.log
    
        next()
    } catch (error) {
        throw new Apierror(401,error?.message || "invalid access token")
    }
    
})