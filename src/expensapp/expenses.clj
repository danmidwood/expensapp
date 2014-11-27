(ns expensapp.expenses
  (:require (cemerick.friend [credentials :as creds])
            [clj-time.coerce :as tc]
            [taoensso.timbre :as timbre]
            [yesql.core :refer [defqueries]]))

(defqueries "expensapp/sql/expenses.sql"
;; -create-expense
;; -get-expenses
;; delete-expense!
;; -update-expense!
)

(defn create [db user-id datetime amount comment description]
  (let [id (java.util.UUID/randomUUID)
        sql-datetime (tc/to-sql-time datetime)]
    (-> (-create-expense db id user-id sql-datetime amount comment description)
        first)))

(defn get-expenses-from [db user-id start-date]
  (let [sql-datetime (tc/to-sql-time start-date)]
    (-get-expenses db user-id sql-datetime)))

(defn update-expense! [db user-id id datetime amount comment description]
  (-update-expense! db (tc/to-sql-time datetime) amount comment description
                    user-id id))
