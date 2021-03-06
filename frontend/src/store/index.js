import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import commentReducer from "./comment.js";
import sessionReducer from "./session.js"
import cafeReducer from "./cafes.js";

const rootReducer = combineReducers({
  // add reducer functions here
  session:sessionReducer,
  cafe:cafeReducer,
  comment:commentReducer,
  //is this key in correctly?  check redux tool: check inspector->state 
});

let enhancer;

if (process.env.NODE_ENV === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = require("redux-logger").default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
