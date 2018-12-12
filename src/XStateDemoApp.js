import React, { Component } from 'react'
import { Machine } from 'xstate'
import './style.css';

const GITHUB_URL = `https://api.github.com/users`;

const demoMachine = Machine({
  initial: 'S_IDLE',
  states: {
    S_IDLE: {
      on: { A_START: 'S_LOADING' }
    },
    S_LOADING: {
      on: {
        A_RESOLVE: 'S_DONE',
        A_REJECT: 'S_ERROR',
        A_NOT_FOUND: 'S_TRY_AGAIN'
      }
    },
    S_DONE: {
      on: { A_START: 'S_LOADING'}
    },
    S_ERROR: {
      on: { A_START: 'S_LOADING'}
    },
    S_TRY_AGAIN: {
      on: { A_START: 'S_LOADING'}
    }
  }
});

export class XStateDemoApp extends Component {
  state = {
    githubData: null,
    machineState: demoMachine.initial
  };

  searchGithub = async () => {
    try {
      const url = `${GITHUB_URL}/${this.txtUserNameRef.value}`;

      const githubData = await fetch(url).then(response => response.json());

      if(githubData.message === 'Not Found') {
        this.machineTransition('A_NOT_FOUND')
      } else {
        this.setState(
            ({ githubData }),
            () => this.machineTransition('A_RESOLVE')
        );
      }

    } catch (error) {
      this.machineTransition('A_REJECT')
    }
  };


  machineTransition = action => {
    const machineState = demoMachine.transition(this.state.machineState, action).value;

    if( machineState === 'S_LOADING' ) this.searchGithub();

    this.setState({ machineState } );
  };

  render() {
    const { githubData, machineState } = this.state;
    console.log('machineState is: ', machineState);

    const buttonText = {
      S_IDLE: 'Fetch Github',
      S_LOADING: 'Loading...',
      S_DONE: 'Success! Fetch Again?',
      S_TRY_AGAIN: 'Github user not found. Retry?',
      S_ERROR: 'Github fail. Retry?',
    }[machineState];

    return (
      <div className='wrapper'>

        <div className='wrapperInput'>
          <h1>Search for github user:</h1>
          <input
              type="text"
              defaultValue='user928'
              ref={(el) => this.txtUserNameRef=el}
          />
          <button
              onClick={() => this.machineTransition('A_START')}
              disabled={machineState === 'S_LOADING'}
          >
            {buttonText}
          </button>
        </div>

        {machineState === 'S_LOADING' && <h2>Loading ...</h2>}

        {machineState === 'S_DONE' &&
          <div>
            <img src={githubData['avatar_url']} alt="avatar" />
            <p><span>Name: </span>{githubData.name}</p>
            <p><span>Username: </span>{githubData.login}</p>
            <p><span>From: </span>{githubData.location}</p>
          </div>
        }

        {machineState === 'S_TRY_AGAIN' && <h2 className='error'>Not Found, please try again with different user !!!</h2>}

        {machineState === 'S_ERROR' && <h2 className='error'>Error !!! Houston we have a problem</h2>}
      </div>
    )
  }
}

