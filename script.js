//////////////////////////////////
//         SETUP & VARS         //
//////////////////////////////////

$.ajaxSetup({
  contentType: "application/json; charset=utf-8"
})

// API URL
var apiURL = "https://ponychallenge.trustpilot.com/pony-challenge/maze"

// width and height of maze, between 15 and 25
// difficulty between 0 and 10
// ponyname must be a valid name of a pony, why
var mazeWidth, mazeHeight, difficulty, pony;
// maze id and state
var mazeId = "";
var mazeState = {};
// maze visuals (ascii art!!)
var mazeViz;
// current game state
var gameState;
// empty object for maze parameters
var mazeParams = {};
// keeps track of visited cells (tremaux)
// each pair consists of array index as key,
// and an object with the key "visited" which value is 0,1 or 2
// 0 is not visited, 1 is visited once, 2 is dead-end
var mazeVisits = {};
// random mouse algo
var mouseDir;
// pony position, from array
var ponyPos;
// "ai" controlled pony
var AUTO = true;

//////////////////////////////
//        FUNCTIONS         //
//////////////////////////////

// == AJAX Functions == //

function getMazeId(params){
  // receives a maze-id from api, used for all other calls
  $.ajax({
    dataType: "json",
    url: apiURL,
    data: JSON.stringify(params),
    method: "POST"
  }).done(function(data){
    mazeId = data.maze_id;
    getMazeState(mazeId);

    $(".gamesetup").fadeOut(100);
  }).fail(ajaxFail);
}


function getMazeState(id){
  // retrieves state from server, then renders visuals
  // NB - state is currently not utilized for any purpose
  gameStarted = true;
  $.ajax({
    dataType: "json",
    url: apiURL+"/"+id,
    method: "GET"
  }).done(function(data){
    if(!gameState){
      // only init mazeVisits with 0's on first call
      mazeVisits = initTremaux(data.data, mazeVisits);
    }

    mazeState = data;
    gameState = data['game-state'].state.toLowerCase();
    ponyPos = data.pony[0];
    // prints out the maze visuals (ASCII, thanks API!!)
    getMazeVisual(id)

    // sets cell at current position as traveled
    mazeVisits = mazeCellVisited(mazeVisits, ponyPos);

    if(AUTO && gameState == "active"){
      let walls = buildWallsAtPony(data);
      let dirs = getValidDirections(walls);

      if(!mouseDir){
        mouseDir = 0;
      }

      mouseDir = makeDirection(walls, dirs, mouseDir);
      postMazeMove(mazeId, dirs[mouseDir]);
    }
  }).fail(ajaxFail);
}

function getMazeVisual(id){
  $.ajax({
    dataType: "text",
    mimeType: "text/plain; charset=utf-8",
    url: apiURL+"/"+id+"/print",
    method: "GET"
  }).done(printMazeState).fail(ajaxFail);
}


function postMazeMove(id, dir){
  // posts direction to maze, updates visuals on success
  $.ajax({
    dataType: "json",
    url: apiURL+"/"+id,
    method: "POST",
    data: JSON.stringify({direction: dir})
  }).done(function(data){
    gameState = data.state;
    getMazeState(id);
    printMsg(data["state-result"])
  }).fail(ajaxFail);
}

// == Non-AJAX Functions == //

function printMsg(msg){
  $('#messages').append($('<li>').text(msg));
  scrollBottom();
}

function printMazeState(mazeViz){
  $('.maze').empty().append(mazeViz);
}

function ajaxFail(err){
  console.log("== ERROR ==");
  console.log(err);

  if(err.responseText == "Only ponies can play"){
    $("#maze-player-name").val('').attr('placeholder', err.responseText);
  }
}

function scrollBottom(){
  let scrollbox = $('.msg_box');
  let e = $('#messages');
  scrollbox.scrollTop(e.height());
}

function buildWallsAtPony(mazestate){
  // each position can have walls at "west" and "north"
  // find walls by looking at nth index in maze data array
  // returns array with walls relative to pony position

  let wallsPony = mazestate.data[ponyPos];
  let wallsRight = mazestate.data[ponyPos+1];
  let wallsBelow = ponyPos+mazeWidth < (mazeWidth*mazeHeight) ? mazestate.data[ponyPos+mazeWidth] : ["north"];

  let walls = new Array();

  let wallsData = {
    pony: wallsPony,
    right: wallsRight,
    below: wallsBelow
  };

  for(wall in wallsData){
    for(var dir = 0; dir < wallsData[wall].length; dir++){
      if(wall === "pony"){
        walls.push(wallsData[wall][dir]);
      }
      if(wall === "below" && wallsData[wall][dir] == "north"){
        walls.push("south");
      }
      if(wall === "right" && wallsData[wall][dir] == "west"){
        walls.push("east");
      }
    }
  }
  return walls;
}

function getValidDirections(walls){
  let dirs = ["north", "west", "east", "south"];

  // for(var wall = 0; wall < walls.length; wall++){
  //   let index = dirs.indexOf(walls[wall]);
  //   dirs.splice(index, 1);
  // }
  return dirs;
}

function makeDirection(walls, dirs, mousedir){

  if(walls.includes(dirs[mousedir])){
    let newdir = dirs.filter(function(x){
      return walls.indexOf(x) < 0;
    });
    mousedir = dirs.indexOf(newdir[getRandomInt(newdir.length)]);
  }

  return mousedir;
}

function initTremaux(maze, mazeVisits){
  for(var i = 0; i < maze.length; i++){
    mazeVisits[i] = {
      visited: 0
    };
  };
  return mazeVisits;
};

function tremauxRemoval(dirs){
  // tremaux dir removal
  let index = new Array();
  let newWidth = mazeWidth;

  if((mazeWidth+ponyPos) > (mazeWidth * mazeHeight)-1 ||
     (mazeWidth+ponyPos) < 0){
       newWidth = 0;
  }

  for(var i=0; i < dirs.length; i++){

  }

  return dirs;
}

function mazeCellVisited(mazeVisits, ponyPos){
  // add 1 to maze cell visited state

  if(mazeVisits[ponyPos].visited < 2){
    mazeVisits[ponyPos].visited += 1;
  }

  return mazeVisits;
}

function getRandomInt(max){
  return Math.floor(Math.random() * Math.floor(max));
}

///////////////////////////////////
//         EVENT HANDLING        //
///////////////////////////////////



$(document).on('mousedown', '.start', function(){
  // collect game setup and get maze_id from api when user starts
  mazeWidth = parseInt($('#maze-width').val(), 10);
  mazeHeight = parseInt($('#maze-height').val(), 10);
  difficulty = parseInt($('#maze-difficulty').val(), 10);
  pony = $('#maze-player-name').val();

  mazeParams = {
    "maze-width": mazeWidth,
    "maze-height": mazeHeight,
    "maze-player-name": pony,
    "difficulty": difficulty
  }
  getMazeId(mazeParams);
});



$(document).on('mousedown', '.controls', function(){
  // posts chosen direction
  let direction = $(this).attr('data-dir');
  if(direction !== "stay"){
    printMsg("You attempt to move "+direction+".");
  }
  postMazeMove(mazeId, direction);
});

$(document).on('change', '.setupfield[type="number"]', function(){
  //reset value to min or max if value exceeds either
  let number = $(this).val();
  let max = parseInt($(this).attr('max'));
  let min = parseInt($(this).attr('min'));

  if(number > max){
    $(this).val(max);
  }else if(number < min){
    $(this).val(min);
  }
});
