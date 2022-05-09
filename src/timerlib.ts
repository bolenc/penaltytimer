export enum TimerEvents {
  Tick = 'tick',
  Expired = 'expired'
}

const clockInterval = 1000;

export class Clock extends EventTarget {
  private intervalId: NodeJS.Timer;
  private _isRunning: boolean;

  constructor() {
    super();

    this.start();
    this._isRunning = true;
  }

  get isRunning(): boolean {
    return this._isRunning;
  }

  private tick() {
    // console.debug(`Clock tick`);
    this.dispatchEvent(new Event(TimerEvents.Tick));
  }

  stop() {
    clearInterval(this.intervalId);
    this._isRunning = false;
  }

  start() {
    if (this.isRunning) {
      this.stop();
    }
    this.intervalId = setInterval(() => this.tick(), clockInterval);
    this._isRunning = true;
  }
}

export enum TimerState {
  Running,
  Paused,
  Stopped
}

export interface TimerParams {
  /**Timer duration in milliseconds */
  duration: number;
  timeRemaining?: number;
  state?: TimerState;
}

export function init(params: TimerParams): TimerParams {
  return {
    ...params,
    timeRemaining: params.timeRemaining ?? params.duration,
    state: params.state ?? TimerState.Paused
  };
}
export function start(params: TimerParams): TimerParams {
  return {
    ...params,
    timeRemaining: params.timeRemaining ?? params.duration,
    state: TimerState.Running
  };
}

export function pause(params: TimerParams): TimerParams {
  return {
    ...params,
    state: TimerState.Paused
  };
}

export function stop(params: TimerParams): TimerParams {
  return {
    ...params,
    state: TimerState.Stopped,
    timeRemaining: 0
  };
}

export function tick(params: TimerParams): TimerParams {
  if (params.state === TimerState.Running) {
    params.timeRemaining -= 1000;

    if (params.timeRemaining <= 0) {
      params.timeRemaining = 0;
      params.state = TimerState.Stopped;
    }
  }

  return params;
}

export function toTimeString(milliseconds: number): string {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  return (minutes > 0 ? `${minutes}:` : '') + `${seconds}`;
}

const timeRE = /^(?:(\d+)\:)?(\d+)$/;

export function toMilliseconds(time: string): number {
  const match = time.match(timeRE);
  if (!match) {
    throw new Error(`Invalid time: '${time}'`);
  }

  const [matched, minutes, seconds] = match;

  return ((parseInt(minutes??'0') * 60) + parseInt(seconds)) * 1000;
}
