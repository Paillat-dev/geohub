import DefaultErrorPage from 'next/error'
import { useRouter } from 'next/router'
import React, { FC, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import Game from '@backend/models/game'
import { mailman } from '@backend/utils/mailman'
import { FinalResultsCard } from '@components/FinalResultsCard'
import { Head } from '@components/Head'
import { LoadingPage } from '@components/Layout'
import { ResultMap } from '@components/ResultMap'
import { ResultsCard } from '@components/ResultsCard'
import { StreetView } from '@components/StreetView'
import { Spinner } from '@components/System'
import { selectUser } from '@redux/user'
import StyledGamePage from '@styles/GamePage.Styled'
import { PageType } from '@types'

const GamePage: PageType = () => {
  const [view, setView] = useState<'Game' | 'Result' | 'FinalResults'>('Game')
  const [gameData, setGameData] = useState<Game | null>()
  const router = useRouter()
  const gameId = router.query.id as string
  const user = useSelector(selectUser)

  const fetchGame = async () => {
    const { status, res } = await mailman(`games/${gameId}`)

    // if game not found, set gameData to null so an error page can be displayed
    console.log(`STATUS: ${status}`)
    if (status === 404 || status === 500) {
      return setGameData(null)
    }

    // To make it more secure, I could do this in gSSP (this is fine for now)
    if (res.userId !== user.id) {
      router.push('/')
    }

    // if game is completed, set view to Result
    if (res.round > 5) {
      setView('Result')
    }

    const gameData = {
      id: gameId,
      ...res,
    }

    setGameData(gameData)
  }

  useEffect(() => {
    if (!gameId) {
      return
    }

    if (view === 'Game') {
      fetchGame()
    }
  }, [gameId, view])

  if (gameData === null) {
    return <DefaultErrorPage statusCode={500} />
  }

  if (!gameData) {
    return (
      <StyledGamePage>
        <div className="loading-screen">
          <Spinner size={50} />
        </div>
      </StyledGamePage>
    )
  }

  return (
    <StyledGamePage>
      <Head title={`Game - ${gameData.round <= 5 ? `Round ${gameData.round}` : 'Results'}`} />

      {view === 'Game' ? (
        <StreetView gameData={gameData} setGameData={setGameData} setView={setView} />
      ) : (
        <>
          {view === 'Result' && (
            <ResultMap guessedLocations={gameData.guesses} actualLocations={gameData.rounds} round={gameData.round} />
          )}

          {view === 'FinalResults' && (
            <ResultMap
              guessedLocations={gameData.guesses}
              actualLocations={gameData.rounds}
              round={gameData.round}
              isFinalResults
            />
          )}

          <div className="resultsWrapper">
            {view === 'FinalResults' ? (
              <FinalResultsCard gameData={gameData} />
            ) : (
              <ResultsCard
                round={gameData.round}
                distance={gameData.guesses[gameData.guesses.length - 1].distance}
                points={gameData.guesses[gameData.guesses.length - 1].points}
                noGuess={
                  gameData.guesses[gameData.guesses.length - 1].timedOut &&
                  !gameData.guesses[gameData.guesses.length - 1].timedOutWithGuess
                }
                setView={setView}
              />
            )}
          </div>
        </>
      )}
    </StyledGamePage>
  )
}

GamePage.noLayout = true

export default GamePage
