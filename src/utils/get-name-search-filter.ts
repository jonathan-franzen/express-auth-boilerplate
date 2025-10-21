import { Prisma } from '@prisma/client'

export const getNameSearchFilter = (searchQuery?: string) => {
  const query = searchQuery?.trim()

  if (!query) {
    return {}
  }

  const searchTerms = query.split(/\s+/).filter(Boolean)

  if (searchTerms.length > 1) {
    return {
      AND: searchTerms.map((term) => ({
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
        ],
      })),
    } as const satisfies Prisma.UserWhereInput
  }

  return {
    OR: [
      { firstName: { contains: query, mode: 'insensitive' } },
      { lastName: { contains: query, mode: 'insensitive' } },
    ],
  } as const satisfies Prisma.UserWhereInput
}
