(defproject expensapp "0.1.0-SNAPSHOT"
  :description "Expensapp: An expense tracking web app"
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/java.jdbc "0.3.6"]
                 [postgresql "9.1-901-1.jdbc4"]
                 [yesql "0.4.0"]
                 [compojure "1.2.1"]
                 [enlive "1.1.5"]
                 [com.cemerick/friend "0.2.0"]
                 [org.marianoguerra/friend-json-workflow "0.2.1"]
                 [org.apache.httpcomponents/httpclient "4.3.6"]
                 [ring "1.3.1"]
                 [ring/ring-json "0.3.1"]
                 [com.taoensso/timbre "3.3.1"]
                 [clj-time "0.8.0"]]
  :plugins [[lein-ring "0.8.12"]
            [lein-npm "0.4.0"]
            [lein-bower "0.5.1"]]
  :node-dependencies [[bower "1.3.2"]]
  :bower-dependencies [[react "0.11.2"]]
  :ring {:handler expensapp.handler/app
         :init expensapp.handler/init
         :destroy expensapp.handler/destroy}
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
  :min-lein-version "2.3.4")
