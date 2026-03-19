, t4) {
                    if (s2) {
                      for (u2 in c2 = void 0, s2) if (u2.toLowerCase() === o2.toLowerCase()) {
                        c2 = s2[u2];
                        break;
                      }
                    }
                    a3(o2, c2);
                  }
                }
                r.default.extend(true, t4, n4), ("rtl" === e5.dir || t4.rightAlign) && (e5.style.textAlign = "right");
                ("rtl" === e5.dir || t4.numericInput) && (e5.dir = "ltr", e5.removeAttribute("dir"), t4.isRTL = true);
                return Object.keys(n4).length;
              })(e4, i3, r.default.extend(true, {}, t3.userOptions), t3.dataAttribute)) {
                var a2 = (0, u.generateMaskSet)(i3, t3.noMasksCache);
                void 0 !== a2 && (void 0 !== e4.inputmask && (e4.inputmask.opts.autoUnmask = true, e4.inputmask.remove()), e4.inputmask = new y(void 0, void 0, true), e4.inputmask.opts = i3, e4.inputmask.noMasksCache = t3.noMasksCache, e4.inputmask.userOptions = r.default.extend(true, {}, t3.userOptions), e4.inputmask.el = e4, e4.inputmask.$el = (0, r.default)(e4), e4.inputmask.maskset = a2, r.default.data(e4, g, t3.userOptions), c.mask.call(e4.inputmask));
              }
            })), e3 && e3[0] && e3[0].inputmask || this;
          }, option: function(e3, t3) {
            return "string" == typeof e3 ? this.opts[e3] : "object" === h(e3) ? (r.default.extend(this.userOptions, e3), this.el && true !== t3 && this.mask(this.el), this) : void 0;
          }, unmaskedvalue: function(e3) {
            if (this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache), void 0 === this.el || void 0 !== e3) {
              var t3 = ("function" == typeof this.opts.onBeforeMask && this.opts.onBeforeMask.call(this, e3, this.opts) || e3).split("");
              s.checkVal.call(this, void 0, false, false, t3), "function" == typeof this.opts.onBeforeWrite && this.opts.onBeforeWrite.call(this, void 0, f.getBuffer.call(this), 0, this.opts);
            }
            return s.unmaskedvalue.call(this, this.el);
          }, remove: function() {
            if (this.el) {
              r.default.data(this.el, g, null);
              var e3 = this.opts.autoUnmask ? (0, s.unmaskedvalue)(this.el) : this._valueGet(this.opts.autoUnmask);
              e3 !== f.getBufferTemplate.call(this).join("") ? this._valueSet(e3, this.opts.autoUnmask) : this._valueSet(""), o.EventRuler.off(this.el), Object.getOwnPropertyDescriptor && Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.el), "value") && this.__valueGet && Object.defineProperty(this.el, "value", { get: this.__valueGet, set: this.__valueSet, configurable: true }) : m.__lookupGetter__ && this.el.__lookupGetter__("value") && this.__valueGet && (this.el.__defineGetter__("value", this.__valueGet), this.el.__defineSetter__("value", this.__valueSet)), this.el.inputmask = void 0;
            }
            return this.el;
          }, getemptymask: function() {
            return this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache), (this.isRTL ? f.getBufferTemplate.call(this).reverse() : f.getBufferTemplate.call(this)).join("");
          }, hasMaskedValue: function() {
            return !this.opts.autoUnmask;
          }, isComplete: function() {
            return this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache), p.isComplete.call(this, f.getBuffer.call(this));
          }, getmetadata: function() {
            if (this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache), Array.isArray(this.maskset.metadata)) {
      