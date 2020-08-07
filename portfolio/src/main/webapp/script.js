// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

let editMarker;
let map;

/**
 * Runs the methods necessary to initialize the page.
 */
function init() {
  fetchBlobstoreUrl();
  initMap();
}

/**
 * Gets the Blobstore upload URL.
 */
function fetchBlobstoreUrl() {
  fetch('/blobstore-upload-url').then(response => response.text()).then(blobstoreUploadUrl => {
    const editLocationForm = document.getElementById('edit-location');
    editLocationForm.action = blobstoreUploadUrl;
  });
}

/**
 * Initializes the map in the "Favorite Places" tab.
 */
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.8075, lng: -73.9626},
    mapTypeId: 'hybrid',
    tilt: 45,
    zoom: 8
  });

  map.addListener('click', (event) => {
    displayLocationEditor(event);
  });

  map.addListener('dragstart', () => {
    hideMoreInfo();
    if (editMarker) {
      editMarker.setMap(null);
    }
  });

  const icons = {
    scenery: {icon: "/images/mountain-icon.png"},
    city: {icon: "/images/city-icon.png"},
    beach: {icon: "/images/beach-icon.png"} 
  }

  const places = [
    {
      pos: new google.maps.LatLng(45.704010, -121.544031),
      id: 'hood-river',
      type: 'scenery'
    }, {
      pos: new google.maps.LatLng(37.795320, -122.403273),
      id: 'san-francisco',
      type: 'city'
    }, {
      pos: new google.maps.LatLng(13.743670, 100.558230),
      id: 'bangkok',
      type: 'city'
    }, {
      pos: new google.maps.LatLng(40.741907, -73.989114),
      id: 'manhattan',
      type: 'city'
    }, {
      pos: new google.maps.LatLng(44.720848, -110.488581),
      id: 'yellowstone',
      type: 'scenery'
    }, {
      pos: new google.maps.LatLng(47.629421, -122.360096),
      id: 'seattle',
      type: 'city'
    }, {
      pos: new google.maps.LatLng(49.286606, -123.117854),
      id: 'vancouver',
      type: 'city'
    }, {
      pos: new google.maps.LatLng(64.145680, -21.929202),
      id: 'iceland',
      type: 'scenery'
    }, {
      pos: new google.maps.LatLng(21.289815, -157.851764),
      id: 'honolulu',
      type: 'beach'
    }, {
      pos: new google.maps.LatLng(35.361579, 138.729609),
      id: 'fuji',
      type: 'scenery'
    }
  ];

  for (var i = 0; i < places.length; i++) {
    const currentMarker = places[i];
    var marker = new google.maps.Marker({
      position: places[i].pos,
      id: places[i].id,
      icon: icons[places[i].type].icon,
      map: map 
    });
    marker.addListener('click', () => {
      map.panTo(currentMarker.pos);
      displayMoreInfo(currentMarker.id);
    });
  };
  fetchMapMarkers();
}

/*
 * Displays the selected tab on the homepage.
 */
function displayTab(event, tabName) {
  hideMoreInfo();
  resetEasterEgg();
    
  var buttonContainer = document.getElementsByClassName("tabs")[0];
  buttonContainer.style.borderBottomLeftRadius = "0";
  buttonContainer.style.borderBottomRightRadius = "0";

  var tabInfo = document.getElementsByClassName("tab-info");
  for (var i = 0; i < tabInfo.length; i++) {
    tabInfo[i].style.display = "none";
  }

  var tabButtons = document.getElementsByClassName("tab-button");
  for (var i = 0; i < tabButtons.length; i++) {
    tabButtons[i].className = tabButtons[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  event.currentTarget.className += " active";

  if (tabName === "Interests") {
    drawTimeline();
  } else if (tabName === "Comments") {
    fetchComments(document.getElementById("max-comments").value);
  } else if (tabName === "Favorite Places") {
    fetchMapMarkers();
  }
}

/*
 * Displays the timeline animation on the Interests tab.
 */
function drawTimeline() {
  // Resets branches and images to their starting positions.
  hideImages();
  hideBranches();

  var timeline = document.getElementById("timeline");
  var movingEndpoint = document.getElementById("moving-endpoint")

  // Moves the right end of the timeline, resulting in the left-to-right animation.
  var timelineRightPosition = 95;

  // Moves the "Present" endpoint to the right as the timeline expands.
  var endpointLeftPosition = 97 - timelineRightPosition;

  // Controls the direction of each branch's animation (true expands up, false expands down).
  var branchUp = true;

  // Triggers each branch's animation at the appropriate point in the timeline's expansion.
  var branchTriggers = {
    6: "astronomy",
    22: "geography",
    38: "tornadoes",
    54: "architecture",
    70: "photography",
    86: "compsci"
  }

  var timelineAnimation = setInterval(extendTimeline, 20);
  function extendTimeline() {
    // Stops the timeline's animation.
    if (timelineRightPosition <= 5) {
      clearInterval(timelineAnimation);
    } else {
      // Increments the positions of the timeline and endpoint, and sets their respective HTML style attributes.
      timelineRightPosition -= 0.5;
      endpointLeftPosition = 97 - timelineRightPosition;
      timeline.style.right = timelineRightPosition + "%";
      movingEndpoint.style.left = endpointLeftPosition + "%";

      // Animates the branches once the timeline reaches their trigger points.
      if (endpointLeftPosition in branchTriggers) {
        // Displays the branch's image.
        displayImage(branchTriggers[endpointLeftPosition]);

        // Starts the branch's animation.
        displayTimelineBranch(branchTriggers[endpointLeftPosition], branchUp);

        // Flips the animation direction for the next branch, resulting in branches that alternate between up and down.
        branchUp = !branchUp;
      }
    }
  }
}

/*
 * Sets display for the images on the Interests tab to "none".
*/
function hideImages() {
  var interestImages = document.getElementsByClassName("timeline-branch")
  for (var i = 0; i < interestImages.length; i++) {
    interestImages[i].getElementsByTagName("IMG")[0].style.display = "none";
  }
}

/*
 * Sets display for a given image to "block".
 */
function displayImage(imageID) {
  picDiv = document.getElementById(imageID);
  pic = picDiv.getElementsByTagName("IMG")[0];
  pic.style.display = "block";
}

/*
 * Handles branching animation off of the timeline.
 */
function displayTimelineBranch(branchName, branchUp) {
  var branch = document.getElementById(branchName);

  // Depending on the value of branchUp, this changes either the "top" or "bottom" attribute of the branch.
  var positionToExtend = 50;

  var branchAnimation = setInterval(extendTimelineBranch, 20);
  function extendTimelineBranch() {
    // Stop the branch's animation.
    if (positionToExtend <= 5) {
      clearInterval(branchAnimation);
    } else {
      // Increment the position of the branch, resulting in the animation.
      positionToExtend -= 0.5;

      // Animate up by changing the branch's "top" attribute.
      if (branchUp === true) {
        branch.style.top = positionToExtend + "%";
      // Animate down by changing the branch's "bottom" attribute.
      } else {
        branch.style.bottom = positionToExtend + "%";
      }
    }
  }
}

/*
 * Hides each branch of the timeline.
 */
function hideBranches() {
  var branches = document.getElementsByClassName("timeline-branch");
  for (var i = 0; i < branches.length; i++) {
    branches[i].style.top = "50%";
    branches[i].style.bottom = "50%";
  }
}

/** 
 * Displays the editor to add a new location to the map.
 */
function displayLocationEditor(event) {
  if (editMarker) {
    editMarker.setMap(null);
  }
  editMarker = new google.maps.Marker({
    position: event.latLng,
    icon: "/images/pencil-icon.png"
  });
  editMarker.setMap(map)
  map.panTo(editMarker.position);

  document.getElementById("lat").value = editMarker.getPosition().lat();
  document.getElementById("lng").value = editMarker.getPosition().lng();
  displayMoreInfo('create-marker');
}

/**
  * Fetches user-created markers from the Datastore, and adds them to the map.
 */
function fetchMapMarkers() {
  document.getElementById('user-locations').innerHTML = '';
  fetch('/location').then(response => response.json()).then(data => {
    for (var i = 0; i < data.length; i++) {
      addMarker(data[i]);
    }
  });
}

/**
 * Helper method that creates a new marker.
 */
function addMarker(markerData) {
  var marker = new google.maps.Marker({
    position: {lat: parseFloat(markerData[1]), lng: parseFloat(markerData[2])},
    map: map
  });
  marker.addListener('click', () => {
    displayMoreInfo(markerData[0]);
    map.panTo(marker.position);
  });

  var userLocations = document.getElementById('user-locations');
  userLocations.appendChild(createMarkerHtmlInfo(markerData));
}

/**
 * Helper method that returns a returns the HTML elements that make up a marker's more info tab.
 */
function createMarkerHtmlInfo(markerData) {
  console.log(markerData);
  var container = document.createElement('div');
  container.className = "more-info";
  container.id = markerData[0];

  var title = document.createElement('h2');
  title.innerText = markerData[4];

  var creator = document.createElement('h3');
  creator.innerText = "Added by " + markerData[3];

  var description = document.createElement('p');
  description.innerText = markerData[6];

  const likesContent = document.createElement('div');
  likesContent.className = "likes-content";
  likesContent.appendChild(createLikeButton(markerData[0]));
  likesContent.appendChild(createLikesCounter(markerData[0]));

  container.appendChild(likesContent);
  container.appendChild(title);
  container.appendChild(creator);

  if (markerData[5]) {
    var image = document.createElement('img');
    image.src = markerData[5];
    container.appendChild(image);
  }

  container.appendChild(description);
  return container;
}

/*
 * Displays the specified interest in the More Info window.
 */
function displayMoreInfo(moreInfoName) {
  hideMoreInfo();
  var moreInfoToDisplay = document.getElementById(moreInfoName);
  moreInfoToDisplay.style.display = "block";
}

/**
 * Hides the More Info window.
 */
function hideMoreInfo() {
  var moreInfo = document.getElementsByClassName("more-info");
  for (var i = 0; i < moreInfo.length; i++) {
    moreInfo[i].style.display = "none";
  }
}

/*
 * Changes my head into a bear's head.
 */
function easterEgg() {
  var headshot = document.getElementById("headshot");
  headshot.src = "/images/easteregg.png";
}

/* 
 * Changes my head back to normal. :(
 */
function resetEasterEgg() {
  var headshot = document.getElementById("headshot");
  headshot.src = "/images/beta-headshot.jpg";
}

/**
 * Fetches a comment using DataServlet.java.
 */
function fetchComments(maxComments) {
  fetch('/data?max-comments=' + maxComments).then(response => response.json()).then((entries) => {
    var commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = '';
    for (var i = 0; i < entries.length; i++) {
      commentsContainer.appendChild(createComment(entries[i]));
    }
  });
}

/**
 * Creates a comment with the given message.
 */
function createComment(entry) {
  const comment = document.createElement('div');
  comment.className = "comment";
  comment.id = entry[0];

  const commentContent = document.createElement('div');
  commentContent.className = "comment-content";
  commentContent.appendChild(createAuthor(entry[1], entry[3]));
  commentContent.appendChild(createMessage(entry[2]));

  const commentLikesContent = document.createElement('div');
  commentLikesContent.className = "likes-content";
  commentLikesContent.appendChild(createLikeButton(entry[0]));
  commentLikesContent.appendChild(createLikesCounter(entry[0])); 

  comment.appendChild(commentContent);
  comment.appendChild(commentLikesContent);
  return comment;
}

/**
 * Helper method that creates the author <div> for a comment.
 */
function createAuthor(authorName, commentDate) {
  const author = document.createElement('div');
  author.className = "author";
  author.innerText = authorName + " (" + commentDate + ")";
  return author;
}

/**
 * Helper method that creates the message <div> for a comment.
 */
function createMessage(messageBody) {
  const message = document.createElement('div')
  message.className = "message";
  message.innerText = messageBody;
  return message;
}

/**
 * Helper method that creates the like button <div> for a comment.
 */
function createLikeButton(commentId) {
  const likeButton = document.createElement('div');
  likeButton.className = "heart";
  likeButton.id = commentId + "-button";
  likeButton.onclick = function() { toggleLike(event) };
  return likeButton;
}

/**
 * Helper method that creates the <div> that displays a comment's number of likes.
 */
function createLikesCounter(commentId) {
  const likesCounter = document.createElement('div');
  likesCounter.className = "likes";
  likesCounter.id = commentId + "-likes";
  updateCommentLikeData(commentId);
  return likesCounter;
}

/**
 * Deletes all the comments from the Datastore.
 */
function deleteComments() {
  const request = new Request("/delete-data", {method: 'POST'});
  fetch(request).then(
    fetchComments(0)
  );
}

/**
 * Toggles a like for the specified comment.
 */
function toggleLike(event) {
  const commentId = event.target.id.replace("-button", "");
  const request = new Request("/togglelike?key=" + commentId, {method: 'POST'});
  // The useless parameter below seems to be necessary, because without it, updateCommentLikeData() runs before the then() calls finish.
  // This causes bugs where the color of the like button and the number of likes are displayed incorrectly.
  fetch(request).then(response => response.text()).then(useless => updateCommentLikeData(commentId));
}

/**

 * Updates a comment's appearance after its like button has been toggled.
 */
function updateCommentLikeData(commentId) {
  const request = new Request("/togglelike?key=" + commentId, {method: 'GET'});
  fetch(request).then(response => response.json()).then(commentLikeData => {
    var commentLikeButton = document.getElementById(commentId + "-button");
    var commentLikes = document.getElementById(commentId + "-likes");
    commentLikeButton.dataset.liked = commentLikeData[0];
    commentLikes.innerText = commentLikeData[1];
  });
}