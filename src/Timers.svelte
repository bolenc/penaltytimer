<script lang="ts">
  import * as log from './log';
  import TimerUI from './Timer.svelte';
  import type { Clock } from './timerlib';
  import TimeInput from './TimeInput.svelte'
  import * as Validate from './validate';

	// export let name: string;
  export let name: string;
  export let clock: Clock;

  let playerNumber: number;
  let duration: number;

  // $: duration = getDuration(durationText);

  let activeTimers = [];
  let expiredTimers = [];
  let errors: any = {};
  $: errorList = Validate.getErrorList(errors);
  $: errorCount = errorList.length;

  function addTimer() {
    activeTimers = [
      ...activeTimers,
      {
        playerNumber,
        timerParams: {duration}
      }
    ];
  }

  function onAcknowledge(e) {
    const oldTimer = e.detail;
    const index = activeTimers.findIndex(timer => timer.playerNumber === oldTimer.playerNumber);
    log.debug(`Acknowledged`, activeTimers, oldTimer, index);
    activeTimers = [
      ...activeTimers.slice(0,index),
      ...activeTimers.slice(index+1)
    ];
    expiredTimers = [...expiredTimers, oldTimer];
    log.debug(`after Acknowledged`, activeTimers, oldTimer, index);
  }

</script>

<div id="main">  
  <h2>{name}</h2>
  <form on:submit|preventDefault={addTimer}>
    <label>Player: <input required type="number" min=0 max=99 bind:value={playerNumber} placeholder="#" id="playerNumber" name="playerNumber"></label>
    <label>Duration: <TimeInput id="duration" bind:duration={duration} bind:errors={errors} /></label>
    <button disabled={errorCount > 0}>Add</button>
    
    {#each errorList as err}
    <p class="error">{err}</p>
    {/each}
  </form>
  
  <div>
    {#each activeTimers as props}
      <TimerUI
        playerNumber={props.playerNumber}
        clock={clock}
        bind:params={props.timerParams}
        on:acknowledge={onAcknowledge}>
      </TimerUI>
    {/each}
  </div>
</div>

<style>
  p.error {
    color: red;
  }
  div#main {
    border-style: dashed;
  }

  input {
    max-width: 5em;
  }

  label {
    display: inline;
    padding: 4px;
  }
</style>
