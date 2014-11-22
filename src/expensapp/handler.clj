(ns expensapp.handler
  (:require [compojure.core :refer [defroutes routes]]
            [ring.middleware.resource :refer [wrap-resource]]
            [ring.middleware.file-info :refer [wrap-file-info]]
            [hiccup.middleware :refer [wrap-base-url]]
            [compojure.handler :as handler]
            [ring.middleware.json :refer [wrap-json-body wrap-json-response]]
            [compojure.route :as route]
            [expensapp.routes.home :refer [make-all-routes]]
            [taoensso.timbre :as timbre]
            [environ.core :refer [env]]))

(def db {:classname "org.postgresql.Driver"
         :subprotocol "postgresql"
         :subname (format "//%s:%s/%s"
                          (env :expensapp-dbhost)
                          (env :expensapp-dbport)
                          (env :expensapp-dbname))
         :user (env :expensapp-dbuser)
         :password (env :expensapp-dbpass)})

(defn init []
  (timbre/info "expensapp is starting"))

(defn destroy []
  (timbre/info "expensapp is shutting down"))

(defroutes app-routes
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (-> (routes (make-all-routes db) app-routes)
      (handler/site)
      (wrap-base-url)
      (wrap-json-body)
      (wrap-json-response {:pretty true})))
