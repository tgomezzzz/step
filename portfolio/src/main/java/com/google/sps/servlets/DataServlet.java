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

    // The max number of comments defaults to 5.
    int maxComments = 5;
    try {
      maxComments = Integer.parseInt(request.getParameter("max-comments"));
    } catch (NumberFormatException e) {
      maxComments = 0;
    }

    // Store each comment's data in a list of lists of strings.
    List<List<String>> commentsList = new LinkedList<>();
    for (Entity comment : comments.asIterable(FetchOptions.Builder.withLimit(maxComments))) {
      commentsList.add(getCommentDataAsList(comment));
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
      datastore.put(comment);
    }

    response.sendRedirect("/");
  }

  /**
  * Records a comment's data as a list of strings.
  * The first element in the list is the comment's key.
  * The second is the comment's author.
  * The third is the comment's message.
  * The fourth is the comment's date and time.
  * The fifth is the number of likes the comment has.
  */
  private List<String> getCommentDataAsList(Entity comment) {
    List<String> commentDataAsList = new LinkedList<>();
    long timeInMillis = (long) comment.getProperty("timestamp");

    commentDataAsList.add(KeyFactory.keyToString(comment.getKey()));
    commentDataAsList.add((String) comment.getProperty("author"));
    commentDataAsList.add((String) comment.getProperty("message"));
    commentDataAsList.add(df.format(new Date(timeInMillis)));

    List<String> likedByIpSet = (List<String>) comment.getProperty("likedBy");
    if (likedByIpSet != null) {
      commentDataAsList.add(Integer.toString(likedByIpSet.size()));
    } else {
      commentDataAsList.add("0");
    }
    return commentDataAsList;
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
