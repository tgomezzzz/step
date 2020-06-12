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

  if (tabName == "Interests"){
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

/*
 * Displays the specified interest in the More Info window.
 */
function displayMoreInfo(interestName) {
  hideMoreInfo();
  var interestToDisplay = document.getElementById(interestName);
  interestToDisplay.style.display = "block";

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
