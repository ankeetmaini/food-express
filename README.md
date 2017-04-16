# Realtime Tracking on Google

In this tutorial we'll create an awesome app to track realtime location of our friends!

## Step 0: Setting up our app
- Start of by creating our `index.html` with this code snippet.
- Our humble [`index.html`](https://link.to.github) doesn't do much except including a `meta` tag in the `head` section so that our app looks and works well in mobile browsers as well and includes a JavaScript file in `src` directory.

```html
<!DOCTYPE html>
<html>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <head>
    <title>Realtime Tracking with Pusher</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1>Let's start tracking!</h1>
  </body>
</html>
```
- Since we'll be using [Google Maps](https://maps.google.com/), let's add their [JavaScript API](https://developers.google.com/maps/documentation/javascript/) and see the map in action!
- But before you could integrate [Google Maps](https://maps.google.com/) you need to get your key. [Click here to get the key](https://developers.google.com/maps/documentation/javascript/get-api-key)
- Once you get the key, copy it, and include their API in the `index.html`. Also add the `<script>` tag for `app.js` which will contain our app's code.
- We'll also add a CSS file `app.css` for making our app look nice!
- This is how your `index.html` will look like
```html
<!DOCTYPE html>
<html>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <head>
    <title>Realtime Tracking with Pusher</title>
    <meta charset="utf-8">
    <link href="app.css" rel="stylesheet"></link>
  </head>
  <body>
    <div class="header">
      <h1>Track Your Friends!</h1>
    </div>
    <div class="container">
      <div id="map"></div>
    </div>
    <script src="https://maps.googleapis.com/maps/api/js?key=INSERT_YOUR_KEY_HERE"></script>
    <script type="text/javascript" src="src/app.js"></script>
  </body>
</html>
```
- Let's add some code quickly to render the map in our `app.js`

```js
(function () {
  // load the map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
}());
```

## Step 1: Capture device's location
- We'll use Web's [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation) to get the user's location on start-up
- With this code, we get the location and center the map. See we're already into personalized experience!

```js
// get the location via Geolocation API
if ('geolocation' in navigator) {
  var currentLocation = navigator.geolocation.getCurrentPosition(function (position) {
    map.setCenter({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
  });
}
```

## Step 2: Capture _username_
- It's important to capture a _username_ to identify users on the map
- Let's code a `div` which will take input and store it in-memory.
- Add the following code in `index.html`

```html
<div id="name-box" class="name-box">
  <h3>What would you like to be known as?</h3>
  <input id="name" type="text" placeholder="e.g. Darth Vader">
  <button id="saveNameButton">Save</button>
</div>

<div id="friends-box" class="name-box hidden">
  <h3 id="welcome-message"></h3>
  <input id="friendName" type="text" placeholder="e.g. Shelly">
  <h4 id="friends-list"></h4>
</div>
```

- And some JavaScript to get the name

```js
var username;

// reference for DOM nodes
var saveNameButton = document.getElementById('saveNameButton');
var saveNameBox = document.getElementById('name-box');
var nameInput = document.getElementById('name');
var welcomeHeading = document.getElementById('welcome-message');
var friendsBox = document.getElementById('friends-box');

saveNameButton.addEventListener('click', saveName);

// all functions, event handlers
function saveName (e) {
  var input = nameInput.value;
  if (input && input.trim()) {
    username = input;

    // hide the name box
    saveNameBox.classList.add('hidden');

    // set the name
    welcomeHeading.innerHTML = 'Hi! <strong>' + username + '</strong>, who would you like to track today?';
    // show the friend's div now
    friendsBox.classList.remove('hidden');
  }
  return;
}
```

- Take a look at the latest version of our `app.js`