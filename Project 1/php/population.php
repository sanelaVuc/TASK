<?php

$curl = curl_init();

curl_setopt_array($curl, [
	CURLOPT_URL => "https://world-population3.p.rapidapi.com/" . $_REQUEST['country'],
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_FOLLOWLOCATION => true,
	CURLOPT_ENCODING => "",
	CURLOPT_MAXREDIRS => 10,
	CURLOPT_TIMEOUT => 80,
	CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET",
	CURLOPT_HTTPHEADER => [
		"X-RapidAPI-Host: world-population3.p.rapidapi.com",
		"X-RapidAPI-Key: 6ef6102937msh5c73a6a1865884cp15ddb0jsn9b1bf05aee66"
	],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
	echo "cURL Error #:" . $err;
} else {
	echo $response;
}

?>