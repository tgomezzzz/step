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
function displayMoreInfo(event, interestName) {
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
 * Creates a <p> element with the given message.
 */
function createComment(entry) {
  const comment = document.createElement('div');
  const commentContent = document.createElement('div');
  const commentLikesContent = document.createElement('div');
  comment.className = "comment";
  commentContent.id = "comment-content";
  commentLikesContent.id = "comment-likes-content";

  const author = document.createElement('div');
  const message = document.createElement('div')
  const heartButton = document.createElement('div');
  const likes = document.createElement('div');
  author.innerText = entry[1] + " (" + entry[3] + ")";
  author.className = "author";
  message.innerText = entry[2];
  message.className = "message";
  heartButton.className = "heart";
  heartButton.id = entry[0];
  heartButton.onclick = function() { toggleLike(event) };
  heartButton.dataset.liked = "false";
  likes.innerText = entry[4];
  likes.className = "likes";
  
  commentContent.appendChild(author);
  commentContent.appendChild(message);
  commentLikesContent.appendChild(heartButton);
  commentLikesContent.appendChild(likes);
  comment.appendChild(commentContent);
  comment.append(commentLikesContent);
  return comment;
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
  const commentId = event.target.id;
  const request = new Request("/toggle-like?key=" + commentId, {method: 'POST'});
  fetch(request).then(
    fetchComments(5)
  );
  if (event.target.dataset.liked === 'false') {
    event.target.dataset.liked = 'true';
  } else {
    event.target.dataset.liked = 'false';
  }
}