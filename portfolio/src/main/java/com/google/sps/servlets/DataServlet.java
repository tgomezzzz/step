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

package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import java.io.IOException;
import java.util.*;
import com.google.gson.Gson;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.text.DateFormat;
import java.text.SimpleDateFormat;

@WebServlet("/data")
public class DataServlet extends HttpServlet {

  private DateFormat df;
  private DatastoreService datastore;

  @Override
  public void init() {
      df = new SimpleDateFormat("MMMMM d, yyyy h:mm a z");
      df.setTimeZone(TimeZone.getTimeZone("America/Los_Angeles"));
      datastore = DatastoreServiceFactory.getDatastoreService();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    PreparedQuery comments = datastore.prepare(new Query("Comment").addSort("timestamp", SortDirection.DESCENDING));
    int maxComments;
    try {
      maxComments = Integer.parseInt(request.getParameter("max-comments"));
    } catch (NumberFormatException e) {
      maxComments = 0;
    }

    List<List<String>> commentsList = new ArrayList<>();
    for (Entity entity : comments.asIterable(FetchOptions.Builder.withLimit(maxComments))) {
      List<String> comment = new ArrayList<>();
      long timeInMillis = (long) entity.getProperty("timestamp");

      comment.add(KeyFactory.keyToString(entity.getKey()));
      comment.add((String) entity.getProperty("author"));
      comment.add((String) entity.getProperty("message"));
      comment.add(df.format(new Date(timeInMillis)));

      List<String> likedByIpSet = (List<String>) entity.getProperty("likedBy");
      if (likedByIpSet != null) {
        comment.add(Integer.toString(likedByIpSet.size()));
      } else {
        comment.add("0");
      }

      commentsList.add(comment);
    }

    response.setContentType("application/json;");
    response.getWriter().println(convertToJsonUsingGson(commentsList));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String author = getParameter(request, "author-input", "Anonymous");
    String message = request.getParameter("message-input");
    long timestamp = System.currentTimeMillis();

    if (!message.equals("")) {
      Entity comment = new Entity("Comment");
      comment.setProperty("author", author);
      comment.setProperty("message", message);
      comment.setProperty("timestamp", timestamp);
      comment.setProperty("likes", 0);
      datastore.put(comment);
    }

    response.sendRedirect("/");
  }

  private String getParameter(HttpServletRequest request, String paramName, String defaultValue) {
    String value = request.getParameter(paramName);
    if (value.equals("")) {
      return defaultValue;
    }
    return value;
  }

  private String convertToJsonUsingGson(List<List<String>> comments) {
    Gson gson = new Gson();
    String json = gson.toJson(comments);
    return json;
  }
}
