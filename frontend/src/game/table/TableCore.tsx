import React from "react";
import { Card } from "./Card";

export interface PlayingCard {
  id: string;
  rank: string;
  suit: string;
}

interface TableCoreProps {
  title?: string;
  hand: PlayingCard[];
  hiddenFirst?: boolean;
}

export default function TableCore({ title, hand, hiddenFirst }: TableCoreProps) {
  return (
    <div className="sj-table">
      {title && <h3>{title}</h3>}
      <div className="sj-hand">
        {hand.map((card, i) => (
          <Card
            key={card.id}
            card={card}
            index={i}
            hidden={hiddenFirst && i === 0}
          />
        ))}
      </div>
    </div>
  );
}
