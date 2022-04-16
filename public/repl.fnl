(local js (require :js))
(local fennel (require "fennel/fennel"))
(local log (fn [...] (: js.global.console :log ...)))

(local env (setmetatable {:js js :fennel fennel :log log}
                         {:__index _G}))

(set env._ENV env)

(var last-input nil)
(var last-value nil)

(local progress {})

(fn match? [input target]
  (-> (: input :lower)
      (: :gsub "^ +" "")
      (: :gsub " +$" "")
      (= target)))

(fn ok [key msg]
  (narrate msg)
  (tset progress key true))

(fn tutorial-fn []
  (while (not progress.print)
    (coroutine.yield)
    (if (match? last-input "(print \"hello world!\")")
        (ok :print "Very good; that's the idea.")
        (: last-input :find "%(print")
        (ok :print "Well, not exactly what I had in mind, but close enough.")
        :else nil))

  (narrate "How about some math; do you like math? Try this: (+ 1 1)")
  (while (not progress.math)
    (coroutine.yield)
    (if (match? last-input "(+ 1 1)")
        (ok :math (.. "Yes, perfect. As you can see, the operator goes first. "
                      "You'll get used to it."))
        (and (= last-value "2") (: last-input :find "%(%+"))
        (ok :math "OK, you've more or less got the idea.")
        (= last-value "2")
        (ok :math "Well, the point is you got the right answer.")
        (: last-value :find "[0-9]+")
        (narrate "You can do better than that!")
        :else nil))

  (narrate "Let's try a function now: (fn add [x y] (+ x y))")
  (while (not progress.fn)
    (set env.___replLocals___.add nil)
    (coroutine.yield)
    (let [ok? (and (= (type env.___replLocals___.add) "function") (pcall env.___replLocals___.add 1 1))]
      (if (and ok? (= 10 (env.___replLocals___.add 2 8)) (= 5 (env.___replLocals___.add 10 -5)))
          (ok :fn "Not the most useful function to have, but nicely done.")
          (= (type env.___replLocals___.add) "function")
          (narrate (.. "Well, you defined a function, but it had a problem. "
                       "Try again?"))
          :else nil)))

  (narrate "")
  (narrate "Listen, that's all I have time for right now unfortunately.")
  (narrate "There's a bunch more documentation listed below.")
  (narrate (.. "None of it is fun and interactive, but it's pretty thorough; "
               "give it a go."))
  (narrate "")
  (narrate "Have fun! I hope you like Fennel."))

(local tutorial (coroutine.create tutorial-fn))
(coroutine.resume tutorial)

(narrate "You can run any Fennel code here; try this: (print \"Hello world!\")")

(partial fennel.repl {:moduleName "fennel/fennel"
                      :readChunk (fn []
                                   (let [input (coroutine.yield)]
                                     (set last-input input)
                                     ;; TODO: pass scope in here somehow
                                     (printLuacode
                                      (pcall fennel.compileString input))
                                     (print (.. "> " input))
                                     (.. input "\n")))
                      :onValues (fn [xs]
                                  (print (table.concat xs "\t"))
                                  (set last-value (. xs 1))
                                  (coroutine.resume tutorial))
                      ;; TODO: make errors red
                      :onError (fn [_ msg]
                                 (log msg)
                                 (printError msg))
                      :pp fennel.view
                      :env env
                      :allowedGlobals false})
