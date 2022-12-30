import {
  createClient as createSupabaseClient,
  User,
} from '@supabase/supabase-js'
import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { ApolloClient, gql, InMemoryCache } from '@apollo/client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

const apolloClient = new ApolloClient({
  uri: `${supabaseUrl}/graphql/v1`,
  cache: new InMemoryCache(),
  headers: { apikey: supabaseAnonKey },
})

const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// const graphqlClient = createGraphQLClient({
//   url: `${supabaseUrl}/graphql/v1`,
//   fetchOptions: () => {
//     const token = ''
//     return {
//       headers: {
//         apikey: supabaseAnonKey,
//         authorization: `Bearer ${token ?? supabaseAnonKey}`,
//       },
//     }
//   },
// })

const Home: NextPage = () => {
  const [user, setUser] = useState<User | null>(null)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('onSubmit called')
  }

  const getTodo = async () => {
    const { data } = await apolloClient.query({
      query: gql`
        query TasksQuery($orderBy: [tasksOrderBy!]) {
          tasksCollection(orderBy: $orderBy) {
            edges {
              node {
                title
                is_completed
                id
              }
            }
          }
        }
      `,
      variables: {
        orderBy: [
          {
            created_at: 'DescNullsFirst',
          },
        ],
      },
    })

    console.log(data)
  }

  useEffect(() => {
    const initialize = async () => {
      const initialUser = (await supabase.auth.getUser())?.data.user
      setUser(initialUser ?? null)
      if (initialUser) {
        getTodo()
      }
    }

    initialize()

    const authListener = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null
        setUser(user)
        if (user) {
          getTodo()
        }
      }
    )

    return () => {
      authListener.data.subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      <Head>
        <title>Supabase pg_graphql Example</title>
      </Head>

      <main className="flex items-center justify-center min-h-screen bg-black">
        {user ? <TodoList /> : <LoginForm />}
      </main>
    </>
  )
}

export default Home

const TodoList = () => {
  const TodosQuery = `
  query TasksQuery {
    tasksCollection {
      edges {
        node {
          id
          title
        }
      }
    }
  }
  `

  return <div>loaded</div>
}

const LoginForm = () => {
  const sendMagicLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const { email } = Object.fromEntries(new FormData(event.currentTarget))
    if (typeof email !== 'string') return

    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      console.log(error)
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
