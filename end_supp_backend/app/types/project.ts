import { Section } from "@/app/types/Section";

export interface Project {
    id: string,
    title: string,
    description?: string | null,

    groupId: string,
    document?: Document,

    createdAt: Date,
    updatedAt: Date,
}

export interface Document {
    id: string,
    title: string,
    version: string,

    projectId: string,
    sections: Section[],

    createdAt: Date,
    updatedAt: Date,
}