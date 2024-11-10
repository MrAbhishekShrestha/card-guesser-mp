import { Card } from "../models/card.model";

export function generateCards(): Card[] {
  const deck: Card[] = [];
  for (let i = 0; i < 13; i++) {
    const card: Card = { suit: "S", rank: i, imgSrc: buildImageSrc(i) };
    deck.push(card);
  }
  return deck;
}

function getPrefix(index: number): string {
  index++;
  switch (index) {
    case 1: {
      return "ace"
    }
    case 11: {
      return "jack"
    }
    case 12: {
      return "queen"
    }
    case 13: {
      return "king"
    }
    default: {
      return String(index)
    }
  }
}

function buildImageSrc(index: number): string {
  const prefix = getPrefix(index);
  return `https://raw.githubusercontent.com/hayeah/playing-cards-assets/1e4497c05c3da9956c9f517bd386e9a7090ff7fa/svg-cards/${prefix}_of_spades.svg`;
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(
    () => { },
    err => console.error('copy to clipboard error: ', err)
  );
}

function convertRankStrToInt(char: string): number {
  switch (char) {
    case "A": {
      return 0;
    }
    case "J": {
      return 10;
    }
    case "Q": {
      return 11;
    }
    case "K": {
      return 12;
    }
    default: {
      return parseInt(char);
    }
  }
}

export function convertIntRankToStr(rank: number): string {
  rank++;
  switch (rank) {
    case 1: {
      return "A";
    }
    case 11: {
      return "J";
    }
    case 12: {
      return "Q";
    }
    case 13: {
      return "K";
    }
    default: {
      return String(rank);
    }
  }
}

export function cardBEStrToCardMapper(cardStr: string | null): Card | null {
  const rankStr = !!cardStr ? cardStr.slice(1) : null;
  return convertBERankToCard(rankStr);
}

export function convertBERankToCard(char: string | null): Card | null {
  if (char === null) return null;
  const rank = convertRankStrToInt(char);
  const card: Card = { suit: "S", rank: rank, imgSrc: buildImageSrc(rank) };
  return card;
}