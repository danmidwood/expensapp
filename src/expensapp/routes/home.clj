(ns expensapp.routes.home
  (:require [compojure.core :refer :all]
            [ring.util.response :refer [redirect]]))

(defroutes home-routes
  (GET "/" [] (redirect "/index.html")))
