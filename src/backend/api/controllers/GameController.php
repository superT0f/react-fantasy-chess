<?php

class GameController
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function getUserGames($userId)
    {
        $stmt = $this->conn->prepare("SELECT room_id, game_state FROM chess_games WHERE user_id = ?");
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
    }
    public function getGame($roomId)
    {
        $stmt = $this->conn->prepare("SELECT game_state FROM chess_games WHERE room_id = ?");
        $stmt->bind_param("s", $roomId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo $row['game_state'];
        } else {
            echo json_encode(["status" => "room $roomId not_found"]);
        }
    }

    public function postGame($roomId)
    {
        

        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $_GET['userId'] ?? $input['userId'] ?? require_auth();
        $gameState = json_encode($input['gameState'] ?? []);

        $stmt = $this->conn->prepare("INSERT INTO chess_games (user_id, room_id, game_state) 
                            VALUES (?, ?, ?) 
                            ON DUPLICATE KEY UPDATE 
                            game_state = ?, last_updated = CURRENT_TIMESTAMP");
        $stmt->bind_param("ssss", $userId, $roomId, $gameState, $gameState);
        $stmt->execute();

        echo json_encode(["status" => "success", "roomId" => $roomId, "gameState" => $gameState]);
    }
}
