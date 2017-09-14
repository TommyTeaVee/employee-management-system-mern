
import React from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import { Link, Route, Switch } from 'react-router-dom';
import classnames from 'classnames';
import qs from 'query-string';
import Particles from 'react-particles-js';
import { config } from "./ParticleConfig";


import SignUpForm from '../components/login/forms/SignUpForm.jsx';

import './Login.css';

class SignUpPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={classnames("wrapper blend-gradient")}>
        {/* <Particles params={config} /> */}
        <div className="login-form-wrapper">
            <SignUpForm history={this.props.history}/>
        </div>
      </div>
    );
  }
}

export default SignUpPage;
