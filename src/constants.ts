import { createClient } from '@supabase/supabase-js'
import { gql } from './__generated__'

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/** Query to get all tasks */
export const tasksQuery = gql(`
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

/** Mutation to insert a new task */
export const taskInsert = gql(`
    mutation TaskMutation($objects: [tasksInsertInput!]!) {
        insertIntotasksCollection(objects: $objects) {
            records {
            title
            }
        }
    }
`)

/** Mutation to update a task */
export const taskUpdate = gql(`
    mutation Mutation($set: tasksUpdateInput!, $filter: tasksFilter) {
        updatetasksCollection(set: $set, filter: $filter) {
            records {
                is_completed
            }
        }
    }
`)
