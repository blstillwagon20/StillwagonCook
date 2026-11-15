(function () {
  var search = document.getElementById('search');
  var chips = document.querySelectorAll('.chip');
  var cards = document.querySelectorAll('.card');
  var empty = document.getElementById('empty');
  var activeCat = 'all';

  function update() {
    var words = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    var shown = 0;
    cards.forEach(function (card) {
      var text = card.getAttribute('data-search');
      var catOk = activeCat === 'all' || card.getAttribute('data-cat') === activeCat ||
        (activeCat.indexOf('tag-') === 0 && (' ' + card.getAttribute('data-tags') + ' ').indexOf(' ' + activeCat.slice(4) + ' ') !== -1);
      var textOk = words.every(function (w) { return text.indexOf(w) !== -1; });
      var show = catOk && textOk;
      card.hidden = !show;
      if (show) shown++;
    });
    document.querySelectorAll('.cat-section').forEach(function (sec) {
      var any = sec.querySelector('.card:not([hidden])');
      sec.hidden = !any;
      var count = sec.querySelector('.cat-count');
      if (count) count.textContent = sec.querySelectorAll('.card:not([hidden])').length;
    });
    empty.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      activeCat = chip.getAttribute('data-cat');
      update();
    });
  });

  search.addEventListener('input', update);
})();
