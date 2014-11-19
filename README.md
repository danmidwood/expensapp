# Expensapp

A web app for tracking expenses

## Roadmap

#### Back end

* [x] Create basic structure
* [] Add database. To be ready for ...
* [x] REST API Account creation
* [x] REST API Auth
* [] REST API Create
* [] REST API Read / fetches seven days from a start date (incl.)
* [] REST API Update
* [] REST API Delete

#### Front end

* [x] Add first page, + load css and js
* [] Add Account creation
* [x] Add Login
* [] Create "expenses" view
* [] Add new expense
* [] Display expenses for current week
* * [] Add average display
* * [] Add total display
* [] Allow the selected week to be changed
* [] Delete expense
* [] Update an expense
* [] Make display print nicely

## API

### Data Types

#### Auth

Media Type: `application/vnd.expensapp.auth+json`

```javascript
{
    user: not-nil,
    password: optional // client should send, server never will
}
```

#### Expense

Media Type: `application/vnd.expensapp.expense+json`

```
{
    datetime: not-nil,
    description: not-nil,
    amount: not-nil,
    comment:not-nil,
    location: optional // will be set by the server, not required on POSTs
}
```

#### Expenses

Media Type: `application/vnd.expensapp.expenses+json`

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

| uid | username | password |

Password will be hashed

### Expenses

| uid | useruid | datetime | description | amount | comment

With constraints
* `useruid` is present in the User table
* `datetime` is without timezone
* `amount` TODO: Look at Postgres currency types
* `description` and `comment` will both be varchars, limit 100


## Using Expensapp

### Prerequisites

You will need [Leiningen][1] 1.7.0 or above installed.

And the latest [node][2] for web dependencies (via npm)

[1]: https://github.com/technomancy/leiningen
[2]: http://nodejs.org/download/

### Starting

To start a web server for the application, run:

    lein ring server

### Building

To build an executable jar, run:

    lein ring uberjar

This will create a jar in the target directory named with the format `expensapp-$version-SNAPSHOT-standalone.jar`

The current $version is `0.1.0`


### Testing

A [Postman][3] collection containing pre-setup requests is included in the root
of this project. Import it into Postman to try them out.

[3]: http://www.getpostman.com/

## Change Log

* Version 0.1.0-SNAPSHOT

## Copyright and License

Copyright © 2014 Daniel Midwood
