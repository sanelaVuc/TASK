<?php
 
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);
    ini_set('memory_limit', '1024M');

    $executionStartTime = microtime(true);

    // Get data from countries_large data file``
    $countryData = json_decode(file_get_contents("../js/countryBorders.geo.json"), true);

    $country = [];

    // Use a for each loop to go through each feature of the geoJson data and get the country name and ISO 3 code
    foreach ($countryData['features'] as $feature) {
         $temp = null;
         $temp['code'] = $feature["properties"]['iso_a2'];
         $temp['name'] = $feature["properties"]['name'];

         array_push($country, $temp); 
    };

    // Use the usort feature to compare items in the country array to put them in alphabetic order
    usort($country, function ($item1, $item2) {
         return $item1['name'] <=> $item2['name'];
    });

     $output['status']['code'] = "200";
     $output['status']['name'] = "ok";
     $output['status']['description'] = "success";
     $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
     $output['data'] = $country;
 
     header('Content-Type: application/json; charset=UTF-8');
     echo json_encode($output);

?>