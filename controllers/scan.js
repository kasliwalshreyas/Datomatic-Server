const { validationResult } = require("express-validator");
const { detectText, detectMedicineText } = require("../utils/textract");
const axios = require('axios').default;

exports.getScan = async (req, res, next) => {
  try {
    const { image } = req.body;

    const resWord = await detectText(image);

    return res.status(200).json({
      message: "success",
      data: resWord,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getMedScan = async (req, res, next) => {
  try {
    const { image } = req.body;

    let resWord = await detectMedicineText(image);

    const suggestedNameRes = await axios("https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=" +
    resWord[0]);

    const suggestedNameJson = suggestedNameRes.data;

    if (
      suggestedNameJson.suggestionGroup.suggestionList.suggestion &&
      suggestedNameJson.suggestionGroup.suggestionList.suggestion.length > 0
    ) {
      resWord[0] = suggestedNameJson.suggestionGroup.suggestionList
        .suggestion[0]
        ? suggestedNameJson.suggestionGroup.suggestionList.suggestion[0]
        : resWord[0];
    }

    const suggestedDrugCodeRes = await axios(
      "https://rxnav.nlm.nih.gov/REST/rxcui.json?caller=RxNav&name=" +
        resWord[0]
    );
    const suggestedDrugCodeJson = suggestedDrugCodeRes.data;

    if (
      suggestedDrugCodeJson.idGroup.rxnormId &&
      suggestedDrugCodeJson.idGroup.rxnormId.length > 0
    ) {
      resWord = [suggestedDrugCodeJson.idGroup.rxnormId[0], ...resWord];
    }
    else
    {
      resWord = ["", ...resWord];
    }

    const medicineData = {
      RxNORMcode: resWord[0] ? resWord[0] : "",
      medicationName: resWord[1] ? resWord[1] : "",
      dosage: resWord[2] ? resWord[2] : "",
      route: resWord[3] ? resWord[3] : "",
      frequency: resWord[4] ? resWord[4] : "",
    };

    return res.status(200).json({
      message: "success",
      data: medicineData,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
