import test from "node:test";
import assert from "node:assert/strict";

import { User } from "../src/models/user.model.js";
import { loginUser, refreshAccessToken } from "../src/controller/user.controller.js";

const originalFindOne = User.findOne;
const originalFindById = User.findById;

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "test-access-secret";
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "test-refresh-secret";
process.env.ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
process.env.REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

function createResponse() {
    return {
        statusCode: null,
        cookies: [],
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        cookie(name, value, options) {
            this.cookies.push({ name, value, options });
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
}

function runHandler(handler, req) {
    const res = createResponse();

    return new Promise((resolve, reject) => {
        handler(req, res, (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(res);
        });

        setImmediate(() => resolve(res));
    });
}

test.afterEach(() => {
    User.findOne = originalFindOne;
    User.findById = originalFindById;
});

test("loginUser rejects requests without a password", async () => {
    User.findOne = async () => {
        throw new Error("findOne should not run when password is missing");
    };

    await assert.rejects(
        runHandler(loginUser, {
            body: { email: "user@example.com" }
        }),
        (error) => {
            assert.equal(error.statusCode, 400);
            assert.equal(error.message, "Password is required");
            return true;
        }
    );
});

test("loginUser returns both access and refresh tokens", async () => {
    const fakeUser = {
        _id: "507f1f77bcf86cd799439011",
        isPasswordCorrect: async (password) => password === "secret",
        generateAccessToken: () => "access-token",
        generateRefreshToken: () => "refresh-token",
        save: async () => {}
    };
    let findByIdCallCount = 0;

    User.findOne = async () => fakeUser;
    User.findById = (id) => {
        findByIdCallCount += 1;

        if (findByIdCallCount === 1) {
            return fakeUser;
        }

        return {
            select: async () => ({
                _id: fakeUser._id,
                email: "user@example.com",
                username: "user"
            })
        };
    };

    const res = await runHandler(loginUser, {
        body: { email: "user@example.com", password: "secret" }
    });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(
        res.cookies.map((cookie) => [cookie.name, cookie.value]),
        [
            ["accessToken", "access-token"],
            ["refreshToken", "refresh-token"]
        ]
    );
    assert.equal(res.body.data.accessToken, "access-token");
    assert.equal(res.body.data.refreshToken, "refresh-token");
});

test("refreshAccessToken rotates and returns a new refresh token", async () => {
    const dbUser = {
        _id: "507f1f77bcf86cd799439011",
        refreshToken: "incoming-refresh-token",
        generateAccessToken: () => "new-access-token",
        generateRefreshToken: () => "new-refresh-token",
        save: async () => {}
    };

    User.findById = async (id) => {
        assert.equal(id, dbUser._id);
        return dbUser;
    };

    const verifyRefreshReq = {
        cookies: { refreshToken: "incoming-refresh-token" },
        body: {}
    };

    const jwt = await import("jsonwebtoken");
    const originalVerify = jwt.default.verify;
    jwt.default.verify = () => ({ _id: dbUser._id });

    try {
        const res = await runHandler(refreshAccessToken, verifyRefreshReq);

        assert.equal(res.statusCode, 200);
        assert.deepEqual(
            res.cookies.map((cookie) => [cookie.name, cookie.value]),
            [
                ["accessToken", "new-access-token"],
                ["refreshToken", "new-refresh-token"]
            ]
        );
        assert.equal(res.body.data.refreshToken, "new-refresh-token");
    } finally {
        jwt.default.verify = originalVerify;
    }
});
