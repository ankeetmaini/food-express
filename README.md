# How To Track My Pizza, Realtime with Pusher and Google Maps

I was really hungry the other night and ordered  something old school style, called up this small canteen which has some delicious, fresh and mouth-watering pizza!  Now they did not have a tracker app and I couldn't wait to hog on the cheesy deliciousness so I decided to track it myself!

It wasn't much of an effort though, thanks to the great Pusher APIs the task was easy peasy! So I gave [this link](https://food-express.herokuapp.com/?mode=delivery) to my delivery hero (Anyone who delivers pizza is a hero) and he having a better smart phone than I do, got on-board quickly and I could track my pizza! :D

To give you a sneak peak this is how our app will look at the end of this post.


![](https://dl.dropboxusercontent.com/s/0xthtu3rdh7nv4v/how-to-track-my-pizza-realtime-with-pusher-and-google-maps-animation.gif)


## Step 0: Setting up our app

- Start off by creating an `index.html` with this code snippet.
- Our humble [`index.html`](https://github.com/ankeetmaini/food-express/blob/master/index.html) doesn't do much except including a `meta` tag in the `head` section so that our app looks crisp and works great in mobile browsers as well. 

``` html
<!DOCTYPE html>
<html>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <head>
    <title>Realtime Tracking with Pusher</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1>Food Express - Track your food delivery realtime!</h1>
  </body>
</html>
```

- Since we'll be using [Google Maps](https://maps.google.com/), let's add their [JavaScript API](https://developers.google.com/maps/documentation/javascript/) and see the map in action!
- But before you could integrate [Google Maps](https://maps.google.com/) you need to get your key. [Click here to get the key](https://developers.google.com/maps/documentation/javascript/get-api-key)
- Once you get the key, copy it, and include their JS file in the `index.html`. Also add the  script tag for `app.js` which will contain our app's code.
- We'll also add a CSS file `app.css` for making our app look nice!
- This is how your `index.html` will look like 

``` html
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
      <h1>Food Express - Track your food delivery realtime!</h1>
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

``` js
(function () {
  // load the map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
}());
```

![](https://dl.dropboxusercontent.com/s/b7fsvp8wm2stzhk/how-to-track-my-pizza-realtime-with-pusher-and-google-maps-opening.png)

## Step 1: Capture device's location

- We'll use Web's [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation) to get the user's location on start-up
- With this code, we get the location and centre the map. See we're already into delivering a personalized experience! 

``` js
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

## Step 2: Capture *username*

- It's important to capture a *username* to identify my Delivery Hero on the map
- Let's code a `div` which will take input and store it in-memory.
- Add the following code in `index.html` 

``` html
<div id="name-box" class="name-box">
  <h3>Enter your username</h3>
  <input id="name" type="text" placeholder="e.g. Mike">
  <button id="saveNameButton">Save</button>
</div>
```

- And some JavaScript to get the name 

``` js
var username;

// reference for DOM nodes
var saveNameButton = document.getElementById('saveNameButton');
var saveNameBox = document.getElementById('name-box');
var nameInput = document.getElementById('name');
var welcomeHeading = document.getElementById('welcome-message');
var deliveryHeroBox = document.getElementById('delivery-hero-box');

saveNameButton.addEventListener('click', saveName);

// all functions, event handlers
function saveName (e) {
  var input = nameInput.value;
  if (input && input.trim()) {
    username = input;

    // hide the name box
    saveNameBox.classList.add('hidden');

    // set the name
    welcomeHeading.innerHTML = 'Hi! <strong>' + username +
      (mode === 'user'
        ? '</strong>, type in your Delivery Hero\'s name to track your food.' 
        : '</strong>, type in the customer name to locate the address');
    // show the delivery hero's div now
     deliveryHeroBox.classList.remove('hidden');
  }
  return;
}
```



![](https://dl.dropboxusercontent.com/s/wcmow4qr7jbydp3/how-to-track-my-pizza-realtime-with-pusher-and-google-maps-login.png)

## Step 3: Set up tracking logic, send events on location change

- To **track location of our pizza** we'll use [Pusher's real time capabilities](https://pusher.com/). We'll trigger events whenever we change our location and also at the same time listen for the location change events of our Delivery Hero.
- [Signup for Pusher](https://pusher.com/signup), or [Login](https://dashboard.pusher.com/accounts/sign_in) if you already have an account.
- Once you login, create an app by giving an `app-name` and choosing a `cluster` in the *Create App* screen
- Now that we've registered and created the app, add `Pusher's JavaScript library` in your `index.html` 

``` html
<script src="https://js.pusher.com/4.0/pusher.min.js"></script>
```

- Connect to your app by calling the `Pusher` constructor with your `app key` as shown in the below line 

``` js
var pusher = new Pusher('<INSERT_PUSHER_APP_KEY_HERE>', {
  cluster: '<INSERT_PUSHER_CLUSTER_HERE>',
  encrypted: true
});
```

- Next, I need to start triggering events when my location changes, so that my Delivery Hero knows that I am at my friend's place now. ( He said he was hungry too and I am a good guy :D ).
- While we'll trigger events for our location change, we need to secure these events so that only intended recipients can track us. We'll accomplish this by using [Pusher's Channel concept](https://pusher.com/docs/client_api_guide/client_channels)
- [Channels](https://pusher.com/docs/client_api_guide/client_channels) are a way to filter and secure events. In our app each user will be represented as a `channel`. We'll be using Pusher's [Private Channels](https://pusher.com/docs/client_api_guide/client_private_channels) 

``` js
var myLocationChannel = pusher.subscribe('private-<USERNAME>');
```

- A `channel` will be named after the username chosen by the user, and with this the other party can subscribe and listen the location change events for a particular user.
- To use private channels, you must be authenticated. [Pusher makes writing an auth server very easy](https://pusher.com/docs/authenticating_users#authEndpoint). I used their NodeJS template [here](https://pusher.com/docs/authenticating_users#implementing_private_endpoints).
- My [server.js](https://github.com/ankeetmaini/food-express/blob/master/server.js) looks like this 

``` js
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
  secret:  'INSERT_YOUR_SECRET_HERE',
  cluster: '<INSERT_PUSHER_CLUSTER_HERE>'
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
- `Client Events` should start with `client-`. (Note that `Client Events` have a number of restrictions that are important to know about while creating your awesome app. [Read more about them here.](https://pusher.com/docs/client_api_guide/client_events#trigger-events))
- On startup we create a channel using the below code, and then send our client events to it every time we change location
- We'll also save the last location in an object (`myLastKnownLocation`) for later retrieval 

``` js
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

- To handle the case when the user isn't moving, we add a `setInterval` to keep sending the last captured location. This means that my Delivery Hero can track my last location, if I dozed off! 

``` js
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

## Step 4: Subscribe to Delivery Hero's location channels

- First up, code a div in `index.html` to enter Delivery Hero's username. 

``` html
  <div id="delivery-hero-box" class="name-box hidden">
     <h3 id="welcome-message"></h3>
     <h4 id="delivery-heroes-list"></h4>
     <input id="deliveryHeroName" type="text" placeholder="e.g. Shelly">
     <button id="addDeliveryHeroButton">Add</button>
  </div>
```

![](https://dl.dropboxusercontent.com/s/ogoql8oby807t77/how-to-track-my-pizza-realtime-with-pusher-and-google-maps-sam.png)

Let's make the button functional by adding an event listener on it

``` js
deliveryHeroesAddButton.addEventListener('click', addDeliveryHero);
```

- So every time you add a username, `addDeliveryHero` function would get called. 

``` js
function addDeliveryHero (e) {
    var deliveryHeroName = deliveryHeroNameInput.value;
    // if already present return
    if (deliveryHeroesLocationMap[deliveryHeroName]) return;
    if (deliveryHeroName) {
      var deliveryHeroChannelName = 'private-' + deliveryHeroName;
      var deliveryHeroChannel = pusher.subscribe(deliveryHeroChannelName);
      deliveryHeroChannel.bind('client-location', function (nextLocation) {
        // first save the location
        // bail if location is same
        var prevLocation = deliveryHeroesLocationMap[deliveryHeroName] || {};
        deliveryHeroesLocationMap[deliveryHeroName] = nextLocation;
        showDeliveryHeroOnMap(deliveryHeroName, false, true, prevLocation);
      });
    }

    // add the name to the list
    var deliveryHeroTrackButton = document.createElement('button');
    deliveryHeroTrackButton.classList.add('small');
    deliveryHeroTrackButton.innerHTML = deliveryHeroName;
    deliveryHeroTrackButton.addEventListener('click', showDeliveryHeroOnMap.bind(null, deliveryHeroName, true, false, {}));
    deliveryHeroesList.appendChild(deliveryHeroTrackButton);
  }
```

- In the above code, we first `subscribe` to the `private` Pusher channel of the hero. 

``` js
var deliveryHeroChannelName = 'private-' + deliveryHeroName;
var deliveryHeroChannel = pusher.subscribe(deliveryHeroChannelName);
```

- And listen to all the events triggered on that channel 

``` js
deliveryHeroChannel.bind('client-location', function (nextLocation) {
   // first save the location
   // bail if location is same
   var prevLocation = deliveryHeroesLocationMap[deliveryHeroName] || {};
   deliveryHeroesLocationMap[deliveryHeroName] = nextLocation;
   showDeliveryHeroOnMap(deliveryHeroName, false, true, prevLocation);
});
```

- We keep the `event name`, same i.e. `client-location` as every user has a distinct channel.
- Read more about keeping the data private [here](https://pusher.com/docs/client_api_guide/client_channels).
- Each new event contains the latest location and we save that in an object to retrieve later.
- Also we take the help of another function to plot the location on a map, `showDeliveryHeroOnMap` 

``` js
function showDeliveryHeroOnMap (deliveryHeroName, center, addMarker, prevLocation) {
    if (!deliveryHeroesLocationMap[deliveryHeroName]) return;
    // first center the map
    if (center) map.setCenter(deliveryHeroesLocationMap[deliveryHeroName]);
    var nextLocation = deliveryHeroesLocationMap[deliveryHeroName];
    
    // add a marker
    if ((prevLocation.lat === nextLocation.lat) && (prevLocation.lng === nextLocation.lng)) {
      return;
    }
    
    if (addMarker) {
      var marker = deliveryHeroesMarkerMap[deliveryHeroName];
      marker = marker || new google.maps.Marker({
        map: map,
        label: deliveryHeroName,
        animation: google.maps.Animation.BOUNCE,
      });
      marker.setPosition(deliveryHeroesLocationMap[deliveryHeroName]);
      deliveryHeroesMarkerMap[deliveryHeroName] = marker;
    }
  }

```

- The above function adds a marker at the new location on the map, and bails if the new location is same as previous location.
- Also if we're already tracking a hero, it updates the new location in the same marker.
- So that if the person is moving, you can see the marker moving on the map in realtime. ZOMG! I KNOW! More excited because as soon as I finish writing this I can eat my tracked pizza! :D 

## Step 5: Finding multiple heroes, all at once

- Now that you've learned how to find a Delivery Hero in the above step, we can do it for multiple heroes. Yay! I am a foodie and I know it.
- Notice that we are also adding a button(`deliveryHeroTrackButton`) for all the heroes that we add via the textbox
- On clicking that button we'll center the screen with the last known location of that Delivery Hero. 

## Next Steps

- Since we're using the awesome concept of Pusher Channels, we can easily build on top of it to track anything, food parcel or an e-commerce delivery
- Also, Google Maps API integration is a piece-of-cake. 

## PS: [Pusher's realtime capability FTW!](https://pusher.com/)

## Running locally

- clone the repository 

``` bash
  git clone git@github.com:ankeetmaini/food-express.git
  cd food-express
  npm install
  npm start
```
- Generate Pusher API keys and insert in `src/app.js` as well as `server.js`
- Generate Google Maps API key and add in `index.html`

- open [http://localhost:5000](http://localhost:5000) 

## Running the Demo

- To track your food delivery open [https://food-express.herokuapp.com/](https://food-express.herokuapp.com)
- Login with your username, any name for sake of simplicity
- The Delivery Hero should also Login at this address [https://food-express.herokuapp.com/?mode=delivery](https://food-express.herokuapp.com/?mode=delivery)
- In a typical Food Delivery service, once you place an order, you receive some confirmation with the expected time of delivery and Delivery person's contact information and name/username. Assuming you received an SMS/E-mail of the same
- Type in the username of the Delivery person to track your Food!

## Show me the code

- Code is hosted on  [GitHub](https://github.com/ankeetmaini/food-express) 