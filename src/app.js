(function () {
  var username;

  // reference for DOM nodes
  var saveNameButton = document.getElementById('saveNameButton');
  var saveNameBox = document.getElementById('name-box');
  var nameInput = document.getElementById('name');
  var welcomeHeading = document.getElementById('welcome-message');
  var friendsBox = document.getElementById('friends-box');

  // handy variables
  var locationWatcher;
  var myLastKnownLocation;
  var sendLocationInterval;

  // load the map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 18
  });

  // get the location via Geolocation API
  if ('geolocation' in navigator) {
    var currentLocation = navigator.geolocation.getCurrentPosition(function (position) {
      // save my last location
      myLastKnownLocation = position;
      map.setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    });
  }

  // initialize pusher
  var pusher = new Pusher('8f678e8983ef10e35ec1', {
    cluster: 'ap2',
    encrypted: true
  });

  // add eventlisteners
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

      // create a private channel with the username
      createMyLocationChannel(username);
    }
    return;
  }

  function triggerLocationChangeEvents (channel, position) {
    // update myLastLocation
    myLastKnownLocation = position;
    channel.trigger('client-location', { position: position });
  }

  function createMyLocationChannel (name) {
    var myLocationChannel = pusher.subscribe('private-' + name);
    myLocationChannel.bind('pusher:subscription_succeeded', function() {
      // safe to now trigger events
      // use the watchPosition API to watch the changing location
      // and trigger events with new coordinates
      locationWatcher = navigator.geolocation.watchPosition(function(position) {
        triggerLocationChangeEvents(myLocationChannel, position);
      });

      // also start a setInterval to keep sending the loction every 5 secs
      sendLocationInterval = setInterval(function () {
        console.log(myLastKnownLocation);
        // not using `triggerLocationChangeEvents` to keep the pipes different
        myLocationChannel.trigger('client-location', { position: myLastKnownLocation })
      }, 5000);
    });
  }
}());