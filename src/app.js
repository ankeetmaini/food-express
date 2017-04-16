(function () {
  var username;

  // reference for DOM nodes
  var saveNameButton = document.getElementById('saveNameButton');
  var saveNameBox = document.getElementById('name-box');
  var nameInput = document.getElementById('name');
  var welcomeHeading = document.getElementById('welcome-message');
  var friendsBox = document.getElementById('friends-box');

  // load the map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });

  // get the location via Geolocation API
  if ('geolocation' in navigator) {
    var currentLocation = navigator.geolocation.getCurrentPosition(function (position) {
      map.setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    });
  } else {
    // show a message to the user, that browser
    // doesn't support Geolocation API
    return;
  }

  // add eventlisteners
  // save name button
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
}());