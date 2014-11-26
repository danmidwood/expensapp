(ns expensapp.routes.home
  (:require [compojure.core :refer :all]
            [ring.util.response :refer [redirect response status content-type]]
            [cemerick.friend :as friend]
            (cemerick.friend [workflows :as workflows])
            [cemerick.friend.util :refer [gets]]
            [compojure.handler :as handler]
            [marianoguerra.friend-json-workflow :as json-auth]
            [cheshire.core :as json]
            [expensapp.users :as u]
            [ring.middleware.keyword-params :refer :all]
            [ring.middleware.nested-params :refer :all]
            [ring.middleware.params :refer :all]))

(defn authenticate-user [db {:strs [user password]}]
  (u/auths? db user password))

(defn make-auth-routes [db]
  (routes
   (POST "/session" req
         (if-let [user-record (authenticate-user db (:body req))]
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
                                           :body    nil}))))

(defroutes app-routes
  (GET "/" req (redirect "/index.html"))
  (GET "/requires-authentication" req
       (friend/authenticated "Thanks for authenticating!")))

(defn make-account-routes [db]
  (routes
   (POST "/account" req
         (if-let [id (friend/current-authentication req)]
           {:status 400 :body "Already logged in"}  ; already logged in as an account
           (let [account (:body req)
                 username (get account "user")
                 password (get account "password")]
             (if (u/username-available? db username)
               (do (u/add-user db username password)
                   {:status 204})
               {:status 409 :body (str "Username: " username " is already taken")}))))))

(defn make-all-routes [db]
  (-> (ring.middleware.session/wrap-session
       (friend/authenticate (routes app-routes (make-account-routes db))
                            {:login-uri "/"
                             :default-landing-uri "/session"
                             :workflows [(make-auth-routes db)]
                             :unauthenticated-handler (fn [req] {:status 401})}))))
