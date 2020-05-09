import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {
  Switch,
  Route,
  Link,
  BrowserRouter,
  withRouter,
} from 'react-router-dom';
let admin_api_url = 'https://vps.scratchyone.com/todo/admin';
let todo_http_api_url = 'https://vps.scratchyone.com/todo/todo';
if (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
  admin_api_url = 'http://localhost/admin';
if (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
  todo_http_api_url = 'http://localhost/todo';

function setCookie(name, value, daysToLive) {
  // Encode value in order to escape semicolons, commas, and whitespace
  var cookie = name + '=' + encodeURIComponent(value);

  if (typeof daysToLive === 'number') {
    /* Sets the max-age attribute so that the cookie expires
      after the specified number of days */
    cookie += '; max-age=' + daysToLive * 24 * 60 * 60;

    document.cookie = cookie;
  }
}
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
      <div>
        <div className="bg-gray-400 rounded-b-lg w-full">
          <span className="text-3xl pl-4 pt-2">
            <Link to="/">To-Do Admin Page</Link>
          </span>
          <button
            onClick={() => {
              setCookie('token', null, 10);
            }}
            className="text-1xl pl-4 pt-2"
          >
            Logout
          </button>
        </div>
        <Switch>
          <Route exact path="/">
            <Users />
          </Route>
          <Route path="/user/:username" component={User} />
        </Switch>
      </div>
    );
  }
}

class Users extends React.Component {
  constructor(props) {
    super(props);
    this.passChange = this.passChange.bind(this);
    this.login = this.login.bind(this);
    this.state = {
      users: [],
      token: getCookie('token'),
      valid: null,
      value: '',
    };
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
          } else {
            this.setState({ valid: false });
          }
        });
    } else {
      this.setState({ valid: false });
    }
  }
  passChange(event) {
    this.setState({ value: event.target.value });
  }
  login() {
    fetch(todo_http_api_url + '/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ username: 'admin', password: this.state.value }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (!data.error) {
          this.setState({ token: data.response.token, valid: true });
          setCookie('token', data.response.token, 10);
          this.componentDidMount();
        }
      });
  }
  render() {
    return (
      <div>
        <div className={this.state.valid === true ? '' : 'invisible'}>
          <span className="ml-2 mt-4 text-3xl">Users</span>
          <span>
            {this.state.users.map((x) => (
              <div className="ml-2 lext-md">
                <Link to={'user/' + x}>{x}</Link>
              </div>
            ))}
          </span>
        </div>
        <div className={this.state.valid === false ? '' : 'invisible'}>
          You must be logged in as an admin to view this page<br></br>
          <input
            type="password"
            value={this.state.value}
            onChange={this.passChange}
            className="m-2 border rounded-sm border-black border-5"
          ></input>
          <button
            onClick={this.login}
            className="m-2 border rounded-sm border-black border-5 bg-gray-100"
          >
            Login
          </button>
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
App = withRouter(App);
ReactDOM.render(
  <BrowserRouter basename="/todo_admin">
    <div>
      <App />
    </div>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
