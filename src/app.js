(function () {
  var username;

  // reference for DOM nodes
  var saveNameButton = document.getElementById('saveNameButton');
  var saveNameBox = document.getElementById('name-box');
  var nameInput = document.getElementById('name');
  var welcomeHeading = document.getElementById('welcome-message');
  var deliveryHeroBox = document.getElementById('delivery-hero-box');
  var deliveryHeroesAddButton = document.getElementById('addDeliveryHeroButton');
  var deliveryHeroNameInput = document.getElementById('deliveryHeroName');
  var deliveryHeroesList = document.getElementById('delivery-heroes-list');

  // handy variables
  var locationWatcher;
  var myLastKnownLocation;
  var sendLocationInterval;
  var deliveryHeroesLocationMap = {};
  var deliveryHeroesMarkerMap = {};

  // mode - user's or delivery guy's
  var mode = getUrlParameter('mode') || 'user';

  // load the map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 14
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
  var pusher = new Pusher('INSERT_PUSHER_APP_KEY_HERE', {
    cluster: 'INSERT_PUSHER_CLUSTER_HERE',
    encrypted: true
  });

  // add eventlisteners
  saveNameButton.addEventListener('click', saveName);
  deliveryHeroesAddButton.addEventListener('click', addDeliveryHero);

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

      // create a private channel with the username
      createMyLocationChannel(username);
    }
    return;
  }

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

  // function to get a query param's value
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
}());