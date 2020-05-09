import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
let admin_api_url = 'https://vps.scratchyone.com/admin';
//let todo_http_api_url = 'https://vps.scratchyone.com/admin';
if (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
  admin_api_url = 'http://localhost:98';
/*if (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
  //todo_http_api_url = 'http://localhost:100';*/

function getCookie(name) {
  // Split cookie string and get all individual name=value pairs in an array
  var cookieArr = document.cookie.split(';');

  // Loop through the array elements
  for (var i = 0; i < cookieArr.length; i++) {
    var cookiePair = cookieArr[i].split('=');

    /* Removing whitespace at the beginning of the cookie name
      and compare it with the given string */
    if (name === cookiePair[0].trim()) {
      // Decode the cookie value and return
      return decodeURIComponent(cookiePair[1]);
    }
  }

  // Return null if not found
  return null;
}

class App extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <h1 className="text-3xl pl-4 pt-2 bg-gray-400 rounded-b-lg">
            <Link to="/">To-Do Admin Page</Link>
          </h1>
          <Switch>
            <Route exact path="/">
              <Users />
            </Route>
            <Route path="/user/:username" component={User} />
          </Switch>
        </div>
      </Router>
    );
  }
}

class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = { users: [], token: getCookie('token'), valid: false };
  }
  componentDidMount() {
    if (this.state.token != null) {
      fetch(admin_api_url + '/users', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ token: this.state.token }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (!data.error) {
            this.setState({ users: data.users, valid: true });
          }
        });
    }
  }
  render() {
    return (
      <div>
        {' '}
        <div className={this.state.valid ? '' : 'invisible'}>
          <span className="ml-2 mt-4 text-3xl">Users</span>
          <span>
            {this.state.users.map((x) => (
              <div className="ml-2 lext-md">
                <Link to={'user/' + x}>{x}</Link>
              </div>
            ))}
          </span>
        </div>
        <div className={this.state.valid ? 'invisible' : ''}>
          You must be logged in as an admin to view this page
        </div>
      </div>
    );
  }
}

class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = { todos: [], token: getCookie('token') };
  }
  componentDidMount() {
    if (this.state.token != null) {
      fetch(admin_api_url + '/user', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          token: this.state.token,
          username: this.props.match.params.username,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (!data.error) {
            this.setState({ todos: data.users });
          }
        });
    }
  }
  render() {
    let username = this.props.match.params.username;
    return (
      <div>
        <span className="ml-2 mt-4 text-3xl">{username}</span>
        {this.state.todos.map((x) => (
          <div className={'ml-2 lext-md ' + (x.done ? 'line-through' : '')}>
            {x.todo}
          </div>
        ))}
      </div>
    );
  }
}

ReactDOM.render(
  <div>
    <App></App>
  </div>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
