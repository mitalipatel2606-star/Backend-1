import test from "node:test";
import assert from "node:assert/strict";

process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-gemini-key";

const { AIService } = await import("../src/services/ai.service.js");

function createServiceReturning(text) {
    const service = new AIService();
    service.model = {
        generateContent: async () => ({
            response: {
                text: () => text,
            },
        }),
    };
    return service;
}

function createServiceThrowing() {
    const service = new AIService();
    service.model = {
        generateContent: async () => {
            throw new Error("network failed");
        },
    };
    return service;
}

test("moderateContent fails closed when Gemini returns malformed JSON", async (t) => {
    t.mock.method(console, "error", () => {});
    const service = createServiceReturning("not json");

    const result = await service.moderateContent("Unsafe title", "Unsafe description");

    assert.equal(result.safe, false);
    assert.deepEqual(result.flags, ["manual_review"]);
    assert.equal(result.severity, "unknown");
});

test("moderateContent fails closed when Gemini request fails", async (t) => {
    t.mock.method(console, "error", () => {});
    const service = createServiceThrowing();

    const result = await service.moderateContent("Any title", "Any description");

    assert.equal(result.safe, false);
    assert.deepEqual(result.flags, ["manual_review"]);
    assert.equal(result.confidence, 0);
});

test("smartSearch rejects invalid Gemini result shapes", async (t) => {
    t.mock.method(console, "error", () => {});
    const service = createServiceReturning(
        JSON.stringify({
            query_understanding: "coding tutorial",
            results: [
                {
                    videoId: "507f1f77bcf86cd799439011",
                    title: "Node basics",
                    relevanceScore: 2,
                    matchReason: "score is invalid",
                },
            ],
        })
    );

    const result = await service.smartSearch("coding", []);

    assert.deepEqual(result, {
        query_understanding: "coding",
        results: [],
    });
});

test("generateDescription accepts valid Gemini JSON wrapped in markdown fences", async () => {
    const service = createServiceReturning(`\`\`\`json
{
  "description": "A practical guide to building APIs with Node.js and Express.",
  "tags": ["node", "express", "api", "backend", "javascript"],
  "category": "Education",
  "seoTitle": "Build APIs with Node.js and Express"
}
\`\`\``);

    const result = await service.generateDescription("Build APIs with Node.js");

    assert.equal(result.category, "Education");
    assert.equal(result.tags.length, 5);
    assert.equal(result.seoTitle, "Build APIs with Node.js and Express");
});
