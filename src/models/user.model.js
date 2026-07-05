import mongoose,{ Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import { useReducer } from "react";

const UserSchema = new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
            
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
           
            
        },
        fullname:{
            type: String,
            required: true,
            trim: true,
            index: true
           
            
        },
        avatar:{
            type: String, //cloudnairy url
            required: true
        },
        coverImage:{
            type: String //cloudinary url

        },
        watchhistory:[
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password:{
            type: String,
            required: [true, 'password is required']
        },
        refreshtoken:{
            type: string
        }


    }   ,{
        timestamps: true
    }
)

UserSchema.pre("save",async function(next){

    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password,10)
    next()
})

UserSchema.method.isPasswordCorrect = async function(password){
    await bcrypt.compare(password,this.password)
}

UserSchema.method.generateAccessToken = function(){
   return jwt.sign(
    {
        _id : this._id,
        email : this.email,
        username : this.username,
        fullname : this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn : ACCESS_TOKEN_EXPIRY
    }
   )
}

UserSchema.method.generateRefreshToken = function(){
   return jwt.sign(
    {
        _id : this._id, //have less ifno
      
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn : REFRESH_TOKEN_EXPIRY
    }
   )
}

router.route("/login").post(login)
export const User = mongoose.model("User",UserSchema)