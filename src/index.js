import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
//import { createStore } from 'redux'
//import svgApp from './reducers'
import App from './components/App'
import configureStore from './store/configureStore';

//let store = createStore(svgApp);
const store = configureStore();

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)