# How To Track Friends Realtime with Pusher and Google Maps

In this tutorial we'll create an awesome app to track realtime location of our friends! We'll see how not only we can track their location but also follow their location in realtime. You can use this small app to see which of your friends might get late to your party and who is still lying that he has already left!

This post demonstrates how easy it is to use realtime capabilities of Pusher and dead simple to integrate with Google Maps JavaScript APIs to create a real-world tracking utility, be it an e-commerce parcel tracking or tracking your food delivery or a FEDEX package!

To give you a sneak peak this is how our app will look at the end of this post.

![](https://dl.dropboxusercontent.com/s/hz3janocdsskuyw/how-to-track-friends-realtime-all.gif)

## Step 0: Setting up our app
- Start of by creating an `index.html` with this code snippet.
- Our humble [`index.html`](https://github.com/ankeetmaini/track-friends/blob/master/index.html) doesn't do much except including a `meta` tag in the `head` section so that our app looks crisp and works great in mobile browsers as well.

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
- Once you get the key, copy it, and include their JS file in the `index.html`. Also add the `<script>` tag for `app.js` which will contain our app's code.
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

![](https://dl.dropboxusercontent.com/s/lzxumc1dfs9a69h/how-to-track-friends-realtime-login.jpeg)

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
![](https://dl.dropboxusercontent.com/s/lnz8c06vidvw0si/how-to-track-friends-realtime-opening.jpeg)

- Take a look at the latest version of our [app.js](https://github.com/ankeetmaini/track-friends/blob/59b48ad8a51b8b42f89100ca3446ce78a6bca6db/src/app.js)

## Step 3: Set up tracking logic, send events on location change
- To **track locations of our friends** we'll use [Pusher's real time capabilities](https://pusher.com/). We'll trigger events whenever we change our location and also at the same time listen for location change events of our friends.
- [Signup for Pusher](https://pusher.com/signup), or [Login](https://dashboard.pusher.com/accounts/sign_in) if you already have an account.
- Once you login, create an app by giving an `app-name` and choosing a `cluster` in the _Create App_ screen
- Now that we've registered and created the app, add `Pusher's JavaScript library` in your `index.html`

```html
<script src="https://js.pusher.com/4.0/pusher.min.js"></script>
```

- Connect to your app by calling the `Pusher` constructor with your `app key` as shown in the below line

```js
var pusher = new Pusher('<INSERT_PUSHER_APP_KEY_HERE>', {
  cluster: 'ap2',
  encrypted: true
});
```

- Next, we need to start triggering events when our location changes, so that other people can track us.
- While we'll trigger events for our location change, we need to secure these events so that only intended recipients can track us. We'll accomplish this by using [Pusher's Channel concept](https://pusher.com/docs/client_api_guide/client_channels)
- [Channels](https://pusher.com/docs/client_api_guide/client_channels) are a way to filter and secure events. In our app each user will be represented as a `channel`. We'll be using Pusher's [Private Channels](https://pusher.com/docs/client_api_guide/client_private_channels)

```js
var myLocationChannel = pusher.subscribe('private-<USERNAME>');
```
- A `channel` will be named after the username chosen by the user, and with this name other people can subscribe and listen the location change events for a particular user.
- To use private channels, you must be authenticated. [Pusher makes writing an auth server very easy](https://pusher.com/docs/authenticating_users#authEndpoint). I used their NodeJS template [here](https://pusher.com/docs/authenticating_users#implementing_private_endpoints).
- My [server.js](https://github.com/ankeetmaini/track-friends/blob/master/server.js) looks like this

```js
var express = require('express');
var bodyParser = require('body-parser');
var Pusher = require('pusher');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// to serve our JavaScript, CSS and index.html
app.use(express.static('./'));

var pusher = new Pusher({
  appId: 'INSERT_YOUR_APP_ID_HERE',
  key: 'INSERT_YOUR_KEY_HERE',
  secret:  'INSERT_YOUR_SECRET_HERE' 
});

app.post('/pusher/auth', function(req, res) {
  var socketId = req.body.socket_id;
  var channel = req.body.channel_name;
  var auth = pusher.authenticate(socketId, channel);
  res.send(auth);
});

var port = process.env.PORT || 5000;
app.listen(port, () => console.log('Listening at http://localhost:5000'));
```

- To trigger events we'll be using [Pusher's Client Events](https://pusher.com/docs/client_api_guide/client_events#trigger-events) as clients can directly trigger these events from their devices and they need not necessarily go via a server first.
- You need to enable `Client Events` in your `Settings` tab on [Pusher's Dashboard](https://dashboard.pusher.com/)
- `Client Events` should start with `client-<YOUR_EVENT_NAME>`. (Note that `Client Events` have a number of restrictions that are important to know about while creating your awesome app. [Read more about them here.](https://pusher.com/docs/client_api_guide/client_events#trigger-events))
- On startup we create a channel using the below code, and then send our client events to it everytime we change location
- We'll also save the last location in an object (`myLastKnownLocation`) for later retrieval

```js
function createMyLocationChannel (name) {
  var myLocationChannel = pusher.subscribe('private-' + name);
  myLocationChannel.bind('pusher:subscription_succeeded', function() {
    // safe to now trigger events
    // use the watchPosition API to watch the changing location
    // and trigger events with new coordinates
    locationWatcher = navigator.geolocation.watchPosition(function(position) {
      var location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      triggerLocationChangeEvents(myLocationChannel, location);
    });

    // also start a setInterval to keep sending the loction every 5 secs
    sendLocationInterval = setInterval(function () {
      // not using `triggerLocationChangeEvents` to keep the pipes different
      myLocationChannel.trigger('client-location', myLastKnownLocation)
    }, 5000);
  });
}
```

- Also to handle the case when the user isn't moving, we add a `setInterval` to keep sending the last captured location. So that our friends can track our last location, instead of disappearing from the map!

```js
 sendLocationInterval = setInterval(function () {
    // not using `triggerLocationChangeEvents` to keep the pipes different
    myLocationChannel.trigger('client-location', myLastKnownLocation)
  }, 5000);

// also update myLastKnownLocation everytime we trigger an event
function triggerLocationChangeEvents (channel, location) {
  // update myLastLocation
  myLastKnownLocation = location;
  channel.trigger('client-location', location);
}
```

## Step 4: Subscribe to Friend's location channels

- First up, code a div in `index.html` to enter friend's username.

```html
<div id="friends-box" class="name-box hidden">
  <h3 id="welcome-message"></h3>
  <h4 id="friends-list"></h4>
  <input id="friendName" type="text" placeholder="e.g. Shelly">
  <button id="addFriendButton">Add</button>
</div>
```

![](https://dl.dropboxusercontent.com/s/xgi7jed6fkj00qg/how-to-track-friends-realtime-matt.jpeg)

- Let's make the button functional by adding an event listener on it

```js
friendsAddButton.addEventListener('click', addFriend);
```

- So everytime you add a username, `addFriend` function would get called.

```js
function addFriend (e) {
  var friendName = friendNameInput.value;
  // if already present return
  if (friendsLocationMap[friendName]) return;
  if (friendName) {
    var friendChannelName = 'private-' + friendName;
    var friendChannel = pusher.subscribe(friendChannelName);
    friendChannel.bind('client-location', function (nextLocation) {
      // first save the location
      // bail if location is same
      var prevLocation = friendsLocationMap[friendName] || {};
      friendsLocationMap[friendName] = nextLocation;
      showFriendOnMap(friendName, false, true, prevLocation);
    });
  }

  // add the name to the list
  var friendTrackButton = document.createElement('button');
  friendTrackButton.classList.add('small');
  friendTrackButton.innerHTML = friendName;
  friendTrackButton.addEventListener('click', showFriendOnMap.bind(null, friendName, true, false, {}));
  friendsList.appendChild(friendTrackButton);
}

```

- In the above code, we first `subscribe` to the `private` Pusher channel of the friend.

```js
var friendChannelName = 'private-' + friendName;
var friendChannel = pusher.subscribe(friendChannelName);
```

- And listen to all the events triggered on that channel

```js
friendChannel.bind('client-location', function (nextLocation) {
  // first save the location
  // bail if location is same
  var prevLocation = friendsLocationMap[friendName] || {};
  friendsLocationMap[friendName] = nextLocation;
  showFriendOnMap(friendName, false, true, prevLocation);
});
```
- We keep the `event name`, same i.e. `client-location` as every user has a distinct channels.
- Read more about keeping the data private [here](https://pusher.com/docs/client_api_guide/client_channels).
- Each new event contains the latest location and we save that in an object to retrieve later.
- Also we take the help of another function to plot the location on a map, `showFriendOnMap`

```js
function showFriendOnMap (friendName, center, addMarker, prevLocation) {
  if (!friendsLocationMap[friendName]) return;
  // first center the map
  if (center) map.setCenter(friendsLocationMap[friendName]);
  var nextLocation = friendsLocationMap[friendName];
  
  // add a marker
  if ((prevLocation.lat === nextLocation.lat) && (prevLocation.lng === nextLocation.lng)) {
    return;
  }
  
  if (addMarker) {
    var marker = friendsMarkerMap[friendName];
    marker = marker || new google.maps.Marker({
      map: map,
      label: friendName,
      animation: google.maps.Animation.BOUNCE,
    });
    marker.setPosition(friendsLocationMap[friendName]);
    friendsMarkerMap[friendName] = marker;
  }
}
```
- The above function adds a marker at the new location on the map, and bails if the new location is same as previous location.
- Also if we're already tracking a friend, it updates the new location in the same marker.
- So that if the person is moving, you can see the marker moving on the map realtime. ZOMG! I KNOW! :D

## Step 5: Tracking multiple friends, all at once

- Now that you've learned how to track a friend in the above step, we can do it for multiple people
- Notice that we are also adding a button(`friendTrackButton`) for all the friends that we add via the textbox
- On clicking that button we'll center the screen with the last known location of that friend.

![](https://dl.dropboxusercontent.com/s/54syazt18blkuhw/how-to-track-friends-realtime-gary.jpeg) ![](https://dl.dropboxusercontent.com/s/aj6wewmja86qebb/how-to-track-friends-realtime-dorothy.jpeg)


## Next Steps
- Since we're using the awesome concept of Pusher Channels, we can easily build on top of it to track anything, friends, food parcel, or an e-commerce delivery
- Also, Google Maps API integration is a piece-of-cake.

## PS: [Pusher's realtime capability FTW!](https://pusher.com/)

## Running locally

- clone the repository
 
``` bash
  git clone git@github.com:ankeetmaini/track-friends.git
  cd track-friends
  npm install
  npm start
```
- open [http://localhost:5000](http://localhost:5000)
 
## Show me the code

- Code is hosted on GitHub [track-friends](https://github.com/ankeetmaini/track-friends)
 

