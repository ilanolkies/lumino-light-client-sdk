import { createStore, applyMiddleware, bindActionCreators } from "redux";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { createEpicMiddleware } from "redux-observable";
import createSagaMiddleware from "redux-saga";

import rootReducer from "./reducers";
import epics from "./epics";
import rootSaga from "./sagas";
import {
  MESSAGE_POLLING_START,
  START_NOTIFICATIONS_POLLING,
} from "./actions/types";
import client from "../apiRest";

let store = null;
const defaultStore = { channelReducer: [] };
const defaultStorage = {
  getLuminoData: () => defaultStore,
  saveLuminoData: () => {},
};
let storage = defaultStorage;

const observableMiddleware = createEpicMiddleware();

const setApiKeyFromStore = store => {
  // We set the api key if teh redux store has one, if not, we fallback to the one from the developer
  const api_key = store.getState().client.apiKey;
  if (api_key) client.defaults.headers = { "x-api-key": api_key };
};

const initStore = async (storageImpl, luminoHandler) => {
  if (storageImpl) storage = storageImpl;
  const dataFromStorage = await storage.getLuminoData();
  let data = {};
  if (dataFromStorage) data = dataFromStorage;
  const lh = {
    sign: luminoHandler.sign,
    offChainSign: luminoHandler.offChainSign,
    storage,
  };
  const sagaMiddleware = createSagaMiddleware();
  store = createStore(
    rootReducer,
    data,
    composeWithDevTools(
      applyMiddleware(
        thunkMiddleware.withExtraArgument(lh),
        observableMiddleware,
        sagaMiddleware
      )
    )
  );
  setApiKeyFromStore(store);
  observableMiddleware.run(epics);
  sagaMiddleware.run(rootSaga);
  if (store.getState().client.apiKey)
    store.dispatch({
      type: MESSAGE_POLLING_START,
    });
  const { notifierApiKey } = store.getState().client;
  const topics = Object.keys(store.getState().notifier).join(",");
  if (notifierApiKey && topics)
    store.dispatch({
      type: START_NOTIFICATIONS_POLLING,
    });

  return store;
};

const bindActions = (actions, dispatch) =>
  bindActionCreators(actions, dispatch);

const getStore = () => store;

const Store = { initStore, getStore, bindActions };

export default Store;
