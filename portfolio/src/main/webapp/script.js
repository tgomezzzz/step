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
  
  var buttonContainer = document.getElementsByClassName("tabs")[0];
  buttonContainer.style.borderBottomLeftRadius = "0";
  buttonContainer.style.borderBottomRightRadius = "0";

  var tabInfo = document.getElementsByClassName("tabinfo");
  for (var i = 0; i < tabInfo.length; i++) {
    tabInfo[i].style.display = "none";
  }

  var tabButtons = document.getElementsByClassName("tabbutton");
  for (var i = 0; i < tabButtons.length; i++) {
    tabButtons[i].className = tabButtons[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  event.currentTarget.className += " active";

  if (tabName == "Interests"){
    drawTimeline();
  }
}

/*
 * Displays the timeline animation on the Interests tab.
 */
function drawTimeline() {
  //branches and the images to their starting positions
  hideImages();
  hideBranches();

  var timeline = document.getElementById("timeline");
  var movingEndpoint = document.getElementById("moving-endpoint")

  //moves the right end of the timeline, resulting in the left-to-right animation
  var timelineRightPosition = 95;

  //moves the "Present" endpoint to the right as the timeline expands
  var endpointLeftPosition = 97 - timelineRightPosition;

  //controls the direction of each branch's animation (true expands up, false expands down)
  var branchUp = true;

  //triggers each branch's animation at the appropriate point in the timeline's expansion
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
    //stops the timeline's animation
    if (timelineRightPosition <= 5) {
      clearInterval(timelineAnimation);
    } else {
      //increment the positions of the timeline and endpoint, and set respective their HTML style attributes
      timelineRightPosition -= 0.5;
      endpointLeftPosition = 97 - timelineRightPosition;
      timeline.style.right = timelineRightPosition + "%";
      movingEndpoint.style.left = endpointLeftPosition + "%";

      //animate the branches once the timeline reaches their trigger points
      if (endpointLeftPosition in branchTriggers) {
        //display the branch's image
        displayImage(branchTriggers[endpointLeftPosition]);

        //start the branch's animation
        displayTimelineBranch(branchTriggers[endpointLeftPosition], branchUp);

        //flip the animation direction for the next branch, resulting in branches that alternate between up and down
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

  //depending on the value of branchUp, this changes either the "top" or "bottom" attribute of the branch
  var positionToExtend = 50;

  var branchAnimation = setInterval(extendTimelineBranch, 20);
  function extendTimelineBranch() {
    //stop the branch's animation
    if (positionToExtend <= 5) {
      clearInterval(branchAnimation);
    } else {
      //increment the position of the branch, resulting in the animation
      positionToExtend -= 0.5;

      //animate up by changing the branch's "top" attribute
      if (branchUp === true) {
        branch.style.top = positionToExtend + "%";
      //animate down by changing the branch's "bottom" attribute
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
  var moreInfo = document.getElementsByClassName("moreinfo");
  for (var i = 0; i < moreInfo.length; i++) {
    moreInfo[i].style.display = "none";
  }
}