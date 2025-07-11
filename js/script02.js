/* instafeed.js | v2.0.0 | https://github.com/stevenschobert/instafeed.js | License: MIT */
!function(e, t) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).Instafeed = t()
}(this, function() {
  "use strict";
  function e(e, t) {
      if (!e)
          throw new Error(t)
  }
  function t(t) {
      e(!t || "object" == typeof t, "options must be an object, got " + t + " (" + typeof t + ")");
      var o = {
          accessToken: null,
          accessTokenTimeout: 1e4,
          after: null,
          apiTimeout: 1e4,
          apiLimit: null,
          before: null,
          debug: !1,
          error: null,
          filter: null,
          limit: null,
          mock: !1,
          render: null,
          sort: null,
          success: null,
          target: "instafeed",
          template: '<a href="{{link}}"><img title="{{caption}}" src="{{image}}" /></a>',
          templateBoundaries: ["{{", "}}"],
          transform: null
      };
      if (t)
          for (var n in o)
              "undefined" != typeof t[n] && (o[n] = t[n]);
      e("string" == typeof o.target || "object" == typeof o.target, "target must be a string or DOM node, got " + o.target + " (" + typeof o.target + ")"),
      e("string" == typeof o.accessToken || "function" == typeof o.accessToken, "accessToken must be a string or function, got " + o.accessToken + " (" + typeof o.accessToken + ")"),
      e("number" == typeof o.accessTokenTimeout, "accessTokenTimeout must be a number, got " + o.accessTokenTimeout + " (" + typeof o.accessTokenTimeout + ")"),
      e("number" == typeof o.apiTimeout, "apiTimeout must be a number, got " + o.apiTimeout + " (" + typeof o.apiTimeout + ")"),
      e("boolean" == typeof o.debug, "debug must be true or false, got " + o.debug + " (" + typeof o.debug + ")"),
      e("boolean" == typeof o.mock, "mock must be true or false, got " + o.mock + " (" + typeof o.mock + ")"),
      e("object" == typeof o.templateBoundaries && 2 === o.templateBoundaries.length && "string" == typeof o.templateBoundaries[0] && "string" == typeof o.templateBoundaries[1], "templateBoundaries must be an array of 2 strings, got " + o.templateBoundaries + " (" + typeof o.templateBoundaries + ")"),
      e(!o.template || "string" == typeof o.template, "template must null or string, got " + o.template + " (" + typeof o.template + ")"),
      e(!o.error || "function" == typeof o.error, "error must be null or function, got " + o.error + " (" + typeof o.error + ")"),
      e(!o.before || "function" == typeof o.before, "before must be null or function, got " + o.before + " (" + typeof o.before + ")"),
      e(!o.after || "function" == typeof o.after, "after must be null or function, got " + o.after + " (" + typeof o.after + ")"),
      e(!o.success || "function" == typeof o.success, "success must be null or function, got " + o.success + " (" + typeof o.success + ")"),
      e(!o.filter || "function" == typeof o.filter, "filter must be null or function, got " + o.filter + " (" + typeof o.filter + ")"),
      e(!o.transform || "function" == typeof o.transform, "transform must be null or function, got " + o.transform + " (" + typeof o.transform + ")"),
      e(!o.sort || "function" == typeof o.sort, "sort must be null or function, got " + o.sort + " (" + typeof o.sort + ")"),
      e(!o.render || "function" == typeof o.render, "render must be null or function, got " + o.render + " (" + typeof o.render + ")"),
      e(!o.limit || "number" == typeof o.limit, "limit must be null or number, got " + o.limit + " (" + typeof o.limit + ")"),
      e(!o.apiLimit || "number" == typeof o.apiLimit, "apiLimit must null or number, got " + o.apiLimit + " (" + typeof o.apiLimit + ")"),
      this._state = {
          running: !1,
          node: null,
          token: null,
          paging: null,
          pool: []
      },
      this._options = o
  }
  return t.prototype.run = function() {
      var e = this;
      return this._debug("run", "options", this._options),
      this._debug("run", "state", this._state),
      this._state.running ? (this._debug("run", "already running, skipping"),
      !1) : (this._start(),
      this._debug("run", "getting dom node"),
      "string" == typeof this._options.target ? this._state.node = document.getElementById(this._options.target) : this._state.node = this._options.target,
      this._state.node ? (this._debug("run", "got dom node", this._state.node),
      this._debug("run", "getting access token"),
      this._getAccessToken(function(t, o) {
          if (t)
              return e._debug("onTokenReceived", "error", t),
              void e._fail(new Error("error getting access token: " + t.message));
          e._debug("onTokenReceived", "got token", o),
          e._state.token = o,
          e._showNext(function(t) {
              if (t)
                  return e._debug("onNextShown", "error", t),
                  void e._fail(t);
              e._finish()
          })
      }),
      !0) : (this._fail(new Error("no element found with ID " + this._options.target)),
      !1))
  }
  ,
  t.prototype.hasNext = function() {
      var e = this._state.paging
        , t = this._state.pool;
      return this._debug("hasNext", "paging", e),
      this._debug("hasNext", "pool", t.length, t),
      t.length > 0 || e && "string" == typeof e.next
  }
  ,
  t.prototype.next = function() {
      var e = this;
      return e.hasNext() ? e._state.running ? (e._debug("next", "already running, skipping"),
      !1) : (e._start(),
      void e._showNext(function(t) {
          if (t)
              return e._debug("onNextShown", "error", t),
              void e._fail(t);
          e._finish()
      })) : (e._debug("next", "hasNext is false, skipping"),
      !1)
  }
  ,
  t.prototype._showNext = function(e) {
      var t = this
        , o = null
        , n = null
        , i = "number" == typeof this._options.limit;
      if (t._debug("showNext", "pool", t._state.pool.length, t._state.pool),
      t._state.pool.length > 0) {
          if (n = i ? t._state.pool.splice(0, t._options.limit) : t._state.pool.splice(0),
          t._debug("showNext", "items from pool", n.length, n),
          t._debug("showNext", "updated pool", t._state.pool.length, t._state.pool),
          t._options.mock)
              t._debug("showNext", "mock enabled, skipping render");
          else
              try {
                  t._renderData(n)
              } catch (s) {
                  return void e(s)
              }
          e(null)
      } else
          t._state.paging && "string" == typeof t._state.paging.next ? o = t._state.paging.next : (o = "https://graph.instagram.com/me/media?fields=caption,id,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=" + t._state.token,
          t._options.apiLimit || "number" != typeof t._options.limit ? "number" == typeof t._options.apiLimit && (t._debug("showNext", "apiLimit set, overriding limit", t._options.apiLimit, t._options.limit),
          o = o + "&limit=" + t._options.apiLimit) : (t._debug("showNext", "no apiLimit set, falling back to limit", t._options.apiLimit, t._options.limit),
          o = o + "&limit=" + t._options.limit)),
          t._debug("showNext", "making request", o),
          t._makeApiRequest(o, function(o, n) {
              var i = null;
              if (o)
                  return t._debug("onResponseReceived", "error", o),
                  void e(new Error("api request error: " + o.message));
              t._debug("onResponseReceived", "data", n),
              t._success(n),
              t._debug("onResponseReceived", "setting paging", n.paging),
              t._state.paging = n.paging;
              try {
                  if (i = t._processData(n),
                  t._debug("onResponseReceived", "processed data", i),
                  i.unused && i.unused.length > 0) {
                      t._debug("onResponseReceived", "saving unused to pool", i.unused.length, i.unused);
                      for (var r = 0; r < i.unused.length; r++)
                          t._state.pool.push(i.unused[r])
                  }
              } catch (a) {
                  return void e(a)
              }
              if (t._options.mock)
                  t._debug("onResponseReceived", "mock enabled, skipping append");
              else
                  try {
                      t._renderData(i.items)
                  } catch (s) {
                      return void e(s)
                  }
              e(null)
          })
  }
  ,
  t.prototype._processData = function(e) {
      var t = "function" == typeof this._options.transform
        , o = "function" == typeof this._options.filter
        , n = "function" == typeof this._options.sort
        , i = "number" == typeof this._options.limit
        , s = []
        , r = null
        , a = null
        , u = null
        , l = null
        , p = null;
      if (this._debug("processData", "hasFilter", o, "hasTransform", t, "hasSort", n, "hasLimit", i),
      "object" != typeof e || "object" != typeof e.data || e.data.length <= 0)
          return null;
      for (var c = 0; c < e.data.length; c++) {
          if (a = this._getItemData(e.data[c]),
          t)
              try {
                  u = this._options.transform(a),
                  this._debug("processData", "transformed item", a, u)
              } catch (f) {
                  throw this._debug("processData", "error calling transform", f),
                  new Error("error in transform: " + f.message)
              }
          else
              u = a;
          if (o) {
              try {
                  l = this._options.filter(u),
                  this._debug("processData", "filter item result", u, l)
              } catch (f) {
                  throw this._debug("processData", "error calling filter", f),
                  new Error("error in filter: " + f.message)
              }
              l && s.push(u)
          } else
              s.push(u)
      }
      if (n)
          try {
              s.sort(this._options.sort)
          } catch (f) {
              throw this._debug("processData", "error calling sort", f),
              new Error("error in sort: " + f.message)
          }
      return i && (r = s.length - this._options.limit,
      this._debug("processData", "checking limit", s.length, this._options.limit, r),
      r > 0 && (p = s.slice(s.length - r),
      this._debug("processData", "unusedItems", p.length, p),
      s.splice(s.length - r, r))),
      {
          items: s,
          unused: p
      }
  }
  ,
  t.prototype._extractTags = function(e) {
      var t = /#([^\s]+)/gi
        , o = /[~`!@#$%^&*\(\)\-\+={}\[\]:;"'<>\?,\./|\\\s]+/i
        , n = []
        , i = null;
      if ("string" == typeof e)
          for (; null !== (i = t.exec(e)); )
              !1 === o.test(i[1]) && n.push(i[1]);
      return n
  }
  ,
  t.prototype._getItemData = function(e) {
      var t = null
        , o = null;
      switch (e.media_type) {
      case "IMAGE":
          t = "image",
          o = e.media_url;
          break;
      case "VIDEO":
          t = "video",
          o = e.thumbnail_url;
          break;
      case "CAROUSEL_ALBUM":
          t = "album",
          o = e.media_url
      }
      return {
          caption: e.caption,
          tags: this._extractTags(e.caption),
          id: e.id,
          image: o,
          link: e.permalink,
          model: e,
          timestamp: e.timestamp,
          type: t,
          username: e.username
      }
  }
  ,
  t.prototype._renderData = function(e) {
      var t = "string" == typeof this._options.template
        , o = "function" == typeof this._options.render
        , n = null
        , i = null
        , s = null
        , r = "";
      if (this._debug("renderData", "hasTemplate", t, "hasRender", o),
      !("object" != typeof e || e.length <= 0)) {
          for (var a = 0; a < e.length; a++) {
              if (n = e[a],
              o)
                  try {
                      i = this._options.render(n, this._options),
                      this._debug("renderData", "custom render result", n, i)
                  } catch (u) {
                      throw this._debug("renderData", "error calling render", u),
                      new Error("error in render: " + u.message)
                  }
              else
                  t && (i = this._basicRender(n));
              i ? r += i : this._debug("renderData", "render item did not return any content", n)
          }
          for (this._debug("renderData", "html content", r),
          (s = document.createElement("div")).innerHTML = r,
          this._debug("renderData", "container", s, s.childNodes.length, s.childNodes); s.childNodes.length > 0; )
              this._debug("renderData", "appending child", s.childNodes[0]),
              this._state.node.appendChild(s.childNodes[0])
      }
  }
  ,
  t.prototype._basicRender = function(e) {
      for (var t = new RegExp(this._options.templateBoundaries[0] + "([\\s\\w.]+)" + this._options.templateBoundaries[1],"gm"), o = this._options.template, n = null, i = "", s = 0, r = null, a = null; null !== (n = t.exec(o)); )
          r = n[1],
          i += o.slice(s, n.index),
          (a = this._valueForKeyPath(r, e)) && (i += a.toString()),
          s = t.lastIndex;
      return s < o.length && (i += o.slice(s, o.length)),
      i
  }
  ,
  t.prototype._valueForKeyPath = function(e, t) {
      for (var o = /([\w]+)/gm, n = null, i = t; null !== (n = o.exec(e)); ) {
          if ("object" != typeof i)
              return null;
          i = i[n[1]]
      }
      return i
  }
  ,
  t.prototype._fail = function(e) {
      !this._runHook("error", e) && console && "function" == typeof console.error && console.error(e),
      this._state.running = !1
  }
  ,
  t.prototype._start = function() {
      this._state.running = !0,
      this._runHook("before")
  }
  ,
  t.prototype._finish = function() {
      this._runHook("after"),
      this._state.running = !1
  }
  ,
  t.prototype._success = function(e) {
      this._runHook("success", e),
      this._state.running = !1
  }
  ,
  t.prototype._makeApiRequest = function(e, t) {
      var o = !1
        , n = this
        , i = null
        , s = function(e, n) {
          o || (o = !0,
          t(e, n))
      };
      (i = new XMLHttpRequest).ontimeout = function() {
          s(new Error("api request timed out"))
      }
      ,
      i.onerror = function() {
          s(new Error("api connection error"))
      }
      ,
      i.onload = function(e) {
          var t = i.getResponseHeader("Content-Type")
            , o = null;
          if (n._debug("apiRequestOnLoad", "loaded", e),
          n._debug("apiRequestOnLoad", "response status", i.status),
          n._debug("apiRequestOnLoad", "response content type", t),
          t.indexOf("application/json") >= 0)
              try {
                  o = JSON.parse(i.responseText)
              } catch (r) {
                  return n._debug("apiRequestOnLoad", "json parsing error", r, i.responseText),
                  void s(new Error("error parsing response json"))
              }
          200 === i.status ? s(null, o) : o && o.error ? s(new Error(o.error.code + " " + o.error.message)) : s(new Error("status code " + i.status))
      }
      ,
      i.open("GET", e, !0),
      i.timeout = this._options.apiTimeout,
      i.send()
  }
  ,
  t.prototype._getAccessToken = function(e) {
      var t = !1
        , o = this
        , n = null
        , i = function(o, i) {
          t || (t = !0,
          clearTimeout(n),
          e(o, i))
      };
      if ("function" == typeof this._options.accessToken) {
          this._debug("getAccessToken", "calling accessToken as function"),
          n = setTimeout(function() {
              o._debug("getAccessToken", "timeout check", t),
              i(new Error("accessToken timed out"), null)
          }, this._options.accessTokenTimeout);
          try {
              this._options.accessToken(function(e, n) {
                  o._debug("getAccessToken", "received accessToken callback", t, e, n),
                  i(e, n)
              })
          } catch (s) {
              this._debug("getAccessToken", "error invoking the accessToken as function", s),
              i(s, null)
          }
      } else
          this._debug("getAccessToken", "treating accessToken as static", typeof this._options.accessToken),
          i(null, this._options.accessToken)
  }
  ,
  t.prototype._debug = function() {
      var e = null;
      this._options.debug && console && "function" == typeof console.log && ((e = [].slice.call(arguments))[0] = "[Instafeed] [" + e[0] + "]",
      console.log.apply(null, e))
  }
  ,
  t.prototype._runHook = function(e, t) {
      var o = !1;
      if ("function" == typeof this._options[e])
          try {
              this._options[e](t),
              o = !0
          } catch (n) {
              this._debug("runHook", "error calling hook", e, n)
          }
      return o
  }
  ,
  t
});
// # sourceMappingURL=instafeed.min.map
