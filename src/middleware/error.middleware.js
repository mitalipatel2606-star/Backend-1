import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    const errorResponse = {
        success: false,
        message,
        errors: err.errors || [],
    };

    if (process.env.NODE_ENV !== "production") {
        errorResponse.stack = err.stack;
    }

    if (!(err instanceof ApiError) && statusCode === 500) {
        errorResponse.message = "Internal Server Error";
    }

    return res.status(statusCode).json(errorResponse);
};

export { errorHandler };
