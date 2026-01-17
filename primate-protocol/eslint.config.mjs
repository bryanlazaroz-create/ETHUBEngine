import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    ignores: [
      "android/**",
      "app/**",
      "components/**",
      "lib/**",
      "docs/**",
      "public/**",
      "scripts/**",
      "dist/**",
      "out/**",
      ".next/**",
      "build/**",
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
