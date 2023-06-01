<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);
    $executionStartTime = microtime(true);
    include("config.php");

    $conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

 
    if (mysqli_connect_errno()) {
        $output['status']['code'] = "300";
        $output['status']['name'] = "failure";
        $output['status']['description'] = "database unavailable";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data'] = [];
        mysqli_close($conn);
        echo json_encode($output);
        exit;


    }  

    // $query = $conn->prepare('SELECT COUNT(id) FROM department WHERE locationID=?');

    $query = $conn->prepare("SELECT l.name AS locationName, COUNT(d.id) AS departmentLocCount FROM department d RIGHT JOIN location l ON d.locationID = l.id WHERE l.id = ? GROUP BY l.name");

    $query->bind_param("i", $_REQUEST['id']);
    $query->execute();
    
    $query->bind_result($locationName, $departmentLocCount );
    $query->fetch();

 

    if($departmentLocCount > 0) {
        $output['status']['code'] = "403";
        $output['status']['name'] = "forbidden";
        $output['status']['description'] = "Cannot delete location.";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data']['departmentLocCount'] = $departmentLocCount;
        $output['data']['locationName'] = $locationName;
    } else{
        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data']['departmentLocCount'] = 0;
        $output['data']['locationName'] = $locationName;
    }

    $query->close();
    mysqli_close($conn);
    echo json_encode($output);
    exit;

  
 ?>