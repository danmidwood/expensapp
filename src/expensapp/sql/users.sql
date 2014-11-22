-- name: -username-available?
-- Check if a username is available
select exists(
       select id from "user" where
       name = :username);

-- name: -get-user
-- Check if a username and password pair is valid
select * from "user" where
name = :username;

-- name: -add-user!
-- Create a new user record
insert into "user" (id, name, pass) values(:id, :username, :password);
