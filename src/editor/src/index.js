import $ from "./jquery.js";

console.log("load");
console.log("loaded");

$(function() {
	//config
	const REPLAY_SCALE = 1;
	let SPEED = 1;

	// init elements
	const $record = $("#record");
	const $body = $("body");
	const $save = $("#save");
	const $htmlDoc = $("html");

	// Data type for storing a recording
	const recording = { events: [], startTime: -1 };

	let localStorageRecording = null;

	// Record each type of event
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

	$save.click(function() {
		// write recording to JSON file
		localStorageRecording = JSON.stringify(recording);
		localStorage.setItem("recording", localStorageRecording);
		
		const jsonString = JSON.stringify(recording);
		const blob = new Blob([jsonString], {type: "application/json"});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		const fileName = prompt("Please enter the file name", "recording.json");

		if (fileName != null) {
			link.download = fileName;
		} else {
			link.download = "recording.json";
		}

		link.href = url;
		link.click();
	});

	// Helpers

	function listen(eventName, handler) {
		// listens even if stopPropagation
		return document.documentElement.addEventListener(
			eventName, 
			handler, 
			true
		);
	}

	function removeListener(eventName, handler) {
		// removes listen even if stopPropagation
		return document.documentElement.removeEventListener(
			eventName,
			handler,
			true
		);
	}

	function flashClass($el, className) {
		$el
			.addClass(className)
			.delay(200)
			.queue(() => $el.removeClass(className).dequeue());
	}
});

// TODO
// 
// save events to json ---+
// dont record the buttons ---+
