import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        pragma: "React",
        version: "19.0.0",
      },
    },
    rules: {
      "linebreak-style": "off",
      "quotes": ["error", "single"],
      "indent": [
        "error",
        4,
        {
          SwitchCase: 1,
        },
      ],
      "array-bracket-spacing": ["error", "always"],
      "brace-style": ["error", "allman"],
      "template-curly-spacing": ["error", "always"],
      "no-multi-spaces": ["error"],
      "object-curly-spacing": [
        "error",
        "always",
        {
          arraysInObjects: true,
          objectsInObjects: false,
        },
      ],
      "jsx-quotes": ["error"],
      "react/prop-types": "off",
      "react/jsx-curly-spacing": [
        "error",
        {
          when: "always",
          children: true,
        },
      ],
      "react/jsx-equals-spacing": ["error"],
      "react/jsx-newline": [
        "error",
        {
          prevent: true,
        },
      ],
    },
  },
];

export default eslintConfig;