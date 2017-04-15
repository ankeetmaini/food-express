(function () {
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
}());