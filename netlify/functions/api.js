import serverless from 'serverless-http';
import { app } from '../../server/app.js';

const serverlessHandler = serverless(app, {
  binary: ['application/pdf', 'multipart/form-data'],
});

function getContentType(event) {
  return (
    event.headers?.['content-type'] ||
    event.headers?.['Content-Type'] ||
    ''
  ).toLowerCase();
}

/** @param {import('@netlify/functions').HandlerEvent} event */
export const handler = async (event, context) => {
  if (event.body && event.isBase64Encoded) {
    const contentType = getContentType(event);

    // JSON can be decoded to text. Multipart/binary uploads must stay binary
    // or PDF files uploaded through /admindhanz get corrupted on Netlify.
    if (contentType.includes('application/json')) {
      event.body = Buffer.from(event.body, 'base64').toString('utf8');
    } else {
      event.body = Buffer.from(event.body, 'base64');
    }

    event.isBase64Encoded = false;
  }

  return serverlessHandler(event, context);
};
