import { boot } from 'quasar/wrappers';

String.prototype.base64UrlEncode = function () {
  const base64 = window.btoa(String(this)); // Standard Base64 encoding
  return base64
    .replace(/\+/g, '-') // Replace + with -
    .replace(/\//g, '_') // Replace / with _
    .replace(/=+$/, ''); // Remove trailing =
};

String.prototype.base64UrlDecode = function () {
  try {
    // Add back missing `=` padding
    let str = this.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4 !== 0) {
      str += '=';
    }
    return atob(str); // Standard Base64 decoding
  } catch {
    return '';
  }
};

String.prototype.titleCase = function () {
  return this.replace(/[-_]/g, ' ').replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
};

Array.prototype.remove = function (...args) {
  let L = args.length;
  while (L && this.length) {
    const what = args[--L];
    let ax;
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  // something to do
});
