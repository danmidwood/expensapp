# Clone, Build, Run

## Clone

    git clone git@github.com:danmidwood/expensapp.git

## Build

### Prerequisites

You will need [Leiningen][1] 1.7.0 or above installed.

And the latest [node][2] for web dependencies (via npm)

[1]: https://github.com/technomancy/leiningen
[2]: http://nodejs.org/download/


### Building

To build an executable jar, run:

    lein uberjar

This will create a jar in the target directory named with the format `expensapp-$version-SNAPSHOT-standalone.jar`



## Run

### Prerequisites

#### Setting up the database

Set up a postgres and create a database called `expensapp`.

Then set up the database by running the scripts in the `./sql_migrations` folder.

The script `builddb.sh` will run all of them automatically.

```sh
cd sql_migrations
./builddb.sh
```


#### Environment Variables

Before running the database credentials need to be put into environment
variables, those that need to be populated are:

* EXPENSAPP_HTTP_PORT
* EXPENSAPP_DBHOST
* EXPENSAPP_DBPORT
* EXPENSAPP_DBNAME
* EXPENSAPP_DBUSER
* EXPENSAPP_DBPASS

### Running

    java -jar target/expensapp-$version-SNAPSHOT-standalone.jar
