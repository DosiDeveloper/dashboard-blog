export interface IPost {
    id: string,
    title: string,
    parent_id: string,
    category_id: string,
    owner_id: string,
    editor_id: string,
    description: string || null,
    attachment: string,
    approved: boolean,
    updated_at: Date,
    created_at: Date,
}

export interface ICategory {
    id: string,
    parent_id: string,
    name: string,
    global_name: string
}

export interface IUsers {
    id: string,
    first_name: string,
    last_name: string,
    email: string
    role: string
}