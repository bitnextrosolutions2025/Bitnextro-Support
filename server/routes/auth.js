import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/User.js';
const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
    const { name, password, email } = req.body;
    try {

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const newuser = new User({
            username: name,
            email: email,
            password: hashedPassword
        })
        await newuser.save();
        return res.status(200).json({ "message": "You register done", "status": true })

    } catch (error) {
        console.log(error)
        return res.status(505).json({ "error": "Internal server error" })
    }
})
authRouter.post("/login", async (req, res) => {
    const { name, password } = req.body;
    try {
        const finduser = await User.findOne({ username: name })
        if (!finduser) {
            return res.status(404).json({ "status": false, "message": "username is wrong" })
        }
        const chake_pass = await bcrypt.compare(password, finduser.password)
        if (!chake_pass) {
            return res.status(400).json({ "status": false, "message": " passowrd is wrong" })
        }
        const authtoken = jwt.sign({
            user: finduser._id
        }, process.env.JWT_SERECT)
        function generateRandomString(length) {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#%)&@+|";
            let result = "";
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        }
        let s_t = authtoken.split("")
        let indexofArray = []
        for (let i = 0; i < 10; i++) {
            const num = Math.floor(Math.random() * 100)
            indexofArray.push(num)
        };
        indexofArray.sort();
        let wordarray = [];
        for (let index = 0; index < 10; index++) {
            const word=generateRandomString(1);
            wordarray.push(word);
 
        }
        for(let i=0;i<10;i++){
            s_t.splice(indexofArray[i],0,wordarray[i])
        }
       let joinauth=s_t.join("")
       let hased_token=joinauth+process.env.SECRET_CODE;
        return res.status(200).json({ "status": true, "message": "Login Successful", "hased_token": hased_token, "array":indexofArray })
    } catch (error) {
        console.log(error)
        return res.status(505).json({ "error": "Internal server error" })
    }
})

export default authRouter;