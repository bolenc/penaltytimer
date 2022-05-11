export enum LogLevel {
  Debug,
  Info,
  Warning,
  Error,
  None
}

let currentLevel: LogLevel = LogLevel.Info;

export function setLevel(level: LogLevel) {
  currentLevel = level;
}

export function log(...args) {
  info(...args);
}

export function debug(...args) {
  logIf(LogLevel.Debug, console.debug, args);
}

export function info(...args) {
  logIf(LogLevel.Info, console.info, args);
}

export function warn(...args) {
  logIf(LogLevel.Warning, console.warn, args);
}

export function error(...args) {
  logIf(LogLevel.Error, console.error, args);
}

type LogFunc = (...args:any[]) => void;

function logIf(level: LogLevel, f: LogFunc, args: any[]) {
  if (isActive(level)) {
    f(...args);
  }
}

function isActive(level: LogLevel): boolean {
  return level >= currentLevel;
}
