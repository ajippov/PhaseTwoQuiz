
var quiz = null;
$.ajax({
    url: "/quiz",
    dataType: "text",
    success: function(data) {
        quiz = $.parseJSON(data);
        console.log(quiz);
    }
});

var tags = [];//for Flickr
var tracker = -1;
var username = ""; 
var currentAnswers = []; 


$(document).ready(function(){ 

    $("#continue").click(function() { // Page 1
        if (validateForm() == false) { 
            $("#interface").addClass("has-error");
            $(".control-label").remove();
            $("<label for=\"NameProtocol\" class=\"control-label\">Please enter a usermane.</label>").hide().prependTo("#interface").fadeIn(1000); //warning message if there is no name
        }
        else if (validateForm() == true){ //data val
            console.log($('NameProtocol').val());
            tracker++;
            $("#container").empty(); //clears the container HTML div so i can make new stuff in it
            $("#container").append("<h2>Hi " + username + "! " + quiz.questions[0].text + "</h2>").hide().fadeIn(1000); //fadeIn all new HTML
            $("#container").append("<div class=\"col-md-6 col-md-offset-3 choices radio\" id=\"interface\">"); //making a dynamic div
            for(i = 0; i < quiz.questions[0].answers.length; i++){
                $("#interface").append("<input type=\"radio\" name=\"answer\"> " + quiz.questions[0].answers[i] + "<br>"); //create answer choices based upon json lengths
            }
            $("#interface").append("<br>");
            $("#interface").append("<input id=\"continue\" class=\"btn btn-success btn-lg\" type=\"button\" value=\"Next\"></input>"); // all of this code creates dynamically new elements that we can use for questions
        }
    });

    $("#container").on("click", "#continue", function(){ //when you click the next button (this particular part of the code is for dynamically generated next buttons)
        if (tracker >= 0) {
            if (validateAnswer() == false){ //data validation; checks if you answered/chosen a radio button; if you haven't filled in a radio button...
                $("#interface").addClass("has-error");
                $(".control-label").remove();
                $(".temp").remove();
                $("<center><label for=\"NameProtocol\" class=\"control-label\"><strong>You must pick an answer, human.</strong></label></center><br class=\"temp\">").hide().prependTo("#interface").fadeIn(1000); //warning message
            }
            else if (validateAnswer() == true) { //data validation; checks if you answered/chosen a radio button; if you HAVE filled in a radio button...
                saveAnswer(); //saves your answer to the currentAnswers array
                tracker++;
                $("#container").empty();
                $("#container").append("<h2>Hi " + username + "! " + quiz.questions[tracker].text + "</h2>").hide().fadeIn(1000);
                $("#container").append("<div class=\"col-md-6 col-md-offset-3 radio choices\" id=\"interface\">");
                for(i = 0; i < quiz.questions[tracker].answers.length; i++){
                    if (currentAnswers[tracker] == i) {
                        $("#interface").append("<input type=\"radio\" name=\"answer\" checked=\"checked\">" + quiz.questions[tracker].answers[i] + "<br>"); //lists answer choices
                    }
                    else {
                        $("#interface").append("<input type=\"radio\" name=\"answer\">" + quiz.questions[tracker].answers[i] + "<br>"); //creating some dynamic html up in here
                    }
                }
                $("#interface").append("<br>");
        if(tracker > 0){
            $("#interface").append("<input id=\"back\" class=\"btn btn-warning btn-lg\"type=\"button\" value=\"Back\"></input>"); //if we're on a certain # question, then display different types of buttons (submit on the last question, next on others, etc...)
        }
        if(tracker == (quiz.questions.length - 1)) {
            $("#interface").append("<input id=\"grade\" type=\"button\" class=\"btn btn-primary btn-lg\" value=\"Submit\"></input>");
        }
        else {
            $("#interface").append("<input id=\"continue\" class=\"btn btn-success btn-lg\" type=\"button\" value=\"Next\"></input>");
        }
    }
}
});

    $("#container").on("click", "#back", function(){ 
        tracker--;
        $("#container").empty();
        $("#container").append("<h2>Hi " + username + "! " + quiz.questions[tracker].text + "</h2>").hide().fadeIn(1000);
        $("#container").append("<div class=\"col-md-6 col-md-offset-3 radio choices\" id=\"interface\">");
        for(i = 0; i < quiz.questions[tracker].answers.length; i++){
            if (currentAnswers[tracker] == i) {
                $("#interface").append("<input type=\"radio\" name=\"answer\" checked=\"checked\">" + quiz.questions[tracker].answers[i] + "<br>"); 
            }
            else {
                $("#interface").append("<input type=\"radio\" name=\"answer\">" + quiz.questions[tracker].answers[i] + "<br>");
            }
        }
        $("#interface").append("<br>");
        if(tracker > 0){
            $("#interface").append("<input id=\"back\" type=\"button\" class=\"btn btn-warning btn-lg\"value=\"Back\"></input>");  
        }
        if(tracker == (quiz.questions.length - 1)) {
            $("#interface").append("<input id=\"grade\" type=\"button\" class=\"btn btn-primary btn-lg\" value=\"Submit\"></input>");
            getImg("\""+quiz.questions[questsToUse[currentPage]].meta_tags[0]+"\",\""+quiz.meta_tags[0]+"\",-\"lego\",-\"legos\"");
        }
        else {
            $("#interface").append("<input id=\"continue\" class=\"btn btn-success btn-lg\" type=\"button\" value=\"Next\"></input>");
        }
    });

    $("#container").on("click", "#grade", function(){ 
        saveAnswer(); 
        var grade = gradeQuiz(); 
        var gradeArray = gradeQuizArrayReturned();
        var myJsonString = JSON.stringify(quiz);
        console.log(myJsonString);
        var myRealJsonString = JSON.parse(myJsonString);
        console.log(myRealJsonString);

        $.ajax({
          method: "POST",
          url: "/quiz",
          data: myRealJsonString
        })
          .done(function(msg) {
            console.log( "Data Saved: " + msg );
          });

        $("#container").empty();
        $("#container").append("<h2>Hi " + username + "! Congratulations on completing that quiz. You scored " + grade + " from " + (quiz.questions.length) + " correct.</h2>").hide().fadeIn(1000);
       

        var data = [((grade)/(quiz.questions.length))*360, ((quiz.questions.length - grade)/(quiz.questions.length))*360];
        var labels = ["correct","wrong"];
        var colors = ["#33CC33","#CC0000"];
        $("#container").append("<br><br><br><center><canvas id=\"piechart\" width=\"250\" height=\"250\"> This text is displayed if your browser does not support HTML5 Canvas.</canvas><center>");
        canvas = document.getElementById("piechart");
        var context = canvas.getContext("2d");
        for (var i = 0; i < data.length; i++) {
        drawSegment(canvas, context, i, data, colors, labels);
        }
    });
});




function validateForm() { //validates text input; makes sure you put something in
    var usernameElement = document.getElementById('NameProtocol');
    username = $("#NameProtocol").val();
    if (usernameElement.value == null | usernameElement.value == "") {
        return false;
    }
    else {
        return true;
    }
}

function validateAnswer() { //validates radio button selection
    if ($("input[name='answer']").is(':checked')){
        return true;
    }
    else {
        return false;
    }
}

function saveAnswer() { //when you click next, answer choices saved to an array that is used for grading later on
    var tempArray = $("input[name='answer']").toArray();
    for(var j = 0; j < $("input[name='answer']").length; j++) {
        if (tempArray[j].checked == true) {
            currentAnswers[tracker] = j;
        }
    }
}

function gradeQuiz() { //compares the answer array to json's correct answers.
    var questionsRight = 0;
    for (var x = 0; x < currentAnswers.length; x++) {
        if (currentAnswers[x] == quiz.questions[x]["correct_answer"]){
            questionsRight++;
            console.log("Water" + currentAnswers[x]);
        }
    }
    return questionsRight;
}


function gradeQuizArrayReturned() {
    var questionsRightArray = [];
    for (var x = 0; x < currentAnswers.length; x++) {
        if (currentAnswers[x] == quiz.questions[x]["correct_answer"]){
            questionsRightArray[x] == '1';
            quiz.questions[x]["global_correct"]++;
            console.log("water2" + questionsRightArray);
        }
        else {
            questionsRightArray[x] == '0';
            console.log("water3" + questionsRightArray);
        }
    quiz.questions[x]["global_total"]++;
    console.log(quiz);
    }
    return questionsRightArray;
}

function drawSegment(canvas, context, i, data, colors, labels) { //pie chart stuff
    context.save();
    var centerX = Math.floor(canvas.width / 2);
    var centerY = Math.floor(canvas.height / 2);
    radius = Math.floor(canvas.width / 2);

    var startingAngle = degreesToRadians(sumTo(data, i));
    var arcSize = degreesToRadians(data[i]);
    var endingAngle = startingAngle + arcSize;

    context.beginPath();
    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, radius, 
                startingAngle, endingAngle, false);
    context.closePath();

    context.fillStyle = colors[i];
    context.fill();

    context.restore();

    drawSegmentLabel(canvas, context, i, labels, data);
}

function getImg(tag) { //Flickr stuff
    var imgObject;   
    console.log(tag);
    
    $.getJSON("https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=1d9714e46278a986d2bb40bc40baf11c&tags="+tag+"&tag_mode=all&privacy_filter=1&per_page=50&format=json&nojsoncallback=1").done( function(data) {
    imgObject = data;
    console.log(imgObject);
        
    var choice = randomInt(0, imgObject.photos.photo.length-1);
    console.log(choice);

    nSrc = "https://farm"+imgObject.photos.photo[choice].farm+".staticflickr.com/"+imgObject.photos.photo[choice].server+"/"+imgObject.photos.photo[choice].id+"_"+imgObject.photos.photo[choice].secret+"_z.jpg"
    
    console.log(nSrc);
    
    $('#flickImg').attr('src', nSrc); 
        
    });
}

function degreesToRadians(degrees) {
    return (degrees * Math.PI)/180;
}

function sumTo(a, i) {
    var sum = 0;
    for (var j = 0; j < i; j++) {
      sum += a[j];
    }
    return sum;
}

function drawSegmentLabel(canvas, context, i, labels, data) {
   context.save();
   var x = Math.floor(canvas.width / 2);
   var y = Math.floor(canvas.height / 2);
   var angle = degreesToRadians(sumTo(data, i));

   context.translate(x, y);
   context.rotate(angle);
   var dx = Math.floor(canvas.width * 0.5) - 10;
   var dy = Math.floor(canvas.height * 0.05);

   context.textAlign = "right";
   var fontSize = Math.floor(canvas.height / 25);
   context.font = fontSize + "pt Arial";

   context.fillText(labels[i], dx, dy);

   context.restore();
}
