import {
  createClient as createSupabaseClient,
  Session,
  User,
} from '@supabase/supabase-js'
import type { NextComponentType, NextPage } from 'next'
import Head from 'next/head'
import React, { ReactComponentElement, useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { gql } from '../__generated__/gql'
import { OrderByDirection } from '../__generated__/graphql'
import { supabase, supabaseAnonKey, supabaseUrl } from '../constants'

const Home: NextPage = () => {
  const [session, setSession] = useState<Session | null>(null)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('onSubmit called')
  }

  useEffect(() => {
    const initialize = async () => {
      const initialSession = (await supabase.auth.getSession())?.data.session
      setSession(initialSession)
    }

    initialize()

    const authListener = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
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
        {session ? <TodoList /> : <LoginForm />}
      </main>
    </>
  )
}

export default Home

const tasksQuery = gql(/* GraphQL */ `
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
`)

const TodoList = (): JSX.Element => {
  const { loading, error, data } = useQuery(tasksQuery, {
    variables: {
      orderBy: [
        {
          created_at: OrderByDirection.AscNullsFirst,
        },
      ],
    },
  })

  if (loading) {
    return <div>Loading</div>
  } else if (error) {
    return <div>Error occured: {error.message}</div>
  }
  const tasks = data!.tasksCollection!.edges
  return (
    <>
      {tasks.map((task) => (
        <div>{task.node.title}</div>
      ))}
    </>
  )
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
