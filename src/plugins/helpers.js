// outside of a Vue file
import { Dialog, Notify, copyToClipboard } from 'quasar'

import { useBootstrapStore } from '../stores/bootstrap';

export default {
  chunk (arr, size = 2) {
    const chunkedArray = [];
    for (let i = 0; i < arr.length; i++) {
      const last = chunkedArray[chunkedArray.length - 1];
      if (!last || last.length === size) {
        chunkedArray.push([arr[i]]);
      } else {
        last.push(arr[i]);
      }
    }
    return chunkedArray;
  },
  range (size, startAt = 0) {
    if (!size) return [];

    return [...Array(size).keys()].map(i => i + startAt);
  },
  copy (str) {
    if (typeof str !== "string") return false;

    copyToClipboard(str)
      .then(() => {
        Notify.create({
          type: "positive",
          message: "Copied to clipboard",
        });
      })
      .catch(() => {
        Notify.create({
          type: "negative",
          message: "Failed to copy",
        });
      });
  },
  /**
   *
   * @param {String} data The message to be displayed or an object with message and qdialog options
   * @param {String} status [success, error, danger, warning, alert, notice, info]
   * @param {Boolean} alert   Setting value to true will make the notification a dialog
   * @param {String | Boolean} label  You can set value to "Persistent" to remove label
   *                                  and make the dialog persistent or set to
   *                                  Boolean "false" to only remove label
   * @param {Boolean} cancel  Setting value to true will add a cancel button to the dialog
   * @returns {Boolean | Object}  Returns false if no message is provided
   */
  notify (data, status = "info", alert = false, label = "OK", cancel = false, title = null) {
    let msg =
      typeof data === "object" ? data.message || data.msg || null : data;
    status = typeof data === "object" ? data.status : status;
    alert = typeof data === "object" ? data.alert : alert;
    label = typeof data === "object" ? data.label || data.ok : label;
    cancel = typeof data === "object" ? data.cancel : cancel;

    // create a new object from data without message and status
    const options =
      typeof data === "object"
        ? Object.keys(data)
          .filter(
            (key) =>
              [
                "message",
                "msg",
                "status",
                "alert",
                "label",
                "cancel",
                "onDismiss",
              ].indexOf(key) === -1
          )
          .reduce((obj, key) => {
            obj[key] = data[key];
            return obj;
          }, {})
        : { title };

    if (msg === "" || !msg) {
      return false;
    }

    let tx = {
      success: {
        class: "green-1",
        textColor: "green-10",
        type: "positive",
      },
      error: {
        class: "red-1",
        textColor: "red-10",
        type: "negative",
      },
      danger: {
        class: "red-1",
        textColor: "red-10",
        type: "negative",
      },
      warning: {
        class: "yellow-1",
        textColor: "yellow-10",
        type: "warning",
      },
      alert: {
        class: "yellow-1",
        textColor: "yellow-10",
        type: "warning",
      },
      notice: {
        class: "grey-1",
        textColor: "grey-8",
        type: "ongoing",
      },
      info: {
        class: "blue-1",
        textColor: "blue-10",
        type: "info",
      },
    };

    const tx_status = tx[status] ?? tx["info"];
    const ne_cancel = label !== "persistent" || cancel === false;

    if (alert === true) {
      return Dialog.create({
        ...options,
        class: `init-border rounded-here q-pa-sm bg-${tx_status.class} text-${tx_status.textColor}`,
        cancel:
          cancel === false /*|| label !== 'persistent'*/
            ? false
            : {
              color: ne_cancel ? "negative" : tx_status.textColor,
              "text-color": "white",
              label: "cancel",
            },
        ok:
          label === "persistent" || label === false
            ? false
            : { color: tx_status.textColor, "text-color": "white", label },
        title: options.title || status.toUpperCase(),
        message: msg,
        persistent: label === "persistent" || options.persistent,
      });
    } else {
      if (data.timeout) {
        options.timeout = data.timeout && data.onDismiss ? 0 : data.timeout;
      }
      let notify = Notify.create({
        ...options,
        classes: ["no-shadow"],
        type: tx_status.type || status,
        message: msg,
      });

      if (data.onDismiss && typeof data.onDismiss === "function") {
        if (data.timeout !== "undefined") {
          let t = setTimeout(() => {
            data.onDismiss(notify);
            notify();
            clearTimeout(t);
          }, data.timeout);
        } else {
          data.onDismiss(notify);
        }
      }
      return notify;
    }
  },
  nlText (str, lines = 2, breaker = '<br />') {
    const splitext = this.chunk((str || '').split(' '), lines);
    let text = '';
    splitext.forEach(el => {
      text += el.join(' ') + breaker
    })

    return text;
  },
  /**
   *
   * @param {String} str String to truncate
   * @param {Number} len Length of the string
   * @param {String} suffix Suffix to add to the string
   * @returns {String}
   */
  trunc (str, len = 20, suffix = "...") {
    let s = str.length > len ? str.substring(0, len - 3) + suffix : str;
    return s.replace("\n", " ").replace(" " + suffix, suffix.slice(1));
  },
  /**
   *
   * @param {String} word
   */
  singularize (word) {
    if (!word) {
      return
    }
    word = word.toString()
    const lastS = word.toLowerCase().substring(word.length - 1, word.length) == 's'
    const lastEs = word.toLowerCase().substring(word.length - 2, word.length) == 'es'
    const lastIes = word.toLowerCase().substring(word.length - 3, word.length) == 'ies'

    if (lastIes) {
      word = word.substring(word.length - 3, -3)
    } else if (lastEs) {
      word = word.substring(word.length - 2, -2)
    } else if (lastS) {
      word = word.substring(word.length - 1, -1)
    }
    return word
  },
  /**
   *
   * @param {String} word
   * @param {Number} number
   */
  pluralize (word, number) {
    // If the number is 1, return the singular form of the word.
    if (number === 1) {
      return word;
    }

    // If the word ends in "y" and the second-to-last letter is a vowel,
    // add "ies" to the end of the word.
    if (word.endsWith("y") && word[word.length - 2].toLowerCase() in ["a", "e", "i", "o", "u"]) {
      return word + "ies";
    }

    // Check for irregular plurals.
    const irregularPlurals = {
      foot: "feet",
      child: "children",
      mouse: "mice",
      goose: "geese",
    };
    if (Object.prototype.hasOwnProperty.call(irregularPlurals, word)) {
      return irregularPlurals[word];
    }

    // If the word ends in "s", "ss", "sh", "ch", "x", or "z",
    // add "es" to the end of the word.
    else if (
      word.endsWith("s") ||
      word.endsWith("ss") ||
      word.endsWith("sh") ||
      word.endsWith("ch") ||
      word.endsWith("x") ||
      word.endsWith("z")) {
      return word + "es";
    }

    // Otherwise, just add "s" to the end of the word.
    else {
      return word + "s";
    }
  },
  goto (link) {
    window.location = link
  },
  currentUrl () {
    return location.href
  },
  asset (url) {
    if (process.env.PREFER_ASSET === 'true' && url.indexOf('http') !== -1) {
      var base_url = document.createElement('a');
      base_url.href = url
      url = base_url.pathname.replace(/^\/|\/$/g, '');
    }
    return process.env.ASSET_URL + url;
  },
  nameFromPath (path) {
    var base_url = document.createElement('a');
    base_url.href = path
    return base_url.pathname.replace(/\/|\.|\/$/g, '');
  },
  getPageNumber (path, key = "page") {
    if (!path || path.indexOf(key) === -1) {
      return 1;
    }
    return path.split(key + "=").pop();
  },
  arrayClean (array, getObj = false) {
    let obj = JSON.parse(JSON.stringify(array));

    if (getObj === true) {
      return obj
    }
    return Object.keys(obj)
      .map(i => obj[i]);
  },
  objMap (obj, func) {
    obj = JSON.parse(JSON.stringify(obj));
    let newObj = {}
    Object.keys(obj).map((key) => {
      newObj[key] = func(obj, key);
    });
    return newObj;
  },
  isEven (n) {
    if (!Number.isFinite(parseFloat(n))) return false
    return n % 2 == 0;
  },
  isOdd (n) {
    if (!Number.isFinite(parseFloat(n))) return false
    return Math.abs(n % 2) == 1;
  },
  money (amount, abbrev = false, curr = true, trail_zeros = false, getInt = false) {
    const bootStore = useBootstrapStore();
    const defsettings = { currency: "NGN", currency_symbol: "₦" }
    const settings = bootStore.settings || defsettings;

    let currency = settings.currency || defsettings.currency,
      symbol = settings.currency_symbol || defsettings.currency_symbol;

    if (!amount) {
      amount = 0;
    }

    if (typeof amount === 'string' || amount instanceof String) {
      amount = parseFloat(amount.replace(/[^0-9.]/ig, ""));
    }

    if (getInt === true) {
      return amount;
    }

    let parsedAmount = (amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

    if (trail_zeros === false) {
      parsedAmount = parsedAmount.replace(/(\.[0-9]*?)0+/g, "");
    }

    return (curr === true
      ? symbol
      : (curr === "code" ? currency + ' ' : curr)
    ) + (abbrev === true ? this.intStr(amount) : parsedAmount);
  },
  humanize (num, slugify) {
    if (!num) {
      return false;
    }

    if (slugify && (slugify === '-' || slugify === '_')) {
      return this.humanize(num).replace(' ', slugify).toLowerCase()
    }
    let ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
      'seventeen', 'eighteen', 'nineteen'];
    let tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty',
      'ninety'];

    let numString = num.toString();

    if (num < 0) throw new Error('Negative numbers are not supported.');

    if (num === 0) return 'zero';

    //the case of 1 - 20
    if (num < 20) {
      return ones[num];
    }

    if (numString.length === 2) {
      return tens[numString[0]] + ' ' + ones[numString[1]];
    }

    //100 and more
    if (numString.length == 3) {
      if (numString[1] === '0' && numString[2] === '0')
        return ones[numString[0]] + ' hundred';
      else
        return ones[numString[0]] + ' hundred and ' + this.humanize(+(numString[1] + numString[2]), slugify);
    }

    if (numString.length === 4) {
      var end = +(numString[1] + numString[2] + numString[3]);
      if (end === 0) return ones[numString[0]] + ' thousand';
      if (end < 100) return ones[numString[0]] + ' thousand and ' + this.humanize(end, slugify);
      return ones[numString[0]] + ' thousand ' + this.humanize(end, slugify);
    }
  },
  intStr (num) {
    num = num.toString().replace(/[^0-9.]/g, '');
    if (num < 1000) {
      return num;
    }
    let si = [
      { v: 1E3, s: "K" },
      { v: 1E6, s: "M" },
      { v: 1E9, s: "B" },
      { v: 1E12, s: "T" },
      { v: 1E15, s: "P" },
      { v: 1E18, s: "E" }
    ];
    let index;
    for (index = si.length - 1; index > 0; index--) {
      if (num >= si[index].v) {
        break;
      }
    }
    return (num / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[index].s;
  },
  formatBytes (bytes, decimals = 0, binaryUnits = false) {
    if (bytes == 0) {
      return '0 Bytes';
    }
    const unitMultiple = (binaryUnits) ? 1024 : 1000;
    const unitNames = (unitMultiple === 1024) ? // 1000 bytes in 1 Kilobyte (KB) or 1024 bytes for the binary version (KiB)
      ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'] :
      ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const unitChanges = Math.floor(Math.log(bytes) / Math.log(unitMultiple));
    return parseFloat((bytes / Math.pow(unitMultiple, unitChanges)).toFixed(decimals || 0)) + ' ' + unitNames[unitChanges];
  },
}
