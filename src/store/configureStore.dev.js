import { createStore, compose, applyMiddleware} from 'redux';
import { persistState } from 'redux-devtools';
import rootReducer from '../reducers';
import DevTools from '../containers/DevTools';
import thunkMiddleware from 'redux-thunk'
//import createLogger from 'redux-logger'

const enhancer = compose(
    applyMiddleware(thunkMiddleware)
    ,DevTools.instrument()
    ,persistState(
        window.location.href.match(
            /[?&]debug_session=([^&#]+)\b/
    )
  )
);

export default function configureStore(initialState) {
  //  debugger;
  const store = createStore(rootReducer, initialState, enhancer);

  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers').default)
    );
  }

  return store;
}