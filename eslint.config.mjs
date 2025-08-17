import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Disable rules that commonly cause build failures
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
      "@next/next/no-page-custom-font": "off",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": "warn",
      "prefer-const": "warn",
      "no-console": "warn",
      // Add more lenient rules as needed
    },
    ignorePatterns: [
      "node_modules/",
      ".next/",
      "out/",
      "build/",
      "dist/",
      "*.config.js",
      "*.config.mjs"
    ]
  }
];

export default eslintConfig;
