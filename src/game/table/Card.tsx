import React from "react";

interface CardProps {
  card: {
    rank: string;
    suit: string;
  };
  index: number;
  hidden?: boolean;
}

export function Card({ card, index, hidden }: CardProps) {
  return (
    <div
      className="sj-card"
      style={{
        transform: `translateX(${index * 36}px)`,
        zIndex: index,
      }}
    >
      <div className={hidden ? "sj-card-back" : "sj-card-front"}>
        {!hidden && (
          <>
            <div className="sj-card-corner">
              {card.rank}
              {card.suit}
            </div>
            <div className="sj-card-suit">{card.suit}</div>
            <div className="sj-card-corner sj-card-corner-bottom">
              {card.rank}
              {card.suit}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
