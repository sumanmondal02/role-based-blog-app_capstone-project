import exp from "express";
import {config} from "dotenv";
import {connect} from "mongoose";
import cookieParser from "cookie-parser";
import {userApp} from "./APIs/UserAPI.js";
import {authorApp} from "./APIs/AuthorAPI.js";
import {adminApp} from "./APIs/AdminAPI.js";
import {commonApp} from "./APIs/CommonAPI.js";
import cors from "cors";

config()

//create expres app
const app = exp();

const allowedOrigins = [
    "http://localhost:5173",
    "https://blogapp-beta-nine.vercel.app"
];

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      return callback(null, false);
    }
  },
  credentials: true
}));

//cookie parser middleware
app.use(cookieParser());
//Body Parser Middleware
app.use(exp.json());

//path level middleware
app.use("/user-api", userApp)
app.use("/author-api", authorApp)
app.use("/admin-api", adminApp)
app.use("/auth", commonApp)


//connect to database
const connectDB = async()=>{
    try{
        await connect(process.env.DB_URL, {dbName: "blogDB"});
        console.log("Database Connected")
        //assign port
        const port = process.env.PORT || 4120;
        app.listen(port,()=>console.log(`Server is running on port ${port}`));
    }catch(err){
        console.log("Error in Connection to Database", err)
    }
}
connectDB();

//Testing API working or not 
// app.get("/blog", (req, res) => {
//     res.send("Blog API is running");
// }); 


//to handle invalid path
app.use((req, res, next) => {
    console.log(req.url)
    res.status(404).json({message: `Path ${req.url} is invalid`})
})

//Error handling middleware
app.use((err, req, res, next) => {
  console.log("error is ",err)
  console.log("Full error:", JSON.stringify(err, null, 2));
  //ValidationError
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  //CastError
  if (err.name === "CastError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  //send server side error
  res.status(500).json({ message: "error occurred", error: "Server side error" });
}); 

export default app;


// //to handle errors
// app.use((err, req, res, next) => {
//     // console.error(err.stack)
//     // res.status(500).json({message: "Internal Server Error"})
//     if(err.name === 'ValidationError' || err.name === 'CastError'){
//         res.status(400).json({message:"error occured", error:err.message})
//     } else if(err.code === 11000){
//         res.status(400).json({message:"Duplicate key error", error:err.message})
//     } else {
//         res.status(500).json({message: "Internal Server Error", error: err.message})
//     }
// })
