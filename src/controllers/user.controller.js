import {asyncHandler} from "../utils/asynchandler.js"
import {Apierror} from "../utils/Apierror.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { Apiresponse } from "../utils/Apiresponse.js"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"

const genreateAccessTokenandRefreshToken = async(userId) =>{
    const user = await User.findById(userId)
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    //save it into database refreshtoken
    user.refreshtoken = refreshToken

    console.log("accestoke",accessToken,"refreshtoken",refreshToken)
    //save will run password hash we are not passing password
    await user.save({ validateBeforeSave: false})

    return {accessToken,refreshToken}
}


const registerUser = asyncHandler( async (req,res)=>{
    //get user details from frontend
    //validation not empty
    //check if user already exist: username, email 
    //check for the imaegs avatar
    //upload them into cloudinary,avtar 
    //create user object - create entery in db
    //remove password and refresh tokenfield
    //check for user creation
    //return res 

    const {fullname,email,username,password} = req.body
    console.log("email:",email,fullname,username,password)

    if (
        [fullname,email,username,password].some((field)=> field?.trim() === "")
    ){
        throw new Apierror(400,"all field are required")
        console.log(error1)

    }

    console.log("before esiteduser")

   const existeduser = await User.findOne(
        {
            $or: [{ username },{ email }]

        }
    )
    console.log(existeduser)
   if(existeduser){
   console.log("existed user",existeduser)
    throw new Apierror(409,"user with this email and username already exist")
   }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log(avatarLocalPath)
  const coverImageLocalPath = req.files?.coverimage[0]?.path
  console.log(coverImageLocalPath)

  if(!avatarLocalPath){
    throw new Apierror(400,"Avatar file is required")
  } 

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){
        throw new Apierror(400,"Avatar file is required")
   }

   const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()

   })

   const createdUser = await User.findById(user._id).select(
    "-password -refreshtoken"
   )

   if(!createdUser){
      throw new Apierror(500,"some error occured during registration")
   }
    
   return res.status(200).json(
    new Apiresponse(200,createdUser,"user successful;y registered")
   )
    
})

const loginUser = asyncHandler(async(req,res)=>{
    //req.body data
    //username and email
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const {username,email,password} = req.body
    console.log(username,password)

    if (!username && !email){
        throw new Apierror(400,"username and password is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })
    console.log(user)
    if(!user){
        throw new Apierror("user not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)//method is available in user not it User
    console.log(isPasswordValid)
     
    if(!isPasswordValid){
        throw new Apierror(401, "password is incorrect")
    }
     
    const {accessToken,refreshToken} = await genreateAccessTokenandRefreshToken(user._id)

        //user does not have refreshtoken as we called it after so we have to call it again
    const loginUser = await User.findById(user._id)
    .select("-password -refreshToken")


    const options = {
        httpOnly: true,
        secure: true
    }

    

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new Apiresponse(200,
            {
                user: loginUser,
                accessToken,
                refreshToken
            },
            "user logged in successfully"

        )
    )



    
})


const logoutUser = asyncHandler(async(req,res)=>{
    console.log("logoutuser")
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshtoken: undefined
            }
        },
        {
            new: true
        }
    )

        const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new Apiresponse(200,
            {

            },
            "user loggedout successfully"

        )
    )

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    //refreshtoken from cookie
    const token = req.cookies.refreshToken || req.body.refreshToken

    if(!token){
       throw new Apierror(401,"token not  found ")
    }

   const decodeToken= jwt.verify(token,process.env.REFRESH_TOKEN_SECRET)

   const user = await User.findById(decodeToken._id)

   if(!user){
    throw new Apierror(401,"user not found")
   }

   if(token !== user.refreshtoken){
    throw new Apierror(401,"refresh token is expired or used")
   }
   
   const {accessToken,refreshToken} = await genreateAccessTokenandRefreshToken(user._id)

   const options = {
    httpOnly : true,
    secure : true
   }

  return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new Apiresponse(
        200,
        {
            accessToken,
            refreshToken
        },
        "refreshtokengenerated"
    )
   )

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{

    const {oldPassword,newPassword} = req.body

    const user =  await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new Apierror(401,"password is not correct")
    }

    user.password = newPassword

    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new Apiresponse(
            200,
            {},
            "password change succesfully"
        )
    )


})

const getCurrentUser = asyncHandler(async(req,res)=>{

    return res
    .status(200)
    .json(
        new Apiresponse(
            200,
            req.user,
            "get current user successfully"
        )
    )
})

const updateAccountDeatails = asyncHandler(async(req,res)=>{

    const {fullname,email} = req.body

    if(!fullname && !email){
        throw new Apierror(401,"fullname and email is required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                email,
                fullname
            }
        },
        {
            new: true
        }
        
    ).select("-password")


    return res
    .status(200)
    .json(
        new Apiresponse(
            200,
            user,
            "account deatils updated successfully"
        )
    )

})

const updateUserAvatar = asyncHandler(async(req,res)=>{

    const avatarLocalPath = req.file?.avatar

    if(!avatarLocalPath){
        throw new Apierror(401,"avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new Apierror(400,"error while uploding on avatar")
    }

   const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        { new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new Apiresponse(
            200,
            user,
            "avatar updated successfully"
        )
    )

})

const updateUserCoverImage = asyncHandler(async(req,res)=>{

    const coverImageLocalPath = req.file?.coverimage

    if(!coverImageLocalPath){
        throw new Apierror(401,"coverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new Apierror(400,"error while uploding on coverimage")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        { new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new Apiresponse(
            200,
            user,
            "coverimage updated successfully"
        )
    )


})

const getUserChannelProfile = asyncHandler(async (req,res)=>{

    const {username} =req.params

    if(!username?.trim()){
        throw new Apierror(400,"username is missing")

    }

    const channel = await User.aggregate([
     {
        $match:{
            username: username?.toLowerCase()
        }
     },
     {
        $lookup:{
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
     },
     {
        $lookup:{
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribteTo"
            
        }
     },
     {
        $addFields:{
            subscriberCount:{
                $size: "$subscribers"
            },

            channelSubscribedToCount:{
                $size: "$subscribteTo"
            },
            isSubscribed:{
                $cond:{
                    if:{
                        $in:[req.user?._id,"$subscribers.subscriber"]
                    },
                    then:true,
                    else:false
                }
            }
        }
     },
     {
        $project:{
            fullname:1,
            username:1,
            subscriberCount:1,
             channelSubscribedToCount:1,
             isSubscribed:1,
             avatar:1,
             coverImage:1,
             email:1
            
        }
     }
    ]
    )

    if (!channel?.length){
        throw new Apierror(400,"channel does not exist")
    }
    
    return res
    .status(200)
    .json(
        new Apiresponse(200,
            channel[0],
            "user channel fetched successfully"
        )
    )
})

const getWatchHistory = asyncHandler(async(req,res)=>{

    const user = await User.aggregate([
            {
                 $match: {
            _id : new mongoose.Types.ObjectId(req.user._id)
        },
            },
            {
                $lookup: {
                    from : "videos",
                    localField: "watchhistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline:[
                        {
                            $lookup:{
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline:[
                                    {
                                        $project:{
                                            fullname:1,
                                            username:1,
                                            avatar:1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields:{
                                owner:{
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }
       
    ])


return res
.status(200)
.json(
    new Apiresponse(200,
        user[0].watchhistory,
        "watchh history fetched successfully"
        
    )
)
})






export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDeatails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory

    
}  