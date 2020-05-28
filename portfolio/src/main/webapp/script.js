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
    var timeline = document.getElementById("timeline");
    var movingDot = document.getElementById("moving-dot")
    var rightEnd = 95;
    var dotLeftPos = 97 - rightEnd;

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

/**
 * Sets display for a given image to "block".
 */
function displayImage(imageID) {
    picDiv = document.getElementById(imageID);
    pic = picDiv.getElementsByTagName("IMG")[0];
    pic.style.display = "block";
}
