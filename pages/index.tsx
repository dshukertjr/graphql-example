import {
  createClient as createSupabaseClient,
  User,
} from '@supabase/supabase-js'
import type { NextPage } from 'next'
import Head from 'next/head'
import React, { ReactElement, useEffect, useState } from 'react'
import { createClient as createGraphQLClient } from 'urql'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

const graphqlClient = createGraphQLClient({
  url: `${supabaseUrl}/graphql/v1`,
  fetchOptions: () => {
    const token = ''
    return {
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${token ?? supabaseAnonKey}`,
      },
    }
  },
})

const Home: NextPage = () => {
  const [user, setUser] = useState<User | null>(null)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('onSubmit called')
  }

  useEffect(() => {
    const initialize = async () => {
      const initialUser = (await supabase.auth.getUser())?.data.user
      setUser(initialUser ?? null)
    }

    initialize()

    const authListener = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null
        setUser(user)
      }
    )

    return () => {
      authListener.data.subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Supabase pg_graphql Example</title>
      </Head>

      <main className="flex items-center justify-center min-h-screen bg-black">
        {user ? (
          <form className="flex flex-col space-y-2" onSubmit={onSubmit}>
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded block p-2"
              name="price"
            >
              <option value="100">$100</option>
              <option value="200">$200</option>
              <option value="300">$300</option>
            </select>
            <button
              type="submit"
              className="py-1 px-4 text-lg bg-green-400 rounded"
            >
              Place an Order
            </button>
          </form>
        ) : (
          <LoginForm></LoginForm>
        )}
      </main>
    </div>
  )
}

export default Home

const LoginForm = () => {
  const sendMagicLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const { email } = Object.fromEntries(new FormData(event.currentTarget))
    if (typeof email !== 'string') return

    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      alert(error.message)
    } else {
      alert('Check your email inbox')
    }
  }

  return (
    <form className="flex flex-col space-y-2" onSubmit={sendMagicLink}>
      <input
        className="border-green-300 border rounded p-2 bg-transparent text-white"
        type="email"
        name="email"
        placeholder="Email"
      />
      <button type="submit" className="py-1 px-4 text-lg bg-green-400 rounded">
        Send Magic Link
      </button>
    </form>
  )
}
