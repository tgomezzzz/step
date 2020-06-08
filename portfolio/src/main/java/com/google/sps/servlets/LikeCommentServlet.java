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
    System.out.println("entering DOGET");
    String commentKeyString = request.getParameter("key");
    Entity comment = null;
    try {
      comment = datastore.get(KeyFactory.stringToKey(commentKeyString));
    } catch (EntityNotFoundException e) {
      e.printStackTrace();
      response.sendRedirect("/");
      return;
    }

    List<String> commentLikeData = new LinkedList<>();
    if (comment.hasProperty("likedBy")){
      System.out.println("DOGET: Comment still has property likedBy");
      HashSet<String> likedByIpSet = new HashSet<String>((List<String>) comment.getProperty("likedBy"));
      if (likedByIpSet.contains(request.getRemoteAddr())) {
        commentLikeData.add("true");
      } else {
        commentLikeData.add("false");
      }
      commentLikeData.add(Integer.toString(likedByIpSet.size()));
    } else {
      System.out.println("DOGET: Comment DOES NOT HAVE property likedBy");
      commentLikeData.add("false");
      commentLikeData.add("0");
    }

    response.setContentType("application/json;");
    System.out.println("######");
    System.out.println("#######JSON: " + convertToJsonUsingGson(commentLikeData));
    response.getWriter().println(convertToJsonUsingGson(commentLikeData));  
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
      System.out.println("DOPOST: Comment has likedBy property, ");

      // If the client's IP address is already in the set, then the comment is already liked, and needs to be unliked. 
      if (likedByIpSet.contains(clientIp)) {
        System.out.print(" and the client has already liked it, so the client's like is removed. ");
        likedByIpSet.remove(clientIp);

        // If the comment now has no likes, remove the "likedBy" property.
        // This is to avoid NullPointerExceptions, because Datastore internally stores empty Collections as null.
        if (likedByIpSet.isEmpty()) {
          System.out.print("The comment now has no likes, ");
          comment.removeProperty("likedBy");
          System.out.print("and likedBy is removed.");

        // If the comment still has likes, update the "likedBy" property.
        } else {
          comment.setProperty("likedBy", likedByIpSet);
          System.out.print("The comment still has likes, and likedBy is updated");
        }

      // Otherwise, like the comment.
      } else {
        System.out.println("but had not been liked by the client, ");
        likedByIpSet.add(clientIp);
        comment.setProperty("likedBy", likedByIpSet);
        System.out.println("so client like has been added and likedBy has been updated.");
      }
    
    // If the comment has no likes, add this client's IP
    } else {
      System.out.println("DOPOST: the comment did not have likedBy property, so it has been created with the client's like");
      likedByIpSet = new HashSet<>();
      likedByIpSet.add(clientIp);
      comment.setProperty("likedBy", likedByIpSet);
    }
    datastore.put(comment);

    response.sendRedirect("/");
  }

  private String convertToJsonUsingGson(List<String> commentLikeData) {
    Gson gson = new Gson();
    String json = gson.toJson(commentLikeData);
    return json;
  }

}