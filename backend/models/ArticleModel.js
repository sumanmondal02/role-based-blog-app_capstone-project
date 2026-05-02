import {Schema, model, Types} from "mongoose"

//create comment schema
const commentSchema = new Schema({
    user:{
        type: Types.ObjectId,
        ref: "user",
        required: [true, "User ID is required"]
    },
    comment:{
        type: String,
        required:[true, "Enter a Comment"]
    },
},{
    versionKey: false,
    _id: false,
    timestamps: true
})


const articleSchema = new Schema({
    author:{
        type: Types.ObjectId,
        ref: "user",
        required: [true, "Author ID is required"]
    },
    title:{
        type: String,
        required: [true, "Title is required"],
        minLength: [3, "Title must be at least 3 characters long"]
    },  
    category:{
        type: String,
        required: [true, "Category is required"],
        //enum: ["Introduction", "technology", "lifestyle", "education", "entertainment", "health", "travel", "food", "fashion", "sports", "business", "finance", "politics", "science", "art", "culture", "artificial intelligence", "machine learning", "data science", "programming", "web development", "mobile development", "cybersecurity", "cloud computing", "gadgets", "gaming", "virtual reality", "augmented reality", "blockchain", "cryptocurrency", "startups", "entrepreneurship", "personal development", "productivity", "mental health", "fitness", "nutrition", "travel tips", "destination guides", "food recipes", "restaurant reviews", "fashion trends", "beauty tips", "sports analysis", "business strategies", "financial advice", "political commentary", "scientific discoveries", "art & culture"]
    },
    content:{
        type: String,
        required: [true, "Content is required"],
    },
    comments:[{
        //{comment, user}
        type: commentSchema,
        default: []
    }],
    isArticleActive:{
        type: Boolean,
        default: true
    }
},{
    timestamps: true,
    versionKey: false,
    strict: "throw"
});





export const ArticleModel = model("article", articleSchema)