<?php

$country_list_json = file_get_contents('../js/countryBorders.geo.json');
$decode = json_decode($country_list_json, true);

$bounds = [];
foreach ($decode['features'] as $res) {
    if($res['properties']['iso_a2']==$_REQUEST['iso']){
        $bounds = $res;
        break;
    }  
}

$output["status"]["code"] = "200";
$output["status"]["name"] = "ok";
$output["status"]["description"] = "success";
$output['data'] = $bounds;

header('Content-type: application/json; charset=UTF-8');
echo json_encode($output);

?>

