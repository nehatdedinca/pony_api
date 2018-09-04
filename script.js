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
    getMazeVisual(id);
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
}
 function scrollBottom(){
  let scrollbox = $('.msg_box');
  let e = $('#messages');
  scrollbox.scrollTop(e.height());
}
 ///////////////////////////////////
//         EVENT HANDLING        //
///////////////////////////////////

$(document).on('click', '.start', function(){
  // collect game setup and get maze_id from api when user starts
  mazeWidth = $('#maze-width').val();
  mazeHeight = $('#maze-height').val();
  difficulty = $('#maze-difficulty').val();
  pony = $('#maze-player-name').val();
   mazeParams = {
    "maze-width": parseInt(mazeWidth, 10),
    "maze-height": parseInt(mazeHeight, 10),
    "maze-player-name": pony,
    "difficulty": parseInt(difficulty, 10)
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
