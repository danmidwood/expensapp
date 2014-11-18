(ns expensapp.handler
  (:require [compojure.core :refer [defroutes routes]]
            [ring.middleware.resource :refer [wrap-resource]]
            [ring.middleware.file-info :refer [wrap-file-info]]
            [hiccup.middleware :refer [wrap-base-url]]
            [compojure.handler :as handler]
            [ring.middleware.json :refer [wrap-json-body wrap-json-response]]
            [compojure.route :as route]
            [expensapp.routes.home :refer [all-routes]]
            [taoensso.timbre :as timbre]))

(defn init []
  (timbre/info "expensapp is starting"))

(defn destroy []
  (timbre/info "expensapp is shutting down"))

(defroutes app-routes
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (-> (routes all-routes app-routes)
      (handler/site)
      (wrap-base-url)
      (wrap-json-body)
      (wrap-json-response {:pretty true})))
