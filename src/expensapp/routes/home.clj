(ns expensapp.routes.home
  (:require [compojure.core :refer :all]
            [ring.util.response :refer [redirect response status content-type]]
            [cemerick.friend :as friend]
            (cemerick.friend [workflows :as workflows]
                             [credentials :as creds])
            [cemerick.friend.util :refer [gets]]
            [compojure.handler :as handler]
            [marianoguerra.friend-json-workflow :as json-auth]
            [cheshire.core :as json]
            [ring.middleware.keyword-params :refer :all]
            [ring.middleware.nested-params :refer :all]
            [ring.middleware.params :refer :all]))

(def users (atom {"dan" {:username "dan"
                         :password (creds/hash-bcrypt "dan")}}))

(defn authenticate-user [{username "user" password "password"}]
  (if-let [user-record (@users username)]
    (if (creds/bcrypt-verify password (:password user-record))
      (dissoc user-record :password))))

(defroutes auth-routes
  (POST "/session" req
        (if-let [user-record (authenticate-user (:body req))]
          (workflows/make-auth user-record {:cemerick.friend/workflow :interactive-form})
          {:status 401}))
  (GET "/session" req
       (let [id (friend/current-authentication req)]
         (if id
           (-> {:user (:username id)}
               response
               (content-type "application/vnd.expensapp.auth+json"))
           {:status 401})))
  (DELETE "/session" req (friend/logout* {:status  204
                                          :headers {}
                                          :body    nil})))

(defroutes routes2
  (GET "/" req (redirect "/index.html"))
  (GET "/requires-authentication" req
       (friend/authenticated "Thanks for authenticating!")))


(def all-routes
  (-> (ring.middleware.session/wrap-session
       (friend/authenticate routes2
                            {:login-uri "/session"
                             :default-landing-uri "/session"
                             :workflows [auth-routes]}))))
