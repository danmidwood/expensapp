-- name: -create-expense
-- Insert an expense record into the database
INSERT INTO expense (id, user_id, datetime, amount, comment, description)
VALUES (:id, :user, :datetime, :amount, :comment, :description)
RETURNING id;

-- name: -get-expenses
-- Get expenses from the start date and for the next one week
select * from expense where
user_id = :user and
datetime >= :start and
datetime < (:start::timestamp + (INTERVAL '7 days'));

-- name: delete-expense!
-- Remove an existing expense
DELETE FROM expense
where user_id = :user
and id = :id

-- name: -update-expense!
-- Update an existing expense record
update expense
set datetime = :datetime,
amount = :amount,
comment = :comment,
description = :description
where user_id = :user
and id = :id
