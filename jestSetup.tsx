/* eslint-env node */
import '@testing-library/jest-dom';

// React development builds log errors to the console instead of raising
// exceptions. This patch simulates production build behavior.

// eslint-disable-next-line no-console
// console.error = (err: any): void => {
//   throw new Error(err);
// };

process.on('unhandledRejection', (error): void => {
  throw error;
});
