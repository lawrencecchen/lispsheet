const window = this;
importScripts('/fengari-web.js');

fetch('/repl-worker.lua')
    .then(response => response.text())
    .then(sourceCode => window.fengari.load(sourceCode)())
