var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class MoonLightError extends Error {
}
export class Jet {
    constructor(options) {
        // let configOptions = ÷{...configuration, ...options} // merge what the user sent with what we have, override defaults
        this.baseUrl = (options === null || options === void 0 ? void 0 : options.baseUrl) || null;
        this.token = (options === null || options === void 0 ? void 0 : options.token) || null;
        this.tokenBearerKey = (options === null || options === void 0 ? void 0 : options.tokenBearerKey) || 'SecretKey';
        this.sendTokenAs = (options === null || options === void 0 ? void 0 : options.sendTokenAs) || 'Bearer';
        this.interceptWithJWTAuth = (options === null || options === void 0 ? void 0 : options.interceptWithJWTAuth) || false;
        this.headers = (options === null || options === void 0 ? void 0 : options.defaultHeaders) || {};
        this.cachable = (options === null || options === void 0 ? void 0 : options.cachable) || true;
        this.moonlightSuccessCode = (options === null || options === void 0 ? void 0 : options.moonlightSuccessCode) || 0;
        this.moonlightErrorhandler = (options === null || options === void 0 ? void 0 : options.moonlightErrorhandler) || undefined;
        this.internalErrorCode = this.moonlightSuccessCode ? this.moonlightSuccessCode + 1000 : 1000;
    }
    attachAuthorisation() {
        // if the dev provided the token, use that, otherwise, attempt to get it from the localstorage
        const token = this.token || localStorage.getItem(this.tokenBearerKey);
        if (token) {
            return this.generateAuthHeader(this.token);
        }
        return null;
    }
    generateAuthHeader(token) {
        if (token) {
            const headerString = {
                Authorization: '',
            };
            headerString.Authorization = this.sendTokenAs + ' ' + token;
            return headerString;
        }
        return null;
    }
    flyer(url, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (url) {
                    const response = yield fetch(url, data);
                    const resData = yield response.json();
                    const res = {
                        response,
                        data: resData,
                    };
                    return Promise.resolve(res);
                }
                return Promise.reject('Request url undefined, are you sure you defined your baseUrl');
            }
            catch (err) {
                return Promise.reject(err);
            }
        });
    }
    /**
     * Checks if an object is empty
     * @param {object} obj The object to check
     * @returns bool
     */
    isEmpty(obj) {
        if (!obj) {
            return true;
        }
        else if (Object.keys(obj).length === 0) {
            return true;
        }
        return false;
    }
    /**
     * Sets the body part of the request
     * @param {object} body-> Request body
     * @param {object} config-> Request configurations
     * @returns Object -> Configuration with body combined
     */
    _setBody(body, config) {
        if (body && config) {
            config.body = JSON.stringify(body);
        }
        return config;
    }
    _setType(config, type) {
        config = Object.assign(Object.assign({}, config), { method: type });
        return config;
    }
    _getHeaders() {
        const obj = {
            cache: 'default',
        };
        if (!this.cachable) {
            obj.cache = 'no-cache';
        }
        return Object.assign(Object.assign({}, this.headers), obj);
    }
    _setHeaders(headers) {
        return Object.assign(Object.assign({}, this._getHeaders()), headers);
    }
    _setUrl(url) {
        if (this.baseUrl) {
            let newBase = this.baseUrl;
            let newLink = url;
            if (newBase.charAt(newBase.length - 1) !== '/') {
                newBase = newBase + '/';
            }
            if ((newLink === null || newLink === void 0 ? void 0 : newLink.charAt(0)) === '/') {
                newLink = newLink.substring(1, newLink.length - 1);
            }
            return `${newBase}${newLink}`;
        }
        return url;
    }
    _extractHeadersFromConfigs(config) {
        const configKeys = config ? Object.keys(config) : [];
        if (configKeys.length > 0 && config.headers) {
            this._setHeaders(config.headers);
        }
        // set the default content-type to application/json if non was provided
        if (!('Content-Type' in this.headers)) {
            this._setHeaders({ 'Content-Type': 'application/json' });
        }
        return this.headers;
    }
    __attach_auth() {
        if (this.interceptWithJWTAuth) {
            const auth = this.attachAuthorisation();
            // if it has something from auth, lets use it
            if (auth && !('Authorization' in this.headers)) {
                this._setHeaders({ Authorization: auth === null || auth === void 0 ? void 0 : auth.Authorization });
            }
        }
        return this.headers;
    }
    /**
     * Populates the body and configurations of the request, should not be called directly from the instannce
     * @protected
     * @param {object} body Request body/data
     * @author jet2018
     * @param {object} configs Request configurations such as headers and any other settings
     * @see [customising fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_your_own_request_object)
     * @param headers Request headers
     * @param {string} type Request type, that is, post, get, put ...
     * @returns Object
     */
    _populateData(type = 'GET', body, headers, configs, secure = false) {
        // set the body if the request is not get
        let newConfigs = {};
        if (body && type !== 'GET') {
            configs = Object.assign(Object.assign({}, configs), { body: JSON.stringify(body) });
        }
        // attach the headers
        if (headers !== null && configs) {
            configs.headers = this._setHeaders(headers);
        }
        newConfigs = Object.assign(Object.assign({}, configs), this._setType(configs, type));
        newConfigs = Object.assign(Object.assign(Object.assign({}, newConfigs), configs), this._extractHeadersFromConfigs(newConfigs));
        if (secure) {
            // if it a secure request, attach the token
            newConfigs = Object.assign(Object.assign(Object.assign({}, newConfigs), configs), this.__attach_auth());
        }
        return newConfigs;
    }
    _requestDefinition(url, type, body, headers, config, secure = false) {
        const newUrl = this._setUrl(url);
        const data = this._populateData(type, body, headers, config, secure);
        return { newUrl, data };
    }
    /**
     * Makes a GET request to the server
     * @author jet2018
     * @param {string} url Relative or absolute url of the endpoint to hit. Providing the `baseUrl` automatically makes this relative to it
     * @param {object} headers Request headers
     * @param {object} config The request configuration
     * @returns Promise
     */
    get(url, headers, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { newUrl, data } = this._requestDefinition(url, 'GET', null, headers, config);
            try {
                return this.flyer(newUrl, data);
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
    /**
     * Makes a secure GET request to the server
     * @author jet2018
     * @param {string} url Relative or absolute url of the endpoint to hit. Providing the `baseUrl` automatically makes this relative to it
     * @param {object} headers Request headers
     * @param {object} config The request configuration
     * @returns Promise
     */
    gets(url, headers, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { newUrl, data } = this._requestDefinition(url, 'GET', null, headers, config, true);
            try {
                return this.flyer(newUrl, data);
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
    /**
     * Makes a POST request to the server
     * @author jet2018
     * @param {string} url Relative or absolute url of the endpoint to hit. Providing the `baseUrl` automatically makes this relative to it
     * @param {object} body The body of the request.
     * @param {object} headers The request headers
     * @param {object} config The request configuration
     * @returns Promise
     */
    post(url, body, headers, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { newUrl, data } = this._requestDefinition(url, 'POST', body, headers, config);
            try {
                return this.flyer(newUrl, data);
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
    /**
     * Makes a secure POST request to the server
     * @author jet2018
     * @param {string} url Relative or absolute url of the endpoint to hit. Providing the `baseUrl` automatically makes this relative to it
     * @param {object} body The body of the request.
     * @param {object} headers The request headers
     * @param {object} config The request configuration
     * @returns Promise
     */
    posts(url, body, headers, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { newUrl, data } = this._requestDefinition(url, 'POST', body, headers, config, true);
            try {
                return this.flyer(newUrl, data);
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
    /**
     * Makes a PATCH request to the server
     * @author jet2018
     * @param {string} url Relative or absolute url of the endpoint to hit. Providing the `baseUrl` automatically makes this relative to it
     * @param {object} body The body of the request.
     * @param {object} headers The request headers
     * @param {object} config The request configuration
     * @returns Promise
     */
    patch(url, body, headers, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { newUrl, data } = this._requestDefinition(url, 'PATCH', body, headers, config);
            try {
                return this.flyer(newUrl, data);
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
    /**
     * Makes a secure PATCH request to the server
     * @author jet2018
     * @param {string} url Relative or absolute url of the endpoint to hit. Providing the `baseUrl` automatically makes this relative to it
     * @param {object} body The body of the request.
     * @param {object} headers The request headers
     * @param {object} config The request configuration
     * @returns Promise
     */
    patchs(url, body, headers, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { newUrl, data } = this._requestDefinition(url, 'PATCH', body, headers, config, true);
            try {
                return this.flyer(newUrl, data);
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
    /**
     * Makes a PUT request to the server
     * @author jet2018
     * @param {string} url Relative or absolute url of the endpoint to hit. Providing the `baseUrl` automatically makes this relative to it
     * @param {object} body The body of the request.
     * @param {object} headers The request headers
     * @param {object} config The request configuration
     * @returns Promise
     */
    put(url, body, headers, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { newUrl, data } = this._requestDefinition(url, 'PUT', body, headers, config);
            try {
                return this.flyer(newUrl, data);
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
    /**
     * Makes a secure PUT request to the server
     * @author jet2018
     * @param {string} url Relative or absolute url of the endpoint to hit. Providing the `baseUrl` automatically makes this relative to it
     * @param {object} body The body of the request.
     * @param {object} headers The request headers
     * @param {object} config The request configuration
     * @returns Promise
     */
    puts(url, body, headers, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { newUrl, data } = this._requestDefinition(url, 'PUT', body, headers, config, true);
            try {
                return this.flyer(newUrl, data);
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
    /**
     * Makes a DELETE request to the server
     * @author jet2018
     * @param {string} url Relative or absolute url of the endpoint to hit. Providing the `baseUrl` automatically makes this relative to it
     * @param {object} body The body of the request.
     * @param {object} headers The request headers
     * @param {object} config The request configuration
     * @returns Promise
     */
    delete(url, body, headers, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { newUrl, data } = this._requestDefinition(url, 'DELETE', body, headers, config);
            try {
                return this.flyer(newUrl, data);
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
    /**
     * Makes a DELETE request to the server
     * @author jet2018
     * @param {string} url Relative or absolute url of the endpoint to hit. Providing the `baseUrl` automatically makes this relative to it
     * @param {object} body The body of the request.
     * @param {object} headers The request headers
     * @param {object} config The request configuration
     * @returns Promise
     */
    deletes(url, body, headers, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { newUrl, data } = this._requestDefinition(url, 'DELETE', body, headers, config, true);
            try {
                return this.flyer(newUrl, data);
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
    /**
     * If the pre-configured request types are not working for you, using this endpoint enables you to configure your own ground up.
     * @author jet2018
     * @param {string} url Relative or absolute url of the endpoint to hit. Providing the `baseUrl` automatically makes this relative to it
     * @param {string} type Request type, can be GET, PUT, PATCH, DELETE etc
     * @param {object} body The body of the request.
     * @param {object} headers The request headers
     * @param {object} config The request configuration
     * @param {boolean} secure Whether the token should be attached or not
     * @returns Promise
     */
    custom(url, type, body, headers, config, secure = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const { newUrl, data } = this._requestDefinition(url, type, body, headers, config, secure);
            try {
                return this.flyer(newUrl, data);
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
    checkPioniaStatusForVersion(versionName = 'v1/') {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!((_a = this.baseUrl) === null || _a === void 0 ? void 0 : _a.includes(versionName))) {
                return this.get(versionName);
            }
            return this.get();
        });
    }
    /**
     * Helper for making requests that conform to the moonlight pattern.
     * Moonlight pattern does not require the user to provide the full url, but only the SERVICE and ACTION
     *
     * @example ```js
     * try {
     *  const resData = await jet.moonlightRequest({
     *      SERVICE: 'auth',
     *      ACTION: 'login',
     *      email: 'johndoe@somedomain.com',
     *      password: 'password'
     *  }, 'v1/');
     *
     *  console.log(resData); // { returnCode: 0, returnMessage: 'Logged in Successful', returnData: { token: 'somejwt' }, ...anyOtherData }
     * } catch (MoonLightError error) {
     *     toast.error(error);
     * }
     * ```
     * @see [Moonlight Pattern](https://pionia.netlify.app/moonlight/introduction-to-moonlight-architecture/)
     * @param _data the data we are sending to the server, including both the SERVICE and ACTION
     * @param targetVersion The version of the api we are targetting. Defaults to v1/. Must end with a slash as well as at ther server side.
     * @returns response data from the server. This object will contain the returnCode, returnMessage, returnData and any other data that the server will return
     */
    moonlightRequest(_data = {}, targetVersion = 'v1/', extraHeaders = {}, _callback = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const passedCheck = this.checkIfServiceAndActionArePresent(_data);
                if (passedCheck !== true) {
                    return;
                }
                const response = yield this.post(targetVersion, _data, extraHeaders);
                const { data } = response;
                const { returnCode, returnMessage } = data;
                const successCode = this.moonlightSuccessCode || 0;
                if (returnCode !== successCode) {
                    if (this.moonlightErrorhandler) {
                        return this.moonlightErrorhandler(data);
                    }
                    throw new MoonLightError(returnMessage, { cause: JSON.stringify(data) });
                }
                if (_callback) {
                    return _callback(data);
                }
                return data;
            }
            catch (error) {
                if (this.moonlightErrorhandler) {
                    return this.moonlightErrorhandler({ returnMessage: error.message, returnCode: this.internalErrorCode });
                }
                throw new MoonLightError(error.message);
            }
        });
    }
    /**
     * Similar to moonlightRequest, but this one is secure, meaning it will attach the token to the request
     * @param _data the data we are sending to the server, including both the SERVICE and ACTION
     * @param targetVersion The version of the api we are targetting. Defaults to v1/. Must end with a slash as well as at ther server side.
     * @returns response data from the server. This object will contain the returnCode, returnMessage, returnData and any other data that the server will return
     */
    secureMoonlightRequest(_data = {}, targetVersion = 'v1/', extraHeaders = {}, _callback = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const passedCheck = this.checkIfServiceAndActionArePresent(_data);
                if (passedCheck !== true) {
                    return;
                }
                const response = yield this.posts(targetVersion, _data, extraHeaders);
                const { data } = response;
                const { returnCode, returnMessage } = data;
                const successCode = this.moonlightSuccessCode || 0;
                if (returnCode !== successCode) {
                    if (this.moonlightErrorhandler) {
                        return this.moonlightErrorhandler(data);
                    }
                    throw new MoonLightError(returnMessage, { cause: JSON.stringify(data) });
                }
                if (_callback) {
                    return _callback(data);
                }
                return data;
            }
            catch (error) {
                if (this.moonlightErrorhandler) {
                    return this.moonlightErrorhandler({ returnMessage: error.message, returnCode: this.internalErrorCode });
                }
                throw new MoonLightError(error.message);
            }
        });
    }
    checkIfServiceAndActionArePresent(_data) {
        const keys = Object.keys(_data);
        const hasService = keys.some((key) => key.toUpperCase() === 'SERVICE');
        const hasAction = keys.some((key) => key.toUpperCase() === 'ACTION');
        if (!hasService) {
            if (this.moonlightErrorhandler) {
                return this.moonlightErrorhandler({ returnMessage: 'Service was not defined in the request', returnCode: this.internalErrorCode });
            }
            throw new MoonLightError('Service was not defined in the request');
        }
        if (!hasAction) {
            if (this.moonlightErrorhandler) {
                return this.moonlightErrorhandler({ returnMessage: 'Action was not defined in the request', returnCode: this.internalErrorCode });
            }
            throw new MoonLightError('Action was not defined in the request');
        }
        return true;
    }
}
const jet = new Jet({
    baseUrl: 'http://localhost:8081/api/',
    moonlightSuccessCode: 0,
    moonlightErrorhandler: (error) => {
        console.debug("--------------------");
        console.log(error);
        console.debug("--------------------");
        return error;
    }
});
jet.moonlightRequest({ service: "category", ActiN: "details", limit: 10, offset: 20 }).then((res) => {
    // console.log(res);
});
