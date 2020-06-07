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

    // If the comment has already been liked at least once, add or remove this client's IP to the set of IPs that have liked it.
    if (comment.hasProperty("likedBy")) {
      likedByIpSet = new HashSet<String>((List<String>) comment.getProperty("likedBy"));

      // If the client's IP address is already in the set, then the comment is already liked, and needs to be unliked. 
      if (likedByIpSet.contains(clientIp)) {
        likedByIpSet.remove(clientIp);

        // If the comment now has no likes, remove the "likedBy" property.
        // This is to avoid NullPointerExceptions, because Datastore internally stores empty Collections as null.
        if (likedByIpSet.isEmpty()) {
          comment.removeProperty("likedBy");

        // If the comment still has likes, update the "likedBy" property.
        } else {
          comment.setProperty("likedBy", likedByIpSet);
        }

      // Otherwise, like the comment.
      } else {
        likedByIpSet.add(clientIp);
      }
    
    // If the comment has no likes, add this client's IP
    } else {
      likedByIpSet = new HashSet<>();
      likedByIpSet.add(clientIp);
      comment.setProperty("likedBy", likedByIpSet);
    }
    datastore.put(comment);
  }

}