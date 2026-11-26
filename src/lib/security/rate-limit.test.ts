import { beforeEach, describe, expect, it } from "vitest";
import { __resetRateLimit, rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => __resetRateLimit());
  it("allows up to the limit then blocks", () => {
    for (let i = 0; i < 3; i++) expect(rateLimit("k", 3, 1000, 100 + i)).toBe(true);
    expect(rateLimit("k", 3, 1000, 200)).toBe(false);
  });
  it("recovers after the window", () => {
    for (let i = 0; i < 3; i++) rateLimit("k", 3, 1000, 100);
    expect(rateLimit("k", 3, 1000, 1200)).toBe(true);
  });
  it("tracks keys independently", () => {
    for (let i = 0; i < 3; i++) rateLimit("a", 3, 1000, 100);
    expect(rateLimit("b", 3, 1000, 100)).toBe(true);
  });
});
