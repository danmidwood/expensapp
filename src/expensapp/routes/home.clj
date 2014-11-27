(ns expensapp.routes.home
  (:require [compojure.core :refer :all]
            [ring.util.response :refer [redirect response status content-type header]]
            [cemerick.friend :as friend]
            (cemerick.friend [workflows :as workflows])
            [cemerick.friend.util :refer [gets]]
            [compojure.handler :as handler]
            [marianoguerra.friend-json-workflow :as json-auth]
            [cheshire.core :as json]
            [expensapp.users :as u]
            [expensapp.expenses :as e]
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
                (content-type "application/vnd.expensapp.auth.v1+json"))
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


(defn- to-js-expense [{:keys [id datetime amount comment description]}]
  {:datetime (clj-time.coerce/to-long datetime)
   :amount amount
   :comment comment
   :description description
   :location (format "/expense/%s" id)})

(defn make-expense-routes [db]
  (routes
   (POST "/expense" req (friend/authenticated
                         (let [user-id (:id (friend/current-authentication req))]
                           (let [{:strs [datetime amount comment description]} (:body req)
                                 expense (e/create db user-id datetime amount comment description)]
                             (-> {:status 204}
                                 (header "Location" (format "/expense/%s" (:id expense))))))))
   (GET "/expense" req
        (friend/authenticated
         (if-let [start-date (Long/parseLong (get-in req [:query-params "week_beginning"]))]
           (let [user-id (:id (friend/current-authentication req))]
             (-> (response (map to-js-expense (e/get-expenses-from db user-id start-date)))
                 (content-type "application/vnd.expensapp.expenses.v1+json"))))))
   (DELETE "/expense/:id" [id :as req]
        (friend/authenticated
         (let [user-id (:id (friend/current-authentication req))
               uuid (java.util.UUID/fromString id)]
           (e/delete-expense! db user-id uuid)
           {:status 204})))
   (PUT "/expense/:id" [id :as req]
        (friend/authenticated
         (let [user-id (:id (friend/current-authentication req))
               expense-id (java.util.UUID/fromString id)
               {:strs [datetime amount comment description]} (:body req)]
           (when (e/update-expense! db user-id expense-id datetime amount comment description)
             {:status 204}))))))

(defn make-all-routes [db]
  (-> (ring.middleware.session/wrap-session
       (friend/authenticate (routes app-routes (make-account-routes db) (make-expense-routes db))
                            {:login-uri "/"
                             :default-landing-uri "/session"
                             :workflows [(make-auth-routes db)]
                             :unauthenticated-handler (fn [req] {:status 401})}))))
