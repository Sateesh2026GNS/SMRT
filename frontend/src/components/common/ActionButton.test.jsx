import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ActionButton from "./ActionButton";

describe("ActionButton", () => {
  it("renders the provided label and variant styles", () => {
    render(<ActionButton variant="primary">Create</ActionButton>);
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });
});
