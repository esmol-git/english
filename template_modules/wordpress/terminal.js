ally {
                          try {
                            if (!s2 && null != n6.return && (o5 = n6.return(), Object(o5) !== o5)) return;
                          } finally {
                            if (c4) throw a2;
                          }
                        }
                        return l3;
                      }
                    })(e5, t6) || (function(e6, t7) {
                      if (!e6) return;
                      if ("string" == typeof e6) return s(e6, t7);
                      var n6 = Object.prototype.toString.call(e6).slice(8, -1);
                      "Object" === n6 && e6.constructor && (n6 = e6.constructor.name);
                      if ("Map" === n6 || "Set" === n6) return Array.from(e6);
                      if ("Arguments" === n6 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n6)) return s(e6, t7);
                    })(e5, t6) || (function() {
                      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                    })();
          