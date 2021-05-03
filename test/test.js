"use strict";

function setOfCachedUrls(e) {
    return e.keys().then(function (e) {
        return e.map(function (e) {
            return e.url
        })
    }).then(function (e) {
        return new Set(e)
    })
}

var precacheConfig = [["index.html", "9424a9895e9c36e818f506be6a5a9f0c"], ["static/css/app.1fe3c7c2124784ad398139ef17a1c361.css", "10a5cc21782f827d41722cbf3c41e03d"], ["static/js/app.7491c06e18f38f69647a.js", "8f1e6ae4ba2341121e7e5cd480a0b29e"], ["static/js/manifest.bff33bc5c42826ba6bef.js", "a639f723db5fa49fcc4ade43110f4fe9"], ["static/js/vendor.66a296ec1fe3f89903af.js", "24523ee5a466d6db9fe5d3625c4d4a8a"]],
    cacheName = "sw-precache-v3-my-vue-app-" + (self.registration ? self.registration.scope : ""),
    ignoreUrlParametersMatching = [/^utm_/], addDirectoryIndex = function (e, t) {
        var n = new URL(e);
        return "/" === n.pathname.slice(-1) && (n.pathname += t), n.toString()
    }, cleanResponse = function (e) {
        return e.redirected ? ("body" in e ? Promise.resolve(e.body) : e.blob()).then(function (t) {
            return new Response(t, {headers: e.headers, status: e.status, statusText: e.statusText})
        }) : Promise.resolve(e)
    }, createCacheKey = function (e, t, n, r) {
        var a = new URL(e);
        return r && a.pathname.match(r) || (a.search += (a.search ? "&" : "") + encodeURIComponent(t) + "=" + encodeURIComponent(n)), a.toString()
    }, isPathWhitelisted = function (e, t) {
        if (0 === e.length) return !0;
        var n = new URL(t).pathname;
        return e.some(function (e) {
            return n.match(e)
        })
    }, stripIgnoredUrlParameters = function (e, t) {
        var n = new URL(e);
        return n.hash = "", n.search = n.search.slice(1).split("&").map(function (e) {
            return e.split("=")
        }).filter(function (e) {
            return t.every(function (t) {
                return !t.test(e[0])
            })
        }).map(function (e) {
            return e.join("=")
        }).join("&"), n.toString()
    }, hashParamName = "_sw-precache", urlsToCacheKeys = new Map(precacheConfig.map(function (e) {
        var t = e[0], n = e[1], r = new URL(t, self.location), a = createCacheKey(r, hashParamName, n, !1);
        return [r.toString(), a]
    }));
self.addEventListener("install", function (e) {
    e.waitUntil(caches.open(cacheName).then(function (e) {
        return setOfCachedUrls(e).then(function (t) {
            return Promise.all(Array.from(urlsToCacheKeys.values()).map(function (n) {
                if (!t.has(n)) {
                    var r = new Request(n, {credentials: "same-origin"});
                    return fetch(r).then(function (t) {
                        if (!t.ok) throw new Error("Request for " + n + " returned a response with status " + t.status);
                        return cleanResponse(t).then(function (t) {
                            return e.put(n, t)
                        })
                    })
                }
            }))
        })
    }).then(function () {
        return self.skipWaiting()
    }))
}), self.addEventListener("activate", function (e) {
    var t = new Set(urlsToCacheKeys.values());
    e.waitUntil(caches.open(cacheName).then(function (e) {
        return e.keys().then(function (n) {
            return Promise.all(n.map(function (n) {
                if (!t.has(n.url)) return e.delete(n)
            }))
        })
    }).then(function () {
        return self.clients.claim()
    }))
}), self.addEventListener("fetch", function (e) {
    if ("GET" === e.request.method) {
        var t, n = stripIgnoredUrlParameters(e.request.url, ignoreUrlParametersMatching);
        (t = urlsToCacheKeys.has(n)) || (n = addDirectoryIndex(n, "index.html"), t = urlsToCacheKeys.has(n));
        t && e.respondWith(caches.open(cacheName).then(function (e) {
            return e.match(urlsToCacheKeys.get(n)).then(function (e) {
                if (e) return e;
                throw Error("The cached response that was expected is missing.")
            })
        }).catch(function (t) {
            return console.warn('Couldn\'t serve response for "%s" from cache: %O', e.request.url, t), fetch(e.request)
        }))
    }
});
