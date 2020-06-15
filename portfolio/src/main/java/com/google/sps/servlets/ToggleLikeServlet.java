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


@WebServlet("/togglelike")
public class ToggleLikeServlet extends HttpServlet {

  private DatastoreService datastore;

  @Override
  public void init() {
    datastore = DatastoreServiceFactory.getDatastoreService();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String keyString = request.getParameter("key");
    Entity entity = null;
    try {
      entity = datastore.get(KeyFactory.stringToKey(keyString));
    } catch (EntityNotFoundException e) {
      e.printStackTrace();
      response.sendRedirect("/");
      return;
    }

    // The first element in this list records whether or not the client has liked this entity, and the second records the number of likes this entity has.
    List<String> entityLikeData = new LinkedList<>();

    // If the entity has at least one like... 
    if (entity.hasProperty("likedBy")){
      HashSet<String> likedByIpSet = new HashSet<String>((List<String>) entity.getProperty("likedBy"));

      // ...and the client has liked it, record that the client has liked it by adding "true".
      if (likedByIpSet.contains(request.getRemoteAddr())) {
        entityLikeData.add("true");

      // ...and the client has not liked it, record that the client has not liked it by adding "false".
      } else {
        entityLikeData.add("false");
      }

      // Then, record the number of likes that the entity has.
      entityLikeData.add(Integer.toString(likedByIpSet.size()));

    // If the entity has no likes, record "false" since the client hasn't liked it and "0" since it has no likes.
    } else {
      entityLikeData.add("false");
      entityLikeData.add("0");
    }

    response.setContentType("application/json;");
    response.getWriter().println(convertToJsonUsingGson(entityLikeData));  
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String keyString = request.getParameter("key");
    Entity entity = null;

    // If it exists, get the entity from the datastore by its key.
    try {
      entity = datastore.get(KeyFactory.stringToKey(keyString));
    } catch (EntityNotFoundException e) {
      e.printStackTrace();
      response.sendRedirect("/");
      return;
    }

    String clientIp = request.getRemoteAddr();
    Set<String> likedByIpSet;

    // If the entity has already been liked at least once, add or remove this client's IP to the set of IPs that have liked it.
    if (entity.hasProperty("likedBy")) {
      likedByIpSet = new HashSet<String>((List<String>) entity.getProperty("likedBy"));

      // If the client's IP address is already in the set, then the entity is already liked, and needs to be unliked. 
      if (likedByIpSet.contains(clientIp)) {
        // Unlike the entity.
        likedByIpSet.remove(clientIp);

        // If the entity now has no likes, remove the "likedBy" property.
        // This is to avoid NullPointerExceptions, because Datastore internally stores empty Collections as null.
        if (likedByIpSet.isEmpty()) {
          entity.removeProperty("likedBy");

        // If the entity still has likes, update the "likedBy" property.
        } else {
          entity.setProperty("likedBy", likedByIpSet);
        }

      // If the client's IP address is not in the set, like the entity, and update the "likedBy" property.
      } else {
        likedByIpSet.add(clientIp);
        entity.setProperty("likedBy", likedByIpSet);
      }
    
    // If the entity has no likes, add this client's IP, and add the "likedBy" property to the entity.
    } else {
      likedByIpSet = new HashSet<>();
      likedByIpSet.add(clientIp);
      entity.setProperty("likedBy", likedByIpSet);
    }
    datastore.put(entity);

  }

  private String convertToJsonUsingGson(List<String> entityLikeData) {
    Gson gson = new Gson();
    String json = gson.toJson(entityLikeData);
    return json;
  }

}