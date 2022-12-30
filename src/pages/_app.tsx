import '../styles/globals.css'
import type { AppProps } from 'next/app'
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client'
import { supabase, supabaseAnonKey, supabaseUrl } from '../constants'
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({
  uri: '/graphql',
})

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const session = (await supabase.auth.getSession()).data.session
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: `Bearer ${
        session ? session.access_token : supabaseAnonKey
      }`,
    },
  }
})

const client = new ApolloClient({
  uri: `${supabaseUrl}/graphql/v1`,
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  headers: { apikey: supabaseAnonKey },
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  )
}

export default MyApp
