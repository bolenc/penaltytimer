<script lang="ts">
  import { afterUpdate, createEventDispatcher, onDestroy, onMount } from "svelte";
  import * as log from './log';
  import * as Timer from './timerlib';

  export let playerNumber: number;
  export let clock: Timer.Clock;
  export let params: Timer.TimerParams;
  const dispatch = createEventDispatcher();

  $: timeRemainingText = Timer.toTimeString(params.timeRemaining);
  $: isExpired = params.timeRemaining <= 0 || params.state === Timer.TimerState.Stopped;
  $: isRunning = params.state === Timer.TimerState.Running;
  params = Timer.init(params);

  if (clock.isRunning) {
    params = Timer.start(params);
  }

  clock.addEventListener(Timer.TimerEvents.Tick, tick);
  clock.addEventListener(Timer.TimerEvents.Start, start);
  clock.addEventListener(Timer.TimerEvents.Pause, pause);

  onMount(async () => {
    log.debug(`onMount(${playerNumber}, ${params.timeRemaining}/${params.duration})`);
  });

  onDestroy(() => {
    log.debug(`onDestroy(${playerNumber}, ${params.timeRemaining}/${params.duration})`);
    clock.removeEventListener(Timer.TimerEvents.Tick, tick);
    clock.removeEventListener(Timer.TimerEvents.Start, start);
    clock.removeEventListener(Timer.TimerEvents.Pause, pause);
  });

  afterUpdate(() => {
    log.debug(`afterUpdate(${playerNumber}, ${params.timeRemaining}/${params.duration})`);
  });

  function acknowledge() {
    dispatch('acknowledge', {playerNumber, params});
  }

  function pause() {
    params = Timer.pause(params);
  }

  function start() {
    params = Timer.start(params);
  }

  function tick() {
    log.debug(`Tick player=${playerNumber}`, params);
    params = Timer.tick(params);

    if (isExpired) {
      dispatch(Timer.TimerEvents.Expired, {playerNumber, params});
    }
  }

  function onExpire() {
    dispatch('expire', {playerNumber, params});
  }
</script>

<div class="main {params.state}">
  <div class="info">
    Player: {playerNumber}
    Time left: {timeRemainingText}
  </div>

  <div class="controls">
    
    <!-- {#if isRunning}
    <button on:click={() => params = Timer.pause(params)}>&#x23F8;</button>
    {:else if !isExpired}
    <button on:click={() => params = Timer.start(params)}>&#x23F5;</button>
    {/if} -->
    
    {#if !isExpired}
    <button on:click={() => params = Timer.stop(params)}>&#x23F9;</button>
    {:else}
    <button on:click={acknowledge}>ok</button>
    {/if}
  </div>
</div>

<style>
  div.main {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border-style:solid;
    border-width: 1px;
  }

  div.info {
    display: flex;
    justify-content: center;
  }
  div.stopped {
    border-style: solid;
    border-color: red;
    background-color: pink;
  }
  div.paused {
    border-style: solid;
    border-color: black;
    background-color: lightgray;
  }
</style>
