// GLOBALS, Yummy!!!
var minute = 0; 
var sampleData = [[0, 0, 0, 1, 1, 1],
                  [1, 0, 1, 0, 1, 0]]; 
var simulationInterval;
var isSimulationRunning = false;

// CONSTANTS
var PERIOD_DURATION = 1000; // 1 sec

$(function(){
    $('.lightbulb').click(function(target){

    });
});

function toggleSimulation() {
    if (isSimulationRunning) {
        stopSimulation();
    } else {
        startSimulation();
    }
}

function startSimulation() {
    isSimulationRunning = true;
    simulationInterval = setInterval(function() {
        console.log('Minute', minute);

        updateDoors();
        minute = (minute + 1) % sampleData[0].length;
    }, PERIOD_DURATION);
}

function updateDoors() {
    for (var doorIndex = 0; doorIndex < sampleData.length; doorIndex++) {
        if (sampleData[doorIndex][minute] == 0 && (minute == 0 || sampleData[doorIndex][minute - 1] != 0)) {
                openDoor(doorIndex + 1);
        } else if (sampleData[doorIndex][minute] == 1 && (minute == 0 || sampleData[doorIndex][minute - 1] != 1)) {
                closeDoor(doorIndex + 1);
        }        
    }

}

function stopSimulation() {
    isSimulationRunning = false;
    clearInterval(simulationInterval);
}

function toggleLightBulb(lightIndex) {

}

function turnOnLight(lightIndex) {
    var lightbulb = $('#lightbulb-' + lightIndex);
    lightbulb.removeClass('lightbulb-off').addClass('lightbulb-on');
}

function turnOffLight(lightIndex) {
    var lightbulb = $('#lightbulb-' + lightIndex);
    lightbulb.removeClass('lightbulb-on').addClass('lightbulb-off');
}

function openDoor(doorIndex) {
    var door = $('#door-' + doorIndex);
    if (door.hasClass('vertical-door-closed')) {
        // Vertical door
        door.removeClass('vertical-door-closed').addClass('vertical-door-open');
    } else if (door.hasClass('horizontal-door-closed')) {
        // Horizontal door
        door.removeClass('horizontal-door-closed').addClass('horizontal-door-open');
    }
}

function closeDoor(doorIndex) {
    var door = $('#door-' + doorIndex);
    if (door.hasClass('vertical-door-open')) { 
        // Vertical door
        door.removeClass('vertical-door-open').addClass('vertical-door-closed');
    } else if (door.hasClass('horizontal-door-open')) {
        // Horizontal door
        door.removeClass('horizontal-door-open').addClass('horizontal-door-closed');
    }
}

