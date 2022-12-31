import { createClient } from "@supabase/supabase-js"
import { gql } from "./__generated__/gql"

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


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

export const taskMutation = gql(`
    mutation TaskMutation($objects: [tasksInsertInput!]!) {
        insertIntotasksCollection(objects: $objects) {
            records {
            title
            }
        }
    }
`)