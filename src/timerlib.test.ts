import dayjs from 'dayjs';
import * as timerlib from './timerlib';

describe('timerlib', () => {
  describe('init', () => {
    it('sets initial values', async () => {
      const result = timerlib.init({duration:0});
      expect(result.duration).toBe(0);
      expect(result.state).toBe(timerlib.TimerState.Paused);
      expect(result.timeRemaining).toBe(result.duration);
    });
  });

  describe('start', () => {
    it('sets state to running', async () => {
      const result = timerlib.start({duration:0});
      expect(result.state).toBe(timerlib.TimerState.Running);
    });
  });

  describe('pause', () => {
    it('sets state to paused', async () => {
      const result = timerlib.pause({duration:0});
      expect(result.state).toBe(timerlib.TimerState.Paused);
    });
  });

  describe('stop', () => {
    it('sets state to stopped', async () => {
      const result = timerlib.stop({duration:0});
      expect(result.state).toBe(timerlib.TimerState.Stopped);
    });
  });

  describe('tally', () => {
    it('returns 0 for an empty ledger', async () => {
      const ledger = []
      const result = timerlib.tally(ledger);
      expect(result).toBe(0);
    });
    it('returns the time between a start and stop', async () => {
      const now = dayjs();
      const ledger = [
        {event: timerlib.TimerEvents.Start, timestamp: now.subtract(1, 'second')},
        {event: timerlib.TimerEvents.Stop, timestamp: now}
      ]
      const result = timerlib.tally(ledger);
      expect(result).toBe(1000);
    });
    it('returns the time between a start and pause', async () => {
      const now = dayjs();
      const ledger = [
        {event: timerlib.TimerEvents.Start, timestamp: now.subtract(1, 'second')},
        {event: timerlib.TimerEvents.Pause, timestamp: now}
      ]
      const result = timerlib.tally(ledger);
      expect(result).toBe(1000);
    });
    it('returns the time between multiple start-pause sequences', async () => {
      const now = dayjs();
      const ledger = [
        {event: timerlib.TimerEvents.Start, timestamp: now.subtract(4, 'seconds')},
        {event: timerlib.TimerEvents.Pause, timestamp: now.subtract(3, 'seconds')},
        {event: timerlib.TimerEvents.Start, timestamp: now.subtract(1, 'seconds')},
        {event: timerlib.TimerEvents.Pause, timestamp: now},
      ]
      const result = timerlib.tally(ledger);
      expect(result).toBe(2000);
    });
    it('disregards time after a stop', async () => {
      const now = dayjs();
      const ledger = [
        {event: timerlib.TimerEvents.Start, timestamp: now.subtract(4, 'seconds')},
        {event: timerlib.TimerEvents.Stop, timestamp: now.subtract(3, 'seconds')},
        {event: timerlib.TimerEvents.Start, timestamp: now.subtract(1, 'seconds')},
        {event: timerlib.TimerEvents.Pause, timestamp: now},
      ]
      const result = timerlib.tally(ledger);
      expect(result).toBe(1000);
    });
  });

  describe('tick', () => {
    it('decrements the timer', async () => {
      const params = timerlib.init({
        duration:30000,
        state: timerlib.TimerState.Running,
        ledger: [
          {event: timerlib.TimerEvents.Start, timestamp: dayjs().subtract(1, 'second')}
        ]
      });
      const result = timerlib.tick(params);
      expect(result.timeRemaining).toBeLessThanOrEqual(29000);
      expect(result.timeRemaining).toBeGreaterThan(28000);
      expect(result.state).toBe(timerlib.TimerState.Running)
    });

    it('stops when time runs out', async () => {
      const params = timerlib.init({
        duration:1000,
        state: timerlib.TimerState.Running,
        ledger: [
          {event: timerlib.TimerEvents.Start, timestamp: dayjs().subtract(1001, 'milliseconds')}
        ]
      });
      const result = timerlib.tick(params);
      expect(result.timeRemaining).toBe(0);
      expect(result.state).toBe(timerlib.TimerState.Stopped)
    });
  });

  describe('toTimeString', () => {
    it('represents seconds', async () => {
      const result = timerlib.toTimeString(29000);
      expect(result).toBe('29');
    });
    it('represents minutes and seconds', async () => {
      const result = timerlib.toTimeString(89000);
      expect(result).toBe('1:29');
    });
    it('zero pads seconds', async () => {
      const result = timerlib.toTimeString(60000);
      expect(result).toBe('1:00');
    });
  });

  describe('toMilliseconds', () => {
    it('parses seconds', async () => {
      const result = timerlib.toMilliseconds('29');
      expect(result).toBe(29000);
    });
    it('parses minutes and seconds', async () => {
      const result = timerlib.toMilliseconds('1:29');
      expect(result).toBe(89000);
    });
  });
});
