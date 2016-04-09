import { h, Component } from 'preact';
import { Router } from 'preact-router';
import { bind } from 'decko';

import Header from './header';
import Home from './home';
import Profile from './profile';


export default class App extends Component {
	/** Gets fired when the route changes.
	 *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */
	// @bind
  constructor(props) {
    super(props);
    this.handleRoute = this.handleRoute.bind(this);
  }

	handleRoute(e) {
		this.currentUrl = e.url;
	}

	render() {
		return (
			<div id="app">
				<Header />
				<Router onChange={this.handleRoute}>
					<Home path="/" />
					<Profile path="/profile/" user="me" />
					<Profile path="/profile/:user" />
				</Router>
			</div>
		);
	}
}
