import { CodegenConfig } from '@graphql-codegen/cli';

const supabaseUrl = 'https://xuwdmsyxpaozpdkawxbo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1d2Rtc3l4cGFvenBka2F3eGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzIyNDAwMjksImV4cCI6MTk4NzgxNjAyOX0.xGZqJAw62gfUxNBnaZWuNwrNk839Zvx3k1P_DdebgEc'

const config: CodegenConfig = {
  schema: `${supabaseUrl}/graphql/v1?apikey=${supabaseKey}`,
  documents: ['src/**/*.tsx'],
  generates: {
    './src/__generated__/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      }
    }
  },
  ignoreNoDocuments: true,
};

export default config;