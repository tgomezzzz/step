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

package com.google.sps;

import java.util.Collection;
import java.util.Arrays;
import java.util.LinkedList;

public final class FindMeetingQuery {
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    long duration = request.getDuration();
    TimeRange wholeDay = TimeRange.WHOLE_DAY;

    if (duration > wholeDay.duration()) {
      return Arrays.asList();
    }

    Collection<String> meetingAttendees = request.getAttendees();
    Collection<TimeRange> availableTimeRanges = new LinkedList<>();
    availableTimeRanges.add(wholeDay);

    for (Event event : events) {
      if (event.hasAnyAttendee(meetingAttendees)) {
        removeEventTimeRange(event, availableTimeRanges);
      }
    }

    availableTimeRanges.removeIf(availableTimeRange -> (availableTimeRange.duration() < duration));
    return availableTimeRanges;
  }

  private void removeEventTimeRange(Event event, Collection<TimeRange> availableTimeRanges) {
    TimeRange eventTimeRange = event.getWhen();
    Collection<TimeRange> newTimeRanges = new LinkedList<>();
    for (TimeRange availableTimeRange : availableTimeRanges) {

      if (eventTimeRange.overlaps(availableTimeRange)) {

        // Case 1: the event (E) contains the entire available time range (ATR), so it is no longer available.
        //   |--ATR--|      -->
        // |-----E------|        |-----E------|
        if (eventTimeRange.contains(availableTimeRange)) {
          availableTimeRanges.remove(availableTimeRange);
        
        // Case 2: the available time range contains the entire event, which splits the available time range into two smaller ranges.
        // |------ATR------|   -->  |--1--|     |--2--|
        //     |--E--|                    |--E--|
        } else if (availableTimeRange.contains(eventTimeRange)) {
          TimeRange preEventTimeRange = TimeRange.fromStartEnd(availableTimeRange.start(), eventTimeRange.start(), false);
          TimeRange postEventTimeRange = TimeRange.fromStartEnd(eventTimeRange.end(), availableTimeRange.end(), false);
          newTimeRanges.add(preEventTimeRange);
          newTimeRanges.add(postEventTimeRange);
          availableTimeRanges.remove(availableTimeRange);

        // Case 3: The event partially overlaps the available time range, trimming it.
        // |----ATR----|     -->   |--ATR--|           or     |----ATR----|   -->          |--ATR--| 
        //         |---E---|               |---E---|       |---E---|               |---E---|
        } else {
          TimeRange trimmedTimeRange = null;
          if (availableTimeRange.contains(eventTimeRange.start())) {
            trimmedTimeRange = TimeRange.fromStartEnd(availableTimeRange.start(), eventTimeRange.end(), false);
          } else if (eventTimeRange.contains(availableTimeRange.start())) {
            trimmedTimeRange = TimeRange.fromStartEnd(eventTimeRange.end(), availableTimeRange.end(), false);
          }
          newTimeRanges.add(trimmedTimeRange);
          availableTimeRanges.remove(availableTimeRange);
        }
      }
    }
    availableTimeRanges.addAll(newTimeRanges);
  }

}
