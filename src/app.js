const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
require("./db/conn");
const Register = require("./models/registers");

const port = process.env.PORT || 3000;


const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({extended:false}));

//console.log(static_path);
app.use(express.static(static_path));
app.set("view engine","hbs");

app.set("views",template_path); // the original path of views have been changed to template
hbs.registerPartials(partials_path);

app.get("/",(req,res)=>{
    res.render("index");
})

app.get("/register",(req,res) =>{
    res.render("register");
})

// create a new user in our database
app.post("/register",async(req,res) =>{
    try{
        const password = req.body.password;
        const cpassword = req.body.confirm_password;

        if(password===cpassword){
            const registerEmpp = new Register({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                gender:req.body.gender,
                phone:req.body.phone,
                age:req.body.age,
                password:password,
                confirm_password:cpassword


            })

            const registered = await registerEmpp.save();
            res.status(201).render("index");
            console.log(registered);
        }else{
            res.send("Password not matching!");
        }

    }catch(e){
        res.status(400).send(e);
    }
})

app.listen(port,()=>{
    console.log(`Running at port ${port}`);
})