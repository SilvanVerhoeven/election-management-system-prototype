import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { Committee as DbCommittee } from "db"

export interface CommitteeProps {
  name: string
  shortName?: string
  versionId: number
}

/**
 * Creates a new polling station, unless it matches another polling station completely.
 *
 * @returns Newly created or matching constituency in the bare DB form
 */
export default resolver.pipe(
  async ({ name, shortName, versionId }: CommitteeProps, ctx: Ctx): Promise<DbCommittee> => {
    const match = await db.committee.findFirst({
      where: {
        OR: [{ name }, { shortName }],
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    if (match) {
      const isCompleteMatch = match.name == name && match.shortName == (shortName || null)

      if (isCompleteMatch) return match
    }

    const newCommitteeId = match
      ? match.globalId
      : ((await db.committee.findFirst({ orderBy: { globalId: "desc" } }))?.globalId ?? 0) + 1

    return await db.committee.create({
      data: {
        globalId: newCommitteeId,
        name,
        shortName: shortName || null,
        version: { connect: { id: versionId } },
      },
    })
  }
)
