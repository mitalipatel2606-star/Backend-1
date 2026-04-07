import { asyncHandler } from "../utils/asyncHandler";
export const verifyJWT = asyncHandler(async (req, resizeBy, next) => {
    req.cookies?.accessToken || req.header("Authorization")
})