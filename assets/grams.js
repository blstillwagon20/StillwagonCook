/* Cups → grams toggle.
   Only ingredient lines that start with an amount in cups are converted.
   Tablespoons, teaspoons and everything else are left alone.
   Grams are shown next to the original measurement, never instead of it. */
(function () {
  // Grams per US cup. More specific names come first.
  var DENSITY = [
    [/cool whip|whipped topping/, 75],
    [/marshmallow creme/, 96],
    [/apple sauce|applesauce/, 245],
    [/dried apricots/, 130],
    [/egg substitute/, 243],
    [/ziti|penne|pasta|macaroni/, 140],
    [/chicken\b(?! broth| bouillon)|\bham\b/, 140],
    [/soy sauce|teriyaki/, 255],
    [/salad dressing|italian dressing/, 240],
    [/brandy/, 240],
    [/biscuit mix/, 120],
    [/pretzels/, 60],
    [/olives/, 135],
    [/fresh parsley/, 60],
    [/ice cream/, 132],
    [/cream cheese/, 232],
    [/sour cream/, 230],
    [/cottage cheese/, 226],
    [/ricotta/, 246],
    [/peanut butter/, 258],
    [/buttermilk|sour milk/, 245],
    [/evaporated/, 252],
    [/condensed milk/, 306],
    [/dry milk|dry nonfat|powdered milk|nonfat dry/, 68],
    [/half & half|half and half/, 242],
    [/whipping cream|heavy cream|light cream/, 238],
    [/chocolate milk|milk/, 245],
    [/crisco|shortening/, 190],
    [/butter|margarine|oleo/, 227],
    [/\boil\b/, 218],
    [/powdered sugar|confectioner/, 120],
    [/brown sugar/, 213],
    [/sugar/, 200],
    [/cake flour|softasilk/, 114],
    [/chickpea flour/, 92],
    [/whole wheat flour|pastry flour/, 120],
    [/bisquick|baking mix/, 120],
    [/flour/, 125],
    [/cornstarch|corn starch/, 128],
    [/corn syrup|karo/, 328],
    [/cornmeal|corn meal/, 138],
    [/honey/, 340],
    [/molasses/, 337],
    [/maple syrup/, 315],
    [/cocoa/, 85],
    [/chocolate chips|chocolate bits|morsels|semi-sweet bits|chocolate pieces|white chocolate|semi-sweet chocolate/, 170],
    [/graham cracker crumbs|cracker crumbs|corn flake crumbs|cookie crumbs/, 100],
    [/bread crumbs/, 108],
    [/bread cubes/, 45],
    [/rice chex|wheat chex|corn chex|chex/, 30],
    [/rice krispies|corn flakes|special k/, 28],
    [/rolled oats|quick oats|oats|oatmeal/, 90],
    [/uncooked rice|white rice|regular white rice|rice\b/, 185],
    [/barley/, 200],
    [/parmesan/, 100],
    [/cheddar|mozzarella|jack|swiss|cheese/, 113],
    [/coconut/, 85],
    [/raisins/, 150],
    [/dates/, 147],
    [/walnut|pecan|almond|nuts|peanuts/, 120],
    [/marshmallows/, 50],
    [/egg whites|egg product/, 243],
    [/mayonnaise|mayo/, 220],
    [/yogurt/, 245],
    [/ketchup/, 240],
    [/tomato paste/, 262],
    [/tomato sauce/, 245],
    [/picante|salsa/, 260],
    [/chili sauce/, 280],
    [/pumpkin/, 245],
    [/mashed potatoes|mashed bananas|bananas/, 225],
    [/juice/, 248],
    [/vinegar/, 240],
    [/broth|stock/, 240],
    [/water/, 237],
    [/salt\b/, 288],
    [/peas/, 145],
    [/green onion|scallion/, 100],
    [/onion/, 160],
    [/celery/, 100],
    [/carrot/, 110],
    [/sweet potato/, 200],
    [/potato/, 150],
    [/zucchini/, 125],
    [/tomato/, 180],
    [/cranberries/, 100],
    [/strawberries/, 150],
    [/blackberries/, 144],
    [/peaches/, 154],
    [/apples/, 110],
    [/pineapple/, 165],
    [/cabbage/, 70],
    [/lettuce/, 47],
    [/mushroom/, 70],
    [/broccoli/, 91],
    [/pepper/, 150],
    [/grapes/, 151]
  ];

  var FRAC = { '½': 0.5, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 0.25, '¾': 0.75, '⅛': 0.125 };
  var NUM = '(?:\\d+\\s*[½⅓⅔¼¾⅛]|\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?|[½⅓⅔¼¾⅛])';
  var LINE = new RegExp('^\\s*(' + NUM + ')(?:\\s*(?:–|-|to)\\s*(' + NUM + '))?\\s*(?:\\([^)]*\\)\\s*)?(?:cups?\\b|c\\.)\\s*(.*)$', 'i');

  function toNumber(s) {
    s = s.trim();
    var m;
    if ((m = s.match(/^(\d+)\s*([½⅓⅔¼¾⅛])$/))) return +m[1] + FRAC[m[2]];
    if (FRAC[s] !== undefined) return FRAC[s];
    if ((m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/))) return +m[1] + m[2] / m[3];
    if ((m = s.match(/^(\d+)\/(\d+)$/))) return m[1] / m[2];
    return parseFloat(s);
  }

  function roundGrams(g) {
    return g < 50 ? Math.round(g) : Math.round(g / 5) * 5;
  }

  function gramsFor(text) {
    var m = text.match(LINE);
    if (!m) return null;
    // Match on the ingredient name only (before any comma or note), so words
    // like "boiled" or "sautéed in oil" in a note don't throw it off.
    var full = m[3].toLowerCase().replace(/\([^)]*\)/g, ' ');
    var head = full.split(',')[0];
    var per = densityOf(head) || densityOf(full);
    if (!per) return null;
    var lo = roundGrams(toNumber(m[1]) * per);
    if (m[2]) return lo + '–' + roundGrams(toNumber(m[2]) * per) + ' grams';
    return lo + ' grams';
  }

  function densityOf(rest) {
    for (var i = 0; i < DENSITY.length; i++) {
      if (DENSITY[i][0].test(rest)) {
        return DENSITY[i][1];
      }
    }
    return 0;
  }

  function baseText(li) {
    var t = '';
    li.childNodes.forEach(function (n) {
      if (!(n.classList && n.classList.contains('grams'))) t += n.textContent;
    });
    return t;
  }

  function update(li) {
    var g = gramsFor(baseText(li));
    var span = li.querySelector('.grams');
    if (!g) { if (span) span.remove(); return; }
    if (!span) {
      span = document.createElement('span');
      span.className = 'grams';
      li.appendChild(span);
    }
    span.textContent = ' (' + g + ')';
  }

  // Work out conversions for every ingredient list on the page.
  document.querySelectorAll('.recipe-body ul li').forEach(update);

  // Called by the recipe scaler after amounts change.
  window.refreshGrams = function (root) {
    (root || document).querySelectorAll('.recipe-body ul li').forEach(update);
  };

  function stored() {
    try { return localStorage.getItem('showGrams') === '1'; } catch (e) { return false; }
  }
  function store(on) {
    try { localStorage.setItem('showGrams', on ? '1' : '0'); } catch (e) {}
  }

  var buttons = document.querySelectorAll('.grams-toggle');

  // Put each toggle on the right side of its recipe's first heading
  // (normally "Ingredients"). Hide it when nothing in that recipe converts.
  buttons.forEach(function (b) {
    var recipe = b.closest('.recipe') || document;
    var body = recipe.querySelector('.recipe-body');
    if (!body || !body.querySelector('.grams')) { b.hidden = true; return; }
    var head = body.querySelector('h2');
    if (head) {
      head.classList.add('ingredients-head');
      head.appendChild(b);
    }
  });
  function apply(on) {
    document.body.classList.toggle('show-grams', on);
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var on = !document.body.classList.contains('show-grams');
      apply(on);
      store(on);
    });
  });
  apply(stored());
})();
