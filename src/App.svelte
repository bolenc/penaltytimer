<script lang="ts">
  import * as log from './log';
  import Timers from './Timers.svelte';
  import { Clock } from './timerlib';

  log.setLevel(log.LogLevel.Info);
  const clock = new Clock();
  let isRunning = clock.isRunning;

  function pauseAll() {
    clock.stop();
    isRunning = clock.isRunning;
  }
  function startAll() {
    clock.start();
    isRunning = clock.isRunning;
  }
	// export let name: string;
</script>

<main>
	<h1>Penalty Timer</h1>
  {#if isRunning}
  <button on:click={pauseAll}>Pause all &#x23F8;</button>
  {:else}
  <button on:click={startAll}>Start all &#x23F5;</button>
  {/if}
  <div id="timers-box">
    <Timers name="Team 1" clock={clock}>
      
    </Timers>
    <Timers name="Team 2" clock={clock}>
      
    </Timers>
  </div>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
    /* display: grid; */
	}

  #timers-box {
    display: grid;
    grid-template-columns: auto auto;
  }

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
