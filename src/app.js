require('dotenv').config();

const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
require("./db/conn");
const Register = require("./models/registers");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const auth = require("./middleware/auth");

const securePassword = async (password) => {
  const passwordHash = await bcrypt.hash(password, 10);
  console.log(passwordHash);

  const passwordMatch = await bcrypt.compare(password, passwordHash);
  console.log(passwordMatch);
};

// securePassword("Aman@1234"); // It changes everytime when compiled.
// $2b$10$RY4rxmsLuWEty7A1CJJuzOsm5rdQebH8O5voJcTvkxOgVM.omGbXG

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

//console.log(static_path);
app.use(express.static(static_path));
app.set("view engine", "hbs");

app.set("views", template_path); // the original path of views have been changed to template
hbs.registerPartials(partials_path);

// console.log(process.env.SECRET_KEY);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/secret",auth, (req, res) => {
  console.log(`Cookie :  ${req.cookies.jwt}`);
  res.render("secret");
});

app.get("/register", (req, res) => {
  res.render("register");
});

// create a new user in our database
app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirm_password;

    if (password === cpassword) {
      const registerEmpp = new Register({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        gender: req.body.gender,
        phone: req.body.phone,
        age: req.body.age,
        password: password,
        confirm_password: cpassword,
      });
      console.log("Sucess : " + registerEmpp);

      const token = await registerEmpp.generateAuthToken();
      console.log("Token : " + token);
      
      // The res.cookie() function is used to set the cookie name to value.
      // The value parameter amy be a string or a object converted to JSON.
      // res.cookie(name,value,[options])

      res.cookie("jwt",token,{
        expires:new Date(Date.now() + 50000),
        httpOnly:true // irrevertable
        //secure:true
      });
      
      console.log(cookie);

      const registered = await registerEmpp.save();
      res.status(201).render("login");
      console.log(registered);
    } else {
      res.send("Password not matching!");
    }
  } catch (e) {
    res.status(400).send(e);
    console.log("The error !");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    // app.use(express.urlencoded({ extended: true }));
    // console.log(`${email} and password : ${password}`);

    // check wether the email and password is already present in DB
    const userEmail = await Register.findOne({ email: email });

    const isMatch = await bcrypt.compare(password, userEmail.password);
    const token = await userEmail.generateAuthToken();
    console.log("Token : " + token);

    res.cookie("jwt",token,{
      expires:new Date(Date.now() + 500000),
      httpOnly:true, // irrevertable
      //secure:true
    });

    

    if (isMatch) {
      res.status(201).render("index");
    } else {
      res.send("Password or Email is invalid!!!");
    }
  } catch (e) {
    res.status(400).send("Invalid login Details");
  }
});

// const jwt = require("jsonwebtoken");

// const createToken = async() =>{
//     const token = await jwt.sign({_id:'64089922b7ddc2c4a1bd8392'},"mynameismankumarpandaandiamstudyinginkiit"); // payload(object)
//     console.log(token);

//     const userVer = await jwt.verify(token,"mynameismankumarpandaandiamstudyinginkiit")
//     console.log(userVer);
// }
// createToken();
app.listen(port, () => {
  console.log(`Running at port ${port}`);
});
