import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { aiService } from "../services/ai.service.js";
import { Video } from "../models/video.model.js";

// ─────────────────────────────────────────────────────────
//  AI Controller — Handlers for AI-powered endpoints
// ─────────────────────────────────────────────────────────

/**
 * POST /api/v1/ai/moderate
 * Analyses video title & description for policy violations
 * using Google Gemini content moderation pipeline.
 */
const moderateContent = asyncHandler(async (req, res) => {
    if (!aiService.available) {
        throw new ApiError(
            503,
            "AI service is unavailable — GEMINI_API_KEY not configured"
        );
    }

    const { title, description } = req.body;

    const analysis = await aiService.moderateContent(title, description);

    if (!analysis) {
        throw new ApiError(502, "AI moderation service returned an invalid response");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                moderation: analysis,
                metadata: {
                    model: aiService.modelName,
                    analyzedAt: new Date().toISOString(),
                },
            },
            analysis.safe
                ? "Content passed moderation — no violations detected"
                : `Content flagged — severity: ${analysis.severity}`
        )
    );
});

/**
 * POST /api/v1/ai/search
 * Intelligent natural-language video search powered by Gemini.
 * Understands intent, slang, and contextual queries.
 */
const smartSearch = asyncHandler(async (req, res) => {
    if (!aiService.available) {
        throw new ApiError(
            503,
            "AI service is unavailable — GEMINI_API_KEY not configured"
        );
    }

    const { query } = req.body;

    // Fetch all published videos (in production, you'd paginate/limit this)
    const videos = await Video.find({ published: true })
        .select("title description views createdAt owner")
        .limit(100)
        .lean();

    if (!videos.length) {
        return res.status(200).json(
            new ApiResponse(200, {
                query_understanding: query,
                results: [],
                totalResults: 0,
            }, "No videos available to search")
        );
    }

    const searchResults = await aiService.smartSearch(query, videos);

    if (!searchResults) {
        throw new ApiError(502, "AI search service returned an invalid response");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ...searchResults,
                totalResults: searchResults.results?.length || 0,
                metadata: {
                    model: aiService.modelName,
                    videosAnalyzed: videos.length,
                    searchedAt: new Date().toISOString(),
                },
            },
            `Found ${searchResults.results?.length || 0} relevant videos`
        )
    );
});

/**
 * POST /api/v1/ai/generate-description
 * Auto-generates SEO-optimized video description, tags,
 * and category from just a title.
 */
const generateDescription = asyncHandler(async (req, res) => {
    if (!aiService.available) {
        throw new ApiError(
            503,
            "AI service is unavailable — GEMINI_API_KEY not configured"
        );
    }

    const { title, hints } = req.body;

    const generated = await aiService.generateDescription(title, hints);

    if (!generated) {
        throw new ApiError(
            502,
            "AI description generator returned an invalid response"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                original_title: title,
                generated,
                metadata: {
                    model: aiService.modelName,
                    generatedAt: new Date().toISOString(),
                },
            },
            "AI-generated description created successfully"
        )
    );
});

export { moderateContent, smartSearch, generateDescription };
