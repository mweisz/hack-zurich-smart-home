var minute = 0; 
var sampleData = [0, 0, 0, 1, 1, 1];



function startSimulation() {
    setInterval(function() {
        if (sampleData[minute] == 0) {
            openDoor(1);
        } else {
            closeDoor(1);
        }

        minute = (minute + 1) % sampleData.length;
    }, 1000);
}

function stopSimulation() {
    
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

