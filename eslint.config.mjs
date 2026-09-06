import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "backend-java/target/**",
    "snow-night/dist/**",
    "public/**",
    "awesome-design-md/**",
    "next-env.d.ts",
  ]),
  {
    // The existing visual components intentionally synchronize mounted/audio
    // state from effects and expose a few dynamic prop surfaces.
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
]);

export default eslintConfig;
