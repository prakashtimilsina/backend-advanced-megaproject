import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrorHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

//Adding other features

const registerUser = asyncHandler(async (req, res) => {

    //get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in DB
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {fullName, email, username, password} = req.body;
    //console.log("email : ", email);
    // if(fullName === ""){
    //     throw new ApiError(400, "FullName is required")
    // }
    if (
        [fullName, email, username, password].some((field)=>field?.trim()==="")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    const existedUser = await User.findOne(
        {$or: [{ username }, { email }]}
    )
        if(existedUser){
            throw new ApiError(409, "User with email or username already exists.")
        }
    //console.log(req.files)
    const avatarLocalfilepath = req.files?.avatar[0]?.path
   // const coverImageLocalfilepath = req.files?.coverImage[0]?.path
   let coverImageLocalfilepath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalfilepath = req.files.coverImage[0].path
   } 



    //console.log(avatarLocalfilepath)
    //console.log(coverImageLocalfilepath)
    if(!avatarLocalfilepath){
        throw new ApiError(400, "Avatar File is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalfilepath)
    const coverImage = await uploadOnCloudinary(coverImageLocalfilepath)

    if (!avatar){
        throw new ApiError(400, "Avatar File is required")
    }
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user.")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );

})

export { registerUser }