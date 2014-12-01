# Expensapp

A web app for tracking expenses.

![App screen](/doc/app_screen.png "App screen")

## Roadmap

#### Back end

* [x] Create basic structure
* [x] Add database
* [x] REST API Account creation
* [x] REST API Auth
* [x] REST API Create
* [x] REST API Read / fetches seven days from a start date (incl.)
* [x] REST API Update
* [x] REST API Delete

#### Front end

* [x] Add first page, + load css and js
* [x] Add Account creation
* [x] Add Login
* [x] Add login/join page design
* [x] Create "expenses" view
* [x] Add new expense
* [x] Display expenses for current week
* * [x] Add average display
* * [x] Add total display
* [x] Allow the selected week to be changed
* [x] Delete expense
* [x] Update an expense
* [x] Make display print nicely

## API

### Data Types

#### Auth

Media Type: `application/vnd.expensapp.auth.v1+json`

```javascript
{
    user: not-nil,
    password: optional // client should send, server never will
}
```

#### Expense

Media Type: `application/vnd.expensapp.expense.v1+json`

```
{
    datetime: not-nil,
    description: not-nil,
    amount: not-nil, // between range -9999.99 to 9999.99
    comment:not-nil,
    location: optional // will be set by the server, not required on POSTs
}
```

#### Expenses

Media Type: `application/vnd.expensapp.expenses.v1+json`

Expenses are a collection of `Expense` objects.

```javascript
[
    { expense_1 },
    { expense_2 },
    ...
    { expense_n}
]
```

Contract:
- No expenses will be represented by an empty array
- The array will not be ordered.
- The latest expense date will be no more than one week after the earliest

### Services

#### Account Create

verb: `POST`
path: `/account`
request type: `Auth`

##### Responses
###### Success
response status: HTTP 204
response type: Nothing
###### Username in use
response status: HTTP 409
response type: Nothing
###### Malformed client request
response status: Anything in the 4xx range
###### Server error
response status: Anything in the 5xx range


Note: This is only account creation, to log in a separate request should be sent
as described by Login below.


#### Login

verb: `POST`
path: `/session`
request type: `Auth`


##### Responses
###### Success
response status: HTTP 204
response type: Nothing + a session cookie

The session cookie should be sent with all future requests.

DAN: Do some research first into this. The assumption is that returning a cookie
will automatically add it to the future requests, but this isn't verified yet.
###### Credentials invalid
response status: HTTP 401
response type: Nothing
###### Malformed client request
response status: Anything in the 4xx range
###### Server error
response status: Anything in the 5xx range

#### Logout

verb: `DELETE`
path: `/session`
request type: Nothing


##### Responses
###### Success
Success will be sent when the client is logged out, this includes if they were
not logged in to begin with.

response status: HTTP 204
response type: Nothing
###### Malformed client request
response status: Anything in the 4xx range
###### Server error
response status: Anything in the 5xx range

#### Get logged in username

verb: `GET`
path: `/session`
request type: Nothing


##### Responses
###### Success
response status: HTTP 200
response type: An `Auth` without a password
###### Credentials invalid
response status: HTTP 401
response type: Nothing
###### Malformed client request
response status: Anything in the 4xx range
###### Server error
response status: Anything in the 5xx range


#### Create an Expense

verb: `POST`
path: `/expense`
request type: `Expense` (Location not required and will be ignored if given)

##### Responses
###### Success
response status: HTTP 204
response type: Nothing
response header: Location of the resource, this will be a http path from the
  root including a unique ID
###### Credentials invalid
response status: HTTP 401
response type: Nothing
###### Malformed client request
response status: Anything in the 4xx range
###### Server error
response status: Anything in the 5xx range


#### Read Expenses between dates
verb: `GET`
path: `/expense`
request type: Nothing
query-param: `week_beginning` - A date without time, should be a Monday

##### Response
###### Success
response status: HTTP 200
response type: `Expenses`
###### Invalid `week_beginning`
response status: HTTP 400
response type: Nothing
###### Credentials invalid
response status: HTTP 401
response type: Nothing
###### Malformed client request
response status: Anything in the 4xx range
###### Server error
response status: Anything in the 5xx range

#### Delete an Expense
verb: `DELETE`
path: taken from an `Expense` representations's `Location` field
request type: Nothing

##### Response
###### Success
response status: HTTP 204
response type: Nothing
###### Expense doesn't exist
response status: HTTP 404
response type: Nothing
###### Credentials invalid
response status: HTTP 401
response type: Nothing
###### Malformed client request
response status: Anything in the 4xx range
###### Server error
response status: Anything in the 5xx range

Note: A success response is confirmation that an expense does not exist. If the
expense did not exist prior to the DELETE call then a success will still be
returned.


#### Update an Expense

verb: `PUT`
path: taken from an `Expense` representations's `Location` field
request type: `Expense` (Location not required and will be ignored if given)

##### Responses
###### Success
response status: HTTP 204
response type: Nothing
###### Credentials invalid
response status: HTTP 401
response type: Nothing
###### Malformed client request
response status: Anything in the 4xx range
###### Server error
response status: Anything in the 5xx range


## Database

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


## Using Expensapp

### Prerequisites

You will need [Leiningen][1] 1.7.0 or above installed.

And the latest [node][2] for web dependencies (via npm)

[1]: https://github.com/technomancy/leiningen
[2]: http://nodejs.org/download/

### Setting up the database

To set up the database, run the scripts in the `./sql_migrations` folder.

The script `builddb.sh` will run all of them automatically.

```sh
cd sql_migrations
./builddb.sh
```

### Starting

Before running the database credentials need to be put into environment
variables, those that need to be populated are:

* EXPENSAPP_HTTP_PORT
* EXPENSAPP_DBHOST
* EXPENSAPP_DBPORT
* EXPENSAPP_DBNAME
* EXPENSAPP_DBUSER
* EXPENSAPP_DBPASS

To start a web server for the application, run:

    lein run

### Building

To build an executable jar, run:

    lein uberjar

This will create a jar in the target directory named with the format `expensapp-$version-SNAPSHOT-standalone.jar`

And this can be run with

    java -jar target/expensapp-$version-SNAPSHOT-standalone.jar

The current $version is `0.1.0`


### Publishing

The application can be published to S3 in two ways, as a maven artifact (w/ pom)
or as a runnable uber .jar file.

Both require your s3 credentials, to publish through `deploy` they should be in
a ~/.lein/credentials.clj.gpg file, for publishing as an uberjar the s3
credentials should be available as environment variables named `LEIN_USERNAME`
and `LEIN_PASSWORD`.

To publish an application snapshot as a Maven artefact run:

    lein deploy

> On OSX I often experience problems with reading the gpg encrypted credentials
> at this point. The best solution I've found it to run these commands before
> deploying
> ```shell
> eval $(gpg-agent --daemon --enable-ssh-support)
> gpg --quiet --batch --decrypt ~/.lein/credentials.clj.gpg
> # then enter password
> gpg --quiet --batch --decrypt ~/.lein/credentials.clj.gpg
> # and confirm that no password entry is required
> ```


To publish the full application as an uberjar:

    LEIN_USERNAME=username LEIN_PASSWORD=password lein deploy-app

And to release and do both:

    LEIN_USERNAME=username LEIN_PASSWORD=password lein release




### Testing

A [Postman][3] collection containing pre-setup requests is included in the root
of this project. Import it into Postman to try them out.

[3]: http://www.getpostman.com/

## Change Log

* Version 0.1.0-SNAPSHOT

## Copyright and License

Copyright © 2014 Daniel Midwood

Licensed under the MIT License, except:
* clock-bg.jpg that is licensed under CC0 by [Grasisography][4]

[4] http://www.gratisography.com/
