/* Recipe scaler: ½×, 1×, 2×, 3× or any number.
   Scales the amount at the start of each ingredient, the amounts in
   parentheses in the steps, and the "Serves" number. */
(function () {
  var GLYPH = { '½': 1 / 2, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 1 / 4, '¾': 3 / 4, '⅛': 1 / 8, '⅜': 3 / 8, '⅝': 5 / 8, '⅞': 7 / 8 };
  var NUM = '(?:\\d+\\s*[½⅓⅔¼¾⅛⅜⅝⅞]|\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?|[½⅓⅔¼¾⅛⅜⅝⅞])';
  var RANGE = NUM + '(?:\\s*(?:–|-|to)\\s*' + NUM + ')?';
  var LEAD = new RegExp('^(\\s*)(' + RANGE + ')');
  var PAREN = new RegExp('\\((' + RANGE + ')([^)]*)\\)', 'g');
  var FRACS = [[0, ''], [1 / 8, '⅛'], [1 / 4, '¼'], [1 / 3, '⅓'], [3 / 8, '⅜'], [1 / 2, '½'],
               [5 / 8, '⅝'], [2 / 3, '⅔'], [3 / 4, '¾'], [7 / 8, '⅞'], [1, '']];

  function toNum(s) {
    s = s.trim();
    var m;
    if ((m = s.match(/^(\d+)\s*([½⅓⅔¼¾⅛⅜⅝⅞])$/))) return +m[1] + GLYPH[m[2]];
    if (GLYPH[s] !== undefined) return GLYPH[s];
    if ((m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/))) return +m[1] + m[2] / m[3];
    if ((m = s.match(/^(\d+)\/(\d+)$/))) return m[1] / m[2];
    return parseFloat(s);
  }

  function fmt(x) {
    if (x >= 10) return String(Math.round(x));
    var whole = Math.floor(x), rest = x - whole, best = FRACS[0];
    FRACS.forEach(function (f) { if (Math.abs(rest - f[0]) < Math.abs(rest - best[0])) best = f; });
    if (best[0] === 1) { whole += 1; best = FRACS[0]; }
    if (whole === 0 && !best[1]) return '⅛';
    return (whole ? String(whole) : '') + best[1];
  }

  function scaleRange(str, f) {
    var parts = str.split(/(\s*(?:–|-|to)\s*)/);
    return parts.map(function (p, i) { return i % 2 ? p : fmt(toNum(p) * f); }).join('');
  }

  // Keep "1 cup" / "2 cups" grammatical after scaling.
  var UNITS = ['cup', 'package', 'pkg.', 'can', 'jar', 'box', 'stick', 'block', 'container', 'clove', 'slice',
               'egg', 'envelope', 'bunch', 'head', 'loaf', 'bottle', 'bag', 'square', 'quart', 'pint', 'pound', 'banana',
               'potato', 'onion', 'carrot', 'apple', 'tomato', 'pepper'];
  function plural(u) { return /(x|ch|sh|o)$/.test(u) ? u + 'es' : u.replace(/\.$/, '') + 's' + (/\.$/.test(u) ? '.' : ''); }
  function fixUnit(qty, after) {
    var many = toNum(qty.split(/\s*(?:–|-|to)\s*/).pop()) > 1;
    var m = after.match(/^(\s+(?:\([^)]*\)\s+)?(?:large |medium |small |whole )?)([A-Za-z.]+)(?![A-Za-z])/);
    if (!m) return after;
    var word = m[2], lower = word.toLowerCase(), repl = null;
    UNITS.forEach(function (u) {
      if (lower === u && many) repl = plural(word);
      else if (lower === plural(u).toLowerCase() && !many) repl = word.replace(/(es|s)(\.?)$/, function (all, e, dot) {
        return (e === 'es' && !/(x|ch|sh|o)$/.test(u) ? 'e' : '') + dot;
      });
    });
    return repl ? m[1] + repl + after.slice(m[0].length) : after;
  }
  // Also scale alternate amounts like "(or 2¼ cups shredded)" and ", or 2¼ cups if shredded".
  var ALT = new RegExp('(\\bor\\s+)(' + RANGE + ')(?=\\s+(?:cups?|tbsp|tsp|lbs?|oz))', 'gi');
  function scaleAlt(text, f) {
    return text.replace(ALT, function (_, or, q) { return or + scaleRange(q, f); });
  }

  function textNodes(el) {
    var out = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        return n.parentNode.closest('.grams') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    while (w.nextNode()) out.push(w.currentNode);
    return out;
  }

  document.querySelectorAll('.recipe').forEach(function (recipe) {
    var scaler = recipe.querySelector('.scaler');
    var body = recipe.querySelector('.recipe-body');
    if (!scaler || !body) return;
    var targets = [];

    // Ingredient lines: the amount at the very start.
    body.querySelectorAll('ul li').forEach(function (li) {
      var n = li.firstChild;
      if (n && n.nodeType === 3 && LEAD.test(n.nodeValue)) targets.push({ node: n, orig: n.nodeValue, kind: 'lead' });
    });
    // Steps: amounts in parentheses, e.g. "flour (2 cups)". Skip notes like "(2 cups = 250 g)".
    body.querySelectorAll('ol li').forEach(function (li) {
      textNodes(li).forEach(function (n) {
        if (/\((?:\d|[½⅓⅔¼¾⅛])/.test(n.nodeValue)) targets.push({ node: n, orig: n.nodeValue, kind: 'paren' });
      });
    });
    // Serves
    recipe.querySelectorAll('.meta li').forEach(function (li) {
      var label = li.querySelector('span');
      var n = label && label.nextSibling;
      if (label && /serves/i.test(label.textContent) && n && n.nodeType === 3 && LEAD.test(n.nodeValue)) {
        targets.push({ node: n, orig: n.nodeValue, kind: 'lead' });
      }
    });

    if (!targets.length) { scaler.hidden = true; return; }

    var note = document.createElement('p');
    note.className = 'scale-note';
    note.hidden = true;
    var firstHead = body.querySelector('h2');
    if (firstHead) firstHead.insertAdjacentElement('afterend', note); else body.prepend(note);

    var buttons = scaler.querySelectorAll('[data-f]');
    var input = scaler.querySelector('input');

    function apply(f) {
      if (!(f > 0)) return;
      targets.forEach(function (t) {
        if (f === 1) { t.node.nodeValue = t.orig; return; }
        if (t.kind === 'lead') {
          var m = t.orig.match(LEAD), nq = scaleRange(m[2], f);
          var tail = scaleAlt(t.orig.slice(m[0].length), f);
          t.node.nodeValue = m[1] + nq + fixUnit(nq, tail);
        } else {
          t.node.nodeValue = t.orig.replace(PAREN, function (all, q, rest) {
            if (/=/.test(rest)) return all;
            var nq = scaleRange(q, f);
            return '(' + nq + scaleAlt(fixUnit(nq, rest), f) + ')';
          });
        }
      });
      buttons.forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-f') === f); });
      if (document.activeElement !== input) input.value = f;
      if (f === 1) { note.hidden = true; }
      else {
        note.hidden = false;
        note.innerHTML = '';
        note.appendChild(document.createTextNode('Amounts shown for ' + fmt(f) + '× the recipe. '));
        var reset = document.createElement('button');
        reset.type = 'button';
        reset.textContent = 'Reset';
        reset.addEventListener('click', function () { apply(1); });
        note.appendChild(reset);
      }
      if (window.refreshGrams) window.refreshGrams(recipe);
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { apply(+b.getAttribute('data-f')); });
    });
    input.addEventListener('input', function () {
      var v = parseFloat(input.value);
      if (v > 0 && v <= 50) apply(v);
    });
  });
})();
