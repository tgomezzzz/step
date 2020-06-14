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
import com.google.appengine.api.blobstore.BlobInfo;
import com.google.appengine.api.blobstore.BlobInfoFactory;
import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.appengine.api.images.ImagesService;
import com.google.appengine.api.images.ImagesServiceFactory;
import com.google.appengine.api.images.ServingUrlOptions;
import java.net.MalformedURLException;
import java.net.URL;
import java.io.IOException;
import java.util.*;
import com.google.gson.Gson;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.text.DateFormat;
import java.text.SimpleDateFormat;

@WebServlet("/location")
public class LocationServlet extends HttpServlet {

  private DatastoreService datastore;

  @Override
  public void init() {
    datastore = DatastoreServiceFactory.getDatastoreService();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    PreparedQuery locations = datastore.prepare(new Query("Location"));

    // Store each location's data in a list of lists of strings.
    List<List<String>> locationsList = new LinkedList<>();
    for (Entity location : locations.asIterable()) {
      locationsList.add(getDataAsList(location));
    }

    response.setContentType("application/json;");
    response.getWriter().println(convertToJsonUsingGson(locationsList));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String imageUrl = getUploadedFileUrl(request, "image");
    double lat = Double.parseDouble(request.getParameter("lat"));
    double lng = Double.parseDouble(request.getParameter("lng"));
    String creator = getParameter(request, "creator-name", "Anonymous");
    String locationName = request.getParameter("location-name");
    String locationInfo = request.getParameter("location-info");

    if (!locationInfo.equals("") && !locationName.equals("")) {
      Entity newLocation = new Entity("Location");
      newLocation.setProperty("lat", lat);
      newLocation.setProperty("lng", lng);
      newLocation.setProperty("creator", creator);
      newLocation.setProperty("name", locationName);
      newLocation.setProperty("image", imageUrl);
      newLocation.setProperty("info", locationInfo);
      datastore.put(newLocation);
    }

    response.sendRedirect("/");
  }

  /** Returns a URL that points to the uploaded file, or null if the user didn't upload a file. */
  private String getUploadedFileUrl(HttpServletRequest request, String formInputElementName) {
    BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
    Map<String, List<BlobKey>> blobs = blobstoreService.getUploads(request);
    List<BlobKey> blobKeys = blobs.get("image");

    // User submitted form without selecting a file, so we can't get a URL. (dev server)
    if (blobKeys == null || blobKeys.isEmpty()) {
      return null;
    }

    // Our form only contains a single file input, so get the first index.
    BlobKey blobKey = blobKeys.get(0);

    // User submitted form without selecting a file, so we can't get a URL. (live server)
    BlobInfo blobInfo = new BlobInfoFactory().loadBlobInfo(blobKey);
    if (blobInfo.getSize() == 0) {
      blobstoreService.delete(blobKey);
      return null;
    }

    // We could check the validity of the file here, e.g. to make sure it's an image file
    // https://stackoverflow.com/q/10779564/873165

    // Use ImagesService to get a URL that points to the uploaded file.
    ImagesService imagesService = ImagesServiceFactory.getImagesService();
    ServingUrlOptions options = ServingUrlOptions.Builder.withBlobKey(blobKey);

    // To support running in Google Cloud Shell with AppEngine's devserver, we must use the relative
    // path to the image, rather than the path returned by imagesService which contains a host.
    try {
      URL url = new URL(imagesService.getServingUrl(options));
      return url.getPath();
    } catch (MalformedURLException e) {
      return imagesService.getServingUrl(options);
    }
  }

  /**
  * Records a comment's data as a list of strings.
  * The first element in the list is the comment's key.
  * The second is the comment's author.
  * The third is the comment's message.
  * The fourth is the comment's date and time.
  * The fifth is the number of likes the comment has.
  */
  private List<String> getDataAsList(Entity location) {
    List<String> locationDataAsList = new LinkedList<>();

    locationDataAsList.add(KeyFactory.keyToString(location.getKey()));
    locationDataAsList.add(Double.toString((Double) location.getProperty("lat")));
    locationDataAsList.add(Double.toString((Double) location.getProperty("lng")));
    locationDataAsList.add((String) location.getProperty("creator"));
    locationDataAsList.add((String) location.getProperty("name"));
    locationDataAsList.add((String) location.getProperty("image"));
    locationDataAsList.add((String) location.getProperty("info"));

    return locationDataAsList;
  }

  private String getParameter(HttpServletRequest request, String paramName, String defaultValue) {
    String value = request.getParameter(paramName);
    if (value.equals("")) {
      return defaultValue;
    }
    return value;
  }

  private String convertToJsonUsingGson(List<List<String>> data) {
    Gson gson = new Gson();
    String json = gson.toJson(data);
    return json;
  }
}
