[1]) ? _[1] : parseInt(_[1]);
                  "*" !== E && "+" !== E || (E = "*" === j ? 0 : 1), O.quantifier = { min: E, max: j, jit: T };
                  var A = m.length > 0 ? m[m.length - 1].matches : v.matches;
                  (i3 = A.pop()).isGroup || (i3 = x([i3])), A.push(i3), A.push(O);
                  break;
                case n3.alternatormarker:
                  if (m.length > 0) {
                    var D = (c2 = m[m.length - 1]).matches[c2.matches.length - 1];
                    f = c2.openGroup && (void 0 === D.matches || false === D.isGroup && false === D.isAlternator) ? m.pop() : P(c2.matches);
                  } else f = P(v.matches);
                  if (f.isAlternator) m.push(f);
                  else if (f.alternatorGroup ? (u = m.pop(), f.alternatorGroup = false) : u = new o.default(false, false, false, true), u.matches.push(f), m.push(u), f.openGroup) {
                    f.openGroup = false;
                    var L = new o.default(true);
                    L.alternatorGroup = true, m.push(L);
                  }
                  break;
                default:
                  b();
              }
            }
            y && w();
            for (; m.length > 0; ) s2 = m.pop(), v.matches.push(s2);
            v.matches.length > 0 && (!(function e4(i4) {
              i4 && i4.matches && i4.matches.forEach((function(a3, r2) {
                var o2 = i4.matches[r2 + 1];
                (void 0 === o2 || void 0 === o2.matches || false === o2.isQuantifier) && a3 && a3.isGroup && (a3.isGroup = false, t3 || (k(a3, n3.groupmarker[0], 0), true !== a3.openGroup && k(a3, n3.groupmarker[1]))), e4(a3);
              }));
            })(v), g.push(v));
            (n3.numericInput || n3.isRTL) && (function e4(t4) {
              for (var i4 in t4.matches = t4.matches.reverse(), t4.matches) if (Object.prototype.hasOwnProperty.call(t4.matches, i4)) {
                var a3 = parseInt(i4);
                if (t4.matches[i4].isQuantifier && t4.matches[a3 + 1] && t4.matches[a3 + 1].isGroup) {
                  var r2 = t4.matches[i4];
                  t4.matches.splice(i4, 1), t4.matches.splice(a3 + 1, 0, r2);
                }
                void 0 !== t4.matches[i4].matches ? t4.matches[i4] = e4(t4.matches[i4]) : t4.matches[i4] = ((o2 = t4.matches[i4]) === n3.optionalmarker[0] ? o2 = n3.optionalmarker[1] : o2 === n3.optionalmarker[1] ? o2 = n3.optionalmarker[0] : o2 === n3.groupmarker[0] ? o2 = n3.groupmarker[1] : o2 === n3.groupmarker[1] && (o2 = n3.groupmarker[0]), o2);
              }
              var o2;
              return t4;
            })(g[0]);
            return g;
          }, t2.generateMaskSet = function(e3, t3) {
            var n3;
            function 