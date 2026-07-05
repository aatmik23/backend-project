const asyncHandler = (requesthandler) => {
    return (req,res,next) => {
        Promise.resolve(requesthandler(req,res,next)).catch((err)=>next(err))
    }
}

export {asyncHandler}

// const asynHandler = (fn) => async(req,res,next)=>{
  
//     try{
//         await fn(req,res,next)

//     } catch(error){
//     res.status(error.code || 500).json({
//         status : false,
//         message : error.message || "Internal Server Error"
//     })
//     }


// }