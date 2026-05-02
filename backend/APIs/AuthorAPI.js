import exp from "express"
import { UserModel } from "../models/UserModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";
export const authorApp = exp.Router();

//write article (protected route)
authorApp.post("/articles", verifyToken("author"), async(req, res, next)=>{
    try{
        //get articleobj from client 
    const articleObj = req.body;
    //get user from decoded token
    let userEmail=req.user.email
    //check author
    let authorValid = await UserModel.findById(articleObj.author)
    if(!authorValid){
        return res.status(404).json({message: "Author not found"})
    }
    if(authorValid.email!= userEmail){
        return res.status(403).json({message: "Access Denied, Cant Post in other Authors Acc"})
    }
    // if(authorValid.role!="author"){
    //     return res.status(403).json({message: "Only Author Authorised to post Articles"})
    // }
    const articleDoc = new ArticleModel(articleObj);
    //save
    await articleDoc.save();
    res.status(201).json({message:"Article Published Succesfully"})
    }catch(err){
        next(err);
    }
})

//read own articles
authorApp.get("/articles", verifyToken("author"), async(req,res)=>{
    //read articles by author email
    const authorIdOfToken=req.user?.id;
    //
    const articlesList = await ArticleModel.find({author:authorIdOfToken})
    res.status(200).json({message:"Articles fetched successfully", articles: articlesList})
} )

//edit article
authorApp.put("/articles", verifyToken("author"), async(req, res)=>{
    //get author id from decoded token 
    const authorIdOfToken = req.user?.id;
    //get modified article from client
    const {articleId, title, category, content}=req.body;
    const modifiedArticle = await ArticleModel.findOneAndUpdate(
        {_id:articleId, author:authorIdOfToken},
        {$set:{title, category, content}},
        {new:true})
        //if either article id or author not correct
        if(!modifiedArticle){
            return res.status(404).json({message:"Not Authorized to edit the article"})
        }
        res.status(200).json({message:"Article Updated Successfully", article: modifiedArticle})
})


//delete article (soft delete)
authorApp.patch("/articles", verifyToken("author"), async(req, res)=>{
    //check articleId
    //get author id from decoded token 
    const authorIdOfToken = req.user?.id;
    //get modified article from client
    const {articleId, isArticleActive}=req.body;
    //get article by id
    const articleOfDB = await ArticleModel.findOne({_id:articleId, author:authorIdOfToken})
    //check status
    if(isArticleActive===articleOfDB.isArticleActive){
        return res.status(200).json({message:"Article already in the same state"})
    }
    articleOfDB.isArticleActive = isArticleActive
    await articleOfDB.save()
    //send response
    res.status(200).json({message:"Article status updated successfully", article: articleOfDB})

    // //get modified article from client
    // const {articleId, isArticleActive}=req.body;
    // {_id:articleId, author:authorIdOfToken},
    //     {$set:{isArticleActive}},
    //     {new:true})
})
