import exp from "express"
import {UserModel} from "../models/UserModel.js";
import {hash, compare} from "bcrypt";
import { verifyToken } from "../middlewares/verifyToken.js";
import {config} from "dotenv";
import jwt from "jsonwebtoken";
const {sign} = jwt;
export const commonApp = exp.Router();
config();

//Route for Register
commonApp.post("/register", async (req, res) => {
    //get user from request body
    const newUser = req.body;
    // if(newUser.role==="admin"){
    //     return res.status(403).json({message: "You are not authorized to register as admin"})
    // } --> correct but we use different way using includes()
    let allowedRoles=["user", "author"]
    //check role
    if(!allowedRoles.includes(newUser.role)){
        return res.status(403).json({message: "You are not authorized to register as admin"})
    }
    //hash password and replace password with hashed password
    //if password contains "" or " " then hash() method of bcrypt will throw error, so we need to handle that error by using validators
    //Run Validators in manually 
    //doubt about logout why multiple time ?
    //doubt that the password shall be without any spaces between ?
    newUser.password = await hash(newUser.password, 12);
    //create New User Document 
    const newUserDoc = new UserModel(newUser);
    //save user to database
    await newUserDoc.save();
    //send response
    res.status(201).json({message: "User Registered Successfully", user: newUserDoc})
});


//Route for Login
commonApp.post("/login", async(req, res)=>{
    //get user email and password from the req body
    const {email, password} = req.body;
    //find user my email
    const user = await UserModel.findOne({email:email});
    if(!user){
        return res.status(404).json({message: "User not found, Register first"})
    }else{
        const isMatch = await compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({message: "Invalid Credentials"})
        }
        //generate JWT token and send response with token
        const signedToken = sign({id:user._id, email:email, role:user.role}, process.env.SECRET_KEY, {expiresIn:120});
        //set token to res header as httpOnly cookie
        res.cookie("token", signedToken, {
            httpOnly:true,
            sameSite:"lax",
            secure:false
        })
// delete keyword only works on javascript object not on database document 
        let userObj = user.toObject();
        delete userObj.password;
        res.status(200).json({message:`${user.firstName} ${user.lastName} Login Succesful`, user: userObj})
    }
    //verify the password by using verify() method of bcrypt
    //if true generate JWT token and send response with token, else send error response
})


//Route for Log Out 
commonApp.get("/logout", (req, res)=>{
    res.clearCookie("token",{
        httpOnly: true,
        sameSite: "lax",
        secure: false
    })
    res.status(200).json({message: "Logout Successful"})
})


//Route for Change Password
commonApp.put("/change-password", verifyToken("user", "author", "admin"), async(req, res)=>{
    //get email, old password and new password from req body
    const {currentPassword, newPassword} = req.body;
    //find user by email from decoded token
    const email = req.user?.email;
    const user = await UserModel.findOne({email:email});
    if(!user){
        return res.status(404).json({message:"User not found"})
    }
    //if current password or new password is missing in req body
    if(!currentPassword || !newPassword){
        return res.status(400).json({message:"Current and New password required"})
    }
    //check if new password is same as old password
    const isSamePassword = await compare(newPassword, user.password);
    if(isSamePassword){
        return res.status(400).json({message: "New Password must be different from Current Password"})
    }
    //verify old password
    const isMatch = await compare(currentPassword, user.password);
    if(!isMatch){
        return res.status(401).json({message: "Invalid Current Password"})
    }
    //hash new password and update in database
    user.password = await hash(newPassword, 12);
    await user.save();
    res.status(200).json({message: "Password Changed Successfully"})
})