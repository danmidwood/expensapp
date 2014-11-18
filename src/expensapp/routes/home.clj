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

(def users (atom {}))

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

(defroutes app-routes
  (GET "/" req (redirect "/index.html"))
  (GET "/requires-authentication" req
       (friend/authenticated "Thanks for authenticating!")))

(defroutes account-routes
  (POST "/account" req
        (if-let [id (friend/current-authentication req)]
          {:status 400 :body "Already logged in"}  ; already logged in as an account
          (let [account (:body req)
                username (get account "user")
                password (get account "password")]
            (if (@users username)
              {:status 409 :body (str "Username: " username " is already taken")}
              (do (swap! users assoc username {:username username :password (creds/hash-bcrypt password)})
                  {:status 204}))))))


(def all-routes
  (-> (ring.middleware.session/wrap-session
       (friend/authenticate (routes app-routes account-routes)
                            {:login-uri "/session"
                             :default-landing-uri "/session"
                             :workflows [auth-routes]}))))
