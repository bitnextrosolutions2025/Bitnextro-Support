import express from 'express'
import upload from '../middleware/upload.js';
import cloudinary from "../config/cloudinary.js"
import fs from 'fs'
import Blog from '../models/Blog.js';

const BlogRoute = express.Router();

BlogRoute.post("/add-blog", upload.single('blogimage'), async (req, res) => {
    try {


        const { blog_title, blog_description } = JSON.parse(req.body.bloginfo);
        let imgurl = ""
        if (req.file) {
            const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
                folder: "user_profiles", // Optional folder in Cloudinary
            });
            fs.unlinkSync(req.file.path);
            imgurl = cloudinaryResponse.secure_url;
        }
        const newblog = new Blog({
            blog_title,
            blog_image_url: imgurl,
            blog_description
        })
        await newblog.save();
       return res.status(200).json({"message":"Add blog done",status:true})
    } catch (error) {
       console.log(error);
       return res.status(500).json({"error":"Server Error",status:false})
    }

})

export default BlogRoute;