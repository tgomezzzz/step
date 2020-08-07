package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.gson.Gson;
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
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String commentKeyString = request.getParameter("key");
    Entity comment = null;
    try {
      comment = datastore.get(KeyFactory.stringToKey(commentKeyString));
    } catch (EntityNotFoundException e) {
      e.printStackTrace();
      response.sendRedirect("/");
      return;
    }

    // The first element in this list records whether or not the client has liked this comment, and the second records the number of likes this comment has.
    List<String> commentLikeData = new LinkedList<>();

    // If the comment has at least one like... 
    if (comment.hasProperty("likedBy")){
      HashSet<String> likedByIpSet = new HashSet<String>((List<String>) comment.getProperty("likedBy"));

      // ...and the client has liked it, record that the client has liked it by adding "true".
      if (likedByIpSet.contains(request.getRemoteAddr())) {
        commentLikeData.add("true");

      // ...and the client has not liked it, record that the client has not liked it by adding "false".
      } else {
        commentLikeData.add("false");
      }

      // Then, record the number of likes that the comment has.
      commentLikeData.add(Integer.toString(likedByIpSet.size()));

    // If the comment has no likes, record "false" since the client hasn't liked it and "0" since it has no likes.
    } else {
      commentLikeData.add("false");
      commentLikeData.add("0");
    }

    response.setContentType("application/json;");
    response.getWriter().println(convertToJsonUsingGson(commentLikeData));  
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String commentKeyString = request.getParameter("key");
    Entity comment = null;

    // If it exists, get the comment from the datastore by its key.
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
        // Unlike the comment.
        likedByIpSet.remove(clientIp);

        // If the comment now has no likes, remove the "likedBy" property.
        // This is to avoid NullPointerExceptions, because Datastore internally stores empty Collections as null.
        if (likedByIpSet.isEmpty()) {
          comment.removeProperty("likedBy");

        // If the comment still has likes, update the "likedBy" property.
        } else {
          comment.setProperty("likedBy", likedByIpSet);
        }

      // If the client's IP address is not in the set, like the comment, and update the "likedBy" property.
      } else {
        likedByIpSet.add(clientIp);
        comment.setProperty("likedBy", likedByIpSet);
      }
    
    // If the comment has no likes, add this client's IP, and add the "likedBy" property to the comment.
    } else {
      likedByIpSet = new HashSet<>();
      likedByIpSet.add(clientIp);
      comment.setProperty("likedBy", likedByIpSet);
    }
    datastore.put(comment);

  }

  private String convertToJsonUsingGson(List<String> commentLikeData) {
    Gson gson = new Gson();
    String json = gson.toJson(commentLikeData);
    return json;
  }

}
