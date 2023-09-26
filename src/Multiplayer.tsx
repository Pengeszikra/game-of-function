import { FC, useCallback, useEffect, useLayoutEffect } from "react";
import { useStateFactory } from "react-state-factory";

import { Card, initialMultiState, multiple, multipleReducer } from "./multipleReducer.ts";
import { createList } from "./arrayUtils.ts";
import { cardInfo, rndCard } from "./card.ts";

export const MultiPlayer: FC = () => {

  const [state, put] = useStateFactory(multipleReducer, initialMultiState, multiple);

  useLayoutEffect(() => {
    put.RESET(Date.now());
    ["A-bot", "B-bot", "C-bot", "D-bot"].map(bot =>
      put.SIT_DOWN({
        id: bot,
        name: bot,
        score: 0,
        hand: createList(3, () => rndCard(bot)),
        deck: createList(5, () => rndCard(bot)),
      })
    );
  }, [put]);

  const handlePlay = useCallback((card: Card) => card && put.PLAY_CARD(card), [put]);

  useEffect(() => {
    if (state.order.length < 1 || state.center) return;
    put.FOCUS(state.order[0]);
    handlePlay(state.owners[state.order[0]].hand[0]);
    put.PLAY_RESULT(null);
    put.FOCUS(state.order[1]);
  }, [state, put, handlePlay])

  function handleResult() {
    put.PLAY_RESULT(null);
  }

  const handleUndo = (card:Card) => () => put.UNDO(card);

  return (
    <main className="bg-black min-h-screen grid place-items-center relative text-green-300">
      <pre className="w-3/4 overflow-hidden">
        <p>The react-state-factory works as expected</p>
        <section className="grid grid-flow-col gap-2 my-2 justify-start">
          {/* <button type="button" disabled={!!state.flying} className="disabled:bg-green-900 bg-green-400 text-black p-2 rounded w-20 select-none hover:bg-green-200 text-center" onClick={handlePlay}>action</button> */}
          {/* <button type="button" disabled={!state.flying} className="disabled:bg-green-900 bg-green-400 text-black p-2 rounded w-20 select-none hover:bg-green-200 text-center" onClick={handleResult}>consent</button> */}
        </section>
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
