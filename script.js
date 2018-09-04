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
var mazeViz = "";
// current game state
var gameState = "";
// empty object for maze parameters
var mazeParams = {};
// "ai" controlled pony
var AUTO = false;

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
    mazeState = data;
    gameState = data['game-state'].state.toLowerCase();

    console.log(gameState);
    getMazeVisual(id)

    if(AUTO && gameState == "active"){
      let walls = buildWallsAtPony(data);
      let dirs = getValidDirections(walls);
      let randDir = getRandomInt(dirs.length);

      postMazeMove(mazeId, dirs[randDir]);
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
    console.log(data);
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
  let ponyPos = mazestate.pony[0];

  let wallsPony = mazestate.data[ponyPos];
  let wallsRight = mazestate.data[ponyPos+1];
  let wallsBelow = ponyPos+mazeWidth < (mazeWidth*mazeHeight) ? mazestate.data[ponyPos+mazeWidth] : ["north"];

  let walls = {
    pony: wallsPony,
    right: wallsRight,
    below: wallsBelow
  };

  return walls;
}

function getValidDirections(walls){
  let dirs = ["north", "west", "east", "south"];
  for(x in walls){
    for(var i = 0; i < walls[x].length; i++){
      let index;
      // remove directions depending on key name
      // pretty clunky implementation
      if(x === 'pony'){
        index = dirs.indexOf(walls[x][i]);
      }
      if(x === 'below' && walls[x][i] === "north"){
        index = dirs.indexOf("south");
      }
      if(x === 'right' && walls[x][i] === "west"){
        index = dirs.indexOf("east");
      }
      if(index >= 0){
        dirs.splice(index, 1);
      }
    }
  }
  return dirs;
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
