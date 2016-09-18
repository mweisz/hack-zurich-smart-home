// CONSTANTS
var PERIOD_DURATION = 10;//180;  // ms
var OVERALL_MINUTES = 2880;

// GLOBALS, Yummy!!!
var minute = 300; 
var historicDoorData = [stateTimeline.contact.contact_3,
                    stateTimeline.contact.contact_13]; 

var historicLightData = [stateTimeline.light.light_1,
                        stateTimeline.light.light_2,
                        stateTimeline.light.light_3,
                        stateTimeline.light.light_4];

var historicSumOfLights = [Array.apply(null, Array(OVERALL_MINUTES)).map(Number.prototype.valueOf,0)];

for (var i = 0; i < OVERALL_MINUTES; i++) {
    historicSumOfLights[i] = historicLightData[0][i] + historicLightData[1][i] + historicLightData[2][i] + historicLightData[3][i];
}


var liveLightData = [Array.apply(null, Array(OVERALL_MINUTES)).map(Number.prototype.valueOf,0),
                    Array.apply(null, Array(OVERALL_MINUTES)).map(Number.prototype.valueOf,0),
                    Array.apply(null, Array(OVERALL_MINUTES)).map(Number.prototype.valueOf,0),
                    Array.apply(null, Array(OVERALL_MINUTES)).map(Number.prototype.valueOf,0)];

var historicAvatarData = [stateTimeline.movement.movement_14, stateTimeline.movement.movement_6, stateTimeline.movement.movement_15];


var isManualMode = false;
var isWarningMode = false;
var simulationInterval;
var isSimulationRunning = false;


$(function(){
    $('.lightbulb').click(function(target){
        isManualMode = true;
        $("#modeCheckBox").prop('checked', false);
        var lightIndex = parseInt(target.toElement.id.split("\-")[1]);
        var lightbulb = $(target.toElement);
        if (lightbulb.hasClass('lightbulb-on')) {
            turnOffLight(lightIndex);
        } else {
            turnOnLight(lightIndex);
        }
    });

    $('.overlay-box').click(function(target){
        isManualMode = true;
        $("#modeCheckBox").prop('checked', false);

        var doorIndex = parseInt(target.toElement.id.split("\-")[1]);

        if($(target.toElement).hasClass('vertical-door-closed') || $(target.toElement).hasClass('horizontal-door-closed')){
            openDoor(doorIndex);
        } else {
            closeDoor(doorIndex);
        }
    });

    setInterval(checkLightAnomaly, 200);

    $('.person').hide();
    $('#person-2').show();

    $('#modeCheckBox').on("change", function(){
        if (isManualMode) {
            isManualMode = false;
        } else {
            isManualMode = true;
        }
    });

    $('#clock-heading').text(moment("2016-05-12T05:00:00").format('DD.MM.YYYY, h:mm:ss a'));


});

function makeAPIcall() {
    $.ajax({
        url: "http://localhost:3000/score/checkOutlier",
        type: "POST",
        data: historicSumOfLights.slice(0, 10),
        success:function(data, textStatus, jqXHR){
            console.log("HTTP Request Succeeded: " + jqXHR.status);
            console.log(data);
        },
        error:function(jqXHR, textStatus, errorThrown){
            console.log("HTTP Request Failed");
        }
    });

}

function logMessage(message, logLevel, timestamp) {
    if (logLevel == undefined) {
        logLevel = '';
    }
    var timeString = moment("2016-05-12T00:00:00").add(minute, 'minutes').format('DD.MM.YYYY, h:mm:ss a');
    var logEntry = $('<a href="#" class="list-group-item list-group-item' + logLevel + '">' + timeString + ' - <b>' + message + '</b></a>');

    logEntry.click(function(){
        if (logLevel == '-warning') {
            showLightingChart();
        } else if (logLevel == '-danger')  {
            showNotification();
        }
    });

    $('.event-log').prepend(logEntry);

}

function showNotification(msg, type) {
    $.notify({
        // options
            message: 'Suspicious Door Behaviour. Sending Notification...' ,
            icon: 'glyphicon glyphicon-warning-sign',
    url: 'https://github.com/mouse0270/bootstrap-notify',
    target: '_blank'
    },{
            delay: 15000,
        timer: 1000,
        // settings
        allow_dismiss: false,
        placement: {
            from: "top",
            align: "right"
        },
        type: 'danger'
    });
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

        if(!isManualMode) {
            updateDoors();
            updateLights();
            updateAvatar();
        }


        // Update Clock Heading
        $('#clock-heading').text(moment("2016-05-12T00:00:00").add(minute, 'minutes').format('DD.MM.YYYY, h:mm:ss a'));

        minute = (minute + 1) % OVERALL_MINUTES;

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
    var numberOfLights = liveLightData[0][minute] + liveLightData[1][minute] + liveLightData[2][minute] + liveLightData[3][minute];


    if (Math.abs(numberOfLights - historicSumOfLights[minute]) >= 2 && !isWarningMode) {
        $('#statusLabel').removeClass('label-success').addClass('label-warning');
        logMessage('Unusual Light Activity', '-warning');
        isWarningMode = true;
    } else if (isWarningMode && Math.abs(numberOfLights - historicSumOfLights[minute]) < 2) {
            $('#statusLabel').removeClass('label-warning').addClass('label-success');
            logMessage('Light Activity Operating normally', '-success');  
            isWarningMode = false;
    }
}

function updateDoors() {
    for (var doorIndex = 0; doorIndex < historicDoorData.length; doorIndex++) {
        if (historicDoorData[doorIndex][minute] == 0 && (minute == 0 || historicDoorData[doorIndex][minute - 1] != 0)) {
                openDoor(doorIndex + 1);

        } else if (historicDoorData[doorIndex][minute] == 1 && (minute == 0 || historicDoorData[doorIndex][minute - 1] != 1)) {
                closeDoor(doorIndex + 1);
        }        
    }
}

function updateAvatar() {
    for (var roomIndex = 0; roomIndex < 3; roomIndex++) {
        if (historicAvatarData[roomIndex][minute] >= 0) {
            $('#person-' + (roomIndex + 1)).show();
        } else {
            $('#person-' + (roomIndex + 1)).hide();
        }
    }
}

function updateLights() {
    for (var lightIndex = 0; lightIndex < historicLightData.length; lightIndex++) {
        if (historicLightData[lightIndex][minute] == 0 && (minute == 0 || historicLightData[lightIndex][minute - 1] != 0)) {
                turnOffLight(lightIndex + 1);

        } else if (historicLightData[lightIndex][minute] == 1 && (minute == 0 || historicLightData[lightIndex][minute - 1] != 1)) {
                turnOnLight(lightIndex + 1);
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
    for (var i = minute; i < OVERALL_MINUTES; i++) {
         liveLightData[lightIndex - 1][i ] = 1;
    }
    logMessage('Turned on Light ' + lightIndex);
    checkLightAnomaly();
    var lightbulb = $('#lightbulb-' + lightIndex);
    lightbulb.removeClass('lightbulb-off').addClass('lightbulb-on');
}

function turnOffLight(lightIndex) {
    for (var i = minute; i < OVERALL_MINUTES; i++) {
         liveLightData[lightIndex - 1][i ] = 0;
    }
    logMessage('Turned off Light ' + lightIndex);
    checkLightAnomaly();
    var lightbulb = $('#lightbulb-' + lightIndex);
    lightbulb.removeClass('lightbulb-on').addClass('lightbulb-off');
}

function openDoor(doorIndex) {
    logMessage('Opened Door ' + doorIndex + ".");
    setTimeout(function(){ checkDoorAnomaly();}, 1200);
    
    makeAPIcall();

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

