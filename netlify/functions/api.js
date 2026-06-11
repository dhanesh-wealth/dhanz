import serverless from 'serverless-http';
import { app } from '../../server/app.js';

const serverlessHandler = serverless(app, {
  binary: ['application/pdf', 'multipart/form-data'],
});

/** @param {import('@netlify/functions').HandlerEvent} event */
export const handler = async (event, context) => {
  if (event.body && event.isBase64Encoded) {
    event.body = Buffer.from(event.body, 'base64').toString('utf8');
    event.isBase64Encoded = false;
  }
  return serverlessHandler(event, context);
};
