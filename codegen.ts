import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:3000/api",
  documents: ["./constants/**/*.ts*", "./mobile/constants/**/*.ts"],
  generates: {
    "./mobile/__generated__/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
    "./mobile/__generated__/schema.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
        includeIntrospectionTypes: true,
        commentDescriptions: true,
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
