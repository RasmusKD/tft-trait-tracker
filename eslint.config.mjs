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
      "quotes": ["warn", "single"],
      "indent": [
        "warn",
        4,
        {
          SwitchCase: 1,
        },
      ],
      "array-bracket-spacing": ["warn", "always"],
      "brace-style": ["warn", "allman"],
      "template-curly-spacing": ["warn", "always"],
      "no-multi-spaces": ["warn"],
      "object-curly-spacing": [
        "warn",
        "always",
        {
          arraysInObjects: true,
          objectsInObjects: false,
        },
      ],
      "jsx-quotes": ["warn"],
      "react/prop-types": "off",
      "react/jsx-curly-spacing": [
        "warn",
        {
          when: "always",
          children: true,
        },
      ],
      "react/jsx-equals-spacing": ["warn"],
      "react/jsx-newline": [
        "warn",
        {
          prevent: true,
        },
      ],
    },
  },
];

export default eslintConfig;