import { describe, it } from "node:test";
import assert from "node:assert";
import { generateGoogleAuthUrl } from "../src/services/auth/google.service";
import { generateGithubAuthUrl } from "../src/services/auth/github.service";

describe("OAuth URL Generation and State Security", () => {
    it("should generate a secure Google OAuth URL with CSRF state parameter", () => {
        const { url, state } = generateGoogleAuthUrl(true);

        assert.ok(url);
        assert.ok(state);
        assert.strictEqual(state.length, 64); // 32 bytes hex
        assert.ok(url.includes("accounts.google.com"));
        assert.ok(url.includes(state));
        assert.ok(url.includes("scope="));
    });

    it("should generate a secure GitHub OAuth URL with CSRF state parameter", () => {
        const { url, state } = generateGithubAuthUrl(true);

        assert.ok(url);
        assert.ok(state);
        assert.strictEqual(state.length, 64); // 32 bytes hex
        assert.ok(url.includes("github.com/login/oauth/authorize"));
        assert.ok(url.includes(state));
        assert.ok(url.includes("read%3Auser") || url.includes("read:user"));
        assert.ok(url.includes("user%3Aemail") || url.includes("user:email"));
    });
});
