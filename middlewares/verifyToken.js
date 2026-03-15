import jwt from 'jsonwebtoken';
import {config} from "dotenv";
const {verify}=jwt
config()

export const verifyToken= (...allowedRoles)=>{
    //verifyToken ("admin", "author") => allowedRoles = ["admin", "author"]
    return (req, res, next)=>{
        try{
            //get token from cookie
            const token = req.cookies?.token //
            //check token exists or not
            if(!token){
                return res.status(401).json({message:"Please Login"})
            }
            //validate token (decode the token)
            let decodedToken = verify(token, process.env.SECRET_KEY)

            //console.log("DecodedToken :", decodedToken);
            //check the role is same as role in description 
            if(!allowedRoles.includes(decodedToken.role)){
                return res.status(403).json({message:"Access Denied, Roles didnt Match"})
            }
            //add decoded token
            req.user=decodedToken;
            next();
        } catch (error) {
            return res.status(401).json({message:"Invalid Token"})
        }
}
}

// export const verifyToken=async(req, res, next)=>{
//     try{
//         //get token from cookie
//         const token = req.cookies?.token //
//         //check token exists or not
//         if(!token){
//             return res.status(401).json({message:"Please Login"})
//         }
//         //validate token (decode the token)
//         let decodedToken = verify(token, process.env.SECRET_KEY)
//         //check the role is same as role in description 
//         if(decodedToken.role !== req.body.role){
//             return res.status(403).json({message:"Access Denied"})
//         }
//         //add decoded token
//         req.user=decodedToken;
//         next();
//     } catch (error) {
//         return res.status(401).json({message:"Invalid Token"})
//     }
// }