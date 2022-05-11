import dayjs from 'dayjs';

export enum TimerEvents {
  Expired = 'expired',
  Pause = 'pause',
  Start = 'start',
  Stop = 'stop',
  Tick = 'tick'
}

const clockInterval = 1000;

export class Clock extends EventTarget {
  private intervalId: NodeJS.Timer;
  private _isRunning: boolean;

  constructor() {
    super();

    this.start();
    this._isRunning = false;
  }

  get isRunning(): boolean {
    return this._isRunning;
  }

  private tick() {
    // console.debug(`Clock tick`);
    this.dispatchEvent(new Event(TimerEvents.Tick));
  }

  pause() {
    clearInterval(this.intervalId);
    this._isRunning = false;
    this.dispatchEvent(new Event(TimerEvents.Pause));
  }

  start() {
    if (this.isRunning) {
      this.pause();
    }
    this.intervalId = setInterval(() => this.tick(), clockInterval);
    this._isRunning = true;
    this.dispatchEvent(new Event(TimerEvents.Start));
  }
}

export enum TimerState {
  Running = 'running',
  Paused = 'paused',
  Stopped = 'stopped'
}

interface LedgerEntry {
  event: TimerEvents;
  timestamp: dayjs.Dayjs;
}

type TimerLedger = LedgerEntry[];

export interface TimerParams {
  /**Timer duration in milliseconds */
  duration: number;
  timeRemaining?: number;
  state?: TimerState;
  ledger?: TimerLedger;
}

export function addEvent(event: TimerEvents, ledger: TimerLedger = []): TimerLedger {
  return [
    ...ledger,
    {event, timestamp: dayjs()}
  ];
}

interface TallyAccumulator {
  duration: number;
  lastEntry?: LedgerEntry;
}

export function tally(ledger?: TimerLedger): number {
  if (!ledger) {
    return 0;
  }

  const result = ledger.reduce(tallyEntry, {duration: 0});

  return result.duration;
}

export function addTick(ledger?: TimerLedger): TimerLedger {
  return addEvent(TimerEvents.Tick, ledger);
}

function tallyEntry(acc: TallyAccumulator, entry: LedgerEntry): TallyAccumulator {
  if (!acc.lastEntry) {
  } else if (acc.lastEntry?.event === entry.event || acc.lastEntry?.event === TimerEvents.Stop) {
    // do nothing
    return acc;
  } else if (acc.lastEntry?.event === TimerEvents.Start) {
    acc.duration += entry.timestamp?.diff(acc?.lastEntry?.timestamp);
  }

  acc.lastEntry = entry;

  return acc;
}
export function init(params: TimerParams): TimerParams {
  return {
    ...params,
    timeRemaining: params.timeRemaining ?? params.duration,
    state: params.state ?? TimerState.Paused,
    ledger: params.ledger ?? []
  };
}

export function start(params: TimerParams): TimerParams {
  return {
    ...params,
    timeRemaining: params.timeRemaining ?? params.duration,
    state: TimerState.Running,
    ledger: addEvent(TimerEvents.Start, params.ledger)
  };
}

export function pause(params: TimerParams): TimerParams {
  return {
    ...params,
    state: TimerState.Paused,
    ledger: addEvent(TimerEvents.Pause, params.ledger)
  };
}

export function stop(params: TimerParams): TimerParams {
  return {
    ...params,
    state: TimerState.Stopped,
    timeRemaining: 0,
    ledger: addEvent(TimerEvents.Stop, params.ledger)
  };
}

export function tick(params: TimerParams): TimerParams {
  if (params.state === TimerState.Running) {
    const timeElapsed = tally(addTick(params.ledger));
    params.timeRemaining = params.duration - timeElapsed;

    if (params.timeRemaining <= 0) {
      params = stop(params);
    }
  }

  return params;
}

function zeroPad(seconds: number): string {
  return `0${seconds}`.slice(-2);
}

export function toTimeString(milliseconds: number): string {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  return (minutes > 0 ? `${minutes}:` : '') + zeroPad(seconds);
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
