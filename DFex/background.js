test = true

function loadConfig() {
    console.log(localStorage)
    window.danmuRate = Number(localStorage['danmuRate']);
    window.getNicoDanmu = localStorage['getNicoDanmu'];
    if (localStorage['dbindCid'] !== '{}') {
        window.dbindCid = JSON.parse(localStorage['dbindCid'])
    } else {
        window.dbindCid = {
            43955542: "E:\\data\\bilibiliLib\\archiveLib\\有顶天家族\\av637987 【7月】有顶天家族 01",
            43955588: "E:\\data\\bilibiliLib\\archiveLib\\有顶天家族\\av649592 【7月】有顶天家族 02",
            43955629: "E:\\data\\bilibiliLib\\archiveLib\\有顶天家族\\av661723 【7月】有顶天家族 03",
            43955665: "E:\\data\\bilibiliLib\\archiveLib\\有顶天家族\\av674698 【7月】有顶天家族 04",
            43955713: "E:\\data\\bilibiliLib\\archiveLib\\有顶天家族\\av688716 【7月】有顶天家族 05",
            43955735: "E:\\data\\bilibiliLib\\archiveLib\\有顶天家族\\av702809 【7月】有顶天家族 06",
            43955747: "E:\\data\\bilibiliLib\\archiveLib\\有顶天家族\\av717380 【7月】有顶天家族 07",
            43955771: "E:\\data\\bilibiliLib\\archiveLib\\有顶天家族\\av731634 【7月】有顶天家族 08",
            43955793: "E:\\data\\bilibiliLib\\archiveLib\\有顶天家族\\av743836 【7月】有顶天家族 09",
            43955844: "E:\\data\\bilibiliLib\\archiveLib\\有顶天家族\\av752788 【7月】有顶天家族 10",
            43955860: "E:\\data\\bilibiliLib\\archiveLib\\有顶天家族\\av760866 【7月】有顶天家族 11",
            43955872: "E:\\data\\bilibiliLib\\archiveLib\\有顶天家族\\av769112 【7月】有顶天家族 12",
            43955889: "E:\\data\\bilibiliLib\\archiveLib\\有顶天家族\\av776390 【7月】有顶天家族 13【完结】"
        }
        console.log(window.dbindCid)
    }
    window.lastcid = 0;
    window.ldldanmu = [];

    // window.filterRule = JSON.parse(localStorage['filterRule'])
}

function saveConfig() {
    localStorage['danmuRate'] = Number(window.danmuRate);
    localStorage['getNicoDanmu'] = window.getNicoDanmu;

    localStorage['filterRule'] = JSON.stringify(window.filterRule);
    localStorage['dbindCid'] = JSON.stringify(window.dbindCid);
}

function getdate(date) {
    month = Number(date.getMonth()) + 1;
    if (month < 10) {
        month = '0' + month.toString()
    } else {
        month = month.toString()
    }
    if (Number(date.getDate()) < 10) {
        sdate = '0' + date.getDate()
    } else {
        sdate = date.getDate()
    }
    return [date.getFullYear(), month, sdate].join('-')
}

chrome.runtime.onInstalled.addListener(function (details) {
    localStorage['danmuRate'] = '4'
    localStorage['getNicoDanmu'] = '1'
    localStorage['dbindCid'] = '{}'
},);

loadConfig();

var TRAD_DANMU_URL_RE = /(.+):\/\/comment\.bilibili\.com\/(?:rc\/)?(?:dmroll,[\d\-]+,)?(\d+)(?:\.xml)?(\?debug)?$/;
var NEW_DANMU_NORMAL_URL_RE = /(.+):\/\/api\.bilibili\.com\/x\/v1\/dm\/list\.so\?oid=(\d+)(\&debug)?$/;
var PROTO_DANMU_SEG_URL_RE = /(.+):\/\/api\.bilibili\.com\/x\/v2\/dm\/web\/seg\.so\?.*?oid=(\d+).*?(\&debug)?$/;
var NEW_DANMU_HISTORY_URL_RE = /(.+):\/\/api\.bilibili\.com\/x\/v2\/dm\/history\?type=\d+&oid=(\d+)&date=[\d\-]+(\&debug)?$/;
var DANMU_URL_FILTER = ['*://comment.bilibili.com/*', '*://api.bilibili.com/x/v1/dm/*', '*://api.bilibili.com/x/v2/dm/*']

!function (b) {
    "use strict";
    var r, u, t, n;
    r = {
        1: [function (t, n) {
            n.exports = function (t, n) {
                var i = Array(arguments.length - 1), e = 0, r = 2, s = !0;
                for (; r < arguments.length;) i[e++] = arguments[r++];
                return new Promise(function (r, u) {
                    i[e] = function (t) {
                        if (s) if (s = !1, t) u(t); else {
                            for (var n = Array(arguments.length - 1), i = 0; i < n.length;) n[i++] = arguments[i];
                            r.apply(null, n)
                        }
                    };
                    try {
                        t.apply(n || null, i)
                    } catch (t) {
                        s && (s = !1, u(t))
                    }
                })
            }
        }, {}], 2: [function (t, n, i) {
            var r = i;
            r.length = function (t) {
                var n = t.length;
                if (!n) return 0;
                for (var i = 0; 1 < --n % 4 && "=" === t.charAt(n);) ++i;
                return Math.ceil(3 * t.length) / 4 - i
            };
            for (var o = Array(64), f = Array(123), u = 0; u < 64;) f[o[u] = u < 26 ? u + 65 : u < 52 ? u + 71 : u < 62 ? u - 4 : u - 59 | 43] = u++;
            r.encode = function (t, n, i) {
                for (var r, u = null, e = [], s = 0, h = 0; n < i;) {
                    var f = t[n++];
                    switch (h) {
                        case 0:
                            e[s++] = o[f >> 2], r = (3 & f) << 4, h = 1;
                            break;
                        case 1:
                            e[s++] = o[r | f >> 4], r = (15 & f) << 2, h = 2;
                            break;
                        case 2:
                            e[s++] = o[r | f >> 6], e[s++] = o[63 & f], h = 0
                    }
                    8191 < s && ((u || (u = [])).push(String.fromCharCode.apply(String, e)), s = 0)
                }
                return h && (e[s++] = o[r], e[s++] = 61, 1 === h && (e[s++] = 61)), u ? (s && u.push(String.fromCharCode.apply(String, e.slice(0, s))), u.join("")) : String.fromCharCode.apply(String, e.slice(0, s))
            };
            var c = "invalid encoding";
            r.decode = function (t, n, i) {
                for (var r, u = i, e = 0, s = 0; s < t.length;) {
                    var h = t.charCodeAt(s++);
                    if (61 === h && 1 < e) break;
                    if ((h = f[h]) === b) throw Error(c);
                    switch (e) {
                        case 0:
                            r = h, e = 1;
                            break;
                        case 1:
                            n[i++] = r << 2 | (48 & h) >> 4, r = h, e = 2;
                            break;
                        case 2:
                            n[i++] = (15 & r) << 4 | (60 & h) >> 2, r = h, e = 3;
                            break;
                        case 3:
                            n[i++] = (3 & r) << 6 | h, e = 0
                    }
                }
                if (1 === e) throw Error(c);
                return i - u
            }, r.test = function (t) {
                return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(t)
            }
        }, {}], 3: [function (t, n) {
            function i() {
                this.t = {}
            }

            (n.exports = i).prototype.on = function (t, n, i) {
                return (this.t[t] || (this.t[t] = [])).push({fn: n, ctx: i || this}), this
            }, i.prototype.off = function (t, n) {
                if (t === b) this.t = {}; else if (n === b) this.t[t] = []; else for (var i = this.t[t], r = 0; r < i.length;) i[r].fn === n ? i.splice(r, 1) : ++r;
                return this
            }, i.prototype.emit = function (t) {
                var n = this.t[t];
                if (n) {
                    for (var i = [], r = 1; r < arguments.length;) i.push(arguments[r++]);
                    for (r = 0; r < n.length;) n[r].fn.apply(n[r++].ctx, i)
                }
                return this
            }
        }, {}], 4: [function (t, n) {
            function i(h) {
                return "undefined" != typeof Float32Array ? function () {
                    var r = new Float32Array([-0]), u = new Uint8Array(r.buffer), t = 128 === u[3];

                    function n(t, n, i) {
                        r[0] = t, n[i] = u[0], n[i + 1] = u[1], n[i + 2] = u[2], n[i + 3] = u[3]
                    }

                    function i(t, n, i) {
                        r[0] = t, n[i] = u[3], n[i + 1] = u[2], n[i + 2] = u[1], n[i + 3] = u[0]
                    }

                    function e(t, n) {
                        return u[0] = t[n], u[1] = t[n + 1], u[2] = t[n + 2], u[3] = t[n + 3], r[0]
                    }

                    function s(t, n) {
                        return u[3] = t[n], u[2] = t[n + 1], u[1] = t[n + 2], u[0] = t[n + 3], r[0]
                    }

                    h.writeFloatLE = t ? n : i, h.writeFloatBE = t ? i : n, h.readFloatLE = t ? e : s, h.readFloatBE = t ? s : e
                }() : function () {
                    function t(t, n, i, r) {
                        var u = n < 0 ? 1 : 0;
                        if (u && (n = -n), 0 === n) t(0 < 1 / n ? 0 : 2147483648, i, r); else if (isNaN(n)) t(2143289344, i, r); else if (3.4028234663852886e38 < n) t((u << 31 | 2139095040) >>> 0, i, r); else if (n < 1.1754943508222875e-38) t((u << 31 | Math.round(n / 1.401298464324817e-45)) >>> 0, i, r); else {
                            var e = Math.floor(Math.log(n) / Math.LN2);
                            t((u << 31 | e + 127 << 23 | 8388607 & Math.round(n * Math.pow(2, -e) * 8388608)) >>> 0, i, r)
                        }
                    }

                    function n(t, n, i) {
                        var r = t(n, i), u = 2 * (r >> 31) + 1, e = r >>> 23 & 255, s = 8388607 & r;
                        return 255 === e ? s ? NaN : u * (1 / 0) : 0 === e ? 1.401298464324817e-45 * u * s : u * Math.pow(2, e - 150) * (s + 8388608)
                    }

                    h.writeFloatLE = t.bind(null, r), h.writeFloatBE = t.bind(null, u), h.readFloatLE = n.bind(null, e), h.readFloatBE = n.bind(null, s)
                }(), "undefined" != typeof Float64Array ? function () {
                    var r = new Float64Array([-0]), u = new Uint8Array(r.buffer), t = 128 === u[7];

                    function n(t, n, i) {
                        r[0] = t, n[i] = u[0], n[i + 1] = u[1], n[i + 2] = u[2], n[i + 3] = u[3], n[i + 4] = u[4], n[i + 5] = u[5], n[i + 6] = u[6], n[i + 7] = u[7]
                    }

                    function i(t, n, i) {
                        r[0] = t, n[i] = u[7], n[i + 1] = u[6], n[i + 2] = u[5], n[i + 3] = u[4], n[i + 4] = u[3], n[i + 5] = u[2], n[i + 6] = u[1], n[i + 7] = u[0]
                    }

                    function e(t, n) {
                        return u[0] = t[n], u[1] = t[n + 1], u[2] = t[n + 2], u[3] = t[n + 3], u[4] = t[n + 4], u[5] = t[n + 5], u[6] = t[n + 6], u[7] = t[n + 7], r[0]
                    }

                    function s(t, n) {
                        return u[7] = t[n], u[6] = t[n + 1], u[5] = t[n + 2], u[4] = t[n + 3], u[3] = t[n + 4], u[2] = t[n + 5], u[1] = t[n + 6], u[0] = t[n + 7], r[0]
                    }

                    h.writeDoubleLE = t ? n : i, h.writeDoubleBE = t ? i : n, h.readDoubleLE = t ? e : s, h.readDoubleBE = t ? s : e
                }() : function () {
                    function t(t, n, i, r, u, e) {
                        var s = r < 0 ? 1 : 0;
                        if (s && (r = -r), 0 === r) t(0, u, e + n), t(0 < 1 / r ? 0 : 2147483648, u, e + i); else if (isNaN(r)) t(0, u, e + n), t(2146959360, u, e + i); else if (1.7976931348623157e308 < r) t(0, u, e + n), t((s << 31 | 2146435072) >>> 0, u, e + i); else {
                            var h;
                            if (r < 2.2250738585072014e-308) t((h = r / 5e-324) >>> 0, u, e + n), t((s << 31 | h / 4294967296) >>> 0, u, e + i); else {
                                var f = Math.floor(Math.log(r) / Math.LN2);
                                1024 === f && (f = 1023), t(4503599627370496 * (h = r * Math.pow(2, -f)) >>> 0, u, e + n), t((s << 31 | f + 1023 << 20 | 1048576 * h & 1048575) >>> 0, u, e + i)
                            }
                        }
                    }

                    function n(t, n, i, r, u) {
                        var e = t(r, u + n), s = t(r, u + i), h = 2 * (s >> 31) + 1, f = s >>> 20 & 2047,
                            o = 4294967296 * (1048575 & s) + e;
                        return 2047 === f ? o ? NaN : h * (1 / 0) : 0 === f ? 5e-324 * h * o : h * Math.pow(2, f - 1075) * (o + 4503599627370496)
                    }

                    h.writeDoubleLE = t.bind(null, r, 0, 4), h.writeDoubleBE = t.bind(null, u, 4, 0), h.readDoubleLE = n.bind(null, e, 0, 4), h.readDoubleBE = n.bind(null, s, 4, 0)
                }(), h
            }

            function r(t, n, i) {
                n[i] = 255 & t, n[i + 1] = t >>> 8 & 255, n[i + 2] = t >>> 16 & 255, n[i + 3] = t >>> 24
            }

            function u(t, n, i) {
                n[i] = t >>> 24, n[i + 1] = t >>> 16 & 255, n[i + 2] = t >>> 8 & 255, n[i + 3] = 255 & t
            }

            function e(t, n) {
                return (t[n] | t[n + 1] << 8 | t[n + 2] << 16 | t[n + 3] << 24) >>> 0
            }

            function s(t, n) {
                return (t[n] << 24 | t[n + 1] << 16 | t[n + 2] << 8 | t[n + 3]) >>> 0
            }

            n.exports = i(i)
        }, {}], 5: [function (t, n, i) {
            function r(t) {
                try {
                    var n = eval("require")(t);
                    if (n && (n.length || Object.keys(n).length)) return n
                } catch (t) {
                }
                return null
            }

            n.exports = r
        }, {}], 6: [function (t, n) {
            n.exports = function (i, r, t) {
                var u = t || 8192, e = u >>> 1, s = null, h = u;
                return function (t) {
                    if (t < 1 || e < t) return i(t);
                    u < h + t && (s = i(u), h = 0);
                    var n = r.call(s, h, h += t);
                    return 7 & h && (h = 1 + (7 | h)), n
                }
            }
        }, {}], 7: [function (t, n, i) {
            var r = i;
            r.length = function (t) {
                for (var n = 0, i = 0, r = 0; r < t.length; ++r) (i = t.charCodeAt(r)) < 128 ? n += 1 : i < 2048 ? n += 2 : 55296 == (64512 & i) && 56320 == (64512 & t.charCodeAt(r + 1)) ? (++r, n += 4) : n += 3;
                return n
            }, r.read = function (t, n, i) {
                if (i - n < 1) return "";
                for (var r, u = null, e = [], s = 0; n < i;) (r = t[n++]) < 128 ? e[s++] = r : 191 < r && r < 224 ? e[s++] = (31 & r) << 6 | 63 & t[n++] : 239 < r && r < 365 ? (r = ((7 & r) << 18 | (63 & t[n++]) << 12 | (63 & t[n++]) << 6 | 63 & t[n++]) - 65536, e[s++] = 55296 + (r >> 10), e[s++] = 56320 + (1023 & r)) : e[s++] = (15 & r) << 12 | (63 & t[n++]) << 6 | 63 & t[n++], 8191 < s && ((u || (u = [])).push(String.fromCharCode.apply(String, e)), s = 0);
                return u ? (s && u.push(String.fromCharCode.apply(String, e.slice(0, s))), u.join("")) : String.fromCharCode.apply(String, e.slice(0, s))
            }, r.write = function (t, n, i) {
                for (var r, u, e = i, s = 0; s < t.length; ++s) (r = t.charCodeAt(s)) < 128 ? n[i++] = r : (r < 2048 ? n[i++] = r >> 6 | 192 : (55296 == (64512 & r) && 56320 == (64512 & (u = t.charCodeAt(s + 1))) ? (r = 65536 + ((1023 & r) << 10) + (1023 & u), ++s, n[i++] = r >> 18 | 240, n[i++] = r >> 12 & 63 | 128) : n[i++] = r >> 12 | 224, n[i++] = r >> 6 & 63 | 128), n[i++] = 63 & r | 128);
                return i - e
            }
        }, {}], 8: [function (t, n, i) {
            var r = i;

            function u() {
                r.Reader.n(r.BufferReader), r.util.n()
            }

            r.build = "minimal", r.Writer = t(16), r.BufferWriter = t(17), r.Reader = t(9), r.BufferReader = t(10), r.util = t(15), r.rpc = t(12), r.roots = t(11), r.configure = u, r.Writer.n(r.BufferWriter), u()
        }, {10: 10, 11: 11, 12: 12, 15: 15, 16: 16, 17: 17, 9: 9}], 9: [function (t, n) {
            n.exports = h;
            var i, r = t(15), u = r.LongBits, e = r.utf8;

            function s(t, n) {
                return RangeError("index out of range: " + t.pos + " + " + (n || 1) + " > " + t.len)
            }

            function h(t) {
                this.buf = t, this.pos = 0, this.len = t.length
            }

            var f, o = "undefined" != typeof Uint8Array ? function (t) {
                if (t instanceof Uint8Array || Array.isArray(t)) return new h(t);
                throw Error("illegal buffer")
            } : function (t) {
                if (Array.isArray(t)) return new h(t);
                throw Error("illegal buffer")
            };

            function c() {
                var t = new u(0, 0), n = 0;
                if (!(4 < this.len - this.pos)) {
                    for (; n < 3; ++n) {
                        if (this.pos >= this.len) throw s(this);
                        if (t.lo = (t.lo | (127 & this.buf[this.pos]) << 7 * n) >>> 0, this.buf[this.pos++] < 128) return t
                    }
                    return t.lo = (t.lo | (127 & this.buf[this.pos++]) << 7 * n) >>> 0, t
                }
                for (; n < 4; ++n) if (t.lo = (t.lo | (127 & this.buf[this.pos]) << 7 * n) >>> 0, this.buf[this.pos++] < 128) return t;
                if (t.lo = (t.lo | (127 & this.buf[this.pos]) << 28) >>> 0, t.hi = (t.hi | (127 & this.buf[this.pos]) >> 4) >>> 0, this.buf[this.pos++] < 128) return t;
                if (n = 0, 4 < this.len - this.pos) {
                    for (; n < 5; ++n) if (t.hi = (t.hi | (127 & this.buf[this.pos]) << 7 * n + 3) >>> 0, this.buf[this.pos++] < 128) return t
                } else for (; n < 5; ++n) {
                    if (this.pos >= this.len) throw s(this);
                    if (t.hi = (t.hi | (127 & this.buf[this.pos]) << 7 * n + 3) >>> 0, this.buf[this.pos++] < 128) return t
                }
                throw Error("invalid varint encoding")
            }

            function a(t, n) {
                return (t[n - 4] | t[n - 3] << 8 | t[n - 2] << 16 | t[n - 1] << 24) >>> 0
            }

            function l() {
                if (this.pos + 8 > this.len) throw s(this, 8);
                return new u(a(this.buf, this.pos += 4), a(this.buf, this.pos += 4))
            }

            h.create = r.Buffer ? function (t) {
                return (h.create = function (t) {
                    return r.Buffer.isBuffer(t) ? new i(t) : o(t)
                })(t)
            } : o, h.prototype.i = r.Array.prototype.subarray || r.Array.prototype.slice, h.prototype.uint32 = (f = 4294967295, function () {
                if (f = (127 & this.buf[this.pos]) >>> 0, this.buf[this.pos++] < 128) return f;
                if (f = (f | (127 & this.buf[this.pos]) << 7) >>> 0, this.buf[this.pos++] < 128) return f;
                if (f = (f | (127 & this.buf[this.pos]) << 14) >>> 0, this.buf[this.pos++] < 128) return f;
                if (f = (f | (127 & this.buf[this.pos]) << 21) >>> 0, this.buf[this.pos++] < 128) return f;
                if (f = (f | (15 & this.buf[this.pos]) << 28) >>> 0, this.buf[this.pos++] < 128) return f;
                if ((this.pos += 5) > this.len) throw this.pos = this.len, s(this, 10);
                return f
            }), h.prototype.int32 = function () {
                return 0 | this.uint32()
            }, h.prototype.sint32 = function () {
                var t = this.uint32();
                return t >>> 1 ^ -(1 & t) | 0
            }, h.prototype.bool = function () {
                return 0 !== this.uint32()
            }, h.prototype.fixed32 = function () {
                if (this.pos + 4 > this.len) throw s(this, 4);
                return a(this.buf, this.pos += 4)
            }, h.prototype.sfixed32 = function () {
                if (this.pos + 4 > this.len) throw s(this, 4);
                return 0 | a(this.buf, this.pos += 4)
            }, h.prototype.float = function () {
                if (this.pos + 4 > this.len) throw s(this, 4);
                var t = r.float.readFloatLE(this.buf, this.pos);
                return this.pos += 4, t
            }, h.prototype.double = function () {
                if (this.pos + 8 > this.len) throw s(this, 4);
                var t = r.float.readDoubleLE(this.buf, this.pos);
                return this.pos += 8, t
            }, h.prototype.bytes = function () {
                var t = this.uint32(), n = this.pos, i = this.pos + t;
                if (i > this.len) throw s(this, t);
                return this.pos += t, Array.isArray(this.buf) ? this.buf.slice(n, i) : n === i ? new this.buf.constructor(0) : this.i.call(this.buf, n, i)
            }, h.prototype.string = function () {
                var t = this.bytes();
                return e.read(t, 0, t.length)
            }, h.prototype.skip = function (t) {
                if ("number" == typeof t) {
                    if (this.pos + t > this.len) throw s(this, t);
                    this.pos += t
                } else do {
                    if (this.pos >= this.len) throw s(this)
                } while (128 & this.buf[this.pos++]);
                return this
            }, h.prototype.skipType = function (t) {
                switch (t) {
                    case 0:
                        this.skip();
                        break;
                    case 1:
                        this.skip(8);
                        break;
                    case 2:
                        this.skip(this.uint32());
                        break;
                    case 3:
                        for (; 4 != (t = 7 & this.uint32());) this.skipType(t);
                        break;
                    case 5:
                        this.skip(4);
                        break;
                    default:
                        throw Error("invalid wire type " + t + " at offset " + this.pos)
                }
                return this
            }, h.n = function (t) {
                i = t;
                var n = r.Long ? "toLong" : "toNumber";
                r.merge(h.prototype, {
                    int64: function () {
                        return c.call(this)[n](!1)
                    }, uint64: function () {
                        return c.call(this)[n](!0)
                    }, sint64: function () {
                        return c.call(this).zzDecode()[n](!1)
                    }, fixed64: function () {
                        return l.call(this)[n](!0)
                    }, sfixed64: function () {
                        return l.call(this)[n](!1)
                    }
                })
            }
        }, {15: 15}], 10: [function (t, n) {
            n.exports = u;
            var i = t(9);
            (u.prototype = Object.create(i.prototype)).constructor = u;
            var r = t(15);

            function u(t) {
                i.call(this, t)
            }

            r.Buffer && (u.prototype.i = r.Buffer.prototype.slice), u.prototype.string = function () {
                var t = this.uint32();
                return this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + t, this.len))
            }
        }, {15: 15, 9: 9}], 11: [function (t, n) {
            n.exports = {}
        }, {}], 12: [function (t, n, i) {
            i.Service = t(13)
        }, {13: 13}], 13: [function (t, n) {
            n.exports = i;
            var h = t(15);

            function i(t, n, i) {
                if ("function" != typeof t) throw TypeError("rpcImpl must be a function");
                h.EventEmitter.call(this), this.rpcImpl = t, this.requestDelimited = !!n, this.responseDelimited = !!i
            }

            ((i.prototype = Object.create(h.EventEmitter.prototype)).constructor = i).prototype.rpcCall = function t(i, n, r, u, e) {
                if (!u) throw TypeError("request must be specified");
                var s = this;
                if (!e) return h.asPromise(t, s, i, n, r, u);
                if (!s.rpcImpl) return setTimeout(function () {
                    e(Error("already ended"))
                }, 0), b;
                try {
                    return s.rpcImpl(i, n[s.requestDelimited ? "encodeDelimited" : "encode"](u).finish(), function (t, n) {
                        if (t) return s.emit("error", t, i), e(t);
                        if (null === n) return s.end(!0), b;
                        if (!(n instanceof r)) try {
                            n = r[s.responseDelimited ? "decodeDelimited" : "decode"](n)
                        } catch (t) {
                            return s.emit("error", t, i), e(t)
                        }
                        return s.emit("data", n, i), e(null, n)
                    })
                } catch (t) {
                    return s.emit("error", t, i), setTimeout(function () {
                        e(t)
                    }, 0), b
                }
            }, i.prototype.end = function (t) {
                return this.rpcImpl && (t || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this
            }
        }, {15: 15}], 14: [function (t, n) {
            n.exports = u;
            var i = t(15);

            function u(t, n) {
                this.lo = t >>> 0, this.hi = n >>> 0
            }

            var e = u.zero = new u(0, 0);
            e.toNumber = function () {
                return 0
            }, e.zzEncode = e.zzDecode = function () {
                return this
            }, e.length = function () {
                return 1
            };
            var r = u.zeroHash = "\0\0\0\0\0\0\0\0";
            u.fromNumber = function (t) {
                if (0 === t) return e;
                var n = t < 0;
                n && (t = -t);
                var i = t >>> 0, r = (t - i) / 4294967296 >>> 0;
                return n && (r = ~r >>> 0, i = ~i >>> 0, 4294967295 < ++i && (i = 0, 4294967295 < ++r && (r = 0))), new u(i, r)
            }, u.from = function (t) {
                if ("number" == typeof t) return u.fromNumber(t);
                if (i.isString(t)) {
                    if (!i.Long) return u.fromNumber(parseInt(t, 10));
                    t = i.Long.fromString(t)
                }
                return t.low || t.high ? new u(t.low >>> 0, t.high >>> 0) : e
            }, u.prototype.toNumber = function (t) {
                if (!t && this.hi >>> 31) {
                    var n = 1 + ~this.lo >>> 0, i = ~this.hi >>> 0;
                    return n || (i = i + 1 >>> 0), -(n + 4294967296 * i)
                }
                return this.lo + 4294967296 * this.hi
            }, u.prototype.toLong = function (t) {
                return i.Long ? new i.Long(0 | this.lo, 0 | this.hi, !!t) : {
                    low: 0 | this.lo,
                    high: 0 | this.hi,
                    unsigned: !!t
                }
            };
            var s = String.prototype.charCodeAt;
            u.fromHash = function (t) {
                return t === r ? e : new u((s.call(t, 0) | s.call(t, 1) << 8 | s.call(t, 2) << 16 | s.call(t, 3) << 24) >>> 0, (s.call(t, 4) | s.call(t, 5) << 8 | s.call(t, 6) << 16 | s.call(t, 7) << 24) >>> 0)
            }, u.prototype.toHash = function () {
                return String.fromCharCode(255 & this.lo, this.lo >>> 8 & 255, this.lo >>> 16 & 255, this.lo >>> 24, 255 & this.hi, this.hi >>> 8 & 255, this.hi >>> 16 & 255, this.hi >>> 24)
            }, u.prototype.zzEncode = function () {
                var t = this.hi >> 31;
                return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ t) >>> 0, this.lo = (this.lo << 1 ^ t) >>> 0, this
            }, u.prototype.zzDecode = function () {
                var t = -(1 & this.lo);
                return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ t) >>> 0, this.hi = (this.hi >>> 1 ^ t) >>> 0, this
            }, u.prototype.length = function () {
                var t = this.lo, n = (this.lo >>> 28 | this.hi << 4) >>> 0, i = this.hi >>> 24;
                return 0 === i ? 0 === n ? t < 16384 ? t < 128 ? 1 : 2 : t < 2097152 ? 3 : 4 : n < 16384 ? n < 128 ? 5 : 6 : n < 2097152 ? 7 : 8 : i < 128 ? 9 : 10
            }
        }, {15: 15}], 15: [function (t, n, i) {
            var r = i;

            function u(t, n, i) {
                for (var r = Object.keys(n), u = 0; u < r.length; ++u) t[r[u]] !== b && i || (t[r[u]] = n[r[u]]);
                return t
            }

            function e(t) {
                function i(t, n) {
                    if (!(this instanceof i)) return new i(t, n);
                    Object.defineProperty(this, "message", {
                        get: function () {
                            return t
                        }
                    }), Error.captureStackTrace ? Error.captureStackTrace(this, i) : Object.defineProperty(this, "stack", {value: Error().stack || ""}), n && u(this, n)
                }

                return (i.prototype = Object.create(Error.prototype)).constructor = i, Object.defineProperty(i.prototype, "name", {
                    get: function () {
                        return t
                    }
                }), i.prototype.toString = function () {
                    return this.name + ": " + this.message
                }, i
            }

            r.asPromise = t(1), r.base64 = t(2), r.EventEmitter = t(3), r.float = t(4), r.inquire = t(5), r.utf8 = t(7), r.pool = t(6), r.LongBits = t(14), r.global = "undefined" != typeof window && window || "undefined" != typeof global && global || "undefined" != typeof self && self || this, r.emptyArray = Object.freeze ? Object.freeze([]) : [], r.emptyObject = Object.freeze ? Object.freeze({}) : {}, r.isNode = !!(r.global.process && r.global.process.versions && r.global.process.versions.node), r.isInteger = Number.isInteger || function (t) {
                return "number" == typeof t && isFinite(t) && Math.floor(t) === t
            }, r.isString = function (t) {
                return "string" == typeof t || t instanceof String
            }, r.isObject = function (t) {
                return t && "object" == typeof t
            }, r.isset = r.isSet = function (t, n) {
                var i = t[n];
                return !(null == i || !t.hasOwnProperty(n)) && ("object" != typeof i || 0 < (Array.isArray(i) ? i.length : Object.keys(i).length))
            }, r.Buffer = function () {
                try {
                    var t = r.inquire("buffer").Buffer;
                    return t.prototype.utf8Write ? t : null
                } catch (t) {
                    return null
                }
            }(), r.r = null, r.u = null, r.newBuffer = function (t) {
                return "number" == typeof t ? r.Buffer ? r.u(t) : new r.Array(t) : r.Buffer ? r.r(t) : "undefined" == typeof Uint8Array ? t : new Uint8Array(t)
            }, r.Array = "undefined" != typeof Uint8Array ? Uint8Array : Array, r.Long = r.global.dcodeIO && r.global.dcodeIO.Long || r.global.Long || r.inquire("long"), r.key2Re = /^true|false|0|1$/, r.key32Re = /^-?(?:0|[1-9][0-9]*)$/, r.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/, r.longToHash = function (t) {
                return t ? r.LongBits.from(t).toHash() : r.LongBits.zeroHash
            }, r.longFromHash = function (t, n) {
                var i = r.LongBits.fromHash(t);
                return r.Long ? r.Long.fromBits(i.lo, i.hi, n) : i.toNumber(!!n)
            }, r.merge = u, r.lcFirst = function (t) {
                return t.charAt(0).toLowerCase() + t.substring(1)
            }, r.newError = e, r.ProtocolError = e("ProtocolError"), r.oneOfGetter = function (t) {
                for (var i = {}, n = 0; n < t.length; ++n) i[t[n]] = 1;
                return function () {
                    for (var t = Object.keys(this), n = t.length - 1; -1 < n; --n) if (1 === i[t[n]] && this[t[n]] !== b && null !== this[t[n]]) return t[n]
                }
            }, r.oneOfSetter = function (i) {
                return function (t) {
                    for (var n = 0; n < i.length; ++n) i[n] !== t && delete this[i[n]]
                }
            }, r.toJSONOptions = {longs: String, enums: String, bytes: String, json: !0}, r.n = function () {
                var i = r.Buffer;
                i ? (r.r = i.from !== Uint8Array.from && i.from || function (t, n) {
                    return new i(t, n)
                }, r.u = i.allocUnsafe || function (t) {
                    return new i(t)
                }) : r.r = r.u = null
            }
        }, {1: 1, 14: 14, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7}], 16: [function (t, n) {
            n.exports = c;
            var i, r = t(15), u = r.LongBits, e = r.base64, s = r.utf8;

            function h(t, n, i) {
                this.fn = t, this.len = n, this.next = b, this.val = i
            }

            function f() {
            }

            function o(t) {
                this.head = t.head, this.tail = t.tail, this.len = t.len, this.next = t.states
            }

            function c() {
                this.len = 0, this.head = new h(f, 0, 0), this.tail = this.head, this.states = null
            }

            function a(t, n, i) {
                n[i] = 255 & t
            }

            function l(t, n) {
                this.len = t, this.next = b, this.val = n
            }

            function v(t, n, i) {
                for (; t.hi;) n[i++] = 127 & t.lo | 128, t.lo = (t.lo >>> 7 | t.hi << 25) >>> 0, t.hi >>>= 7;
                for (; 127 < t.lo;) n[i++] = 127 & t.lo | 128, t.lo = t.lo >>> 7;
                n[i++] = t.lo
            }

            function w(t, n, i) {
                n[i] = 255 & t, n[i + 1] = t >>> 8 & 255, n[i + 2] = t >>> 16 & 255, n[i + 3] = t >>> 24
            }

            c.create = r.Buffer ? function () {
                return (c.create = function () {
                    return new i
                })()
            } : function () {
                return new c
            }, c.alloc = function (t) {
                return new r.Array(t)
            }, r.Array !== Array && (c.alloc = r.pool(c.alloc, r.Array.prototype.subarray)), c.prototype.e = function (t, n, i) {
                return this.tail = this.tail.next = new h(t, n, i), this.len += n, this
            }, (l.prototype = Object.create(h.prototype)).fn = function (t, n, i) {
                for (; 127 < t;) n[i++] = 127 & t | 128, t >>>= 7;
                n[i] = t
            }, c.prototype.uint32 = function (t) {
                return this.len += (this.tail = this.tail.next = new l((t >>>= 0) < 128 ? 1 : t < 16384 ? 2 : t < 2097152 ? 3 : t < 268435456 ? 4 : 5, t)).len, this
            }, c.prototype.int32 = function (t) {
                return t < 0 ? this.e(v, 10, u.fromNumber(t)) : this.uint32(t)
            }, c.prototype.sint32 = function (t) {
                return this.uint32((t << 1 ^ t >> 31) >>> 0)
            }, c.prototype.int64 = c.prototype.uint64 = function (t) {
                var n = u.from(t);
                return this.e(v, n.length(), n)
            }, c.prototype.sint64 = function (t) {
                var n = u.from(t).zzEncode();
                return this.e(v, n.length(), n)
            }, c.prototype.bool = function (t) {
                return this.e(a, 1, t ? 1 : 0)
            }, c.prototype.sfixed32 = c.prototype.fixed32 = function (t) {
                return this.e(w, 4, t >>> 0)
            }, c.prototype.sfixed64 = c.prototype.fixed64 = function (t) {
                var n = u.from(t);
                return this.e(w, 4, n.lo).e(w, 4, n.hi)
            }, c.prototype.float = function (t) {
                return this.e(r.float.writeFloatLE, 4, t)
            }, c.prototype.double = function (t) {
                return this.e(r.float.writeDoubleLE, 8, t)
            };
            var y = r.Array.prototype.set ? function (t, n, i) {
                n.set(t, i)
            } : function (t, n, i) {
                for (var r = 0; r < t.length; ++r) n[i + r] = t[r]
            };
            c.prototype.bytes = function (t) {
                var n = t.length >>> 0;
                if (!n) return this.e(a, 1, 0);
                if (r.isString(t)) {
                    var i = c.alloc(n = e.length(t));
                    e.decode(t, i, 0), t = i
                }
                return this.uint32(n).e(y, n, t)
            }, c.prototype.string = function (t) {
                var n = s.length(t);
                return n ? this.uint32(n).e(s.write, n, t) : this.e(a, 1, 0)
            }, c.prototype.fork = function () {
                return this.states = new o(this), this.head = this.tail = new h(f, 0, 0), this.len = 0, this
            }, c.prototype.reset = function () {
                return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new h(f, 0, 0), this.len = 0), this
            }, c.prototype.ldelim = function () {
                var t = this.head, n = this.tail, i = this.len;
                return this.reset().uint32(i), i && (this.tail.next = t.next, this.tail = n, this.len += i), this
            }, c.prototype.finish = function () {
                for (var t = this.head.next, n = this.constructor.alloc(this.len), i = 0; t;) t.fn(t.val, n, i), i += t.len, t = t.next;
                return n
            }, c.n = function (t) {
                i = t
            }
        }, {15: 15}], 17: [function (t, n) {
            n.exports = e;
            var i = t(16);
            (e.prototype = Object.create(i.prototype)).constructor = e;
            var r = t(15), u = r.Buffer;

            function e() {
                i.call(this)
            }

            e.alloc = function (t) {
                return (e.alloc = r.u)(t)
            };
            var s = u && u.prototype instanceof Uint8Array && "set" === u.prototype.set.name ? function (t, n, i) {
                n.set(t, i)
            } : function (t, n, i) {
                if (t.copy) t.copy(n, i, 0, t.length); else for (var r = 0; r < t.length;) n[i++] = t[r++]
            };

            function h(t, n, i) {
                t.length < 40 ? r.utf8.write(t, n, i) : n.utf8Write(t, i)
            }

            e.prototype.bytes = function (t) {
                r.isString(t) && (t = r.r(t, "base64"));
                var n = t.length >>> 0;
                return this.uint32(n), n && this.e(s, n, t), this
            }, e.prototype.string = function (t) {
                var n = u.byteLength(t);
                return this.uint32(n), n && this.e(h, n, t), this
            }
        }, {15: 15, 16: 16}]
    }, u = {}, t = [8], n = function t(n) {
        var i = u[n];
        return i || r[n][0].call(i = u[n] = {exports: {}}, t, i, i.exports), i.exports
    }(t[0]), n.util.global.protobuf = n, "function" == typeof define && define.amd && define(["long"], function (t) {
        return t && t.isLong && (n.util.Long = t, n.configure()), n
    }), "object" == typeof module && module && module.exports && (module.exports = n)
}();
(function ($protobuf) {
    "use strict";
    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    $root.bilibili = function () {
        var bilibili = {};
        bilibili.community = function () {
            var community = {};
            community.service = function () {
                var service = {};
                service.dm = function () {
                    var dm = {};
                    dm.v1 = function () {
                        var v1 = {};
                        v1.DmWebViewReply = function () {
                            function DmWebViewReply(properties) {
                                this.specialDms = [];
                                if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]]
                            }

                            DmWebViewReply.prototype.state = 0;
                            DmWebViewReply.prototype.text = "";
                            DmWebViewReply.prototype.textSide = "";
                            DmWebViewReply.prototype.dmSge = null;
                            DmWebViewReply.prototype.flag = null;
                            DmWebViewReply.prototype.specialDms = $util.emptyArray;
                            DmWebViewReply.create = function create(properties) {
                                return new DmWebViewReply(properties)
                            };
                            DmWebViewReply.encode = function encode(message, writer) {
                                if (!writer) writer = $Writer.create();
                                if (message.state != null && Object.hasOwnProperty.call(message, "state")) writer.uint32(8).int32(message.state);
                                if (message.text != null && Object.hasOwnProperty.call(message, "text")) writer.uint32(18).string(message.text);
                                if (message.textSide != null && Object.hasOwnProperty.call(message, "textSide")) writer.uint32(26).string(message.textSide);
                                if (message.dmSge != null && Object.hasOwnProperty.call(message, "dmSge")) $root.bilibili.community.service.dm.v1.DmSegConfig.encode(message.dmSge, writer.uint32(34).fork()).ldelim();
                                if (message.flag != null && Object.hasOwnProperty.call(message, "flag")) $root.bilibili.community.service.dm.v1.DanmakuFlagConfig.encode(message.flag, writer.uint32(42).fork()).ldelim();
                                if (message.specialDms != null && message.specialDms.length) for (var i = 0; i < message.specialDms.length; ++i) writer.uint32(50).string(message.specialDms[i]);
                                return writer
                            };
                            DmWebViewReply.encodeDelimited = function encodeDelimited(message, writer) {
                                return this.encode(message, writer).ldelim()
                            };
                            DmWebViewReply.decode = function decode(reader, length) {
                                if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
                                var end = length === undefined ? reader.len : reader.pos + length,
                                    message = new $root.bilibili.community.service.dm.v1.DmWebViewReply;
                                while (reader.pos < end) {
                                    var tag = reader.uint32();
                                    switch (tag >>> 3) {
                                        case 1:
                                            message.state = reader.int32();
                                            break;
                                        case 2:
                                            message.text = reader.string();
                                            break;
                                        case 3:
                                            message.textSide = reader.string();
                                            break;
                                        case 4:
                                            message.dmSge = $root.bilibili.community.service.dm.v1.DmSegConfig.decode(reader, reader.uint32());
                                            break;
                                        case 5:
                                            message.flag = $root.bilibili.community.service.dm.v1.DanmakuFlagConfig.decode(reader, reader.uint32());
                                            break;
                                        case 6:
                                            if (!(message.specialDms && message.specialDms.length)) message.specialDms = [];
                                            message.specialDms.push(reader.string());
                                            break;
                                        default:
                                            reader.skipType(tag & 7);
                                            break
                                    }
                                }
                                return message
                            };
                            DmWebViewReply.decodeDelimited = function decodeDelimited(reader) {
                                if (!(reader instanceof $Reader)) reader = new $Reader(reader);
                                return this.decode(reader, reader.uint32())
                            };
                            DmWebViewReply.verify = function verify(message) {
                                if (typeof message !== "object" || message === null) return "object expected";
                                if (message.state != null && message.hasOwnProperty("state")) if (!$util.isInteger(message.state)) return "state: integer expected";
                                if (message.text != null && message.hasOwnProperty("text")) if (!$util.isString(message.text)) return "text: string expected";
                                if (message.textSide != null && message.hasOwnProperty("textSide")) if (!$util.isString(message.textSide)) return "textSide: string expected";
                                if (message.dmSge != null && message.hasOwnProperty("dmSge")) {
                                    var error = $root.bilibili.community.service.dm.v1.DmSegConfig.verify(message.dmSge);
                                    if (error) return "dmSge." + error
                                }
                                if (message.flag != null && message.hasOwnProperty("flag")) {
                                    var error = $root.bilibili.community.service.dm.v1.DanmakuFlagConfig.verify(message.flag);
                                    if (error) return "flag." + error
                                }
                                if (message.specialDms != null && message.hasOwnProperty("specialDms")) {
                                    if (!Array.isArray(message.specialDms)) return "specialDms: array expected";
                                    for (var i = 0; i < message.specialDms.length; ++i) if (!$util.isString(message.specialDms[i])) return "specialDms: string[] expected"
                                }
                                return null
                            };
                            DmWebViewReply.fromObject = function fromObject(object) {
                                if (object instanceof $root.bilibili.community.service.dm.v1.DmWebViewReply) return object;
                                var message = new $root.bilibili.community.service.dm.v1.DmWebViewReply;
                                if (object.state != null) message.state = object.state | 0;
                                if (object.text != null) message.text = String(object.text);
                                if (object.textSide != null) message.textSide = String(object.textSide);
                                if (object.dmSge != null) {
                                    if (typeof object.dmSge !== "object") throw TypeError(".bilibili.community.service.dm.v1.DmWebViewReply.dmSge: object expected");
                                    message.dmSge = $root.bilibili.community.service.dm.v1.DmSegConfig.fromObject(object.dmSge)
                                }
                                if (object.flag != null) {
                                    if (typeof object.flag !== "object") throw TypeError(".bilibili.community.service.dm.v1.DmWebViewReply.flag: object expected");
                                    message.flag = $root.bilibili.community.service.dm.v1.DanmakuFlagConfig.fromObject(object.flag)
                                }
                                if (object.specialDms) {
                                    if (!Array.isArray(object.specialDms)) throw TypeError(".bilibili.community.service.dm.v1.DmWebViewReply.specialDms: array expected");
                                    message.specialDms = [];
                                    for (var i = 0; i < object.specialDms.length; ++i) message.specialDms[i] = String(object.specialDms[i])
                                }
                                return message
                            };
                            DmWebViewReply.toObject = function toObject(message, options) {
                                if (!options) options = {};
                                var object = {};
                                if (options.arrays || options.defaults) object.specialDms = [];
                                if (options.defaults) {
                                    object.state = 0;
                                    object.text = "";
                                    object.textSide = "";
                                    object.dmSge = null;
                                    object.flag = null
                                }
                                if (message.state != null && message.hasOwnProperty("state")) object.state = message.state;
                                if (message.text != null && message.hasOwnProperty("text")) object.text = message.text;
                                if (message.textSide != null && message.hasOwnProperty("textSide")) object.textSide = message.textSide;
                                if (message.dmSge != null && message.hasOwnProperty("dmSge")) object.dmSge = $root.bilibili.community.service.dm.v1.DmSegConfig.toObject(message.dmSge, options);
                                if (message.flag != null && message.hasOwnProperty("flag")) object.flag = $root.bilibili.community.service.dm.v1.DanmakuFlagConfig.toObject(message.flag, options);
                                if (message.specialDms && message.specialDms.length) {
                                    object.specialDms = [];
                                    for (var j = 0; j < message.specialDms.length; ++j) object.specialDms[j] = message.specialDms[j]
                                }
                                return object
                            };
                            DmWebViewReply.prototype.toJSON = function toJSON() {
                                return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
                            };
                            return DmWebViewReply
                        }();
                        v1.DmSegConfig = function () {
                            function DmSegConfig(properties) {
                                if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]]
                            }

                            DmSegConfig.prototype.pageSize = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
                            DmSegConfig.prototype.total = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
                            DmSegConfig.create = function create(properties) {
                                return new DmSegConfig(properties)
                            };
                            DmSegConfig.encode = function encode(message, writer) {
                                if (!writer) writer = $Writer.create();
                                if (message.pageSize != null && Object.hasOwnProperty.call(message, "pageSize")) writer.uint32(8).int64(message.pageSize);
                                if (message.total != null && Object.hasOwnProperty.call(message, "total")) writer.uint32(16).int64(message.total);
                                return writer
                            };
                            DmSegConfig.encodeDelimited = function encodeDelimited(message, writer) {
                                return this.encode(message, writer).ldelim()
                            };
                            DmSegConfig.decode = function decode(reader, length) {
                                if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
                                var end = length === undefined ? reader.len : reader.pos + length,
                                    message = new $root.bilibili.community.service.dm.v1.DmSegConfig;
                                while (reader.pos < end) {
                                    var tag = reader.uint32();
                                    switch (tag >>> 3) {
                                        case 1:
                                            message.pageSize = reader.int64();
                                            break;
                                        case 2:
                                            message.total = reader.int64();
                                            break;
                                        default:
                                            reader.skipType(tag & 7);
                                            break
                                    }
                                }
                                return message
                            };
                            DmSegConfig.decodeDelimited = function decodeDelimited(reader) {
                                if (!(reader instanceof $Reader)) reader = new $Reader(reader);
                                return this.decode(reader, reader.uint32())
                            };
                            DmSegConfig.verify = function verify(message) {
                                if (typeof message !== "object" || message === null) return "object expected";
                                if (message.pageSize != null && message.hasOwnProperty("pageSize")) if (!$util.isInteger(message.pageSize) && !(message.pageSize && $util.isInteger(message.pageSize.low) && $util.isInteger(message.pageSize.high))) return "pageSize: integer|Long expected";
                                if (message.total != null && message.hasOwnProperty("total")) if (!$util.isInteger(message.total) && !(message.total && $util.isInteger(message.total.low) && $util.isInteger(message.total.high))) return "total: integer|Long expected";
                                return null
                            };
                            DmSegConfig.fromObject = function fromObject(object) {
                                if (object instanceof $root.bilibili.community.service.dm.v1.DmSegConfig) return object;
                                var message = new $root.bilibili.community.service.dm.v1.DmSegConfig;
                                if (object.pageSize != null) if ($util.Long) (message.pageSize = $util.Long.fromValue(object.pageSize)).unsigned = false; else if (typeof object.pageSize === "string") message.pageSize = parseInt(object.pageSize, 10); else if (typeof object.pageSize === "number") message.pageSize = object.pageSize; else if (typeof object.pageSize === "object") message.pageSize = new $util.LongBits(object.pageSize.low >>> 0, object.pageSize.high >>> 0).toNumber();
                                if (object.total != null) if ($util.Long) (message.total = $util.Long.fromValue(object.total)).unsigned = false; else if (typeof object.total === "string") message.total = parseInt(object.total, 10); else if (typeof object.total === "number") message.total = object.total; else if (typeof object.total === "object") message.total = new $util.LongBits(object.total.low >>> 0, object.total.high >>> 0).toNumber();
                                return message
                            };
                            DmSegConfig.toObject = function toObject(message, options) {
                                if (!options) options = {};
                                var object = {};
                                if (options.defaults) {
                                    if ($util.Long) {
                                        var long = new $util.Long(0, 0, false);
                                        object.pageSize = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long
                                    } else object.pageSize = options.longs === String ? "0" : 0;
                                    if ($util.Long) {
                                        var long = new $util.Long(0, 0, false);
                                        object.total = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long
                                    } else object.total = options.longs === String ? "0" : 0
                                }
                                if (message.pageSize != null && message.hasOwnProperty("pageSize")) if (typeof message.pageSize === "number") object.pageSize = options.longs === String ? String(message.pageSize) : message.pageSize; else object.pageSize = options.longs === String ? $util.Long.prototype.toString.call(message.pageSize) : options.longs === Number ? new $util.LongBits(message.pageSize.low >>> 0, message.pageSize.high >>> 0).toNumber() : message.pageSize;
                                if (message.total != null && message.hasOwnProperty("total")) if (typeof message.total === "number") object.total = options.longs === String ? String(message.total) : message.total; else object.total = options.longs === String ? $util.Long.prototype.toString.call(message.total) : options.longs === Number ? new $util.LongBits(message.total.low >>> 0, message.total.high >>> 0).toNumber() : message.total;
                                return object
                            };
                            DmSegConfig.prototype.toJSON = function toJSON() {
                                return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
                            };
                            return DmSegConfig
                        }();
                        v1.DanmakuFlagConfig = function () {
                            function DanmakuFlagConfig(properties) {
                                if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]]
                            }

                            DanmakuFlagConfig.prototype.recFlag = 0;
                            DanmakuFlagConfig.prototype.recText = "";
                            DanmakuFlagConfig.prototype.recSwitch = 0;
                            DanmakuFlagConfig.create = function create(properties) {
                                return new DanmakuFlagConfig(properties)
                            };
                            DanmakuFlagConfig.encode = function encode(message, writer) {
                                if (!writer) writer = $Writer.create();
                                if (message.recFlag != null && Object.hasOwnProperty.call(message, "recFlag")) writer.uint32(8).int32(message.recFlag);
                                if (message.recText != null && Object.hasOwnProperty.call(message, "recText")) writer.uint32(18).string(message.recText);
                                if (message.recSwitch != null && Object.hasOwnProperty.call(message, "recSwitch")) writer.uint32(24).int32(message.recSwitch);
                                return writer
                            };
                            DanmakuFlagConfig.encodeDelimited = function encodeDelimited(message, writer) {
                                return this.encode(message, writer).ldelim()
                            };
                            DanmakuFlagConfig.decode = function decode(reader, length) {
                                if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
                                var end = length === undefined ? reader.len : reader.pos + length,
                                    message = new $root.bilibili.community.service.dm.v1.DanmakuFlagConfig;
                                while (reader.pos < end) {
                                    var tag = reader.uint32();
                                    switch (tag >>> 3) {
                                        case 1:
                                            message.recFlag = reader.int32();
                                            break;
                                        case 2:
                                            message.recText = reader.string();
                                            break;
                                        case 3:
                                            message.recSwitch = reader.int32();
                                            break;
                                        default:
                                            reader.skipType(tag & 7);
                                            break
                                    }
                                }
                                return message
                            };
                            DanmakuFlagConfig.decodeDelimited = function decodeDelimited(reader) {
                                if (!(reader instanceof $Reader)) reader = new $Reader(reader);
                                return this.decode(reader, reader.uint32())
                            };
                            DanmakuFlagConfig.verify = function verify(message) {
                                if (typeof message !== "object" || message === null) return "object expected";
                                if (message.recFlag != null && message.hasOwnProperty("recFlag")) if (!$util.isInteger(message.recFlag)) return "recFlag: integer expected";
                                if (message.recText != null && message.hasOwnProperty("recText")) if (!$util.isString(message.recText)) return "recText: string expected";
                                if (message.recSwitch != null && message.hasOwnProperty("recSwitch")) if (!$util.isInteger(message.recSwitch)) return "recSwitch: integer expected";
                                return null
                            };
                            DanmakuFlagConfig.fromObject = function fromObject(object) {
                                if (object instanceof $root.bilibili.community.service.dm.v1.DanmakuFlagConfig) return object;
                                var message = new $root.bilibili.community.service.dm.v1.DanmakuFlagConfig;
                                if (object.recFlag != null) message.recFlag = object.recFlag | 0;
                                if (object.recText != null) message.recText = String(object.recText);
                                if (object.recSwitch != null) message.recSwitch = object.recSwitch | 0;
                                return message
                            };
                            DanmakuFlagConfig.toObject = function toObject(message, options) {
                                if (!options) options = {};
                                var object = {};
                                if (options.defaults) {
                                    object.recFlag = 0;
                                    object.recText = "";
                                    object.recSwitch = 0
                                }
                                if (message.recFlag != null && message.hasOwnProperty("recFlag")) object.recFlag = message.recFlag;
                                if (message.recText != null && message.hasOwnProperty("recText")) object.recText = message.recText;
                                if (message.recSwitch != null && message.hasOwnProperty("recSwitch")) object.recSwitch = message.recSwitch;
                                return object
                            };
                            DanmakuFlagConfig.prototype.toJSON = function toJSON() {
                                return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
                            };
                            return DanmakuFlagConfig
                        }();
                        v1.DmSegMobileReply = function () {
                            function DmSegMobileReply(properties) {
                                this.elems = [];
                                if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]]
                            }

                            DmSegMobileReply.prototype.elems = $util.emptyArray;
                            DmSegMobileReply.create = function create(properties) {
                                return new DmSegMobileReply(properties)
                            };
                            DmSegMobileReply.encode = function encode(message, writer) {
                                if (!writer) writer = $Writer.create();
                                if (message.elems != null && message.elems.length) for (var i = 0; i < message.elems.length; ++i) $root.bilibili.community.service.dm.v1.DanmakuElem.encode(message.elems[i], writer.uint32(10).fork()).ldelim();
                                return writer
                            };
                            DmSegMobileReply.encodeDelimited = function encodeDelimited(message, writer) {
                                return this.encode(message, writer).ldelim()
                            };
                            DmSegMobileReply.decode = function decode(reader, length) {
                                if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
                                var end = length === undefined ? reader.len : reader.pos + length,
                                    message = new $root.bilibili.community.service.dm.v1.DmSegMobileReply;
                                while (reader.pos < end) {
                                    var tag = reader.uint32();
                                    switch (tag >>> 3) {
                                        case 1:
                                            if (!(message.elems && message.elems.length)) message.elems = [];
                                            message.elems.push($root.bilibili.community.service.dm.v1.DanmakuElem.decode(reader, reader.uint32()));
                                            break;
                                        default:
                                            reader.skipType(tag & 7);
                                            break
                                    }
                                }
                                return message
                            };
                            DmSegMobileReply.decodeDelimited = function decodeDelimited(reader) {
                                if (!(reader instanceof $Reader)) reader = new $Reader(reader);
                                return this.decode(reader, reader.uint32())
                            };
                            DmSegMobileReply.verify = function verify(message) {
                                if (typeof message !== "object" || message === null) return "object expected";
                                if (message.elems != null && message.hasOwnProperty("elems")) {
                                    if (!Array.isArray(message.elems)) return "elems: array expected";
                                    for (var i = 0; i < message.elems.length; ++i) {
                                        var error = $root.bilibili.community.service.dm.v1.DanmakuElem.verify(message.elems[i]);
                                        if (error) return "elems." + error
                                    }
                                }
                                return null
                            };
                            DmSegMobileReply.fromObject = function fromObject(object) {
                                if (object instanceof $root.bilibili.community.service.dm.v1.DmSegMobileReply) return object;
                                var message = new $root.bilibili.community.service.dm.v1.DmSegMobileReply;
                                if (object.elems) {
                                    if (!Array.isArray(object.elems)) throw TypeError(".bilibili.community.service.dm.v1.DmSegMobileReply.elems: array expected");
                                    message.elems = [];
                                    for (var i = 0; i < object.elems.length; ++i) {
                                        if (typeof object.elems[i] !== "object") throw TypeError(".bilibili.community.service.dm.v1.DmSegMobileReply.elems: object expected");
                                        message.elems[i] = $root.bilibili.community.service.dm.v1.DanmakuElem.fromObject(object.elems[i])
                                    }
                                }
                                return message
                            };
                            DmSegMobileReply.toObject = function toObject(message, options) {
                                if (!options) options = {};
                                var object = {};
                                if (options.arrays || options.defaults) object.elems = [];
                                if (message.elems && message.elems.length) {
                                    object.elems = [];
                                    for (var j = 0; j < message.elems.length; ++j) object.elems[j] = $root.bilibili.community.service.dm.v1.DanmakuElem.toObject(message.elems[j], options)
                                }
                                return object
                            };
                            DmSegMobileReply.prototype.toJSON = function toJSON() {
                                return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
                            };
                            return DmSegMobileReply
                        }();
                        v1.DanmakuElem = function () {
                            function DanmakuElem(properties) {
                                if (properties) for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i) if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]]
                            }

                            DanmakuElem.prototype.id = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
                            DanmakuElem.prototype.progress = 0;
                            DanmakuElem.prototype.mode = 0;
                            DanmakuElem.prototype.fontsize = 0;
                            DanmakuElem.prototype.color = 0;
                            DanmakuElem.prototype.midHash = "";
                            DanmakuElem.prototype.content = "";
                            DanmakuElem.prototype.ctime = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
                            DanmakuElem.prototype.weight = 0;
                            DanmakuElem.prototype.action = "";
                            DanmakuElem.prototype.pool = 0;
                            DanmakuElem.prototype.idStr = "";
                            DanmakuElem.create = function create(properties) {
                                return new DanmakuElem(properties)
                            };
                            DanmakuElem.encode = function encode(message, writer) {
                                if (!writer) writer = $Writer.create();
                                if (message.id != null && Object.hasOwnProperty.call(message, "id")) writer.uint32(8).int64(message.id);
                                if (message.progress != null && Object.hasOwnProperty.call(message, "progress")) writer.uint32(16).int32(message.progress);
                                if (message.mode != null && Object.hasOwnProperty.call(message, "mode")) writer.uint32(24).int32(message.mode);
                                if (message.fontsize != null && Object.hasOwnProperty.call(message, "fontsize")) writer.uint32(32).int32(message.fontsize);
                                if (message.color != null && Object.hasOwnProperty.call(message, "color")) writer.uint32(40).uint32(message.color);
                                if (message.midHash != null && Object.hasOwnProperty.call(message, "midHash")) writer.uint32(50).string(message.midHash);
                                if (message.content != null && Object.hasOwnProperty.call(message, "content")) writer.uint32(58).string(message.content);
                                if (message.ctime != null && Object.hasOwnProperty.call(message, "ctime")) writer.uint32(64).int64(message.ctime);
                                if (message.weight != null && Object.hasOwnProperty.call(message, "weight")) writer.uint32(72).int32(message.weight);
                                if (message.action != null && Object.hasOwnProperty.call(message, "action")) writer.uint32(82).string(message.action);
                                if (message.pool != null && Object.hasOwnProperty.call(message, "pool")) writer.uint32(88).int32(message.pool);
                                if (message.idStr != null && Object.hasOwnProperty.call(message, "idStr")) writer.uint32(98).string(message.idStr);
                                return writer
                            };
                            DanmakuElem.encodeDelimited = function encodeDelimited(message, writer) {
                                return this.encode(message, writer).ldelim()
                            };
                            DanmakuElem.decode = function decode(reader, length) {
                                if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
                                var end = length === undefined ? reader.len : reader.pos + length,
                                    message = new $root.bilibili.community.service.dm.v1.DanmakuElem;
                                while (reader.pos < end) {
                                    var tag = reader.uint32();
                                    switch (tag >>> 3) {
                                        case 1:
                                            message.id = reader.int64();
                                            break;
                                        case 2:
                                            message.progress = reader.int32();
                                            break;
                                        case 3:
                                            message.mode = reader.int32();
                                            break;
                                        case 4:
                                            message.fontsize = reader.int32();
                                            break;
                                        case 5:
                                            message.color = reader.uint32();
                                            break;
                                        case 6:
                                            message.midHash = reader.string();
                                            break;
                                        case 7:
                                            message.content = reader.string();
                                            break;
                                        case 8:
                                            message.ctime = reader.int64();
                                            break;
                                        case 9:
                                            message.weight = reader.int32();
                                            break;
                                        case 10:
                                            message.action = reader.string();
                                            break;
                                        case 11:
                                            message.pool = reader.int32();
                                            break;
                                        case 12:
                                            message.idStr = reader.string();
                                            break;
                                        default:
                                            reader.skipType(tag & 7);
                                            break
                                    }
                                }
                                return message
                            };
                            DanmakuElem.decodeDelimited = function decodeDelimited(reader) {
                                if (!(reader instanceof $Reader)) reader = new $Reader(reader);
                                return this.decode(reader, reader.uint32())
                            };
                            DanmakuElem.verify = function verify(message) {
                                if (typeof message !== "object" || message === null) return "object expected";
                                if (message.id != null && message.hasOwnProperty("id")) if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high))) return "id: integer|Long expected";
                                if (message.progress != null && message.hasOwnProperty("progress")) if (!$util.isInteger(message.progress)) return "progress: integer expected";
                                if (message.mode != null && message.hasOwnProperty("mode")) if (!$util.isInteger(message.mode)) return "mode: integer expected";
                                if (message.fontsize != null && message.hasOwnProperty("fontsize")) if (!$util.isInteger(message.fontsize)) return "fontsize: integer expected";
                                if (message.color != null && message.hasOwnProperty("color")) if (!$util.isInteger(message.color)) return "color: integer expected";
                                if (message.midHash != null && message.hasOwnProperty("midHash")) if (!$util.isString(message.midHash)) return "midHash: string expected";
                                if (message.content != null && message.hasOwnProperty("content")) if (!$util.isString(message.content)) return "content: string expected";
                                if (message.ctime != null && message.hasOwnProperty("ctime")) if (!$util.isInteger(message.ctime) && !(message.ctime && $util.isInteger(message.ctime.low) && $util.isInteger(message.ctime.high))) return "ctime: integer|Long expected";
                                if (message.weight != null && message.hasOwnProperty("weight")) if (!$util.isInteger(message.weight)) return "weight: integer expected";
                                if (message.action != null && message.hasOwnProperty("action")) if (!$util.isString(message.action)) return "action: string expected";
                                if (message.pool != null && message.hasOwnProperty("pool")) if (!$util.isInteger(message.pool)) return "pool: integer expected";
                                if (message.idStr != null && message.hasOwnProperty("idStr")) if (!$util.isString(message.idStr)) return "idStr: string expected";
                                return null
                            };
                            DanmakuElem.fromObject = function fromObject(object) {
                                if (object instanceof $root.bilibili.community.service.dm.v1.DanmakuElem) return object;
                                var message = new $root.bilibili.community.service.dm.v1.DanmakuElem;
                                if (object.id != null) if ($util.Long) (message.id = $util.Long.fromValue(object.id)).unsigned = false; else if (typeof object.id === "string") message.id = parseInt(object.id, 10); else if (typeof object.id === "number") message.id = object.id; else if (typeof object.id === "object") message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber();
                                if (object.progress != null) message.progress = object.progress | 0;
                                if (object.mode != null) message.mode = object.mode | 0;
                                if (object.fontsize != null) message.fontsize = object.fontsize | 0;
                                if (object.color != null) message.color = object.color >>> 0;
                                if (object.midHash != null) message.midHash = String(object.midHash);
                                if (object.content != null) message.content = String(object.content);
                                if (object.ctime != null) if ($util.Long) (message.ctime = $util.Long.fromValue(object.ctime)).unsigned = false; else if (typeof object.ctime === "string") message.ctime = parseInt(object.ctime, 10); else if (typeof object.ctime === "number") message.ctime = object.ctime; else if (typeof object.ctime === "object") message.ctime = new $util.LongBits(object.ctime.low >>> 0, object.ctime.high >>> 0).toNumber();
                                if (object.weight != null) message.weight = object.weight | 0;
                                if (object.action != null) message.action = String(object.action);
                                if (object.pool != null) message.pool = object.pool | 0;
                                if (object.idStr != null) message.idStr = String(object.idStr);
                                return message
                            };
                            DanmakuElem.toObject = function toObject(message, options) {
                                if (!options) options = {};
                                var object = {};
                                if (options.defaults) {
                                    if ($util.Long) {
                                        var long = new $util.Long(0, 0, false);
                                        object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long
                                    } else object.id = options.longs === String ? "0" : 0;
                                    object.progress = 0;
                                    object.mode = 0;
                                    object.fontsize = 0;
                                    object.color = 0;
                                    object.midHash = "";
                                    object.content = "";
                                    if ($util.Long) {
                                        var long = new $util.Long(0, 0, false);
                                        object.ctime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long
                                    } else object.ctime = options.longs === String ? "0" : 0;
                                    object.weight = 0;
                                    object.action = "";
                                    object.pool = 0;
                                    object.idStr = ""
                                }
                                if (message.id != null && message.hasOwnProperty("id")) if (typeof message.id === "number") object.id = options.longs === String ? String(message.id) : message.id; else object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
                                if (message.progress != null && message.hasOwnProperty("progress")) object.progress = message.progress;
                                if (message.mode != null && message.hasOwnProperty("mode")) object.mode = message.mode;
                                if (message.fontsize != null && message.hasOwnProperty("fontsize")) object.fontsize = message.fontsize;
                                if (message.color != null && message.hasOwnProperty("color")) object.color = message.color;
                                if (message.midHash != null && message.hasOwnProperty("midHash")) object.midHash = message.midHash;
                                if (message.content != null && message.hasOwnProperty("content")) object.content = message.content;
                                if (message.ctime != null && message.hasOwnProperty("ctime")) if (typeof message.ctime === "number") object.ctime = options.longs === String ? String(message.ctime) : message.ctime; else object.ctime = options.longs === String ? $util.Long.prototype.toString.call(message.ctime) : options.longs === Number ? new $util.LongBits(message.ctime.low >>> 0, message.ctime.high >>> 0).toNumber() : message.ctime;
                                if (message.weight != null && message.hasOwnProperty("weight")) object.weight = message.weight;
                                if (message.action != null && message.hasOwnProperty("action")) object.action = message.action;
                                if (message.pool != null && message.hasOwnProperty("pool")) object.pool = message.pool;
                                if (message.idStr != null && message.hasOwnProperty("idStr")) object.idStr = message.idStr;
                                return object
                            };
                            DanmakuElem.prototype.toJSON = function toJSON() {
                                return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
                            };
                            return DanmakuElem
                        }();
                        return v1
                    }();
                    return dm
                }();
                return service
            }();
            return community
        }();
        return bilibili
    }();
    return $root
})(protobuf);
var proto_seg = protobuf.roots.default.bilibili.community.service.dm.v1.DmSegMobileReply;
var LOG_PROTO = false;

function ldanmu_to_proto_seg(ldanmu, segIndex) {
    console.log("protobuf: converting xml to seg");
    var res = [];
    for (sdanmu of ldanmu) {
        attr = sdanmu.substring(1).split(',')
        progress = Math.floor(parseFloat(attr[0]) * 1e3)
        if (progress < segIndex * 600000 && progress > (segIndex - 1) * 600000) {
            pos = attr[7].indexOf('"')
            idStr = attr[7].substring(0, pos)

            res.push({
                id: parseInt(idStr),
                progress: progress,
                mode: parseInt(attr[1]),
                fontsize: parseInt(parseInt(attr[2])),
                color: parseInt(attr[3]),
                midHash: attr[6],
                content: attr[7].substring(pos + 2),
                ctime: parseInt(attr[4]),
                weight: 10,
                idStr: idStr
            })
        }

    }
    var res_uint8arr = proto_seg.encode(proto_seg.create({elems: res})).finish();
    if (LOG_PROTO) console.log("verbose proto:", dom, res, res_uint8arr);
    return res_uint8arr
}

function parse_danmu_url(url) {
    // var protocol=ret[1], cid=ret[2], debug=ret[3], type=ret[4];
    function addtype(type, res) {
        return res ? res.concat(type) : res;
    }

    // ret_type=(type.indexOf('proto_')==0)?'protobuf':'xml' in other code
    // so protobuf results should starts with `proto_`

    if (url.indexOf('//comment.bilibili.com/') !== -1)
        return addtype('trad', TRAD_DANMU_URL_RE.exec(url));
    else if (url.indexOf('/list.so?') !== -1)
        return addtype('list', NEW_DANMU_NORMAL_URL_RE.exec(url));
    else if (url.indexOf('/history?') !== -1)
        return addtype('history', NEW_DANMU_HISTORY_URL_RE.exec(url));
    else if (url.indexOf('/seg.so') !== -1) {
        var res = PROTO_DANMU_SEG_URL_RE.exec(url);
        segindex = /(segment_index=\d*)/.exec(url)[0]
        return addtype(segindex, res);
    } else
        return null;
}

function genxml(ldanmu, ndanmu, cid) {
    head = '<?xml version="1.0" encoding="UTF-8"?><i><chatserver>chat.bilibili.com</chatserver><chatid>' + cid.toString() + '</chatid><mission>0</mission><maxlimit>' + ndanmu.toString() + '</maxlimit><state>0</state><real_name>0</real_name><source>DF</source><d p=';
    return head + ldanmu.join('</d><d p=') + '</d></i>'
}

function unique(arr) {
    var result = [], isRepeated;
    for (var i = 0, len1 = arr.length; i < len1; i++) {
        isRepeated = false;
        for (var j = 0, len2 = result.length; j < len2; j++) {
            if (arr[i] === result[j]) {
                isRepeated = true;
                break;
            }
        }
        if (!isRepeated) {
            result.push(arr[i]);
        }
    }
    return result;
}


function getDanmuDate(danmu) {
    i = 4;
    pos = 0;
    while (i > 0) {
        pos = danmu.indexOf(',', pos + 1);
        i -= 1;
    }
    return Number(danmu.slice(pos + 1, danmu.indexOf(',', pos + 1)))
}

function getDanmuPos(danmu) {
    return Number(danmu.substring(1, danmu.indexOf(',')))

}

function getDanmuContent(danmu) {
    return danmu.substring(danmu.indexOf('>') + 1)
}

function htmlEscape(text) {
    return text.replace(/[<>"&]/g, function (match, pos, originalText) {
        switch (match) {
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case "&":
                return "&amp;";
            case "\"":
                return "&quot;";
        }
    });
}

function xml2danmu(sdanmu) {
    ldanmu = sdanmu.split('</d><d p=');
    tdanmu = ldanmu[0];
    ldanmu[0] = tdanmu.slice(tdanmu.indexOf('<d p=') + 5, tdanmu.length);
    tdanmu = ldanmu[ldanmu.length - 1];
    ldanmu[ldanmu.length - 1] = tdanmu.slice(0, tdanmu.length - 8);
    return ldanmu

}

function moreHistory(cid) {
    date = new Date();
    if (test || cid !== window.lastcid) {
        window.lastcid = cid
    } else {
        return window.lastsdanmu
    }
    console.log('GetDanmuFor CID' + cid)
    aldanmu = [];
    tdanmurate = window.danmuRate;
    firstdate = 0;
    while (true) {
        const xhr = new XMLHttpRequest();
        url = "https://api.bilibili.com/x/v2/dm/history?type=1&date=" + getdate(date) + "&oid=" + cid.toString();
        console.log(url);
        xhr.open("get", url, false);
        xhr.send();
        if (xhr.readyState === 4 && xhr.status === 200) {
            sdanmu = xhr.responseText;
            ldanmu = xml2danmu(sdanmu)
            regndanmu = new RegExp('<maxlimit>(.*?)</maxlimit>');
            ndanmu = regndanmu.exec(sdanmu)[1];
            aldanmu = aldanmu.concat(ldanmu);
            if (ldanmu.length < Number(ndanmu) - 50) break;
            tfirstdate = getDanmuDate(tdanmu);
            if (firstdate !== 0 && firstdate - tfirstdate < 86400)
                tfirstdate = firstdate - 86400;
            firstdate = tfirstdate;
            date.setTime(firstdate * 1000);
        }
        tdanmurate--;
        if (tdanmurate < 1) {
            console.log('count complete');
            break
        }

    }

    aldanmu = unique(aldanmu);

    return [aldanmu, ndanmu]
}

function danmuMatch(danmuContent, rule) {
    type = rule['type'];
    content = rule['content'];
    if (type === 'word') {
        if (danmu.indexOf(content) !== -1) {
            return true
        }
    }
    if (type === 'color') {
        i = 3;
        pos = 0;
        while (i > 0) {
            pos = danmu.indexOf(',', pos + 1);
            i -= 1;
        }
        if (content === danmu.slice(pos + 1, danmu.indexOf(',', pos + 1))) {
            return true
        }
    }
    if (type === 'reg') {
        if (danmu.match(content)) {
            return true
        }
    }
}

function danmuFilter(ldanmu) {
    ldanmu.sort(function (a, b) {
        return getDanmuPos(a) - getDanmuPos(b)
    });
    ruleGroup = {
        lrule: [
            {
                content: 'regexp',
                type: 'reg',
                isTrigger: true
            }
        ],
        period: [0, 60],
        hasTriger: true,
        TrigerSize: 10
    };
    for (ruleGroup of window.filterRule) {
        if (!ruleGroup['hasTrigger']) {
            nldanmu = [];
            for (danmu of ldanmu) {
                pos = getDanmuPos(danmu);
                content = getDanmuContent(danmu);
                if (ruleGroup['period'] !== null) {
                    if (pos < ruleGroup['period'][0]) {
                        continue
                    }
                    if (pos > ruleGroup['period'][1]) {
                        break
                    }
                }
                ffilted = false;

                for (rule of ruleGroup['lrule']) {
                    if (danmuMatch(content, rule)) {
                        ffilted = true;
                        break
                    }
                }
                if (!ffilted) {
                    nldanmu.push(danmu)
                }
            }
            ldanmu = nldanmu;
        } else {
            lastTriggeredPos = 0;
            triggerCount = 0;
            allCount = 0;
            ftriggered = false;
            tldanmu = [];
            for (danmu of ldanmu) {
                pos = getDanmuPos(danmu);
                content = getDanmuContent(danmu);
                for (rule of ruleGroup['lrule']) {
                    if (!ftriggered) {
                        allCount += 1;
                        if (rule['isTrigger'] === true && danmuMatch(content, rule)) {
                            if (lastTriggeredPos === 0) {
                                lastTriggeredPos = pos;
                            } else {
                                if (pos - lastTriggeredPos > 10) {
                                    nldanmu.concat(tldanmu);
                                    tldanmu = [];
                                    triggerCount = 0;
                                    allCount = 0;
                                    lastTriggeredPos = 0;
                                }
                            }
                            tldanmu.push(danmu);
                            triggerCount += 1;
                            if (triggerCount > 20 && triggerCount / allCount > 0.3) {
                                ttldanmu = [];
                                for (tdanmu of tldanmu) {
                                    pos = getDanmuPos(tdanmu);
                                    content = getDanmuContent(tdanmu);
                                    ffilted = false;
                                    for (rule of ruleGroup['lrule']) {
                                        if (danmuMatch(content, rule)) {
                                            ffilted = true;
                                            break
                                        }
                                    }
                                    if (!ffilted) {
                                        ttldanmu.push(tdanmu)
                                    }

                                }
                                tldanmu = [];
                                ftriggered = true
                            }
                        }
                    } else {
                        if (pos - lastTriggeredPos > 10) {
                            ftriggered = false;
                        }
                        for (rule of ruleGroup['lrule']) {
                            if (danmuMatch(content, rule)) {
                                ffilted = true;
                                break
                            }
                        }
                        if (!ffilted) {
                            nldanmu.push(danmu)
                        }
                    }

                }
            }
            ldanmu = nldanmu;
        }
    }
    return ldanmu;
}


async function localServer(order, argv) {
    var ws = new WebSocket("ws://localhost:56789");

    ws.onopen = function (evt) {
        ws.send(htmlEscape(order + ':' + argv))
    }

    async function recvData() {
        await new Promise((resolve) => {
            ws.onmessage = function (evt) {
                data = evt.data

                res = data
                resolve();
            }
        })

        return res
    }

    res = await recvData()
    if (order !== 'read' || res.slice(0, 7) === '[failed') {
        res = JSON.parse(res)
    }
    return res
}


function nicoDanmu(nicoid) {
    console.log('Found NicoID:' + nicoinfo)
    const xhr = new XMLHttpRequest();
    xhr.open("get", 'http://39.102.56.130:400/nico/?nicoid='
        + nicoid, false);
    tldanmu = []
    xhr.send();
    if (xhr.readyState === 4 && xhr.status === 200) {
        nicodanmu = xhr.responseText;
        tldanmu = nicodanmu.split('\n');
    }
    console.log('ndanmu:' + tldanmu.length + ' from niconico')
    console.log(tldanmu)
    return tldanmu
}

function youtubeDanmu(youtubeUrl) {
    const xhr = new XMLHttpRequest();
    xhr.open("get", 'https://api.dmooji.com/api/v3/comments/' + youtubeUrl + '?user_id=undefined'
        , false);

    xhr.send();
    aldanmu = []

    if (xhr.readyState === 4 && xhr.status === 200) {
        sdanmu = xhr.responseText;
        // console.log(sdanmu)
        try {
            tldanmu = JSON.parse(sdanmu)['data']['comments']
        } catch (e) {
            tldanmu = JSON.parse('[' + sdanmu + ']')
        }
        date = new Date();
        for (ddanmu of ldanmu) {
            largv = [ddanmu['stime'] / 1000, ddanmu['mode'], 25, ddanmu['color'], date.getTime(), 0, 'youtube', ddanmu['comment_id']]
            danmu = '"' + largv.join(',') + '">' + htmlEscape(ddanmu['text'])
            aldanmu.push(danmu)
        }
    }
    console.log('ndanmu:' + aldanmu.length + ' from youtube')
    return aldanmu
}

async function localDanmu(path) {
    lfdanmu = await localServer('danmuPath', peposide)
    ldanmu = []
    if (lfdanmu[0] !== 'failed') {
        content = null
        timestamp = null
        for (fdanmu of lfdanmu) {
            sdanmu = await localServer('read', fdanmu)
            if (sdanmu[0] !== 'failed') {
                tldanmu = xml2danmu(sdanmu)
                for (danmu of tldanmu) {
                    ncontent = getDanmuContent(danmu)
                    ntimestamp = getDanmuDate(danmu)
                    if (ncontent === content && timestamp === ntimestamp) {

                    } else {
                        content = ncontent
                        timestamp = ntimestamp
                        ldanmu.push(danmu)
                    }
                }
                console.log('ndanmu:' + tldanmu.length + ' from ' + fdanmu)
            }
        }
    }
    return ldanmu
}

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    console.log(request.type);
    if (request.type === "ajax_hook") {
        console.log(request.url);
        ret = parse_danmu_url(request.url);
        if (ret) {
            var protocol = ret[1], cid = ret[2], debug = ret[3], url_type = ret[4];
            console.log(url_type)
            var ldanmu = null
            if (!test){
                for (dldanmu of window.ldldanmu) {
                    if (dldanmu['cid'] === cid) {
                        ldanmu = dldanmu['ldanmu']
                        ndanmu = dldanmu['ndanmu']
                        console.log('readTemp')
                        break
                    }
                }
            }
            if (ldanmu === null) {
                ret = moreHistory(cid)
                ldanmu = ret[0]
                var ndanmu = ret[1]
                console.log('ndanmu:' + ldanmu.length + ' from history')
                peposide = window.dbindCid[cid]
                if (peposide !== undefined) {
                    ldanmu=ldanmu.concat(localDanmu(peposide))
                }
                nicoinfo = request.nicoinfo
                if (nicoinfo !== null) {
                    console.log(nicoinfo)
                    nicoid = nicoinfo.slice(nicoinfo.lastIndexOf('/') + 1, nicoinfo.length);
                    ldanmu=ldanmu.concat(nicoDanmu(nicoid))
                }
                youtubeUrl = request.youtubeUrl
                if (youtubeUrl !== null) {
                    console.log(youtubeUrl)
                    console.log('Found YoutubeURL:' + youtubeUrl)
                    ldanmu=ldanmu.concat(youtubeDanmu(youtubeUrl))
                }
                // ldanmu = de_duplication(ldanmu)
                if (window.ldldanmu.length > 5) {
                    window.ldldanmu.shift()
                }
                window.ldldanmu.push({'cid': cid, 'ldanmu': ldanmu, 'ndanmu': ndanmu})
            }


            if (!url_type.startsWith('segment_index')) {
                console.log('total ndanmu:' + ldanmu.length)
                var res = genxml(ldanmu, ndanmu, cid);
            } else {
                segindex = parseInt(url_type.substring(14))
                if (segindex === 1) {
                    console.log('total ndanmu:' + ldanmu.length)
                }
                res = ldanmu_to_proto_seg(ldanmu, segindex)
                console.log('arrayLength:' + res.length)
            }
            sendResponse({
                data: res
            });
        } else {
            sendResponse({
                data: null
            });
        }

    }
    if (request.type === "bindLocalDanmu") {
        bindPath(request)
    }
});

function bindPath(request) {
    ldeposide = JSON.parse(request.arg)

    function paste() {
        bg = chrome.extension.getBackgroundPage();        // get the background page
        bg.document.body.innerHTML = "";                   // clear the background page

// add a DIV, contentEditable=true, to accept the paste action
        var helperdiv = bg.document.createElement("div");
        document.body.appendChild(helperdiv);
        helperdiv.contentEditable = true;

// focus the helper div's content
        var range = document.createRange();
        range.selectNode(helperdiv);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        helperdiv.focus();

// trigger the paste action
        bg.document.execCommand("Paste");

// read the clipboard contents from the helperdiv
        return helperdiv.innerHTML;
    }

    lpath = paste()
    lpath = lpath.split('"</div><div>"')
    lpath[0] = lpath[0].slice(6)
    lpath[lpath.length - 1] = lpath[lpath.length - 1].slice(0, -7)
    lpath.sort()
    i = -1
    for (deposide of ldeposide) {
        i += 1
        window.dbindCid[deposide['cid']] = lpath[i]
    }
    console.log(window.dbindCid)
    tldldanmu = []
    for (dlanmu of window.ldldanmu) {
        fbreak = false
        for (deposide of ldeposide) {
            if (dlanmu['cid'] === deposide['cid']) {
                fbreak = true
                break
            }
        }
        if (!fbreak) {
            tldldanmu.push(dldanmu)
        }
    }
    window.ldldanmu = tldldanmu
    saveConfig()
}





