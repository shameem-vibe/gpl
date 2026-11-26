import { describe, expect, it } from "vitest";
import { formatBdt, formatOvers } from "./format";

describe("format", () => {
  it("shows overs in cricket notation", () => {
    expect(formatOvers(0)).toBe("0.0");
    expect(formatOvers(83)).toBe("13.5");
    expect(formatOvers(120)).toBe("20.0");
  });
  it("formats taka", () => expect(formatBdt(100000)).toBe("৳1,00,000"));
});
