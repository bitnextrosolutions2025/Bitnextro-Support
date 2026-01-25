import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/User.js';
const authRouter = express.Router();

authRouter.post("/register",async(req,res)=>{
    const{name,password,email}=req.body;
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)
    const newuser = new User({
            username:name,
            email:email,
            password:hashedPassword
    })
    await newuser.save();
    return res.status(200).json({ "message": "You register done", "status": true })
})

export default authRouter;