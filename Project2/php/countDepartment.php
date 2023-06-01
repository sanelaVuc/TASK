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

    $query = $conn->prepare('SELECT count(p.id) as departmentCount, d.name as departmentName FROM personnel p RIGHT JOIN department d ON (d.id = p.departmentID) WHERE d.id = ?  GROUP BY d.name');
    $query->bind_param("i", $_REQUEST['id']);
    $query->execute();
    $query->bind_result($departmentCount, $departmentName);
    $query->fetch();

    if ($departmentCount > 0) {
        $output['status']['code'] = "403";
        $output['status']['name'] = "forbidden";
        $output['status']['description'] = "Cannot delete location.";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data']['departmentCount'] = $departmentCount;
        $output['data']['departmentName'] = $departmentName;
    } else {
        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data']['departmentCount'] = 0;
        $output['data']['departmentName'] = $departmentName;
    }

    $query->close();
    mysqli_close($conn);

    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
    exit;
?>
