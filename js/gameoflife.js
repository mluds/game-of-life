// Global variables
var width = 640;
var height = 480;
var cellSize = 20;
var cellColor = 'black';
var cells = [];
var running = false;
var layer;
var interval;
var delay = 500;

// Flipping a cell off will make it transparent but still responsive to events
function flip(event) {
    if (this.opacity() == 0) {
        this.opacity(1);
    } else {
        this.opacity(0);
    }
    layer.draw();
}

function addListeners() {
    // Mouse down event over an individual cell will flip it
    layer.getChildren().each(function(cell) {
        cell.on('mousedown', flip);
    });
    
    // Allow flipping multiple cells at once with dragging
    layer.on('mousedown', function() {
        this.getChildren().each(function(cell) {
            cell.on('mouseover', flip);
        });
    });
    layer.on('mouseup', function() {
        this.getChildren().each(function(cell) {
            cell.off('mouseover');
        });
    });
}

function removeListeners() {
    layer.getChildren().each(function(cell) {
        cell.off('mousedown');
    });
    layer.off('mousedown');
    layer.off('mouseup');
}

function start() {
    removeListeners();
    interval = setInterval(update, delay);
    $('#stage').css('cursor', 'auto');
    $('#play').text('Pause');
    running = true;
}

function stop() {
    addListeners();
    clearInterval(interval);
    $('#stage').css('cursor', 'pointer');
    $('#play').text('Play');
    running = false;
}

function update() {
    // Tracks if any cell has flipped
    flipped = false;
    
    // Calculate whether each cell should flip based on the current state
    layer.getChildren().each(function(cell) {
        var n = 0;
        for (var i = 0; i < cell.neighbors.length; i++) {
            if (cell.neighbors[i].opacity()) {
                n++;
            }
        }
        cell.flip = false;
        if (cell.opacity()) {
            if (n<2 || n>3) {
                cell.flip = true;
            }
        } else {
            if (n == 3) {
                cell.flip = true;
            }
        }
    });
    
    // Flip the cells
    layer.getChildren().each(function(cell) {
        if (cell.flip) {
            cell.opacity(1 - cell.opacity());
            flipped = true;
        }
    });
    
    // Redraw
    layer.draw();
    
    // If no cells have flipped, stop
    if (!flipped) {
        stop();
    }
}

$(document).ready(function() {
    // Setup delay slider
    $('#delay').slider({
        min: 50,
        max: 1000,
        step: 50,
        value: delay
    }).on('slideStop', function(event) {
        delay = event.value;
        if (running) {
            clearInterval(interval);
            interval = setInterval(update, delay);
        }
    });

    var stage = new Kinetic.Stage({
        container: 'stage',
        width: width,
        height: height
    });

    layer = new Kinetic.Layer();
    
    // Create cells
    for (var x = 0; x < width; x += cellSize) {
        row = []
        for (var y = 0; y < height; y += cellSize) {
            var cell = new Kinetic.Rect({
                x: x,
                y: y,
                width: cellSize,
                height: cellSize,
                fill: cellColor,
                opacity: 0
            });
            row.push(cell);
            layer.add(cell);
        }
        cells.push(row);
    }

    // Create a neighbors array for each cell
    for (var r = 0; r < cells.length; r++) {
        for (var c = 0; c < cells[0].length; c++) {
            var n = cells[r][c].neighbors = [];
            for (var i = -1; i < 2; i++) {
                for (var j = -1; j < 2; j++) {
                    if (!(i == 0 && j == 0) && r+i > 0 && c+j > 0 && r+i < cells.length && c+j < cells[0].length) {
                        n.push(cells[r+i][c+j]);
                    }
                }
            }
        }
    }

    stage.add(layer);    
    addListeners();
    
    // Play button functionality
    $('#play').click(function() {
        if (!running) {
            start();
        } else {
            stop();
        }
    });
});