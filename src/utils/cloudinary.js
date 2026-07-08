import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localfilepath) => {
    try {
        console.log("cloudinary:",localfilepath)
        if(!localfilepath) return null 
        //upload file to cloudinary 
      const response = await cloudinary.uploader
  .upload(localfilepath)
 

        console.log("clouudinary response",response)

        //file has been uploaded successfully
        console.log("file has been uploaded success fully",response.url)
        console.log(fs.unlinkSync(localfilepath))
        return response
    } catch (error) {
        fs.unlinkSync(localfilepath) //remove the locally saved temprory file as the uploaded operation got failed
        console.log("file uplade error")
        return null
    }
}

export {uploadOnCloudinary}