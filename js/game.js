'use strict'

const BOMB = '💣'
const FLAG = '🚩'
const UNFLAG = '  '
const EMPTY = ' '
const HAPPY = '😀'
const SAD = '🥵'
const WIN = '🥇'
const HEART = '<img src="img/heart.png" />'
const HINT = '💡'
const SOUNDON = '🔊'
const SOUNDOFF = '🔇'


var gHint = false
var gBoard
var gSoundMode = true
var gFlagsCount
var gGameIsOn
var gLife
var gSafeClicks
var gFirstClick = true
var smileyIcon = document.querySelector('.img-smiley')
var lifeIcon = document.querySelector('.life')
var clickAudio = new Audio('sound/opencell.wav');
var safeClickSound = new Audio('sound/safeclick.wav');
var bombSound = new Audio('sound/bomb.wav');

var gLevelEasy = {
    SIZE: 4,
    MINES: 2
}
var gLevelMedium = {
    SIZE: 8,
    MINES: 12
}
var gLevelHard = {
    SIZE: 12,
    MINES: 30
}
var gLevel = gLevelEasy


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


function initGame() {
    resetValues()
    gBoard = buildBoard(gLevel)
    stopTimer()
    resetTimer()
    renderFlagCount()
    renderSafeClicks()
    renderBoard(gBoard)
}


//Reset Values
function resetValues() {
    gGameIsOn = true
    gFirstClick = true
    gLife = 2
    gSafeClicks = 3
    lifeIcon.innerHTML = HEART + HEART + HEART
    gFlagsCount = gLevel.MINES
    smileyIcon.innerText = HAPPY
}

//Build board
function buildBoard(gLevel) {
    var size = gLevel.SIZE
    var bombs = gLevel.MINES
    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([]);
        for (var j = 0; j < size; j++) {
            var cell = {
                minesAroundCount: 4,
                isShown: false,
                isMine: false,
                isMarked: false,
                locationI: i,
                locationJ: j
            }
            board[i][j] = cell;
        }
    }
    return board;
}

//Plain Bombs
function PlainBombs(board, bombs) {
    for (var i = 0; i < bombs; i++) {
        var randomPlaceI = getRandomIntInclusive(0, board.length - 1)
        var randomPlaceJ = getRandomIntInclusive(0, board.length - 1)
        if (board[randomPlaceI][randomPlaceJ].isMine === false && !board[randomPlaceI][randomPlaceJ].isShown) {
            board[randomPlaceI][randomPlaceJ].isMine = true
        } else {
            i--
        }
    }
    return board
}



//Render table
function renderBoard(board) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            var tdId = `cell ${i}-${j}`
            var tdClass = ' '
            if (cell.isShown) tdClass = 'show'
            strHTML += '<td id="' + tdId + '" class="cell ' + tdClass + '" '
            strHTML += ' onclick="cellClicked(this)"';
            strHTML += 'onmousedown="cellMarked(this, event)">'
            if (cell.isMarked) strHTML += FLAG;
            if (cell.isShown) {
                if (cell.isMine) {
                    strHTML += BOMB
                } else {
                    strHTML += cell.minesAroundCount
                }

            }
            '  </td>'
        }

    }

    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.board');
    elContainer.innerHTML = strHTML;
}



// Render cell
function renderCell(location, value = ' ') {
    var elCell = document.getElementById(`cell ${location.i}-${location.j}`);
    var color = colorizeCell(value)
    if (value === BOMB || value === ' ' || value === 1 || value === 2 || value === 3 || value === 4 | value === 5 || value === 6) {
        gBoard[location.i, location.j].isShown = true
        elCell.classList.add('show')
    }
    if (elCell) {
        elCell.style.color = color
        elCell.innerHTML = value;
    }
    console.log(gBoard)
}

//Render flag count
function renderFlagCount() {
    var strHTML = '';
    var elBoard = document.querySelector('.flags');
    elBoard.innerText = gFlagsCount;

}


//Cell click
function cellClicked(cellThis) {
    var cellCoord = getCellCoord(cellThis.id)
    var cell = gBoard[cellCoord.i][cellCoord.j]
    if (gGameIsOn) {
        if (cell.isMarked === true) return
        cellThis.classList.add('show')
        cell.isShown = true

        if (gFirstClick) {
            PlainBombs(gBoard, gLevel.MINES)
            setMinerCount(gBoard)
            startTimer()
            gFirstClick = false
        }

        // safeClickSub()
        if (cell.isMine) {
            if (gLife === 2) lifeIcon.innerHTML = HEART + HEART
            if (gLife === 1) lifeIcon.innerHTML = HEART
            if (gSoundMode) bombSound.play();
            renderCell(cellCoord, BOMB)
            if (gLife === 0) {
                lifeIcon.innerText = EMPTY
                revelAllBombs()
                stopTimer()
                gGameIsOn = false
                smileyIcon.innerText = SAD

            } else gLife--
        } else {
            renderCell(cellCoord, cell.minesAroundCount)
            if (gSoundMode) clickAudio.play();
        }
        if (cell.minesAroundCount === EMPTY) expandShown(cellCoord.i, cellCoord.j)
    }

}



//Cell Marked
function cellMarked(cellThis, cellEvent) { //Change the names 
    var cellCor = getCellCoord(cellThis.id)
    var cellBoard = gBoard[cellCor.i][cellCor.j]
    document.addEventListener('contextmenu', cellEvent => cellEvent.preventDefault()); //Disable Menu
    if (cellEvent.button === 2) {

        if ((cellBoard.isMarked === false) && (gFlagsCount > 0) && (cellBoard.isShown === false)) {
            renderCell(cellCor, FLAG)
            cellBoard.isMarked = true
            gFlagsCount--

        } else if ((cellBoard.isMarked === true) && (gFlagsCount >= 0)) {
            renderCell(cellCor, UNFLAG)
            cellBoard.isMarked = false
            gFlagsCount++
        }
        renderFlagCount()

        if (checkGameOver()) {
            gGameIsOn = false
            stopTimer()
        }
    }

}

function safeClickSub() {
    var elButton = document.querySelector('.safe-click')
    if (gSafeClicks > 0) {
        var safeCell = safeClick()
        gSafeClicks--
        if (safeCell) {
            var elSafeCell = document.getElementById(`cell ${safeCell.locationI}-${safeCell.locationJ}`);
            elSafeCell.classList.add('marked')
            setTimeout(function() {
                elSafeCell.classList.remove('marked')
            }, 2000)
            if (gSoundMode) safeClickSound.play();

            elButton.innerText = `Safe Clicks - ${gSafeClicks}`
            if (gSafeClicks === 0) elButton.style.backgroundColor = "red"

        }
    }
}

function safeClick() {
    var safeCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) safeCells.push(gBoard[i][j])
        }
    }
    var safeCell = safeCells[getRandomIntInclusive(0, safeCells.length)]
    if (safeCell) return safeCell
    else return false
}

function renderSafeClicks() {
    var elButton = document.querySelector('.safe-click')
    elButton.style.backgroundColor = "white"
    elButton.innerText = `Safe Clicks - 3`

}

/***********************Neighbors functions******************** */



function setMinerCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var arr = countNeighbors(board, i.j)
            var counter = 0
            for (var k = 0; k < arr.length; k++) {
                counter += arr[k]
            }
            var counter = countNeighbors(board, i, j)
            if (counter === 0) counter = EMPTY
            board[i][j].minesAroundCount = counter
        }
    }
}

function countNeighbors(board, cellI, cellJ) {
    var minesCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            var currCell = board[i][j]
            if (currCell.isMine) {
                minesCount++
            }

        }
    }

    return minesCount
}

function expandShown(cellI, cellJ) {
    var arrNeighbors = saveNeighbors(cellI, cellJ)
    for (var i = 0; i < arrNeighbors.length; i++) {
        if (!arrNeighbors[i].isMine && !arrNeighbors[i].isShown && !arrNeighbors[i].isMarked) {
            var elCel = document.getElementById(`cell ${[arrNeighbors[i].locationI]}-${[arrNeighbors[i].locationJ]}`)
            arrNeighbors[i].isShown = true
            var location = {}
            location.i = (arrNeighbors[i].locationI)
            location.j = (arrNeighbors[i].locationJ)
            renderCell(location, arrNeighbors[i].minesAroundCount)
            if (arrNeighbors[i].minesAroundCount === EMPTY) {
                expandShown(arrNeighbors[i].locationI, arrNeighbors[i].locationJ)
            }
        }
    }
}

function saveNeighbors(cellI, cellJ) {
    var arrNeighbors = []
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            var currCell = gBoard[i][j]
            if (!(currCell.isMine)) {
                arrNeighbors.push(currCell)
            }

        }
    }

    return arrNeighbors
}




// Game ends when all mines are 
// marked, and all the other cells 
// are shown
function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            if (cell.isShown === false && cell.isMine === false) return false
            if (cell.isMine === true && cell.isMarked === false) return false
        }
    }
    smileyIcon.innerText = WIN
    return true
}



// get level of game
function getLevel(levelThis) {
    var lCell = document.querySelector('.cell')
    switch (levelThis.id) {
        case '1':
            gLevel = gLevelEasy;
            break;
        case '2':
            gLevel = gLevelMedium;
            break;
        case '3':
            gLevel = gLevelHard;
            break;

    }
    initGame()
}

function colorizeCell(num) {
    var color = '';

    switch (num) {
        case 1:
            color = 'blue';
            break;
        case 2:
            color = 'green';
            break;
        case 3:
            color = 'red';
            break;
        case 4:
            color = 'black';
            break;
        default:
            color = '#9a9a9a';
            break;
    }

    return color;
}

// revel all bombs when game over
function revelAllBombs() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) {
                var location = {}
                location.i = i
                location.j = j
                gBoard[i][j].isShown = true
                renderCell(location, BOMB)
            }
        }
    }
}

function soundMode() {
    var elSoundMode = document.querySelector('.sound-mode')
    if (gSoundMode) {
        elSoundMode.innerText = SOUNDOFF
        gSoundMode = false
    } else {
        elSoundMode.innerText = SOUNDON
        gSoundMode = true
    }
}