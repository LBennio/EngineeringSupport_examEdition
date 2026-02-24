export interface BaseSection {
    id: string,
    type: SectionType,
    title: string,
    description?: string | null,
    order: number,
    isRequired: boolean,
    isUnique: boolean,
}

// export interface TableOfContentsSectionContent {

// }

export interface DescriptionSection extends BaseSection {
    type: SectionType.DESCRIPTION,
    content: string,
}

export interface TableOfContentsSection extends BaseSection {
    type: SectionType.TABLE_OF_CONTENTS
}

export interface ListOfUseCaseSection extends BaseSection {
    type: SectionType.LIST_OF_USE_CASES,
    useCases: UseCase[]
}

export interface ListOfSpecificationSection extends BaseSection {
    type: SectionType.LIST_OF_SPECIFICATIONS,
    specifications: UseCaseSpecification[],
}

export interface BacklogTableSection extends BaseSection {
    type: SectionType.BACKLOG_TABLE,
    backlogItems: BacklogItem[],
}

export interface DiagramSection extends BaseSection {
    type: SectionType.DIAGRAM,
    imageUrl?: string | null,
    mermaidCode?: string | null,
    caption?: string | null,
}

export interface UseCase {
    id: string,
    title: string,
    description?: string | null,

    specificationId?: string | null,
    sectionId: string,
}

export interface UseCaseSpecification {
    id: string,
    useCaseId: string,

    primaryActors: string[],
    secondaryActors?: string[] | null,
    preconditions?: string[] | null,
    primarySequence: string,
    postconditions?: string[] | null,
    alternativeSequence?: string | null,
}

export interface BacklogItem {
    id: string,
    sprintNumber: number,
    notes?: string | null,

    status: 'TODO' | 'IN_PROGRESS' | 'DONE',
}

export enum SectionType {
    DESCRIPTION = "DESCRIPTION",
    LIST_OF_USE_CASES = "LIST_OF_USE_CASES",
    BACKLOG_TABLE = "BACKLOG_TABLE",
    LIST_OF_SPECIFICATIONS = "LIST_OF_SPECIFICATIONS",
    TABLE_OF_CONTENTS = "TABLE_OF_CONTENTS",
    DIAGRAM = "DIAGRAM",
    IMAGE = "IMAGE",
}

export type Section =
    DescriptionSection |
    TableOfContentsSection |
    ListOfUseCaseSection |
    ListOfSpecificationSection |
    BacklogTableSection |
    DiagramSection;