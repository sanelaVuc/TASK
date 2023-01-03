	$('#btnRunOne').click(function() {

		$.ajax({
			url: "php/earthquakes.php",
			type: 'POST',
			dataType: 'json',
			data: {
				north: $('#north').val(),
                south: $('#south').val(),
                west: $('#west').val(),
				east: $('#east').val()
                
				
			},
			success: function(result) {

				console.log(JSON.stringify(result));

			
					$('#DateTime').empty().append(result['data'][0]['datetime']);
					$('#magnitude').empty().append(result['data'][0]['magnitude']);
					$('#Longitude').empty().append(result['data'][0]['lng']);	
					$('#Latitude').empty().append(result['data'][0]['lat']);
					
			
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
				console.log(textStatus + ' : ' + errorThrown);
				console.log(jqXHR);
			}
		}); 
	
	});

	$('#btnRunTwo').click(function() {

		$.ajax({
			url: "php/postalCode.php",
			type: 'POST',
			dataType: 'json',
			data: {
				country: $('#selCountry').val(),
               
            
			},
			success: function(result) {

				console.log(JSON.stringify(result));

				if (result.status.name == "ok") {
					
					$('#countryCode').empty().append(result['data'][30]['countryCode']);

					$('#countryName').empty().append(result['data'][30]['countryName']);
					
					$('#postalCodes').empty().append(result['data'][30]['numPostalCodes']);	
					
				}	
			
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
		
			}
		}); 
	
	});

	$('#btnRunThree').click(function() {

		$.ajax({
			url: "php/ocean.php",
			type: 'POST',
			dataType: 'json',
			data: {
				longitude: $('#longitude').val(),
				latitude: $('#latitude').val(),
            
			},
			success: function(result) {

				console.log((result));

				if (result.status.name == "ok") {
					
					// $('#distance').html(result.data.distance);

					// $('#geonameId').html(result,data.geonameId);
					
					$('#name').html(result.data.name);	
					
				}	
			
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
		
			}
		}); 
	
	});