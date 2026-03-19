.opts, d2 = o2.dependencyLib, h2 = o2.maskset, v2 = this, m2 = d2(v2), g2 = e3.key, k = c.caret.call(o2, v2), b = p2.onKeyDown.call(this, e3, c.getBuffer.call(o2), k, p2);
            if (void 0 !== b) return b;
            if (g2 === s.keys.Backspace || g2 === s.keys.Delete || r.iphone && g2 === s.keys.BACKSPACE_SAFARI || e3.ctrlKey && g2 === s.keys.x && !("oncut" in v2)) e3.preventDefault(), u.handleRemove.call(o2, v2, g2, k), (0, l.writeBuffer)(v2, c.getBuffer.call(o2, true), h2.p, e3, v2.inputmask._valueGet() !== c.getBuffer.call(o2).join(""));
            else if (g2 === s.keys.End || g2 === s.keys.PageDown) {
              e3.preventDefault();
              var x = c.seekNext.call(o2, c.getLastValidPosition.call(o2));
              c.caret.call(o2, v2, e3.shiftKey ? k.begin : x, x, true);
            } else g2 === s.keys.Home && !e3.shiftKey || g2 === s.keys.PageUp ? (e3.preventDefault(), c.caret.call(o2, v2, 0, e3.shiftKey ? k.begin : 0, true)) : p2.undoOnEscape && g2 === s.keys.Escape && true !== e3.altKey ? ((0, l.checkVal)(v2, true, false, o2.undoValue.split("")), m2.trigger("click")) : g2 !== s.keys.Insert || e3.shiftKey || e3.ctrlKey || void 0 !== o2.userOptions.insertMode ? true === p2.tabThrough && g2 === s.keys.Tab ? true === e3.shiftKey ? (k.end = c.seekPrevious.call(o2, k.end, true), true === f.getTest.call(o2, k.end - 1).match.static && k.end--, k.begin = c.seekPrevious.call(o2, k.end, true), k.begin >= 0 && k.end > 0 && (e3.preventDefault(), c.caret.call(o2, v2, k.begin, k.end))) : (k.begin = c.seekNext.call(o2, k.begin, true), k.end = c.seekNext.call(o2, k.begin, true), k.end < h2.maskLength && k.end--, k.begin <= h2.maskLength && (e3.preventDefault(), c.caret.call(o2, v2, k.begin, k.end))) : e3.shiftKey || (p2.insertModeVisual && false === p2.insertMode ? g2 === s.keys.ArrowRight ? setTimeout((function() {
              var e4 = c.caret.call(o2, v2);
              c.caret.call(o2, v2, e4.begin);
            }), 0) : g2 === s.keys.ArrowLeft && setTimeout((function() {
              var e4 = c.translatePosition.call(o2, v2.inputmask.caretPos.begin);
              c.translatePosition.call(o2, v2.inputmask.caretPos.end);
              o2.isRTL ? c.caret.call(o2, v2, e4 + (e4 === h2.maskLength ? 0 : 1)) : c.caret.call(o2, v2, e4 - (0 === e4 ? 0 : 1));
            }), 0) : void 0 === o2.keyEventHook || o2.keyEventHook(e3)) : u.isSelection.call(o2, k) ? p2.insertMode = !p2.insertMode : (p2.insertMode = !p2.insertMode, c.caret.call(o2, v2, k.begin, k.begin));
            return o2.isComposing = g2 == s.keys.Process || g2 == s.keys.Unidentified, o2.ignorable = g2.length > 1 && !("textarea" === v2.tagName.toLowerCase() && g2 == s.keys.Enter), y.keypressEvent.call(this, e3, t3, n3, i3, a2);
          }, keypressEvent: function(e3, t3, n3, i3, a2) {
            var r2 = this.inputmask || this, o2 = r2.opts, f2 = r2.dependencyLib, p2 = r2.maskset, d2 = r2.el, h2 = f2(d2), v2 = e3.key;
            if (true === t3 || e3.ctrlKey && e3.altKey && !r2.ignorable || !(e3.ctrlKey || e3.metaKey || r2.ignorable)) {
              if (v2) {
                var m2, g2 = t3 ? { begin: a2, end: a2 } : c.caret.call(r2, d2);
                t3 || (v2 = o2.substitutes[v2] || v2), p2.writeOutBuffer = true;
                var y2 = u.isValid.call(r2, g2, v2, i3, void 0, void 0, void 0, t3);
                if (false !== y2 && (c.resetMaskSet.call(r2, true), m2 = void 0 !== y2.caret ? y2.caret : c.seekNext.call(r2, y2.pos.begin ? y2.pos.begin : y2.pos), p2.p = m2), m2 = o2.numericInput && void 0 === y2.caret ? c.seekPrevious.call(r2, m2) : m2, false !== n3 && (setTimeout((function() {
                  o2.onKeyValidation.call(d2, v2, y2);
                }), 0), p2.writeOutBuffer && false !== y2)) {
                  var k = c.getBuffer.call(r2);
                  (0, l.writeBuffer)(d2, k, m2, e3, true !== t3);
                }
                if (e3.preventDefault(), t3) return false !== y2 && (y2.forwardPosition = m2), y2;
              }
            } else v2 === s.keys.Enter && r2.undoValue !== r2._valueGet(true) && (r2.undoValue = r2._valueGet(true), setTimeout((function() {
              h2.trigger("change");
            }), 0));
          }, pasteEvent: (m = p().mark((function e3(t3) {
            var n3, i3, a2, r2, s2, u2;
            return p().wrap((function(e4) {
              for (; ; ) switch (e4.prev = e4.next) {
                case 0:
                  n3 = function(e5, n4, i4, a3, o2) {
                    var s3 = c.caret.call(e5, n4, void 0, void 0, true), u3 = i4.substr(0, s3.begin), f2 = i4.substr(s3.end, i4.length);
                    if (u3 == (e5.isRTL ? c.getBufferTemplate.call(e5)