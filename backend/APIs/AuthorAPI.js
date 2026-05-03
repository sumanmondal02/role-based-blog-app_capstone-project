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
    res.status(200).json({message:"Articles fetched successfully", payload: articlesList})
} )

//edit article
authorApp.put("/articles", verifyToken("author"), async(req, res, next) => {
    try {
        const authorIdOfToken = req.user?.id;
        const {articleId, title, category, content} = req.body;
        
        const modifiedArticle = await ArticleModel.findOneAndUpdate(
            {_id: articleId, author: authorIdOfToken},
            {$set: {title, category, content}},
            {new: true}
        ).populate("author", "firstName lastName profileImageUrl _id")
         .populate("comments.user");
        
        if (!modifiedArticle) {
            return res.status(404).json({message: "Not Authorized to edit the article"});
        }
        res.status(200).json({message: "Article Updated Successfully", payload: modifiedArticle});
    } catch(err) {
        next(err);
    }
});


//delete article (soft delete)
authorApp.patch("/articles", verifyToken("author"), async(req, res, next) => {
    try {
        const authorIdOfToken = req.user?.id;
        const {articleId, isArticleActive} = req.body;
        
        const articleOfDB = await ArticleModel.findOne({_id: articleId, author: authorIdOfToken});
        
        if (!articleOfDB) {
            return res.status(404).json({message: "Article not found"});
        }
        if (isArticleActive === articleOfDB.isArticleActive) {
            return res.status(200).json({message: "Article already in the same state"});
        }
        
        articleOfDB.isArticleActive = isArticleActive;
        await articleOfDB.save();
        
        // Re-fetch with populate ← key fix
        const populated = await ArticleModel
            .findById(articleOfDB._id)
            .populate("author", "firstName lastName profileImageUrl _id")
            .populate("comments.user");
        
        res.status(200).json({
            message: "Article status updated successfully",
            payload: populated  // ← now has populated author
        });
    } catch(err) {
        next(err);
    }
});
