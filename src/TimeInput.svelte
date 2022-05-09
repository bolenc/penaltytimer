<script lang="ts">
  import * as log from './log';
  import * as Validate from './validate';
  import { toMilliseconds } from './timerlib';

  export let errors: Validate.Errors = {};
  export let duration: number;

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

<input required type="text" class={Validate.errorClass(errors.duration, 'invalid', 'valid')} name="duration" bind:value={durationText}>

<style>
  input.invalid {
    background-color: pink;
  }

  input {
    max-width: 5em;
  }
</style>
