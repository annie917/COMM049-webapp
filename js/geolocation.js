var markers = [];  //global array required to keep track of map markers

$(function() {
    
    /* Initialise button states */
    sortOutButtons(5);
    
    $("#butDirEH").click(function(event) {

        /* Get directions to Elvetham Heath from current location */
		    getDirections("EH");

    });

    $("#butDirFP").click(function(event) {

        /* Get directions to Fleet Pond from current location */
		    getDirections("FP");
		    
    });

    $("#butTrack").click(function(event) {

        /* Start watching position, storing a global Id */
        sortOutButtons(2);
 		watchId = navigator.geolocation.watchPosition(drawMarker, failure_handler);
                                             
    });
    
    $("#butStop").click(function(event) {

        /* Clear the watch and delete the marker */
        sortOutButtons(4);
        navigator.geolocation.clearWatch(watchId);
        deleteMarkers();
        
    });


});

function getDirections (destination) {
  
    if (navigator.geolocation) {
      
        sortOutButtons(0);
        /* geolocation is supported - warn user of delay and get position */
        navigator.geolocation.getCurrentPosition(function(position){drawRoute(destination, position);}, 
                                                 failure_handler);
                                             
    } else {
        
        /* Display warning message in relevant section */
        $("<div class='alert alert-warning'>Geolocation is not supported.</div>").appendTo("#parking");
          
    }

}

function drawRoute(destination, position) {

    /* Called on success of geolocation API */
    var destString;
    var destCoords = new Object();
    var currentPos = new Object();
    
    /* Set up destination for Google maps API, using place string */
    switch (destination) {
      
        case "EH":
            destString = "The+Key,Fleet+GU51";
            destCoords.lat = 51.2905817;
            destCoords.lng = -0.8573417;
            break;
        case "FP":
            destString = "Fleet+Pond+Nature+Reserve,+Fleet";
            destCoords.lat = 51.2909894;
            destCoords.lng = -0.8188462;
          break;
    }   
    
    /* Set up origin for Google maps API */
    currentPos.lat = position.coords.latitude;
    currentPos.lng = position.coords.longitude;

    /* Create the map */
    createMap(position); 
    
    /* Instantiate a directions renderer object, passing the map object */
    var directionsDisplay = new google.maps.DirectionsRenderer({
        map: googleMap});

    /* Set destination, origin and travel mode in request object */
    var request = {
        destination: destCoords,
        origin: currentPos,
        travelMode: 'DRIVING' };

    /* Instantiate a new directions service object and pass in the directions request */
    var directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function(response, status) {
        if (status == 'OK') {
            /* Display the route on the map. */
            directionsDisplay.setDirections(response);
            sortOutButtons(1);
         }
    });
    
    /* Assemble URL for google maps, using current position and destination and make href of open maps button */
    var url = "https://www.google.co.uk/maps/dir/" + position.coords.latitude + "," + position.coords.longitude + "/" + destString;
    $('#butOpenMaps').attr('href', url);

}

function failure_handler(error) {

    /* Called if geolocation api call fails */
    var reason;

    /* Set up user message depending on what went wrong */
    switch(error.code) {
      
        case error.PERMISSION_DENIED:
            reason = "user refused permission.";
            break;
        case error.POSITION_UNAVAILABLE:
            reason = "unable to obtain current position.";
            break;
        case error.TIMEOUT:
            reason = "request timed out.";
            break;
        default:
            reason = "for unknown reason.";
            break;
    }

    /* Display warning message */
    $("<div class='alert alert-warning'>Directions unavailable because " + reason + 
      "</div>").appendTo("#parking");
  
    sortOutButtons(5);
}


function createMap(position) {

    /* Creates a map canvas and draws a map centered on current position */ 
    $("<div id='gMap' class='mapCont' style='width:100%;height:500px'></div>").insertBefore("footer");  
    
    var mapCanvas = document.getElementById("gMap");
    var mapOptions = {
    center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)};
  
    googleMap = new google.maps.Map(mapCanvas, mapOptions); //No var keyword as need to be global

}

function drawMarker(position) {

    /* Called when user's position has changed */
    var currentPos = new Object();
   
    /* Set up position object for Google maps API */
    currentPos.lat = position.coords.latitude;
    currentPos.lng = position.coords.longitude;
    
    /* Delete previous markers and add a new one */
    deleteMarkers();
    addMarker(currentPos);
    sortOutButtons(3);

}

function sortOutButtons(stageCode) {
    
    /* Sets state of buttons and contents of information pane */
    

    switch (stageCode) {
        
        case 0: //Get directions clicked
            $("<div id='alertDir' class='alert alert-info'><span class='glyphicon glyphicon-hourglass'></span> Working....</div>").appendTo("#parking");
            $('.butDirect').attr('disabled', true);
            $('.alert-warning').remove()
            break;
        case 1: //Directions successfully obtained
            $('#butTrack').attr('disabled', false);
            $('#butOpenMaps').attr('disabled', false);
            document.getElementById('alertDir').innerHTML = "Directions displayed.";
            break;
        case 2: //Tracking started
            $('#butTrack').attr('disabled', true);
            document.getElementById('alertDir').innerHTML = "<span class='glyphicon glyphicon-hourglass'></span> Working....";
            break;
        case 3://Successful tracking
            $('#butStop').attr('disabled', false);
            document.getElementById('alertDir').innerHTML = "Tracking position.";
            break;
        case 4: //Tracking stopped
            $('#butStop').attr('disabled', true);
            $('#butTrack').attr('disabled', false);
            document.getElementById('alertDir').innerHTML = "Stopped tracking.";
            break;
        case 5: //Reset
            $('.butDirect').attr('disabled', false);
            $('#butTrack').attr('disabled', true);
            $('#butOpenMaps').attr('disabled', true);
            $('#butStop').attr('disabled', true);
            $('#alertDir').remove();
     
    }
}

/* Marker management functions courtesy of Google:
   https://developers.google.com/maps/documentation/javascript/examples/marker-remove */
       
// Adds a marker to the map and push to the array.
function addMarker(location) {
    
    var marker = new google.maps.Marker({
    position: location,
    map: googleMap,
    icon: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    });

    markers.push(marker);
}

// Sets the map on all markers in the array.
function setMapOnAll(googleMap) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(googleMap);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}

