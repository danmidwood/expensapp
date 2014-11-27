-- name: -create-expense
-- Insert an expense record into the database
INSERT INTO expense (id, user_id, datetime, amount, comment, description)
VALUES (:id, :user, :datetime, :amount, :comment, :description)
RETURNING id;
