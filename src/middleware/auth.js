const jwt = require("jsonwebtoken");

const Register = require("../models/registers");

const auth = async (req,res,next) =>{
    try{
        const token = req.cookies.jwt;
        const verifyUSer = jwt.verify(token,"process.env.SECRET_KEY");
        console.log(verifyUSer);
        next();
    }catch(e){
        res.status(401).send(e);
    }

}

module.exports = auth;