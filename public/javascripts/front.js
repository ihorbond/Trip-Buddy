const mapKey = googleMapsKey;  //insert your key here
const mapScript = document.createElement('script');
let map;
let originPlaceId = null;
let destinationPlaceId = null;
mapScript.src = `https://maps.googleapis.com/maps/api/js?key=${mapKey}&libraries=places&callback=startMap`;
document.body.appendChild(mapScript);

// var obj = {
//   "originAddresses": [ "Greenwich, Greater London, UK", "13 Great Carleton Square, Edinburgh, City of Edinburgh EH16 4, UK" ],
//   "destinationAddresses": [ "Stockholm County, Sweden", "Dlouhá 609/2, 110 00 Praha-Staré Město, Česká republika" ],
//   "rows": [ {
//     "elements": [ {
//       "status": "OK",
//       "duration": {
//         "value": 70778,
//         "text": "19 hours 40 mins"
//       },
//       "distance": {
//         "value": 1887508,
//         "text": "1173 mi"
//       }
//     }, {
//       "status": "OK",
//       "duration": {
//         "value": 44476,
//         "text": "12 hours 21 mins"
//       },
//       "distance": {
//         "value": 1262780,
//         "text": "785 mi"
//       }
//     } ]
//   }, {
//     "elements": [ {
//       "status": "OK",
//       "duration": {
//         "value": 96000,
//         "text": "1 day 3 hours"
//       },
//       "distance": {
//         "value": 2566737,
//         "text": "1595 mi"
//       }
//     }, {
//       "status": "OK",
//       "duration": {
//         "value": 69698,
//         "text": "19 hours 22 mins"
//       },
//       "distance": {
//         "value": 1942009,
//         "text": "1207 mi"
//       }
//     } ]
//   } ]
// };

function startMap() {
  let myLocation;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      myLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(myLocation);
      const marker = new google.maps.Marker({
        position: myLocation,
        map: map,
        title: 'my location'
      });

    }, () => {
        map = new google.maps.Map(
        document.getElementById('map'), {
          zoom: 5,
          center: {
            lat: 40.136896,
            lng: -101.885741
          }
        }
      );
      new AutocompleteDirectionsHandler(map);
    });
  } else {
    window.alert('Your browser does not support geolocation service :/');
  }

     map = new google.maps.Map(
    document.getElementById('map'), {
      zoom: 10,
      center: myLocation
    });
  new AutocompleteDirectionsHandler(map);
}

class AutocompleteDirectionsHandler {
  constructor(map) {
    this.map                = map;
    this.originPlaceId      = null;
    this.destinationPlaceId = null;
    this.travelMode         = 'DRIVING';
    this.avoidTolls         = false;
    this.unitSystem         = google.maps.UnitSystem.IMPERIAL;
    this.gasPrice           = 2.50;
    this.mpg                = parseInt(document.getElementById('mpg').value);
    this.directionsService  = new google.maps.DirectionsService();
    this.directionsDisplay  = new google.maps.DirectionsRenderer();
    this.directionsDisplay.setMap(map);
    this.distanceResponse       = null;
    this.originInput            = document.getElementById('origin-input');
    this.destinationInput       = document.getElementById('destination-input');
    let originAutocomplete      = new google.maps.places.Autocomplete( this.originInput, { placeIdOnly: true });
    let destinationAutocomplete = new google.maps.places.Autocomplete( this.destinationInput, {placeIdOnly: true });

    this.checkPlaceChange(originAutocomplete, 'ORIG');
    this.checkPlaceChange(destinationAutocomplete, 'DEST');

  }


  calculateExpensesAndDisplayResults() {
     const distance   = parseInt(his.distanceResponse.rows[0].elements[0].distance.text);
     const travelTime = this.distanceResponse.rows[0].elements[0].duration.text;
     const amountOfGas= distance/this.mpg;
     const cost       = (amountOfGas * this.gasPrice).toFixed(2);
     $('#results').text(`Distance: ${distance}(${distance*1.6}km) | Travel Time: ${travelTime} | Cost of this trip: $${cost}
                        Gas Needed: ${amountOfGas}Gal (${amountOfGas*3.78}L)`);

  }

  getDistance() {
    const me          = this;
    // const origin      = document.getElementById('origin-input').value;
    // const destination = document.getElementById('destination-input').value;
    const service     = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
    {
      origins:      [this.originInput.value],
      destinations: [this.destinationInput.value],
      travelMode:   'DRIVING',
      unitSystem:    this.unitSystem,
      avoidTolls:    this.avoidTolls
    }, (response, status) => {
      if (status === "OK") {
        me.distanceResponse = response;
        me.calculateExpensesAndDisplayResults();
      }
      else {
        window.alert(`Failed to calculate distance due to ${status}`);
      }
    }
  );
}

  checkPlaceChange (autocomplete, mode) {
        const me = this;
        autocomplete.bindTo('bounds', this.map);
        autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
          if (!place.place_id) {
            window.alert("Please select an option from the dropdown list.");
            return;
          }
          if (mode === 'ORIG') {
            me.originPlaceId       = place.place_id;
          } else {
            me.destinationPlaceId  = place.place_id;
          }
          me.avoidTolls = document.getElementById('avoid-tolls').checked;
          me.route();
        });
      }

  route() {
    const me = this;
    if (!this.originPlaceId || !this.destinationPlaceId) return;
    //  console.log(this.originPlaceId);
    //  console.log(typeof this.originPlaceId);
    this.getDistance();
    this.directionsService.route({
      origin:      { 'placeId': this.originPlaceId },
      destination: { 'placeId': this.destinationPlaceId },
      travelMode:  this.travelMode,
      avoidTolls:  this.avoidTolls,
      unitSystem:  this.unitSystem
    }, (response, status) => {
      if (status === 'OK') {
        me.directionsDisplay.setDirections(response);
      } else {
        window.alert(`Directions request failed due to ${status}`);
      }
    });
  }
}
