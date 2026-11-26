import { assertFails, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { getBytes, ref, uploadString } from "firebase/storage";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, it } from "vitest";

let env: RulesTestEnvironment;
beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "gpl-rules-test-storage",
    storage: { rules: readFileSync("firebase/storage.rules", "utf8"), host: "127.0.0.1", port: 9199 },
  });
});
afterAll(async () => env.cleanup());

describe("storage default deny", () => {
  it("blocks reads and writes for anonymous users and every role", async () => {
    const contexts = [env.unauthenticatedContext(), ...["superAdmin", "admin", "editor"].map((role) => env.authenticatedContext("u", { role }))];
    for (const c of contexts) {
      const s = c.storage();
      await assertFails(uploadString(ref(s, "public/logo.png"), "x"));
      await assertFails(getBytes(ref(s, "public/logo.png")));
    }
  });
});
