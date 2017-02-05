import { Router, Route, browserHistory } from "react-router";
import React, { Component } from "react";
import injectTapEventPlugin from "react-tap-event-plugin";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { Provider } from "react-redux";
import { routerMiddleware } from "react-router-redux";

import { compose, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import Home from "./Home.js";
import Entry from "./Entry.js";
import EditEntry from "./EditEntry.js";
import "./App.css";
import reducer from "./reducer";
import JournalDrawer from "./JournalDrawer";
import Login from "./Login";
import Auth from "./Auth";
import { push } from "react-router-redux";
import { downloadJournal } from "./actionCreators";
import { persistStore, autoRehydrate } from "redux-persist";

const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  // TODO: Consider raven-for-redux middleware
  compose(
    applyMiddleware(thunk, routerMiddleware(browserHistory)),
    autoRehydrate()
  )
);

persistStore(store, { whitelist: [ "dropbox" ] }, () => {
  // FIXME: Users should be able to arrive at pages other than / without being redirected.
  store.dispatch(downloadJournal());
  store.dispatch(push("/"));
});
function requireAuth(nextState, replace) {
  const state = store.getState();
  if (!state.dropbox.authToken) {
    // TODO: Stash redirect URL
    replace({ pathname: "/login/" });
  }
}

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const Routes = props => (
  <Router history={browserHistory}>
    <Route path="/" component={Home} onEnter={requireAuth} />
    <Route path="/entry/:id" component={Entry} onEnter={requireAuth} />
    <Route path="/entry/:id/edit" component={EditEntry} onEnter={requireAuth} />
    <Route path="/login/" component={Login} />
    <Route path="/auth/" component={Auth} />
  </Router>
);

class WrappedApp extends Component {
  render() {
    return (
      <Provider store={store}>
        <MuiThemeProvider>
          <div>
            <JournalDrawer />
            <Routes />
          </div>
        </MuiThemeProvider>
      </Provider>
    );
  }
}

export default WrappedApp;
