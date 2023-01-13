const AWS = require("aws-sdk");
const fs = require("fs");
const { AnalyzeDocumentCommand,TextractClient }=require("@aws-sdk/client-textract");
const {
  TextractDocument,
  TextractIdentity,
} = require("amazon-textract-response-parser");
const { fileURLToPath } = require("url");

const textract = new TextractClient({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const detectText = async (inputDoc) => {
  try {
    const inputBytes = Base64Binary.decode(inputDoc);

    const params = {
      Document: {
        Bytes: inputBytes,
      },
      FeatureTypes: ["TABLES", "FORMS"],
    };

    const analyzeDoc = new AnalyzeDocumentCommand(params);

    const response = await textract.send(analyzeDoc);

    const document = new TextractDocument(response);
    const page = document.pageNumber(1);
    let ocrdata = "";

    for (const row of page.iterLines()) {
      const words = [];
      for (const word of row.iterWords()) {
        words.push(word.text);
      }

      ocrdata += words.join(" ");
    }

    return ocrdata;
  } catch (err) {
    console.log(err);
    throw new Error("Scan unsuccessful");
  }
};

exports.detectText = detectText;

const detectMedicineText = async (inputDoc) => {
  try {
    const inputBytes = Base64Binary.decode(inputDoc);

    const params = {
      Document: {
        Bytes: inputBytes,
      },
      FeatureTypes: ["TABLES", "FORMS"],
    };

    const analyzeDoc = new AnalyzeDocumentCommand(params);

    const response = await textract.send(analyzeDoc);

    const document = new TextractDocument(response);
    const page = document.pageNumber(1);
    const ocrdata = [];

    for (const row of page.iterLines()) {
      const words = [];
      for (const word of row.iterWords()) {
        words.push(word.text);
      }

      ocrdata.push(words.join(" "));
    }

    return ocrdata;
  } catch (err) {
    console.log(err);
    throw new Error("Scan unsuccessful");
  }
};

exports.detectMedicineText = detectMedicineText;


var Base64Binary = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  /* will return a  Uint8Array type */
  decodeArrayBuffer: function (input) {
    var bytes = (input.length / 4) * 3;
    var ab = new ArrayBuffer(bytes);
    this.decode(input, ab);

    return ab;
  },

  removePaddingChars: function (input) {
    var lkey = this._keyStr.indexOf(input.charAt(input.length - 1));
    if (lkey == 64) {
      return input.substring(0, input.length - 1);
    }
    return input;
  },

  decode: function (input, arrayBuffer) {
    //get last chars to see if are valid
    input = this.removePaddingChars(input);
    input = this.removePaddingChars(input);

    var bytes = parseInt((input.length / 4) * 3, 10);

    var uarray;
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    var j = 0;

    if (arrayBuffer) uarray = new Uint8Array(arrayBuffer);
    else uarray = new Uint8Array(bytes);

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    for (i = 0; i < bytes; i += 3) {
      //get the 3 octects in 4 ascii chars
      enc1 = this._keyStr.indexOf(input.charAt(j++));
      enc2 = this._keyStr.indexOf(input.charAt(j++));
      enc3 = this._keyStr.indexOf(input.charAt(j++));
      enc4 = this._keyStr.indexOf(input.charAt(j++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      uarray[i] = chr1;
      if (enc3 != 64) uarray[i + 1] = chr2;
      if (enc4 != 64) uarray[i + 2] = chr3;
    }

    return uarray;
  },
};
