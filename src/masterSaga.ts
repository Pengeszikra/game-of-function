import { typedPutActionMapFactory } from "react-state-factory";
import { select, delay } from "redux-saga/effects";

import { MultipleState, multiple } from "./multipleReducer.ts";
import { createList } from "./arrayUtils.ts";
import { rndCard } from "./card.ts";

export function * mainSaga() {
  const put = typedPutActionMapFactory(multiple);

  console.log('- main saga started -');

  yield put.RESET(Date.now());

  const botList = ["A-bot", "B-bot", "C-bot", "D-bot"];

  for (const bot of botList) {
    yield put.SIT_DOWN({
      id: bot,
      name: bot,
      score: 0,
      hand: createList(3, () => rndCard(bot)),
      deck: createList(5, () => rndCard(bot)),
    })
  }

  yield delay(1);
  const {order, owners}:MultipleState = yield select();

  yield console.log(order, owners);
  const [starerId, nextId] = order;
  const [card] = owners[starerId].hand;
  yield put.FOCUS(starerId);
  yield put.PLAY_CARD(card);
  yield put.PLAY_RESULT(null);
  yield put.DRAW(starerId);
  yield put.FOCUS(nextId);
}