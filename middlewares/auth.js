const jwt = require("jsonwebtoken")

module.exports = (req,res,next) => {

     const authorization = req.headers.authorization;
    if(!authorization){
        return res.json({"message": "Authorization"})
    }
    try{
        const token = authorization.split(" ")[1]
        const decode = jwt.verify(token, secretCode)
        req.user = decode.user
        next()

    } catch(err){
        return res.json({"message":"Token is invaliid or expired"})
    }
}

