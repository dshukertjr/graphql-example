import { Session } from '@supabase/supabase-js'
import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { supabase, taskInsert, tasksQuery, taskUpdate } from '../src/constants'
import { OrderByDirection } from '../src/__generated__/graphql'

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
    data: queryData,
    refetch: refetchTasks,
  } = useQuery(tasksQuery, {
    variables: {
      orderBy: [
        {
          created_at: OrderByDirection.DescNullsFirst,
        },
      ],
    },
  })

  const [insertTask, { loading: mutationLoading }] = useMutation(taskInsert)

  const [updateTask, { loading: updateLoading }] = useMutation(taskUpdate)

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
      onCompleted: () => refetchTasks(),
    })
    formElement.reset()
  }

  const toggleTaskStatus = async (taskId: string, updatedStatus: boolean) => {
    await updateTask({
      variables: {
        set: {
          is_completed: updatedStatus,
        },
        filter: {
          id: {
            eq: taskId,
          },
        },
      },
      onCompleted: () => refetchTasks(),
    })
  }

  if (loading) {
    return <div>Loading</div>
  }

  const tasks = queryData!.tasksCollection!.edges
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow min-h-0 overflow-y-auto">
        {tasks.map((task) => (
          <div key={task.node.id} className="text-lg p-1 flex">
            <div className="flex-grow">{task.node.title}</div>
            <button
              className="px-2"
              onClick={() =>
                toggleTaskStatus(task.node.id, !task.node.is_completed)
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`w-6 h-6 ${
                  task.node.is_completed
                    ? 'stroke-green-500'
                    : 'stroke-gray-500'
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
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
          {mutationLoading ? 'Saving...' : 'Save'}
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
      className="flex flex-col justify-center space-y-2 max-w-md px-4 h-full"
      onSubmit={sendMagicLink}
    >
      <input
        className="border-green-300 border rounded p-2 bg-transparent text-white"
        type="email"
        name="email"
        placeholder="Email"
      />
      <button
        type="submit"
        className="py-1 px-4 text-lg bg-green-400 rounded text-black"
      >
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
