import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

const moderationResultSchema = z.object({
    safe: z.boolean(),
    confidence: z.number().min(0).max(1),
    flags: z.array(z.string()),
    reason: z.string(),
    severity: z.enum(["none", "low", "medium", "high", "critical", "unknown"]),
});

const smartSearchResultSchema = z.object({
    query_understanding: z.string(),
    results: z
        .array(
            z.object({
                videoId: z.string(),
                title: z.string(),
                relevanceScore: z.number().min(0).max(1),
                matchReason: z.string(),
            })
        )
        .max(10),
});

const descriptionResultSchema = z.object({
    description: z.string(),
    tags: z.array(z.string()).min(0).max(8),
    category: z.enum([
        "Education",
        "Entertainment",
        "Gaming",
        "Music",
        "News",
        "Science",
        "Sports",
        "Technology",
        "Travel",
        "Other",
    ]),
    seoTitle: z.string(),
});

// ─────────────────────────────────────────────────────────
//  AIService — Centralized Google Gemini integration
//  Provides content moderation, smart search, and
//  auto-description generation for the VideoTube platform.
// ─────────────────────────────────────────────────────────

class AIService {
    constructor() {
        this.modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

        if (!process.env.GEMINI_API_KEY) {
            console.warn(
                "⚠️  GEMINI_API_KEY not set — AI features will be unavailable"
            );
            this.available = false;
            return;
        }
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({
            model: this.modelName,
        });
        this.available = true;
    }

    // ── Helpers ──────────────────────────────────────────

    /**
     * Sends a prompt to Gemini and parses the JSON response.
     * Falls back to a default value if parsing fails.
     */
    async _promptJSON(prompt, fallback = null, schema = null) {
        let text = "";

        try {
            const result = await this.model.generateContent(prompt);
            text = result.response.text();
        } catch (error) {
            console.error("Gemini request failed:", error?.message || error);
            return fallback;
        }

        // Strip markdown code fences if present
        const cleaned = text
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/g, "")
            .trim();

        try {
            const parsed = JSON.parse(cleaned);

            if (!schema) {
                return parsed;
            }

            const validated = schema.safeParse(parsed);
            if (!validated.success) {
                console.error("Gemini returned invalid JSON shape:", validated.error.issues);
                return fallback;
            }

            return validated.data;
        } catch {
            console.error("Gemini returned non-JSON:", text);
            return fallback;
        }
    }

    // ── 1. Content Moderation ────────────────────────────

    /**
     * Analyses a video's title and description for policy violations.
     *
     * @param  {string} title       – Video title
     * @param  {string} description – Video description
     * @returns {Object} { safe: boolean, flags: string[], reason: string, confidence: number }
     */
    async moderateContent(title, description = "") {
        const prompt = `You are a content moderation AI for a video hosting platform called VideoTube.

Analyse the following video metadata for policy violations.

Title: "${title}"
Description: "${description}"

Check for:
1. Hate speech or discrimination
2. Violence or graphic content promotion
3. Spam or misleading content
4. Adult/NSFW content
5. Harassment or bullying
6. Misinformation or dangerous advice
7. Copyright infringement signals

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "safe": true/false,
  "confidence": 0.0-1.0,
  "flags": ["list of violated categories, empty if safe"],
  "reason": "brief explanation of the decision",
  "severity": "none" | "low" | "medium" | "high" | "critical"
}`;

        const fallback = {
            safe: false,
            confidence: 0,
            flags: ["manual_review"],
            reason: "Moderation service could not verify this content. Manual review is required.",
            severity: "unknown",
        };

        return this._promptJSON(prompt, fallback, moderationResultSchema);
    }

    // ── 2. Smart Search ──────────────────────────────────

    /**
     * Takes a natural-language query and a list of videos,
     * then returns a relevance-ranked subset using AI understanding.
     *
     * @param  {string}   query  – Natural language search query
     * @param  {Object[]} videos – Array of video objects from MongoDB
     * @returns {Object} { results: [{ videoId, title, relevanceScore, matchReason }], query_understanding: string }
     */
    async smartSearch(query, videos) {
        // Build a compact representation for the prompt
        const videoList = videos.map((v) => ({
            id: v._id.toString(),
            title: v.title,
            description: v.description || "",
            views: v.views || 0,
            createdAt: v.createdAt,
        }));

        const prompt = `You are an intelligent search engine for VideoTube, a video hosting platform.

A user searched for: "${query}"

Here are the available videos:
${JSON.stringify(videoList, null, 2)}

Your job:
1. Understand the user's INTENT (they might use slang, natural language, or vague terms).
2. Rank the videos by relevance to the query.
3. Only include videos that are at least somewhat relevant.
4. If NO videos match, return an empty results array.

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "query_understanding": "what you think the user is looking for",
  "results": [
    {
      "videoId": "the _id string",
      "title": "video title",
      "relevanceScore": 0.0-1.0,
      "matchReason": "why this video matches"
    }
  ]
}

Sort results by relevanceScore descending. Max 10 results.`;

        const fallback = {
            query_understanding: query,
            results: [],
        };

        return this._promptJSON(prompt, fallback, smartSearchResultSchema);
    }

    // ── 3. Auto Description Generator ────────────────────

    /**
     * Generates an SEO-optimized description, tags, and category
     * from just a video title.
     *
     * @param  {string} title    – Video title
     * @param  {string} [hints]  – Optional hints about the video content
     * @returns {Object} { description, tags, category, seoTitle }
     */
    async generateDescription(title, hints = "") {
        const prompt = `You are an AI content assistant for VideoTube, a video hosting platform.

Generate professional, SEO-optimized metadata for a video with this title:
"${title}"
${hints ? `Additional context: "${hints}"` : ""}

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "description": "A compelling 2-3 sentence video description optimized for search engines. Be specific and engaging.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "one of: Education, Entertainment, Gaming, Music, News, Science, Sports, Technology, Travel, Other",
  "seoTitle": "An optimized version of the title for better search ranking"
}

Generate exactly 5-8 relevant tags. Keep the description under 200 words.`;

        const fallback = {
            description: `Watch "${title}" on VideoTube.`,
            tags: [],
            category: "Other",
            seoTitle: title,
        };

        return this._promptJSON(prompt, fallback, descriptionResultSchema);
    }
}

// Export a singleton instance so we reuse the same Gemini client
const aiService = new AIService();
export { AIService, aiService };
