import { z } from 'zod';
import {SectionType} from "@prisma/client";

const BaseSectionSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
});

export const SectionValidationSchema = z.discriminatedUnion("type", [
    BaseSectionSchema.extend({
        type: z.literal(SectionType.DESCRIPTION),
        content: z.string().min(1, "Content is required for description sections"),
    }),

    BaseSectionSchema.extend({
        type: z.literal(SectionType.DIAGRAM),
        imageUrl: z.string().url("Must be a valid URL").optional(),
        mermaidCode: z.string().optional(),
        altText: z.string().optional(),
    }).refine((data) => data.imageUrl || data.mermaidCode, {
        message: "Diagrams must contain either an imageUrl or mermaidCode",
        path: ["imageUrl"],
    }),

    BaseSectionSchema.extend({
        type: z.enum([
            SectionType.LIST_OF_USE_CASES,
            SectionType.BACKLOG_TABLE,
            SectionType.LIST_OF_SPECIFICATIONS,
            SectionType.TABLE_OF_CONTENTS,
        ]),
    }),
]);