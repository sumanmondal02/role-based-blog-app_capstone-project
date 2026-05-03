import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const adminApp = exp.Router();

// Get all users and authors
adminApp.get("/users", verifyToken("admin"), async(req, res, next) => {
    try {
        const users = await UserModel.find(
            { role: { $in: ["user", "author"] } },
            { password: 0 }
        ).sort({ createdAt: -1 });
        res.status(200).json({ message: "Users fetched", payload: users });
    } catch(err) { next(err); }
});

// Get all articles by a specific author
adminApp.get("/authors/:authorId/articles", verifyToken("admin"), async(req, res, next) => {
    try {
        const articles = await ArticleModel
            .find({ author: req.params.authorId })
            .populate("author", "firstName lastName email")
            .sort({ createdAt: -1 });
        res.status(200).json({ message: "Articles fetched", payload: articles });
    } catch(err) { next(err); }
});

// Admin delete/restore any article
adminApp.patch("/articles/:articleId", verifyToken("admin"), async(req, res, next) => {
    try {
        const { isArticleActive } = req.body;
        const article = await ArticleModel.findByIdAndUpdate(
            req.params.articleId,
            { $set: { isArticleActive } },
            { new: true }
        ).populate("author", "firstName lastName");
        
        if (!article) return res.status(404).json({ message: "Article not found" });
        res.status(200).json({ message: "Article status updated", payload: article });
    } catch(err) { next(err); }
});

// Block / unblock any user or author
adminApp.patch("/block-user/:userId", verifyToken("admin"), async(req, res, next) => {
    try {
        const { isUserActive } = req.body;
        const user = await UserModel.findByIdAndUpdate(
            req.params.userId,
            { $set: { isUserActive } },
            { new: true, select: "-password" }
        );
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: `User ${isUserActive ? "unblocked" : "blocked"}`, payload: user });
    } catch(err) { next(err); }
});

// Delete a user's comment from any article
adminApp.delete("/comment", verifyToken("admin"), async(req, res, next) => {
    try {
        const { articleId, commentIndex } = req.body;
        const article = await ArticleModel.findById(articleId);
        if (!article) return res.status(404).json({ message: "Article not found" });
        
        article.comments.splice(commentIndex, 1);
        await article.save();
        res.status(200).json({ message: "Comment deleted" });
    } catch(err) { next(err); }
});

// Get all comments by a specific user across all articles
adminApp.get("/user/:userId/comments", verifyToken("admin"), async(req, res, next) => {
    try {
        const userId = req.params.userId;
        const articles = await ArticleModel
            .find({ "comments.user": userId })
            .populate("comments.user", "email firstName");
        
        const comments = [];
        articles.forEach(article => {
            article.comments.forEach((comment, index) => {
                if (comment.user?._id?.toString() === userId) {
                    comments.push({
                        articleId: article._id,
                        articleTitle: article.title,
                        commentIndex: index,
                        comment: comment.comment,
                        createdAt: comment.createdAt,
                    });
                }
            });
        });
        
        comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.status(200).json({ message: "Comments fetched", payload: comments });
    } catch(err) { next(err); }
});