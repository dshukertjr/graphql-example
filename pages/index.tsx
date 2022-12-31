import { Session } from '@supabase/supabase-js'
import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { OrderByDirection } from '../src/__generated__/graphql'
import { supabase, taskMutation, tasksQuery } from '../src/constants'

const Home: NextPage = () => {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const getInitialSession = async () => {
      const initialSession = (await supabase.auth.getSession())?.data.session
      setSession(initialSession)
    }

    getInitialSession()

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

      <main className="text-white flex-grow max-w-4xl mx-auto min-h-0">
        {session ? <TodoList /> : <LoginForm />}
      </main>
    </div>
  )
}

export default Home

const TodoList = (): JSX.Element => {
  const {
    loading,
    error: queryError,
    data: queryData,
    refetch,
  } = useQuery(tasksQuery, {
    variables: {
      orderBy: [
        {
          created_at: OrderByDirection.DescNullsFirst,
        },
      ],
    },
  })

  const [
    insertTask,
    { error: mutationError, data: mutationData, loading: mutationLoading },
  ] = useMutation(taskMutation)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const formElement = event.currentTarget
    event.preventDefault()
    const { title } = Object.fromEntries(new FormData(event.currentTarget))
    if (typeof title !== 'string') return
    if (!title) return
    await insertTask({
      variables: {
        objects: [{ title }],
      },
      onCompleted: () => {
        refetch()
      },
    })
    formElement.reset()
  }

  if (loading) {
    return <div>Loading</div>
  } else if (queryError) {
    return <div>Error occured: {queryError.message}</div>
  }

  const tasks = queryData!.tasksCollection!.edges
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow min-h-0 overflow-y-auto">
        {tasks.map((task) => (
          <div key={task.node.id} className="text-lg p-1">
            {task.node.title}
          </div>
        ))}
      </div>
      <form className="flex items-center p-1" onSubmit={onSubmit}>
        <input
          className="border-green-300 border bg-transparent rounded py-1 px-2 flex-grow mr-2"
          type="title"
          name="title"
          placeholder="New Task"
        />
        <button
          type="submit"
          disabled={mutationLoading}
          className="py-1 px-4 text-lg bg-green-400 rounded text-black disabled:bg-gray-500"
        >
          {mutationLoading ? 'Saving...' : 'Submit'}
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
  console.log({ isSignedIn })
  return (
    <header className="bg-black shadow shadow-green-400 px-4">
      <div className="flex max-w-4xl mx-auto items-center h-16">
        <div className=" text-white text-lg flex-grow">
          Supabase pg_graphql Example
        </div>
        {isSignedIn && (
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
