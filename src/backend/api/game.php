<?php
require 'head.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Create or update game state
    $userId = $_GET['userId']; //require_user();
    if (! is_int($userId))
        die(json_encode(["status" => "userId require"]));
    $input = json_decode(file_get_contents('php://input'), true);
    $roomId = $input['roomId'];

    $gameState = json_encode($input['gameState']);

    $stmt = $conn->prepare("INSERT INTO chess_games (user_id, room_id, game_state) 
                            VALUES (?, ?, ?) 
                            ON DUPLICATE KEY UPDATE 
                            game_state = ?, last_updated = CURRENT_TIMESTAMP");
    $stmt->bind_param("sss", $userId, $roomId, $gameState, $gameState);
    $stmt->execute();

    echo json_encode(["status" => "success", "roomId" => $roomId, "gameState" => $gameState]);
} else if ($method === 'GET') {
    if (isset($_GET['userId'])) {
        // Get all rooms for user
        $userId = (int)$_GET['userId'];
        $stmt = $conn->prepare("SELECT room_id, game_state FROM chess_games WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $rooms = [];
        while ($row = $result->fetch_assoc()) {
            $rooms[] = [
                'room_id' => $row['room_id'],
                'game_state' => json_decode($row['game_state'], true)
            ];
        }
        echo json_encode($rooms);
        $roomId = $_GET['roomId'];
        if (is_string($roomId)) {
            $stmt = $conn->prepare("SELECT game_state FROM chess_games WHERE room_id = ?");
            $stmt->bind_param("s", $roomId);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                echo $row['game_state'];
            } else {
                echo json_encode(["status" => "room $roomId not_found"]);
            }
        } else {
            echo json_encode(["status" => "action not_found"]);
        }
    }
}

$conn->close();
