type Conversion<T> = () => T;

interface ValidationError {
  message: string;
}

interface ValidatedValue<T> {
  value: T;
  errors?: Errors;
}

export interface Errors {
  [key: string]: string;
}

type ErrorList = Array<string>;

export function call<T>(errors: Errors, key: string, f: Conversion<T>): ValidatedValue<T> {
  let value: T;

  try {
    value = f();
    delete errors[key];
  } catch (err) {
    errors[key] = err.message;
  }

  return {errors, value};
}

export function getErrorList(errors: Errors) {
  return Object.keys(errors).map(key => errors[key]).filter(msg => msg);
}

export function errorClass(err: any, className: string, alternative: string = '') {
  return err ? className : alternative
}
