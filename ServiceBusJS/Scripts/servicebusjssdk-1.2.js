
/*
    This file has been commented to support Visual Studio Intellisense.

    This script file is the ServiceBus JavaScript SDK.
    (c) by Damir Dobric - daenet GmbH, Frankfurt am Main. All rights reserved.
    It uses the REST protocol to interact with ServiceBus.
    For usage Examples please refer to QueueSamples.html, TopicSamples.html or EventHubSamples.html.
*/

function BrokeredMessage(body, properties) {
    /// <summary>
    /// Defines the brokered message which is sent to service bus and received from service bus.
    /// </summary>
    /// <param name="body" type="object">
    /// The message payload. Any object used as a b ody of the message.
    /// </param>
    /// <param name="properties" type="object">
    /// Message properties.
    /// </param>
    this.body = body;
    this.properties = properties;
}

function EventData(body) {
    /// <summary>
    /// Defines the EventData class which describes the message to be sent 
    /// to EventHub.
    /// </summary>
    /// <param name="body" type="object">
    /// The EventData payload.
    /// </param>
    /// </param>
    this.body = body;
}

function EventHubClient(config) {
    /// <summary>
    /// The class which enables sendng of events to service bus EventHub.
    /// </summary>
    /// <param name="config" type="Object">
    /// 'name': The name of the topic. 'mytopic', 'customers/customer1', 
    /// 'namespace': "your service bus namespace",
    /// 'sasKey': "**cBg=",
    /// 'sasKeyName': the name of the key which defines permission to send events to the hub.",
    /// 'timeOut': Defines the timeout in seconds in communication with service bus endpoint.,
    /// </param>

    if (config.devicename != null)
        config.name = config.name + "/publishers/" + config.devicename;
    else
        config.name = config.name;

    var queueCLient = new QueueClient(config);


    this.sendMessage = function (message, callback) {
        /// <summary>
        /// Sends the message to the Event Hub.
        /// </summary>
        /// <param name="callback" type="function">
        /// function to be invoked after the message has received or receiving process has failed.
        /// </param>
        queueCLient.sendMessage(message, callback);
    }
}

function SubscriptionClient(config) {
    /// <summary>
    /// The class which provides functions for receiving of from topic subscription.
    /// </summary>
    /// <param name="config" type="Object">
    /// 'name': The name of the topic. 'mytopic', 'customers/customer1', 
    /// 'subscription': The name of subscription.
    /// 'namespace': "your service bus namespace",
    /// 'sasKey': "**cBg=",
    /// 'sasKeyName': the name of the key for SAS "device_send_listen",
    /// 'timeOut': Defines the timeout in seconds in communication with service bus endpoint.,
    /// </param>
    config.name = config.name + "/subscriptions/" + config.subscription;
    if (config.subscription == null)
        throw "'supbsription' of specified configuration object property must not be emtpy!";

    var queueClient = new QueueClient(config);

    this.receiveMessage = function (callback) {
        /// <summary>
        /// Receives the message (PeekAndDelete) from the queue and deletes it.
        /// </summary>
        /// <param name="callback" type="function">
        /// function to be invoked after the message has received or receiving process has failed.
        /// </param>
        queueClient.receiveMessage(callback);
    },

    
    this.peekLockMessage = function (callback) {
        /// <summary>
        /// Receives the message (PeekAndLock) and locks it.
        /// Property 'brokeredMessage.properties.Location' on object 'messagingResult' which is retrieved as argument of 
        /// a 'callback' function, holds the 'lockUrl'.
        /// The 'lockUrl' should be used as input for Abandon() and Complete() functions.
        /// </summary>
        /// <param name="callback" type="function">
        /// function to be invoked after the message has received or receiving process has failed.
        /// </param>    
        queueClient.peekLockMessage(callback);
    },
    
    
    this.abandonMessage = function (lockUri, callback) {
        /// <summary>
        ///  Unlocks the previously locked message and makes it apper the message in the subscription queue again.
        /// </summary>
        /// <param name="callback" type="function">
        /// function to be invoked after the message has received or receiving process has failed.
        /// </param>
        /// <param name="lockUri" type="function">
        /// The URI which has been previouslly retrieved by peekLockMessage() function.
        /// </param>
        queueClient.abandonMessage(lockUri, callback);
    },


    
    this.completeMessage = function (lockUri, callback) {
        /// <summary>
        ///  Unlocks the previously locked message and deletes it physically from the subscription queue.
        /// </summary>
        /// <param name="callback" type="function">
        /// function to be invoked after the message has received or receiving process has failed.
        /// </param>
        /// <param name="lockUri" type="function">
        /// The URI which has been previouslly retrieved by peekLockMessage() function.
        /// </param>
        queueClient.completeMessage(lockUri, callback);
    }
}

function TopicClient(config) {
    /// <summary>
    /// The class which provides functions to send messages to service bus topic.
    /// </summary>
    /// <param name="config" type="Object">
    /// 'name': The name of the topic. 'mytopic', 'customers/customer1', 
    /// 'namespace': "your service bus namespace",
    /// 'sasKey': "**cBg=",
    /// 'sasKeyName': the name of the key for SAS "device_send_listen",
    /// 'timeOut': Defines the timeout in seconds in communication with service bus endpoint.,
    /// </param>
    var queueCLient = new QueueClient(config);

   
    this.sendMessage = function (message, callback) {
        /// <summary>
        /// Sends the message to the topic.
        /// </summary>
        /// <param name="callback" type="function">
        /// function to be invoked after the message has received or receiving process has failed.
        /// </param>
        queueCLient.sendMessage(message, callback);
    }
}

function QueueClient(config) {
    /// <summary>
    /// The class which provides functions for sending messages to the queue and for receiving messages from queue.
    /// </summary>
    /// <param name="config" type="Object">
    /// 'name': the name of the queue. 'myqueue', 'customers/customer1', 
    /// 'namespace': "your service bus namespace",
    /// 'sasKey': "**cBg=",
    /// 'sasKeyName': the name of the key for SAS "device_send_listen",
    /// 'sasToken': shared access token string,
    /// 'timeOut': Defines the timeout in seconds in communication with service bus endpoint.,
    /// </param>
    var m_EntityName = "Please provide the queue name. For example 'customer/orders'";

    var m_Timeout = 60;

    var m_ServiceNamespace;

    var m_SasKey = "provide SAS key";

    var m_SasKeyName = "provide the SAS key name.";

    var m_SasToken = null;

    m_ServiceNamespace = config.namespace;

    if (config.name != null)
        m_EntityName = config.name;
    if (config.sasKey != null)
        m_SasKey = config.sasKey;
    if (config.sasKeyName != null)
        m_SasKeyName = config.sasKeyName;
    if (config.timeOut != null)
        m_Timeout = config.timeOut;
    if (config.sasToken != null)
        m_SasToken = config.sasToken;
    if (config.contentType == null)
        m_ContentType = "application/json";

    function MessagingResult(result, httpStatusCode, msg) {
        this.result = result;
        this.httpStatusCode = httpStatusCode;
        this.brokeredMessage = msg;
    }

    
    var getUri = function (entityName, head) {
        var entityUri = "https://" + m_ServiceNamespace + ".servicebus.windows.net/" + entityName;
        var uri;
        if (head == null)
            uri = entityUri + "/messages/?timeout=" + m_Timeout;
        else
            uri = entityUri + "/messages/" + head + "/?timeout=" + m_Timeout;

        return uri;
    }

    var getToken = function () {
        if (m_SasToken === null) {
            return generateToken(m_EntityName);
        } else {
            return m_SasToken;
        }
    };

    // Creates shared access signature token.
    var generateToken = function (entityPath) {

        var uri = "http://" + m_ServiceNamespace + ".servicebus.windows.net/" + entityPath;

        var endocedResourceUri = encodeURIComponent(uri);

        var t0 = new Date(1970, 1, 1, 0, 0, 0, 0);
        var t1 = new Date();
        //var expireInSeconds = +(31 * 24 * 3600) + 3600 + (((t1.getTime() - t0.getTime()) / 1000) | 0);
        var expireInSeconds = expireInSeconds = (Date.now() / 1000) + 3600;
        var plainSignature = utf8Encode(endocedResourceUri + "\n" + expireInSeconds);

        var hash = CryptoJS.HmacSHA256(plainSignature, m_SasKey);
        var base64HashValue = CryptoJS.enc.Base64.stringify(hash);

        var token = "SharedAccessSignature sr=" + endocedResourceUri + "&sig=" + encodeURIComponent(base64HashValue) + "&se=" + expireInSeconds + "&skn=" + m_SasKeyName;

        return token;
    }


    var utf8Encode = function (s) {
        for (var c, i = -1, l = (s = s.split("")).length, o = String.fromCharCode; ++i < l;
            s[i] = (c = s[i].charCodeAt(0)) >= 127 ? o(0xc0 | (c >>> 6)) + o(0x80 | (c & 0x3f)) : s[i]
        );
        return s.join("");
    }


    var utf8Decode = function (s) {
        for (var a, b, i = -1, l = (s = s.split("")).length, o = String.fromCharCode, c = "charCodeAt"; ++i < l;
            ((a = s[i][c](0)) & 0x80) &&
            (s[i] = (a & 0xfc) == 0xc0 && ((b = s[i + 1][c](0)) & 0xc0) == 0x80 ?
            o(((a & 0x03) << 6) + (b & 0x3f)) : o(128), s[++i] = "")
        );
        return s.join("");
    }

    var getResponseHeaders = function (headerStr) {
        var headers = {};
        if (!headerStr) {
            return headers;
        }
        var headerPairs = headerStr.split('\u000d\u000a');
        for (var i = 0; i < headerPairs.length; i++) {
            var headerPair = headerPairs[i];
            // Can't use split() here because it does the wrong thing
            // if the header value has the string ": " in it.
            var index = headerPair.indexOf('\u003a\u0020');
            if (index > 0) {
                var key = headerPair.substring(0, index);
                var val = headerPair.substring(index + 2);
                headers[key] = val;
            }
        }
        return headers;
    }


    this.sendMessage = function (message, callback) {
        /// <summary>
        /// Sends the message to the queue.
        /// </summary>
        /// <param name="callback" type="function">
        /// function to be invoked after the message has received or receiving process has failed.
        /// </param>
        var body = JSON.stringify(message.body);
        var props = message.properties;

        var securityToken = getToken();
        var sendUri = getUri(m_EntityName);
        var xmlHttpRequest = new XMLHttpRequest();

        xmlHttpRequest.open("POST", sendUri, true);
        xmlHttpRequest.setRequestHeader('Content-Type', m_ContentType);
        xmlHttpRequest.setRequestHeader("Authorization", securityToken);

        if (props != null) {
            for (var i = 0; i < props.length; i++) {
                if (props[i].Name == null || props[i].Value == null) {

                    if (callback != null) {
                        messagingResult = new MessagingResult("The list of properties must contain pair values {'Name': ***, 'Value': ***}", this.status, null, this.response);
                        callback(messagingResult);
                    }
                }
                else
                    xmlHttpRequest.setRequestHeader(props[i].Name, props[i].Value);
            }
        }

        xmlHttpRequest.onreadystatechange = function () {

            if (this.readyState == 4) {

                var messagingResult;

                // 
                // Service Bus returns HTTP code 201 (means created) when the message is persisted in the queue / topic.
                if (this.status == 201) {
                    messagingResult = new MessagingResult("Success", this.status, null, this.response);
                }
                else {
                    messagingResult = new MessagingResult("Failure", this.status, null, this.response);
                }

                if (callback != null)
                    callback(messagingResult);
            }
        };

        xmlHttpRequest.send(body);
    },

    // Receives the message from the queue and deletes it.
    this.receiveMessage = function (callback) {
        /// <summary>
        /// Receives the message (PeekAndDelete) from the queue and deletes it.
        /// </summary>
        /// <param name="callback" type="function">
        /// function to be invoked after the message has received or receiving process has failed.
        /// </param>
        var securityToken = getToken();

        var xmlHttpRequest = new XMLHttpRequest();
        var receiveUri = getUri(m_EntityName, "head");
        xmlHttpRequest.open("DELETE", receiveUri, true);
        xmlHttpRequest.setRequestHeader("Authorization", securityToken);
        xmlHttpRequest.onreadystatechange = function () {
            if (this.readyState == 4) {

                var messagingResult;

                // Expects a HTTP-200 (OK) when the a message is received from a queue / subscription
                if (this.status == 200) {

                    var allHeaders = getResponseHeaders(this.getAllResponseHeaders());

                    allHeaders.brokerProperties = eval('(' + this.getResponseHeader("BrokerProperties") + ')');

                    messagingResult = new MessagingResult("Success", this.status, new BrokeredMessage(this.response, allHeaders));
                }
                    // Expects a HTTP-204 (No Content) when no messages are available in the queue / subscription
                else if (this.status == 204) {
                    messagingResult = new MessagingResult("Empty", this.status, new BrokeredMessage(this.response));
                }
                else {
                    messagingResult = new MessagingResult("Failure", this.status, new BrokeredMessage(this.response));
                }

                callback(messagingResult);
            }
        };

        xmlHttpRequest.send(null);
    },

    // Receives the message and locks it.
    this.peekLockMessage = function (callback) {
        /// <summary>
        /// Receives the message (PeekAndLock) and locks it.
        /// Property 'brokeredMessage.properties.Location' on object 'messagingResult' which is retrieved as argument of 
        /// a 'callback' function, holds the 'lockUrl'.
        /// The 'lockUrl' should be used as input for Abandon() and Complete() functions.
        /// </summary>
        /// <param name="callback" type="function">
        /// function to be invoked after the message has received or receiving process has failed.
        /// </param>      
        var securityToken = getToken();
        var uri = getUri(m_EntityName, "head");

        var xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.open("POST", uri, true);
        xmlHttpRequest.setRequestHeader("Authorization", securityToken);
        xmlHttpRequest.onreadystatechange = function () {
            if (this.readyState == 4) {

                var messagingResult;

                // Expects a HTTP-201 (Created) when a message from the queue / subscription Peek-Locked
                if (this.status == 201) {

                    var allHeaders = getResponseHeaders(this.getAllResponseHeaders());

                    allHeaders.brokerProperties = eval('(' + this.getResponseHeader("BrokerProperties") + ')');

                    messagingResult = new MessagingResult("Success", this.status, new BrokeredMessage(this.response, allHeaders));
                }
                    // Expects a HTTP-204 (No Content) when no messages are available in the queue / subscription for peeklock
                else if (this.status == 204) {
                    messagingResult = new MessagingResult("Empty", this.status, new BrokeredMessage(this.response));
                }
                else {
                    messagingResult = new MessagingResult("Failure", this.status, new BrokeredMessage(this.response));
                }

                if (callback != null)
                    callback(messagingResult);
            }
        };

        xmlHttpRequest.send(null);
    },


    // Unlocks the previously locked message.
    this.abandonMessage = function (lockUri, callback) {
        /// <summary>
        /// Unlocks the previously locked message and makes it apper the message in the subscription queue again.
        /// </summary>
        /// <param name="callback" type="function">
        /// function to be invoked after the message has received or receiving process has failed.
        /// </param>
        /// <param name="lockUri" type="function">
        /// The URI which has been previouslly retrieved by peekLockMessage() function.
        /// </param>
        var xmlHttpRequest = new XMLHttpRequest();
        var securityToken = getToken();

        xmlHttpRequest.open("PUT", lockUri, true);
        xmlHttpRequest.setRequestHeader("Authorization", securityToken);
        xmlHttpRequest.onreadystatechange = function () {
            if (this.readyState == 4) {

                var messagingResult;

                // Expects a HTTP-200 (OK) when the a peek-locked message is abandoned from a queue / subscription
                if (this.status == 200) {
                    messagingResult = new MessagingResult("Success", this.status, new BrokeredMessage(this.response));
                }
                else {
                    messagingResult = new MessagingResult("Failure", this.status, new BrokeredMessage(this.response));
                }

                callback(messagingResult);
            }
        };

        xmlHttpRequest.send(null);
    },


  
    this.completeMessage = function (lockUri, callback) {
        /// <summary>
        ///  Unlocks the previously locked message and deletes it physically from the subscription queue.
        /// </summary>
        /// <param name="callback" type="function">
        /// function to be invoked after the message has received or receiving process has failed.
        /// </param>
        /// <param name="lockUri" type="function">
        /// The URI which has been previouslly retrieved by peekLockMessage() function.
        /// </param>
        var securityToken = getToken();
        var xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.open("DELETE", lockUri, true);
        xmlHttpRequest.setRequestHeader("Authorization", securityToken);
        xmlHttpRequest.onreadystatechange = function () {
            if (this.readyState == 4) {

                var messagingResult;

                // Expects a HTTP-200 (OK) when the a peek-locked message is completed from a queue / subscription
                if (this.status == 200) {
                    messagingResult = new MessagingResult("Success", this.status, new BrokeredMessage(this.response));
                }
                else {
                    messagingResult = new MessagingResult("Failure", this.status, new BrokeredMessage(this.response));
                }

                callback(messagingResult);
            }
        };

        xmlHttpRequest.send(null);
    }
}



/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS = CryptoJS || function (h, i) {
    var e = {}, f = e.lib = {}, l = f.Base = function () { function a() { } return { extend: function (j) { a.prototype = this; var d = new a; j && d.mixIn(j); d.$super = this; return d }, create: function () { var a = this.extend(); a.init.apply(a, arguments); return a }, init: function () { }, mixIn: function (a) { for (var d in a) a.hasOwnProperty(d) && (this[d] = a[d]); a.hasOwnProperty("toString") && (this.toString = a.toString) }, clone: function () { return this.$super.extend(this) } } }(), k = f.WordArray = l.extend({
        init: function (a, j) {
            a =
            this.words = a || []; this.sigBytes = j != i ? j : 4 * a.length
        }, toString: function (a) { return (a || m).stringify(this) }, concat: function (a) { var j = this.words, d = a.words, c = this.sigBytes, a = a.sigBytes; this.clamp(); if (c % 4) for (var b = 0; b < a; b++) j[c + b >>> 2] |= (d[b >>> 2] >>> 24 - 8 * (b % 4) & 255) << 24 - 8 * ((c + b) % 4); else if (65535 < d.length) for (b = 0; b < a; b += 4) j[c + b >>> 2] = d[b >>> 2]; else j.push.apply(j, d); this.sigBytes += a; return this }, clamp: function () { var a = this.words, b = this.sigBytes; a[b >>> 2] &= 4294967295 << 32 - 8 * (b % 4); a.length = h.ceil(b / 4) }, clone: function () {
            var a =
            l.clone.call(this); a.words = this.words.slice(0); return a
        }, random: function (a) { for (var b = [], d = 0; d < a; d += 4) b.push(4294967296 * h.random() | 0); return k.create(b, a) }
    }), o = e.enc = {}, m = o.Hex = { stringify: function (a) { for (var b = a.words, a = a.sigBytes, d = [], c = 0; c < a; c++) { var e = b[c >>> 2] >>> 24 - 8 * (c % 4) & 255; d.push((e >>> 4).toString(16)); d.push((e & 15).toString(16)) } return d.join("") }, parse: function (a) { for (var b = a.length, d = [], c = 0; c < b; c += 2) d[c >>> 3] |= parseInt(a.substr(c, 2), 16) << 24 - 4 * (c % 8); return k.create(d, b / 2) } }, q = o.Latin1 = {
        stringify: function (a) {
            for (var b =
            a.words, a = a.sigBytes, d = [], c = 0; c < a; c++) d.push(String.fromCharCode(b[c >>> 2] >>> 24 - 8 * (c % 4) & 255)); return d.join("")
        }, parse: function (a) { for (var b = a.length, d = [], c = 0; c < b; c++) d[c >>> 2] |= (a.charCodeAt(c) & 255) << 24 - 8 * (c % 4); return k.create(d, b) }
    }, r = o.Utf8 = { stringify: function (a) { try { return decodeURIComponent(escape(q.stringify(a))) } catch (b) { throw Error("Malformed UTF-8 data"); } }, parse: function (a) { return q.parse(unescape(encodeURIComponent(a))) } }, b = f.BufferedBlockAlgorithm = l.extend({
        reset: function () {
            this._data = k.create();
            this._nDataBytes = 0
        }, _append: function (a) { "string" == typeof a && (a = r.parse(a)); this._data.concat(a); this._nDataBytes += a.sigBytes }, _process: function (a) { var b = this._data, d = b.words, c = b.sigBytes, e = this.blockSize, g = c / (4 * e), g = a ? h.ceil(g) : h.max((g | 0) - this._minBufferSize, 0), a = g * e, c = h.min(4 * a, c); if (a) { for (var f = 0; f < a; f += e) this._doProcessBlock(d, f); f = d.splice(0, a); b.sigBytes -= c } return k.create(f, c) }, clone: function () { var a = l.clone.call(this); a._data = this._data.clone(); return a }, _minBufferSize: 0
    }); f.Hasher = b.extend({
        init: function () { this.reset() },
        reset: function () { b.reset.call(this); this._doReset() }, update: function (a) { this._append(a); this._process(); return this }, finalize: function (a) { a && this._append(a); this._doFinalize(); return this._hash }, clone: function () { var a = b.clone.call(this); a._hash = this._hash.clone(); return a }, blockSize: 16, _createHelper: function (a) { return function (b, d) { return a.create(d).finalize(b) } }, _createHmacHelper: function (a) { return function (b, d) { return g.HMAC.create(a, d).finalize(b) } }
    }); var g = e.algo = {}; return e
}(Math);
(function (h) {
    var i = CryptoJS, e = i.lib, f = e.WordArray, e = e.Hasher, l = i.algo, k = [], o = []; (function () { function e(a) { for (var b = h.sqrt(a), d = 2; d <= b; d++) if (!(a % d)) return !1; return !0 } function f(a) { return 4294967296 * (a - (a | 0)) | 0 } for (var b = 2, g = 0; 64 > g;) e(b) && (8 > g && (k[g] = f(h.pow(b, 0.5))), o[g] = f(h.pow(b, 1 / 3)), g++), b++ })(); var m = [], l = l.SHA256 = e.extend({
        _doReset: function () { this._hash = f.create(k.slice(0)) }, _doProcessBlock: function (e, f) {
            for (var b = this._hash.words, g = b[0], a = b[1], j = b[2], d = b[3], c = b[4], h = b[5], l = b[6], k = b[7], n = 0; 64 >
            n; n++) { if (16 > n) m[n] = e[f + n] | 0; else { var i = m[n - 15], p = m[n - 2]; m[n] = ((i << 25 | i >>> 7) ^ (i << 14 | i >>> 18) ^ i >>> 3) + m[n - 7] + ((p << 15 | p >>> 17) ^ (p << 13 | p >>> 19) ^ p >>> 10) + m[n - 16] } i = k + ((c << 26 | c >>> 6) ^ (c << 21 | c >>> 11) ^ (c << 7 | c >>> 25)) + (c & h ^ ~c & l) + o[n] + m[n]; p = ((g << 30 | g >>> 2) ^ (g << 19 | g >>> 13) ^ (g << 10 | g >>> 22)) + (g & a ^ g & j ^ a & j); k = l; l = h; h = c; c = d + i | 0; d = j; j = a; a = g; g = i + p | 0 } b[0] = b[0] + g | 0; b[1] = b[1] + a | 0; b[2] = b[2] + j | 0; b[3] = b[3] + d | 0; b[4] = b[4] + c | 0; b[5] = b[5] + h | 0; b[6] = b[6] + l | 0; b[7] = b[7] + k | 0
        }, _doFinalize: function () {
            var e = this._data, f = e.words, b = 8 * this._nDataBytes,
            g = 8 * e.sigBytes; f[g >>> 5] |= 128 << 24 - g % 32; f[(g + 64 >>> 9 << 4) + 15] = b; e.sigBytes = 4 * f.length; this._process()
        }
    }); i.SHA256 = e._createHelper(l); i.HmacSHA256 = e._createHmacHelper(l)
})(Math);
(function () {
    var h = CryptoJS, i = h.enc.Utf8; h.algo.HMAC = h.lib.Base.extend({
        init: function (e, f) { e = this._hasher = e.create(); "string" == typeof f && (f = i.parse(f)); var h = e.blockSize, k = 4 * h; f.sigBytes > k && (f = e.finalize(f)); for (var o = this._oKey = f.clone(), m = this._iKey = f.clone(), q = o.words, r = m.words, b = 0; b < h; b++) q[b] ^= 1549556828, r[b] ^= 909522486; o.sigBytes = m.sigBytes = k; this.reset() }, reset: function () { var e = this._hasher; e.reset(); e.update(this._iKey) }, update: function (e) { this._hasher.update(e); return this }, finalize: function (e) {
            var f =
            this._hasher, e = f.finalize(e); f.reset(); return f.finalize(this._oKey.clone().concat(e))
        }
    })
})();


/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
    var h = CryptoJS, i = h.lib.WordArray; h.enc.Base64 = {
        stringify: function (b) { var e = b.words, f = b.sigBytes, c = this._map; b.clamp(); for (var b = [], a = 0; a < f; a += 3) for (var d = (e[a >>> 2] >>> 24 - 8 * (a % 4) & 255) << 16 | (e[a + 1 >>> 2] >>> 24 - 8 * ((a + 1) % 4) & 255) << 8 | e[a + 2 >>> 2] >>> 24 - 8 * ((a + 2) % 4) & 255, g = 0; 4 > g && a + 0.75 * g < f; g++) b.push(c.charAt(d >>> 6 * (3 - g) & 63)); if (e = c.charAt(64)) for (; b.length % 4;) b.push(e); return b.join("") }, parse: function (b) {
            var b = b.replace(/\s/g, ""), e = b.length, f = this._map, c = f.charAt(64); c && (c = b.indexOf(c), -1 != c && (e = c));
            for (var c = [], a = 0, d = 0; d < e; d++) if (d % 4) { var g = f.indexOf(b.charAt(d - 1)) << 2 * (d % 4), h = f.indexOf(b.charAt(d)) >>> 6 - 2 * (d % 4); c[a >>> 2] |= (g | h) << 24 - 8 * (a % 4); a++ } return i.create(c, a)
        }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    }
})();


