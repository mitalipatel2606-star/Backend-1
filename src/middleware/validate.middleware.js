import { z } from "zod";

import { ApiError } from "../utils/ApiError.js";

const formatZodIssues = (issues) =>
    issues.map((issue) => ({
        path: issue.path.join(".") || "root",
        message: issue.message
    }));

const validate = ({ body, params, query } = {}) => (req, res, next) => {
    try {
        if (body) {
            req.body = body.parse(req.body);
        }

        if (params) {
            req.params = params.parse(req.params);
        }

        if (query) {
            req.query = query.parse(req.query);
        }

        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new ApiError(400, "Validation failed", formatZodIssues(error.issues)));
            return;
        }

        next(error);
    }
};

export { validate };
