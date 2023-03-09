const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const empSchema = new mongoose.Schema({
    firstname :{
        type:String,
        required : true
    },
    lastname :{
        type:String,
        required : true
    },
    email :{
        type:String,
        required : true,
        unique: true
    },
    gender:{
        type:String,
        required : true
    },
    phone :{
        type:Number,
        required : true,
        unique: true
    },
    age:{
        type:Number,
        required : true
    },
    password:{
        type:String,
        required:true
    },
    confirm_password:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]

})
//generating tokens
empSchema.methods.generateAuthToken = async function(){
    try{
        console.log(this._id);
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();

        // console.log(token);
        return token;
    }catch(e){
        res.send("The error is "+e);
        console.log(e);
    }
}
// Hashing the password
empSchema.pre("save",async function(next){
    if(this.isModified("password"))
    {
        //const passwordHash = await bcrypt.hash(password,10);
        console.log(`The current password is ${this.password}`);
        this.password = await bcrypt.hash(this.password,10);
        console.log(`The current password (Hashing) is ${this.password}`);

        
    }
    
    next();

})

// collection creation
const Register = new mongoose.model("Register",empSchema);

module.exports = Register;