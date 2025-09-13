<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
// Allow requests from React dev server
header('Access-Control-Allow-Origin: http://localhost:3000');
// Additional CORS headers
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Load environment variables from .env file
$envFile = __DIR__ . '/../../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue; // Skip comments
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        // Remove quotes if present
        $value = trim($value, '"\'');
        
        putenv("$name=$value");
    }
}


$servername = getenv('DB_HOST') ?: 'localhost';
$username = getenv('DB_USER') ?: 'tof';
$password = getenv('DB_PASS') ?: 'tof';
$dbname = getenv('DB_NAME') ?: 'fc';
// $servername = "localhost";
// // $username = "fc";
// // $password = '-PghnIU)dFQ_J3j-';
// $username = "tof";
// $password = 'tof';
// $dbname = "fc";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Create table if it doesn't exist
$createTable = "CREATE TABLE IF NOT EXISTS chess_games (
    room_id VARCHAR(10) PRIMARY KEY,
    game_state TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";
$conn->query($createTable);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Create or update game state
    $input = json_decode(file_get_contents('php://input'), true);
    $roomId = $input['roomId'];
    $gameState = json_encode($input['gameState']);

    $stmt = $conn->prepare("INSERT INTO chess_games (room_id, game_state) 
                            VALUES (?, ?) 
                            ON DUPLICATE KEY UPDATE 
                            game_state = ?, last_updated = CURRENT_TIMESTAMP");
    $stmt->bind_param("sss", $roomId, $gameState, $gameState);
    $stmt->execute();

    echo json_encode(["status" => "success", "roomId" => $roomId, "gameState" => $gameState]);
} else if ($method === 'GET') {
    // Get game state
    $roomId = $_GET['roomId'];

    $stmt = $conn->prepare("SELECT game_state FROM chess_games WHERE room_id = ?");
    $stmt->bind_param("s", $roomId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo $row['game_state'];
    } else {
        echo json_encode(["status" => "not_found"]);
    }
}

$conn->close();
