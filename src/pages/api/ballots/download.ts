import mime from "mime"
import { api } from "src/blitz-server"
import getElections from "../basis/queries/getElections"
import { downloadBallot, getBallotFileName, getBallotFileType } from "./[electionId]"
import { zippify } from "src/core/lib/files"

export default api(async (req, res, ctx) => {
  if (req.method !== "GET") {
    res.status(405).send({ error: "Method not allowed" })
    return
  }

  const elections = await getElections(null, ctx)
  const ballots = await Promise.all(
    elections.map(async (election) => await downloadBallot(election, ctx))
  )

  const zip = zippify(
    elections,
    ballots,
    (election) => `${getBallotFileName(election)}.${getBallotFileType()}`
  )

  const now = new Date()
  const dateTimeString = `${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`

  res
    .setHeader("content-disposition", `attachment; filename="stimmzettel-${dateTimeString}.zip"`)
    .setHeader("content-type", mime.getType("zip") || "")
    .send(zip)
})
