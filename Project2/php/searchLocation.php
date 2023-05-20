<?php




if (isset($_POST['name'])) {
    $searchTerm = $_POST['name'];

    include("config.php");
  
    $conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

  
    if ($conn->connect_errno) {
        
        die("Database connection failed: " . $conn->connect_error);
    }

    $query = "SELECT * FROM location WHERE name LIKE '%" . $searchTerm . "%'";

    
    $result = $conn->query($query);

   
    if ($result) {
        
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['data' => $data]);
    } else {
        
        die("Query failed: " . $conn->error);
    }

    
    $conn->close();
}
?>