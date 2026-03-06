import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation - not empty
    //check if user already exists: username, email
    // check for images,check for avatar
    //upload them to cloudinary, avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res

    const { username, email, fullname, password } = req.body;
    //console.log("email", email);

    if([username, email, fullname, password].some((field) => field?.trim() === "")){
        throw new apiError(400, "All fields are required");
    }

    const existingUser = User.findOne({
        $or: [{ username }, { email }]
    });

    if(existingUser){
        throw new apiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new apiError(400, "Avatar image is required");
    }

    const avatarUploadResponse = await uploadOnCloudinary(avatarLocalPath);
    const coverImageUploadResponse = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatarUploadResponse){
        throw new apiError(500, "Failed to upload avatar image");
    }

    const newUser = await User.create({
        username: username.toLowerCase(),
        avatar: avatarUploadResponse.url,
        coverImage: coverImageUploadResponse?.url || "",
        email,
        password,
        fullname
    });

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if(!createdUser){
        throw new apiError(500, "Failed to register user");
    }

    return res.status(201).json(new apiResponse(201, createdUser, "User registered successfully"));
});

export { registerUser }