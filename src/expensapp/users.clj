(ns expensapp.users
  (:require (cemerick.friend [credentials :as creds])))

(def users (atom {}))

(defn username-available? [username]
  (not (get @users username)))

(defn auths? [username password]
  (if-let [user-record (@users username)]
    (if (creds/bcrypt-verify password (:password user-record))
      (dissoc user-record :password))))

(defn add-user [username password]
  (swap! users assoc username {:username username :password (creds/hash-bcrypt password)}))
