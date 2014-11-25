(defproject expensapp "0.1.0-SNAPSHOT"
  :description "Expensapp: An expense tracking web app"
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/java.jdbc "0.3.6"]
                 [postgresql "9.1-901-1.jdbc4"]
                 [yesql "0.4.0"]
                 [environ "1.0.0"]
                 [compojure "1.2.1"]
                 [enlive "1.1.5"]
                 [com.cemerick/friend "0.2.0"]
                 [org.marianoguerra/friend-json-workflow "0.2.1"]
                 [org.apache.httpcomponents/httpclient "4.3.6"]
                 [ring "1.3.1"]
                 [ring/ring-json "0.3.1"]
                 [com.taoensso/timbre "3.3.1"]
                 [clj-time "0.8.0"]]
  :plugins [[lein-environ "1.0.0"]
            [lein-npm "0.4.0"]
            [lein-bower "0.5.1"]
            [s3-wagon-private "1.1.2"]
            [rplevy/lein-deploy-app "0.2.1"]]
  :node-dependencies [[bower "1.3.8"]]
  :bower-dependencies [[react "0.11.2"]
                       [jquery "2.1.1"]]
  :bower {:directory "resources/public/js/lib"}
  :prep-tasks ["javac" "compile" ["npm" "install"] ["bower" "install"]]
  :profiles
  {:uberjar {:aot :all}
   :production {:ring {:open-browser? false
                       :stacktraces? false
                       :auto-reload? false}}
   :dev {:dependencies [[org.clojure/tools.namespace "0.2.7"]
                        [ring-mock "0.1.5"]
                        [ring/ring-devel "1.3.1"]
                        [ring-server "0.3.1"]]
         :source-paths ["dev"]}}
  :deploy-repositories [["snapshots" {:url "s3p://jvm-repository/snapshots/"
                                      :creds :gpg}]
                        ["releases" {:url "s3p://jvm-repository/releases/"
                                     :creds :gpg}]]
  :deploy-app {:s3-bucket "s3p://jvm-apps/releases" :creds :env}
  :main expensapp.main
  :release-tasks [["vcs" "assert-committed"]
                  ["change" "version"
                   "leiningen.release/bump-version" "release"]
                  ["vcs" "commit"]
                  ["vcs" "tag"]
                  ["deploy"]
                  ["deploy-app"]
                  ["change" "version" "leiningen.release/bump-version"]
                  ["vcs" "commit"]
                  ["vcs" "push"]]
  :min-lein-version "2.3.4")
