import jwt from 'jsonwebtoken'
const fetchuer=(req,res,next)=>{
    try {
        const authtoken= req.header("auth-token")
        if(!authtoken){
            return res.status(404).json({"massage":"Invalid Auth token"})
         }
         const data= jwt.verify(authtoken,process.env.JWT_SERECT)
         console.log(data)
         req.user=data.user
         next();
    } catch (error) {
         console.log(error)
         return res.status(500).json({"error":"Intarnal server error"})
    }

}
export default fetchuer;