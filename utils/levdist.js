var levenshteinArray = function (item, itemArray, howMany) {
  return itemArray
    .map(function (arrayItem) {
      return {
        item: arrayItem,
        distance: splitLevDist(item, arrayItem),
      };
    })
    .sort(function (a, b) {
      return a.distance - b.distance;
    })
    .slice(0, howMany)
    .map(function (item) {
      return item.item;
    });
};

var splitLevDist = function (item, arrayItem) {
  if (arrayItem.indexOf(" ") === -1) {
    return levDist(item, arrayItem);
  }
  return Math.min.apply(
    null,
    arrayItem.split(" ").map(function (splitArrayItem) {
      return levDist(item, splitArrayItem);
    })
  );
};

// Thanks to James Westgate for this highly optimized Levenshtein distance finder
var levDist = function (r, a) {
  var t = [],
    f = r.length,
    n = a.length;
  if (0 == f) return n;
  if (0 == n) return f;
  for (var v = f; v >= 0; v--) t[v] = [];
  for (var v = f; v >= 0; v--) t[v][0] = v;
  for (var e = n; e >= 0; e--) t[0][e] = e;
  for (var v = 1; f >= v; v++)
    for (var h = r.charAt(v - 1), e = 1; n >= e; e++) {
      if (v == e && t[v][e] > 4) return f;
      var i = a.charAt(e - 1),
        o = h == i ? 0 : 1,
        c = t[v - 1][e] + 1,
        u = t[v][e - 1] + 1,
        A = t[v - 1][e - 1] + o;
      c > u && (c = u),
        c > A && (c = A),
        (t[v][e] = c),
        v > 1 &&
          e > 1 &&
          h == a.charAt(e - 2) &&
          r.charAt(v - 2) == i &&
          (t[v][e] = Math.min(t[v][e], t[v - 2][e - 2] + o));
    }
  return t[f][n];
};

const getClosestMatch = (item, itemArray, searchWord) => {
  const modArr = itemArray.sort(function (a, b) {
    levDist(a, searchWord);
    levDist(b, searchWord);
  });

  return modArr[0];
};

exports.getClosestMatch=getClosestMatch;
