# Expensapp API

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


### Testing

A [Postman][3] collection containing pre-setup requests is included in the root
of this project. Import it into Postman to try them out.

[3]: http://www.getpostman.com/
