import $ from "./jquery.js";

console.log("load");
console.log("loaded");


$(function () {
  // config
  let SPEED = 1;

  const $start = $("#start");
  const $body = $("body");
  const $plause = $('#pause');
  const $htmlDoc = $("html")

  const $record = $("#record")

  const $seekBar = $('#seek-bar');
  const $seekBarInput = $seekBar.find('input');
  const $fakeCursor = $('#cursor');

  // Data type for storing a recording
  const localStorageRecording = localStorage.getItem("recording");

  const recording = JSON.parse(localStorageRecording);

  // Use the recording object as needed
  console.log(recording);

  // Check if the recording exists in local storage
  // if (localStorageRecording) {
  //   // Parse the recording from a JSON string to an object
  //   const recording = JSON.parse(localStorageRecording);

  //   // Use the recording object as needed
  //   console.log(recording);
  // } else {
  //   // The recording doesn't exist in local storage
  //   console.log("No recording found in local storage.");
  // }
  const handlers = [
		// {
		// 	eventName: "mousemove",
		// 	handler: function handleMouseMove(e) {
		// 		recording.events.push({
		// 			type: "mousemove",
		// 			x: e.pageX,
		// 			y: e.pageY,
		// 			time: Date.now()
		// 		});
		// 	}
		// },
		
		{
			eventName: "click",
			handler: function handleClick(e) {
				recording.events.push({
					type: "click",
					target: e.target.value,
					x: e.pageX,
					y: e.pageY,
					time: Date.now()
				});
			}
		},

		{
			eventName: "keypress",
			handler: function handleKeyPress(e) {
				recording.events.push({
					type: "keypress",
					target: e.target,
					value: e.target.value,
					keyCode:e.keyCode,
					time: Date.now()
				});
			}

		}
	];

	// Attach recording button
	$record.toggle(
		function startRecording() {
			// start recording
			$record.text("Recording (Click again to Stop)");
			// $begin.attr("disabled", 1);
			recording.startTime = Date.now();
			recording.events = [];
			// recording.htmlCopy = $(document.documentElement).html();
			recording.height = $(window).height();
			recording.width = $(window).width();
			handlers.map(x => listen(x.eventName, x.handler));
		},

		function stopRecording() {
			// stop recording
			recording.stopTime = Date.now()
			$record.text("Record");
			// $begin.removeAttr("disabled");
			handlers.map(x => removeListener(x.eventName, x.handler));

			console.log(recording)
		}
	);


  $start.click(function playRecording() {
    let isPlaying = true;
    let lastPauseTime = 0;
    let accumulatedPauseTime;

    let i = 0;
    let startPlay = Date.now();

    const updateSeekBar = (currentTime, duration) => {
      const percentage = (currentTime / duration) * 100;
      $seekBarInput.val(percentage);
    }

    // seek bar controls
    $seekBarInput.on('input', () => {
      const percentage = $seekBarInput.val();
      const currentTime = (percentage / 100) * recording.events[recording.events.length - 1].time;
      playRecording(currentTime);
    });

    // Play/pause button
    $plause.click(function () {
      if (isPlaying) {
        $plause.text("Play");
        isPlaying = false;
        SPEED = 0;

        accumulatedPauseTime = Date.now() - startPlay;
        // cancelAnimationFrame(draw)
      } else {
        $plause.text("Pause");
        isPlaying = true;
        SPEED = 1;
        // playRecording
        startPlay = Date.now() - accumulatedPauseTime;
        // requestAnimationFrame(draw);
      }
      // console.log("yellow")
    });



    (function draw() {
      let event = recording.events[i];
      if (!event) {
        return;
      }

      let offsetRecording = event.time - recording.startTime;
      let offsetPlay = (Date.now() - startPlay) * SPEED;
      if (offsetPlay >= offsetRecording) {
        drawEvent(event);
        i++;
      }

      if (i < recording.events.length) {

        requestAnimationFrame(draw);

      } else {
        SPEED == 0;
      }

      const currentTime = Date.now() - startPlay - accumulatedPauseTime;
      updateSeekBar(currentTime, recording.events[recording.events.length -1].time);

    })();
  })


  function drawEvent(event) {
    if (event.type === "click" || event.type === "mousemove") {
		$fakeCursor.css({
        top: event.y,
        left: event.x
      });
    }

    if (event.type === "click") {
      flashClass($fakeCursor, "click");
      const path = $(event.target).getPath();
      const $element = $iframeDoc.find(path);
      flashClass($element, "clicked");
    }


    if (event.type === "keypress") {
      const path = $(event.target).getPath();
      const $element = $iframeDoc.find(path);
      $element.trigger({ type: "keypress", keyCode: event.keyCode });
      $element.val(event.value);
    }
  }

  // Helpers

  function flashClass($el, className) {
    $el 
      .addClass(className)
      .delay(200)
      .queue(() => $el.removeClass(className).dequeue());
  }
});


/*
  make the code visible on replay ---+
  add mouse move event ---/
  if possible show caret on replay ---+
  save the replays in one file ---+
  add a seek element ---+
  incorporate into the website ---+
  fix pause and play ---+
  fix minor bugs and issues : file name and save ---+


  new::

  a modal that create lesson name and has a space for recording events. Then when save button is clicked, recording.push events ---+

  replay loads the items from the lesson with the given index --
*/