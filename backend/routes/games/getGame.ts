import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { Game } from '@backend/models'
import getMapFromGame from '@backend/queries/getMapFromGame'
import {
  collections,
  compareObjectIds,
  throwError,
  verifyUser
} from '@backend/utils'
import { userProject } from '@backend/utils/dbProjects'

const getGame = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId } = await verifyUser(req, res)

  const gameId = req.query.id as string

  if (gameId.length !== 24) {
    return throwError(res, 404, 'Failed to find game')
  }

  const gameQuery = await collections.games
    ?.aggregate([
      { $match: { _id: new ObjectId(gameId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      { $project: { userDetails: userProject } },
    ])
    .toArray()

  if (!gameQuery || gameQuery.length !== 1) {
    return throwError(res, 404, 'Failed to find game')
  }

  const game = gameQuery[0] as Game
  const gameBelongsToUser = compareObjectIds(userId, game.userId)
  const mapDetails = await getMapFromGame(game)

  res.status(200).send({ game, gameBelongsToUser, mapDetails })
}

export default getGame
