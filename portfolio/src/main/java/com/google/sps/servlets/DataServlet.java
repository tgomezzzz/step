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
import java.io.IOException;
import java.util.*;
import com.google.gson.Gson;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.text.DateFormat;
import java.text.SimpleDateFormat;

/** Servlet that returns some example content. TODO: modify this file to handle comments data */
@WebServlet("/data")
public class DataServlet extends HttpServlet {

  private List<List<String>> comments;
  private DateFormat df;
  private DatastoreService datastore;

  @Override
  public void init() {
      // comments = new ArrayList<>();
      df = new SimpleDateFormat("dd/MM/yyyy, HH:mm");
      datastore = DatastoreServiceFactory.getDatastoreService();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String json = convertToJsonUsingGson(comments);

    response.setContentType("application/json;");
    response.getWriter().println(json);
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // List<String> entry = new ArrayList<>();

    String author = getParameter(request, "name", "Anonymous");
    String message = getParameter(request, "message", "[Empty Message]");
    String date = df.format(new Date());
    // entry.add(name);
    // entry.add(comment);
    // entry.add(df.format(entryDate));

    Entity comment = new Entity("Comment");
    comment.setProperty("author", author);
    comment.setProperty("message", message);
    comment.setProperty("date", date);

    datastore.put(comment);
    response.sendRedirect("/index.html");
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
    System.out.println(json);
    return json;
  }
}
