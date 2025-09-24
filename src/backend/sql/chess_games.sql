CREATE TABLE `chess_games` (
  `room_id` varchar(10) NOT NULL,
  `user_id` int NULL,
  `game_state` text,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE chess_games
ADD CONSTRAINT fk_chess_games_user_id
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
CREATE INDEX idx_chess_games_user_id ON chess_games(user_id);
