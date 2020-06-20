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
import java.util.Collections;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.HashMap;

public final class FindMeetingQuery {
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    long duration = request.getDuration();
    TimeRange wholeDay = TimeRange.WHOLE_DAY;

    if (duration > wholeDay.duration()) {
      return Arrays.asList();
    }

    Collection<String> requiredAttendees = request.getAttendees();
    Collection<String> optionalAttendees = request.getOptionalAttendees();

    if (requiredAttendees.size() < 1 && optionalAttendees.size() > 0) {
      return getAvailableTimeRanges(events, optionalAttendees, new LinkedList(Arrays.asList(wholeDay)), duration);
    }

    Collection<TimeRange> requiredAttendeeAvailability = getAvailableTimeRanges(events, requiredAttendees, new LinkedList(Arrays.asList(wholeDay)), duration);
    Collection<TimeRange> optionalAttendeeAvailability = getOptimalTimeRanges(events, optionalAttendees, requiredAttendeeAvailability, duration);

    if (optionalAttendeeAvailability.size() > 0) {
      return optionalAttendeeAvailability;
    }
    return requiredAttendeeAvailability;
  }

  /**
   * Determines all possible meeting times given a set of events to schedule around, mandatory meeting participants, and available meeting times.
   * This algorithm uses a deletion approach, where each event's time is removed from the set of available meeting times.
   */
  public Collection<TimeRange> getAvailableTimeRanges(Collection<Event> events, Collection<String> attendees, Collection<TimeRange> availableTimeRanges, long duration) {
    for (Event event : events) {
      if (event.hasAnyAttendee(attendees)) {
        availableTimeRanges = removeEventTimeRange(event, availableTimeRanges, duration);
      }
    }
    return availableTimeRanges;
  }

  /**
   * Removes the time that {@code event} takes from the set of available meeting times in {@code availableTimeRanges}.
   */
  private Collection<TimeRange> removeEventTimeRange(Event event, Collection<TimeRange> availableTimeRanges, long duration) {
    TimeRange eventTimeRange = event.getWhen();
    Collection<TimeRange> newTimeRanges = new LinkedList<>();
    for (TimeRange availableTimeRange : availableTimeRanges) {
      if (eventTimeRange.overlaps(availableTimeRange)) {

        // Case 1: the event (E) contains the entire available time range (ATR), so the whole ATR is no longer available.
        //   |--ATR--|      -->
        // |-----E------|        |-----E------|
        if (eventTimeRange.contains(availableTimeRange)) {
          availableTimeRanges.remove(availableTimeRange);
        
        // Case 2: the ATR contains the entire event, which splits the ATR into two smaller ranges.
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
            trimmedTimeRange = TimeRange.fromStartEnd(availableTimeRange.start(), eventTimeRange.start(), false);
          } else if (eventTimeRange.contains(availableTimeRange.start())) {
            trimmedTimeRange = TimeRange.fromStartEnd(eventTimeRange.end(), availableTimeRange.end(), false);
          }
          newTimeRanges.add(trimmedTimeRange);
          availableTimeRanges.remove(availableTimeRange);
        }
      }
    }
    availableTimeRanges.addAll(newTimeRanges);
    availableTimeRanges.removeIf(availableTimeRange -> (availableTimeRange.duration() < duration));
    return availableTimeRanges;
  }

  private Collection<TimeRange> getOptimalTimeRanges(Collection<Event> events, Collection<String> attendees, Collection<TimeRange> availableTimeRanges, long duration) {
    HashMap<TimeRange, Collection<String>> availableAttendeesByTimeRange = new HashMap<>();
    for (TimeRange availableTimeRange : availableTimeRanges) {
      availableAttendeesByTimeRange.put(availableTimeRange, getAvailableAttendees(availableTimeRange, events, attendees, duration));
    }

    LinkedList<TimeRange> optimalTimeRanges = new LinkedList<>();
    int maxAvailableAttendeeCount = -1;
    for (TimeRange timeRange : availableAttendeesByTimeRange.keySet()) {
      Collection<String> availableAttendees = availableAttendeesByTimeRange.get(timeRange);
      if (availableAttendees.size() > maxAvailableAttendeeCount) {
        optimalTimeRanges.clear();
        maxAvailableAttendeeCount = availableAttendees.size();
        optimalTimeRanges.add(timeRange);
      } else if (availableAttendees.size() == maxAvailableAttendeeCount) {
        optimalTimeRanges.add(timeRange);
      }
    }
    Collections.sort(optimalTimeRanges, TimeRange.ORDER_BY_START);
    return optimalTimeRanges;
  }

  private Collection<String> getAvailableAttendees(TimeRange timeRange, Collection<Event> events, Collection<String> attendees, long duration) {
    Collection<String> availableAttendees = new LinkedList<>();
    for (Event event : events) {
      if (event.hasAnyAttendee(attendees)) {
        Collection<TimeRange> availableTimeRangesAfterEvent = removeEventTimeRange(event, new LinkedList(Arrays.asList(timeRange)), duration);
        if (availableTimeRangesAfterEvent.size() > 0) {
          availableAttendees.addAll(event.getAttendees());
        }
      }
    }
    return availableAttendees;
  }
}
