import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { createClient, Provider } from 'urql'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

const graphqlClient = createClient({
  url: `${supabaseUrl}/graphql/v1`,
  // fetchOptionsを使ってaccessTokenをheaderに設定したいが、async functionが使えなくて断念
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // `graphqlClient`をアプリに渡す
    <Provider value={graphqlClient}>
      <Component {...pageProps} />
    </Provider>
  )
}

export default MyApp
