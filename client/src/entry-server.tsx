import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { AppContent } from "./App";
export { metadata, publicPaths } from "./components/Seo";
export function render(path: string) {
  return renderToString(
    <StaticRouter location={path}>
      <AppContent />
    </StaticRouter>,
  );
}
