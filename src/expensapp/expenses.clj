(ns expensapp.expenses
  (:require (cemerick.friend [credentials :as creds])
            [clj-time.core :as c]
            [clj-time.coerce :as tc]
            [taoensso.timbre :as timbre]
            [yesql.core :refer [defqueries]]))

(defqueries "expensapp/sql/expenses.sql"
;; -create-expense
)

(defn create [db user-id datetime amount comment description]
  (let [id (java.util.UUID/randomUUID)
        sql-datetime (tc/to-sql-time datetime)]
    (-> (-create-expense db id user-id sql-datetime amount comment description)
        first)))
