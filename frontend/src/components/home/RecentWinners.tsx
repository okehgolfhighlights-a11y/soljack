import React from 'react';
import './RecentWinners.css';

// This would come from your backend/WebSocket in production
const MOCK_WINNERS = [
  { wallet: '7KwQ...jiym4', amount: 1.5, type: 'Tournament' },
  { wallet: 'Abc1...xyz9', amount: 0.5, type: 'PvP' },
  { wallet: '9Xmp...4def', amount: 2.1, type: 'Tournament' },
  { wallet: 'Test...5abc', amount: 0.25, type: 'PvP' },
];

interface RecentWinnersProps {
  winners?: typeof MOCK_WINNERS;
}

export const RecentWinners: React.FC<RecentWinnersProps> = ({
  winners = MOCK_WINNERS
}) => {
  return (
    <div className="recent-winners">
      <div className="winners-ticker">
        {winners.map((winner, index) => (
          <div key={index} className="winner-card">
            <div className="winner-card__icon">🏆</div>
            <div className="winner-card__info">
              <div className="winner-card__wallet">{winner.wallet}</div>
              <div className="winner-card__details">
                <span className="winner-card__amount">{winner.amount} SOL</span>
                <span className="winner-card__type">{winner.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentWinners;
