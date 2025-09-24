<?php
require_once '../vendor/autoload.php';
require_once 'head.php';
require_once 'controllers/GameController.php';
require_once 'controllers/AuthController.php';

use Asko\Router\Router;

$router = new Router();

// Enable CORS for all routes
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Create controller instances
$gameController = new GameController($conn);
$authController = new AuthController($conn);
function getUserGames($userId){
    global $gameController;
    
    return $gameController->getUserGames($userId);
}


function getGame($roomId){
    global $gameController;
    
    return $gameController->getGame($roomId);
}

function postGame($roomId){
    global $gameController;
    
    return $gameController->postGame($roomId);
}
function validateSession(){
    global $authController;

    $authController->validateSession();
}

function login(){
    global $authController,$conn;

    $authController->login($conn);
}
function logout(){
    global $authController, $conn;

    $authController->logout($conn);
}
function register(){
    global $authController;

    $authController->register();
}
// Game routes
$router->get("/game/{roomId}", "getGame");
$router->get("/user/rooms/{userId}", "getUserGames");
$router->post("/game/{roomId}", "postGame");

// Auth routes
$router->post("/login", "login");
$router->post("/register", "register");
$router->get("/validate_session", "validateSession");
$router->post("/logout", "logout");

// Add controller instances to router so they can be accessed
// $router->addInstance("GameController", $gameController);
// $router->addInstance("AuthController", $authController);
// Dispatch the router




function apiDocumentationHTML() {
    $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fantasy Chess API Documentation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #2c3e50, #1a1a2e);
            color: #fff;
            line-height: 1.6;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { 
            text-align: center; 
            padding: 40px 0;
            background: rgba(0,0,0,0.3);
            border-radius: 15px;
            margin-bottom: 30px;
            border: 2px solid #d4af37;
        }
        .header h1 { 
            color: #d4af37; 
            font-size: 3rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .endpoints { display: grid; gap: 20px; }
        .endpoint { 
            background: rgba(0,0,0,0.5);
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #d4af37;
        }
        .method { 
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            margin-right: 10px;
        }
        .get { background: #4CAF50; }
        .post { background: #2196F3; }
        .put { background: #FF9800; }
        .delete { background: #F44336; }
        .path { 
            font-family: monospace;
            font-size: 1.1rem;
            color: #d4af37;
        }
        .description { margin: 10px 0; }
        .parameters { margin-top: 10px; }
        .parameter { 
            background: rgba(255,255,255,0.1);
            padding: 5px 10px;
            border-radius: 5px;
            margin: 5px 0;
            font-family: monospace;
        }
        .json-toggle { 
            background: #d4af37;
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 20px 0;
            font-weight: bold;
        }
        .json-response { 
            display: none;
            background: #1a1a1a;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
            font-family: monospace;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>♛ Fantasy Chess API</h1>
            <p>Version 1.0.0 - Interactive API Documentation</p>
        </div>

        <button class="json-toggle" onclick="toggleJSON()">Toggle JSON View</button>
        <div id="jsonResponse" class="json-response"></div>

        <div class="endpoints">
            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/api/</span>
                <div class="description">API Documentation (this page)</div>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/api/game/{roomId}</span>
                <div class="description">Get game state for a specific room</div>
                <div class="parameters">
                    <div class="parameter"><strong>roomId</strong> (required) - The game room ID (e.g., ABC123)</div>
                    <div class="parameter"><strong>userId</strong> (optional) - User ID for filtering user-specific rooms</div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="path">/api/game/{roomId}</span>
                <div class="description">Create or update game state</div>
                <div class="parameters">
                    <div class="parameter"><strong>roomId</strong> (required) - The game room ID</div>
                    <div class="parameter"><strong>Body:</strong> { "gameState": { "fen": "...", "history": [] } }</div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="path">/api/login</span>
                <div class="description">User authentication</div>
                <div class="parameters">
                    <div class="parameter"><strong>Body:</strong> { "username": "user", "password": "pass" }</div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="path">/api/register</span>
                <div class="description">User registration</div>
                <div class="parameters">
                    <div class="parameter"><strong>Body:</strong> { "username": "user", "email": "user@example.com", "password": "pass" }</div>
                </div>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/api/validate_session</span>
                <div class="description">Validate current user session</div>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="path">/api/logout</span>
                <div class="description">User logout</div>
            </div>
        </div>

        <div class="endpoint" style="margin-top: 30px;">
            <h3>Game Modes</h3>
            <ul>
                <li><strong>PVP</strong> - Player vs Player (local)</li>
                <li><strong>AI</strong> - Player vs AI with 3 difficulty levels</li>
                <li><strong>Online</strong> - Real-time multiplayer</li>
                <li><strong>Puzzle</strong> - Chess puzzles and challenges</li>
            </ul>
        </div>
    </div>

    <script>
        // Load and display JSON documentation
        fetch('/api/?format=json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('jsonResponse').textContent = JSON.stringify(data, null, 2);
            });

        function toggleJSON() {
            const jsonDiv = document.getElementById('jsonResponse');
            jsonDiv.style.display = jsonDiv.style.display === 'none' ? 'block' : 'none';
        }

        // Auto-hide JSON on mobile
        if (window.innerWidth < 768) {
            document.getElementById('jsonResponse').style.display = 'none';
        }
    </script>
</body>
</html>
HTML;

    echo $html;
}

// Then add this route:
$router->get("/docs", "apiDocumentationHTML");
$router->get("/", "apiDocumentationHTML");
$router->dispatch();

$conn->close();

?>