import Link from 'next/link'
import { FC } from 'react'
import Game from '@backend/models/game'
import { StreakCountryList } from '../../StreakCountryList'
import { Button } from '../../System'
import { ResultsWrapper } from '../ResultsWrapper'
import { StyledStreakFinalResults } from './'

type Props = {
  gameData: Game
  setView: (view: 'Game' | 'Result' | 'FinalResults') => void
}

const StreakFinalResults: FC<Props> = ({ gameData, setView }) => {
  return (
    <ResultsWrapper>
      <StyledStreakFinalResults>
        <div>
          <p className="streak-count">
            {`Your streak ended at ${gameData.streak} ${gameData.streak === 1 ? 'country' : 'countries'}`}.
          </p>

          <div className="country-list">
            <StreakCountryList gameData={gameData} />
          </div>

          <div className="action-buttons">
            <Link href="/streaks">
              <a>
                <Button>Play Again</Button>
              </a>
            </Link>

            <Link href="/">
              <a>
                <Button variant="solidGray">Return To Home</Button>
              </a>
            </Link>
          </div>
        </div>
      </StyledStreakFinalResults>
    </ResultsWrapper>
  )
}

export default StreakFinalResults
