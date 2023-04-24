<?php
    // Echo all errors back to the screen of the browser so PHP can be debugged
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);
    ini_set('memory_limit', '1024M');

    $executionStartTime = microtime(true);

    $lat = $_REQUEST['lat'];
    $long = $_REQUEST['lng'];


    // Initialise cURL
    $ch2 = curl_init('api.geonames.org/countryCodeJSON?lat='. $lat .'&lng=' . $long . '&username=sanela');
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);

    // Store the data
    $geoData = curl_exec($ch2);
    
    // End the cURL
    curl_close($ch2);

    // Decode JSON response
    $geonames = json_decode($geoData, true);

    //OUTPUT//
     $output['status']['code'] = "200";
     $output['status']['name'] = "ok";
     $output['status']['description'] = "success";
     $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
     $output['data']['geonames'] = $geonames['countryCode'];
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
?>