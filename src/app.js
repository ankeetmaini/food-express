(function () {
  var username;

  // reference for DOM nodes
  var saveNameButton = document.getElementById('saveNameButton');
  var saveNameBox = document.getElementById('name-box');
  var nameInput = document.getElementById('name');
  var welcomeHeading = document.getElementById('welcome-message');
  var friendsBox = document.getElementById('friends-box');
  var friendsAddButton = document.getElementById('addFriendButton');
  var friendNameInput = document.getElementById('friendName');
  var friendsList = document.getElementById('friends-list');

  // handy variables
  var locationWatcher;
  var myLastKnownLocation;
  var sendLocationInterval;
  var friendsLocationMap = {};

  // load the map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 18
  });

  // get the location via Geolocation API
  if ('geolocation' in navigator) {
    var currentLocation = navigator.geolocation.getCurrentPosition(function (position) {
      // save my last location
      var location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      myLastKnownLocation = location;
      map.setCenter(location);
    });
  }

  // initialize pusher
  var pusher = new Pusher('8f678e8983ef10e35ec1', {
    cluster: 'ap2',
    encrypted: true
  });

  // add eventlisteners
  saveNameButton.addEventListener('click', saveName);
  friendsAddButton.addEventListener('click', addFriend);

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

      // create a private channel with the username
      createMyLocationChannel(username);
    }
    return;
  }

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
      var marker = new google.maps.Marker({
        position: friendsLocationMap[friendName],
        map: map,
        label: friendName,
        animation: google.maps.Animation.BOUNCE,
      });
    }
  }

  function triggerLocationChangeEvents (channel, location) {
    // update myLastLocation
    myLastKnownLocation = location;
    channel.trigger('client-location', location);
  }

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
}());