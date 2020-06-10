// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
 
//Madison Sq Park: 
//Yellowstone: 
//Kerry Park, 
//Vancouver, 
//Miami Beach, 
//Reykjavik, 
//Honolulu, 
//Mt. Fuji, 

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.8075, lng: -73.9626},
    mapTypeId: 'hybrid',
    tilt: 45,
    zoom: 8
  });

  const icons = {
    scenery: {icon: "/images/mountain-icon.png"},
    city: {icon: "/images/city-icon.png"},
    beach: {icon: "/images/beach-icon.png"} 
  }

  const places = [
    {
      pos: new google.maps.LatLng(45.728849, -121.565333),
      id: 'hood-river',
      type: 'scenery'
    }, {
      pos: new google.maps.LatLng(37.816269, -122.371954),
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
    marker.addListener('click', function () {
      map.setCenter(currentMarker.pos);
      map.setZoom(8);
      displayMoreInfo(currentMarker.id);
    });
  };
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
    }

    if (tabName === "Comments") {
        fetchComments(document.getElementById("max-comments").value);
    }
}

/*
 * Displays the timeline animation on the Interests tab.
 */
function drawTimeline() {
    hideImages();
    hideBranches();
    var timeline = document.getElementById("timeline");
    var movingDot = document.getElementById("moving-dot")
    var rightEnd = 95;
    var dotLeftPos = 97 - rightEnd;
    var branchPosToExtend = 0;

    var branchTriggers = {
        11: "astronomy",
        20: "geography",
        41: "tornadoes",
        50: "architecture",
        77: "photography",
        81: "compsci"
    }

    var id = setInterval(extendTimeline, 20);
    function extendTimeline() {
        if (rightEnd <= 5) {
            clearInterval(id);
        } else {
            rightEnd -= 0.5;
            dotLeftPos = 97 - rightEnd;
            timeline.style.right = rightEnd + "%";
            movingDot.style.left = dotLeftPos + "%";

            if (dotLeftPos in branchTriggers) {
                displayImage(branchTriggers[dotLeftPos]);
                displayTimelineBranch(branchTriggers[dotLeftPos], branchPosToExtend);
                branchPosToExtend = 1 - branchPosToExtend;
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
function displayTimelineBranch(branchName, positionToExtend) {
    var branch = document.getElementById(branchName);
    var pos = 50;

    var id = setInterval(extendTimelineBranch, 20);
    function extendTimelineBranch() {
        if (pos <= 5) {
            clearInterval(id);
        } else {
            pos -= 0.5;
            if (positionToExtend == 0) {
                branch.style.top = pos + "%";
            } else if (positionToExtend == 1) {
                branch.style.bottom = pos + "%";
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
  commentContent.id = "comment-content";
  commentContent.appendChild(createAuthor(entry[1], entry[3]));
  commentContent.appendChild(createMessage(entry[2]));

  const commentLikesContent = document.createElement('div');
  commentLikesContent.id = "comment-likes-content";
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
  const request = new Request("/toggle-like?key=" + commentId, {method: 'POST'});
  // The useless parameter below seems to be necessary, because without it, updateCommentLikeData() runs before the then() calls finish.
  // This causes bugs where the color of the like button and the number of likes are displayed incorrectly.
  fetch(request).then(response => response.text()).then(useless => updateCommentLikeData(commentId));
}

/**
 * Updates a comment's appearance after its like button has been toggled.
 */
function updateCommentLikeData(commentId) {
  const request = new Request("/toggle-like?key=" + commentId, {method: 'GET'});
  fetch(request).then(response => response.json()).then(commentLikeData => {
    var commentLikeButton = document.getElementById(commentId + "-button");
    var commentLikes = document.getElementById(commentId + "-likes");
    commentLikeButton.dataset.liked = commentLikeData[0];
    commentLikes.innerText = commentLikeData[1];
  });
}