import { Reducer } from "react";
import { Labels } from "react-state-factory";
import { nextOf } from "./arrayUtils";

export interface CardDatas {
  id: string;
  skill: string;
  value: number;
}
export interface Card extends CardDatas {
  owner: string;
}

export const debugFunction = (card: Card, played: Card) => `(a = ${card.value}, b = ${played.value}) => ${played.skill};`;
export const diffByCard = (card: Card, played: Card) => new Function(`return (a, b) => ${played.skill};`)()(card.value, played.value);

export interface Owner {
  id: string;
  name: string;
  score: number;
  hand: Card[];
  deck: Card[];
}

type OwnerId = string;

export interface MultipleState {
  timer: number;
  owners: Record<OwnerId, Owner>;
  order: OwnerId[];
  tower: Card[];
  focus: OwnerId;
  center?: Card;
  flying?: Card;
  debug: string;
  diff?: number;
  question: string;
  answer: string;
}

export const initialMultiState: MultipleState = {
  timer: 0,
  owners: {},
  order: [],
  tower: [],
  focus: "",
  debug: "",
  question: "",
  answer: "",
}

export type MultipleActionsMap =
  | { type: "RESET", payload: number }
  | { type: "SIT_DOWN", payload: Owner }
  | { type: "COLLECT", payload: Card }
  | { type: "DRAW", payload: OwnerId }
  | { type: "PLAY_CARD", payload: Card }
  | { type: "PLAY_RESULT", payload: null }
  | { type: "WRITE_HISTORY", payload: number }
  | { type: "SET_PERCENT", payload: number }
  | { type: "SET_PRE_PERCENT", payload: number }
  | { type: "START_BATTLE", payload: number }
  | { type: "FOCUS", payload: OwnerId }
  | { type: "UNDO", payload: Card }

export const multiple:Labels<MultipleActionsMap> = {
  RESET: "RESET",
  SIT_DOWN: "SIT_DOWN",
  COLLECT: "COLLECT",
  DRAW: "DRAW",
  PLAY_CARD: "PLAY_CARD",
  PLAY_RESULT: "PLAY_RESULT",
  WRITE_HISTORY: "WRITE_HISTORY",
  SET_PERCENT: "SET_PERCENT",
  SET_PRE_PERCENT: "SET_PRE_PERCENT",
  START_BATTLE: "START_BATTLE",
  FOCUS: "FOCUS",
  UNDO: "UNDO"
}

export const multipleReducer: Reducer<MultipleState, MultipleActionsMap> = (
  state,
  {type, payload}
) => {
  switch (type) {
    case multiple.RESET: return {
      ...state,
      ...initialMultiState,
      timer: payload
    };
    case multiple.SIT_DOWN: return {
      ...state,
      owners: {...state.owners, [payload.id]:payload},
      order: [...state.order, payload.id],
      focus: payload.id
    };
    case multiple.COLLECT: {
      if (!(payload.owner in state.owners)) return state;
      return {...state, owners: {...state.owners, [payload.owner]: {
          ...state.owners[payload.owner],
          deck: [...state.owners[payload.owner].deck, payload]
        }}
      }
    }
    case multiple.DRAW: {
      if (!(payload in state.owners)) return state;
      const [card, ...left] = state.owners[payload].deck;
      return {...state, owners: {...state.owners, [payload]: {
          ...state.owners[payload],
          deck: left,
          hand: [...state.owners[payload].hand, card]
        }}
      }
    }
    case multiple.PLAY_CARD: {
      if (!(payload.owner in state.owners) || state.flying) return state;
      const hand = state.owners[payload.owner].hand;
      if (hand.length < 1) return state;
      const left = hand.filter(({id}) => id !== payload.id);
      if (hand.length > 0 && left.length === hand.length) return state;
      const flying = state.center ? payload : state.flying;
      const diff = state.center && flying
        ? diffByCard(state.center, flying)
        : state.diff
        ;
      const debug = state.center && flying
        ? debugFunction(state.center, flying)
        : ""
        ;
      return {
        ...state,
        center: state.center ? state.center : payload,
        flying,
        diff,
        debug,
        owners: {
          ...state.owners,
          [payload.owner]: {
            ...state.owners[payload.owner],
            hand: left
          }
        }
      };
    }
    case multiple.UNDO: {
      if (!(payload.owner in state.owners) || !state.flying) return state;
      if (payload.id !== state.flying?.id) return state;
      return {
        ...state,
        flying: undefined,
        diff: undefined,
        owners: {
          ...state.owners,
          [payload.owner]: {
            ...state.owners[payload.owner],
            hand: [...state.owners[payload.owner].hand, payload]
          }
        }
      };
    }
    case multiple.PLAY_RESULT: {
      if (!state.flying || state.diff === undefined) return state;
      const {score, hand, deck, ...current} = state.owners[state.flying.owner];
      const needToFill = hand.length < 3 && deck.length;
      return {
        ...state,
        owners: {
          ...state.owners,
          [state.flying.owner]: {
            ...current,
            hand: needToFill ? [...hand, deck[0]] : hand,
            deck: needToFill ? deck.slice(1) : deck,
            score: score + state.diff
          }
        },
        center: state.flying,
        flying: undefined,
        diff: undefined,
        debug: "",
        focus: nextOf(state.order, state.focus),
      }
    }
    case multiple.FOCUS: return {...state, focus: payload};
    default: return state;
  }
}
