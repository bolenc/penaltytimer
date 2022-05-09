<script lang="ts">
  import { afterUpdate, createEventDispatcher, onDestroy, onMount } from "svelte";
  import * as log from './log';
  import * as Timer from './timerlib';

  export let playerNumber: number;
  export let clock: Timer.Clock;
  export let params: Timer.TimerParams;
  const dispatch = createEventDispatcher();

  params = Timer.init(params);
  $: timeRemainingText = Timer.toTimeString(params.timeRemaining);
  $: isExpired = params.timeRemaining <= 0 || params.state === Timer.TimerState.Stopped;
  $: isRunning = params.state === Timer.TimerState.Running;

  clock.addEventListener(Timer.TimerEvents.Tick, tick);

  onMount(async () => {
    log.debug(`onMount(${playerNumber}, ${params.timeRemaining}/${params.duration})`);
    params = Timer.start(params);
  });

  onDestroy(() => {
    log.debug(`onDestroy(${playerNumber}, ${params.timeRemaining}/${params.duration})`);
    clock.removeEventListener(Timer.TimerEvents.Tick, tick);
  });

  afterUpdate(() => {
    log.debug(`afterUpdate(${playerNumber}, ${params.timeRemaining}/${params.duration})`);
  });

  function acknowledge() {
    dispatch('acknowledge', {playerNumber, params});
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

<div class="main {isExpired ? 'expired' : 'active'}">
  <div class="info">
    Player: {playerNumber}
    Time left: {timeRemainingText}
  </div>

  <div class="controls">
    
    {#if isRunning}
    <button on:click={() => params = Timer.pause(params)}>&#x23F8;</button>
    {:else if !isExpired}
    <button on:click={() => params = Timer.start(params)}>&#x23F5;</button>
    {/if}
    
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
  div.expired {
    border-style: solid;
    border-color: red;
    background-color: pink;
  }
</style>
