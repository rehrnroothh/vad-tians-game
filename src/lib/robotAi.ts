import { Card, GameState, canPlayCard, getPlaySource } from './gameEngine';

interface SwapMove {
  type: 'swap';
  handCardId: string;
  faceUpCardId: string;
}

interface ConfirmMove {
  type: 'confirm';
}

export type RobotSwapDecision = SwapMove | ConfirmMove;

export type RobotPlayDecision =
  | { type: 'faceDown'; cardId: string }
  | { type: 'play'; cardIds: string[] }
  | { type: 'drawAndTry' }
  | { type: 'pickup' };

const endgameScore = (card: Card): number => {
  if (card.value === 2) return 200;
  if (card.value === 10) return 190;
  return card.value;
};

const wouldClearByFourOfAKind = (value: number, discardPile: Card[]): boolean => {
  if (discardPile.length < 3) return false;
  const topThree = discardPile.slice(-3);
  return topThree.every((card) => card.value === value);
};

export const chooseRobotSwapDecision = (state: GameState, playerIndex: number): RobotSwapDecision => {
  const player = state.players[playerIndex];
  const pool = [...player.hand, ...player.faceUp];

  const desiredFaceUpIds = new Set(
    [...pool]
      .sort((a, b) => endgameScore(b) - endgameScore(a))
      .slice(0, player.faceUp.length)
      .map((card) => card.id),
  );

  const faceUpToReplace = player.faceUp
    .filter((card) => !desiredFaceUpIds.has(card.id))
    .sort((a, b) => endgameScore(a) - endgameScore(b))[0];

  const handToPromote = player.hand
    .filter((card) => desiredFaceUpIds.has(card.id))
    .sort((a, b) => endgameScore(b) - endgameScore(a))[0];

  if (!faceUpToReplace || !handToPromote) {
    return { type: 'confirm' };
  }

  return {
    type: 'swap',
    handCardId: handToPromote.id,
    faceUpCardId: faceUpToReplace.id,
  };
};

export const chooseRobotPlayDecision = (state: GameState, playerIndex: number): RobotPlayDecision => {
  const player = state.players[playerIndex];
  const source = getPlaySource(player);

  if (source === 'faceDown') {
    const blindCard = player.faceDown[0];
    return blindCard ? { type: 'faceDown', cardId: blindCard.id } : { type: 'pickup' };
  }

  const availableCards = source === 'hand' ? player.hand : player.faceUp;
  const playableCards = availableCards.filter((card) => canPlayCard(card, state.discardPile));

  if (playableCards.length === 0) {
    const canDrawAndTry =
      state.phase === 'play' &&
      state.discardPile.length > 0 &&
      state.drawPile.length > 0;
    return canDrawAndTry ? { type: 'drawAndTry' } : { type: 'pickup' };
  }

  const groupedByValue = new Map<number, Card[]>();
  for (const card of playableCards) {
    const group = groupedByValue.get(card.value) ?? [];
    group.push(card);
    groupedByValue.set(card.value, group);
  }

  const values = [...groupedByValue.keys()];

  const tenValue = values.find((value) => value === 10);
  if (tenValue) {
    return { type: 'play', cardIds: groupedByValue.get(tenValue)!.map((card) => card.id) };
  }

  const fourKindValue = values.find((value) => wouldClearByFourOfAKind(value, state.discardPile));
  if (fourKindValue !== undefined) {
    return { type: 'play', cardIds: groupedByValue.get(fourKindValue)!.map((card) => card.id) };
  }

  const nonSpecialValues = values.filter((value) => value !== 2 && value !== 10).sort((a, b) => a - b);
  if (nonSpecialValues.length > 0) {
    return {
      type: 'play',
      cardIds: groupedByValue.get(nonSpecialValues[0])!.map((card) => card.id),
    };
  }

  const twoValue = values.find((value) => value === 2);
  if (twoValue) {
    return { type: 'play', cardIds: groupedByValue.get(twoValue)!.map((card) => card.id) };
  }

  const fallbackValue = values.sort((a, b) => a - b)[0];
  return { type: 'play', cardIds: groupedByValue.get(fallbackValue)!.map((card) => card.id) };
};
