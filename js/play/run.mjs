var e = {
    preferredElementNodeName: "PRE",
    render: function(e, s) {
        const i = e.settings.element;
        e.rows == n && e.cols == o || (o = e.cols, n = e.rows, t.length = 0);
        for (; i.childElementCount < n;) {
            const e = document.createElement("span");
            e.style.display = "block", i.appendChild(e)
        }
        for (; i.childElementCount > n;) i.removeChild(i.lastChild);
        for (let c = 0; c < n; c++) {
            const n = c * o;
            let a = !1;
            for (let e = 0; e < o; e++) {
                const o = e + n,
                    l = s[o],
                    i = t[o];
                r(l, i) || (a = !0, t[o] = {
                    ...l
                })
            }
            if (0 == a) continue;
            let d = "",
                f = {},
                h = !1;
            for (let t = 0; t < o; t++) {
                const o = s[t + n];
                if (o.beginHTML && (h && (d += "</span>", f = {}, h = !1), d += o.beginHTML), !l(o, f)) {
                    h && (d += "</span>");
                    const t = o.color === e.settings.color ? null : o.color,
                        n = o.backgroundColor === e.settings.backgroundColor ? null : o.backgroundColor,
                        r = o.fontWeight === e.settings.fontWeight ? null : o.fontWeight;
                    let l = "";
                    t && (l += "color:" + t + ";"), n && (l += "background:" + n + ";"), r && (l += "font-weight:" + r + ";"), l && (l = ' style="' + l + '"'), d += "<span" + l + ">", h = !0
                }
                d += o.char, f = o, o.endHTML && (h && (d += "</span>", f = {}, h = !1), d += o.endHTML)
            }
            h && (d += "</span>"), i.childNodes[c].innerHTML = d
        }
    }
};
const t = [];
let o, n;

function r(e, t) {
    return "object" == typeof e && ("object" == typeof t && (e.char === t.char && (e.fontWeight === t.fontWeight && (e.color === t.color && e.backgroundColor === t.backgroundColor))))
}

function l(e, t) {
    return e.fontWeight === t.fontWeight && (e.color === t.color && e.backgroundColor === t.backgroundColor)
}
var s = {
    preferredElementNodeName: "CANVAS",
    render: function(e, t) {
        const o = e.settings.element,
            n = devicePixelRatio,
            r = e.cols,
            l = e.rows,
            s = e.metrics,
            i = s.cellWidth,
            c = Math.round(s.lineHeight),
            a = e.settings;
        a.canvasSize ? (o.width = a.canvasSize.width * n, o.height = a.canvasSize.height * n, o.style.width = a.canvasSize.width + "px", o.style.height = a.canvasSize.height + "px") : (o.width = e.width * n, o.height = e.height * n);
        const d = " " + s.fontSize + "px " + s.fontFamily,
            f = a && a.backgroundColor ? a.backgroundColor : "white",
            h = a && a.color ? a.color : "black",
            u = a && a.fontWeight ? a.color : "400",
            p = o.getContext("2d");
        if (p.fillStyle = f, p.fillRect(0, 0, o.width, o.height), p.save(), p.scale(n, n), p.fillStyle = h, p.textBaseline = "top", a.canvasOffset) {
            const e = a.canvasOffset,
                t = Math.round("auto" == e.x ? (o.width / n - r * i) / 2 : e.x),
                s = Math.round("auto" == e.y ? (o.height / n - l * c) / 2 : e.y);
            p.translate(t, s)
        }
        if ("center" == a.textAlign)
            for (let e = 0; e < l; e++) {
                const l = e * r,
                    s = [];
                let i = 0;
                for (let e = 0; e < r; e++) {
                    const o = t[l + e];
                    p.font = (o.fontWeight || u) + d;
                    const n = p.measureText(o.char).width;
                    i += n, s[e] = n
                }
                let a = .5 * (o.width / n - i);
                const g = e * c;
                for (let e = 0; e < r; e++) {
                    const o = t[l + e],
                        n = a;
                    o.backgroundColor && o.backgroundColor != f && (p.fillStyle = o.backgroundColor || f, p.fillRect(Math.round(n), g, Math.ceil(s[e]), c)), p.font = (o.fontWeight || u) + d, p.fillStyle = o.color || h, p.fillText(o.char, a, g), a += s[e]
                }
            } else
                for (let e = 0; e < l; e++)
                    for (let o = 0; o < r; o++) {
                        const n = t[e * r + o],
                            l = o * i,
                            s = e * c;
                        n.backgroundColor && n.backgroundColor != f && (p.fillStyle = n.backgroundColor || f, p.fillRect(Math.round(l), s, Math.ceil(i), c)), p.font = (n.fontWeight || u) + d, p.fillStyle = n.color || h, p.fillText(n.char, l, s)
                    }
        p.restore()
    }
};
class i {
    constructor() {
        this.frames = 0, this.ptime = 0, this.fps = 0
    }
    update(e) {
        return this.frames++, e >= this.ptime + 1e3 && (this.fps = 1e3 * this.frames / (e - this.ptime), this.ptime = e, this.frames = 0), this.fps
    }
}
var c = function(e, t) {
        try {
            return localStorage.setItem(e, JSON.stringify(t)), !0
        } catch (e) {
            return !1
        }
    },
    a = function(e, t = {}) {
        const o = JSON.parse(localStorage.getItem(e));
        return Object.assign(t, o), t
    },
    d = "1.1";
const f = {
        canvas: s,
        text: e
    },
    h = {
        element: null,
        cols: 0,
        rows: 0,
        once: !1,
        fps: 30,
        renderer: "text",
        allowSelect: !1,
        restoreState: !1
    },
    u = ["backgroundColor", "color", "fontFamily", "fontSize", "fontWeight", "letterSpacing", "lineHeight", "textAlign"];

function p(e, t, o = {}) {
    return new Promise((function(n) {
        const r = {
                ...h,
                ...t,
                ...e.settings
            },
            l = {
                time: 0,
                frame: 0,
                cycle: 0
            },
            s = "currentState";
        let d;
        r.restoreState && (a(s, l), l.cycle++), r.element ? "canvas" == r.renderer ? "CANVAS" == r.element.nodeName ? d = f[r.renderer] : console.warn("This renderer expects a canvas target element.") : "CANVAS" != r.element.nodeName ? d = f[r.renderer] : console.warn("This renderer expects a text target element.") : (d = f[r.renderer] || f.text, r.element = document.createElement(d.preferredElementNodeName), document.body.appendChild(r.element));
        for (const e of u) r[e] && (r.element.style[e] = r[e]);
        const p = [],
            m = {
                x: 0,
                y: 0,
                pressed: !1,
                px: 0,
                py: 0,
                ppressed: !1
            };
        r.element.addEventListener("pointermove", (e => {
            const t = r.element.getBoundingClientRect();
            m.x = e.clientX - t.left, m.y = e.clientY - t.top, p.push("pointerMove")
        })), r.element.addEventListener("pointerdown", (e => {
            m.pressed = !0, p.push("pointerDown")
        })), r.element.addEventListener("pointerup", (e => {
            m.pressed = !1, p.push("pointerUp")
        })), r.element.style.fontStrech = "normal", r.allowSelect || y(r.element), document.fonts.ready.then((t => {
            let n = 3;
            ! function t() {
                --n > 0 ? requestAnimationFrame(t) : function() {
                    x = b(r.element);
                    const t = g(l, r, x, w);
                    "function" == typeof e.boot && e.boot(t, C, o);
                    requestAnimationFrame(M)
                }()
            }()
        }));
        const w = new i,
            S = Object.freeze({
                color: r.color,
                backgroundColor: r.backgroundColor,
                fontWeight: r.fontWeight
            }),
            C = [];
        let x;
        let v = 0;
        const k = 1e3 / r.fps,
            N = l.time;
        let E, W;

        function M(t) {
            const i = t - v;
            if (i < k) return void(r.once || requestAnimationFrame(M));
            const a = g(l, r, x, w);
            w.update(t), v = t - i % k, l.time = t + N, l.frame++, c(s, l);
            const f = {
                x: Math.min(a.cols - 1, m.x / x.cellWidth),
                y: Math.min(a.rows - 1, m.y / x.lineHeight),
                pressed: m.pressed,
                p: {
                    x: m.px / x.cellWidth,
                    y: m.py / x.lineHeight,
                    pressed: m.ppressed
                }
            };
            if (m.px = m.x, m.py = m.y, m.ppressed = m.pressed, E != a.cols || W != a.rows) {
                E = a.cols, W = a.rows, C.length = a.cols * a.rows;
                for (let e = 0; e < C.length; e++) C[e] = {
                    ...S,
                    char: " "
                }
            }
            if ("function" == typeof e.pre && e.pre(a, f, C, o), "function" == typeof e.main)
                for (let t = 0; t < a.rows; t++) {
                    const n = t * a.cols;
                    for (let r = 0; r < a.cols; r++) {
                        const l = r + n,
                            s = e.main({
                                x: r,
                                y: t,
                                index: l
                            }, a, f, C, o);
                        C[l] = "object" == typeof s && null !== s ? {
                            ...C[l],
                            ...s
                        } : {
                            ...C[l],
                            char: s
                        }, Boolean(C[l].char) || 0 === C[l].char || (C[l].char = " ")
                    }
                }
            for ("function" == typeof e.post && e.post(a, f, C, o), d.render(a, C, r); p.length > 0;) {
                const t = p.shift();
                t && "function" == typeof e[t] && e[t](a, f, C)
            }
            r.once || requestAnimationFrame(M), n(a)
        }
    }))
}

function g(e, t, o, n) {
    const r = t.element.getBoundingClientRect(),
        l = t.cols || Math.floor(r.width / o.cellWidth),
        s = t.rows || Math.floor(r.height / o.lineHeight);
    return Object.freeze({
        frame: e.frame,
        time: e.time,
        cols: l,
        rows: s,
        metrics: o,
        width: r.width,
        height: r.height,
        settings: t,
        runtime: Object.freeze({
            cycle: e.cycle,
            fps: n.fps
        })
    })
}

function y(e) {
    e.style.userSelect = "none", e.style.webkitUserSelect = "none", e.style.mozUserSelect = "none", e.dataset.selectionEnabled = "false"
}

function w(e) {
    const t = "false" == !e.dataset.selectionEnabled;
    t || function(e) {
        e.style.userSelect = "auto", e.style.webkitUserSelect = "auto", e.style.mozUserSelect = "auto", e.dataset.selectionEnabled = "true"
    }(e);
    const o = document.createRange();
    o.selectNode(e);
    const n = window.getSelection();
    n.removeAllRanges(), n.addRange(o), document.execCommand("copy"), n.removeAllRanges(), t || y(e)
}

function b(e) {
    const t = getComputedStyle(e),
        o = t.getPropertyValue("font-family"),
        n = parseFloat(t.getPropertyValue("font-size")),
        r = parseFloat(t.getPropertyValue("line-height"));
    let l;
    if ("CANVAS" == e.nodeName) {
        const t = e.getContext("2d");
        t.font = n + "px " + o, l = t.measureText("".padEnd(50, "X")).width / 50
    } else {
        const t = document.createElement("span");
        e.appendChild(t), t.innerHTML = "".padEnd(50, "X"), l = t.getBoundingClientRect().width / 50, e.removeChild(t)
    }
    return {
        aspect: l / r,
        cellWidth: l,
        lineHeight: r,
        fontFamily: o,
        fontSize: n,
        _update: function() {
            const t = b(e);
            for (var o in t) "number" != typeof t[o] && "string" != typeof t[o] || (m[o] = t[o])
        }
    }
}
export {
    d as RUNNER_VERSION, b as calcMetrics, w as copyContent, p as run
};
