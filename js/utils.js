'use strict'

var Timer
var sec = 0
var miliSec = 0



function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


//Get random color
function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//Get cell coord
function getCellCoord(strCellId) {
    var coord = {};
    coord.i = +strCellId.substring(5, strCellId.lastIndexOf('-'));
    coord.j = +strCellId.substring(strCellId.lastIndexOf('-') + 1);
    return coord;
}



// Timer

/* Start */
function startTimer() {
    Timer = setInterval(timer, 10);
}

/* Stop */
function stopTimer() {
    clearInterval(Timer);
}

function resetTimer() {
    sec = 0
    miliSec = 0
    var putTime = document.querySelector('.timer')
    putTime.innerHTML = ` ${sec},${miliSec} </div>`
}


/* Main Timer */
function timer() {

    miliSec = ++miliSec;

    if (miliSec === 100) {
        miliSec = 0;
        sec = ++sec;
    }
    var putTime = document.querySelector('.timer')
    putTime.innerHTML = ` ${sec},${miliSec} </div>`

}