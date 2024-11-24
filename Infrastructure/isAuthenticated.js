const jwt = require("jsonwebtoken")
const isAuthenticated=(req,res,next)=>{
    try {
        const token=req.cookies.token
        if(!token){
            return res.status(200).json({
                success:false,
                message:"You need to login first"
            })
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
        if(!decoded){
            res.send("Something went wrong")
        }
        req.userId=decoded.userId
        next()
    } catch (error) {
        console.log(error)
    }
}
module.exports={
    isAuthenticated
}