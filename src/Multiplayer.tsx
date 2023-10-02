import { FC, useCallback } from "react";
import { useSagaFactory } from "react-state-factory";

import { Card, initialMultiState, multiple, multipleReducer } from "./multipleReducer.ts";
import { cardInfo } from "./card.ts";
import { mainSaga } from "./masterSaga.ts";

export const MultiPlayer: FC = () => {

  const [state, put] = useSagaFactory(multipleReducer, initialMultiState, multiple, mainSaga);

  const handlePlay = useCallback((card: Card) => card && put.PLAY_CARD(card), [put]);
  const handleResult = useCallback(() => put.PLAY_RESULT(null), [put]); 
  const handleUndo = useCallback((card:Card) => () => put.UNDO(card), [put]);

  return (
    <main className="bg-black min-h-screen grid place-items-center relative text-green-300">
      <pre className="w-3/4 overflow-hidden">
        <p>The react-state-factory works as expected</p>
        <br />
        <section className="grid grid-cols-4 gap-4 place-items-start">
          <section>
            <p>Center {state.focus}</p>
            {state?.center && cardInfo(state.center)}
          </section>
          {state.flying && (
            <section>
              <p>{state.owners[state.flying.owner].name} is playing:</p>
              {cardInfo(state.flying)}
            </section>
          )}
          {state.center && state.flying && (
            <section className="col-span-2">
              <p>Function = result</p>
              <p>{state.debug} = {state.diff}</p>
            </section>
          )}
        </section>
        <br />
        <section className="grid grid-cols-4 gap-4">
          {state.order.map(ownerId => (
            <section key={ownerId}>
              <span className={ownerId === state.focus ? "bg-green-400 text-black p-1 rounded" : ""}>
                {state.owners[ownerId].name} score: {state.owners[ownerId].score}
              </span>
              <p>- hand: </p>{
                state.owners[ownerId].hand.map(card => (
                  ownerId === state.focus && !state.flying
                    ? <p key={card.id}><button type="button" className="bg-green-400 hover:bg-green-200 text-black p-1 rounded text-center mb-2" onClick={() => handlePlay(card)}>{cardInfo(card)}</button></p>
                    : <p key={card.id}>{cardInfo(card)}</p>
                ))
              }
              {state.flying && ownerId === state.focus && (
                <p className="flex gap-2">
                  <button type="button" className="bg-green-400 hover:bg-green-200 text-black p-1 rounded text-center mt-2" onClick={handleUndo(state.flying)}>undo</button>
                  <button type="button" className="bg-green-400 hover:bg-green-200 text-black p-1 rounded text-center mt-2" onClick={() => handleResult()}>consent</button>
                </p>
              )}
              <p>- deck: </p>{
                state.owners[ownerId].deck.map(card => (
                  <p key={card.id}>{cardInfo(card)}</p>
                ))
              }
            </section>
          ))}
        </section>
        <p className="my-4">Score order:</p>
        <section className="grid grid-cols-4 gap-4">
          {state.order
            .map(ownerId => state.owners[ownerId])
            .sort(({score:a}, {score:b}) => b - a)
            .map(({name, score}) => <p key={name}>{name} : {score}</p>)
          }
        </section>
      </pre>
    </main>
  )
}
