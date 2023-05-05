var earthquakesMarkers = L.markerClusterGroup({
    polygonOptions: {
        fillColor: 'green',
        color: 'black',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
}});
var citiesMarkers = L.markerClusterGroup({
    polygonOptions: {
        fillColor: 'green',
        color: 'black',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
}});
var airportsMarkers = L.markerClusterGroup({
    polygonOptions: {
        fillColor: 'green',
        color: 'black',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
}});

// Setup map

var streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var basemaps = {
        "Streets": streets,
        "Satellite": satellite
      };

var map = L.map('map',{
    layers: [streets]
}).setView([54.5, -4], 6);

var overlays = {
    "Airports": airportsMarkers,
    "Cities": citiesMarkers,
    "Eartquakes": earthquakesMarkers
  };

var layerControl = L.control.layers(basemaps, overlays).addTo(map);



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
    $(".loader").fadeOut("slow");
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    var latlng = new L.LatLng(lat, lng);

    map = map.setView(latlng, 4);

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
      
        
//------- Country Information
        $.ajax({
            url: "php/countryInfo.php",
            type: 'GET',
            dataType: 'json',
            data: {
                country: $('#selectCountry').val()
            },
            success: function(resultInfo) {

                

 //------------- News Modal
                $.ajax({
                    url: "php/getNews.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        country: $('#selectCountry').val()
                    },
                    success: function(resultNews) {
                        const data = resultNews.data.articles;

                       
                        if (resultNews.status.name == "ok") {
                            if (data.length === 0) {
                                $("#title1").html('').empty();
                                $("#title1").html('').append('No news available for this country');
                                $('#Link1').html('').empty('');

                               
                                $("#title2").html('').empty();
                                $('#Link2').html('').empty('');

                                $("#title3").html('').empty();
                                $('#Link3').html('').empty('');
                              }
                    
                            $("#title1").html(data['0'].title);
                            $('#Link1').attr('href', data['0'].url);
                            $("#title2").html(data['1'].title);
                            $('#Link2').attr('href', data['1'].url);
                            $("#title3").html(data['2'].title);
                            $('#Link3').attr('href', data['2'].url);
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(JSON.stringify(jqXHR));
                        console.log(JSON.stringify(textStatus));
                        console.log(JSON.stringify(errorThrown));
                    }
                });





//-------------- Earthquake Marker
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
                       
                        var earthquakesIcon = L.ExtraMarkers.icon({
                            icon: 'fa-solid fa-house-crack',
                            iconColor: 'black',
                            markerColor: 'red',
                            shape: 'star',
                            prefix: 'fa'
                            
                        });

                        
                        
                        resultEarthquakes['data'].forEach(earthquakes => {

                            var date =  Date.parse(`${earthquakes.datetime}`).toString("ddd, MMM dd, yyyy");
                            var time =  Date.parse(`${earthquakes.datetime}`).toString("h:mm:ss tt");
                            earthquakesMarkers.addLayer(L.marker([earthquakes.lat,earthquakes.lng] , {icon: earthquakesIcon}).bindTooltip(date + `<br>` + time + `<br>Magnitude: ${earthquakes.magnitude}`));
                            
                            map.addLayer(earthquakesMarkers);
                          
        
                        })
                    },
        
                    error: function ajaxError(jqXHR) {
                        console.error('Error: ', jqXHR.responseText);
                    }
                });




//--------------Timezone Modal
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

                            var gmtOffset = resultTime.data.gmtOffset;
                            if (gmtOffset>=0) {
                                gmtOffset = "+ " + gmtOffset
                            };
                            
                            $('#timezone').text(Date.parse(resultTime.data.time).toString("MMMM dS, yyyy"));
                            $('#utc').html(gmtOffset);
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

              
// ----------Population Modal
                $.ajax({
                    url: "php/population.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        country: resultInfo['data']['geonames']['0']["isoAlpha3"]
                    },
                    success: function(resultPopulation) {
                        
                    
                        
                            $("#pop1970").html(numeral(resultPopulation['1970 Population']).format('0,0'));
                            $("#pop1980").html(numeral(resultPopulation['1980 Population']).format('0,0'));
                            $("#pop1990").html(numeral(resultPopulation['1990 Population']).format('0,0'));
                            $("#pop2000").html(numeral(resultPopulation['2000 Population']).format('0,0'));
                            $("#pop2010").html(numeral(resultPopulation['2010 Population']).format('0,0'));
                            $("#pop2015").html(numeral(resultPopulation['2015 Population']).format('0,0'));
                            $("#pop2020").html(numeral(resultPopulation['2020 Population']).format('0,0'));
                            $("#pop2022").html(numeral(resultPopulation['2022 Population']).format('0,0'));
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
                    $('#txtArea').html(numeral(resultInfo['data']['geonames']['0']['areaInSqKm']).format('0,0') +  " km&#178;"); 
                    $('#txtPopulation').html(numeral(resultInfo['data']['geonames']['0']['population']).format('0,0')); 
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

       

// -----Country Flag 
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
     
 //------- City Marker
    $(document).ready(function() {
        $.ajax({
            url: "php/getCities.php",
            type: 'POST',
            dataType: 'json',
            data: {
                country: $('#selectCountry').val()
               
            },
              
            success: function(resultCities) {
                
                
               
                var capitalIcon = L.ExtraMarkers.icon({
                    icon: ' fa-landmark-flag',
                    iconColor: 'white',
                    markerColor: 'red',
                    shape: 'square',
                    prefix: 'fa'
                    
                });
                var cityIcon = L.ExtraMarkers.icon({
                    icon: "fa-regular fa-building",
                    iconColor: 'white',
                    markerColor: 'green',
                    shape: 'circle',
                    prefix: 'fa'
                });
                
                map.removeLayer(citiesMarkers);
                citiesMarkers.clearLayers()
                resultCities.forEach(city => { 
                    var cityPop = numeral(`${city.population}`).format('0,0'); 
                    if(city.is_capital){
                        citiesMarkers.addLayer(L.marker([city.latitude, city.longitude], {icon: capitalIcon}).bindTooltip(`${city.name}` + `<br>` + cityPop));
                        
                    

 //--------------Airports Marker
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
                       
                         var airportIcon = L.ExtraMarkers.icon({
                            icon: "fa-solid fa-plane",
                            iconColor: 'black',
                            markerColor: 'blue',
                            shape: 'penta',
                            prefix: 'fa'
                        });
                         //TODO CHECK IF RESULT IS AN ARRAY, IF NOT, DON'T DISPLAY AIRPORTS AND PRINT ON CLG
                         //NO AIRPORTS FOUND OR ERROR.
                         if(Array.isArray(resultAirports)){
                         resultAirports.forEach(airports => 
                            
                        {
                                         
                             airportsMarkers.addLayer(L.marker([airports.latitude,airports.longitude] , {icon: airportIcon}).bindTooltip(`${airports.name}`));
                             map.addLayer(airportsMarkers);


                         })}
                     },

                     error: function(jqXHR, textStatus, errorThrown) {
                         console.log(JSON.stringify(jqXHR));
                         console.log(JSON.stringify(textStatus));
                         console.log(JSON.stringify(errorThrown));
                         
                     }
                 });

                    
 //-------------------- Weather Modal
                        $.ajax({
                            url: "php/getWeather.php",
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                city: city.name
                            },
                            success: function(resultWeather) {
                               


                                         // FORECAST + Weather
                                         $.ajax({
                                            url: "php/getNewWeather.php",
                                            type: 'POST',
                                            dataType: 'json',
                                            data: {
                                               
                                                lat: (resultWeather['coord']['lat']),
                                               lng: (resultWeather['coord']['lon']),
                                            },
                                            success: function(resultNewWeather) {
                                
                                                
                                                $('#name').html(resultWeather['name']);
                                                $('#weatherIcon').attr("src", resultNewWeather.data.current.condition.icon);
                                                $('#iconText').html(resultNewWeather.data.current.condition.text);
                                                $('#maxTemp').html(Math.round(resultNewWeather.data.current.temp_c) + ' \u00B0C');
                                                $('#minTemp').html(Math.round(resultNewWeather.data.forecast.forecastday['0'].day.mintemp_c) + ' \u00B0C');
                                                $('#wind').html(resultNewWeather.data.current.wind_mph + ' mph');
                                                $('#humidity').html(resultNewWeather.data.current.humidity + ' %');
                                                $('#rain').html(resultNewWeather.data.forecast.forecastday['0'].day.daily_chance_of_rain + ' %');
                                                $('#day1Date').text(Date.parse(resultNewWeather.data.forecast.forecastday['1'].date).toString("ddd dS"));;
                                                $('#day1Icon').attr("src", resultNewWeather.data.forecast.forecastday['1'].day.condition.icon);
                                                $('#day1TempMax').html(Math.round(resultNewWeather.data.forecast.forecastday['1'].day.maxtemp_c) + ' \u00B0C');
                                                $('#day1TempMin').html(Math.round(resultNewWeather.data.forecast.forecastday['1'].day.mintemp_c) + ' \u00B0C');
                                                $('#day2Date').text(Date.parse(resultNewWeather.data.forecast.forecastday['2'].date).toString("ddd dS"));;
                                                $('#day2Icon').attr("src", resultNewWeather.data.forecast.forecastday['2'].day.condition.icon);
                                                $('#day2TempMax').html(Math.round(resultNewWeather.data.forecast.forecastday['2'].day.maxtemp_c) + ' \u00B0C');
                                                $('#day2TempMin').html(Math.round(resultNewWeather.data.forecast.forecastday['2'].day.mintemp_c) + ' \u00B0C');

                                                
                                                
                                            },
                                    
                                            error: function(jqXHR, textStatus, errorThrown) {
                                                         console.log(JSON.stringify(jqXHR));
                                                         console.log(JSON.stringify(textStatus));
                                                         console.log(JSON.stringify(errorThrown));
                                                         
                                                     }
                                        });



                            },
                    
                            error: function(jqXHR, textStatus, errorThrown) {
                                         console.log(JSON.stringify(jqXHR));
                                         console.log(JSON.stringify(textStatus));
                                         console.log(JSON.stringify(errorThrown));
                                         
                                     }
                        });

 

                    }else{
                        citiesMarkers.addLayer(L.marker([city.latitude, city.longitude], {icon: cityIcon}).bindTooltip(`${city.name}` + `<br>` + cityPop));

                    }  
                    
   

                });

                   
                map.addLayer(citiesMarkers);


          
                
            },
    
            error: function ajaxError(jqXHR) {
                console.error('Error: ', jqXHR.responseText);
            }
        });
    });
    
  

});


// Country Information Button
btn = L.easyButton('<i class="fa-solid fa-info"></i>',function(btn,map){
    $('#countryModal').modal('show');
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

// Population Modal Button
btn = L.easyButton('<i class="fa-solid fa-person"></i>',function(btn,map){
    $('#populationModal').modal('show');
    }).addTo(map);
    btn.button.style.backgroundColor = 'antiquewhite';
    btn.button.style.border = 'none';
 

 // News Modal Button
 btn = L.easyButton('<i class="fa-solid fa-newspaper"></i>',function(btn,map){
    $('#newsModal').modal('show');
    }).addTo(map);
    btn.button.style.backgroundColor = 'antiquewhite';
    btn.button.style.border = 'none';



