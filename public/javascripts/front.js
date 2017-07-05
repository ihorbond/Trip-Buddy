const mapKey = googleMapsKey;  //insert your key here
const mapScript = document.createElement('script');
let map;
let originPlaceId = null;
let destinationPlaceId = null;
mapScript.src = `https://maps.googleapis.com/maps/api/js?key=${mapKey}&libraries=places&callback=startMap`;
document.body.appendChild(mapScript);

// $.getJSON('http://anyorigin.com/go?url=http%3A//gasprices.aaa.com/&callback=?', data => {
// 	scrapedData = data.contents;
//   let begin   = scrapedData.indexOf('<table>');
//   let end     = scrapedData.indexOf('<div class="row-sm">');
//   let result  = scrapedData.slice(begin, end);
//   console.log(result);
//   $('#gas-prices').append(result);
// });
const gasPrices = `<table>
            <thead>
                <tr>
                    <th></th>
                    <th>Regular</th>
                    <th>Mid-Grade</th>
                    <th>Premium</th>
                    <th>Diesel</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Current Avg.</td>
                    <td>$2.232</td>
                    <td>$2.535</td>
                    <td>$2.783</td>
                    <td>$2.441</td>
                </tr>
                <tr>
                    <td>Yesterday Avg.</td>
                    <td>$2.234</td>
                    <td>$2.540</td>
                    <td>$2.786</td>
                    <td>$2.441</td>
                </tr>
                <tr>
                    <td>Week Ago Avg.</td>
                    <td>$2.254</td>
                    <td>$2.558</td>
                    <td>$2.805</td>
                    <td>$2.449</td>
                </tr>
                <tr>
                    <td>Month Ago Avg.</td>
                    <td>$2.376</td>
                    <td>$2.657</td>
                    <td>$2.900</td>
                    <td>$2.511</td>
                </tr>
                <tr>
                    <td>Year Ago Avg.</td>
                    <td>$2.272</td>
                    <td>$2.538</td>
                    <td>$2.774</td>
                    <td>$2.372</td>
                </tr>
            </tbody>
        </table>
        `;

$('#gas-prices').append(gasPrices);

// scrapeResults();
// $.ajax({
//   url: "http://anyorigin.com/go?url=http%3A//gasprices.aaa.com/",
//   dataType: "jsonp", //jsonP only since json runs into CORS bomb
//   callback: "scrapeResults"
// });



// $.getJSON('http://www.whateverorigin.org/get?url=' + encodeURIComponent('http://gasprices.aaa.com/') + '&callback=?', data => {
// 	console.log(data.contents);
// });
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
        title: 'You are here'
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
    this.gasPrice           = 2.20;
    this.directionsService  = new google.maps.DirectionsService();
    this.directionsDisplay  = new google.maps.DirectionsRenderer();
    this.directionsDisplay.setMap(map);
    this.distanceMatrixResponse = null;
    this.originInput            = document.getElementById('origin-input');
    this.destinationInput       = document.getElementById('destination-input');
    let originAutocomplete      = new google.maps.places.Autocomplete( this.originInput, { placeIdOnly: true });
    let destinationAutocomplete = new google.maps.places.Autocomplete( this.destinationInput, {placeIdOnly: true });

    this.checkPlaceChange(originAutocomplete, 'ORIG');
    this.checkPlaceChange(destinationAutocomplete, 'DEST');

  }

  calculateExpensesAndDisplayResults() {
     const mpg           = parseInt(document.getElementById('mpg').value, 10);
     const distance      = parseFloat(this.distanceMatrixResponse.rows[0].elements[0].distance.text);
     const travelTime    = this.distanceMatrixResponse.rows[0].elements[0].duration.text;
     const amountOfGas   = (distance / mpg).toFixed(2);
     const cost          = (amountOfGas * this.gasPrice).toFixed(2);
     $('#results-text').html(`<ul>
                            <li>Traveling from: <span class="result-values">${this.originInput.value}</span> </li>
                            <li>To: <span class="result-values">${this.destinationInput.value}</span></li>
                            <li>Distance: <span class="result-values">${distance}mi (${(distance*1.6).toFixed(2)}km)</span></li>
                            <li>Travel Time: <span class="result-values">${travelTime}</span></li>
                            <li>Gas Needed: <span class="result-values">${amountOfGas}Gal (${(amountOfGas*3.78).toFixed(2)}L)</span></li>
                            <hr>
                            <li> Cost of this trip: <b>$${cost}</b> </li>
                         <ul>`);
  }

  getDistance() {
    const me          = this;
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
        me.distanceMatrixResponse = response;
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
