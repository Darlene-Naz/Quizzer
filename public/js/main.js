 var counter = 1;
 var limit = 10;
 console.log(window.location.search);

 function addInput() {

     if (counter == limit) {
         alert("You have reached the limit of adding " + counter + " questions");
         return false;
     } else {
         var newdiv = document.createElement('div');
         newdiv.setAttribute("class", "card");
         newdiv.setAttribute("name", "qset" + (counter + 1));
         newdiv.innerHTML = "<div class=card-body><div class=wrapper><input class=input id=" + "q" + (counter + 1) + " placeholder= 'Untitled Question' type=text style=font-size:18px; required><span class=underline></span></div><label class=input-container style=width:100%;><i class='fa fa-circle-o icon'></i><input type=text id=" + "q" + (counter + 1) + "opt1" + " class=form-control placeholder='Option 1' required></label><label class=input-container style=width:100%;><i class='fa fa-circle-o icon'></i><input type=text id=" + "q" + (counter + 1) + "opt2" + " class=form-control placeholder='Option 2' required></label><label class=input-container style=width:100%;><i class='fa fa-circle-o icon'></i><input type=text id=" + "q" + (counter + 1) + "opt3" + " class=form-control placeholder='Option 3' required></label><label class=input-container style=width:100%;><i class='fa fa-circle-o icon'></i><input type=text id=" + "q" + (counter + 1) + "opt4" + " class=form-control placeholder='Option 4' required></label><label class=input-container style=width:100%;><i class='fa fa-check-circle icon'></i><input type=text id=" + "q" + (counter + 1) + "ans" + " class=form-control placeholder='Answer' required></label></div><div class=card-footer align=right><a href=# data-toggle=tooltip data-placement=bottom title='Add question' style=margin-right:3px id=addCard onclick='return addInput();'><i class='fa fa-plus-circle fa-2x'></i></a><span data-toggle=tooltip data-placement=bottom title='Delete question'><i class='fa fa-trash fa-2x'></i></span></div>";
         document.getElementById('dynamicInput').appendChild(newdiv);
         counter++;
         return false;
     }
 }

 function createQuiz() {

     var no_of_qset = counter;

     var qset = [];

     var title = document.getElementById("title").value;

     var desc = document.getElementsByName("desc").value;


     for (let index = 0; index < no_of_qset; index++) {
         var q = 'q' + (index + 1);
         var opt1 = "q" + (index + 1) + "opt1";
         var opt2 = "q" + (index + 1) + "opt2";
         var opt3 = "q" + (index + 1) + "opt3";
         var opt4 = "q" + (index + 1) + "opt4";
         var ans = "q" + (index + 1) + "ans";

         qset.push({
             question: document.getElementById(q).value,
             opt1: document.getElementById(opt1).value,
             opt2: document.getElementById(opt2).value,
             opt3: document.getElementById(opt3).value,
             opt4: document.getElementById(opt4).value,
             answer: document.getElementById(ans).value
         });
     }

     axios.post('/topic/' + document.getElementById('myid').value, {
         Title: title,
         Description: desc,
         Qset: qset
     }).then(function(response) {
         console.log(response);
     }).catch(function(error) {
         console.log(error);
     });
 }

 function setColor(x, val) {

     var property = document.getElementById('b' + x + val);
     property.style.backgroundColor = "#8064A2"

     for (var i = 1; i < 5; i++) {
         if (x != i) {
             var property = document.getElementById('b' + i + val);
             property.style.backgroundColor = "#428bca"
         }
     }

 }

 function evaluateQuiz() {
     console.log("initial answers" + answers);
     for (var i = 0; i < no_of_qset; i++) {

         var options = document.getElementsByName('q' + i);
         console.log(options);
         for (var x = 0; x < options.length; x++) {
             if (options[x].checked) {
                 console.log(options[x].value);
                 answers[i] = options[x].value;
             }
         }
     }
     console.log("final answers" + answers);

     axios.post('/quizup/' + document.getElementById('myid').value, {
         answers: answers
     }).then(function(response) {
         console.log(response);
     }).catch(function(error) {
         console.log(error);
     });
 }