import mongoose from "mongoose";
const blogMsmSchema = new mongoose.Schema({
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
const BlogMsm = mongoose.model("BlogMsm", blogMsmSchema);
export default BlogMsm;