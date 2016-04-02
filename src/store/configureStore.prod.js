
import { createStore, applyMiddleware } from 'redux';
import rootReducer from '../reducers';
import thunkMiddleware from 'redux-thunk';

export default function configureStore(initialState) {
  console.log("PROD");
  return createStore(rootReducer, initialState, applyMiddleware(thunkMiddleware));
}