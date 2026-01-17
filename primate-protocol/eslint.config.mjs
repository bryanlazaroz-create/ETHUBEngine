import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    ignores: [
      "**/.next/**",
      "**/out/**",
      "**/dist/**",
      "**/build/**",
      "**/android/**",
      "**/app/**",
      "**/components/**",
      "**/lib/**",
      "**/docs/**",
      "**/public/**",
      "**/scripts/**",
      "**/*.ts",
      "**/*.tsx",
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];
