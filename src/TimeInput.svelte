<script lang="ts">
  import * as log from './log';
  import * as Validate from './validate';
  import { toMilliseconds } from './timerlib';

  export let errors: Validate.Errors = {};
  export let duration: number;
  export let id: string;

  let durationText: string;

  $: {
    duration = getDuration(durationText);
  };

  function getDuration(text: string) {
    if (!text) {
      return 0;
    }

    let value: number;

    ({value, errors} = Validate.call(errors, 'duration', () => toMilliseconds(text)));
    
    log.debug(durationText, duration, errors.duration);

    return value;
  }
</script>

<input required type="text" id={id} class={Validate.errorClass(errors.duration, 'invalid', 'valid')} pattern="[0-9]*:?[0-9]+" name="duration" bind:value={durationText}>

<style>
  input.invalid {
    background-color: pink;
  }

  input {
    max-width: 5em;
  }
</style>
