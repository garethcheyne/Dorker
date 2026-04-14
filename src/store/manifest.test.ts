import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const manifestPath = path.resolve(__dirname, "../../manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

describe("manifest.json", () => {
  it("has manifest_version 3", () => {
    expect(manifest.manifest_version).toBe(3);
  });

  it("has required extension name", () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.name.length).toBeGreaterThan(0);
  });

  it("has a valid version string", () => {
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("declares sidePanel permission", () => {
    expect(manifest.permissions).toContain("sidePanel");
  });

  it("declares storage permission", () => {
    expect(manifest.permissions).toContain("storage");
  });

  it("declares alarms permission", () => {
    expect(manifest.permissions).toContain("alarms");
  });

  it("has a service worker background script", () => {
    expect(manifest.background?.service_worker).toBeTruthy();
  });

  it("has a side_panel default path", () => {
    expect(manifest.side_panel?.default_path).toBeTruthy();
  });

  it("has content_scripts for Google domains", () => {
    expect(manifest.content_scripts).toHaveLength(1);
    const cs = manifest.content_scripts[0];
    expect(cs.matches.length).toBeGreaterThan(0);
    for (const pattern of cs.matches) {
      expect(pattern).toMatch(/google/);
    }
  });

  it("has web_accessible_resources", () => {
    expect(manifest.web_accessible_resources).toBeDefined();
    expect(manifest.web_accessible_resources.length).toBeGreaterThan(0);
  });

  it("has icons for all required sizes", () => {
    for (const size of ["16", "32", "48", "128"]) {
      expect(manifest.icons[size]).toBeTruthy();
    }
  });

  it("does not request excessive permissions", () => {
    const dangerous = ["downloads", "history", "bookmarks", "cookies", "webRequest", "debugger", "management"];
    for (const perm of dangerous) {
      expect(manifest.permissions, `should not have "${perm}" permission`).not.toContain(perm);
    }
  });
});
