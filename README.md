# Expensapp

![App screen](/doc/app_screen.png "App screen")

A sample single page web application written in Clojure that demonstrates the
following.

* [Ring][1] and [Compojure][2] for RESTful services
* [Friend][3] for semi-RESTful auth (cookie based) over JSON
* [Environ][4] for environment variable based configuration
* [Postgres][5] for data storage and [Yesql][6] to access that data

Additionally, the leiningen configuration shows how to use:

* [Bower][7] and [lein-bower][8] for front end dependencies
* [s3-wagon-private][9] for pushing maven artifacts to Amazon S3
* [lein-deploy-app][10] for pushing uberjars to S3


I hope this serves as a good template to learn / copy from, but I don't claim to
know everything. If you see any mistakes, problems, bad things, things that can
be made better then send me an email, create an issue, send a PR, anything.
Criticism is always welcome.

There is some front end javascript included in here react.js and jquery, but
don't use it an example of good Javascript because in the current state it
certainly isn't.

## Application docs

* [Clone, Build, Run the application][11]
* [API][12]
* [Database][13]


## Development

Follow the instructions in the [Clone, Build, Run][11] doc to set up the database.

Add the environment variables to your leiningen profile where [lein-environ][4]
can pull them and set them up for a leiningen process automatically.

It will look something like

```clojure
{:user
 {:env {:expensapp-dbhost "localhost"
        :expensapp-dbport "5432"
        :expensapp-dbname "expensapp"
        :expensapp-dbuser "dan"}}}
```


To start a web server for the application, run:

    lein run


Or connect / start a repl and run `(go)` in the user namespace.

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




## Copyright and License

Copyright © 2014 Daniel Midwood

Licensed under the MIT License, except:
* clock-bg.jpg that is licensed under CC0 by [Grasisography][14]

[1]: https://github.com/ring-clojure/ring
[2]: https://github.com/weavejester/compojure
[3]: https://github.com/cemerick/friend
[4]: https://github.com/weavejester/environ
[5]: http://www.postgresql.org/
[6]: https://github.com/krisajenkins/yesql
[7]: http://bower.io/
[8]: https://github.com/chlorinejs/lein-bower
[9]: https://github.com/technomancy/s3-wagon-private
[10]: https://github.com/rplevy/lein-deploy-app
[11]: https://github.com/danmidwood/expensapp/blob/master/doc/cbr.md
[12]: https://github.com/danmidwood/expensapp/blob/master/doc/api.md
[13]: https://github.com/danmidwood/expensapp/blob/master/doc/db.md
[14]: http://www.gratisography.com/
