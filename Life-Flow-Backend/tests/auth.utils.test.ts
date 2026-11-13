import { describe, it } from "node:test";
import assert from "node:assert";
import { hashPassword, comparePassword } from "../src/utils/password";
import { generateToken, verifyToken } from "../src/utils/jwt";

describe("Password and JWT Utilities", () => {
    it("should hash a password and verify it correctly", async () => {
        const plain = "superSecretPassword123";
        const hashed = await hashPassword(plain);

        assert.notStrictEqual(hashed, plain);
        assert.ok(hashed.length > 20);

        const isMatch = await comparePassword(plain, hashed);
        assert.strictEqual(isMatch, true);

        const isWrongMatch = await comparePassword("wrongPassword", hashed);
        assert.strictEqual(isWrongMatch, false);
    });

    it("should generate and verify JWT correctly", () => {
        const userId = "64f9b87a1234567890abcdef";
        const token = generateToken(userId);

        assert.ok(token);
        assert.ok(typeof token === "string");

        const verified = verifyToken(token);
        assert.strictEqual(verified.userId, userId);
        assert.strictEqual(verified.sub, userId);
    });
});

