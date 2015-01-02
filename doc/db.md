# Database

### User Table

| id | username | password |

* `id` is a UUID and is the primary key
* `username` is a varchar with length 100
* `password` is character string of length 60, encrypted with bcrypt

### Expenses

| id | user_id | datetime | description | amount | comment

With constraints
* `id` is a UUID and is the primary key
* `user_id` is a UUID and a foreign key of the user table's id
* `datetime` is without timezone
* `amount` is a a numeric with precision 6 and scale 2 (i.e. maxes out at 9999.99)
* `description` and `comment` will both be varchars, limit 100
