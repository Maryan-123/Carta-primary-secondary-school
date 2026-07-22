import { getRoleTabs, isMobileSupportedRole } from "./access";

describe("mobile access", () => {
  it("allows the supported mobile roles", () => {
    expect(isMobileSupportedRole("STUDENT")).toBe(true);
    expect(isMobileSupportedRole("PARENT")).toBe(true);
    expect(isMobileSupportedRole("TEACHER")).toBe(true);
    expect(isMobileSupportedRole("ADMINISTRATOR")).toBe(false);
  });

  it("returns role-specific tabs", () => {
    expect(getRoleTabs("STUDENT")).toContain("finance");
    expect(getRoleTabs("PARENT")).toContain("attendance");
    expect(getRoleTabs("TEACHER")).toContain("assignments");
  });
});
