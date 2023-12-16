import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Election } from "src/types"

/**
 * Returns individual elections running at the given elections.
 *
 * @returns Elections running at the given election
 */
export default resolver.pipe(async (electionsId: number, ctx: Ctx): Promise<Election[]> => {
  const elections = await db.election.findMany({
    where: {
      runsAtId: electionsId,
    },
    include: {
      committee: true,
      eligibleStatusGroups: true,
      eligibleConstituencies: {
        include: {
          presenceVotingAt: {
            include: { locatedAt: true },
          },
        },
      },
    },
  })

  return elections.map((election) => {
    return {
      id: election.id,
      numberOfSeats: election.numberOfSeats,
      committeeId: election.committeeId,
      committee: election.committee,
      statusGroups: election.eligibleStatusGroups,
      constituencies: election.eligibleConstituencies,
      runsAtId: election.runsAtId,
      versionId: election.versionId,
    }
  })
})
