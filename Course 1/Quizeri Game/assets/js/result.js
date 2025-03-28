function showresult() {
  $(".loadingresult").css("display", "grid");

  setTimeout(function () {
    $(".result_page").addClass("result_page_show");
  }, 1000);
}

//correct answers
var correct_answers = ["greece", "egyptian", "kenya", "egyptian", "horse"];

// user answers
let correct = 0;

var steps = $("fieldset").length;

console.log(steps);
function countresult(resultnumber) {
  $("#step" + resultnumber + " input").each(function () {
    for (var i = 0; i <= correct_answers.length; i++) {
      if ($(this).is(":checked")) {
        if ($(this).val() == correct_answers[i]) {
          correct++;

          break;
        }
      }
    }
  });

  var correctprcnt = (correct / steps) * 100;

  $(".u_prcnt").html(correctprcnt + "%");
  $(".prcnt_bar .fill").css("width", correctprcnt + "%");
  if (correctprcnt < 50) {
    $(".prcnt_bar_lvl").html("low");
    $(".u_prcnt, .prcnt_bar_lvl, .result_msg").css("color", "rgb(229, 0, 26)");
    $(".prcnt_bar .fill").css("background-color", "rgb(229, 0, 26)");
    $(".result_msg").html(
      '<img src="assets/images/cross.png" alt="cross"> You Failed!'
    );
  } else if (correctprcnt < 80) {
    $(".prcnt_bar_lvl").html("Medium");
    $(".u_prcnt, .prcnt_bar_lvl, .result_msg").css("color", "rgb(255, 89, 0)");
    $(".prcnt_bar .fill").css("background-color", "rgb(255, 17, 0)");
    $(".result_msg").html(
      '<img src="assets/images/warning.png" alt="warning"> Could have done better!'
    );
  } else if (correctprcnt >= 80) {
    $(".prcnt_bar_lvl").html("High");
    $(".u_prcnt, .prcnt_bar_lvl, .result_msg").css("color", "rgb(60, 196, 52)");
    $(".prcnt_bar .fill").css("background-color", "rgb(60, 196, 52)");
    $(".result_msg").html(
      '<img src="assets/images/check.png" alt="check"> Wow! You are Brilliant!'
    );
  }
}
