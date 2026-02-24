import { PrismaClient, Role, GroupRole, SectionType } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // 1. CLEANUP (Wipe DB)
    // Order matters to avoid foreign key constraint errors
    await prisma.backlogItem.deleteMany()
    await prisma.useCaseSpecification.deleteMany()
    await prisma.useCase.deleteMany()
    await prisma.section.deleteMany()
    await prisma.document.deleteMany()
    await prisma.project.deleteMany()
    await prisma.groupMember.deleteMany()
    await prisma.group.deleteMany()
    await prisma.passwordReset.deleteMany()
    await prisma.ticket.deleteMany()
    await prisma.user.deleteMany()

    console.log('🧹 Database cleaned')

    // 2. PRE-CALCULATE HASH
    const passwordHash = await hash('password123', 12)

    console.log('👤 Creating Users...')

    // 3. CREATE USERS
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@reqapp.com',
            name: 'Alice',
            surname: 'Admin',
            password: passwordHash,
            role: Role.ADMIN,
        }
    })

    const pmUser = await prisma.user.create({
        data: {
            email: 'bob@manager.com',
            name: 'Bob',
            surname: 'Manager',
            password: passwordHash,
            role: Role.UPGRADED_USER,
        }
    })

    const devUser = await prisma.user.create({
        data: {
            email: 'charlie@dev.com',
            name: 'Charlie',
            surname: 'Coder',
            password: passwordHash,
            role: Role.BASE_USER,
        }
    })

    // 4. CREATE GROUPS
    console.log('🏢 Creating Groups...')

    // We capture the group to use its ID later for projects
    const acmeGroup = await prisma.group.create({
        data: {
            name: 'Acme Corp',
            description: 'The main engineering department',
            code: 'ACME2026',
            members: {
                create: [
                    // Alice is OWNER, so she can create projects (matches your API logic)
                    { userId: adminUser.id, role: GroupRole.OWNER },
                    { userId: pmUser.id, role: GroupRole.PRODUCT_MANAGER },
                    { userId: devUser.id, role: GroupRole.SOFTWARE_ENGINEER }
                ]
            }
        }
    })

    // 5. CREATE PROJECTS
    console.log('🚀 Creating Projects...')

    const projectAlpha = await prisma.project.create({
        data: {
            title: 'Project Alpha',
            description: 'The next gen AI platform',
            groupId: acmeGroup.id,
        }
    })

    const projectBeta = await prisma.project.create({
        data: {
            title: 'Project Beta',
            description: 'Legacy system maintenance',
            groupId: acmeGroup.id,
        }
    })

    // 6. CREATE DOCUMENT FOR PROJECT ALPHA
    console.log('📄 Creating Documents & Sections...')

    // Create the main document
    const docAlpha = await prisma.document.create({
        data: {
            title: 'Project Alpha Requirements',
            version: '1.0.0',
            projectId: projectAlpha.id,
        }
    })

    // 7. CREATE USE CASES (The Data Layer)
    // We create these first so we can reference them if needed,
    // though strictly speaking sections just render them.
    const ucLogin = await prisma.useCase.create({
        data: {
            documentId: docAlpha.id,
            title: 'User Login',
            description: 'Allow users to log in via email/password',
            specification: {
                create: {
                    primaryActors: ['User'],
                    secondaryActors: ['System Auth DB'],
                    preconditions: ['User is registered'],
                    primarySequence: '1. User enters email.\n2. User enters password.\n3. System validates credentials.',
                    postConditions: ['User is logged in']
                }
            }
        }
    })

    const ucReset = await prisma.useCase.create({
        data: {
            documentId: docAlpha.id,
            title: 'Password Reset',
            description: 'Allow users to reset forgotten passwords',
            specification: {
                create: {
                    primaryActors: ['User'],
                    preconditions: ['User has valid email'],
                    primarySequence: '1. User clicks reset.\n2. System sends email.',
                    postConditions: ['Email sent']
                }
            }
        }
    })

    // 8. CREATE SECTIONS
    // Creating standard sections + the dynamic ones
    await prisma.section.createMany({
        data: [
            {
                documentId: docAlpha.id,
                title: 'Introduction',
                type: SectionType.DESCRIPTION,
                content: 'Welcome to the Project Alpha requirements document. This outlines the core features.',
                order: 1,
                isUnique: true,
                isRequired: true
            },
            {
                documentId: docAlpha.id,
                title: 'Business Context',
                type: SectionType.DESCRIPTION,
                content: 'We need to capture the market by Q3.',
                order: 2,
                isUnique: true,
                isRequired: true
            },
            {
                documentId: docAlpha.id,
                title: 'Functional Requirements',
                type: SectionType.LIST_OF_USE_CASES,
                // Content is empty/ignored because the frontend will render the UseCases list here
                content: '',
                order: 3,
                isUnique: false,
                isRequired: false
            },
            {
                documentId: docAlpha.id,
                title: 'Detailed Specifications',
                type: SectionType.LIST_OF_SPECIFICATIONS,
                // Content is empty/ignored because frontend renders UseCaseSpecifications here
                content: '',
                order: 4,
                isUnique: false,
                isRequired: false
            }
        ]
    })

    console.log('✅ Seed completed successfully')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })