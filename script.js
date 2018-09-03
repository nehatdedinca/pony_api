// API URL
var apiURL = "https://ponychallenge.trustpilot.com/pony-challenge/maze"

// width and height of maze between 15 and 25
var mazeWidth = 15;
var mazeHeight = 15;

// ponyname must be a valid name of a pony, why
var ponyName = "Fluttershy"; // ugh

// difficulty between 0 and 10
var difficulty = 1;
var mazeId = "";
 var mazeParams = {
    "maze-width": 15,
    "maze-height": 15,
    "maze-player-name": "Fluttershy",
    "difficulty": 1
};

// setup standard ajax params
$.ajaxSetup({
  dataType: "json",
  contentType: "application/json; charset=utf-8"
})
 $(document).on('click', '.start', function(){
  // get maze_id from API when user starts game
  $.ajax({
    url: apiURL,
    data: JSON.stringify(mazeParams),
    method: "POST"
  }).done(function(data){
    console.log("== SUCCESS ==");
    console.log(data);
    mazeId = data.maze_id;
  }).fail(function(err){
    console.log("== ERROR ==");
    console.log(err);
  });
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
