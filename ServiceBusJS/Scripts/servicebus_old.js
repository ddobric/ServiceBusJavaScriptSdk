// This script file is the ServiceBus JavaScript SDK.
// It uses the REST protocol to interact with ServiceBus.
// For usage Examples pls refer to ServiceBusQueueSamples.html or ServiceBusTopicSamples.html

(function () {

    function MessagingResult(result, httpStatusCode, msgProperties, body) {
        this.result = result;
        this.httpStatusCode = httpStatusCode;
        this.properties = msgProperties;
        this.body = body;
    }

    var m_Timeout = 60;

    var m_ServiceNamespace;

    var m_SasKey = "";

    var m_SasKeyName = "device_send_listen";

    var getUri = function (entityName, head) {
        var entityUri = "https://" + m_ServiceNamespace + ".servicebus.windows.net/" + entityName;
        var uri;
        if (head == null)
            uri = entityUri + "/messages/?timeout=" + m_Timeout;
        else
            uri = entityUri + "/messages/" + head + "/?timeout=" + m_Timeout;

        return uri;
    }

    // Creates shared access signature token.
    var getToken = function (entityPath) {

        var uri = "http://" + m_ServiceNamespace + ".servicebus.windows.net/" + entityPath;

        var endocedResourceUri = encodeURIComponent(uri);

        var t0 = new Date(1970, 1, 1, 0, 0, 0, 0);
        var t1 = new Date();
        var expireInSeconds = +(31 * 24 * 3600) + 3600 + (((t1.getTime() - t0.getTime()) / 1000) | 0);

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


    var ServiceBus = {

        environment: "servicebus.windows.net",//"servicebus.windows-bvt.net",

        initialize: function (config) {
            m_ServiceNamespace = config.namespace;
            if (config.sasKey != null)
                m_SasKey = config.sasKey;
            if (config.sasKeyName != null)
                m_SasKeyName = config.sasKeyName;
            if (config.timeOut != null)
                m_Timeout = config.timeOut;
        },


        // Sends the message to the queue.
        sendMessage: function (entityName, body, contentType, callback, props) {
            var securityToken = getToken(entityName);
            //var entityUri = "https://" + m_ServiceNamespace + "." + this.environment + "/" + entityName;
            //var sendUri = entityUri + "/messages/?timeout=60";
            var sendUri = getUri(entityName);
            var xmlHttpRequest = new XMLHttpRequest();

            xmlHttpRequest.open("POST", sendUri, true);
            xmlHttpRequest.setRequestHeader('Content-Type', contentType);
            xmlHttpRequest.setRequestHeader("Authorization", securityToken);

            if (props != null) {
                for (var i = 0; i < props.length; i++) {
                    if (props[i].Name == null || props[i].Value == null) {

                        if(callback != null)
                        {
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
        receiveMessage: function (entityName, callback) {

            var securityToken = getToken(entityName);

            var xmlHttpRequest = new XMLHttpRequest();
            var receiveUri = getUri(entityName, "head");
            xmlHttpRequest.open("DELETE", receiveUri, true);
            xmlHttpRequest.setRequestHeader("Authorization", securityToken);
            xmlHttpRequest.onreadystatechange = function () {
                if (this.readyState == 4) {

                    var messagingResult;

                    // Expects a HTTP-200 (OK) when the a message is received from a queue / subscription
                    if (this.status == 200) {

                        var brokerProperties = eval('(' + this.getResponseHeader("BrokerProperties") + ')');
                        brokerProperties.ContentType = this.getResponseHeader("Content-Type");
                        brokerProperties.ContentType = this.getResponseHeader("Content-Type");

                        messagingResult = new MessagingResult("Success", this.status, brokerProperties, this.response);
                    }
                        // Expects a HTTP-204 (No Content) when no messages are available in the queue / subscription
                    else if (this.status == 204) {
                        messagingResult = new MessagingResult("Empty", this.status, null, this.response);
                    }
                    else {
                        messagingResult = new MessagingResult("Failure", this.status, null, this.response);
                    }

                    callback(messagingResult);
                }
            };

            xmlHttpRequest.send(null);
        },

        // Receives the message and locks it.
        peekLockMessage: function (entityName, callback) {

            var securityToken = getToken(entityName);
            var uri = getUri(entityName, "head");

            var xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.open("POST", uri, true);
            xmlHttpRequest.setRequestHeader("Authorization", securityToken);
            xmlHttpRequest.onreadystatechange = function () {
                if (this.readyState == 4) {

                    var messagingResult;

                    // Expects a HTTP-201 (Created) when a message from the queue / subscription Peek-Locked
                    if (this.status == 201) {

                        var brokerProperties = eval('(' + this.getResponseHeader("BrokerProperties") + ')');
                        brokerProperties.LockUri = this.getResponseHeader("Location");
                        brokerProperties.ContentType = this.getResponseHeader("Content-Type");

                        messagingResult = new MessagingResult("Success", this.status, brokerProperties, this.response);
                    }
                        // Expects a HTTP-204 (No Content) when no messages are available in the queue / subscription for peeklock
                    else if (this.status == 204) {
                        messagingResult = new MessagingResult("Empty", this.status, null, this.response);
                    }
                    else {
                        messagingResult = new MessagingResult("Failure", this.status, null, this.response);
                    }

                    if (callback != null)
                        callback(messagingResult);
                }
            };

            xmlHttpRequest.send(null);
        },


        // Unlocks the previously locked message.
        abandonMessage: function (entityName, lockUri, callback) {

            var xmlHttpRequest = new XMLHttpRequest();
            var securityToken = getToken(entityName);

            xmlHttpRequest.open("PUT", lockUri, true);
            xmlHttpRequest.setRequestHeader("Authorization", securityToken);
            xmlHttpRequest.onreadystatechange = function () {
                if (this.readyState == 4) {

                    var messagingResult;

                    // Expects a HTTP-200 (OK) when the a peek-locked message is abandoned from a queue / subscription
                    if (this.status == 200) {
                        messagingResult = new MessagingResult("Success", this.status, null, this.response);
                    }
                    else {
                        messagingResult = new MessagingResult("Failure", this.status, null, this.response);
                    }

                    callback(messagingResult);
                }
            };

            xmlHttpRequest.send(null);
        },

        // Remove the message from the queue.
        completeMessage: function (entity, lockUri, callback) {

            var xmlHttpRequest = new XMLHttpRequest();
            //var entityUri = "https://" + m_ServiceNamespace + "." + this.environment + "/" + entityName;
            //var securityToken = getToken(entityName);
            xmlHttpRequest.open("DELETE", lockUri, true);
            xmlHttpRequest.setRequestHeader("Authorization", securityToken);
            xmlHttpRequest.onreadystatechange = function () {
                if (this.readyState == 4) {

                    var messagingResult;

                    // Expects a HTTP-200 (OK) when the a peek-locked message is completed from a queue / subscription
                    if (this.status == 200) {
                        messagingResult = new MessagingResult("Success", this.status, null, this.response);
                    }
                    else {
                        messagingResult = new MessagingResult("Failure", this.status, null, this.response);
                    }

                    callback(messagingResult);
                }
            };

            xmlHttpRequest.send(null);
        }
    }

    if (!window.SB) { window.SB = ServiceBus; }

})();