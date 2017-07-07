const mapKey = googleMapsKey;  //insert your key here
const mapScript = document.createElement('script');
let map;
let mapHandler;
mapScript.src = `https://maps.googleapis.com/maps/api/js?key=${mapKey}&libraries=places&callback=startMap`;
document.body.appendChild(mapScript);

$('#cars-dropdown').on('change', () => {
    $("#mpg").val($("#cars-dropdown option:selected").val());
});

$('#calculate').on('click', () => {
  // console.log("CURRENT USER: " + user);
  mapHandler.route();
});

//currency converter widget
function reloadFiAdg9Fr1() {
  var sc = document.getElementById('scFiAdg9Fr1');
  if (sc) sc.parentNode.removeChild(sc);
  sc = document.createElement('script');
  sc.type = 'text/javascript';
  sc.charset = 'UTF-8';
  sc.async = true;
  sc.id = 'scFiAdg9Fr1';
  sc.src =
    'https://freecurrencyrates.com/en/widget-horizontal-editable?iso=USDGBPEURUAH&df=2&p=FiAdg9Fr1&v=fts&source=fcr&width=585&width_title=200&firstrowvalue=1&thm=A6C9E2,FCFDFD,4297D7,5C9CCC,FFFFFF,C5DBEC,FCFDFD,2E6E9E,000000&title=Currency%20Converter&tzo=240';
  var div = document.getElementById('gcw_mainFiAdg9Fr1');
  div.parentNode.insertBefore(sc, div);
}

// $.getJSON('http://anyorigin.com/go?url=http%3A//gasprices.aaa.com/&callback=?', data => {
// 	scrapedData = data.contents;
//   let begin   = scrapedData.indexOf('<table>');
//   let end     = scrapedData.indexOf('<div class="row-sm">');
//   let result  = scrapedData.slice(begin, end);
//   console.log(result);
//   $('#gas-prices').append(result);
// });

// $.getJSON('http://www.whateverorigin.org/get?url=' + encodeURIComponent('http://gasprices.aaa.com/') + '&callback=?', data => {
// 	console.log(data.contents);
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
$("#results").css("height", $("#inputs").height()+4);
reloadFiAdg9Fr1();

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
    mapHandler = new AutocompleteDirectionsHandler(map);
    });
  } else {
    window.alert('Your browser does not support geolocation service :/');
  }

     map = new google.maps.Map(
    document.getElementById('map'), {
      zoom: 10,
      center: myLocation
    });
  mapHandler = new AutocompleteDirectionsHandler(map);
}

//this class handles: autocompletion, route drawing, calculation of expenses.
class AutocompleteDirectionsHandler {
  constructor(map) {
    this.map                = map;
    this.originPlaceId      = null;
    this.destinationPlaceId = null;
    this.travelMode         = 'DRIVING';
    this.avoidTolls         = false;
    this.unitSystem         = google.maps.UnitSystem.IMPERIAL;
    this.gasPrice           = 2.20;
    this.mpg                = 29;
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

  convertStrToNum(data) {
    const dataArr = data.split('');
    let result = [];
    dataArr.forEach(el => {
      if(!isNaN(el) && el !== ',') {
        result.push(el);
      }
    });
    // console.log('RESULTL ' + parseInt(result.join('') ,10));
    return parseInt(result.join('') ,10);
  }

  calculateExpensesAndDisplayResults() {

    console.log(this.distanceMatrixResponse.rows[0].elements[0].distance.text);
    let distance = this.distanceMatrixResponse.rows[0].elements[0].distance.text;
     //chopping off ' mi' from the end of the string
     distance = distance.slice(0, -3);
     if (distance.length > 4) {
           distance      = this.convertStrToNum(this.distanceMatrixResponse.rows[0].elements[0].distance.text);
     }
     else distance       = parseFloat(this.distanceMatrixResponse.rows[0].elements[0].distance.text);
     const mpg           = parseInt(this.mpg, 10);
     const travelTime    = this.distanceMatrixResponse.rows[0].elements[0].duration.text;
     const amountOfGas   = (distance / mpg).toFixed(2);
     const cost          = (amountOfGas * this.gasPrice).toFixed(2);
    //  console.log(`${mpg}, ${this.distanceMatrixResponse.rows[0].elements[0].distance.text}, ${this.gasPrice} ${amountOfGas}, ${cost}`);
     $('#results-text').html(`<ul>
                            <li>Traveling from: <span class="result-values">${this.originInput.value}</span> </li>
                            <li>To: <span class="result-values">${this.destinationInput.value}</span></li>
                            <li>Distance: <span class="result-values">${distance}mi (${(distance*1.6).toFixed(2)}km)</span></li>
                            <li>Travel Time: <span class="result-values">${travelTime}</span></li>
                            <li>Gas Needed: <span class="result-values">${amountOfGas}Gal (${(amountOfGas*3.78).toFixed(2)}L)</span></li>
                            <hr>
                            <li> Cost of this trip: <b>$${cost}</b> </li>
                         <ul>`);
      $('#save').removeClass('hidden');
     if (typeof $('#origin') === 'object') {
       $('#origin').val(this.originInput.value);
       $('#destination').val(this.destinationInput.value);
       $('#distance').val(distance);
       $('#gas').val(amountOfGas);
       $('#cost').val(cost);
     }
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
        console.log("DISTANCE MATRIX: " + response);
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
        });
      }

  route() {
    const me = this;
    this.gasPrice   = document.getElementById('gas-price-input').value;
    this.mpg        = document.getElementById('mpg').value;
    this.avoidTolls = document.getElementById('avoid-tolls').checked;
    if (!this.originPlaceId || !this.destinationPlaceId || !this.mpg || !this.gasPrice) {
      window.alert ('Make sure to fill out all the fields');
      return;
}
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
