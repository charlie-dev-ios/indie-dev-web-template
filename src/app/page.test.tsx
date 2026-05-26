import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("テンプレートのタイトルを表示する", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: "Indie Dev Web Template" }),
    ).toBeInTheDocument();
  });
});
