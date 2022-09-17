
var submitQuestionNode = document.getElementById('submitBtn');
var questionTitleNode = document.getElementById('subject');
var questionDescriptionNode = document.getElementById('question');
var questionList = document.getElementById('dataList');
var createQuestionFormNode = document.getElementById('toggleDisplay');

var questionDetailContainerNode = document.getElementById("respondQuestion");

var resolveQuestionContainerNode = document.getElementById('resolveHolder');

var resolveQuestionNode = document.getElementById('resolveQuestion');

var responseContainerNode = document.getElementById('respondAnswer');
var commentConainerNode = document.getElementById('commentHolder');
var commentatorNameNode = document.getElementById('pickName');
var commentNameNode = document.getElementById('pickComment');
var submitCommentNode = document.getElementById('commentBtn');

var upVoteBtn = document.getElementById('upVote');
var downVoteBtn = document.getElementById('downVote');

var newFormbtn = document.getElementById('newQuestionForm');
var rightPanel = document.getElementById('rightPanel');

// var favoritebtn = document.getElementById('fav');

newFormbtn.addEventListener('click', hideRighLeftPanelDetails());

var questionSearch = document.getElementById('questionSearch');

questionSearch.addEventListener('keyup', function (event) {
    questionList.innerHTML = "";
    filterResult(event.target.value);
});

// var shown=true;
function filterResult(Searchquestion) {
    if (Searchquestion) {
        var questions = JSON.parse(localStorage.getItem('question'));
        var filteredques = questions.filter(function (question) {
            if (question.title.includes(Searchquestion)) {
                return true;
            }
        });

        if (filteredques.length) {
            filteredques.forEach(function (question) {
                addQuestionToLeftPanel(question);
            });
        }
        else {
            // addQuestionToLeftPanel({ title: "NO Match Found", description: "" });
            questionList.appendChild(createContainer({ title: "NO Match Found", description: "" }))
        }
    }
    else {
        var questions = JSON.parse(localStorage.getItem('question'));
        questions.forEach(function (question) {
            addQuestionToLeftPanel(question);
        });
    }
}


function onlaod() {
    // get question from Storage
    getAllQuestionFromServer(function (allQuestionStored) {
        if (allQuestionStored != null)
            allQuestionStored.forEach(function (question) {
                addQuestionToLeftPanel(question);
            });
    })
}
onlaod()

// listen for submit button to create question
submitQuestionNode.addEventListener('click', onQuestionSubmit);

function onQuestionSubmit() {
    // create question
    var question = createResponse(questionTitleNode, questionDescriptionNode);
    // question.response = [];
    // question.downvote = 0;
    // question.upvote = 0;
    // question.date = new Date().getTime();
    // question.favorite = 0;

    //save question to storage;
    saveQuestion(question);

    questionTitleNode.value = "";
    questionDescriptionNode.value = "";
}

//function to create a question and comment object
function createResponse(a, b) {
    obj={ title: a.value, description: b.value , response : [], downvote : 0 , upvote : 0, data: new Date().getTime(), favorite : 0 };
    return obj;
}

// saving question to storage;

function saveQuestion(question) {

    console.log("question : "+question);
    
    getAllQuestionFromServer(function (storedQuestionArray) {
        
        console.log("stored question : "+storedQuestionArray); 

        if (storedQuestionArray == null || storedQuestionArray.length==0) {
            storedQuestionArray = [];
        }
        storedQuestionArray.push(question);
        postRequest(storedQuestionArray);

        addQuestionToLeftPanel(question)
    });

}

function postRequest(storedQuestionArray) {

    console.log("posted query" + storedQuestionArray);
    localStorage.setItem('queries',JSON.stringify(storedQuestionArray));


    // localStorage.setItem('queries',storedQuestionArray);
    // // var request = new XMLHttpRequest();

    // // request.open('POST', 'https://storage.codequotient.com/data/save');
    // // request.setRequestHeader('Content-Type', 'application/json');


    // // body = {
    // //     data: JSON.stringify(storedQuestionArray)
    // // }

    // // request.send(JSON.stringify(body));

    // // request.addEventListener('load', function () {
    // // })
}

function getAllQuestionFromServer(onResponse) {

    var h=JSON.parse(localStorage.getItem('queries'));

    console.log("type of "+typeof h);
    console.log("data "+h);
    

    for(i=0;h!=null && i<h.length ;i++)
    {
        console.log(h[i].title);
    }
    onResponse(h);

    // onResponse(JSON.parse(localStorage.getItem('queries')));
    // var request = new XMLHttpRequest();
    // request.open('GET', 'https://storage.codequotient.com/data/get')
    // request.send();
    // request.addEventListener('load', function () {
    //     var arr = JSON.parse(request.responseText);
    //     onResponse(JSON.parse(arr.data));
    // });
}




// append question to left panel
function addQuestionToLeftPanel(question) {

    var container = createContainer(question);

    // console.log(container)
    container = addvoteDetails(container, "upvote", question);
    container = addvoteDetails(container, "downvote", question);

    // add time;
    container = addTime(container, question);

    container = addFavorate(container, question);
    container.addEventListener('click', onQuestionClick(question));

    questionList.appendChild(container);
}

// Add time;
function addTime(conatiner, question) {
    var x = document.createElement('p');
    x.innerHTML = getTimeOfAdd(question);
    // set interval make real time to show
    setInterval(() => {
        // for update time real time;
        x.innerHTML = getTimeOfAdd(question);
    }, 1000);

    conatiner.appendChild(x);
    return conatiner;
}

function getTimeOfAdd(question) {
    var d = new Date();
    var cd = new Date(question.date);

    var time = parseInt(d.getTime() / 1000 - cd.getTime() / 1000);
    // console.log(time);

    if (time < 60) {
        return "Added " + time + "seconds ago";
    }
    else if (time > 60 && time < 3600) {
        return "Added " + parseInt(time / 60) + "min ago";
    }
    else if (time >= 3600 && time < 24 * 3600) {
        return "Added " + parseInt(time / 3600) + "day ago";
    }
    else {
        return "Added " + parseInt(d.getTime() / (1000 * 60 * 60 * 24) - question.date / (1000 * 60 * 60 * 24)) + " day ago";
    }

}

// add favourate bttn
function addFavorate(container, question) {
    var x = document.createElement('button');

    if (question.favorite == 1)
        x.innerHTML = 'Remove Fav';
    else {
        x.innerHTML = 'Add Fav'
    }

    x.onclick = onfavorateClick(question);

    container.appendChild(x);
    return container;
}

function onfavorateClick(question) {


    return function (event) {

        event.stopPropagation();
        getAllQuestionFromServer(function(arr){
            arr.map(function (quest) {
                if (quest.title === question.title) {
                    if (quest.favorite == 1) {
                        quest.favorite = 0;
                        question.favorite = 0;
                    }
                    else {
                        quest.favorite = 1;
                        question.favorite = 1;
                    }
                }
    
            });
    
            // console.log(arr);
            var x = document.getElementById(question.title);
    
            if (question.favorite == 1)
                x.children[5].innerHTML = 'Remove Fav';
            else {
                x.children[5].innerHTML = 'Add fav';
            }
    
            arr.sort(function (a, b) {
                if (a.favorite > b.favorite) {
                    return -1;
                }
            });
    
           postRequest(arr);
        });     
    }

}



// fxn for upvote and downvote

function addvoteDetails(container, voteFor, question) {
    var x = document.createElement('h4');
    x.innerHTML = voteFor + ":" + question[voteFor];
    container.appendChild(x);

    return container;
}

// creating question div
function createContainer(question) {
    var container = document.createElement('div');
    var newQuestionTitleNode = document.createElement('h4');
    newQuestionTitleNode.innerText = question.title;

    var newQuestionDescriptionNode = document.createElement('p');
    newQuestionDescriptionNode.innerText = question.description;

    container.appendChild(newQuestionTitleNode);
    container.appendChild(newQuestionDescriptionNode);
    container.style.background = "red";

    container.setAttribute('id', question.title);
    return container;
}

// listen for click on question and display in right pane
function onQuestionClick(question) {
    // console.log("1",question);
    return function () {
        hideQuestionForm();

        visibleResponseForm();
        // console.log("2",question)
        clearResponseForm();

        //clearDetail of
        removeDetailsRespons();
        // showing previous repsonse;
        showPreviousResponse(question);

        addQuestionToRight(question);

        // listining to response save
        submitCommentNode.onclick = onResponseSubmit(question);

        upVoteBtn.onclick = onVoteclick(question, "upvote");
        downVoteBtn.onclick = onVoteclick(question, "downvote");

        resolveQuestionNode.onclick = onResolveClick(question);
        favoritebtn.onclick = onfavorateClick(question);
    }
}

function onResolveClick(question) {
    return function () {
        var x = document.getElementById(question.title);
        erraseFromStorage(question);
        clearResponseForm();
        x.innerHTML = ""
    }

}

function erraseFromStorage(questionToDelete) {
    getAllQuestionFromServer(function(arr){
        var x = arr.filter(function (question) {
            if (question.title == questionToDelete.title) {
                return false;
            }
            else {
                return true;
            }
        });
        postRequest(x);
    })
}

function onVoteclick(question, voteFor) {

    return function () {
        if (voteFor === "upvote") {

            // console.log(question);
            question.upvote++;
        }
        else {
            question.downvote++;
        }
        changeUiForVote(question);
        updateQuestionOnVote(question);
    }
}


function changeUiForVote(question) {

    var x = document.getElementById(question.title);

    console.log(x);
    x.children[2].innerHTML = question.upvote;
    x.children[3].innerHTML = question.downvote;

}


// showing previous response
function showPreviousResponse(question) {
    var responses = question.response;
    responses.forEach(function (response) {
        addResponseToPanel(response);
    })

}

//  listen for click on submit response button

function onResponseSubmit(question) {
    return function () {
        var comment = createResponse(commentatorNameNode, commentNameNode);
        var container = createContainer(comment);
        addResponseInPanel(container);
        
        saveResponse(question, comment);
    }
}
// saving Response Question
function saveResponse(updateQuestion, comment) {

    getAllQuestionFromServer(function(SavedQuestion){

        var x = SavedQuestion.map(function (questions) {
            if (questions.title == updateQuestion.title) {
                questions.response.push({
                    title: comment.title,
                    description: comment.description
                });
            }
            return questions;
        });

        postRequest(x);
    })
}

// display response in response button
function addResponseInPanel(comment) {
    // console.log(comment);
    responseContainerNode.appendChild(comment);
}


// Hide question Form
function hideQuestionForm() {
    createQuestionFormNode.style.display = 'none';
}


// display question details
function visibleResponseForm() {
    rightPanel.style.display = 'block';
}

function hideRighLeftPanelDetails() {
    return function () {
        createQuestionFormNode.style.display = 'block';
        rightPanel.style.display = 'none';
    }
}


// add details of question to right
function addQuestionToRight(question) {
    var questionTitle = document.createElement('h4');
    questionTitle.innerHTML = question.title;

    var description = document.createElement('p');
    description.innerHTML = question.description;

    questionDetailContainerNode.appendChild(questionTitle);
    questionDetailContainerNode.appendChild(description);
}


// clear Question on right;
function clearResponseForm() {
    questionDetailContainerNode.replaceChildren("");
}

function addResponseToPanel(repsonse) {
    var conatiner = createContainer(repsonse);
    responseContainerNode.appendChild(conatiner);
}
function removeDetailsRespons() {
    responseContainerNode.innerHTML = "";
}


function updateQuestionOnVote(updatequestionvote) {

    getAllQuestionFromServer(function(arr){
        arr.map(function (question) {
            if (question.title == updatequestionvote.title) {
                question.upvote = updatequestionvote.upvote;
                question.downvote = updatequestionvote.downvote;
            }
        });
        postRequest(arr);
    });

}
