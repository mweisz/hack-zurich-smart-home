// GLOBALS, Yummy!!!
var minute = 0; 
var historicData = [stateTimeline.contact.contact_3,
                    stateTimeline.contact.contact_13]; 

var numberOfLights = 0;                    
var simulationInterval;
var isSimulationRunning = false;

// CONSTANTS
var PERIOD_DURATION = 180;  // ms

$(function(){
    $('.lightbulb').click(function(target){
        var lightIndex = parseInt(target.toElement.id.split("\-")[1]);
        var lightbulb = $(target.toElement);
        if (lightbulb.hasClass('lightbulb-on')) {
            turnOffLight(lightIndex);
        } else {
            turnOnLight(lightIndex);
        }
    });

    $('.overlay-box').click(function(target){
        var doorIndex = parseInt(target.toElement.id.split("\-")[1]);

        if($(target.toElement).hasClass('vertical-door-closed') || $(target.toElement).hasClass('horizontal-door-closed')){
            openDoor(doorIndex);
        } else {
            closeDoor(doorIndex);
        }
    });

    $('#clock-heading').text(moment("2016-05-12T00:00:00").format('DD.MM.YYYY, h:mm:ss a'));


});

function logMessage(message, logLevel, timestamp) {
    if (logLevel == undefined) {
        logLevel = '';
    }
    var timeString = moment("2016-05-12T00:00:00").add(minute, 'minutes').format('DD.MM.YYYY, h:mm:ss a');
    var logEntry = $('<a href="#" class="list-group-item list-group-item' + logLevel + '">' + timeString + ' - <b>' + message + '</b></a>');

    logEntry.click(function(){
        showLightingChart();
    });

    $('.event-log').prepend(logEntry);

}

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

        updateDoors();

        // Update Clock Heading
        $('#clock-heading').text(moment("2016-05-12T00:00:00").add(minute, 'minutes').format('DD.MM.YYYY, h:mm:ss a'));

        minute = (minute + 1) % historicData[0].length;

    }, PERIOD_DURATION);
}

function checkDoorAnomaly() {
    // Check if doors are closed at nighttime
    var hours = Math.floor(minute / 60) % 24;
    if (1 <= hours && hours <= 7) {
        logMessage('Unusual Door Activity', '-danger');
    }
}

function checkLightAnomaly() {
    // Check if doors are closed at nighttime
    var hours = Math.floor(minute / 60) % 24;
    // if (1 <= hours && hours <= 7) {
    if (numberOfLights > 3) {
        logMessage('Unusual Light Activity', '-danger');
    }
    // }
}

function updateDoors() {
    for (var doorIndex = 0; doorIndex < historicData.length; doorIndex++) {
        if (historicData[doorIndex][minute] == 0 && (minute == 0 || historicData[doorIndex][minute - 1] != 0)) {
                openDoor(doorIndex + 1);

        } else if (historicData[doorIndex][minute] == 1 && (minute == 0 || historicData[doorIndex][minute - 1] != 1)) {
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
    numberOfLights++;
    logMessage('Turned on Light ' + lightIndex);
    checkLightAnomaly();
    var lightbulb = $('#lightbulb-' + lightIndex);
    lightbulb.removeClass('lightbulb-off').addClass('lightbulb-on');
}

function turnOffLight(lightIndex) {
    numberOfLights--;
    logMessage('Turned off Light ' + lightIndex);
    var lightbulb = $('#lightbulb-' + lightIndex);
    lightbulb.removeClass('lightbulb-on').addClass('lightbulb-off');
}

function openDoor(doorIndex) {
    logMessage('Opened Door ' + doorIndex + ".");
    checkDoorAnomaly();

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
    logMessage('Closed Door ' + doorIndex + '.');

    var door = $('#door-' + doorIndex);
    if (door.hasClass('vertical-door-open')) { 
        // Vertical door
        door.removeClass('vertical-door-open').addClass('vertical-door-closed');
    } else if (door.hasClass('horizontal-door-open')) {
        // Horizontal door
        door.removeClass('horizontal-door-open').addClass('horizontal-door-closed');
    }
}

