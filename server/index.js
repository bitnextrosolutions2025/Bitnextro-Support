import express from "express"
import cors from "cors"
import { connectDB } from "./db.js"
import 'dotenv/config'
import authRouter from "./routes/auth.js"
const app = express()
app.use(express.json());
const coresoption = {
    origin: `${process.env.FRONTEND_URL}`,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PUT', 'PATCH'], // Ensure methods are in an array
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token'],
    credentials: true, // Allow cookies/auth headers
    optionsSuccessStatus: 200 // Fixes some browser CORS issues
}
app.use(cors(coresoption));
connectDB();
app.get("/",(req,res)=>{
   return res.status(200).json({"message":"code run"})
})
app.use("/api/v1/auth",authRouter)
app.listen(process.env.PORT,()=>{
    console.log(`your app is run in port:${process.env.PORT}`)
})