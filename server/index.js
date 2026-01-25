import express from "express"
import cors from "cors"
import { connectDB } from "./db.js"
import 'dotenv/config'
import authRouter from "./routes/auth.js"
const app = express()
app.use(express.json())
app.use(cors())
connectDB();
app.use("/api/v1/auth",authRouter)
app.listen(process.env.PORT,()=>{
    console.log(`your app is run in port:${process.env.PORT}`)
})