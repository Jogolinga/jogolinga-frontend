console.log("Custom http2.js module loaded");

const http2Constants = {
  HTTP2_HEADER_PATH: ':path',
  HTTP2_HEADER_STATUS: ':status',
  HTTP2_HEADER_METHOD: ':method',
  HTTP2_HEADER_AUTHORITY: ':authority',
  HTTP2_HEADER_SCHEME: ':scheme',
  HTTP2_HEADER_CONTENT_TYPE: 'content-type',
  HTTP2_HEADER_CONTENT_LENGTH: 'content-length',
  HTTP2_HEADER_CONTENT_ENCODING: 'content-encoding',
  HTTP2_HEADER_ACCEPT: 'accept',
  HTTP2_HEADER_ACCEPT_ENCODING: 'accept-encoding',
  HTTP2_HEADER_USER_AGENT: 'user-agent',
  HTTP2_HEADER_COOKIE: 'cookie',
  HTTP2_HEADER_SET_COOKIE: 'set-cookie',
  HTTP2_HEADER_LOCATION: 'location',
  HTTP2_METHOD_GET: 'GET',
  HTTP2_METHOD_POST: 'POST',
  HTTP2_METHOD_PUT: 'PUT',
  HTTP2_METHOD_DELETE: 'DELETE'
};

module.exports = {
  constants: http2Constants,
  connect: () => null,
  createServer: () => null,
  createSecureServer: () => null,
  getDefaultSettings: () => ({}),
  getPackedSettings: () => Buffer.alloc(0),
  getUnpackedSettings: () => ({}),
  sensitiveHeaders: new Set()
};
