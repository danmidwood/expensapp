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
      (is (= (:status response) 404)))))
