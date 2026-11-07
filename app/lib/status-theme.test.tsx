import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

it("exposes status selectors in rendered badge and alert markup", () => {
  const markup = renderToStaticMarkup(<><Badge variant="destructive">Error</Badge><Badge data-ui-tone="success">Complete</Badge><Alert variant="destructive">Retry</Alert></>);
  expect(markup).toContain('data-slot="badge" data-variant="destructive"');
  expect(markup).toContain('data-ui-tone="success"');
  expect(markup).toContain('data-slot="alert" data-variant="destructive"');
});
