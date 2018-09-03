// API URL
var apiURL = "https://ponychallenge.trustpilot.com/pony-challenge/maze"

// width and height of maze between 15 and 25
var mazeWidth = 15;
var mazeHeight = 15;
// ponyname must be a valid name of a pony, why
var ponyName = "Fluttershy"; // ugh
// difficulty between 0 and 10
var difficulty = 1;
// maze id and state
var mazeId = "";
var mazeState = {};
// maze visuals (ascii art)
var mazeViz = "";

var mazeParams = {
    "maze-width": 15,
    "maze-height": 15,
    "maze-player-name": "Fluttershy",
    "difficulty": 1
};

//////////////////////////////
//        FUNCTIONS         //
//////////////////////////////
function getMazeId(){
 $.ajax({
   dataType: "json",
   contentType: "application/json; charset=utf-8",
   url: apiURL,
   data: JSON.stringify(mazeParams),
   method: "POST"
 }).done(function(data){
   console.log("== SUCCESS ==");
   console.log(data);
    mazeId = data.maze_id;
   getMazeState(mazeId);
    $(".gamesetup").fadeOut(100);
 }).fail(function(err){
   console.log("== ERROR ==");
   console.log(err);
 });
}
function getMazeState(id){
 gameStarted = true;
 $.ajax({
   dataType: "json",
   contentType: "application/json; charset=utf-8",
    url: apiURL+"/"+id,
    method: "GET"
  }).done(function(data){
    mazeState = data;
    console.log(mazeState);
    getMazeVisual(id)
  });
}

function getMazeVisual(id){
  $.ajax({
    dataType: "text",
    url: apiURL+"/"+mazeId+"/print",
    method: "GET"
  }).done(printMazeState);
}

function printMazeState(mazeViz){
  $('.maze').empty().append(mazeViz);
}
$(document).on('click', '.start', function(){
 // get maze_id from API when user starts game
 $.ajax({
   dataType: "json",
   contentType: "application/json; charset=utf-8",
   url: apiURL,
   data: JSON.stringify(mazeParams),
   method: "POST"
 }).done(function(data){
   console.log("== SUCCESS ==");
   console.log(data);
    mazeId = data.maze_id;
   getMazeState(mazeId);
    $(".gamesetup").fadeOut(100);
 }).fail(function(err){
   console.log("== ERROR ==");
   console.log(err);
 });
 getMazeId();
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
