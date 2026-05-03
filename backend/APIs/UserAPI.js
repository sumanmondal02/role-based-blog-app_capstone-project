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

userApp.get("/articles/:id", verifyToken("user", "author", "admin"), async(req, res, next) => {
    try {
        const article = await ArticleModel
            .findOne({ _id: req.params.id /*isArticleActive: true */})
            .populate("comments.user")
            .populate("author", "firstName lastName profileImageUrl _id");  // ← add this
        
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        res.status(200).json({ message: "Article fetched", payload: article });
    } catch(err) {
        next(err);
    }
});

// XSS - Cross Site Scripting Attack
// CSRF - Cross Site Reference Forgery 
// Sniffing

//Comment on article
userApp.put("/comment", verifyToken("user"), async(req,res,next)=>{
    try {
        const {articleId, comment} = req.body;
        
        const articleDocument = await ArticleModel.findOne(
            {_id: articleId, isArticleActive: true}
        ).populate("comments.user");
        
        if (!articleDocument) {
            return res.status(404).json({message: "Article not Found"});
        }
        
        const userId = req.user?.id;
        articleDocument.comments.push({user: userId, comment: comment});
        await articleDocument.save();
        const populated = await ArticleModel
            .findById(articleDocument._id)
            .populate("comments.user")
            .populate("author", "firstName lastName profileImageUrl _id");
        res.status(200).json({message: "Commented Successfully", payload: populated});
    } catch(err) {
        next(err); // ← This sends error to your error handling middleware
    }
})

userApp.get("/comment", verifyToken("user"), async(req, res, next) => {
    try {
        const {articleId} = req.body; // Note: GET with body is non-standard
        // Better to use query params: req.query.articleId
        
        const articleDocument = await ArticleModel.findOne(
            {_id: articleId, isArticleActive: true}
        ).populate("comments.user");
        
        if (!articleDocument) {
            return res.status(404).json({message: "Article not Found"});
        }
        
        res.status(200).json({
            message: "Comments fetched successfully", 
            payload: articleDocument.comments
        });
    } catch(err) {
        next(err);
    }
})

// Public articles (no token) - for HomeComp
userApp.get("/public/articles", async(req, res, next) => {
    try {
        const articles = await ArticleModel
            .find({isArticleActive: true})
            .populate("author", "firstName lastName profileImageUrl")
            .populate("comments.user", "email firstName")
            .sort({createdAt: -1});
        res.status(200).json({message: "Articles fetched", payload: articles});
    } catch(err) { next(err); }
});

// Delete a comment
userApp.delete("/comment", verifyToken("user"), async(req, res, next) => {
    try {
        const { articleId, commentIndex } = req.body;
        const userId = req.user?.id;
        
        const article = await ArticleModel.findById(articleId);
        if (!article) return res.status(404).json({message: "Article not found"});
        
        // Check comment belongs to this user
        const comment = article.comments[commentIndex];
        if (comment.user.toString() !== userId) {
            return res.status(403).json({message: "Not your comment"});
        }
        
        article.comments.splice(commentIndex, 1);
        await article.save();
        
        res.status(200).json({message: "Comment deleted"});
    } catch(err) { next(err); }
});

// Get all comments by logged in user across all articles
userApp.get("/my-comments", verifyToken("user"), async(req, res, next) => {
    try {
        const userId = req.user?.id;
        const articles = await ArticleModel
            .find({"comments.user": userId})
            .populate("comments.user", "email");
        
        // Extract only this user's comments with article info
        const myComments = [];
        articles.forEach(article => {
            article.comments.forEach((comment, index) => {
                if (comment.user?._id?.toString() === userId || 
                    comment.user?.toString() === userId) {
                    myComments.push({
                        articleId: article._id,
                        articleTitle: article.title,
                        commentIndex: index,
                        comment: comment.comment,
                        createdAt: comment.createdAt,
                    });
                }
            });
        });
        
        // Sort by newest first
        myComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.status(200).json({message: "Your comments", payload: myComments});
    } catch(err) { next(err); }
});