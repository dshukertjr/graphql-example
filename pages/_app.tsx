import '../styles/globals.css'
import type { AppProps } from 'next/app'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
