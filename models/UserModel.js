import {Schema, model, Types} from "mongoose"

const userSchema = new Schema({
    firstName:{
        type: String,
        required: [true, "First name is required"],
        minLength: [2, "First name must be at least 2 characters long"]
    },
    lastName:{
        type: String,
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already exists"],
        match: [/\S+@\S+\.\S+/, "Please use a valid email address"]
    },
    password:{
        type: String,
        required: [true, "Password is required"],
        minLength: [5, "Password must be at least 6 characters long"]
    },
    role:{
        type: String,
        enum: ["user", "admin","author"],
        //default: "user"
        required: [true, "{Value} Invalid Role."]
    },
    profileImageUrl:{
        type: String
    },
    isUserActive:{
        type: Boolean,
        default: true
    }

},
{
    timestamps: true,
    versionKey: false,
    strict: "throw"
});

//create models
export const UserModel = model("user", userSchema)