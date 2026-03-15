import exp from "express"
import { verifyToken } from "../middlewares/verifyToken.js";
import { ArticleModel } from "../models/ArticleModel.js";
export const userApp = exp.Router();

//Read all articles of all authors
userApp.get("/articles", verifyToken("user"), async(req, res)=>{
    //First fetch and read all articles
    const articleList = await ArticleModel.find({isArticleActive:true})
    //fetch all articles from database and send response
    res.status(200).json({message:"All Articles fetched successfully", payload:articleList})
})

// XSS - Cross Site Scripting Attack
// CSRF - Cross Site Reference Forgery 
// Sniffing

//Comment on article
userApp.put("/comment", verifyToken("user"), async(req,res)=>{
    //get body from client req
    const {articleId, comment} = req.body 
    //first fetch details of the article
    const articleDocument = await ArticleModel.findOne({_id:articleId, isArticleActive:true})
    if(!articleDocument){
        return res.status(404).json({message:"Article not Found for which you want to comment"})
    }
    //Get userId from the decoded token
    const userId = req.user?.id
    //add comment to comments array of article document 
    articleDocument.comments.push({commentedBy:userId, comment:comment})
    //save
    await articleDocument.save()
    res.status(200).json({message:"Commented Sucessfully", comment:articleDocument})
})