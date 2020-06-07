package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import java.io.IOException;
import java.util.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


@WebServlet("/toggle-like")
public class LikeCommentServlet extends HttpServlet {

  private DatastoreService datastore;

  @Override
  public void init() {
    datastore = DatastoreServiceFactory.getDatastoreService();
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String commentKeyString = request.getParameter("key");
    Entity comment = null;
    try {
      comment = datastore.get(KeyFactory.stringToKey(commentKeyString));
    } catch (EntityNotFoundException e) {
      e.printStackTrace();
      response.sendRedirect("/");
      return;
    }

    String clientIp = request.getRemoteAddr();
    Set<String> likedByIpSet;
    if (comment.hasProperty("likedBy")) {
      likedByIpSet = (HashSet<String>) comment.getProperty("likedBy");
      System.out.println("updated existing HashSet");
    } else {
      likedByIpSet = new HashSet<>();
      likedByIpSet.add(clientIp);
      comment.setProperty("likedBy", likedByIpSet);
      System.out.println("created new HashSet");
    }
  }

}