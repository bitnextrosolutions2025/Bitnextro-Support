import express from "express"
import cors from "cors"
import { connectDB } from "./db.js"
import 'dotenv/config'
import authRouter from "./routes/auth.js"
import ticketRouter from "./routes/ticket.js"
import billingRoute from "./routes/billing.js"
import billingcopyRoute from "./routes/billingcopy.js"
import BlogRoute from "./routes/blog.js"
import BlogMsmRoute from "./routes/blogMsm.js"
import LeadRoute from "./routes/leadmanage.js"
const app = express();
app.use(express.json());
const coresoption = {
    origin: [
        process.env.FRONTEND_URL,
        process.env.FRONTEND_URL2,
        process.env.FRONTEND_URL3
    ],
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PUT', 'PATCH'], // Ensure methods are in an array
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token'],
    credentials: true, // Allow cookies/auth headers
    optionsSuccessStatus: 200 // Fixes some browser CORS issues
}
app.use(cors(coresoption));
await connectDB();
app.get("/", (req, res) => {
    return res.status(200).json({ "message": "code run" })
})
app.use("/api/v1/auth", authRouter);
app.use("/api/v2/tickt", ticketRouter);
app.use("/api/v3/bill", billingRoute);
app.use("/api/v4/copybill", billingcopyRoute);
app.use("/api/v5/blog", BlogRoute)
app.use("/api/v6/blogMsm", BlogMsmRoute);
app.use("/api/v7/lead",LeadRoute);
app.listen(process.env.PORT, () => {
    console.log(`your app is run in port:${process.env.PORT}`)
});