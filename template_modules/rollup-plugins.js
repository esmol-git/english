           return e3 instanceof c ? e3 : this instanceof c ? void (null != e3 && e3 !== i2.default && (this[0] = e3.nodeName ? e3 : void 0 !== e3[0] && e3[0].nodeName ? e3[0] : s.querySelector(e3), void 0 !== this[0] && null !== this[0] && (this[0].eventRegistry = this[0].eventRegistry || {}))) : new c(e3);
          }
          c.prototype = { on: r.on, off: r.off, trigger: r.trigger }, c.extend = o.default, c.data = a.default, c.Event = r.Event;
          t2.default = c;
        }, 9845: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.mobile = t2.iphone = t2.ie = void 0;
          var i2, a = (i2 = n2(9380)) && i2.__esModule ? i2 : { default: i2 };
          var r = a.default.navigator && a.default.navigator.userAgent || "";
      