(ns user
  "Tools for interactive development with the REPL. This file should
  not be included in a production build of the application."
  (:require
   [clojure.java.io :as io]
   [clojure.java.javadoc :refer [javadoc]]
   [clojure.pprint :refer [pprint]]
   [clojure.reflect :refer [reflect]]
   [clojure.repl :refer [apropos dir doc find-doc pst source]]
   [clojure.set :as set]
   [clojure.string :as str]
   [clojure.test :as test]
   [clojure.tools.namespace.repl :refer [refresh refresh-all]]
   [ring.server.standalone :refer [serve]]
   [expensapp.handler :refer [app]]))

(def system
  "A Var containing an object representing the application under
  development."
  (atom nil))

(defn init
  "Creates and initializes the system under development in the Var
  #'system."
  [])


(defn start
  "Starts the system running, updates the Var #'system."
  []
  (let [port 3000]
    (reset! system
            (serve app
                   {:port port
                    :init init
                    :open-browser? false
                    :auto-reload? true
                    :destroy true
                    :join true}))
    (println (str "You can view the site at http://localhost:" port))))

(defn stop
  "Stops the system if it is currently running, updates the Var
  #'system."
  []
  (.stop @system)
  (reset! system nil))

(defn go
  "Initializes and starts the system running."
  []
  (init)
  (start)
  :ready)

(defn reset
  "Stops the system, reloads modified source files, and restarts it."
  []
  (stop)
  (refresh :after 'user/go))
