let test = false
let version = '2.0'

function loadConfig() {
    // console.log(localStorage)
    window.setting = {};
    if (!test) {
        try {
            window.setting = JSON.parse(localStorage['setting'])
            for (key of Object.keys(window.setting)) {
                if (defaultConfig[key] === undefined) {
                    delete window.setting[key]
                }
            }
            for (key of Object.keys(defaultConfig)) {
                if (window.setting[key] === undefined) {
                    window.setting[key] = defaultConfig[key]
                }
            }
            saveConfig();
        } catch (e) {
            console.log(e)
            initConfig()
            saveConfig();
        }

    } else initConfig()
    help()

    // console.log(defaultConfig)
    window.ldldanmu = [];
}

function help() {
    console.log('扩展现在的设置为')
    console.log(format('如对于弹幕池上限为3000的24分钟番剧\n' +
        '    danmuRate: {danmuRate}, 将加载3000*{danmuRate}条以上的B站弹幕\n' +
        '    uidFilter: {uidFilter}, 将过滤uid在{uidFilter}以上的弹幕\n' +
        '    nicoDanmuRate:  {nicoDanmuRate}, 将加载3000*{nicoDanmuRate}条的N站弹幕\n' +
        '    translateNicoComment: {translateNicoComment}, 翻译N站弹幕\n' +
        '    translateThreshold: {translateThreshold}, 长度在{translateThreshold}以下的N站弹幕将不会被翻译\n' +
        '    replaceKatakana: {replaceKatakana}, 将未翻译的N站弹幕中的片假名替换为罗马字', window.setting))
    console.log('如需修改设置,请按')
    console.log('editConfig("danmuRate",3)')
    console.log('的格式输入')
}

function format(text, dict) {
    var result = text
    var lkey = text.match(/{(.*?)}/g)
    for (var i = 0; i < lkey.length; i++) {
        var key = lkey[i]
        result = result.replace(key, dict[key.slice(1, -1)])
    }
    return result
}

function editConfig(key, value) {
    if (!defaultConfig.hasOwnProperty(key)) {
        console.log('设置中不含有', key, '这一项')
        return
    }
    if (typeof defaultConfig[key] !== typeof value) {
        console.log(key, '项的类型应为', typeof defaultConfig[key], '如', defaultConfig[key])
        console.log('而将要修改的值为', value, ',其类型为', typeof value)
        return;
    }
    if (key === 'uidFilter') {
        if(value>100000000){
            console.log('不推荐用户uid过滤大于一亿')
        }
    }
    if(key==='translateThreshold' && value<8){
        console.log('')
    }
    window.setting[key] = value
    saveConfig()
    console.log('修改成功')
    if (key === 'uidFilter') {
        window.crcFilter = crcFilter()
    }
}

function saveConfig() {
    localStorage['setting'] = JSON.stringify(window.setting)
}

let defaultConfig = {
    danmuRate: 3.1,
    nicoDanmuRate: 1,
    translateNicoComment: true,
    translateThreshold:7,
    replaceKatakana: true,
    bindedCid: {},
    uidFilter: -1,
    filterRule: [
        {
            string: ['⎛'],
        }
    ],
    version: '2.0'
}

function initConfig() {
    window.setting = defaultConfig
}


loadConfig();

let TRAD_DANMU_URL_RE = /(.+):\/\/comment\.bilibili\.com\/(?:rc\/)?(?:dmroll,[\d\-]+,)?(\d+)(?:\.xml)?(\?debug)?$/;
let NEW_DANMU_NORMAL_URL_RE = /(.+):\/\/api\.bilibili\.com\/x\/v1\/dm\/list\.so\?oid=(\d+)(\&debug)?$/;
let PROTO_DANMU_SEG_URL_RE = /(.+):\/\/api\.bilibili\.com\/x\/v2\/dm\/web\/seg\.so\?.*?oid=(\d+).*?(\&debug)?$/;
let NEW_DANMU_HISTORY_URL_RE = /(.+):\/\/api\.bilibili\.com\/x\/v2\/dm\/history\?type=\d+&oid=(\d+)&date=[\d\-]+(\&debug)?$/;
let DANMU_URL_FILTER = ['*://comment.bilibili.com/*', '*://api.bilibili.com/x/v1/dm/*', '*://api.bilibili.com/x/v2/dm/*']

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

async function ldanmu_to_proto_seg(ldanmu, segIndex, cid, ndanmu) {
    let res = [];
    if (ndanmu * window.setting.danmuRate > len(ldanmu)) {
        ldanmu = mergeDanmu(ldanmu,
            await danmuFilter(await loadProtoDanmu('https://api.bilibili.com/x/v2/dm/web/seg.so?type=1&oid='
                + cid + '&segment_index=' + segIndex))
        )
    }

    for (sdanmu of ldanmu) {
        if (sdanmu.progress < segIndex * 360000 && sdanmu.progress >= (segIndex - 1) * 360000) {
            res.push(sdanmu)
        }
    }
    let res_uint8arr = proto_seg.encode(proto_seg.create({elems: res})).finish();
    if (LOG_PROTO) console.log("verbose proto:", dom, res, res_uint8arr);
    return [res_uint8arr, res.length, res]
}

function parse_danmu_url(url) {
    // let protocol=ret[1], cid=ret[2], debug=ret[3], type=ret[4];
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
        let res = PROTO_DANMU_SEG_URL_RE.exec(url);
        let segindex = /(segment_index=\d*)/.exec(url)[0]
        return addtype(segindex, res);
    } else
        return null;
}

function genxml(ldanmu, ndanmu, cid) {
    let head = '<?xml version="1.0" encoding="UTF-8"?><i><chatserver>chat.bilibili.com</chatserver><chatid>' + cid.toString() + '</chatid><mission>0</mission><maxlimit>' + ndanmu.toString() + '</maxlimit><state>0</state><real_name>0</real_name><source>DF</source><d p=';
    return head + ldanmu.join('</d><d p=') + '</d></i>'
}

String.prototype.hashCode = function () {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

function mergeDanmu(oldanmu, nldanmu) {
    // let result = oldanmu, isRepeated;
    // for (let i = 0, len1 = nldanmu.length; i < len1; i++) {
    //     isRepeated = false;
    //
    //     for (let j = 0, len2 = oldanmu.length; j < len2; j++) {
    //         if (nldanmu[i].id === oldanmu[j].id) {// && nldanmu[i].content === oldanmu[j].content) {
    //             isRepeated = true;
    //             break
    //         }
    //     }
    //     if (!isRepeated) {
    //         result.push(nldanmu[i]);
    //     }
    // }
    // return result
    if (oldanmu.idPool === undefined) {

        let idPool = new Set()
        for (let danmu of oldanmu) {
            try {
                idPool.add(danmu.progress * danmu.content.length * parseInt(danmu.midHash, 16))

            } catch (e) {
                console.log(danmu)
                console.log(e)
                throw e
            }
        }
        oldanmu.idPool = idPool
    }
    try {
        for (let danmu of nldanmu) {
            let ida = danmu.progress * danmu.content.length * parseInt(danmu.midHash, 16)
            if (!oldanmu.idPool.has(ida)) {
                if (!window.crcFilter || window.crcFilter(danmu.midHash)) {
                    oldanmu.push(danmu)
                    oldanmu.idPool.add(ida)
                }
            }
        }
    } catch (e) {
        console.log()
    }

    return oldanmu
}

function mergeSortedDanmu(oldanmu, nldanmu) {
    let lastTs = oldanmu[-1].ctime;
    let lastDanmuIdPool = []

    for (let idanmu = 0; idanmu < oldanmu.length; idanmu += 1) {
        let danmu = oldanmu[oldanmu.length - 1 - idanmu]
        if (danmu.ctime === lastTs) {
            lastDanmuIdPool.push(danmu.id)
        }
    }
    let pos = null
    for (let idanmu = 0; idanmu < nldanmu.length; idanmu += 1) {
        let danmu = nldanmu[idanmu]
        if (lastTs > danmu.ctime) {
            pos = idanmu
            break
        }
        if (lastTs === danmu.ctime) {
            if (lastDanmuIdPool.indexOf(danmu.id) === -1) {
                oldanmu.push(danmu)
            }
        }
    }
    if (pos !== null) {
        oldanmu = oldanmu.concat(nldanmu.slice(pos))
    }

    return oldanmu

}

function len(object) {
    return object.length
}

function str(object) {
    return object.toString()
}


Array.prototype.append = Array.prototype.push
String.prototype.join = function (array) {
    return array.join(this)
}


function getdate(date) {
    let month = Number(date.getMonth()) + 1;
    if (month < 10) {
        month = '0' + month
    }
    let sdate
    if (Number(date.getDate()) < 10) {
        sdate = '0' + date.getDate()
    } else {
        sdate = date.getDate()
    }
    return [date.getFullYear(), month, sdate].join('-')
}

function getDanmuDate(danmu) {
    let i = 4;
    let pos = 0;
    while (i > 0) {
        pos = danmu.indexOf(',', pos + 1);
        i -= 1;
    }
    return Number(danmu.slice(pos + 1, danmu.indexOf(',', pos + 1)))
}

function getDanmuPos(danmu) {
    return Number(danmu.substring(1, danmu.indexOf(',')))
}

function getDanmuUserhash(danmu) {
    let pos = danmu.lastIndexOf(',')
    return danmu.slice(danmu.lastIndexOf(',', pos - 1) + 1, pos)
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
                return '"';
        }
    });
}


function xmlunEscape(content) {
    return content.replace('；', ';')
        .replace('&lt;', '<')
        .replace('&gt;', '>')
        .replace('&apos;', "'")
        .replace('&quot;', '"')
        .replace('&amp;', '&')
}

function xml2danmu(sdanmu, user = null) {
    let ldanmu = sdanmu.split('</d><d p=');

    if (ldanmu.length === 1) {
        return []
    }
    let tdanmu = ldanmu[0];
    ldanmu[0] = tdanmu.slice(tdanmu.indexOf('<d p=') + 5, tdanmu.length);
    tdanmu = ldanmu[ldanmu.length - 1];
    ldanmu[ldanmu.length - 1] = tdanmu.slice(0, tdanmu.length - 8);
    for (let i = 0; i < ldanmu.length; i++) {
        let danmu = ldanmu[i]
        let argv = danmu.substring(1, danmu.indexOf('"', 2)).split(',')
        ldanmu[i] = {
            color: Number(argv[3]),
            content: xmlunEscape(danmu.slice(danmu.indexOf('>') + 1, danmu.length)),
            ctime: Number(argv[4]),
            fontsize: Number(argv[2]),
            id: Number(argv[7]),
            idStr: argv[7],
            midHash: argv[6],
            mode: Number(argv[1]),
            progress: Math.round(Number(argv[0]) * 1000),
            weight: 10
        }
    }
    return ldanmu
}

function danmuObject2XML(ldanmu) {
    for (let i = 0, length = ldanmu.length; i < length; i++) {
        let danmu = ldanmu[i]
        ldanmu[i] = `<d p="${danmu.progress / 1000},${danmu.mode},${danmu.fontsize},${danmu.color},${danmu.ctime},${0},${danmu.midHash},${danmu.idStr}">${htmlEscape(danmu.content)}<\d>`
    }
    return ldanmu
}

function getMinDate(ldanmu) {
    let minDate = ldanmu[0].ctime
    for (let danmu of ldanmu) {
        if (minDate > danmu.ctime) {
            minDate = danmu.ctime
        }
    }
    return minDate
}

function applyOffset(ldanmu, offset) {
    let loffset = [[0, 0]].concat(offset)
    let ioffset = 0
    ldanmu.sort(function (a, b) {
        return a.progress - b.progress
    })
    for (let idanmu = 0; idanmu < ldanmu.length; idanmu++) {
        if ((ioffset + 1) < len(loffset) &&
            (ldanmu[idanmu].progress + loffset[ioffset][1] >= loffset[ioffset + 1][0])
        ) {
            ioffset += 1
        }
        ldanmu[idanmu].progress = Math.floor(ldanmu[idanmu].progress + loffset[ioffset][1] * 1000)
    }
    return ldanmu
}

async function moreFiltedHistory(cid, duration) {
    let date = new Date();
    date.setTime(date.getTime() - 86400000)
    console.log('GetDanmuFor CID' + cid)
    let aldanmu = [], lfiltedDanmu = [], ldanmu = []
    let firstdate = 0;
    let ndanmu, ondanmu
    let url = 'https://comment.bilibili.com/' + cid + '.xml'
    let sdanmu = null
    while (sdanmu == null) {
        sdanmu = await xhrGet(url)
    }
    ondanmu = ndanmu = Number(/<maxlimit>(.*?)</.exec(sdanmu)[1])
    if (ndanmu === 8000) {
        ndanmu = parseInt((duration / 24 / 60) * 3000)
    }

    ldanmu = xml2danmu(sdanmu)

    if (ldanmu.length < ondanmu * 0.4) {
        return [ldanmu, ndanmu]
    }
    let isStart = true
    while (true) {
        let sdanmu = null
        if (isStart || ldanmu.length >= Math.min(ondanmu, 5000) * 0.9) {
            url = "https://api.bilibili.com/x/v2/dm/web/history/seg.so?type=1&date="
                + getdate(date) + "&oid=" + cid.toString();
            console.log('ndanmu:', aldanmu.length, '/', lfiltedDanmu.length, getdate(date), url);
            sdanmu = loadProtoDanmu(url)
        }
        let oldanmu = colorFilter(ldanmu)
        aldanmu = mergeDanmu(aldanmu, oldanmu)
        lfiltedDanmu = mergeDanmu(lfiltedDanmu, await danmuFilter(oldanmu))
        if (!isStart && ldanmu.length < Math.min(ondanmu, 5000) * 0.9) {
            return [aldanmu, ondanmu]
        }
        if (!isStart && lfiltedDanmu.length > ndanmu * setting.danmuRate) {
            return [aldanmu, ondanmu]
        }
        ldanmu = await sdanmu
        if (ldanmu.length >= Math.min(ondanmu, 5000) * 0.9) {
            let tfirstdate = getMinDate(ldanmu)
            if (firstdate !== 0 && firstdate - tfirstdate < 86400)
                tfirstdate = firstdate - 86400;
            firstdate = tfirstdate;
            date.setTime(firstdate * 1000);
        }
        if (isStart) {
            isStart = false
        }
    }
}

async function moreHistory(cid, duration) {
    let date = new Date();
    date.setTime(date.getTime() - 86400000)
    console.log('GetDanmuFor CID' + cid)
    let aldanmu = [], ldanmu = []
    let firstdate = 0;
    let ndanmu, ondanmu
    let url = 'https://comment.bilibili.com/' + cid + '.xml'
    let sdanmu = null
    while (sdanmu == null) {
        sdanmu = await xhrGet(url)
    }
    ondanmu = ndanmu = Number(/<maxlimit>(.*?)</.exec(sdanmu)[1])
    if (ndanmu === 8000) {
        ndanmu = parseInt((duration / 24 / 60) * 3000)
    }

    ldanmu = xml2danmu(sdanmu)

    if (ldanmu.length < ondanmu * 0.9) {
        return [ldanmu, ndanmu]
    }
    while (true) {
        let sdanmu
        if (ldanmu.length >= Math.min(ondanmu, 5000) * 0.9) {
            let url = "https://api.bilibili.com/x/v2/dm/web/history/seg.so?type=1&date="
                + getdate(date) + "&oid=" + cid.toString();
            console.log('ndanmu:', aldanmu.length, getdate(date), url);
            sdanmu = loadProtoDanmu(url)
        }
        aldanmu = mergeDanmu(aldanmu, ldanmu)
        if (ldanmu.length < Math.min(ondanmu, 5000) * 0.9 || aldanmu.length > ndanmu * setting.danmuRate) {
            return [aldanmu, ondanmu]
        }
        ldanmu = await sdanmu
        if (ldanmu.length >= Math.min(ondanmu, 5000) * 0.9) {
            let tfirstdate = getMinDate(ldanmu)
            if (firstdate !== 0 && firstdate - tfirstdate < 86400)
                tfirstdate = firstdate - 86400;
            firstdate = tfirstdate;
            date.setTime(firstdate * 1000);
        }
    }
}


async function loadProtoDanmu(url, timeout = null, header = null, retry = 0) {
    const xhr = new XMLHttpRequest();
    try {
        if (timeout !== null) {
            xhr.timeout = timeout
        }

        xhr.open("get", url, true);
        xhr.responseType = 'arraybuffer';

        if (header !== null) {
            for (let key in header) {
                xhr.setRequestHeader(key, header[key])
            }
        }

        xhr.send()

        return new Promise(
            (resolve) => {
                xhr.onreadystatechange = async () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            let lpdanmu = proto_seg.decode(new Uint8Array(xhr.response));
                            resolve(lpdanmu.elems)
                        } else {
                            console.log('XhrError=', retry, '/', xhr)
                            if (retry < 3) {
                                resolve(await loadProtoDanmu(url, timeout, header, retry + 1))
                            } else {
                                resolve(null)
                            }
                        }
                    }
                }
            }
        )
    } catch (e) {
        console.log('XhrError=', retry, '/', xhr)
        if (retry < 3) {
            return (await loadProtoDanmu(url, timeout, header, retry + 1))
        }
    }
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function xhrGet(url, timeout = null, header = null, retry = 0, returnXhr = false) {
    console.log('Get', url)
    const xhr = new XMLHttpRequest();
    try {
        if (timeout !== null) {
            xhr.timeout = timeout
        }
        xhr.open("get", url, true);
        if (header !== null) {
            for (let key in header) {
                xhr.setRequestHeader(key, header[key])
            }
        }
        xhr.send()

        return new Promise(
            (resolve) => {
                xhr.onreadystatechange = async () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            if (returnXhr) {
                                resolve(xhr)
                            } else {
                                resolve(xhr.responseText)
                            }
                        } else {
                            console.log('XhrError=', retry, '/', xhr)
                            if (retry < 1) {
                                resolve(await xhrGet(url, timeout, header, retry + 1), returnXhr)
                            } else {
                                resolve(null)
                            }
                        }
                    }
                }
            }
        )
    } catch (e) {
        console.log('XhrError=', retry, '/', xhr, e)
        if (retry < 1) {
            return (await xhrGet(url, timeout, header, retry + 1))
        }
    }

}


async function xhrPost(option) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", option.url, true);

    if (!option.mode) {
        option.mode = 'json'
    }
    if (option.timeout) {
        xhr.timeout = option.timeout
    }
    if (option.headers) {
        for (let key in option.headers) {
            xhr.setRequestHeader(key, option.headers[key])
        }
    }
    if (!option.retry) {
        option.retry = 0
    }
    if (!option.retryCount) {
        option.retryCount = 0
    }
    if (option.contentType) {
        xhr.setRequestHeader('Content-Type', option.contentType);
    }
    if (option.debug) {
        console.log('Post', option)
    }
    try {
        if (option.mode === 'json') {
            xhr.send(JSON.stringify(option.data))
        } else {
            // 'urlEncode'
            var sdata = "";
            for (var x in option.data) {
                sdata += encodeURIComponent(x) + "=" + encodeURIComponent(option.data[x]) + '&';
            }
            sdata = sdata.slice(0, sdata.length - 1)
            if (option.debug) {
                console.log('PostLength', sdata.length)
            }
            xhr.send(sdata)
        }

        return new Promise(
            (resolve) => {
                xhr.onreadystatechange = async () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            resolve(xhr.responseText)
                        } else {
                            console.log('XhrError=', option.retryCount, '/', xhr)
                            if (option.retryCount < option.retry) {
                                option.retryCount += 1
                                resolve(await xhrPost(option))
                            } else {
                                resolve(null)
                            }
                        }
                    }
                }
            }
        )
    } catch (e) {
        console.log('XhrError=', retry, '/', xhr, e)
        if (option.retryCount < option.retry) {
            option.retryCount += 1
            return xhrPost(option)
        }
    }

}


// function inject_panel(tabid) {
//     setTimeout(function () {
//         chrome.tabs.executeScript(tabid, {
//             file: "injected.js",
//             allFrames: true,
//             runAt: "document_end"
//         })
//     }, 100)
//
// }

function crcFilter() {
    'use strict';
    if (window.setting.uidFilter === -1) {
        return null
    }
    console.log('createTable')
    let crctable = new Uint32Array(window.setting.uidFilter)
    let table = [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274,
            2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666,
            4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042,
            2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242,
            1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451,
            1172266101, 3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731,
            3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275,
            3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059,
            2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444,
            476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704,
            2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092,
            3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856,
            1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909,
            544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873,
            3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997,
            1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377,
            4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526,
            2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558,
            953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462,
            1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366,
            3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591,
            3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151,
            1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071,
            198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567,
            2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896,
            3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836,
            1088359270, 936918000, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552,
            615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724,
            3020668471, 3272380065, 1510334235, 755167117],
        crc32 = function ( /* String */ str,) {
            let crc = -1
            for (let i = 0, iTop = str.length; i < iTop; i++) {
                crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xFF];
            }
            return (crc ^ (-1)) >>> 0;
        };
    for (let i = 0; i < window.setting.uidFilter; i += 1) {
        crctable[i] = crc32(i.toString())
    }
    crctable.sort()
    console.log('tableCreated')
    return function (hash) {
        hash = parseInt(hash, 16)
        let start = 0;
        let end = crctable.length - 1;
        let mid = Math.floor((start + end) / 2);
        while (start <= end) {
            if (hash > crctable[mid]) {
                start = mid + 1;
            } else if (hash < crctable[mid]) {
                end = mid - 1;
            } else {
                return true;
            }
            mid = Math.floor((start + end) / 2);

        }
        return false
    }
}

window.crcFilter = crcFilter()

async function syncFilter() {
    let res = await xhrGet('https://api.bilibili.com/x/dm/filter/user?jsonp=jsonp')
    let lrule = JSON.parse(res).data.rule
    let nrule = {string: [], regexp: [], color: [], user: []}
    for (let rule of lrule) {
        if (rule.filter[0] === '#') {
            if (rule.filter.length === 7) {
                nrule.color.push(parseInt(rule.filter.slice(1), 16))
                continue
            } else if (rule.filter.match('[1234567890]+')) {
                nrule.color.push(parseInt(rule.filter.slice(1)))
                continue
            }
        }
        if (rule.type === 0) {
            nrule.string.push(rule.filter)
        }
        if (rule.type === 1) {
            if (rule.filter[0] === '/' && rule.filter[rule.filter.length - 1] === '/') {
                nrule.regexp.push(rule.filter.slice(1, rule.filter.length - 1))
            } else {
                nrule.regexp.push(rule.filter)
            }
        }
        if (rule.type === 2) {
            nrule.user.push(rule.filter)
        }
    }
    setting.filterRule.push(nrule)
}

let lfilterWorker = []
for (let i = 0; i < 8; i += 1) {
    lfilterWorker.push(new Worker(chrome.runtime.getURL("filterWorker.js")))
}

function colorFilter(ldanmu) {
    let tldanmu = []
    for (let idanmu = 0; idanmu < ldanmu.length; idanmu += 1) {
        let ffilted = false

        for (let ruleGroup of setting.filterRule) {

            if (ruleGroup['color']) {
                for (let irule = 0; irule < ruleGroup['color'].length; irule += 1) {
                    if (ruleGroup['color'][irule] === ldanmu[idanmu].color) {
                        ffilted = true;
                        break
                    }
                }
            }
            if (ffilted) {
                break
            }
        }
        if (!ffilted) {
            tldanmu.push(ldanmu[idanmu])
        }
    }
    return tldanmu
}

async function danmuFilter(ldanmu, filterRule = null) {
    if (filterRule === null) {
        filterRule = setting.filterRule
    }
    if (filterRule.length === 0) {
        return ldanmu
    }
    let uldanmu = [], olength = ldanmu.length

    // if (setting.uidFilter !== null) {
    //     let tldanmu = []
    //     for (let i = 0; i < ldanmu.length; i += 1) {
    //         if (window.crcFilter(ldanmu[i].midHash)) {
    //             uldanmu.push(ldanmu[i])
    //         } else tldanmu.push(ldanmu[i])
    //     }
    //     ldanmu = tldanmu
    // }

    for (let ruleGroup of filterRule) {

        if (!ruleGroup['hasTrigger']) {
            let ndanmu = Math.floor(ldanmu.length / 8)
            let nldanmu = [];
            await new Promise((resolve) => {
                let iprogress = 0
                for (let i = 0; i < 8; i += 1) {
                    let worker = lfilterWorker[i], end
                    if (i !== 7) {
                        end = (i + 1) * ndanmu
                    } else {
                        end = ldanmu.length
                    }
                    worker.postMessage({rule: ruleGroup, ldanmu: ldanmu.slice(i * ndanmu, end),})
                    worker.onmessage = (event) => {
                        // console.log(event.data.ldanmu.length,nldanmu.length)
                        nldanmu = nldanmu.concat(event.data.ldanmu)
                        iprogress += 1
                        if (iprogress === 8) {
                            resolve()
                        }
                    }
                }
            })
            ldanmu = nldanmu;
        } else {
            // let nldanmu = [];
            // let lastTriggeredPos = 0;
            // let triggerCount = 0;
            // let allCount = 0;
            // let ftriggered = false;
            // let tldanmu = [];
            // for (danmu of ldanmu) {
            //     let pos = getDanmuPos(danmu);
            //     let content = getDanmuContent(danmu);
            //     let ffilted = false
            //     for (let rule of ruleGroup['lrule']) {
            //         if (!ftriggered) {
            //             allCount += 1;
            //             if (rule['isTrigger'] === true && danmuMatch(content, rule)) {
            //                 if (lastTriggeredPos === 0) {
            //                     lastTriggeredPos = pos;
            //                 } else {
            //                     if (pos - lastTriggeredPos > 10) {
            //                         nldanmu.concat(tldanmu);
            //                         tldanmu = [];
            //                         triggerCount = 0;
            //                         allCount = 0;
            //                         lastTriggeredPos = 0;
            //                     }
            //                 }
            //                 tldanmu.push(danmu);
            //                 triggerCount += 1;
            //                 if (triggerCount > 20 && triggerCount / allCount > 0.3) {
            //                     let ttldanmu = [];
            //                     for (tdanmu of tldanmu) {
            //                         pos = getDanmuPos(tdanmu);
            //                         content = getDanmuContent(tdanmu);
            //                         let ffilted = false;
            //                         for (rule of ruleGroup['lrule']) {
            //                             if (danmuMatch(content, rule)) {
            //                                 ffilted = true;
            //                                 break
            //                             }
            //                         }
            //                         if (!ffilted) {
            //                             ttldanmu.push(tdanmu)
            //                         }
            //
            //                     }
            //                     tldanmu = [];
            //                     ftriggered = true
            //                 }
            //             }
            //         } else {
            //             if (pos - lastTriggeredPos > 10) {
            //                 ftriggered = false;
            //             }
            //             for (rule of ruleGroup['lrule']) {
            //                 if (danmuMatch(content, rule)) {
            //                     ffilted = true;
            //                     break
            //                 }
            //             }
            //             if (!ffilted) {
            //                 nldanmu.push(danmu)
            //             }
            //         }
            //
            //     }
            // }
            // ldanmu = nldanmu;
        }
    }
    // if (window.setting.uidFilter !== null) {
    //     let tldanmu = []
    //     for (let danmu of ldanmu) {
    //         if (window.crcFilter(getDanmuUserhash(danmu))) {
    //             tldanmu.push(danmu)
    //         }
    //     }
    //     ldanmu = tldanmu
    // }
    ldanmu = ldanmu.concat(uldanmu)
    // ldanmu=uldanmu
    console.log('Filter:', olength, '=>', ldanmu.length)

    return ldanmu
}

async function localServer(order, argv) {
    let ws = new WebSocket("ws://localhost:56789");

    ws.onopen = function (evt) {
        ws.send(htmlEscape(order + ':' + argv))
    }
    let res = await new Promise((resolve) => {
        ws.onmessage = function (evt) {
            resolve(evt.data);
        }
    })
    try {
        if (order !== 'read' || res.slice(0, 7) === '[failed') {
            res = JSON.parse(res)
        }
    } catch (e) {

    }

    return res
}

let hasProxy = false

function genNicoAPIBody(lthread, duration, isOwnerThreadReverse = false) {
    let body = [{
        "ping": {
            "content": "rs:0"
        }
    },
        {
            "ping": {
                "content": "ps:0"
            }
        },]
    let ipart = 0
    let minute = (Math.floor((duration - 1) / 60) + 1).toString()
    let isOwnerThread = lthread[0]['isOwnerThread']
    if (isOwnerThreadReverse) {
        isOwnerThread = !isOwnerThread
    }
    for (let i = 0; i < lthread.length; i++) {
        let part = lthread[i]
        if (!part['isActive']) {
            continue
        }
        let thread = {
            "thread": part['id'].toString(),
            "version": "20090904",
            "fork": part["fork"],
            "language": 0,
            "user_id": "",
            "with_global": 1,
            "scores": 1,
            "nicoru": 3,
        }
        if (isOwnerThread && ipart === 0) {
            thread['res_from'] = -1000
            thread['version'] = '20061206'
        }
        body.push({'thread': thread})
        body.push({
            "ping": {
                "content": 'pf:' + ipart.toString()
            }
        })
        body.push({
            "ping": {
                "content": 'ps:' + (ipart + 1).toString()
            }
        })
        ipart += 1
        if (ipart > 2 || part['isLeafRequired']) {
            body.push({
                "thread_leaves": {
                    "thread": part['id'].toString(),
                    "fork": part["fork"],
                    "language": 0,
                    "user_id": "",
                    "content": "0-" + minute.toString() + ":100,1000,nicoru:100",
                    "scores": 1,
                    "nicoru": 3,
                }
            })
            body.push({
                "ping": {
                    "content": 'pf:' + ipart.toString()
                }
            })
            body.push({
                "ping": {
                    "content": 'ps:' + (ipart + 1).toString()
                }
            })
            ipart += 1
        }
    }
    body[body.length - 1] = {
        "ping": {
            "content": "rf:0"
        }
    }
    return body
}

function parseNicoResponse(sdanmu, startIndex = 0) {
    let ldanmu
    let dColor = {
        'red': 16711680, 'pink': 16744576, 'orange': 16763904, 'yellow': 16776960, 'green': 65280, 'cyan': 65535,
        'blue': 255, 'purple': 12583167, 'black': 0, 'niconicowhite': 13421721, 'white2': 13421721,
        'truered': 13369395, 'red2': 13369395, 'pink2': 16724940, 'passionorange': 16737792, 'orange2': 16737792,
        'madyellow': 10066176, 'yellow2': 10066176, 'elementalgreen': 52326, 'green2': 52326, 'cyan2': 52428,
        'marineblue': 3381759, 'blue2': 3381759, 'nobleviolet': 6697932, 'purple2': 6697932, 'black2': 6710886
    }
    if (sdanmu[0] === '<') {
        ldanmu = sdanmu.split('</d><d p=');

        if (ldanmu.length === 1) {
            return []
        }
        let tdanmu = ldanmu[0];
        ldanmu[0] = ldanmu[0].slice(5)
        tdanmu = ldanmu[ldanmu.length - 1];
        ldanmu[ldanmu.length - 1] = tdanmu.slice(0, tdanmu.length - 4);
        for (let i = 0; i < ldanmu.length; i++) {
            let danmu = ldanmu[i]
            let pos = danmu.indexOf('>')
            let argv = danmu.substring(1, pos - 1).split(',')
            ldanmu[i] = {
                color: Number(argv[3]),
                content: xmlunEscape(danmu.slice(pos + 1)),
                ctime: Number(argv[4]),
                fontsize: Number(argv[2]),
                id: Number(argv[5]),
                idStr: argv[5],
                midHash: 'niconico',
                mode: Number(argv[1]),
                progress: Math.round(Number(argv[0]) * 1000),
                weight: 10
            }
        }
        return ldanmu
    } else {
        ldanmu = sdanmu.split('\n')
        for (let i = 0; i < ldanmu.length; i++) {
            let danmu = ldanmu[i]
            let pos = danmu.indexOf('""')
            let argv = danmu.slice(0, pos).split(',')
            let content = JSON.parse('"' + danmu.slice(pos + 2) + '"')
            let [progress, ctime, lcommand] = argv
            let danmuType = 1
            let fontSize = 25
            let color = 0xffffff
            if (len(lcommand) > 0) {
                lcommand = lcommand.slice(1, len(lcommand) - 1).split(',')
                for (let command of lcommand) {
                    if (command === 'ue')
                        danmuType = 5
                    else if (command === 'shita')
                        danmuType = 4
                    else if (command === 'big')
                        fontSize = 30
                    else if (command === 'small')
                        fontSize = 20
                    else if (lcolorCommand.indexOf(command) !== -1)
                        color = lcolor[lcolorCommand.indexOf(command)]
                    else if (command[0] === '#')
                        try {
                            color = parseInt(command.slice(1), 16)
                        } catch (e) {
                        }
                    else if (command === 'naka' || command === 'white' || command === '184' || command === 'medium'
                        || command === 'middle' || command === 'docomo' || command.startsWith('device')) {
                    } else {
                        console.log('Unknown mail', command)
                    }
                }
            }
            ldanmu[i] = {
                color: color,
                content: content,
                ctime: ctime,
                fontsize: fontSize,
                id: i + startIndex,
                idStr: str(i + startIndex),
                midHash: 'niconico',
                mode: danmuType,
                progress: progress * 10,
                weight: 10
            }

        }
    }

}

async function nicoDanmu(nicoid) {
    if (hasProxy === false || nicoid.startsWith('so')) {
        console.log('Found NicoID:' + nicoid)
        let nicodanmu = await xhrGet('http://152.32.146.234:800/nico/?nicoid=' + nicoid)
        if (nicodanmu === null) {
            return []
        }
        let ldanmu = parseNicoResponse(nicodanmu)
        if (setting.translateNicoComment) {
            ldanmu = await translateNico(ldanmu)
        }
        if (setting.replaceKatakana) {
            ldanmu = replaceKatakana((ldanmu))
        }
        console.log('ndanmu:' + ldanmu.length + ' from niconico')
        return ldanmu
    } else {
        let url = 'https://comment.bilibili.com/70870.xml'
        url = 'https://www.nicovideo.jp/watch/' + nicoid
        let page = await xhrGet(url)
        let apiData = /<div id="js-initial-watch-data".*?hidden><\/div>/.exec(page)
        apiData = apiData[0]
        let htmlObject = document.createElement('div');
        htmlObject.innerHTML = apiData;
        htmlObject = htmlObject.firstChild;
        let info = JSON.parse(htmlObject.getAttribute('data-api-data'))
        let duration = info['video']['duration']
        let lthread
        if (info.hasOwnProperty('commentComposite')) {
            lthread = info['commentComposite']['threads']
        } else {
            lthread = info['comment']['threads']
        }
        let body = genNicoAPIBody(lthread, duration)
        let comment = await xhrPost({
            url: 'http://nmsg.nicovideo.jp/api.json/',
            data: body
        })
        comment = JSON.parse(comment)

        let res = []
        for (let i = 0; i < comment.length; i++) {
            let c = comment[i]
            if (c.hasOwnProperty('chat')) {
                res.push(c['chat'])
            }
        }
        if (len(res) === 0) {
            body = genNicoAPIBody(lthread, duration, true)
            comment = await xhrPost({
                url: 'http://nmsg.nicovideo.jp/api.json/',
                data: body
            })
            res = []
            for (let i = 0; i < comment.length; i++) {
                let c = comment[i]
                if (c.hasOwnProperty('chat')) {
                    res.push(c['chat'])
                }
            }
        }
        let ldanmu = []
        let lcolorCommand =
            ['red', 'pink', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'black',
                'niconicowhite', 'white2', 'truered', 'red2', 'pink2', 'passionorange', 'orange2',
                'madyellow', 'yellow2', 'elementalgreen', 'green2', 'cyan2', 'marineblue', 'blue2',
                'nobleviolet', 'purple2', 'black2']
        let lcolor = [0xFF0000, 0xFF8080, 0xFFCC00, 0xFFFF00, 0x00FF00, 0x00FFFF, 0x0000FF, 0xC000FF, 0x000000,
            0xCCCC99, 0xCCCC99, 0xCC0033, 0xCC0033, 0xFF33CC, 0xFF6600, 0xFF6600,
            0x999900, 0x999900, 0x00CC66, 0x00CC66, 0x00CCCC, 0x3399FF, 0x3399FF,
            0x6633CC, 0x6633CC, 0x666666]
        let noPool = []
        for (let i = 0; i < res.length; i++) {
            let danmu = res[i]
            if (noPool.indexOf(danmu['no']) === -1) {
                noPool.push(danmu['no'])
            } else {
                continue
            }
            if (danmu.hasOwnProperty('deleted'))
                continue
            let danmuType = 1
            let fontSize = 25
            let color = 0xffffff
            if (danmu.hasOwnProperty('mail')) {
                let lcommand = danmu['mail'].split(' ')
                for (let command of lcommand) {
                    if (command === 'ue')
                        danmuType = 5
                    else if (command === 'shita')
                        danmuType = 4
                    else if (command === 'big')
                        fontSize = 30
                    else if (command === 'small')
                        fontSize = 20
                    else if (lcolorCommand.indexOf(command) !== -1)
                        color = lcolor[lcolorCommand.indexOf(command)]
                    else if (command[0] === '#')
                        color = parseInt(command.slice(1), 16)
                    else if (command === 'naka' || command === 'white' || command === '184' || command === 'medium'
                        || command === 'middle' || command === 'docomo' || command.startsWith('device')) {
                    } else {
                        console.log('Unknown mail', command)
                    }
                }
            }
            ldanmu.push({
                color: color,
                content: danmu['content'],
                ctime: danmu['date'],
                fontsize: fontSize,
                id: Number(danmu['no']),
                idStr: str(danmu['no']),
                midHash: 'niconico',
                mode: danmuType,
                progress: danmu["vpos"] * 10,
                weight: 10
            })
        }
        if (window.setting.translateNicoComment) {
            ldanmu = await translateNico(ldanmu)
        }
        return ldanmu
    }
}

var MD5 = function (string) {

    function RotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function AddUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }

    function F(x, y, z) {
        return (x & y) | ((~x) & z);
    }

    function G(x, y, z) {
        return (x & z) | (y & (~z));
    }

    function H(x, y, z) {
        return (x ^ y ^ z);
    }

    function I(x, y, z) {
        return (y ^ (x | (~z)));
    }

    function FF(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function GG(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function HH(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function II(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };

    function WordToHex(lValue) {
        var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    };

    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    };

    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    string = Utf8Encode(string);

    x = ConvertToWordArray(string);

    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = AddUnsigned(a, AA);
        b = AddUnsigned(b, BB);
        c = AddUnsigned(c, CC);
        d = AddUnsigned(d, DD);
    }

    var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

    return temp.toLowerCase();
}

function findAll(reg, text) {
    return Array.from(text.matchAll(reg))
}

async function translateBaidu(query) {

    let appid = '20190602000304141';
    let key = 'BHZLmfgU_oxXsyDZ2SEi';
    let salt = '000000';
// 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    let from = 'auto';
    let to = 'zh';
    let str1 = appid + query + salt + key;
    let sign = MD5(str1);
    let data = {
        q: query,
        appid: appid,
        salt: salt,
        from: from,
        to: to,
        sign: sign
    }
    let result = await xhrPost(
        {
            url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
            data: data,
            mode: 'urlEncode',
            contentType: 'application/x-www-form-urlencoded'
        }
        , data, 'urlEncode')
    result = JSON.parse(result)
    if (!result.hasOwnProperty('trans_result')) {
        if (result['error_msg'] === "Invalid Sign") {
            let lemoji = eval("query.match(/\\p{Emoji}+/gu)")
            for (let e of lemoji) {
                if (isNaN(parseInt(e))) {
                    query = query.replace(e, '')
                }
            }
            await sleep(1000)
            return translateBaidu(query)
        } else {
            console.log('translate failed', result)
        }
    }
    return result
}


function katakana(danmu) {
    let ddkata = {
        'ウィ': 'wi', 'ウェ': 'we', 'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo', 'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
        'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho', 'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo', 'チャ': 'cha', 'チュ': 'chu',
        'チョ': 'cho', 'ヂャ': 'dha', 'ヂュ': 'dhu', 'ヂョ': 'dho', 'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo', 'ヒャ': 'hya',
        'ヒュ': 'hyu', 'ヒョ': 'hyo', 'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo', 'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',
        'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo', 'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo', 'ヴャ': 'vya', 'ヴュ': 'vyu',
        'ヴョ': 'vyo',
    }
    let dskata = {
        'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o', 'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke',
        'コ': 'ko', 'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so', 'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu',
        'テ': 'te', 'ト': 'to', 'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no', 'ハ': 'ha', 'ヒ': 'hi',
        'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho', 'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo', 'ヤ': 'ya',
        'ユ': 'yu', 'ェ': 'e', 'ヨ': 'yo', 'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro', 'ワ': 'wa',
        'ヲ': 'wo', 'ン': 'n', 'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go', 'ザ': 'za', 'ジ': 'ji',
        'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo', 'ダ': 'da', 'ヂ': 'dji', 'ヅ': 'dzu', 'デ': 'de', 'ド': 'do', 'バ': 'ba',
        'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo', 'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po'
    }
    let tdanmu = []
    let ichar = -1
    while (ichar < len(danmu) - 1) {
        ichar += 1
        let char = danmu[ichar]
        let word = danmu.slice(ichar, ichar + 2)
        if (ddkata.hasOwnProperty(word)) {
            tdanmu.push(ddkata[word])
            ichar += 1
            continue
        }
        if (char === 'っ' || char === 'ッ') {
            try {
                let nextChar = danmu[ichar + 1]
                if (dskata.hasOwnProperty(nextChar))
                    tdanmu.append(nextChar[word][0] + nextChar[word])
                ichar += 1
                continue
            } catch (e) {
            }
        }
        if (dskata.hasOwnProperty(char)) {
            tdanmu.push(dskata[char])
            continue
        }
        tdanmu.push(char)
    }
    return tdanmu.join('')

}

function replaceKatakana(ldanmu) {
    for (let idanmu = 0; idanmu < ldanmu.length; idanmu++) {
        ldanmu[idanmu].content = katakana(ldanmu[idanmu].content)
    }
    return ldanmu
}

async function translateNico(ldanmu) {
    let ltrans = []
    let lid = []
    for (let idanmu = 0; idanmu < ldanmu.length; idanmu++) {
        let danmu = ldanmu[idanmu]
        let content = danmu.content
        if (content.indexOf('\n') !== -1) continue
        if (len(content) < 7) continue
        danmu.content = danmu.content.replace(/(.{1,3})\1{2,}$/, '$1$1')
        if (len(content) > 7) {
            ltrans.push(content)
            lid.push(danmu.id)
        } else {
            ldanmu[idanmu].content = katakana(content)
        }
    }
    let query = '\n'.join(ltrans)
    let lresult = []
    while (len(query) > 2000) {
        let pos = query.lastIndexOf('\n', 2000)
        let part = query.slice(0, pos)
        let res = await translateBaidu(part)
        let t = await sleep(1000)
        window.tempTran = part
        for (let i = 0; i < res['trans_result'].length; i++) {
            lresult.push(res['trans_result'][i]['dst'])
        }
        query = query.slice(pos + 1)
    }
    if (len(query) !== 0) {
        let t = await sleep(1000)
        let res = await translateBaidu(query)
        for (let i = 0; i < res['trans_result'].length; i++) {
            lresult.push(res['trans_result'][i]['dst'])
        }
    }
    let tlres = []
    for (let res of lresult) {
        if (res.indexOf('\n') !== -1) {
            tlres.concat(res.split('\n'))
        } else {
            tlres.push(res)
        }
    }
    ltrans = tlres
    let itrans = 0
    for (let idanmu = 0; idanmu < ldanmu.length; idanmu++) {
        let danmu = ldanmu[idanmu]

        if (danmu.id === lid[itrans]) {
            danmu.content = ltrans[itrans]
            itrans += 1
            // if (itrans > len(lid) - 1) {
            //     if(! ltrans[itrans]){
            //         throw 'transNumMismatchError'
            //     }
            //     break
            // }
        }
    }

    // console.log(ldanmu)
    return ldanmu
}


async function youtubeDanmu(youtubeUrl) {

    let sdanmu = await xhrGet('https://api.dmooji.tv/api/v3/comments/' + youtubeUrl + '?user_id=undefined', null,
        {
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7',
            'content-type': 'application/json; charset=utf-8',
        })
    if (sdanmu === null) {
        console.log('dmooji failed')
        return []
    }
    let aldanmu = []
    let tldanmu = JSON.parse(sdanmu)['data']['comments']
    let date = new Date();
    for (ddanmu of tldanmu) {
        if (!/(\d:\d)/.exec(htmlEscape(ddanmu['text']))) {
            continue
        }
        let largv = [ddanmu['stime'] / 1000, ddanmu['mode'], 25, ddanmu['color'], date.getTime(), 0, 'youtube', ddanmu['comment_id']]
        let danmu = '"' + largv.join(',') + '">' + htmlEscape(ddanmu['text'])
        aldanmu.push(danmu)
    }
    console.log('ndanmu:' + aldanmu.length + ' from youtube')
    return aldanmu
}

async function youtubeSubtitle(request) {
    let aid = /aid=(\d*)/.exec(request.url)
    let viewInfo = xhrGet(+'&cid=' + request.cid)
    viewInfo = JSON.parse(viewInfo)
    // if()
}


function corsManipulate() {
    function getHeaderIndex(headerArray, newHeader) {

        for (let i = 0, len = headerArray.length; i < len; i++) {
            let currentHeader = headerArray[i];
            if (currentHeader.hasOwnProperty('name') && currentHeader.name == newHeader.name) {
                return i;
            }
        }

        return -1;
    }

    function mergeNewHeaders(originalHeaders, newHeaders) {
        //copy the headers for our own usage
        let mergedHeaders = originalHeaders.slice();
        for (let i = 0, len = newHeaders.length; i < len; i++) {
            let index = getHeaderIndex(mergedHeaders, newHeaders[i]);

            //if a matching header is defined, replace it
            //if not, add the new header to the end
            if (index > -1) {
                mergedHeaders[index] = newHeaders[i];
            } else {
                mergedHeaders.push(newHeaders[i]);
            }
        }

        return mergedHeaders;
    }

    function matchUrlToHeaders(url, headersPerUrl) {
        for (let key in headersPerUrl) {
            //this match is expecting that the user will specify URL domain
            //so key==http://www.foo.com && url==http://www.foo.com/?x=bar&whatever=12
            //maybe support regex in the future
            if (url.indexOf(key) > -1) {
                return headersPerUrl[key];
            }
        }
        return null;
    }

    /**
     * Responds to Chrome's onHeadersReceived event and injects all headers defined for the given URL
     * @param info {Object} Contains the request info
     * @see http://code.google.com/chrome/extensions/webRequest.html#event-onHeadersReceived
     */
    function onHeadersReceivedHandler(info) {
        let desiredHeaders = matchUrlToHeaders(info.url, headersPerUrl);

        if (!desiredHeaders)
            return {};

        return {responseHeaders: mergeNewHeaders(info.responseHeaders, desiredHeaders)};

    }

    let settings = [
        {URL: 'http://ani.gamer.com.tw/*', headers: [{name: 'Access-Control-Allow-Origin', value: '*'}]},
        {URL: 'https://ani.gamer.com.tw/*', headers: [{name: 'Access-Control-Allow-Origin', value: '*'}]},
        {URL: 'https://textuploader.com/*', headers: [{name: 'Access-Control-Allow-Origin', value: '*'}]}
    ]
    let headersPerUrl = {};
    let urlsToAlter = [];

    if (settings) {
        for (let l = settings.length, i = 0; i < l; i++) {
            //push each URL we wish to watch for into the array
            urlsToAlter.push(settings[i].URL);

            //use the URL as a key in the dictionary to lookup the specific headers to manipulate for that URL
            headersPerUrl[settings[i].URL.replace(/\*/g, '')] = settings[i].headers;
        }
    }

    chrome.webRequest.onHeadersReceived.addListener(
        onHeadersReceivedHandler,
        // filters
        {
            urls: urlsToAlter
        },
        // extraInfoSpec
        ["blocking", "responseHeaders"]
    );

    chrome.webRequest.onErrorOccurred.addListener(
        function (info) {
            console.log('ForceCORS was unable to modify headers for: ' + info.url + ' - ' + info.error)
        },
        {
            urls: urlsToAlter
        }
    );

    chrome.webRequest.handlerBehaviorChanged();
}

corsManipulate()


async function dmFengBangumi(sn) {
    let data = await xhrGet('https://ani.gamer.com.tw/animeVideo.php?sn=' + sn)
    let lsn = data.indexOf('class="season"')
    lsn = data.slice(lsn, data.indexOf('/section', lsn))
    lsn = lsn.match(/sn=(\d+)/g)
    for (let i = 0; i < lsn.length; i++) {
        lsn[i] = parseInt(lsn[i].slice(3))
    }
    return lsn
}

async function dmFengDanmaku(sn, startIndex) {
    let sdanmu = await xhrPost({
        mode: 'urlEncode',
        data: {'sn': parseInt(sn)},
        headers: {'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        url: 'https://ani.gamer.com.tw/ajax/danmuGet.php'
    })
    let sizeDict = {
        1: 25,
        2: 36,
        0: 20
    }
    let positionDict = {
        0: 1,
        1: 4,
        2: 5
    }
    let ldanmu = []
    let count = startIndex
    for (danmu of JSON.parse(sdanmu)) {
        if (!danmu["text"]) continue
        count += 1
        ldanmu.append(
            {
                color: parseInt(danmu['color'].slice(1), 16),
                content: xmlunEscape(danmu["text"]),
                ctime: 0,
                fontsize: sizeDict[danmu["size"]],
                id: count,
                idStr: count.toString(),
                midHash: 'bahamute',
                mode: positionDict[danmu["position"]],
                progress: Math.round(danmu["time"] * 100),
                weight: 10
            }
        )
    }
    return ldanmu
}

let outsideFliter = [{
    regexp: [
        JSON.parse('"\u8fbd\u5b81|\u5409\u6797|\u9ed1\u9f99\u6c5f|\u6cb3\u5317|\u5c71\u897f|\u9655\u897f|\u7518\u8083|\u9752\u6d77|\u5c71\u4e1c|\u5b89\u5fbd|\u6c5f\u82cf|\u6d59\u6c5f|\u6cb3\u5357|\u6e56\u5317|\u6e56\u5357|\u6c5f\u897f|\u53f0\u6e7e|\u798f\u5efa|\u4e91\u5357|\u6d77\u5357|\u56db\u5ddd|\u8d35\u5dde|\u5e7f\u4e1c|\u5185\u8499\u53e4|\u65b0\u7586|\u5e7f\u897f|\u897f\u85cf|\u5b81\u590f|\u5317\u4eac|\u4e0a\u6d77|\u5929\u6d25|\u91cd\u5e86|\u9999\u6e2f|\u6fb3\u95e8|\u6df1\u5733|\u5e7f\u5dde|\u6210\u90fd|\u907c\u5be7|\u5409\u6797|\u9ed1\u9f8d\u6c5f|\u6cb3\u5317|\u5c71\u897f|\u965c\u897f|\u7518\u8085|\u9752\u6d77|\u5c71\u6771|\u5b89\u5fbd|\u6c5f\u8607|\u6d59\u6c5f|\u6cb3\u5357|\u6e56\u5317|\u6e56\u5357|\u6c5f\u897f|\u81fa\u7063|\u798f\u5efa|\u96f2\u5357|\u6d77\u5357|\u56db\u5ddd|\u8cb4\u5dde|\u5ee3\u6771|\u5167\u8499\u53e4|\u65b0\u7586|\u5ee3\u897f|\u897f\u85cf|\u5be7\u590f|\u5317\u4eac|\u4e0a\u6d77|\u5929\u6d25|\u91cd\u6176|\u9999\u6e2f|\u6fb3\u9580|\u6df1\u5733|\u5ee3\u5dde|\u6210\u90fd|\u9080\u8bf7\u7801|\u667a\u969c|\u98ce\u4e91|fengyun|\\\\.inf|KK44K|\u8d64\u58c1|\u54c8\u65e5|1819se|\u652f\u4ed8\u5b9d|alipay|\u517c\u804c|\u6700\u597d\u7684|\u8fd1\u5e73|\u4f1a\u6240|\u65e5\u72d7|\u65e5\u8d3c|\u9ed1\u6728\u8033|ktv08|\\\\.com|shabi|shabi|SHABI|ShaBi|nimabi|NIMABI|nima|CNM|CTM|caotama|CAOTAMA|\u64cd\u4ed6\u5988|UPshabi|UP\u50bb\u903c|\u5783\u573e|laji|\u4ec0\u4e48\u73a9\u610f|shabi|TMD|\u5403\u5c4e|ed2k|QQ\u7fa4|\u6263\u6263\u7fa4|\u798f\u5229\u7f51|\\\\.tk|\u9a6c\u8001\u5e08|Q\u7fa4|\u50bb\u903c|\u5fcd\u8005\u5802|\u4e1c\u4eac\u5965|\u50bbb|\u59dc\u6c0f\u96c6\u56e2|\u062f\u0631\u062f\u0634|http|\u53f0\u7063|\u81fa\u7063|\u0627\u0644\u064a\u0648\u0645!|\u0627\u0635\u062f\u0642\u0627\u0621|\u0633\u062c\u0644|\u0644\u0643\u062b\u064a\u0631|\u0643|\u50bb\u903c|\u50bbB|\u516b\u4e5d|\u516d\u56db|\u64cd\u4f60\u5988|\u767e\u6770|\u65e5\u672c\u662f\u4e2d\u56fd|\u5171\u4ea7\u515a|\u5171\u532a|\u652f\u90a3|\u53f0\u5df4\u5b50|sb|\u5e72\u4f60|\u9e21\u5df4|\u808f|\u6dd8\u5b9d|uid|\u529e\u8bc1|\u5ea6\u641c|\u5c3c\u739b|tao|\\\\.com|\\\\.cc|\\\\.us|\u6cd5\u8f6e|\u8349\u69b4|\u6700\u65b0\u5730\u5740|\\\\.tk|2b|2B|elove|\u0e2a\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47|\u9080\u8acb\u78bc|\u667a\u969c|\u98a8\u96f2|fengyun|\\\\.inf|KK44K|\u8d64\u58c1|\u54c8\u65e5|1819se|\u652f\u4ed8\u5bf6|alipay|\u517c\u8077|\u6700\u597d\u7684|\u8fd1\u5e73|\u6703\u6240|\u65e5\u72d7|\u65e5\u8cca|\u9ed1\u6728\u8033|ktv08|\\\\.com|shabi|shabi|SHABI|ShaBi|nimabi|NIMABI|nima|CNM|CTM|caotama|CAOTAMA|\u64cd\u4ed6\u5abd|UPshabi|UP\u50bb\u903c|\u5783\u573e|laji|\u4ec0\u9ebd\u73a9\u610f|shabi|TMD|\u5403\u5c4e|ed2k|QQ\u7fa4|\u6263\u6263\u7fa4|\u798f\u5229\u7db2|\\\\.tk|\u99ac\u8001\u5e2b|Q\u7fa4|\u50bb\u903c|\u5fcd\u8005\u5802|\u6771\u4eac\u5967|\u50bbb|\u59dc\u6c0f\u96c6\u5718|\u062f\u0631\u062f\u0634|http|\u81fa\u7063|\u81fa\u7063|\u0627\u0644\u064a\u0648\u0645!|\u0627\u0635\u062f\u0642\u0627\u0621|\u0633\u062c\u0644|\u0644\u0643\u062b\u064a\u0631|\u0643|\u50bb\u903c|\u50bbB|\u516b\u4e5d|\u516d\u56db|\u64cd\u4f60\u5abd|\u767e\u5091|\u65e5\u672c\u662f\u4e2d\u570b|\u5171\u7522\u9ee8|\u5171\u532a|\u652f\u90a3|\u81fa\u5df4\u5b50|sb|\u5e79\u4f60|\u96de\u5df4|\u808f|\u6dd8\u5bf6|uid|\u8fa6\u8b49|\u5ea6\u641c|\u5c3c\u746a|tao|\\\\.com|\\\\.cc|\\\\.us|\u6cd5\u8f2a|\u8349\u69b4|\u6700\u65b0\u5730\u5740|\\\\.tk|2b|2B|elove|\u0e2a\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47\u0e47|\u4e60\u8fd1\u5e73|\u5e73\u8fd1\u4e60|xjp|\u4e60\u592a\u5b50|\u4e60\u660e\u6cfd|\u8001\u4e60|\u6e29\u5bb6\u5b9d|\u6e29\u52a0\u5b9d|\u6e29x|\u6e29jia\u5b9d|\u6e29\u5b9d\u5b9d|\u6e29\u52a0\u9971|\u6e29\u52a0\u4fdd|\u5f20\u57f9\u8389|\u6e29\u4e91\u677e|\u6e29\u5982\u6625|\u6e29jb|\u80e1\u6e29|\u80e1x|\u80e1jt|\u80e1boss|\u80e1\u603b|\u80e1\u738b\u516b|hujintao|\u80e1jintao|\u80e1j\u6d9b|\u80e1\u60ca\u6d9b|\u80e1\u666f\u6d9b|\u80e1\u7d27\u638f|\u6e56\u7d27\u638f|\u80e1\u7d27\u5957|\u9526\u6d9b|hjt|\u80e1\u6d3e|\u80e1\u4e3b\u5e2d|\u5218\u6c38\u6e05|\u80e1\u6d77\u5cf0|\u80e1\u6d77\u6e05|\u6c5f\u6cfd\u6c11|\u6c11\u6cfd\u6c5f|\u6c5f\u80e1|\u6c5f\u54e5|\u6c5f\u4e3b\u5e2d|\u6c5f\u4e66\u8bb0|\u6c5f\u6d59\u95fd|\u6c5f\u6ca2\u6c11|\u6c5f\u6d59\u6c11|\u62e9\u6c11|\u5219\u6c11|\u8333\u6cfd\u6c11|zemin|ze\u6c11|\u8001\u6c5f|\u8001j|\u6c5fcore|\u6c5fx|\u6c5f\u6d3e|\u6c5fzm|jzm|\u6c5f\u620f\u5b50|\u6c5f\u86e4\u87c6|\u6c5f\u67d0\u67d0|\u6c5f\u8d3c|\u6c5f\u732a|\u6c5f\u6c0f\u96c6\u56e2|\u6c5f\u7ef5\u6052|\u6c5f\u7ef5\u5eb7|\u738b\u51b6\u576a|\u6c5f\u6cfd\u6167|\u9093\u5c0f\u5e73|\u5e73\u5c0f\u9093|xiao\u5e73|\u9093xp|\u9093\u6653\u5e73|\u9093\u6734\u65b9|\u9093\u6995|\u9093\u8d28\u65b9|\u6bdb\u6cfd\u4e1c|\u732b\u6cfd\u4e1c|\u732b\u5219\u4e1c|\u732b\u8d3c\u6d1e|\u6bdbzd|\u6bdbzx|z\u4e1c|ze\u4e1c|\u6cfdd|zedong|\u6bdb\u592a\u7956|\u6bdb\u76f8|\u4e3b\u5e2d\u753b\u50cf|\u6539\u9769\u5386\u7a0b|\u6731\u9555\u57fa|\u6731\u5bb9\u57fa|\u6731\u9555\u9e21|\u6731\u5bb9\u9e21|\u6731\u4e91\u6765|\u674e\u9e4f|\u674epeng|\u91cc\u9e4f|\u674e\u6708\u6708\u9e1f|\u674e\u5c0f\u9e4f|\u674e\u5c0f\u7433|\u534e\u4e3b\u5e2d|\u534e\u56fd|\u56fd\u950b|\u56fd\u5cf0|\u950b\u540c\u5fd7|\u767d\u6625\u793c|\u8584\u7199\u6765|\u8584\u4e00\u6ce2|\u8521\u8d74\u671d|\u8521\u6b66|\u66f9\u521a\u5ddd|\u5e38\u4e07\u5168|\u9648\u70b3\u5fb7|\u9648\u5fb7\u94ed|\u9648\u5efa\u56fd|\u9648\u826f\u5b87|\u9648\u7ecd\u57fa|\u9648\u540c\u6d77|\u9648\u81f3\u7acb|\u6234\u79c9\u56fd|\u4e01\u4e00\u5e73|\u8463\u5efa\u534e|\u675c\u5fb7\u5370|\u675c\u4e16\u6210|\u5085\u9510|\u90ed\u4f2f\u96c4|\u90ed\u91d1\u9f99|\u8d3a\u56fd\u5f3a|\u80e1\u6625\u534e|\u8000\u90a6|\u534e\u5efa\u654f|\u9ec4\u534e\u534e|\u9ec4\u4e3d\u6ee1|\u9ec4\u5174\u56fd|\u56de\u826f\u7389|\u8d3e\u5e86\u6797|\u8d3e\u5ef7\u5b89|\u9756\u5fd7\u8fdc|\u674e\u957f\u6625|\u674e\u6625\u57ce|\u674e\u5efa\u56fd|\u674e\u514b\u5f3a|\u674e\u5c9a\u6e05|\u674e\u6c9b\u7476|\u674e\u8363\u878d|\u674e\u745e\u73af|\u674e\u94c1\u6620|\u674e\u5148\u5ff5|\u674e\u5b66\u4e3e|\u674e\u6e90\u6f6e|\u6817\u667a|\u6881\u5149\u70c8|\u5ed6\u9521\u9f99|\u6797\u6811\u68ee|\u6797\u708e\u5fd7|\u6797\u5de6\u9e23|\u4ee4\u8ba1\u5212|\u67f3\u658c\u6770|\u5218\u5947\u8446|\u5218\u5c11\u5947|\u5218\u5ef6\u4e1c|\u5218\u4e91\u5c71|\u5218\u5fd7\u519b|\u9f99\u65b0\u6c11|\u8def\u752c\u7965|\u7f57\u7bad|\u5415\u7956\u5584|\u9a6c\u98da|\u9a6c\u607a|\u5b5f\u5efa\u67f1|\u6b27\u5e7f\u6e90|\u5f3a\u536b|\u6c88\u8dc3\u8dc3|\u5b8b\u5e73\u987a|\u7c9f\u620e\u751f|\u82cf\u6811\u6797|\u5b59\u5bb6\u6b63|\u94c1\u51dd|\u5c60\u5149\u7ecd|\u738b\u4e1c\u660e|\u6c6a\u4e1c\u5174|\u738b\u9e3f\u4e3e|\u738b\u6caa\u5b81|\u738b\u4e50\u6cc9|\u738b\u6d1b\u6797|\u738b\u5c90\u5c71|\u738b\u80dc\u4fca|\u738b\u592a\u534e|\u738b\u5b66\u519b|\u738b\u5146\u56fd|\u738b\u632f\u534e|\u5434\u90a6\u56fd|\u5434\u5b9a\u5bcc|\u5434\u5b98\u6b63|\u65e0\u5b98\u6b63|\u5434\u80dc\u5229|\u5434\u4eea|\u595a\u56fd\u534e|\u4e60\u4ef2\u52cb|\u5f90\u624d\u539a|\u8bb8\u5176\u4eae|\u5f90\u7ecd\u53f2|\u6768\u6d01\u7bea|\u53f6\u5251\u82f1|\u7531\u559c\u8d35|\u4e8e\u5e7c\u519b|\u4fde\u6b63\u58f0|\u8881\u7eaf\u6e05|\u66fe\u57f9\u708e|\u66fe\u5e86\u7ea2|\u66fe\u5baa\u6893|\u66fe\u836b\u6743|\u5f20\u5fb7\u6c5f|\u5f20\u5b9a\u53d1|\u5f20\u9ad8\u4e3d|\u5f20\u7acb\u660c|\u5f20\u8363\u5764|\u5f20\u5fd7\u56fd|\u8d75\u6d2a\u795d|\u7d2b\u9633|\u5468\u751f\u8d24|\u5468\u6c38\u5eb7|\u6731\u6d77\u4ed1|\u4e2d\u5357\u6d77|\u5927\u9646\u5f53\u5c40|\u4e2d\u56fd\u5f53\u5c40|\u5317\u4eac\u5f53\u5c40|\u5171\u4ea7\u515a|\u515a\u4ea7\u5171|\u5171\u8d2a\u515a|\u963f\u5171|\u4ea7\u515a\u5171|\u516c\u4ea7\u515a|\u5de5\u4ea7\u515a|\u5171c\u515a|\u5171x\u515a|\u5171\u94f2|\u4f9b\u4ea7|\u5171\u60e8|\u4f9b\u94f2\u515a|\u4f9b\u94f2\u8c20|\u4f9b\u94f2\u88c6|\u5171\u6b8b\u515a|\u5171\u6b8b\u4e3b\u4e49|\u5171\u4ea7\u4e3b\u4e49\u7684\u5e7d\u7075|\u62f1\u94f2|\u8001\u5171|\u4e2d\u5171|\u4e2d\u73d9|\u4e2dgong|gc\u515a|\u8d21\u6321|gong\u515a|g\u4ea7|\u72d7\u4ea7\u86cb|\u5171\u6b8b\u88c6|\u6076\u515a|\u90aa\u515a|\u5171\u4ea7\u4e13\u5236|\u5171\u4ea7\u738b\u671d|\u88c6\u4e2d\u592e|\u571f\u5171|\u571fg|\u5171\u72d7|g\u532a|\u5171\u532a|\u4ec7\u5171|\u653f\u5e9c|\u75c7\u8150|\u653f\u8150|\u653f\u4ed8|\u6b63\u5e9c|\u653f\u4fef|\u653ff|zhengfu|\u653fzhi|\u6321\u4e2d\u592e|\u6863\u4e2d\u592e|\u4e2d\u592e\u9886\u5bfc|\u4e2d\u56fdzf|\u4e2d\u592ezf|\u56fdwu\u9662|\u4e2d\u534e\u5e1d\u56fd|gong\u548c|\u5927\u9646\u5b98\u65b9|\u5317\u4eac\u653f\u6743|\u6c5f\u6cfd\u6c11|\u80e1\u9526\u6d9b|\u6e29\u5bb6\u5b9d|\u4e60\u8fd1\u5e73|\u4e60\u4ef2\u52cb|\u8d3a\u56fd\u5f3a|\u8d3a\u5b50\u73cd|\u5468\u6c38\u5eb7|\u674e\u957f\u6625|\u674e\u5fb7\u751f|\u738b\u5c90\u5c71|\u59da\u4f9d\u6797|\u56de\u826f\u7389|\u674e\u6e90\u6f6e|\u674e\u5e72\u6210|\u6234\u79c9\u56fd|\u9ec4\u9547|\u5218\u5ef6\u4e1c|\u5218\u745e\u9f99|\u4fde\u6b63\u58f0|\u9ec4\u656c|\u8584\u7199|\u8584\u4e00\u6ce2|\u5468\u5c0f\u5ddd|\u5468\u5efa\u5357|\u6e29\u4e91\u677e|\u5f90\u660e|\u6c5f\u6cfd\u6167|\u6c5f\u7ef5\u6052|\u6c5f\u7ef5\u5eb7|\u674e\u5c0f\u9e4f|\u674e\u9e4f|\u674e\u5c0f\u7433|\u6731\u4e91\u6765|\u6731\u5bb9\u57fa|\u6cd5\u8f6e\u529f|\u674e\u6d2a\u5fd7|\u65b0\u7586\u9a9a\u4e71|\u4e60\u8fd1\u5e73|\u4e60\u4ef2\u52cb|\u5341\u4e5d\u5927\u4fee\u5baa|\u4e60\u8fd1\u5e73\u8fde\u4efb|\u5baa\u6cd5\u4fee\u6b63\u6848|\u4efb\u671f\u9650\u5236|\u8150\u8d25\u4e2d\u56fd|\u4e09\u4e2a\u4ee3\u8868|\u793e\u4f1a\u4e3b\u4e49\u706d\u4ea1|\u6253\u5012\u4e2d\u56fd|\u6253\u5012\u5171\u4ea7\u515a|\u6253\u5012\u5171\u4ea7\u4e3b\u4e49|\u6253\u5012\u80e1\u9526\u6d9b|\u6253\u5012\u6c5f\u6cfd\u6c11|\u6253\u5012\u6c5f\u4e3b\u5e2d|\u6253\u5012\u7f57\u5e72|\u6253\u5012\u4e2d\u5171|\u62b5\u5236\u5171\u4ea7\u515a|\u62b5\u5236\u5171\u4ea7\u4e3b\u4e49|\u62b5\u5236\u80e1\u9526\u6d9b|\u62b5\u5236\u6c5f\u6cfd\u6c11|\u62b5\u5236\u6c5f\u4e3b\u5e2d|\u62b5\u5236\u674e\u9e4f|\u62b5\u5236\u7f57\u5e72|\u62b5\u5236\u6e29\u5bb6\u5b9d|\u62b5\u5236\u4e2d\u5171|\u62b5\u5236\u6731\ufffdF\u57fa|\u706d\u4ea1\u4e2d\u56fd|\u4ea1\u515a\u4ea1\u56fd|\u7c89\u788e\u56db\u4eba\u5e2e|\u6fc0\u6d41\u4e2d\u56fd|\u7279\u4f9b|\u7279\u8d21|\u7279\u5171|zf\u5927\u697c|\u6b83\u89c6|\u8d2a\u6c61\u8150\u8d25|\u5f3a\u5236\u62c6\u9664|\u5f62\u5f0f\u4e3b\u4e49|\u653f\u6cbb\u98ce\u6ce2|\u592a\u5b50\u515a|\u4e0a\u6d77\u5e2e|\u5317\u4eac\u5e2e|\u6e05\u534e\u5e2e|\u7ea2\u8272\u8d35\u65cf|\u6743\u8d35\u96c6\u56e2|\u6cb3\u87f9\u793e\u4f1a|\u559d\u8840\u793e\u4f1a|\u4e5d\u98ce|9\u98ce|\u5341\u4e03\u5927|\u53417\u5927|17da|\u4e5d\u5b66|9\u5b66|\u56db\u98ce|4\u98ce|\u53cc\u89c4|\u5357\u8857\u6751|\u6700\u6deb\u5b98\u5458|\u8b66\u532a|\u5b98\u532a|\u72ec\u592b\u6c11\u8d3c|\u5b98\u5546\u52fe\u7ed3|\u57ce\u7ba1\u66b4\u529b\u6267\u6cd5|\u5f3a\u5236\u6350\u6b3e|\u6bd2\u8c7a|\u4e00\u515a\u6267\u653f|\u4e00\u515a\u4e13\u5236|\u4e00\u515a\u4e13\u653f|\u4e13\u5236\u653f\u6743|\u5baa\u6cd5\u6cd5\u9662|\u80e1\u5e73|\u82cf\u6653\u5eb7|\u8d3a\u536b\u65b9|\u8c2d\u4f5c\u4eba|\u7126\u56fd\u6807|\u4e07\u6da6\u5357|\u5f20\u5fd7\u65b0|\u9ad8\u52e4\u8363|\u738b\u70b3\u7ae0|\u9ad8\u667a\u665f|\u53f8\u9a6c\u7490|\u5218\u6653\u7af9|\u5218\u5bbe\u96c1|\u9b4f\u4eac\u751f|\u5bfb\u627e\u6797\u662d\u7684\u7075\u9b42|\u522b\u68a6\u6210\u7070|\u8c01\u662f\u65b0\u4e2d\u56fd|\u8ba8\u4f10\u4e2d\u5ba3\u90e8|\u5f02\u8bae\u4eba\u58eb|\u6c11\u8fd0\u4eba\u58eb|\u542f\u8499\u6d3e|\u9009\u56fd\u5bb6\u4e3b\u5e2d|\u6c11\u4e00\u4e3b|min\u4e3b|\u6c11\u7af9|\u6c11\u73e0|\u6c11\u732a|chinesedemocracy|\u5927\u8d66\u56fd\u9645|\u56fd\u9645\u7279\u8d66|da\u9009|\u6295\u516c|\u516c\u5934|\u5baa\u653f|\u5e73\u53cd|\u515a\u7ae0|\u7ef4\u6743|\u661d\u7231\u5b97|\u5baa\u7ae0|08\u5baa|08xz|\u62bf\u4e3b|\u654f\u4e3b|\u4eba\u62f3|\u4eba\u6728\u53c8|\u4ebaquan|renquan|\u4e2d\u56fd\u4eba\u6743|\u4e2d\u56fd\u65b0\u6c11\u515a|\u7fa4\u4f53\u4e8b\u4ef6|\u7fa4\u4f53\u6027\u4e8b\u4ef6|\u4e0a\u4e2d\u592e|\u53bb\u4e2d\u592e|\u8ba8\u8bf4\u6cd5|\u8bf7\u613f|\u8bf7\u547d|\u516c\u5f00\u4fe1|\u8054\u540d\u4e0a\u4e66|\u4e07\u4eba\u5927\u7b7e\u540d|\u4e07\u4eba\u9a9a\u52a8|\u622a\u8bbf|\u4e0a\u8bbf|shangfang|\u4fe1\u8bbf|\u8bbf\u6c11|\u96c6\u5408|\u96c6\u4f1a|\u7ec4\u7ec7\u96c6\u4f53|\u9759\u5750|\u9759zuo|jing\u5750|\u793a\u5a01|\u793awei|\u6e38\u884c|you\u884c|\u6cb9\u884c|\u6e38xing|youxing|\u5b98\u903c\u6c11\u53cd|\u53cdparty|\u53cd\u5171|\u6297\u8bae|\u4ea2\u8bae|\u62b5\u5236|\u4f4e\u5236|\u5e95\u5236|di\u5236|\u62b5zhi|dizhi|boycott|\u8840\u4e66|\u711a\u70e7\u4e2d\u56fd\u56fd\u65d7|baoluan|\u6d41\u8840\u51b2\u7a81|\u51fa\u73b0\u66b4\u52a8|\u53d1\u751f\u66b4\u52a8|\u5f15\u8d77\u66b4\u52a8|baodong|\u706d\u5171|\u6740\u6bd9|\u7f62\u5de5|\u9738\u5de5|\u7f62\u8003|\u7f62\u9910|\u9738\u9910|\u7f62\u53c2|\u7f62\u996d|\u7f62\u5403|\u7f62\u98df|\u7f62\u8bfe|\u7f62ke|\u9738\u8bfe|ba\u8bfe|\u7f62\u6559|\u7f62\u5b66|\u7f62\u8fd0|\u7f51\u7279|\u7f51\u8bc4\u5458|\u7f51\u7edc\u8bc4\u8bba\u5458|\u4e94\u6bdb\u515a|\u4e94\u6bdb\u4eec|5\u6bdb\u515a|\u6212\u4e25|jieyan|jie\u4e25|\u6212yan|8\u7684\u5e73\u65b9\u4e8b\u4ef6|\u77e5\u905364|\u516b\u4e5d\u5e74|\u8d30\u62fe\u5e74|2o\u5e74|20\u548c\u8c10\u5e74|\u8d30\u62fe\u5468\u5e74|\u516d\u56db|\u516d\u6cb3\u87f9\u56db|\u516d\u767e\u5ea6\u56db|\u516d\u548c\u8c10\u56db|\u9646\u56db|\u9646\u8086|198964|5\u670835|89\u5e74\u6625\u590f\u4e4b\u4ea4|64\u60e8\u6848|64\u65f6\u671f|64\u8fd0\u52a8|4\u4e8b\u4ef6|\u56db\u4e8b\u4ef6|\u5317\u4eac\u98ce\u6ce2|\u5b66\u6f6e|\u5b66chao|xuechao|\u5b66\u767e\u5ea6\u6f6e|\u95e8\u5b89\u5929|\u5929\u6309\u95e8|\u5766\u514b\u538b\u5927\u5b66\u751f|\u6c11\u4e3b\u5973\u795e|\u5386\u53f2\u7684\u4f24\u53e3|\u9ad8\u81ea\u8054|\u5317\u9ad8\u8054|\u8840\u6d17\u4eac\u57ce|\u56db\u4e8c\u516d\u793e\u8bba|\u738b\u4e39|\u67f4\u73b2|\u6c88\u5f64|\u5c01\u4ece\u5fb7|\u738b\u8d85\u534e|\u738b\u7ef4\u6797|\u543e\u5c14\u5f00\u5e0c|\u543e\u5c14\u5f00\u897f|\u4faf\u5fb7\u5065|\u960e\u660e\u590d|\u65b9\u52b1\u4e4b|\u848b\u6377\u8fde|\u4e01\u5b50\u9716|\u8f9b\u704f\u5e74|\u848b\u5f66\u6c38|\u4e25\u5bb6\u5176|\u9648\u4e00\u54a8|\u4e2d\u534e\u5c40\u57df\u7f51|\u515a\u7684\u5589\u820c|\u4e92\u8054\u7f51\u5ba1\u67e5|\u5f53\u5c40\u4e25\u5bc6\u5c01\u9501|\u65b0\u95fb\u5c01\u9501|\u5c01\u9501\u6d88\u606f|\u7231\u56fd\u8005\u540c\u76df|\u5173\u95ed\u6240\u6709\u8bba\u575b|\u7f51\u7edc\u5c01\u9501|\u91d1\u76fe\u5de5\u7a0b|gfw|\u65e0\u754c\u6d4f\u89c8|\u65e0\u754c\u7f51\u7edc|\u81ea\u7531\u95e8|\u4f55\u6e05\u6d9f|\u4e2d\u56fd\u7684\u9677\u9631|\u6c6a\u5146\u94a7|\u8bb0\u8005\u65e0\u7586\u754c|\u5883\u5916\u5a92\u4f53|\u7ef4\u57fa\u767e\u79d1|\u7ebd\u7ea6\u65f6\u62a5|bbc\u4e2d\u6587\u7f51|\u534e\u76db\u987f\u90ae\u62a5|\u4e16\u754c\u65e5\u62a5|\u4e1c\u68ee\u65b0\u95fb\u7f51|\u4e1c\u68ee\u7535\u89c6|\u661f\u5c9b\u65e5\u62a5|wikipedia|youtube|googleblogger|\u7f8e\u56fd\u5e7f\u64ad\u516c\u53f8|\u82f1\u56fd\u91d1\u878d\u65f6\u62a5|\u81ea\u7531\u4e9a\u6d32|\u81ea\u7531\u65f6\u62a5|\u4e2d\u56fd\u65f6\u62a5|\u53cd\u5206\u88c2|\u5a01\u80c1\u8bba|\u5de6\u7ffc\u8054\u76df|\u9493\u9c7c\u5c9b|\u4fdd\u9493\u7ec4\u7ec7|\u4e3b\u6743|\u5f13\u5355|\u706b\u4e4d|\u6728\u4ed3|\u77f3\u8096|\u6838\u86cb|\u6b65qiang|bao\u70b8|\u7206zha|baozha|zha\u836f|zha\u5f39|\u70b8dan|\u70b8yao|zhadan|zhayao|hmtd|\u4e09\u785d\u57fa\u7532\u82ef|\u516d\u6c1f\u5316\u94c0|\u70b8\u836f\u914d\u65b9|\u5f39\u836f\u914d\u65b9|\u70b8\u5f39\u914d\u65b9|\u76ae\u7bb1\u70b8\u5f39|\u706b\u836f\u914d\u65b9|\u4eba\u4f53\u70b8\u5f39|\u4eba\u8089\u70b8\u5f39|\u89e3\u653e\u519b|\u5175\u529b\u90e8\u7f72|\u519b\u8f6c|\u519b\u4e8b\u793e|8341\u90e8\u961f|\u7b2c21\u96c6\u56e2\u519b|\u4e03\u5927\u519b\u533a|7\u5927\u519b\u533a|\u5317\u4eac\u519b\u533a|\u6c88\u9633\u519b\u533a|\u6d4e\u5357\u519b\u533a|\u6210\u90fd\u519b\u533a|\u5e7f\u5dde\u519b\u533a|\u5357\u4eac\u519b\u533a|\u5170\u5dde\u519b\u533a|\u989c\u8272\u9769\u547d|\u89c4\u6a21\u51b2\u7a81|\u5854\u5229\u73ed|\u57fa\u5730\u7ec4\u7ec7|\u6050\u6016\u5206\u5b50|\u6050\u6016\u4efd\u5b50|\u4e09\u80a1\u52bf\u529b|\u5370\u5c3c\u5c60\u534e|\u5370\u5c3c\u4e8b\u4ef6|\u848b\u516c\u7eaa\u5ff5\u6b4c|\u9a6c\u82f1\u4e5d|mayingjiu|\u674e\u5929\u7fbd|\u82cf\u8d1e\u660c|\u6797\u6587\u6f2a|\u9648\u6c34\u6241|\u9648s\u6241|\u9648\u968f\u4fbf|\u963f\u6241|a\u6241|\u544a\u5168\u56fd\u540c\u80de\u4e66|\u53f0\u767e\u5ea6\u6e7e|\u53f0\u5b8c|\u53f0wan|taiwan|\u53f0\u5f2f|\u6e7e\u53f0|\u53f0\u6e7e\u56fd|\u53f0\u6e7e\u5171\u548c\u56fd|\u53f0\u519b|\u53f0\u72ec|\u53f0\u6bd2|\u53f0du|taidu|twdl|\u4e00\u4e2d\u4e00\u53f0|\u6253\u53f0\u6e7e|\u4e24\u5cb8\u6218\u4e89|\u653b\u5360\u53f0\u6e7e|\u652f\u6301\u53f0\u6e7e|\u8fdb\u653b\u53f0\u6e7e|\u5360\u9886\u53f0\u6e7e|\u7edf\u4e00\u53f0\u6e7e|\u6536\u590d\u53f0\u6e7e|\u767b\u9646\u53f0\u6e7e|\u89e3\u653e\u53f0\u6e7e|\u89e3\u653etw|\u89e3\u51b3\u53f0\u6e7e|\u5149\u590d\u6c11\u56fd|\u53f0\u6e7e\u72ec\u7acb|\u53f0\u6e7e\u95ee\u9898|\u53f0\u6d77\u95ee\u9898|\u53f0\u6d77\u5371\u673a|\u53f0\u6d77\u7edf\u4e00|\u53f0\u6d77\u5927\u6218|\u53f0\u6d77\u6218\u4e89|\u53f0\u6d77\u5c40\u52bf|\u5165\u8054|\u5165\u8033\u5173|\u4e2d\u534e\u8054\u90a6|\u56fd\u6c11\u515a|x\u6c11\u515a|\u6c11\u8fdb\u515a|\u9752\u5929\u767d\u65e5|\u95f9\u72ec\u7acb|duli|fenlie|\u65e5\u672c\u4e07\u5c81|\u5c0f\u6cfd\u4e00\u90ce|\u52a3\u7b49\u6c11\u65cf|\u6c49\u4eba|\u6c49\u7ef4|\u7ef4\u6c49|\u7ef4\u543e|\u543e\u5c14|\u70ed\u6bd4\u5a05|\u4f0a\u529b\u54c8\u6728|\u7586\u72ec|\u4e1c\u7a81\u53a5\u65af\u5766\u89e3\u653e\u7ec4\u7ec7|\u4e1c\u7a81\u89e3\u653e\u7ec4\u7ec7|\u8499\u53e4\u5206\u88c2\u5206\u5b50|\u5217\u786e|\u963f\u65fa\u664b\u7f8e|\u85cf\u4eba|\u81e7\u4eba|zang\u4eba|\u85cf\u6c11|\u85cfm|\u8fbe\u8d56|\u8d56\u8fbe|dalai|\u54d2\u8d56|dl\u5587\u561b|\u4e39\u589e\u5609\u63aa|\u6253\u7838\u62a2|\u897f\u72ec|\u85cf\u72ec|\u846c\u72ec|\u81e7\u72ec|\u85cf\u6bd2|\u85cfdu|zangdu|\u652f\u6301zd|\u85cf\u66b4\u4e71|\u85cf\u9752\u4f1a|\u96ea\u5c71\u72ee\u5b50\u65d7|\u62c9\u8428|\u5566\u8428|\u5566\u6c99|\u5566\u6492|\u62c9sa|lasa|la\u8428|\u897f\u85cf|\u85cf\u897f|\u85cf\u6625\u9601|\u85cf\ufffd\u009a|\u85cf\u72ec|\u85cf\u72ec\u7acb|\u85cf\u5987\u4f1a|\u85cf\u9752\u4f1a|\u85cf\u5b57\u77f3|xizang|xi\u85cf|x\u85cf|\u897fz|tibet|\u5e0c\u846c|\u5e0c\u85cf|\u7852\u85cf|\u7a00\u85cf|\u897f\u810f|\u897f\u5958|\u897f\u846c|\u897f\u81e7|\u63f4\u85cf|bjork|\u738b\u5343\u6e90|\u5b89\u62c9|\u56de\u6559|\u56de\u65cf|\u56de\u56de|\u56de\u6c11|\u7a46\u65af\u6797|\u7a46\u7f55\u7a46\u5fb7|\u7a46\u7f55\u9ed8\u5fb7|\u9ed8\u7f55\u9ed8\u5fb7|\u4f0a\u65af\u5170|\u5723\u6218\u7ec4\u7ec7|\u6e05\u771f|\u6e05zhen|qingzhen|\u771f\u4e3b|\u963f\u62c9\u4f2f|\u9ad8\u4e3d\u68d2\u5b50|\u97e9\u56fd\u72d7|\u6ee1\u6d32\u7b2c\u4e09\u5e1d\u56fd|\u6ee1\u72d7|\u9791\u5b50|\u6c5f\u4e11\u95fb|\u6c5f\u5ae1\u7cfb|\u6c5f\u6bd2|\u6c5f\u72ec\u88c1|\u6c5f\u86e4\u87c6|\u6c5f\u6838\u5fc3|\u6c5f\u9ed1\u5fc3|\u6c5f\u80e1\u5185\u6597|\u6c5f\u7978\u5fc3|\u6c5f\u5bb6\u5e2e|\u6c5f\u7ef5\u6052|\u6c5f\u6d3e\u548c\u80e1\u6d3e|\u6c5f\u6d3e\u4eba\u9a6c|\u6c5f\u6cc9\u96c6\u56e2|\u6c5f\u4eba\u9a6c|\u6c5f\u4e09\u6761\u817f|\u6c5f\u6c0f\u96c6\u56e2|\u6c5f\u6c0f\u5bb6\u65cf|\u6c5f\u6c0f\u653f\u6cbb\u5c40|\u6c5f\u6c0f\u653f\u6cbb\u59d4\u5458|\u6c5f\u68b3\u5934|\u6c5f\u592a\u4e0a|\u6c5f\u620f\u5b50|\u6c5f\u7cfb\u4eba|\u6c5f\u7cfb\u4eba\u9a6c|\u6c5f\u5bb0\u6c11|\u6c5f\u8d3c|\u6c5f\u8d3c\u6c11|\u6c5f\u4e3b\u5e2d|\u9ebb\u679c\u4e38|\u9ebb\u5c06\u900f|\u9ebb\u9189\u5f39|\u9ebb\u9189\u72d7|\u9ebb\u9189\u67aa|\u9ebb\u9189\u0098\u008c|\u9ebb\u9189\u836f|\u53f0\u72ec|\u53f0\u6e7e|\u4e2d\u5171|\u8bc9\u6c42|\u64a4\u56de|\u70ae\u6253|\u5927\u5b57\u62a5|\u8fde\u519c|\u8fde\u4fac|\u5171\u6597|\u6b66\u6c49|\u80ba\u708e|\u5c0f\u7c89\u7ea2|\u7ef4\u5c3c|\u5bf9\u5cb8|\u4e2d\u56fd\u4eba|\u72ec\u7acb|\u7fd2\u8fd1\u5e73|\u5e73\u8fd1\u7fd2|xjp|\u7fd2\u592a\u5b50|\u7fd2\u660e\u6fa4|\u8001\u7fd2|\u6eab\u5bb6\u5bf6|\u6eab\u52a0\u5bf6|\u6eabx|\u6eabjia\u5bf6|\u6eab\u5bf6\u5bf6|\u6eab\u52a0\u98fd|\u6eab\u52a0\u4fdd|\u5f35\u57f9\u8389|\u6eab\u96f2\u9b06|\u6eab\u5982\u6625|\u6eabjb|\u80e1\u6eab|\u80e1x|\u80e1jt|\u80e1boss|\u80e1\u7e3d|\u80e1\u738b\u516b|hujintao|\u80e1jintao|\u80e1j\u6fe4|\u80e1\u9a5a\u6fe4|\u80e1\u666f\u6fe4|\u80e1\u7dca\u638f|\u6e56\u7dca\u638f|\u80e1\u7dca\u5957|\u9326\u6fe4|hjt|\u80e1\u6d3e|\u80e1\u4e3b\u5e2d|\u5289\u6c38\u6e05|\u80e1\u6d77\u5cf0|\u80e1\u6d77\u6e05|\u6c5f\u6fa4\u6c11|\u6c11\u6fa4\u6c5f|\u6c5f\u80e1|\u6c5f\u54e5|\u6c5f\u4e3b\u5e2d|\u6c5f\u66f8\u8a18|\u6c5f\u6d59\u95a9|\u6c5f\u6ca2\u6c11|\u6c5f\u6d59\u6c11|\u64c7\u6c11|\u5247\u6c11|\u8333\u6fa4\u6c11|zemin|ze\u6c11|\u8001\u6c5f|\u8001j|\u6c5fcore|\u6c5fx|\u6c5f\u6d3e|\u6c5fzm|jzm|\u6c5f\u6232\u5b50|\u6c5f\u86e4\u87c6|\u6c5f\u67d0\u67d0|\u6c5f\u8cca|\u6c5f\u8c6c|\u6c5f\u6c0f\u96c6\u5718|\u6c5f\u7dbf\u6046|\u6c5f\u7dbf\u5eb7|\u738b\u51b6\u576a|\u6c5f\u6fa4\u6167|\u9127\u5c0f\u5e73|\u5e73\u5c0f\u9127|xiao\u5e73|\u9127xp|\u9127\u66c9\u5e73|\u9127\u6a38\u65b9|\u9127\u6995|\u9127\u8cea\u65b9|\u6bdb\u6fa4\u6771|\u8c93\u6fa4\u6771|\u8c93\u5247\u6771|\u8c93\u8cca\u6d1e|\u6bdbzd|\u6bdbzx|z\u6771|ze\u6771|\u6fa4d|zedong|\u6bdb\u592a\u7956|\u6bdb\u76f8|\u4e3b\u5e2d\u756b\u50cf|\u6539\u9769\u6b77\u7a0b|\u6731\u9394\u57fa|\u6731\u5bb9\u57fa|\u6731\u9394\u96de|\u6731\u5bb9\u96de|\u6731\u96f2\u4f86|\u674e\u9d6c|\u674epeng|\u88e1\u9d6c|\u674e\u6708\u6708\u9ce5|\u674e\u5c0f\u9d6c|\u674e\u5c0f\u7433|\u83ef\u4e3b\u5e2d|\u83ef\u570b|\u570b\u92d2|\u570b\u5cf0|\u92d2\u540c\u5fd7|\u767d\u6625\u79ae|\u8584\u7199\u4f86|\u8584\u4e00\u6ce2|\u8521\u8d74\u671d|\u8521\u6b66|\u66f9\u525b\u5ddd|\u5e38\u842c\u5168|\u9673\u70b3\u5fb7|\u9673\u5fb7\u9298|\u9673\u5efa\u570b|\u9673\u826f\u5b87|\u9673\u7d39\u57fa|\u9673\u540c\u6d77|\u9673\u81f3\u7acb|\u6234\u79c9\u570b|\u4e01\u4e00\u5e73|\u8463\u5efa\u83ef|\u675c\u5fb7\u5370|\u675c\u4e16\u6210|\u5085\u92b3|\u90ed\u4f2f\u96c4|\u90ed\u91d1\u9f8d|\u8cc0\u570b\u5f37|\u80e1\u6625\u83ef|\u8000\u90a6|\u83ef\u5efa\u654f|\u9ec3\u83ef\u83ef|\u9ec3\u9e97\u6eff|\u9ec3\u8208\u570b|\u56de\u826f\u7389|\u8cc8\u6176\u6797|\u8cc8\u5ef7\u5b89|\u9756\u5fd7\u9060|\u674e\u9577\u6625|\u674e\u6625\u57ce|\u674e\u5efa\u570b|\u674e\u514b\u5f37|\u674e\u5d50\u6e05|\u674e\u6c9b\u7464|\u674e\u69ae\u878d|\u674e\u745e\u74b0|\u674e\u9435\u6620|\u674e\u5148\u5ff5|\u674e\u5b78\u8209|\u674e\u6e90\u6f6e|\u6144\u667a|\u6a11\u5149\u70c8|\u5ed6\u932b\u9f8d|\u6797\u6a39\u68ee|\u6797\u708e\u5fd7|\u6797\u5de6\u9cf4|\u4ee4\u8a08\u5283|\u67f3\u658c\u6770|\u5289\u5947\u8446|\u5289\u5c11\u5947|\u5289\u5ef6\u6771|\u5289\u96f2\u5c71|\u5289\u5fd7\u8ecd|\u9f8d\u65b0\u6c11|\u8def\u752c\u7965|\u7f85\u7bad|\u5442\u7956\u5584|\u99ac\u98c8|\u99ac\u6137|\u5b5f\u5efa\u67f1|\u6b50\u5ee3\u6e90|\u5f37\u885b|\u6c88\u8e8d\u8e8d|\u5b8b\u5e73\u9806|\u7c9f\u620e\u751f|\u8607\u6a39\u6797|\u5b6b\u5bb6\u6b63|\u9435\u51dd|\u5c60\u5149\u7d39|\u738b\u6771\u660e|\u6c6a\u6771\u8208|\u738b\u9d3b\u8209|\u738b\u6eec\u5be7|\u738b\u6a02\u6cc9|\u738b\u6d1b\u6797|\u738b\u5c90\u5c71|\u738b\u52dd\u4fca|\u738b\u592a\u83ef|\u738b\u5b78\u8ecd|\u738b\u5146\u570b|\u738b\u632f\u83ef|\u5433\u90a6\u570b|\u5433\u5b9a\u5bcc|\u5433\u5b98\u6b63|\u7121\u5b98\u6b63|\u5433\u52dd\u5229|\u5433\u5100|\u595a\u570b\u83ef|\u7fd2\u4ef2\u52f3|\u5f90\u624d\u539a|\u8a31\u5176\u4eae|\u5f90\u7d39\u53f2|\u694a\u6f54\u7bea|\u8449\u528d\u82f1|\u7531\u559c\u8cb4|\u4e8e\u5e7c\u8ecd|\u4fde\u6b63\u8072|\u8881\u7d14\u6e05|\u66fe\u57f9\u708e|\u66fe\u6176\u7d05|\u66fe\u61b2\u6893|\u66fe\u852d\u6b0a|\u5f35\u5fb7\u6c5f|\u5f35\u5b9a\u767c|\u5f35\u9ad8\u9e97|\u5f35\u7acb\u660c|\u5f35\u69ae\u5764|\u5f35\u5fd7\u570b|\u8d99\u6d2a\u795d|\u7d2b\u967d|\u5468\u751f\u8ce2|\u5468\u6c38\u5eb7|\u6731\u6d77\u4f96|\u4e2d\u5357\u6d77|\u5927\u9678\u7576\u5c40|\u4e2d\u570b\u7576\u5c40|\u5317\u4eac\u7576\u5c40|\u5171\u7522\u9ee8|\u9ee8\u7522\u5171|\u5171\u8caa\u9ee8|\u963f\u5171|\u7522\u9ee8\u5171|\u516c\u7522\u9ee8|\u5de5\u7522\u9ee8|\u5171c\u9ee8|\u5171x\u9ee8|\u5171\u5277|\u4f9b\u7522|\u5171\u6158|\u4f9b\u93df\u9ee8|\u4f9b\u93df\u8b9c|\u4f9b\u93df\u8960|\u5171\u6b98\u9ee8|\u5171\u6b98\u4e3b\u7fa9|\u5171\u7522\u4e3b\u7fa9\u7684\u5e7d\u9748|\u62f1\u93df|\u8001\u5171|\u4e2d\u5171|\u4e2d\u73d9|\u4e2dgong|gc\u9ee8|\u8ca2\u64cb|gong\u9ee8|g\u7522|\u72d7\u7522\u86cb|\u5171\u6b98\u8960|\u60e1\u9ee8|\u90aa\u9ee8|\u5171\u7522\u5c08\u5236|\u5171\u7522\u738b\u671d|\u8960\u4e2d\u592e|\u571f\u5171|\u571fg|\u5171\u72d7|g\u532a|\u5171\u532a|\u4ec7\u5171|\u653f\u5e9c|\u75c7\u8150|\u653f\u8150|\u653f\u4ed8|\u6b63\u5e9c|\u653f\u4fef|\u653ff|zhengfu|\u653fzhi|\u64cb\u4e2d\u592e|\u6a94\u4e2d\u592e|\u4e2d\u592e\u9818\u5c0e|\u4e2d\u570bzf|\u4e2d\u592ezf|\u570bwu\u9662|\u4e2d\u83ef\u5e1d\u570b|gong\u548c|\u5927\u9678\u5b98\u65b9|\u5317\u4eac\u653f\u6b0a|\u6c5f\u6fa4\u6c11|\u80e1\u9326\u6fe4|\u6eab\u5bb6\u5bf6|\u7fd2\u8fd1\u5e73|\u7fd2\u4ef2\u52f3|\u8cc0\u570b\u5f37|\u8cc0\u5b50\u73cd|\u5468\u6c38\u5eb7|\u674e\u9577\u6625|\u674e\u5fb7\u751f|\u738b\u5c90\u5c71|\u59da\u4f9d\u6797|\u56de\u826f\u7389|\u674e\u6e90\u6f6e|\u674e\u5e79\u6210|\u6234\u79c9\u570b|\u9ec3\u93ae|\u5289\u5ef6\u6771|\u5289\u745e\u9f8d|\u4fde\u6b63\u8072|\u9ec3\u656c|\u8584\u7199|\u8584\u4e00\u6ce2|\u5468\u5c0f\u5ddd|\u5468\u5efa\u5357|\u6eab\u96f2\u9b06|\u5f90\u660e|\u6c5f\u6fa4\u6167|\u6c5f\u7dbf\u6046|\u6c5f\u7dbf\u5eb7|\u674e\u5c0f\u9d6c|\u674e\u9d6c|\u674e\u5c0f\u7433|\u6731\u96f2\u4f86|\u6731\u5bb9\u57fa|\u6cd5\u8f2a\u529f|\u674e\u6d2a\u5fd7|\u65b0\u7586\u9a37\u4e82|\u7fd2\u8fd1\u5e73|\u7fd2\u4ef2\u52f3|\u5341\u4e5d\u5927\u4fee\u61b2|\u7fd2\u8fd1\u5e73\u9023\u4efb|\u61b2\u6cd5\u4fee\u6b63\u6848|\u4efb\u671f\u9650\u5236|\u8150\u6557\u4e2d\u570b|\u4e09\u500b\u4ee3\u8868|\u793e\u6703\u4e3b\u7fa9\u6ec5\u4ea1|\u6253\u5012\u4e2d\u570b|\u6253\u5012\u5171\u7522\u9ee8|\u6253\u5012\u5171\u7522\u4e3b\u7fa9|\u6253\u5012\u80e1\u9326\u6fe4|\u6253\u5012\u6c5f\u6fa4\u6c11|\u6253\u5012\u6c5f\u4e3b\u5e2d|\u6253\u5012\u7f85\u5e79|\u6253\u5012\u4e2d\u5171|\u62b5\u5236\u5171\u7522\u9ee8|\u62b5\u5236\u5171\u7522\u4e3b\u7fa9|\u62b5\u5236\u80e1\u9326\u6fe4|\u62b5\u5236\u6c5f\u6fa4\u6c11|\u62b5\u5236\u6c5f\u4e3b\u5e2d|\u62b5\u5236\u674e\u9d6c|\u62b5\u5236\u7f85\u5e79|\u62b5\u5236\u6eab\u5bb6\u5bf6|\u62b5\u5236\u4e2d\u5171|\u62b5\u5236\u6731\ufffdF\u57fa|\u6ec5\u4ea1\u4e2d\u570b|\u4ea1\u9ee8\u4ea1\u570b|\u7c89\u788e\u56db\u4eba\u5e6b|\u6fc0\u6d41\u4e2d\u570b|\u7279\u4f9b|\u7279\u8ca2|\u7279\u5171|zf\u5927\u6a13|\u6b83\u8996|\u8caa\u6c59\u8150\u6557|\u5f37\u5236\u62c6\u9664|\u5f62\u5f0f\u4e3b\u7fa9|\u653f\u6cbb\u98a8\u6ce2|\u592a\u5b50\u9ee8|\u4e0a\u6d77\u5e6b|\u5317\u4eac\u5e6b|\u6e05\u83ef\u5e6b|\u7d05\u8272\u8cb4\u65cf|\u6b0a\u8cb4\u96c6\u5718|\u6cb3\u87f9\u793e\u6703|\u559d\u8840\u793e\u6703|\u4e5d\u98a8|9\u98a8|\u5341\u4e03\u5927|\u53417\u5927|17da|\u4e5d\u5b78|9\u5b78|\u56db\u98a8|4\u98a8|\u96d9\u898f|\u5357\u8857\u6751|\u6700\u6deb\u5b98\u54e1|\u8b66\u532a|\u5b98\u532a|\u7368\u592b\u6c11\u8cca|\u5b98\u5546\u52fe\u7d50|\u57ce\u7ba1\u66b4\u529b\u57f7\u6cd5|\u5f37\u5236\u6350\u6b3e|\u6bd2\u8c7a|\u4e00\u9ee8\u57f7\u653f|\u4e00\u9ee8\u5c08\u5236|\u4e00\u9ee8\u5c08\u653f|\u5c08\u5236\u653f\u6b0a|\u61b2\u6cd5\u6cd5\u9662|\u80e1\u5e73|\u8607\u66c9\u5eb7|\u8cc0\u885b\u65b9|\u8b5a\u4f5c\u4eba|\u7126\u570b\u6a19|\u842c\u6f64\u5357|\u5f35\u5fd7\u65b0|\u9ad8\u52e4\u69ae|\u738b\u70b3\u7ae0|\u9ad8\u667a\u665f|\u53f8\u99ac\u7490|\u5289\u66c9\u7af9|\u5289\u8cd3\u96c1|\u9b4f\u4eac\u751f|\u5c0b\u627e\u6797\u662d\u7684\u9748\u9b42|\u5225\u5922\u6210\u7070|\u8ab0\u662f\u65b0\u4e2d\u570b|\u8a0e\u4f10\u4e2d\u5ba3\u90e8|\u7570\u8b70\u4eba\u58eb|\u6c11\u904b\u4eba\u58eb|\u555f\u8499\u6d3e|\u9078\u570b\u5bb6\u4e3b\u5e2d|\u6c11\u4e00\u4e3b|min\u4e3b|\u6c11\u7af9|\u6c11\u73e0|\u6c11\u8c6c|chinesedemocracy|\u5927\u8d66\u570b\u969b|\u570b\u969b\u7279\u8d66|da\u9078|\u6295\u516c|\u516c\u982d|\u61b2\u653f|\u5e73\u53cd|\u9ee8\u7ae0|\u7dad\u6b0a|\u661d\u611b\u5b97|\u61b2\u7ae0|08\u61b2|08xz|\u62bf\u4e3b|\u654f\u4e3b|\u4eba\u62f3|\u4eba\u6728\u53c8|\u4ebaquan|renquan|\u4e2d\u570b\u4eba\u6b0a|\u4e2d\u570b\u65b0\u6c11\u9ee8|\u7fa4\u9ad4\u4e8b\u4ef6|\u7fa4\u9ad4\u6027\u4e8b\u4ef6|\u4e0a\u4e2d\u592e|\u53bb\u4e2d\u592e|\u8a0e\u8aaa\u6cd5|\u8acb\u9858|\u8acb\u547d|\u516c\u958b\u4fe1|\u806f\u540d\u4e0a\u66f8|\u842c\u4eba\u5927\u7c3d\u540d|\u842c\u4eba\u9a37\u52d5|\u622a\u8a2a|\u4e0a\u8a2a|shangfang|\u4fe1\u8a2a|\u8a2a\u6c11|\u96c6\u5408|\u96c6\u6703|\u7d44\u7e54\u96c6\u9ad4|\u975c\u5750|\u975czuo|jing\u5750|\u793a\u5a01|\u793awei|\u904a\u884c|you\u884c|\u6cb9\u884c|\u904axing|youxing|\u5b98\u903c\u6c11\u53cd|\u53cdparty|\u53cd\u5171|\u6297\u8b70|\u4ea2\u8b70|\u62b5\u5236|\u4f4e\u5236|\u5e95\u5236|di\u5236|\u62b5zhi|dizhi|boycott|\u8840\u66f8|\u711a\u71d2\u4e2d\u570b\u570b\u65d7|baoluan|\u6d41\u8840\u885d\u7a81|\u51fa\u73fe\u66b4\u52d5|\u767c\u751f\u66b4\u52d5|\u5f15\u8d77\u66b4\u52d5|baodong|\u6ec5\u5171|\u6bba\u6583|\u7f77\u5de5|\u9738\u5de5|\u7f77\u8003|\u7f77\u9910|\u9738\u9910|\u7f77\u53c3|\u7f77\u98ef|\u7f77\u5403|\u7f77\u98df|\u7f77\u8ab2|\u7f77ke|\u9738\u8ab2|ba\u8ab2|\u7f77\u6559|\u7f77\u5b78|\u7f77\u904b|\u7db2\u7279|\u7db2\u8a55\u54e1|\u7db2\u7d61\u8a55\u8ad6\u54e1|\u4e94\u6bdb\u9ee8|\u4e94\u6bdb\u5011|5\u6bdb\u9ee8|\u6212\u56b4|jieyan|jie\u56b4|\u6212yan|8\u7684\u5e73\u65b9\u4e8b\u4ef6|\u77e5\u905364|\u516b\u4e5d\u5e74|\u8cb3\u62fe\u5e74|2o\u5e74|20\u548c\u8ae7\u5e74|\u8cb3\u62fe\u9031\u5e74|\u516d\u56db|\u516d\u6cb3\u87f9\u56db|\u516d\u767e\u5ea6\u56db|\u516d\u548c\u8ae7\u56db|\u9678\u56db|\u9678\u8086|198964|5\u670835|89\u5e74\u6625\u590f\u4e4b\u4ea4|64\u6158\u6848|64\u6642\u671f|64\u904b\u52d5|4\u4e8b\u4ef6|\u56db\u4e8b\u4ef6|\u5317\u4eac\u98a8\u6ce2|\u5b78\u6f6e|\u5b78chao|xuechao|\u5b78\u767e\u5ea6\u6f6e|\u9580\u5b89\u5929|\u5929\u6309\u9580|\u5766\u514b\u58d3\u5927\u5b78\u751f|\u6c11\u4e3b\u5973\u795e|\u6b77\u53f2\u7684\u50b7\u53e3|\u9ad8\u81ea\u806f|\u5317\u9ad8\u806f|\u8840\u6d17\u4eac\u57ce|\u56db\u4e8c\u516d\u793e\u8ad6|\u738b\u4e39|\u67f4\u73b2|\u6c88\u5f64|\u5c01\u5f9e\u5fb7|\u738b\u8d85\u83ef|\u738b\u7dad\u6797|\u543e\u723e\u958b\u5e0c|\u543e\u723e\u958b\u897f|\u4faf\u5fb7\u5065|\u95bb\u660e\u8986|\u65b9\u52f5\u4e4b|\u8523\u6377\u9023|\u4e01\u5b50\u9716|\u8f9b\u705d\u5e74|\u8523\u5f65\u6c38|\u56b4\u5bb6\u5176|\u9673\u4e00\u8aee|\u4e2d\u83ef\u5c40\u57df\u7db2|\u9ee8\u7684\u5589\u820c|\u4e92\u806f\u7db2\u5be9\u67e5|\u7576\u5c40\u56b4\u5bc6\u5c01\u9396|\u65b0\u805e\u5c01\u9396|\u5c01\u9396\u6d88\u606f|\u611b\u570b\u8005\u540c\u76df|\u95dc\u9589\u6240\u6709\u8ad6\u58c7|\u7db2\u7d61\u5c01\u9396|\u91d1\u76fe\u5de5\u7a0b|gfw|\u7121\u754c\u700f\u89bd|\u7121\u754c\u7db2\u7d61|\u81ea\u7531\u9580|\u4f55\u6e05\u6f23|\u4e2d\u570b\u7684\u9677\u9631|\u6c6a\u5146\u921e|\u8a18\u8005\u7121\u7586\u754c|\u5883\u5916\u5a92\u9ad4|\u7dad\u57fa\u767e\u79d1|\u7d10\u7d04\u6642\u5831|bbc\u4e2d\u6587\u7db2|\u83ef\u76db\u9813\u90f5\u5831|\u4e16\u754c\u65e5\u5831|\u6771\u68ee\u65b0\u805e\u7db2|\u6771\u68ee\u96fb\u8996|\u661f\u5cf6\u65e5\u5831|wikipedia|youtube|googleblogger|\u7f8e\u570b\u5ee3\u64ad\u516c\u53f8|\u82f1\u570b\u91d1\u878d\u6642\u5831|\u81ea\u7531\u4e9e\u6d32|\u81ea\u7531\u6642\u5831|\u4e2d\u570b\u6642\u5831|\u53cd\u5206\u88c2|\u5a01\u8105\u8ad6|\u5de6\u7ffc\u806f\u76df|\u91e3\u9b5a\u5cf6|\u4fdd\u91e3\u7d44\u7e54|\u4e3b\u6b0a|\u5f13\u55ae|\u706b\u4e4d|\u6728\u5009|\u77f3\u8096|\u6838\u86cb|\u6b65qiang|bao\u70b8|\u7206zha|baozha|zha\u85e5|zha\u5f48|\u70b8dan|\u70b8yao|zhadan|zhayao|hmtd|\u4e09\u785d\u57fa\u7532\u82ef|\u516d\u6c1f\u5316\u923e|\u70b8\u85e5\u914d\u65b9|\u5f48\u85e5\u914d\u65b9|\u70b8\u5f48\u914d\u65b9|\u76ae\u7bb1\u70b8\u5f48|\u706b\u85e5\u914d\u65b9|\u4eba\u9ad4\u70b8\u5f48|\u4eba\u8089\u70b8\u5f48|\u89e3\u653e\u8ecd|\u5175\u529b\u90e8\u7f72|\u8ecd\u8f49|\u8ecd\u4e8b\u793e|8341\u90e8\u968a|\u7b2c21\u96c6\u5718\u8ecd|\u4e03\u5927\u8ecd\u5340|7\u5927\u8ecd\u5340|\u5317\u4eac\u8ecd\u5340|\u700b\u967d\u8ecd\u5340|\u6fdf\u5357\u8ecd\u5340|\u6210\u90fd\u8ecd\u5340|\u5ee3\u5dde\u8ecd\u5340|\u5357\u4eac\u8ecd\u5340|\u862d\u5dde\u8ecd\u5340|\u984f\u8272\u9769\u547d|\u898f\u6a21\u885d\u7a81|\u5854\u5229\u73ed|\u57fa\u5730\u7d44\u7e54|\u6050\u6016\u5206\u5b50|\u6050\u6016\u4efd\u5b50|\u4e09\u80a1\u52e2\u529b|\u5370\u5c3c\u5c60\u83ef|\u5370\u5c3c\u4e8b\u4ef6|\u8523\u516c\u7d00\u5ff5\u6b4c|\u99ac\u82f1\u4e5d|mayingjiu|\u674e\u5929\u7fbd|\u8607\u8c9e\u660c|\u6797\u6587\u6f2a|\u9673\u6c34\u6241|\u9673s\u6241|\u9673\u96a8\u4fbf|\u963f\u6241|a\u6241|\u544a\u5168\u570b\u540c\u80de\u66f8|\u81fa\u767e\u5ea6\u7063|\u81fa\u5b8c|\u81fawan|taiwan|\u81fa\u5f4e|\u7063\u81fa|\u81fa\u7063\u570b|\u81fa\u7063\u5171\u548c\u570b|\u81fa\u8ecd|\u81fa\u7368|\u81fa\u6bd2|\u81fadu|taidu|twdl|\u4e00\u4e2d\u4e00\u81fa|\u6253\u81fa\u7063|\u5169\u5cb8\u6230\u722d|\u653b\u4f54\u81fa\u7063|\u652f\u6301\u81fa\u7063|\u9032\u653b\u81fa\u7063|\u4f54\u9818\u81fa\u7063|\u7d71\u4e00\u81fa\u7063|\u6536\u5fa9\u81fa\u7063|\u767b\u9678\u81fa\u7063|\u89e3\u653e\u81fa\u7063|\u89e3\u653etw|\u89e3\u6c7a\u81fa\u7063|\u5149\u5fa9\u6c11\u570b|\u81fa\u7063\u7368\u7acb|\u81fa\u7063\u554f\u984c|\u81fa\u6d77\u554f\u984c|\u81fa\u6d77\u5371\u6a5f|\u81fa\u6d77\u7d71\u4e00|\u81fa\u6d77\u5927\u6230|\u81fa\u6d77\u6230\u722d|\u81fa\u6d77\u5c40\u52e2|\u5165\u806f|\u5165\u8033\u95dc|\u4e2d\u83ef\u806f\u90a6|\u570b\u6c11\u9ee8|x\u6c11\u9ee8|\u6c11\u9032\u9ee8|\u9752\u5929\u767d\u65e5|\u9b27\u7368\u7acb|duli|fenlie|\u65e5\u672c\u842c\u6b72|\u5c0f\u6fa4\u4e00\u90ce|\u52a3\u7b49\u6c11\u65cf|\u6f22\u4eba|\u6f22\u7dad|\u7dad\u6f22|\u7dad\u543e|\u543e\u723e|\u71b1\u6bd4\u5a6d|\u4f0a\u529b\u54c8\u6728|\u7586\u7368|\u6771\u7a81\u53a5\u65af\u5766\u89e3\u653e\u7d44\u7e54|\u6771\u7a81\u89e3\u653e\u7d44\u7e54|\u8499\u53e4\u5206\u88c2\u5206\u5b50|\u5217\u78ba|\u963f\u65fa\u6649\u7f8e|\u85cf\u4eba|\u81e7\u4eba|zang\u4eba|\u85cf\u6c11|\u85cfm|\u9054\u8cf4|\u8cf4\u9054|dalai|\u5660\u8cf4|dl\u5587\u561b|\u4e39\u589e\u5609\u63aa|\u6253\u7838\u6436|\u897f\u7368|\u85cf\u7368|\u846c\u7368|\u81e7\u7368|\u85cf\u6bd2|\u85cfdu|zangdu|\u652f\u6301zd|\u85cf\u66b4\u4e82|\u85cf\u9752\u6703|\u96ea\u5c71\u7345\u5b50\u65d7|\u62c9\u85a9|\u5566\u85a9|\u5566\u6c99|\u5566\u6492|\u62c9sa|lasa|la\u85a9|\u897f\u85cf|\u85cf\u897f|\u85cf\u6625\u95a3|\u85cf\ufffd\u009a|\u85cf\u7368|\u85cf\u7368\u7acb|\u85cf\u5a66\u6703|\u85cf\u9752\u6703|\u85cf\u5b57\u77f3|xizang|xi\u85cf|x\u85cf|\u897fz|tibet|\u5e0c\u846c|\u5e0c\u85cf|\u7852\u85cf|\u7a00\u85cf|\u897f\u9ad2|\u897f\u5958|\u897f\u846c|\u897f\u81e7|\u63f4\u85cf|bjork|\u738b\u5343\u6e90|\u5b89\u62c9|\u56de\u6559|\u56de\u65cf|\u56de\u56de|\u56de\u6c11|\u7a46\u65af\u6797|\u7a46\u7f55\u7a46\u5fb7|\u7a46\u7f55\u9ed8\u5fb7|\u9ed8\u7f55\u9ed8\u5fb7|\u4f0a\u65af\u862d|\u8056\u6230\u7d44\u7e54|\u6e05\u771f|\u6e05zhen|qingzhen|\u771f\u4e3b|\u963f\u62c9\u4f2f|\u9ad8\u9e97\u68d2\u5b50|\u97d3\u570b\u72d7|\u6eff\u6d32\u7b2c\u4e09\u5e1d\u570b|\u6eff\u72d7|\u97c3\u5b50|\u6c5f\u919c\u805e|\u6c5f\u5ae1\u7cfb|\u6c5f\u6bd2|\u6c5f\u7368\u88c1|\u6c5f\u86e4\u87c6|\u6c5f\u6838\u5fc3|\u6c5f\u9ed1\u5fc3|\u6c5f\u80e1\u5167\u9b25|\u6c5f\u798d\u5fc3|\u6c5f\u5bb6\u5e6b|\u6c5f\u7dbf\u6046|\u6c5f\u6d3e\u548c\u80e1\u6d3e|\u6c5f\u6d3e\u4eba\u99ac|\u6c5f\u6cc9\u96c6\u5718|\u6c5f\u4eba\u99ac|\u6c5f\u4e09\u689d\u817f|\u6c5f\u6c0f\u96c6\u5718|\u6c5f\u6c0f\u5bb6\u65cf|\u6c5f\u6c0f\u653f\u6cbb\u5c40|\u6c5f\u6c0f\u653f\u6cbb\u59d4\u54e1|\u6c5f\u68b3\u982d|\u6c5f\u592a\u4e0a|\u6c5f\u6232\u5b50|\u6c5f\u7cfb\u4eba|\u6c5f\u7cfb\u4eba\u99ac|\u6c5f\u5bb0\u6c11|\u6c5f\u8cca|\u6c5f\u8cca\u6c11|\u6c5f\u4e3b\u5e2d|\u9ebb\u679c\u4e38|\u9ebb\u5c07\u900f|\u9ebb\u9189\u5f48|\u9ebb\u9189\u72d7|\u9ebb\u9189\u69cd|\u9ebb\u9189\u0098\u008c|\u9ebb\u9189\u85e5|\u81fa\u7368|\u81fa\u7063|\u4e2d\u5171|\u8a34\u6c42|\u64a4\u56de|\u70ae\u6253|\u5927\u5b57\u5831|\u9023\u8fb2|\u9023\u5102|\u5171\u9b25|\u6b66\u6f22|\u80ba\u708e|\u5c0f\u7c89\u7d05|\u7dad\u5c3c|\u5c0d\u5cb8|\u4e2d\u570b\u4eba|\u7368\u7acb"')
    ]
}]

async function mergeOutsideDanmaku(ssid, ipage, duration, ndanmu, setting = null) {
    if (setting === null) {
        setting = window.setting
    }
    let url = 'https://delflare505.win:800/getBindInfo?ss=' + ssid + '&index=' + ipage
    if (setting.translateNicoComment) {
        url += '&translate=1'
    }
    if (setting.nicoDanmuRate) {
        url += '&niconum=' + Math.floor(ndanmu * setting.nicoDanmuRate)
    }
    if (setting.translateThreshold) {
        url += '&translateThreshold=' +setting.translateThreshold
    }
    let xhrResponse = await xhrGet(url, null, null, 0, true)
    let nicoDanmu = xhrResponse.responseText
    if (nicoDanmu === 'null') {
        return []
    }
    let ldanmu = []
    let lsn = JSON.parse(xhrResponse.getResponseHeader('content-type').slice(25))

    for (let cid of lsn) {
        if (typeof (cid) == 'string') {
            if (cid.startsWith('sn')) {
                let res = await dmFengDanmaku(cid.slice(2), len(ldanmu))
                ldanmu = ldanmu.concat(res)
                console.log('load:' + cid + '(', len(res), ')')
            }
        } else if (cid instanceof Array) {
            for (let dcid of cid[ipage]) {
                ldanmu = ldanmu.concat((await moreFiltedHistory(dcid, duration))[0])
            }
        }
    }
    if (nicoDanmu[0] !== 's') {
        let res = parseNicoResponse(nicoDanmu, len(ldanmu))
        if (setting.replaceKatakana) {
            res = replaceKatakana(res)
        }
        console.log('load niconico(', len(res), ')')
        ldanmu = ldanmu.concat(res)
    }
    ldanmu = await danmuFilter(ldanmu, outsideFliter)
    for (let sn of lsn) {
        if (sn.hasOwnProperty('ss')) {
            let res = []
            let data = JSON.parse(await xhrGet('https://api.bilibili.com/pgc/web/season/section?season_id=' + sn.ss.slice(2)))
            let cid = data.result.main_section.episodes[ipage].cid
            let aid = data.result.main_section.episodes[ipage].aid
            if (sn.hasOwnProperty('offset')) {
                res = (await moreFiltedHistory(cid, duration))[0]
                res = applyOffset(res, sn.offset)
            } else {
                let pagelist = JSON.parse(await xhrGet('https://api.bilibili.com/x/player/pagelist?aid=' + aid + '&jsonp=jsonp'))
                let tDuration = null
                for (let page of pagelist.data) {
                    if (page.cid === cid) {
                        tDuration = page.duration
                    }
                }
                if (duration === tDuration) {
                    res = (await moreFiltedHistory(cid, duration))[0]
                }
            }
            ldanmu = ldanmu.concat(res)
        }
    }
    return ldanmu
}


function bindPath(request) {
    let ldeposide = JSON.parse(request.arg)

    function paste() {
        let bg = chrome.extension.getBackgroundPage();        // get the background page
        bg.document.body.innerHTML = "";                   // clear the background page

// add a DIV, contentEditable=true, to accept the paste action
        let helperdiv = bg.document.createElement("div");
        document.body.appendChild(helperdiv);
        helperdiv.contentEditable = true;

// focus the helper div's content
        let range = document.createRange();
        range.selectNode(helperdiv);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        helperdiv.focus();

// trigger the paste action
        bg.document.execCommand("Paste");

// read the clipboard contents from the helperdiv
        return helperdiv.innerHTML;
    }

    let lpath = paste()
    lpath = lpath.split('"</div><div>"')
    lpath[0] = lpath[0].slice(6)
    lpath[lpath.length - 1] = lpath[lpath.length - 1].slice(0, -7)
    lpath.sort()
    i = -1
    for (deposide of ldeposide) {
        i += 1
        setting.bindedCid[deposide['cid']] = lpath[i]
    }
    console.log(setting.bindedCid)
    let tldldanmu = []
    for (dlanmu of window.ldldanmu) {
        let fbreak = false
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

async function localDanmu(path) {
    let lfdanmu = await localServer('danmuPath', path)
    let ldanmu = []
    if (lfdanmu[0] !== 'failed') {
        let content = null
        let timestamp = null
        for (fdanmu of lfdanmu) {
            let sdanmu = await localServer('read', fdanmu)
            if (sdanmu[0] !== 'failed') {
                let tldanmu = xml2danmu(sdanmu)
                for (danmu of tldanmu) {
                    let ncontent = getDanmuContent(danmu)
                    let ntimestamp = getDanmuDate(danmu)
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

function searchContent(keyword) {
    let res = []
    for (let danmu of window.ldldanmu[window.ldldanmu.length - 1].ldanmu) {
        if (danmu.content.indexOf(keyword) !== -1) {
            console.log(danmu)
            res.push(danmu)
        }
    }
    return res
}

let currentDanmu

// let youtubeCommentDict = {
//     questPool: new Set(),
//     idPool: [],
//     continuePool: []
// }
//
// function buildYoutubeCommentResponse(details) {
//     console.log(details)
//     let aid = /oid=(.*?)&/.exec(details.url)[1]
//
//     let request = null
//     for (let dcid of window.ldldanmu) {
//         if (dcid.aid === aid) {
//             request = dcid
//         }
//     }
//     if (request === null) {
//         return null
//     }
//     let youtubeUrl = request.youtubeUrl
//     const xhr = new XMLHttpRequest();
//     xhr.open("get", 'http://127.0.0.1:800/youtube_comment/?youtubeid=' + youtubeUrl, false);
//     xhr.send()
//     let res = xhr.response
//     console.log(res, xhr)
//     res = JSON.parse(res)
//     console.log(res)
//     let comments = res.comments
//     let head = /callback=(.*?)&/.exec(details.url)[0]
//     let data = {
//         "code": 0,
//         "message": "0",
//         "ttl": 1,
//         "data": {
//             "cursor": {
//                 "all_count": 1,
//                 "is_begin": true,
//                 "prev": 1,
//                 "next": 1,
//                 "is_end": false,
//                 "mode": 2,
//                 "show_type": 1,
//                 "support_mode": [
//                     1,
//                     2,
//                     3
//                 ],
//                 "name": "最新评论"
//             },
//             "hots": null,
//             "notice": null,
//             "replies": [],
//             "top": {
//                 "admin": null,
//                 "upper": null,
//                 "vote": null
//             },
//             "lottery_card": null,
//             "folder": {
//                 "has_folded": false,
//                 "is_folded": false,
//                 "rule": "https://www.bilibili.com/blackboard/foldingreply.html"
//             },
//             "up_selection": {
//                 "pending_count": 0,
//                 "ignore_count": 0
//             },
//             "cm": {},
//             "effects": {
//                 "preloading": ""
//             },
//             "assist": 0,
//             "blacklist": 0,
//             "vote": 0,
//             "lottery": 0,
//             "config": {
//                 "showadmin": 1,
//                 "showentry": 1,
//                 "showfloor": 0,
//                 "showtopic": 1,
//                 "show_up_flag": true,
//                 "read_only": false,
//                 "show_del_log": true
//             },
//             "upper": {
//                 "mid": 492319438
//             },
//             "show_bvid": false,
//             "control": {
//                 "input_disable": false,
//                 "root_input_text": "发一条友善的评论",
//                 "child_input_text": "",
//                 "giveup_input_text": "不发没关系，请继续友善哦~",
//                 "bg_text": "看看下面~来发评论吧",
//                 "web_selection": false,
//                 "answer_guide_text": "需要升级成为lv2会员后才可以评论，先去答题转正吧！",
//                 "answer_guide_icon_url": "http://i0.hdslb.com/bfs/emote/96940d16602cacbbac796245b7bb99fa9b5c970c.png",
//                 "answer_guide_ios_url": "https://www.bilibili.com/h5/newbie/entry?navhide=1\u0026re_src=12",
//                 "answer_guide_android_url": "https://www.bilibili.com/h5/newbie/entry?navhide=1\u0026re_src=6",
//                 "show_type": 1,
//                 "show_text": ""
//             }
//         }
//     }
//     for (let comment of comments) {
//
//         let show_follow = false
//         let cid = 0
//         if (comment.hasOwnProperty('replies')) {
//             youtubeCommentDict.idPool.push(comment.replies)
//             cid = youtubeCommentDict.idPool.length - 1
//             show_follow = true
//         }
//         s = {
//             "rpid": cid,
//             "oid": 0,
//             "type": 1,
//             "mid": 0,
//             "root": 0,
//             "parent": 0,
//             "dialog": 0,
//             "count": 0,
//             "rcount": 0,
//             "floor": 1,
//             "state": 0,
//             "fansgrade": 0,
//             "attr": 0,
//             "ctime": 0,
//             "rpid_str": "0",
//             "root_str": "0",
//             "parent_str": "0",
//             "like": comment.votes,
//             "action": 0,
//             "member": {
//                 "mid": "0",
//                 "uname": comment.author,
//                 "sex": "未知",
//                 "sign": "",
//                 "avatar": comment.photo,
//                 "rank": "10000",
//                 "DisplayRank": "0",
//                 "level_info": {
//                     "current_level": 0,
//                     "current_min": 0,
//                     "current_exp": 0,
//                     "next_exp": 0
//                 },
//                 "pendant": {
//                     "pid": 0,
//                     "name": "",
//                     "image": "",
//                     "expire": 0,
//                     "image_enhance": "",
//                     "image_enhance_frame": ""
//                 },
//                 "nameplate": {
//                     "nid": 0,
//                     "name": "",
//                     "image": "",
//                     "image_small": "",
//                     "level": "",
//                     "condition": ""
//                 },
//                 "official_verify": {
//                     "type": -1,
//                     "desc": ""
//                 },
//                 "vip": {
//                     "vipType": 1,
//                     "vipDueDate": 1611072000000,
//                     "dueRemark": "",
//                     "accessStatus": 0,
//                     "vipStatus": 0,
//                     "vipStatusWarn": "",
//                     "themeType": 0,
//                     "label": {
//                         "path": "",
//                         "text": "",
//                         "label_theme": "",
//                         "text_color": "",
//                         "bg_style": 0,
//                         "bg_color": "",
//                         "border_color": ""
//                     },
//                     "avatar_subscript": 0,
//                     "nickname_color": ""
//                 },
//                 "fans_detail": null,
//                 "following": 0,
//                 "is_followed": 0,
//                 "user_sailing": {
//                     "pendant": null,
//                     "cardbg": null,
//                     "cardbg_with_focus": null
//                 },
//                 "is_contractor": false
//             },
//             "content": {
//                 "message": comment.time + '\n' + comment.text,
//                 "plat": 2,
//                 "device": "",
//                 "members": [],
//                 "jump_url": {},
//                 "max_line": 6
//             },
//             "replies": null,
//             "assist": 0,
//             "folder": {
//                 "has_folded": false,
//                 "is_folded": false,
//                 "rule": "https://www.bilibili.com/blackboard/foldingreply.html"
//             },
//             "up_action": {
//                 "like": false,
//                 "reply": false
//             },
//             "show_follow": show_follow,
//             "invisible": false
//         }
//         data.data.replies.push(s)
//     }
//     return head + JSON.stringify(data) + ')'
// }
//
// var onBeforeSendHeadersListener = function (details) {
//     // view request + headers to be send
//     console.log(details);
//
//     // block XMLHttpRequests by returning object with key "cancel"
//     if (details.type == "xmlhttprequest") {
//         return {
//             cancel: false
//         };
//     }
//
//     // modify the user agent of all script resources by changing the requestHeaders and then return an object with key "requestHeaders"
//     if (details.type == "script") {
//         for (var i = 0; i < details.requestHeaders.length; i++) {
//             if (details.requestHeaders[i].name == "User-Agent") {
//                 details.requestHeaders[i].value = "I'm not a bot";
//             }
//         }
//         return {
//             "requestHeaders": details.requestHeaders
//         };
//     }
// }
//
//
// var onBeforeRequestListener = function (details) {
//     console.log(details)
//     return {cancel: true}
//
//     let mode = /mode=(.*?)&/.exec(details.url)
//
//     if (mode[1] !== "3") {
//         return {cancel: false}
//     }
//     let aid = /oid=(.*?)&/.exec(details.url)[1]
//     if (!youtubeCommentDict.questPool.has(aid)) {
//         youtubeCommentDict.questPool.add(aid)
//         return {cancel: false}
//     } else {
//         youtubeCommentDict.questPool.delete(aid)
//     }
//     let res = buildYoutubeCommentResponse(details)
//     if (res !== null) {
//         // return {cancel:true}
//         redirectUrl = 'data:application/json; charset=utf-8,' + res
//         return {redirectUrl}
//     } else {
//         return {cancel: false}
//     }
//
//     // all images will now be loaded from this location instead
//     // CAREFUL! CROSS ORIGIN REQUESTS WILL NOT BE BLOCKED WITH CHROME EXTENSIONS
//
// }
//
//
// chrome.webRequest.onBeforeRequest.addListener(onBeforeRequestListener, {
//     urls: ["https://s1.hdslb.com/bfs/seed/jinkela/commentpc*"]
// }, ['blocking', 'requestBody']);


chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    function sendResponseAsync(message) {
        if (!message.type) {
            message = {
                type: request.type + '_response',
                content: message
            }
            if (request.timeStamp) {
                message.timeStamp = request.timeStamp
            }
        }
        chrome.tabs.sendMessage(sender.tab.id, message)
    }

    let tabid = sender.tab.id;
    console.log(request.type, request);
    if (request.type === "ajax_hook") {
        if (request.url.indexOf('.so') !== -1) {
            let ret = parse_danmu_url(request.url);
            if (ret) {
                let protocol = ret[1], cid = ret[2], debug = ret[3], url_type = ret[4];
                let ldanmu = null, ndanmu = null
                for (let dldanmu of window.ldldanmu) {
                    if (dldanmu['cid'] === cid) {
                        if (dldanmu.ldanmu == null) {
                            await new Promise(resolve => {
                                function handle(event) {
                                    if (event.data.type !== 'cidCache' || event.data.cid !== cid) {
                                        return
                                    }
                                    window.removeEventListener('message', handle)
                                    resolve()
                                }

                                window.addEventListener("message", handle)
                            })
                        }
                        ldanmu = dldanmu['ldanmu']
                        ndanmu = dldanmu['ndanmu']
                        // console.log('readTemp')
                        break
                    }
                }
                if (ldanmu === null) {
                    if (window.ldldanmu.length > 10) {
                        window.ldldanmu.shift()
                    }
                    window.ldldanmu.push({
                        "aid": request.aid,
                        'cid': cid,
                        'nicoinfo': request.nicoinfo,
                        'youtubeUrl': request.youtubeUrl,
                        'ldanmu': null,
                        'ndanmu': null
                    })
                    if (window.setting.filterRule.length === 0) {
                        ret = await moreHistory(cid, request.duration)
                    } else {
                        ret = await moreFiltedHistory(cid, request.duration)
                    }
                    // inject_panel(tabid)
                    ldanmu = ret[0]
                    ndanmu = ret[1]
                    console.log('ndanmu:' + ldanmu.length + ' from history')
                    let peposide = setting.bindedCid[cid]
                    if (peposide !== undefined) {
                        ldanmu = ldanmu.concat(localDanmu(peposide))
                    }
                    let nicoinfo = request.nicoinfo
                    if (nicoinfo !== null) {
                        console.log('Found niconicoURL:' + nicoinfo)
                        ldanmu = ldanmu.concat(await nicoDanmu(nicoinfo))
                    }
                    let youtubeUrl = request.youtubeUrl
                    if (request.ssid !== null) {
                        ldanmu = ldanmu.concat(await mergeOutsideDanmaku(request.ssid, request.ipage, request.duration, ndanmu))
                    }
                    // if (youtubeUrl !== null) {
                    //     console.log('Found YoutubeURL:' + youtubeUrl)
                    //     ldanmu = ldanmu.concat(await youtubeDanmu(youtubeUrl))
                    // }
                    if (window.ldldanmu.length > 5) {
                        window.ldldanmu.shift()
                    }

                    for (let i = 0; i < window.ldldanmu.length; i += 1) {
                        if (window.ldldanmu[i].cid === cid) {
                            window.ldldanmu[i].ldanmu = ldanmu
                            window.ldldanmu[i].ndanmu = ndanmu
                        }
                    }
                    window.postMessage({type: 'cidCache', cid: cid})
                }
                currentDanmu = ldanmu

                let res
                if (!url_type.startsWith('segment_index')) {
                    console.log('total ndanmu:' + ldanmu.length)
                    res = genxml(ldanmu, ndanmu, cid);
                } else {
                    let segindex = parseInt(url_type.substring(14))
                    if (segindex === 1) {
                        console.log('total ndanmu:' + ldanmu.length)
                    }
                    res = await ldanmu_to_proto_seg(ldanmu, segindex, cid, ndanmu)
                    console.log('cid:', cid, 'segindex:', segindex, 'length', res[1])
                    res = res[0]
                }
                sendResponseAsync({
                    data: res,
                    type: request.type + '_response',
                    href: request.url,
                    ndanmu: ldanmu.length
                });
            } else {
                sendResponseAsync({
                    data: null,
                    type: request.type + '_response',
                    arg: request.arg,
                });
            }
        } else {
            sendResponseAsync({
                data: null,
                type: request.type + '_response',
                arg: request.arg,
            });
        }
        sendResponse()
    } else if (request.type === "bindLocalDanmu") {
        bindPath(request)
        sendResponseAsync()
    } else if (request.type === "getSetting") {
        sendResponseAsync(window.setting)
    } else if (request.type === "parse") {
        sendResponseAsync(await xhrGet(request.url))
    }
});





