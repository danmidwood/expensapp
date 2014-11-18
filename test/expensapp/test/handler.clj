(ns expensapp.test.handler
  (:use clojure.test
        ring.mock.request
        expensapp.handler))

(deftest test-app
  (testing "home route"
    (let [response (app (request :get "/"))]
      (is (= (:status response) 302))
      (is (= (get-in response [:headers "Location"])
             "/index.html"))))
  (testing "not-found route"
    (let [response (app (request :get "/invalid"))]
      (is (= (:status response) 404))))
  ;; (testing "auth route"
  ;;   (let [response (app (-> (request :post "/session" "{\"username\": \"dan\",\"password\": \"dan\"}")
  ;;                           (header "Content-Type" "application/json")
  ;;                           (assoc-in [:cookie] (str "ring-session" "=" "7a621922-5e2f-4ae7-b0e5-590703d27908"))))]
  ;;     (is (= (:status response) 301))))
  )
