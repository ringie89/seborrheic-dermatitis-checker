'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const R = require('./rules.js');

class Element {
  constructor(html = '') {
    this.handlers = {};
    this.children = [];
    this.attributes = {};
    this.style = {};
    this.hidden = false;
    this.value = '';
    this.checked = true;
    this._innerHTML = '';
    this._textContent = '';
    if (html) this.innerHTML = html;
  }
  get innerHTML() { return this._innerHTML; }
  set innerHTML(value) {
    this._innerHTML = String(value);
    this._textContent = this._innerHTML.replace(/<[^>]*>/g, '');
  }
  get textContent() { return this._textContent; }
  set textContent(value) {
    this._textContent = String(value);
    this._innerHTML = this._textContent;
  }
  addEventListener(type, handler) { (this.handlers[type] ||= []).push(handler); }
  dispatch(type, event = {}) {
    let result;
    for (const handler of this.handlers[type] || []) {
      result = handler({preventDefault() {}, ...event});
    }
    return result;
  }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = [...nodes]; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  focus() {}
  scrollIntoView() {}
  select() {}
  remove() {}
}

async function main() {
  const ids = [
    'ingredients','ingredientCount','strictMode','modeNote','results','emptyState',
    'summary','scoreValue','statusPill','summaryTitle','summaryDesc','foundCount',
    'unmarkedCount','riskSummary','findingArea','allIngredients','toast',
    'tab-checker','panel-checker','tab-method','panel-method','tab-sources','panel-sources',
    'analyzeBtn','clearBtn','copyBtn','ruleCount'
  ];
  const normalEmpty = 'No results yet. Enter an ingredient list and select <strong>Check product</strong>.';
  const elements = new Map(ids.map(id => [id, new Element(id === 'emptyState' ? normalEmpty : '')]));
  elements.get('results').hidden = true;
  elements.get('panel-method').hidden = true;
  elements.get('panel-sources').hidden = true;
  elements.get('modeNote').textContent = 'Strict mode includes low-confidence flags, Galactomyces (3/3), and unknown oil/wax pattern flags.';
  const writes = [];
  const document = {
    getElementById(id) { return elements.get(id) || null; },
    createElement() { return new Element(); },
    createTextNode(text) { return {textContent: String(text)}; },
    body: new Element(),
    execCommand() { return true; }
  };
  const window = {
    InciRules: R,
    matchMedia() { return {matches: true}; },
    scrollTo() {}
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), {
    window, document,
    navigator: {clipboard: {async writeText(text) { writes.push(text); }}},
    setTimeout() { return 1; }, clearTimeout() {}
  }, {filename: 'app.js'});

  const get = id => elements.get(id);
  assert.equal(get('results').hidden, true, 'results begin hidden');
  assert.match(get('modeNote').textContent, /Galactomyces \(3\/3\)/);
  assert.match(get('modeNote').textContent, /unknown oil\/wax pattern flags/i);

  get('strictMode').checked = false;
  get('strictMode').dispatch('change');
  assert.match(get('modeNote').textContent, /Galactomyces \(3\/3\)/);
  assert.match(get('modeNote').textContent, /Balanced mode hides/i);
  get('strictMode').checked = true;
  get('strictMode').dispatch('change');

  get('ingredients').value = 'Oleic Acid';
  get('ingredients').dispatch('input');
  assert.equal(get('ingredientCount').textContent, '1 ingredient detected');
  get('analyzeBtn').dispatch('click');
  assert.equal(get('results').hidden, false);
  assert.equal(get('scoreValue').textContent, '3/3');
  await get('copyBtn').dispatch('click');
  assert.equal(writes.length, 1, 'a current assessment can be copied');
  assert.match(writes[0], /Oleic Acid/);

  get('ingredients').value = 'Aqua';
  get('ingredients').dispatch('input');
  assert.equal(get('results').hidden, true, 'editing hides the stale result');
  assert.equal(get('emptyState').hidden, false, 'editing restores the empty state');
  assert.match(get('emptyState').textContent, /changed.*Check product again/i);
  await get('copyBtn').dispatch('click');
  assert.equal(writes.length, 1, 'the previous assessment cannot be copied after editing');

  get('analyzeBtn').dispatch('click');
  assert.equal(get('results').hidden, false, 'the edited input can be analyzed again');
  assert.equal(get('scoreValue').textContent, '0/3');
  await get('copyBtn').dispatch('click');
  assert.equal(writes.length, 2, 'the updated assessment can be copied');
  assert.match(writes[1], /Overall caution level: 0\/3/);
  assert.doesNotMatch(writes[1], /Oleic Acid/);

  get('clearBtn').dispatch('click');
  assert.equal(get('ingredients').value, '');
  assert.equal(get('results').hidden, true);
  assert.equal(get('emptyState').innerHTML, normalEmpty, 'Clear restores the normal empty-state copy');
  console.log('✓ App-state checks passed');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
