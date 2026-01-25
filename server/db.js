import mongoose from "mongoose";


export const connectDB = async () => {
      try {
        await mongoose.connect(process.env.mongoURI);
        console.log("The server is run.")
        
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
}