import type { NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { mailman } from '@backend/utils/mailman'
import { Head } from '@components/Head'
import { Layout, LoadingPage } from '@components/Layout'
import { BlockQuote } from '@components/System/'
import { Skeleton } from '@components/System/Skeleton'
import { UnfinishedCard } from '@components/UnfinishedCard'
import { selectUser } from '@redux/user'

const StyledHeader = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
`

const StyledGamesWrapper = styled.section`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`

const OngoingGamesPage: NextPage = () => {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const user = useSelector(selectUser)

  useEffect(() => {
    if (!user.id) {
      return setLoading(false)
    }

    const fetchGames = async () => {
      const { res } = await mailman(`games/unfinished?userId=${user.id}`)
      setGames(res)
      setLoading(false)
    }

    fetchGames()
  }, [user])

  const reloadGames = (gameId: string) => {
    const filtered = games.filter((game) => game._id != gameId)
    setGames(filtered)
  }

  return (
    <Layout>
      <Head title="Ongoing Games" />
      <StyledHeader>Ongoing Games</StyledHeader>

      {/*(!user.id || !games || games.length === 0) && (
        <BlockQuote>You do not appear to have any ongoing games</BlockQuote>
      )*/}

      {loading ? (
        Array.from({ length: 10 }).map((_, idx) => <Skeleton key={idx} />)
      ) : (
        <StyledGamesWrapper>
          {games.map((game, idx) => (
            <UnfinishedCard
              key={idx}
              mapAvatar={game.mapDetails[0].previewImg}
              mapName={game.mapDetails[0].name}
              round={game.round}
              points={game.totalPoints}
              gameId={game._id}
              reloadGames={reloadGames}
            />
          ))}
        </StyledGamesWrapper>
      )}
    </Layout>
  )
}

export default OngoingGamesPage
