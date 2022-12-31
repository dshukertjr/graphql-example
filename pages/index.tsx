import {
  createClient as createSupabaseClient,
  Session,
  User,
} from '@supabase/supabase-js'
import type { NextComponentType, NextPage } from 'next'
import Head from 'next/head'
import React, { ReactComponentElement, useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { gql } from '../src/__generated__/gql'
import { OrderByDirection } from '../src/__generated__/graphql'
import { supabase, supabaseAnonKey, supabaseUrl } from '../src/constants'

const Home: NextPage = () => {
  const [session, setSession] = useState<Session | null>(null)

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
    <div className="flex flex-col bg-black h-screen">
      <Head>
        <title>Supabase pg_graphql Example</title>
      </Head>

      <AppHeader isSignedIn={!!session} />

      <main className="text-white flex-grow flex items-center justify-center max-w-4xl mx-auto">
        {session ? <TodoList /> : <LoginForm />}
      </main>
    </div>
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
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const { task } = Object.fromEntries(new FormData(event.currentTarget))
    if (typeof task !== 'string') return
  }

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
    <div className="h-full flex flex-col w-full">
      <div className="flex-grow">
        {tasks.map((task) => (
          <div className="text-lg">{task.node.title}</div>
        ))}
      </div>
      <form className="flex items-center " onSubmit={onSubmit}>
        <input
          className="border-green-300 border bg-transparent rounded p-2 flex-grow mr-2"
          type="task"
          name="task"
          placeholder="Task"
        />
        <button
          type="submit"
          className="py-1 px-4 text-lg bg-green-400 rounded text-black"
        >
          Submit
        </button>
      </form>
    </div>
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
    <form
      className="flex flex-col justify-center space-y-2 max-w-md px-4"
      onSubmit={sendMagicLink}
    >
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

/** Simple header element with title and signout button */
const AppHeader = ({ isSignedIn }: { isSignedIn: boolean }) => {
  return (
    <header className="bg-black shadow shadow-green-400 px-4">
      <div className="flex max-w-4xl mx-auto items-center h-16">
        <div className=" text-white text-lg flex-grow">
          Supabase pg_graphql Example
        </div>
        {!isSignedIn ?? (
          <button
            className="py-1 px-2 text-white border border-white rounded"
            onClick={() => supabase.auth.signOut()}
          >
            Sign Out
          </button>
        )}
      </div>
    </header>
  )
}
