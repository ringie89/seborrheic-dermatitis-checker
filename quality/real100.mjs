#!/usr/bin/env node
/**
 * AUDITABLE REAL-PRODUCT BENCHMARK RUNNER
 * - Source: historical public product CSV at LauraAddams/skincareAPI.
 * - Uses 100 genuine on-label ingredient lists (not synthetic), sampled deterministically.
 * - Independent comparison is to PUBLISHED Sezia *category descriptions*, NOT live Sezia.
 * - An optional manually supplied Sezia-results CSV gives a true observed comparison.
 * - Annotation files must carry the exact source and formula hashes from their template.
 * - Deliberately does not use the checker rules to generate its reference labels.
 *
 * Run (network): node quality/real100.mjs
 * Run (offline): node quality/real100.mjs --input /path/to/Prod1.csv
 * Run with annotations: node quality/real100.mjs --input ... --annotations quality/sezia_observations_template-<source-hash>.csv
 * Choose an output folder: node quality/real100.mjs --input ... --output-dir /path/to/report
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const R=require('../rules.js');
const dir=path.dirname(fileURLToPath(import.meta.url));
const SOURCE='https://raw.githubusercontent.com/LauraAddams/skincareAPI/master/db/seed_data/Prod1.csv';
const args=process.argv.slice(2);
function arg(key){
 const i=args.indexOf(key);if(i<0)return null;
 const value=args[i+1];
 if(!value||value.startsWith('--'))throw Error(`${key} requires a value`);
 return value;
}
function eq(a,b){return R.normalize(a)===R.normalize(b)}
function hash(v){return crypto.createHash('sha256').update(v).digest('hex')}
function formulaHash(inci){
 const canonical=String(inci).normalize('NFKC').replace(/\r\n?/g,'\n').split('\n').map(line=>line.trim().replace(/[ \t]+/g,' ')).join('\n').toLowerCase();
 return hash(canonical);
}
const readFile=p=>fs.readFileSync(p,'utf8');

// GitHub source CSV is irregular: commas in ingredient lists are NOT quoted.
// Only the first TWO commas delimit brand and product name; rest is the full INCI.
function extract(source){
  const lines=source.replace(/^\uFEFF/,'').split(/\r?\n/);
  const out=[];
  for(let index=1;index<lines.length;index++){
    const line=lines[index];
    const first=line.indexOf(','); if(first<0)continue;
    const second=line.indexOf(',',first+1); if(second<0)continue;
    const brand=line.slice(0,first).trim();
    const name=line.slice(first+1,second).trim();
    const inci=line.slice(second+1).trim();
    const tokens=R.parseIngredients(inci);
    if(!brand||!name||tokens.length<8||inci.length<70||tokens.length>180)continue;
    // CSV is older, sometimes contains nonstandard/misspelled INCI and non-INCI marketing text.
    if(/^(ingredients|inci)$/i.test(name))continue;
    out.push({id:`SRC-${String(index).padStart(4,'0')}`,brand,name,inci,formula_sha256:formulaHash(inci),raw_line:index+1,source_url:SOURCE});
  }
  const unique=new Map();
  for(const p of out){const key=(p.brand+' '+p.name).toLowerCase();if(!unique.has(key))unique.set(key,p)}
  return [...unique.values()];
}

// Independent, simplified *published-category model*. This is not Sezia's
// proprietary matcher, live results or a medical ground-truth data set.
// Patterns were authored independently from the the checker matching registry.
const FATTY=new Set(`oleic acid|stearic acid|lauric acid|myristic acid|palmitic acid|palmitoleic acid|linoleic acid|linolenic acid|arachidic acid|behenic acid|erucic acid|undecylenic acid|undecanoic acid|tridecylic acid|pentadecylic acid|margaric acid|vaccenic acid|elaidic acid|arachidonic acid|gondoic acid|nervonic acid|ricinoleic acid|lignoceric acid|nonadecylic acid|docosahexaenoic acid|eicosapentaenoic acid`.split('|'));
const OILS=new Set(`coconut oil|olive oil|shea butter|jojoba oil|sunflower seed oil|argan oil|cocoa butter|avocado oil|cera alba|beeswax|castor seed oil|vegetable oil|hydrogenated vegetable oil|palm oil|grape seed oil`.split('|'));
const NOT_OIL=/^(?:mineral oil|paraffinum liquidum|paraffin oil|coconut alkanes|mct oil|squalane|squalene|hydrocarbon|olive oil unsaponifiables|caprylic\/capric triglyceride|capric\/caprylic triglyceride)$/;
const VOLATILE_OIL=/(?:leaf|peel|flower|wood|bark) oil$|\b(?:tea tree|peppermint|eucalyptus|lavender|bergamot|rosemary)\b/;
const ESTER_TAIL=/(?:oleate|stearate|palmitate|myristate|laurate|isostearate|linoleate|behenate|cocoate|olivate|dioleate|distearate|ricinoleate|hydroxystearate)$/;
const SHORT_CHAIN=new Set(`glyceryl caprylate|glyceryl caprate|caprylic\/capric triglyceride|diethylhexyl malate|isostearyl neopentanoate|c12-15 alkyl benzoate|coco-caprylate|coco-caprylate\/caprate|ethylhexylglycerin`.split('|'));
const SALTS=/^(?:sodium|potassium|zinc|disodium|magnesium) (?:stearate|palmitate|oleate|laurate|myristate|stearoyl|lauroyl|cocoyl)/;
function normalizedForReference(label){return R.normalize(label)} // normalization only; not matching or categories
function publishedCategory(label){
  const k=normalizedForReference(label);
  if(FATTY.has(k))return 'fatty acids';
  if(/galactomyces/.test(k))return 'galactomyces';
  if(/\b(?:ferment|ferments|fermented|yeast|faex|saccharomyces)\b/.test(k))return 'high sensitivity';
  if(SALTS.test(k))return 'unverified salts';
  if(!NOT_OIL.test(k) && (OILS.has(k)||(/\b(?:seed|kernel|fruit) oil$/.test(k)&&!VOLATILE_OIL.test(k))||/\b(?:butter|wax)$/.test(k) && !VOLATILE_OIL.test(k)))return 'complex lipids';
  if(/^polysorbate\s*\d+$/.test(k))return 'esters';
  if(!SHORT_CHAIN.has(k) && ESTER_TAIL.test(k) && !/^(sodium|potassium|magnesium|zinc|ammonium) /.test(k))return 'esters';
  return null;
}
const MALASSEZIA=new Set(['fatty','lipid','ester','phospholipid','galactomyces','ferment','salt','oilunknown','glycerides','mechanistic']);
function skinKey(x){return R.normalize(x)}
function examine(p){
  const scan=R.analyze(p.inci);
  const reference=scan.ingredients.filter(x=>publishedCategory(x.name)).map(x=>({name:x.name,category:publishedCategory(x.name)}));
  const matched=scan.matches.filter(x=>MALASSEZIA.has(x.finding.group));
  const rSet=new Set(reference.map(x=>skinKey(x.name)));
  const sSet=new Set(matched.map(x=>skinKey(x.name)));
  return {
    ...p, ingredient_count:scan.total, checker_rating:scan.highest,
    checker_all:scan.matches.map(x=>({name:x.name,rating:x.finding.rating,category:x.finding.group})),
    published_sezia_model:reference,
    shared:reference.filter(x=>sSet.has(skinKey(x.name))).map(x=>x.name),
    missed_by_checker:reference.filter(x=>!sSet.has(skinKey(x.name))).map(x=>x.name),
    additional_checker:matched.filter(x=>!rSet.has(skinKey(x.name))).map(x=>x.name),
    out_of_scope_flags:scan.matches.filter(x=>!MALASSEZIA.has(x.finding.group)).map(x=>x.name)
  };
}
function escCsv(s){return '"'+String(s??'').replace(/"/g,'""')+'"'}
function parseCSVLine(line,context='CSV line'){
 const a=[];let t='',quoted=false,closed=false;
 for(let i=0;i<line.length;i++){
  const c=line[i];
  if(quoted){
   if(c==='"'){if(line[i+1]==='"'){t+='"';i++}else{quoted=false;closed=true}}
   else t+=c;
   continue;
  }
  if(c===','){a.push(t);t='';closed=false;continue}
  if(closed){if(/\s/.test(c))continue;throw Error(`${context} has unexpected text after a closing quote`)}
  if(c==='"'){
   if(t.length)throw Error(`${context} has a quote inside an unquoted field`);
   quoted=true;continue;
  }
  t+=c;
 }
 if(quoted)throw Error(`${context} has an unterminated quoted field; multiline CSV fields are not supported`);
 a.push(t);return a;
}
function annotatedScores(scans,file,sourceSha256){
 if(!file)return {n:0,matched:0,missed:0,extra:0,rows:[]};
 const lines=readFile(file).replace(/^\uFEFF/,'').split(/\r?\n/);
 const headerLine=lines.shift();
 if(!headerLine?.trim())throw Error('Annotations file is empty or missing its header row');
 const header=parseCSVLine(headerLine,'Annotations header').map(x=>x.trim().toLowerCase());
 const required=['product_id','source_sha256','formula_sha256','reviewed','flagged_ingredients'];
 const missing=required.filter(x=>!header.includes(x));
 if(missing.length)throw Error(`Annotations file is missing required column(s): ${missing.join(', ')}. Legacy annotations are not accepted; generate a source-specific template.`);
 for(const name of required){if(header.filter(x=>x===name).length!==1)throw Error(`Annotations header must contain exactly one ${name} column`)}
 const column=Object.fromEntries(required.map(name=>[name,header.indexOf(name)]));
 if(header.includes('notes')&&header.filter(x=>x==='notes').length!==1)throw Error('Annotations header must contain at most one notes column');
 const scanById=new Map(scans.map(p=>[p.id,p]));
 const map=new Map();
 for(let i=0;i<lines.length;i++){
  const line=lines[i];if(!line.trim())continue;
  const rowNumber=i+2;
  const cells=parseCSVLine(line,`Annotations row ${rowNumber}`);
  if(cells.length!==header.length)throw Error(`Annotations row ${rowNumber} has ${cells.length} columns; expected ${header.length}`);
  const value=name=>(cells[column[name]]||'').trim();
  const id=value('product_id');
  if(!id)throw Error(`Annotations row ${rowNumber} has an empty product_id`);
  if(map.has(id))throw Error(`Duplicate annotation row for product_id ${id}`);
  const product=scanById.get(id);
  if(!product)throw Error(`Unknown product_id ${id} in annotations`);
  const rowSource=value('source_sha256').toLowerCase();
  if(!/^[a-f0-9]{64}$/.test(rowSource))throw Error(`Annotations row ${rowNumber} is missing a valid source_sha256`);
  if(rowSource!==sourceSha256)throw Error(`source_sha256 mismatch for ${id}; annotations belong to a different source CSV`);
  const rowFormula=value('formula_sha256').toLowerCase();
  if(!/^[a-f0-9]{64}$/.test(rowFormula))throw Error(`Annotations row ${rowNumber} is missing a valid formula_sha256`);
  if(rowFormula!==product.formula_sha256)throw Error(`formula_sha256 mismatch for ${id}; the ingredient formula has changed`);
  const reviewed=value('reviewed').toLowerCase();
  if(!['','yes','no'].includes(reviewed))throw Error(`Annotations row ${rowNumber} has invalid reviewed value ${JSON.stringify(reviewed)}; use yes, no, or blank`);
  const flags=value('flagged_ingredients').split('|').map(x=>x.trim()).filter(Boolean);
  const notes=header.includes('notes')?(cells[header.indexOf('notes')]||'').trim():'';
  map.set(id,{reviewed,flags,notes});
 }
 const results=[];let matched=0,missed=0,extra=0;
 for(const p of scans){const obs=map.get(p.id);if(!obs||obs.reviewed!=='yes')continue;
  const s=new Set(p.checker_all.filter(x=>MALASSEZIA.has(x.category)).map(x=>skinKey(x.name)));
  const o=new Set(obs.flags.map(skinKey));
  const same=[...o].filter(x=>s.has(x));const omissions=[...o].filter(x=>!s.has(x));const additions=[...s].filter(x=>!o.has(x));
  matched+=same.length;missed+=omissions.length;extra+=additions.length;
  results.push({id:p.id,name:p.name,shared:same,missed:omissions,additional:additions});
 }
 return {n:results.length,matched,missed,extra,rows:results};
}
async function main(){
 let csv;const input=arg('--input');
 if(input){csv=readFile(input)}
 else {
  console.log('Downloading public historic product labels from:',SOURCE);
  let response;
  try{response=await fetch(SOURCE,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'the checker-INCI-Benchmark/1.0'}})}catch(e){throw Error('Download failed: '+e.message+'; download Prod1.csv manually and run with --input /path/to/Prod1.csv')}
  if(!response.ok)throw Error(`Source returned ${response.status}; use --input for an existing local CSV`);
  csv=await response.text();
 }
 const sourceSha256=hash(csv);
 const candidates=extract(csv);
 if(candidates.length<100)throw Error(`Only ${candidates.length} usable unique full INCI lists; need at least 100`);
 // Fixed random selection by content hash => independent of input order and program rules.
 const selection=candidates.sort((a,b)=>hash('the checker 2026 v1 '+a.brand+' '+a.name).localeCompare(hash('the checker 2026 v1 '+b.brand+' '+b.name))).slice(0,100);
 const scans=selection.map(examine);
 const annotated=annotatedScores(scans,arg('--annotations'),sourceSha256);
 const outputDir=path.resolve(arg('--output-dir')||dir);
 fs.mkdirSync(outputDir,{recursive:true});
 const nIngredients=scans.reduce((n,x)=>n+x.ingredient_count,0);
 const shared=scans.reduce((n,x)=>n+x.shared.length,0);
 const missed=scans.reduce((n,x)=>n+x.missed_by_checker.length,0);
 const additional=scans.reduce((n,x)=>n+x.additional_checker.length,0);
 const metric=(value,denom)=>denom?((100*value/denom).toFixed(1)+'%'):'N/A';
 const results={as_of:new Date().toISOString(),source:SOURCE,source_sha256:sourceSha256,selection_rule:'100 distinct products with >=8 INCI tokens, rank by SHA-256(brand + product name + fixed seed)',source_caveat:'Archived product catalog: ingredients may be outdated or mistyped; independently checking current packages is not done',reference_kind:'Sezia published categories approximation, NOT live Sezia',total_candidates:candidates.length,total_scans:100,ingredient_positions:nIngredients,published_category_overlap:{shared,missed,additional,recall_proxy:metric(shared,shared+missed),precision_proxy:metric(shared,shared+additional)},live_sezia_annotations:annotated,products:scans};
 fs.writeFileSync(path.join(outputDir,'real_100_results.json'),JSON.stringify(results,null,2)+'\n');
 const templateHeader=['product_id','source_sha256','formula_sha256','reviewed','flagged_ingredients','notes'];
 const template=[templateHeader.join(','),...scans.map(x=>[x.id,sourceSha256,x.formula_sha256,'','',''].map(escCsv).join(','))].join('\n')+'\n';
 const templateName=`sezia_observations_template-${sourceSha256}.csv`;
 const templatePath=path.join(outputDir,templateName);
 if(!fs.existsSync(templatePath))fs.writeFileSync(templatePath,template);
 else if(readFile(templatePath)!==template)console.warn(`Preserved existing annotation template without overwriting it: ${templatePath}`);
 const topMisses=scans.filter(x=>x.missed_by_checker.length).sort((a,b)=>b.missed_by_checker.length-a.missed_by_checker.length).slice(0,20);
 const topExtra=scans.filter(x=>x.additional_checker.length).sort((a,b)=>b.additional_checker.length-a.additional_checker.length).slice(0,20);
 const rows=(arr,key)=>arr.map(x=>`| ${x.id} | ${x.brand} — ${x.name.replaceAll('|','/')} | ${x[key].join('; ').replaceAll('|','/')} |`).join('\n') || '| — | — | None |';
 const md=`# Real-product INCI quality benchmark (100 archived formulas)\n\nGenerated: ${results.as_of}\n\n## Provenance\n- Catalog: [LauraAddams/skincareAPI Prod1.csv](${SOURCE}). Archived/crowd-sourced ingredient text; formulas may have changed.\n- Source SHA-256: \`${results.source_sha256}\`.\n- ${candidates.length} records met the minimal completeness filter; exactly **100 distinct full ingredient lists** selected by fixed hash, without selecting based on warnings.\n- Parsed ingredient positions: **${nIngredients}**.\n- **This was NOT a live Sezia.co scan.** Published-category comparator is an independently authored approximation of Sezia's documented groups.\n\n## Agreement with a simplified published-category comparator\n\n| Metric | Value |\n|---|---:|\n| Both flag | ${shared} |\n| Comparator flags, the checker does not | ${missed} |\n| the checker Malassezia flags, comparator does not | ${additional} |\n| Detection overlap (recall proxy, NOT clinical sensitivity) | ${metric(shared,shared+missed)} |\n| Match agreement (precision proxy, NOT clinical specificity) | ${metric(shared,shared+additional)} |\n\nDifferences are **review candidates, not demonstrated errors**. A simpler comparator misses some legitimate complex lipid patterns; the checker deliberately excludes generic irritation and contact-allergy warnings.\n\n## True, independently observed Sezia.co comparisons\n\nCurrently annotated: **${annotated.n} / 100**.\n\n| Ingredient-level metric | Count |\n|---|---:|\n| Shared live-Sezia and the checker flags | ${annotated.matched} |\n| Live-Sezia flags missing from the checker | ${annotated.missed} |\n| Additional the checker Malassezia flags | ${annotated.extra} |\n\nTo compare actual results, manually scan the same INCI at sezia.co and fill the generated source-bound template \`${templateName}\`. Keep the product IDs and both hash columns unchanged; the runner verifies the CSV and individual formula hashes. Set reviewed to \`yes\`, and put actual flagged INCI names separated by \`|\` in the flagged_ingredients column. Rows and notes must each fit on one physical CSV line; embedded newlines are rejected. Then rerun with \`--annotations FILE\`. Empty reviewed results with \`yes\` are valid. Do not guess what Sezia would return.\n\n## Top disagreements: Published-category comparator flags absent from the checker\n\n| ID | Product | Ingredients to review |\n|---|---|---|\n${rows(topMisses,'missed_by_checker')}\n\n## Top additional Malassezia flags in the checker\n\n| ID | Product | Ingredients to review |\n|---|---|---|\n${rows(topExtra,'additional_checker')}\n\n## Limitations\n\nThis is a *label-detection audit*, not a dermatology validation. No concentrations, patch tests, Malassezia species, or clinical outcomes are known. The source contains legacy/possibly malformed lists; results should be checked against up-to-date packaging for clinical or purchasing decisions. Dataset source is independently maintained and not affiliated with Sezia.\n`;
 fs.writeFileSync(path.join(outputDir,'REAL_100_REPORT.md'),md);
 console.log(`Benchmark generated: ${scans.length} archived commercial INCI lists; ${nIngredients} ingredient positions.`);
 console.log(`Published-group comparator: shared ${shared}; missing ${missed}; additional ${additional}; overlap ${metric(shared,shared+missed)} (NOT diagnostic accuracy).`);
 console.log(`Actual Sezia live observations: ${annotated.n}/100. Report: ${path.join(outputDir,'REAL_100_REPORT.md')}`);
}
main().catch(e=>{console.error('Benchmark not completed:',e.message);process.exitCode=1});
