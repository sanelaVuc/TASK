var earthquakesMarkers = L.markerClusterGroup();
var citiesMarkers = L.markerClusterGroup();
var airportsMarkers = L.markerClusterGroup();


// Setup map
var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.locate({setView: true, maxZoom: 16});

// User actual location
function onLocationFound(e) {
    var radius = e.accuracy;

    var locationIcon = L.icon({
        iconUrl: 'libs/icons/location.png',
        iconSize: [40, 50],
        
    });

    L.marker(e.latlng, {icon: locationIcon}) .addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);

    
}

map.on('locationfound', onLocationFound);

function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);


$.ajax({
    url: "php/populateSelect.php",
    type: 'POST',
    dataType: 'json',
    success: function(result) {
        // For each data set append the select with id country with an option html element
        // with a value of the ISO code and name of the country name
        $.each(result.data, function(index) {
            $('#selectCountry').append($("<option>", {
                value: result.data[index].code,
                text: result.data[index].name
            })); 
        }); 
    },
});

// User Location
$(document).ready(function() {
    navigator.geolocation.getCurrentPosition(geolocationCallback,  errorLocationCallback);  
})
    
     


function errorLocationCallback(){
 

    var position = {
            coords:{
            latitude: "51.52255",
            longitude: "-0.10249"
            }
        }


        geolocationCallback(position);
}

function geolocationCallback( position ){
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    var latlng = new L.LatLng(lat, lng);

    map = map.setView(latlng, 8);

    $.ajax({
        url: "php/userLocation.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: lat,
            lng: lng,
        },
        success: function(resultUser) {
            const $select = document.querySelector('#selectCountry');
            $select.value = resultUser['data']['geonames'];
            $($select).trigger("change");
        },

        error: function(jqXHR, exception){
            errorajx(jqXHR, exception);
            console.log("latitude and longitude to country code");
        }
    });
}

// Get Country Shape
var currentBound = L.featureGroup([]);

$("#selectCountry").change(function(){

    //Get Shape
    $.ajax({
    url: "php/countryNav.php",
    type: 'POST',
    data:{
        iso: $('#selectCountry').val()
    },
    success: function (resultShape) {
        
            currentBound.clearLayers();
            
            
            L.geoJSON(resultShape['data'],{style:{color: '#00cc00', weight: 2, dashOffset: '0' } }).addTo(currentBound);
            currentBound.addTo(map);
            map.fitBounds(currentBound.getBounds()); 
    },
    error: function (err) {
        
    },
    complete: function(){
        
        
        // Country Information
        $.ajax({
            url: "php/countryInfo.php",
            type: 'GET',
            dataType: 'json',
            data: {
                country: $('#selectCountry').val()
            },
            success: function(resultInfo) {


                // Wikipedia Modal
                $.ajax({
                    url: "php/wikipedia.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        north: (resultInfo['data']['geonames']['0']['north']),
                        south: (resultInfo['data']['geonames']['0']['south']),
                        west: (resultInfo['data']['geonames']['0']['west']),
                        east: (resultInfo['data']['geonames']['0']['east']),
            
                    },
                    
                    success: function(resultWikipedia) {

                        
                        
                        $('#summary').html(resultWikipedia.data.geonames['0']['summary']);
                        $('#wikiLink').attr('href','https://' + resultWikipedia.data.geonames[0]['wikipediaUrl']);
                    },
        
                    error: function ajaxError(jqXHR) {
                        console.error('Error: ', jqXHR.responseText);
                    }
                });









                 // Earthquake Marker
                map.removeLayer(earthquakesMarkers);
                earthquakesMarkers.clearLayers();
                $.ajax({
                    url: "php/getEarthquakes.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        north: (resultInfo['data']['geonames']['0']['north']),
                        south: (resultInfo['data']['geonames']['0']['south']),
                        west: (resultInfo['data']['geonames']['0']['west']),
                        east: (resultInfo['data']['geonames']['0']['east']),
            
                    },
                    
                    success: function(resultEarthquakes) {
                       
                        var earthquakesIcon = L.icon ({
                            iconUrl: 'libs/icons/earthquake.png',
                            iconSize: [40, 50],
        
                        })
                        
                        resultEarthquakes['data'].forEach(earthquakes => {
                            
                            earthquakesMarkers.addLayer(L.marker([earthquakes.lat,earthquakes.lng] , {icon: earthquakesIcon}).bindPopup(`<b>Magnitude : </b> ${earthquakes.magnitude}`));
                            map.addLayer(earthquakesMarkers);
        
        
                        })
                    },
        
                    error: function ajaxError(jqXHR) {
                        console.error('Error: ', jqXHR.responseText);
                    }
                });



                //Timezone Modal
                $.ajax({
                    url: "php/getTimeZone.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        lat: (resultInfo['data']['geonames']['0']['north'] + resultInfo['data']['geonames']['0']['south'])/2,
                        lng: (resultInfo['data']['geonames']['0']['east'] + resultInfo['data']['geonames']['0']['west'])/2,
                        
                    },
                    success: function(resultTime) {
                        
                        if (resultTime.status.name == "ok") {


                            var time = resultTime.data.time.slice(10,13);
                            if (time <= 12) {
                                time=(" " + time + resultTime.data.time.slice(13) +" AM")
                            } else {
                                time=(" " + (time-12) + resultTime.data.time.slice(13) + " PM")
                            };

                            var sunrise = resultTime.data.sunrise.slice(10,13);
                            if (sunrise <= 12) {
                                sunrise=(" " + sunrise + resultTime.data.sunrise.slice(13) +" AM")
                            } else {
                                sunrise=(" " + (sunrise-12) + resultTime.data.sunrise.slice(13) + " PM") 
                            };


                            var sunset = resultTime.data.sunset.slice(10,13);
                            if (sunset <= 12) {
                                sunset=(" " + sunset + resultTime.data.sunset.slice(13) +" AM")
                            } else {
                                sunset=(" " + (sunset-12) + resultTime.data.sunset.slice(13) + " PM") 
                            };

                    
                            
                            $('#timezone').html(resultTime.data.time.slice(0,10));
                            $('#time').html(time);
                            $('#sunrise').html(' ' + sunrise);
                            $('#sunset').html(sunset);

                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(JSON.stringify(jqXHR));
                        console.log(JSON.stringify(textStatus));
                        console.log(JSON.stringify(errorThrown));
                    }
                });

                $.ajax({
                    url: "php/population.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        country: resultInfo['data']['geonames']['0']["isoAlpha3"]
                    },
                    success: function(resultPopulation) {
                        
                    
                        
                            $("#pop1970").html(regexNumber(resultPopulation['1970 Population']));
                            $("#pop1980").html(regexNumber(resultPopulation['1980 Population']));
                            $("#pop1990").html(regexNumber(resultPopulation['1990 Population']));
                            $("#pop2000").html(regexNumber(resultPopulation['2000 Population']));
                            $("#pop2010").html(regexNumber(resultPopulation['2010 Population']));
                            $("#pop2015").html(regexNumber(resultPopulation['2015 Population']));
                            $("#pop2020").html(regexNumber(resultPopulation['2020 Population']));
                            $("#pop2022").html(regexNumber(resultPopulation['2022 Population']));
                            $("#growth").html(resultPopulation['Growth Rate']);
                            $("#percentage").html(resultPopulation['World Population Percentage']);
                        
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(JSON.stringify(jqXHR));
                        console.log(JSON.stringify(textStatus));
                        console.log(JSON.stringify(errorThrown));
                    }
                });
              

                if (resultInfo.status.name == "ok") {
                   
                    $('#txtCapital').html(resultInfo['data']['geonames']['0']['capital']);
                    $('#listId').empty()
                    $('#txtLanguages').html(resultInfo['data']['geonames']['0']['languages'].split(',').forEach(language => $('#listId').append('<li>' +language+ '</li>')));
                    $('#txtArea').html(regexNumber(resultInfo['data']['geonames']['0']['areaInSqKm'] +  " Km&#178;"));
                    $('#txtPopulation').html(regexNumber(resultInfo['data']['geonames']['0']['population'])); 
                    $('#txtContinent').html(resultInfo['data']['geonames']['0']['continentName']);
                    $('#txtCurrency').html(resultInfo['data']['geonames']['0']['currencyCode']);
                    
                    
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(JSON.stringify(jqXHR));
                console.log(JSON.stringify(textStatus));
                console.log(JSON.stringify(errorThrown));
            }
        });


        // Country Flag Modal
        $.ajax({
            url: "php/getFlag.php",
            type: 'POST',
            dataType: 'json',
            data: {
                country: $('#selectCountry').val()
            },
            success: function(resultFlag) {

              
                if (resultFlag.status.name == "ok") {
                
                    $("#flag").attr("src", resultFlag["data"]["flag"]);
                
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(JSON.stringify(jqXHR));
                console.log(JSON.stringify(textStatus));
                console.log(JSON.stringify(errorThrown));
            }
        });


        





        }
    });
     
    // City Marker
    $(document).ready(function() {
        $.ajax({
            url: "php/getCities.php",
            type: 'POST',
            dataType: 'json',
            data: {
                country: $('#selectCountry').val()
    
            },
              
            success: function(resultCities) {
                
                
               
                var capitalIcon = L.icon({
                    iconUrl: 'libs/icons/capital.png',
                    iconSize: [40, 50],
                    
                });
                var cityIcon = L.icon({
                    iconUrl: 'libs/icons/city.png',
                    iconSize: [40, 40],
                });
                
                map.removeLayer(citiesMarkers);
                citiesMarkers.clearLayers()
                resultCities.forEach(city => {   
                    if(city.is_capital){
                        citiesMarkers.addLayer(L.marker([city.latitude, city.longitude], {icon: capitalIcon}).bindPopup(`<b>Capital : ${city.name}</b><br>
                        <b>Population</b>: ${city.population}<br>`));
                        
                        // Weather Modal
                        $.ajax({
                            url: "php/getWeather.php",
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                city: city.name
                            },
                            success: function(resultWeather) {
                               

                                    $('#name').html(resultWeather['name']);
                                    $('#weatherIcon').attr("src", "https://openweathermap.org/img/wn/" + resultWeather['weather'][0]['icon'] + "@2x.png");
                                    $('#description').html(resultWeather['weather'][0]['description'].toUpperCase());
                                    $('#temperature').html(Math.round((((resultWeather['main']['temp']-32) *5)/9))+ ' \u00B0C');
                                    $('#feelsLike').html(Math.round((((resultWeather['main']['feels_like']-32) *5)/9))+ ' \u00B0C');
                                    $('#tempMin').html(Math.round((((resultWeather['main']['temp_min']-32) *5)/9)) + ' \u00B0C');
                                    $('#tempMax').html(Math.round((((resultWeather['main']['temp_max']-32) *5)/9))+ ' \u00B0C');
                                    $('#wind').html(resultWeather['wind']['speed'] + 'mph');
                                    $('#humidity').html(resultWeather['main']['humidity'] + '%');
                                
                            },
                    
                            error: function(jqXHR, textStatus, errorThrown) {
                                         console.log(JSON.stringify(jqXHR));
                                         console.log(JSON.stringify(textStatus));
                                         console.log(JSON.stringify(errorThrown));
                                         
                                     }
                        });
                    }else{
                        citiesMarkers.addLayer(L.marker([city.latitude, city.longitude], {icon: cityIcon}).bindPopup(`<b>City : ${city.name}</b><br>
                        <b>Population</b>: ${city.population}<br>`));
                       
                    }  
                    
                   //Airports Marker
                     map.removeLayer(airportsMarkers);
                     airportsMarkers.clearLayers();
                     $.ajax({
                         url: "php/getAirports.php",
                         type: 'POST',
                         dataType: 'json',
                         data: {
                            country: $('#selectCountry').val(),
                             city: city.name
                         },
                         success: function(resultAirports) {
                           
                             var airportIcon = L.icon({
                                 iconUrl: 'libs/icons/airport.png',
                                 iconSize: [40, 50],
                             });
                             //TODO CHECK IF RESULT IS AN ARRAY, IF NOT, DON'T DISPLAY AIRPORTS AND PRINT ON CLG
                             //NO AIRPORTS FOUND OR ERROR.
                             if(Array.isArray(resultAirports))
                             resultAirports.forEach(airports => {
                                             
                                 airportsMarkers.addLayer(L.marker([airports.latitude,airports.longitude] , {icon: airportIcon}).bindPopup(`${airports.name}`));
                                 map.addLayer(airportsMarkers);
 
 
                             })
                         },

                         error: function(jqXHR, textStatus, errorThrown) {
                             console.log(JSON.stringify(jqXHR));
                             console.log(JSON.stringify(textStatus));
                             console.log(JSON.stringify(errorThrown));
                             
                         }
                     });


                });

                
                     
                map.addLayer(citiesMarkers);
                
            },
    
            error: function ajaxError(jqXHR) {
                console.error('Error: ', jqXHR.responseText);
            }
        });
    });
    
  

});


function regexNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

function regexTransformDotsToCommas(x){
    return x.toString().replace(/\./g, ',');
}

// Country Information Button
btn = L.easyButton('<i class="fa-solid fa-info"></i>',function(btn,map){
    $('#countryModal').modal('show');
    }).addTo(map);
    btn.button.style.backgroundColor = 'antiquewhite';
    btn.button.style.border = 'none';
    

// 

// Flag Modal
btn = L.easyButton('<i class="fa-regular fa-flag"></i>',function(btn,map){
    $('#flagModal').modal('show');
    }).addTo(map);
    btn.button.style.backgroundColor = 'antiquewhite';
    btn.button.style.border = 'none';
  



// Time Zone Modal Button
btn = L.easyButton('<i class="fa-regular fa-clock"></i>',function(btn,map){
    $('#timeModal').modal('show');
    }).addTo(map);
    btn.button.style.backgroundColor = 'antiquewhite';
    btn.button.style.border = 'none';
   


// Weather Modal Button
btn = L.easyButton('<i class="fa-regular fa-sun"></i>',function(btn,map){
    $('#weatherModal').modal('show');
    }).addTo(map);
    btn.button.style.backgroundColor = 'antiquewhite';
    btn.button.style.border = 'none';
   


// Population Modal
btn = L.easyButton('<i class="fa-solid fa-person"></i>',function(btn,map){
    $('#populationModal').modal('show');
    }).addTo(map);
    btn.button.style.backgroundColor = 'antiquewhite';
    btn.button.style.border = 'none';
 


 // Wikipedia Modal
 btn = L.easyButton('<i class="fa-brands fa-wikipedia-w"></i>',function(btn,map){
    $('#wikipediaModal').modal('show');
    }).addTo(map);
    btn.button.style.backgroundColor = 'antiquewhite';
    btn.button.style.border = 'none';