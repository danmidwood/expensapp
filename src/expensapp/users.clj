(ns expensapp.users
  (:require (cemerick.friend [credentials :as creds])

            [taoensso.timbre :as timbre]
            [yesql.core :refer [defqueries]]))

(defqueries "expensapp/sql/users.sql"
;; -username-available?
;; -get-user
;; -add-user
)

(defn username-available? [db username]
  (-> (-username-available? db username)
      first
      :exists
      not))

(defn auths? [db username password]
  (when-first [user-record (-get-user db username)]
    (if (creds/bcrypt-verify password (:pass user-record))
      {:id (:id user-record)
       :username (:name user-record)})))

(defn add-user [db username password]
  (-add-user! db (java.util.UUID/randomUUID)
              username (creds/hash-bcrypt password)))
