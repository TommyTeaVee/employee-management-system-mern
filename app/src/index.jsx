import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router, Route, Redirect ,Switch} from 'react-router-dom';
import { Provider } from 'react-redux'

import App from './containers/App.jsx'
import reduxStore from './store/reduxStore';
import LoginPage from "./components/login/LoginPage.jsx";


const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb) {
    this.isAuthenticated = true
    setTimeout(cb, 100) // fake async
  },
  signout(cb) {
    this.isAuthenticated = false
    setTimeout(cb, 100)
  }
}

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    fakeAuth.isAuthenticated ? (
      <Component {...props} />
    ) : (
        <Redirect to={{
          pathname: '/login',
          state: { from: props.location }
        }} />
      )
  )} />
)
render(
  <Provider store={reduxStore}>
    <Router>
      <Switch>
        {/* <PrivateRoute path="/" component={App} /> */}
        <Redirect exact from="/" to="/login" /> 
        <Route path="/login" component={LoginPage} />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('contents')
)
if (module.hot) {
  module.hot.accept();
}
