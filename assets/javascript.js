// INITIALIZE FIREBASE
var config = {
  apiKey: "AIzaSyC5hdMO9KuQcj0MXvZUT62F-SylGGJDbyo",
  authDomain: "memematchmaker.firebaseapp.com",
  databaseURL: "https://memematchmaker.firebaseio.com",
  projectId: "memematchmaker",
  storageBucket: "memematchmaker.appspot.com",
  messagingSenderId: "433999765554"
};
firebase.initializeApp(config);
// DECLARE FIREBASE VARIABLE
var database = firebase.database();
// DECLARE CORS ANYWHERE
var corsAnywhere = "https://cors-anywhere.herokuapp.com/";


// GLOBAL VARIABLES
var keyword;
var submittedImage;
var memeArray = [];
var genID;
var imgID;

// SET UP SCREEN BY HIDING ELEMENTS
$("#loadingGif").hide();
$("#knowyourmeme").hide();


// PULL RECENTLY GENERATED MEMES FROM FB 
// DISPLAY THEM AS IMAGES 
database.ref().on("child_added", function (snapshot) {
  memeArray.push(snapshot.val().meme);
  displayRecentMemes();
});


// DISPLAY THE 5 MOST RECENT MEMES BY TARGETING LAST 5 MEMES IN ARRAY FROM FIREBASE
function displayRecentMemes() {
  var useArray = (memeArray.slice(-5));

  // DISPLAY THEM
  $("#recentmeme1").attr("src", useArray[0]);
  $("#recentmeme2").attr("src", useArray[1]);
  $("#recentmeme3").attr("src", useArray[2]);
  $("#recentmeme4").attr("src", useArray[3]);
  $("#recentmeme5").attr("src", useArray[4]);
};


// ON CLICK FXN FOR EXAMPLE IMAGES
$(document).ready(function () {
  $("img").on("click", function picClick() {
    // $("#memeDump").empty();
    $("#loadingGif").show();
    // get the url of the site
    submittedImage = $(this).attr("src");
    displayYourImage(submittedImage);
    analyzePhoto();
  })
});


// ON CLICK FXN FOR SUBMIT BUTTON
$(document).ready(function () {
  $("#submit-image").on("click", function (e) {
    e.preventDefault();

    // VALIDATE USER INPUT
    if (!$("#image-input").val()){
      var x = document.getElementById("toast");
      x.className = "show";
      setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }
    // GRAB SUBMITTED IMAGE URL
    submittedImage = $("#image-input").val().trim();
    $("#loadingGif").show();

    // RUN THROUGH APIS
    analyzePhoto();
    
    displayYourImage(submittedImage);
    var firstFive=submittedImage.slice(0,5);
    if (firstFive!="https"){
      var x = document.getElementById("toast");
      x.className = "show";
      setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }
    // CLEAR TEXT BOX
    $("#image-input").val("");

  })
})

// ON CLICK TO ADD CAPTION
$(document).ready(function () {
  $("#addcaption").on("click", function (e) {
    e.preventDefault();
    $("#loadingGif").show();
    // RUN CAPTION FUNCTION
    addCaption();
  })
})

// FUNCTION TO DISPLAY THE SUBMITTED IMAGES
function displayYourImage(source) {
  $("#yourImageDump").empty();
  // CREATE NEW IMAGE
  var yourImg = $("<img>");
  yourImg.attr("id", "your-pic");
  // ATTRIBUTE SRC IS THE URL THAT THEY SUBMITTED OR THE URL OF CLICKED IMAGE
  yourImg.attr("src", source);
  $("#yourImageDump").append(yourImg);
}

// DISPLAYS AN ERROR IF API DOESN'T WORK PROPERLY
$( document ).ajaxError(function() {
  {
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
  }});


// FUNCTION FOR API FACE++
function analyzePhoto() {
  $("#memeDump").empty();

  // API KEY JmLDfiZvxIblQdZh4RM0o_bKDTpIxI2p
  // VARIABLES
  var imageURL = submittedImage
  var queryURL = corsAnywhere + "https://api-us.faceplusplus.com/facepp/v3/detect"
  // AJAX
  $.ajax({
    url: queryURL,
    method: "POST",
    data: {
      api_key: "JmLDfiZvxIblQdZh4RM0o_bKDTpIxI2p",
      api_secret: "xxtvkuHADWC1zeyuKyRDYNTf2FHffqWX",
      image_url: imageURL,
      return_attributes: "emotion",
    }
  }).then(function (response) {
    emotionsArray = ["anger", "disgust", "fear", "happiness", "neutral", "sadness", "surprise"]
    // var highestNumber = _(response.faces[0].attributes.emotion).values().max();
    obj = (response.faces[0].attributes.emotion);
    /// GET KEY FROM HIGHEST VALUE
    var maxKey = _.maxBy(Object.keys(obj), o => obj[o]);
    keyword = maxKey;
    // RUN THIS KEY THROUGH THE MEME GENERATOR
    generateMeme(keyword);
  });
};


// FUNCTION FOR API - MEMEGENERATOR
function generateMeme(word) {
  // API KEY 9aa77d63-bbeb-4dba-ab33-cccbec5e6419
  console.log(word);
  // PUT KEY WORD INTO SEARCH FOR MEME
  var queryURL = corsAnywhere + "http://version1.api.memegenerator.net/Generators_Search?q=" + word + "&apiKey=9aa77d63-bbeb-4dba-ab33-cccbec5e6419";
  console.log(queryURL)
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function (response) {
    console.log(response);
    $("#loadingGif").hide();
    $("#knowyourmeme").show();

    // EMPTY CURRENT MEME IMAGE 
    $("#memeDump").empty();
    // // CREATE NEW IMAGE
    var yourMeme = $("<img>");
    
    yourMeme.attr("id", "your-meme");
    // // TARGET URL FROM RESPONSE
    var i = Math.floor((Math.random() * 11) + 0);
    var memeURL = response.result[i].imageUrl;
    // // CHANGE SOURCE TO NEW MEME URL
    yourMeme.attr("src", memeURL);
    $("#downloadlink").attr("href", memeURL);

    // // APPEND TO DIV TO SHOW ON HTML
    $("#memeDump").append(yourMeme);

    // ADD MEME NAME
    var memeName = $("<p>")
    genID = response.result[i].generatorID;
    imgID = response.result[i].imageID;

    // DISPLAY NAME OF MEME
    name = response.result[i].displayName.toUpperCase();
    memeName.text(name);
    $("#memeDump").append(memeName);

    submittedImage = $("#image-input").val().trim();

    // ASSIGN NEW MEMES TO FIREBASE
    var newMeme = {
      meme: memeURL,
    };
    database.ref().push(newMeme);
  }).catch(function (err) {
    console.log(err);
  });
}


// FUNCTION TO ADD CAPTION
function addCaption() {
  // GRAB TEXT THAT USER INPUTTED
  text0 = $("#text0").val();
  text1 = $("#text1").val();

  // API KEY 9aa77d63-bbeb-4dba-ab33-cccbec5e6419
  var queryURL = corsAnywhere + "http://version1.api.memegenerator.net//Instance_Create?languageCode=en&generatorID=" + genID + "&imageID=" + imgID + "&text0=" + text0 + "&text1=" + text1 + "&apiKey=9aa77d63-bbeb-4dba-ab33-cccbec5e6419";
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function (response) {
    console.log(response);
    $("#loadingGif").hide();
    // GRAB NEW URL FOR CAPTIONED PHOTO
    var newURL = response.result.instanceImageUrl;

    // CREATE IMAGE TO PLACE CAPTIONED MEME IN 
    $("#memeDump").empty();
    var yourMeme = $("<img>");
    yourMeme.attr("id", "your-meme");
    yourMeme.attr("src", newURL);
    $("#memeDump").append(yourMeme);

    $("#downloadlink").attr("href", newURL);
    // EMPTY USER TEXT BOXES
    text0 = $("#text0").val("");
    text1 = $("#text1").val("");
    
  }).catch(function (err) {
    console.log(err);
  });
};