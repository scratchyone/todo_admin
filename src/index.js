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
let api_url = 'https://vps.scratchyone.com/todo';
if (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
  api_url = 'http://localhost:99';

function setCookie(name, value, daysToLive) {
  // Encode value in order to escape semicolons, commas, and whitespace
  var cookie = name + '=' + encodeURIComponent(value);

  document.cookie = cookie;
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
    this.messageChange = this.messageChange.bind(this);
    this.blockChange = this.blockChange.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.state = {
      users: [],
      token: getCookie('token'),
      valid: null,
      value: '',
      message: '',
      block: false,
    };
  }
  componentDidMount() {
    if (this.state.token != null) {
      fetch(api_url + '/admin/users', {
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
  messageChange(event) {
    this.setState({ message: event.target.value });
  }
  blockChange(event) {
    this.setState({ block: event.target.checked });
  }
  addMessage() {
    fetch(api_url + '/message/add_message', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        token: this.state.token,
        message: this.state.message,
        block: this.state.block,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });
  }
  login() {
    fetch(api_url + '/todo/login', {
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
          <input
            type="text"
            value={this.state.message}
            onChange={this.messageChange}
            className="m-2 border rounded-sm border-black border-5"
          ></input>
          <input type="checkbox" onChange={this.blockChange}></input>
          <button
            onClick={this.addMessage}
            className="m-2 border rounded-sm border-black border-5 bg-gray-100"
          >
            Send
          </button>
          <br></br>
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
      fetch(api_url + '/admin/user', {
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
