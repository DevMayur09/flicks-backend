import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import validator from "validator";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // Get data from api basically from body -- DONE
  // Check is all data is available and validate -- DONE
  // check if already existed user
  // check for image check for avtar
  // upload to cloudinary
  // once confirm that data is valid then hashPass
  // and save in DB
  // if success send success
  // else error handling

  const { firstName, lastName, userName, email, password } = req.body;

  if (
    [firstName, lastName, userName, password, email].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!validator.isEmail(password)) {
    throw new ApiError(400, "Invalid email");
  }

  if (!validator.isStrongPassword(password)) {
    throw new ApiError(400, "Password is not strong");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, `User with ${email} or ${username} already exist`);
  }

  const avatarLocalPath = res.files?.avatar[0]?.path;
  const coverImageLocalPath = res.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    firstName,
    lastName,
    userName: userName.lowercase(),
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
