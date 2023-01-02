import { CodegenConfig } from '@graphql-codegen/cli'
import { supabaseAnonKey, supabaseUrl } from './src/constants'

const config: CodegenConfig = {
  // The Supabase GraphQL endpoint
  schema: `${supabaseUrl}/graphql/v1?apikey=${supabaseAnonKey}`,

  // Which files to look for queries and mutations
  documents: ['./src/constants.ts'],

  // Which directory to put the output files
  generates: {
    './src/__generated__/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config
