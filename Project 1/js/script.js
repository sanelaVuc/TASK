
var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.locate({setView: true, maxZoom: 16});

function onLocationFound(e) {
    var radius = e.accuracy;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);

    
}

map.on('locationfound', onLocationFound);

function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);

// 
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
    success: function (res) {
        
            currentBound.clearLayers();
            myPopup = L.popup({className: 'mypopup'}).setContent(
                "<p>Hello i am a popup</p>"
            )
            L.geoJSON(res['data'],{style:{color: '#00cc00', weight: 2, dashOffset: '0' } }).addTo(currentBound);
            currentBound.bindPopup(myPopup).addTo(map);
            map.fitBounds(currentBound.getBounds()); 
    },
    error: function (err) {
        console.log('err aici',err);
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
            success: function(result) {

                if (result.status.name == "ok") {

                    $('#txtCapital').html(result['data']['geonames']['0']['capital']);
                    $('#txtLanguages').html(result['data']['geonames']['0']['languages']);
                    $('#txtArea').html(result['data']['geonames']['0']['areaInSqKm']);
                    $('#txtPopulation').html(result['data']['geonames']['0']['population']); 
                    $('#txtContinent').html(result['data']['geonames']['0']['continentName']);
                    $('#txtCurrency').html(result['data']['geonames']['0']['currencyCode']);
                    
                    
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(JSON.stringify(jqXHR));
                console.log(JSON.stringify(textStatus));
                console.log(JSON.stringify(errorThrown));
            }
        });


        // Country Flag
        console.log("HELLOOO")
        $.ajax({
            url: "php/getFlag.php",
            type: 'POST',
            dataType: 'json',
            data: {
                country: $('#selectCountry').val()
            },
            success: function(result) {
                console.log(result['flag'])
                if (result.status.name == "ok") {
                    
                    $("#flag").html(
                        `<img src=${result["flag"]} alt='image' style='width :70px'/>`
                    );
                
                    
                    
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
});




// Country Information Button
btn = L.easyButton('<i class="fa-solid fa-info"></i>',function(btn,map){
    $('#countryModal').modal('show');
    }).addTo(map);
    btn.button.style.backgroundColor = 'white';
    btn.button.style.border = 'none';
    btn.button.style.width = '50px';
    btn.button.style.height = '50px';
    btn.button.style.fontSize = "33px";
    btn.button.style.paddingTop = "5px";

// 

// Flag Modal
btn = L.easyButton('<i class="fa-regular fa-flag"></i>',function(btn,map){
    $('#flagModal').modal('show');
    }).addTo(map);
    btn.button.style.backgroundColor = 'white';
    btn.button.style.border = 'none';
    btn.button.style.width = '50px';
    btn.button.style.height = '50px';
    btn.button.style.fontSize = "33px";
    btn.button.style.paddingTop = "5px";



// Weather Modal Button
btn = L.easyButton('<i class="fa-solid fa-cloud-sun"></i>',function(btn,map){
    $('#weatherModal').modal('show');
    }).addTo(map);
    btn.button.style.backgroundColor = 'white';
    btn.button.style.border = 'none';
    btn.button.style.width = '50px';
    btn.button.style.height = '50px';
    btn.button.style.fontSize = "33px";
    btn.button.style.paddingTop = "5px";

