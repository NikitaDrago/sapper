'use strict';

const startButton = document.querySelector('.btn');
const board = document.querySelector('.board');
const endScreen = document.querySelector('.endscreen');

const borderSize = 10;
const grids = [];
const bombs = [];
const numColor = ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f1c40f', '#1abc9c', '#34495e', '#7f8c8d',];

let tiles;
let gameOver = false;

const checkCountBombs = (x,y) => {
    let bombCount = 0;
    bombs.forEach(item => {
        for(let dx = -1; dx <= 1; dx++){
            for(let dy = -1; dy <= 1; dy++){
                if(`${x},${y}` === item) continue;
                if(`${x+dx},${y+dy}` === item) bombCount++;
            }
        }
    });
    return bombCount;
};

const endScreenText = (win) => {
    endScreen.classList.add('show');
    if(win){
        endScreen.innerHTML = 'Вы выиграли!';
        endScreen.style.color = '#2ecc71';
    }else{
        endScreen.innerHTML = 'Вы проиграли!';
        endScreen.style.color = 'red';
    }
    gameOver = true;
}

const checkVictory = () => {
    let gameWin = true;
    tiles.forEach((tile,i) => {
        const coord = tile.getAttribute('data-tile');
        if(!tile.classList.contains('tile--checked') && !bombs.includes(coord)) gameWin = false;
    })
    if(gameWin) endScreenText(gameWin);
}

const endGame = () => {
    tiles.forEach(item => {
        const coord = item.getAttribute('data-tile').split(',');
        if(bombs.includes(`${parseInt(coord[0])},${parseInt(coord[1])}`)){
            item.innerHTML = '&#128163;';
            item.classList.add('tile--checked','tile--bomb');
        }
    })
    endScreenText(gameOver);
}

const checkTile = (coord) => {
    const coords = coord.split(',');
    const x = parseInt(coords[0]);
    const y = parseInt(coords[1]);
    for(let dx = -1; dx <= 1; dx++){
        for(let dy = -1; dy <= 1; dy++){
            const number = checkCountBombs(x+dx,y+dy);
            setTimeout(() => {
                if(x+dx >= 0 && y+dy >= 0 && x+dx < borderSize && y+dy < borderSize){
                    const tile = document.querySelector(`[data-tile="${x+dx},${y+dy}"]`);
                    clickTile(tile, number);
                }
            },10);
        }
    }
}
const clickTile = (tile,number) => {
    const coord = tile.getAttribute('data-tile');
    if (tile.classList.contains('tile--checked') || tile.classList.contains('tile--flagged')) return;
    if(bombs.includes(coord)) endGame();
    else {
        if(number > 0){
            tile.innerHTML = number;
            tile.style.color = numColor[number-1];
        }
        tile.classList.add('tile--checked');
        if(number === 0) checkTile(coord);
    }
    checkVictory();
}
const flag = (tile) => {
    if (tile.classList.contains('tile--checked')) return;
    if(!tile.classList.contains('tile--flagged')){
        tile.innerHTML = '&#128681;';
        tile.classList.add('tile--flagged');
    }else{
        tile.innerHTML = '';
        tile.classList.remove('tile--flagged');
    }
}

const showAroundTile = (bool,coord) => {
    tiles.forEach(tile => {
        const item = tile.getAttribute('data-tile');
        for(let dx = -1; dx <= 1; dx++){
            for(let dy = -1; dy <= 1; dy++){
                if(`${parseInt(coord[0])+dx},${parseInt(coord[1])+dy}` === item) bool ? tile.classList.add('tile--show') : tile.classList.remove('tile--show');
            }
        }
    });
}
const setBomb = () => {
    
    let x = 0,
    y = 0;
    
    tiles.forEach(item => {
        item.setAttribute('data-tile', `${x},${y}`);
        const coord = item.getAttribute('data-tile').split(',');
        const random = Math.round(Math.random() * 3);

        !random ?  bombs.push(`${x},${y}`) : grids.push(`${x},${y}`);
        
        x++;
        if(x >= borderSize){
            x = 0;
            y++;
        }
        
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            !gameOver && flag(item);
        })

        item.addEventListener('mousedown', (e) => {
            e.preventDefault()
            if(e.which == 2) showAroundTile(true,coord)
        })
        item.addEventListener('mouseover', (e) => {if(e.which == 2) showAroundTile(true,coord)})
        item.addEventListener('mouseout', (e) => {if(e.which == 2) showAroundTile(false,coord)})
        item.addEventListener('mouseup', (e) => {if(e.which == 2) showAroundTile(false,coord)});

        item.addEventListener('click', (e) => {
            const number = checkCountBombs(parseInt(coord[0]),parseInt(coord[1]));
            !gameOver && clickTile(item,number);
        });
    });
}

const clear = () => {
    tiles.forEach(item => {
        board.removeChild(item); 
    })
    gameOver = false;
    
    grids && grids.splice(0,grids.length);
    bombs && bombs.splice(0, bombs.length);
    
    endScreen.classList.remove('show');
    endScreen.innerHTML = '';
    endScreen.removeAttribute("style")
    setup();
};

const setup = () => {
    tiles = Array.from({ length: 100 },).map(() => {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        return tile;
    });
    board.append(...tiles);
    setBomb();

    startButton.addEventListener('click', clear);
};

setup();