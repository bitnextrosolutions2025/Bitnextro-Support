import mongoose from "mongoose";
const blogSchema = new mongoose.Schema({
    blog_title: {
        type: String,
        required: true,
    },
    blog_image_url: {
        type: String,
        required: true,
    },
    blog_description: {
        type: String,
        required: true,
    },
}, { timestamps: true })
const Blog = mongoose.model("Blog", blogSchema);
export default Blog;