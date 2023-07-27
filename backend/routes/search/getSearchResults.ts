import { NextApiRequest, NextApiResponse } from 'next'
import { collections } from '@backend/utils'
import { userProject } from '@backend/utils/dbProjects'

// Reference: https://docs.atlas.mongodb.com/reference/atlas-search/text/

// Takes in a search query and returns at most 3 users and 3 maps matching the query
const getSearchResults = async (req: NextApiRequest, res: NextApiResponse) => {
  const query = req.query.q as string
  const count = Number(req.query.count as string)

  const usersQuery = await collections.users
    ?.aggregate([
      {
        $search: {
          index: 'user-search',
          autocomplete: {
            query: query,
            path: 'name',
          },
        },
      },
      { $project: userProject },
      { $limit: count || 3 },
    ])
    .toArray()

  const mapsQuery = await collections.maps
    ?.aggregate([
      {
        $search: {
          index: 'search-maps',
          autocomplete: {
            query: query,
            path: 'name',
          },
        },
      },
      { $match: { isPublished: true, isDeleted: { $exists: false } } },
      { $limit: count || 3 },
    ])
    .toArray()

  const users = usersQuery || []
  const maps = mapsQuery || []

  res.status(200).send({ users, maps })
}

export default getSearchResults
