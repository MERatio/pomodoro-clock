import React from 'react';
import ReactDOM from 'react-dom';
import './css/style.css';

function LengthControl(props) {
  return (
    <div className="length-control">
      <h2 id={props.labelID}>{props.label}</h2>
      <div className="controls">
        <button id={props.decrementID} value="-" onClick={props.onClick}><i className="fas fa-minus" /></button>
        <p id={props.lengthID}>{props.length}</p>
        <button id={props.incrementID} value="+" onClick={props.onClick}><i className="fas fa-plus" /></button>
      </div>
    </div>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      breakLength: 5,
      sessionLength: 25,
      timeLeft: 1500, // time left in seconds
      isRunning: false,
      timerType: 'Session',
      timeIntervalID: '' // for clearInterval
    };
    this.setLengthControl = this.setLengthControl.bind(this);
    this.handleBreakLength = this.handleBreakLength.bind(this);
    this.handleSessionLength = this.handleSessionLength.bind(this);
    this.formatTime = this.formatTime.bind(this);
    this.handleTimeControl = this.handleTimeControl.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.decrementTimeLeft = this.decrementTimeLeft.bind(this);
    this.timeListener = this.timeListener.bind(this);
    this.playAudio = this.playAudio.bind(this);
    this.switchTimer = this.switchTimer.bind(this);
    this.clearTimeInterval = this.clearTimeInterval.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.stopAudio= this.stopAudio.bind(this);
    this.init = this.init.bind(this);
  }

  setLengthControl(lengthType, sign, currentLength) {
    if (!this.state.isRunning) { // if the timer is paused
      if (lengthType === 'sessionLength') {
        if (sign === '-' && currentLength > 1) {
          this.setState({
            [lengthType]: currentLength - 1,
            timeLeft: (currentLength * 60) - 60
          });
        } else if (sign === '+' && currentLength < 60) {
          this.setState({
            [lengthType]: currentLength + 1,
            timeLeft: (currentLength * 60) + 60
          });
        }
      } else {
        if (sign === '-' && currentLength > 1) {
          this.setState({[lengthType]: currentLength - 1});
        } else if (sign === '+' && currentLength < 60) {
          this.setState({[lengthType]: currentLength + 1});
        }
      }
    }
  }

  handleBreakLength(e) {
    this.setLengthControl('breakLength', e.currentTarget.value, this.state.breakLength);
  }

  handleSessionLength(e) {
    this.setLengthControl('sessionLength', e.currentTarget.value, this.state.sessionLength);
  }

  // convert timeLeft(seconds) in minutes and seconds format
  formatTime() {
    let { timeLeft } = this.state;
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${seconds}`;
  }

  // handle play and pause
  handleTimeControl() {
    let { isRunning} = this.state;
    if (isRunning) {
      this.setState({isRunning: !isRunning});
      this.handlePause();
    } else {
      this.setState({isRunning: !isRunning});
      this.handlePlay();
    }
  }

  handlePlay() {
    this.setState({
      timeIntervalID: setInterval(() => {
        this.decrementTimeLeft();
        this.timeListener();
      }, 1000)
    });
  }

  decrementTimeLeft() {
    this.setState({timeLeft: this.state.timeLeft - 1});
  }

  timeListener() {
    let { timerType, timeLeft, breakLength, sessionLength } = this.state;
    this.playAudio(timeLeft);
    if (timeLeft < 0) {
      if (timerType === 'Session') {
        this.clearTimeInterval();
        this.switchTimer(breakLength * 60, 'Break');
        this.handlePlay();
      } else {
        this.clearTimeInterval();
        this.switchTimer(sessionLength * 60, 'Session');
        this.handlePlay();
      }
    }
  }

  playAudio(time) {
    if (time === 0) {
      document.getElementById('beep').play();
    } 
  }

  switchTimer(time, type) {
    this.setState({
      timeLeft: time,
      timerType: type
    });
  }

  clearTimeInterval() {
    clearInterval(this.state.timeIntervalID);
  }

  handlePause() {
    this.clearTimeInterval();
    this.stopAudio();
  }

  stopAudio() {
    let audio = document.getElementById('beep');
    audio.pause();
    audio.currentTime = 0;
  }

  // initialize, reset
  init() {
    this.setState({
      breakLength: 5,
      sessionLength: 25,
      timeLeft: 1500,
      isRunning: false,
      timerType: 'Session',
      timeIntervalID: ''
    });
    this.handlePause();
  }

  render() {
    let classes = this.state.isRunning 
      ? ['fa fa-pause']
      : ['fa fa-play'];

    return (
      <main>
        <div id="pomodoro-clock">
          <header><h1>Pomodoro Clock</h1></header>
          <div id="timer">
            <div id="timer-container">
              <h2 id="timer-label">{this.state.timerType}</h2>
              <p id="time-left">{this.formatTime()}</p>
            </div>
          </div>
          <div id="length-controls">
            <LengthControl 
              labelID={'break-label'}
              label={'Break Length'}
              decrementID={'break-decrement'}
              incrementID={'break-increment'}
              lengthID={'break-length'}
              length={this.state.breakLength}
              onClick={this.handleBreakLength}
            />
            <LengthControl 
              labelID={'session-label'}
              label={'Session Length'}
              decrementID={'session-decrement'}
              incrementID={'session-increment'}
              lengthID={'session-length'}
              length={this.state.sessionLength}
              onClick={this.handleSessionLength}
            />
          </div>
          <div id="time-control">
            <button id="start_stop" onClick={this.handleTimeControl}>
              <i className={classes[0]} />
            </button>
            <button id="reset" onClick={this.init}><i className="fas fa-sync-alt" /></button>
          </div>
        </div>
        <audio src="https://goo.gl/65cBl1" id="beep" preload="auto" />
      </main>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));