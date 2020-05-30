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
    hideImages();
    hideBranches();
    var timeline = document.getElementById("timeline");
    var movingDot = document.getElementById("moving-dot")
    var rightEnd = 95;
    var dotLeftPos = 97 - rightEnd;
    var branchPosToExtend = 0;

    var branchTriggers = {
        6: "astronomy",
        22: "geography",
        38: "tornadoes",
        54: "architecture",
        70: "photography",
        86: "compsci"
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
    var moreInfo = document.getElementsByClassName("moreinfo");
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