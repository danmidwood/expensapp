(ns expensapp.main
  (:gen-class)
  (:require [ring.adapter.jetty :as ring]
            [expensapp.handler :refer [app]]))


(defn start [port]
  (ring/run-jetty (var app)
                  {:port port
                   :join? false}))

(defn -main
  ([]
   (let [port (Integer/parseInt (environ.core/env :expensapp-http-port))]
              (start port))))
