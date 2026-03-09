export interface Board {
    id: string;
    title: string;
    description: string | null;
    color: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface Column {
    id: string;
    board_id: string;
    title: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
    user_id: string;
}

export type ColumnWithTasks = Column & {
  taskIds: string[]
}

export interface Task {
  id: string
  column_id: string
  title: string
  description: string | null
  assignee: string | null
  due_date: string | null
  priority: "low" | "medium" | "high"
  sort_order: number
  created_at: string
  updated_at: string

  task_labels?: TaskLabel[]
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  users?: UserProfile
}

export interface TaskActivity {
  id: string
  task_id: string
  user_id: string
  action: string
  metadata?: any
  created_at: string
  users?: UserProfile
}

export interface UserProfile {
  id: string
  name: string
  email?: string
  image_url?: string
}

export interface Label {
  id: string
  name: string
  color: string
  board_id: string
  created_at: string
  usage?: number
}

export interface TaskLabel {
  id?: string
  task_id?: string
  label_id: string
  labels: Label
}