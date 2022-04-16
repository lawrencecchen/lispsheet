package.path = "./?.lua"
local js = require "js"

local _G = _G
local pack = table.pack
local tostring = tostring

-- just make a few things not blow up
_G.os.exit = function() end
_G.os.getenv = function() return nil end

-- require-macros depends on io.open; we splice in a hacky replacement
io={open=function(filename)
    return {
        read = function(_, all)
            assert(all=="*all", "Can only read *all.")
            local xhr = js.new(js.global.XMLHttpRequest)
            xhr:open("GET", filename, false)
            xhr:send()
            assert(xhr.status == 200, xhr.status .. ": " .. xhr.statusText)
            return tostring(xhr.response)
        end,
        close = function() end,
    }
end}

function postContent(functionName, lines)
    for i = 1, lines.n do
        js.global:postMessage(functionName .. "|append|" .. tostring(lines[i]))
        -- js.global:postMessage(functionName .. "|append|" .. tostring(lines[i]))
    end
    -- js.global:postMessage(functionName .. "|dispatch|")
end

-- _G.printLuacode = function(...)
--     postContent("printLuacode", pack(...))
-- end

_G.print = function(...)
    postContent("print", pack(...))
end

-- _G.narrate = function(...)
--     postContent("narrate", pack(...))
-- end

-- _G.printError = function(...)
--     postContent("printError", pack(...))
-- end

local fennel = require("fennel/fennel")
package.loaded.fennel = fennel

-- repl = coroutine.create(fennel.dofile("repl.fnl"))

-- local welcome = "Welcome to Fennel " .. fennel.version
--     .. ", running on Fengari (" .. _VERSION .. ")"

-- _G.print(welcome)

-- _G.printLuacode("Compiled Lua code")

-- js.global:postMessage("loaded|loaded|" .. welcome)

-- assert(coroutine.resume(repl))

js.global:postMessage("info|Fennel VM loaded...")

js.global.onmessage = function(_, event)
    -- _G.print(event)
    -- coroutine.resume(repl, event.data)
    -- _G.print(event.data)
    js.global:postMessage("calc|" .. event.data[0] .. "|" .. fennel.eval(event.data[1]))
end
