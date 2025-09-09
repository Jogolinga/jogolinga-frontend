declare module 'aria-query';
declare module 'hoist-non-react-statics';
declare module 'json-schema';
declare module 'prop-types';
declare module 'testing-library__jest-dom';

// Pour les modules qui n'ont pas de types
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.wav' {
  const content: string;
  export default content;
}

declare module '*.mp3' {
  const content: string;
  export default content;
}

// Pour le polyfill http2
declare module 'http2' {
  export const constants: {
    HTTP2_HEADER_PATH: string;
    HTTP2_HEADER_STATUS: string;
    HTTP2_HEADER_METHOD: string;
    HTTP2_HEADER_AUTHORITY: string;
    HTTP2_HEADER_SCHEME: string;
    HTTP2_HEADER_CONTENT_TYPE: string;
    HTTP2_HEADER_CONTENT_ENCODING: string;
    HTTP2_HEADER_ACCEPT: string;
    HTTP2_HEADER_ACCEPT_ENCODING: string;
    HTTP2_HEADER_USER_AGENT: string;
    HTTP2_METHOD_GET: string;
    HTTP2_METHOD_POST: string;
  };
}