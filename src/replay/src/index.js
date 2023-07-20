import $ from "./jquery.js";

console.log("load");
console.log("loaded");

$(function () {
  // Configuration
  let SPEED = 1;

  const $start = $("#start");
  const $plause = $("#pause");
  $plause.attr("disabled", true);

  const $textarea = $("#editing");
  const $seekBarInput = $("#seek-bar input");

  // Recording data
  const localStorageRecording = localStorage.getItem("recording");

  const recording = JSON.parse(localStorageRecording);

  // Update textarea value based on recorded "keypress" events
  function replayKeypressEvents() {
    for (let event of recording.events) {
      if (event.type === "keypress") {
        setTimeout(() => {
          $textarea.val(event.value);
        }, event.time - recording.startTime);
      }
    }
  }

  // Play recording
  $start.click(function playRecording() {
    let isPlaying = true;
    let accumulatedPauseTime = 0;
    let startPlay = Date.now();

    const updateSeekBar = (currentTime, duration) => {
      const percentage = (currentTime / duration) * 100;
      $seekBarInput.val(percentage);
    };

    // Handle seek bar input
    $seekBarInput.on("input", () => {
      const percentage = $seekBarInput.val();
      const currentTime = (percentage / 100) * recording.events[recording.events.length - 1].time;
      replayKeypressEvents();
      updateSeekBar(currentTime, recording.events[recording.events.length - 1].time);
    });

    // Handle play/pause button
    $plause.click(function () {
      if (isPlaying) {
        $plause.text("Play");
        isPlaying = false;
        SPEED = 0;
        accumulatedPauseTime = Date.now() - startPlay;
      } else {
        $plause.text("Pause");
        isPlaying = true;
        SPEED = 1;
        startPlay = Date.now() - accumulatedPauseTime;
      }
    });

    function drawEvent(event) {
      if (event.type === "click" || event.type === "mousemove") {
        // Handle click and mousemove events
      }

      if (event.type === "keypress") {
        $textarea.trigger({ type: "keypress", keyCode: event.keyCode });
        $textarea.val(event.value);
      }
    }

    let i = 0;
    const startTime = Date.now();
    const recordingEndTime = recording.startTime + recording.events[recording.events.length - 1].time;

    function draw() {
      const event = recording.events[i];
      if (!event) {
        return;
      }

      const offsetRecording = event.time - recording.startTime;
      const offsetPlay = (Date.now() - startPlay) * SPEED;

      if (offsetPlay >= offsetRecording) {
        drawEvent(event);
        i++;
      }

      if (i < recording.events.length) {
        requestAnimationFrame(draw);
      } else {
        SPEED = 0;
      }

      const currentTime = Date.now() - startPlay - accumulatedPauseTime;
      updateSeekBar(currentTime, recordingEndTime);
    }

    replayKeypressEvents();
    draw();
  });
});
