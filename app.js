(function () {
  'use strict';
  const R = window.InciRules;
  if (!R) return;

  const $ = id => document.getElementById(id);
  const els = {
    input: $('ingredients'), count: $('ingredientCount'), strict: $('strictMode'),
    modeNote: $('modeNote'), results: $('results'), empty: $('emptyState'),
    summary: $('summary'), score: $('scoreValue'), status: $('statusPill'),
    summaryTitle: $('summaryTitle'), summaryDesc: $('summaryDesc'),
    found: $('foundCount'), unmarked: $('unmarkedCount'), risk: $('riskSummary'),
    findings: $('findingArea'), tokens: $('allIngredients'), toast: $('toast')
  };
  const emptyStateMarkup = els.empty.innerHTML;
  let current = null;
  let toastTimeout;

  const div = (className, text) => {
    const node = document.createElement('div');
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const labelFor = n => n === 3 ? 'High caution' : n === 2 ? 'Moderate caution' : n === 1 ? 'Low-confidence flag' : 'No flagged ingredients';
  const cssFor = n => n === 3 ? 'high' : n === 2 ? 'med' : n === 1 ? 'low' : '';

  function updateCount() {
    const n = R.parseIngredients(els.input.value).length;
    els.count.textContent = `${n} ingredient${n===1?'':'s'} detected`;
  }

  function makeMiniStat(num, text, cls) {
    const container = div('mini-stat ' + cls);
    container.append(div('dot'));
    const strong = document.createElement('strong'); strong.textContent = String(num);
    const lbl = document.createElement('span'); lbl.textContent = text;
    container.append(strong, lbl);
    return container;
  }

  function findingCard(entry) {
    const f = entry.finding;
    const card = div('finding ' + cssFor(f.rating));
    const top = div('finding-top');
    const name = document.createElement('h4'); name.textContent = entry.name;
    const rating = div('risk-tag', `${f.rating}/3`);
    top.append(name, rating);
    card.append(top, div('finding-type', f.name));
    const reason = document.createElement('p'); reason.textContent = f.reason;
    card.append(reason);
    const bottom = div('finding-bottom');
    const evidence = document.createElement('span'); evidence.textContent = f.basis;
    const source = document.createElement('a');
    source.href = f.source; source.target = '_blank'; source.rel = 'noopener noreferrer';
    source.textContent = 'View source ↗';
    bottom.append(evidence, source);
    card.append(bottom);
    return card;
  }

  function drawFindings(analysis) {
    els.findings.replaceChildren();
    for (const lvl of [3,2,1]) {
      const items = analysis.matches.filter(x=>x.finding.rating === lvl);
      if (!items.length) continue;
      const section = div('finding-section');
      const h = document.createElement('h3');
      const title = document.createTextNode(labelFor(lvl) + ' ');
      const count = document.createElement('span'); count.className = 'count'; count.textContent = `${items.length} match${items.length===1?'':'es'}`;
      h.append(title, count);
      section.append(h);
      const cards = div('findings');
      for (const entry of items) cards.append(findingCard(entry));
      section.append(cards);
      els.findings.append(section);
    }
  }

  function drawTokens(analysis) {
    els.tokens.replaceChildren();
    for (const entry of analysis.ingredients) {
      const token = document.createElement('span');
      token.className = 'token ' + (entry.finding ? cssFor(entry.finding.rating) : '');
      token.textContent = entry.name;
      token.title = entry.finding ? `${labelFor(entry.finding.rating)} · ${entry.finding.name}` : 'Not flagged by active rules (not a safety guarantee)';
      els.tokens.append(token);
    }
  }

  function drawSummary(analysis) {
    const lvl = analysis.highest;
    els.summary.className = 'summary level' + lvl;
    els.score.textContent = `${lvl}/3`;
    els.status.textContent = lvl === 3 ? 'HIGH CAUTION' : lvl === 2 ? 'MODERATE CAUTION' : lvl === 1 ? 'LOW-CONFIDENCE FLAG' : 'CLEAR';
    els.summaryTitle.textContent = lvl === 3 ? 'Consider avoiding in a strict routine' : lvl === 2 ? 'Review flagged ingredients carefully' : lvl === 1 ? 'Some caution flags detected' : 'Looks good — no relevant ingredients flagged';
    const baseDesc = lvl === 3 ? 'At least one ingredient triggered a high-priority precautionary rule. This does not prove the product will cause a flare-up.' : lvl === 2 ? 'At least one potentially relevant fatty acid ester or uncertain lipid was flagged. The effect on Malassezia in the finished product is unknown.' : lvl === 1 ? 'Only low-confidence Malassezia-related screening flags were found. Their clinical relevance is unverified.' : 'No ingredients associated with Malassezia-related concerns were identified by the current rules. Based on this screening, the product looks suitable. Individual tolerance is not guaranteed.';
    const containsTreatment = analysis.ingredients.some(x => /^(ketoconazole|ciclopirox(?: olamine)?|piroctone olamine|selenium sulfide|zinc pyrithione)$/i.test(R.normalize(x.name)));
    els.summaryDesc.textContent = baseDesc + (containsTreatment ? ' Contains a recognized anti-dandruff active; a precautionary ingredient screen does not measure the clinical benefit of treatment.' : '');
    els.found.textContent = String(analysis.matches.length);
    els.unmarked.textContent = String(analysis.withoutMatch);
    els.risk.replaceChildren(
      makeMiniStat(analysis.counts.high, 'High caution', 'high'),
      makeMiniStat(analysis.counts.medium, 'Moderate caution', 'med'),
      makeMiniStat(analysis.counts.low, 'Low-confidence flags', 'low')
    );
  }

  function render(analysis) {
    current = analysis;
    if (!analysis.total) {
      els.results.hidden = true;
      els.empty.hidden = false;
      els.empty.innerHTML = emptyStateMarkup;
      els.input.focus();
      notify('Please paste an ingredient list first.');
      return;
    }
    drawSummary(analysis);
    drawFindings(analysis);
    drawTokens(analysis);
    els.empty.hidden = true;
    els.results.hidden = false;
    els.results.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
  }

  function check() { render(R.analyze(els.input.value, {strict:els.strict.checked})); }

  function notify(message) {
    els.toast.textContent = message;
    els.toast.hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(()=>{els.toast.hidden=true;}, 3100);
  }

  function reset() {
    els.input.value = '';
    els.results.hidden = true;
    els.empty.hidden = false;
    els.empty.innerHTML = emptyStateMarkup;
    current = null;
    updateCount();
    els.input.focus();
  }

  async function copyReport() {
    if (!current) return;
    const lines = [
      `Seborrheic Dermatitis Product Checker — Ingredient Assessment`,
      `Screening mode: ${current.strict ? 'Strict' : 'Balanced'}`,
      `Overall caution level: ${current.highest}/3 (${labelFor(current.highest)})`,
      `Flagged: ${current.matches.length} of ${current.total}`,
      '',
      ...current.matches.map(x=>`[${x.finding.rating}/3] ${x.name}: ${x.finding.reason}`),
      '',
      'Note: Conservative screening, not a clinically validated tolerance test.',
      'Sources: Sezia ingredient categories, Malassezia lipid metabolism research, seborrheic dermatitis reviews'
    ];
    const content = lines.join('\n');
    try {
      await navigator.clipboard.writeText(content);
      notify('Results copied.');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value=content; ta.setAttribute('readonly','');
      ta.style.position='fixed'; ta.style.opacity='0';
      document.body.append(ta); ta.select();
      let copied=false;
      try {copied=document.execCommand('copy');} catch (_) {}
      ta.remove();
      notify(copied ? 'Results copied.' : 'Unable to copy results.');
    }
  }

  // Accessible in-page tabs; only one of the three main sections is visible.
  const tabs = ['checker', 'method', 'sources'].map(name => ({
    tab: $('tab-' + name), panel: $('panel-' + name)
  }));
  function selectTab(index, focusTab = false) {
    tabs.forEach(({tab, panel}, i) => {
      const isSelected = i === index;
      tab.setAttribute('aria-selected', String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      panel.hidden = !isSelected;
    });
    if (focusTab) tabs[index].tab.focus();
    window.scrollTo({top: 0, behavior: 'instant'});
  }
  tabs.forEach(({tab}, index) => {
    tab.addEventListener('click', () => selectTab(index));
    tab.addEventListener('keydown', event => {
      let next = null;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      if (next !== null) { event.preventDefault(); selectTab(next, true); }
    });
  });

  $('analyzeBtn').addEventListener('click', check);
  $('clearBtn').addEventListener('click', reset);
  $('copyBtn').addEventListener('click', copyReport);
  els.input.addEventListener('input',()=>{
    const hadResults = !els.results.hidden;
    current = null;
    els.results.hidden = true;
    els.empty.hidden = false;
    if (hadResults) {
      els.empty.textContent = 'Ingredient list changed. Check product again to update the assessment.';
    }
    updateCount();
  });
  els.input.addEventListener('keydown', e=>{if (e.key==='Enter' && (e.ctrlKey || e.metaKey)){e.preventDefault();check();}});
  els.strict.addEventListener('change',()=>{
    els.modeNote.textContent = els.strict.checked
      ? 'Strict mode includes low-confidence flags, Galactomyces (3/3), and unknown oil/wax pattern flags.'
      : 'Balanced mode hides low-confidence flags, Galactomyces (3/3), and unknown oil/wax pattern flags. No match does not establish safety.';
    if (els.input.value.trim() && !els.results.hidden) check();
  });
  $('ruleCount').textContent = String(R.knownCount);
  updateCount();
})();
