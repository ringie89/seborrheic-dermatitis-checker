#!/usr/bin/env node
/** Offline CLI integration tests using synthetic CSV rows; no product claims or network access. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const runner=path.join(here,'real100.mjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'inci-annotation-test-'));
const quote=value=>'"'+String(value??'').replace(/"/g,'""')+'"';
function parseCSVLine(line){const cells=[];let value='',quoted=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quoted&&line[i+1]==='"'){value+='"';i++}else quoted=!quoted}else if(ch===','&&!quoted){cells.push(value);value=''}else value+=ch}cells.push(value);return cells}
function serializeRows(header,rows){return [header,...rows.map(row=>header.map(key=>quote(row[key]??'')).join(','))].join('\n')+'\n'}
function run(input,outputDir,annotations){
  const args=[runner,'--input',input,'--output-dir',outputDir];
  if(annotations)args.push('--annotations',annotations);
  return spawnSync(process.execPath,args,{encoding:'utf8',timeout:20000});
}
function runWithoutAnnotationPath(input,outputDir){
  return spawnSync(process.execPath,[runner,'--input',input,'--output-dir',outputDir,'--annotations'],{encoding:'utf8',timeout:20000});
}
function expectFailure(result,pattern,label){
  assert.notEqual(result.status,0,`${label}: command should fail`);
  assert.match((result.stderr||'')+(result.stdout||''),pattern,`${label}: expected a clear error`);
}

try {
  const header=['product_id','source_sha256','formula_sha256','reviewed','flagged_ingredients','notes'];
  const inci='Aqua, Glycerin, Panthenol, Niacinamide, Sodium Chloride, Citric Acid, Allantoin, Oleic Acid, Dimethicone, Squalene';
  const csv=['brand,name,inci',...Array.from({length:100},(_,i)=>`Synthetic Test Brand,Synthetic Fixture ${String(i+1).padStart(3,'0')},${inci}`)].join('\n')+'\n';
  const input=path.join(root,'synthetic-products.csv');
  const outputDir=path.join(root,'output');
  const annotationPath=path.join(root,'annotations.csv');
  fs.writeFileSync(input,csv);

  const first=run(input,outputDir);
  assert.equal(first.status,0,first.stderr||first.stdout);
  const resultPath=path.join(outputDir,'real_100_results.json');
  const result=JSON.parse(fs.readFileSync(resultPath,'utf8'));
  assert.equal(result.total_scans,100);
  assert.equal(new Set(result.products.map(p=>p.formula_sha256)).size,1,'identical synthetic formulas share one formula hash');
  const sourceHash=result.source_sha256;
  const product=result.products[0];
  assert.ok(product.checker_all.some(x=>x.name==='Squalene'&&x.rating===1&&x.category==='mechanistic'),'the Squalene mechanism is included in the checker results');
  assert.ok(!product.out_of_scope_flags.includes('Squalene'),'the Malassezia audit scope recognizes the mechanistic group');
  const templatePath=path.join(outputDir,`sezia_observations_template-${sourceHash}.csv`);
  assert.equal(fs.existsSync(templatePath),true,'source-bound annotation template was generated');

  // Simulate a user's reviewed annotation, then rerun the generator. Existing observations must survive.
  const templateLines=fs.readFileSync(templatePath,'utf8').trimEnd().split(/\r?\n/);
  const fields=parseCSVLine(templateLines[1]);
  assert.equal(fields[0],product.id);
  fields[3]='yes';
  fields[5]='synthetic, "quoted" test note';
  templateLines[1]=fields.map(quote).join(',');
  const editedTemplate=templateLines.join('\n')+'\n';
  fs.writeFileSync(templatePath,editedTemplate);
  const rerun=run(input,outputDir);
  assert.equal(rerun.status,0,rerun.stderr||rerun.stdout);
  assert.equal(fs.readFileSync(templatePath,'utf8'),editedTemplate,'existing reviewed template is never overwritten');
  assert.match(rerun.stderr,/Preserved existing annotation template/);

  // A same-source/same-formula row is accepted; reviewed=yes with no flags means no observed flags.
  const accepted=run(input,outputDir,templatePath);
  assert.equal(accepted.status,0,accepted.stderr||accepted.stdout);
  const annotated=JSON.parse(fs.readFileSync(resultPath,'utf8')).live_sezia_annotations;
  assert.equal(annotated.n,1);

  fs.writeFileSync(annotationPath,`${header.map(quote).join(',')}\n${['"'+product.id+'"suffix',quote(sourceHash),quote(product.formula_sha256),quote('yes'),quote(''),quote('note')].join(',')}\n`);
  expectFailure(run(input,outputDir,annotationPath),/unexpected text after a closing quote/i,'text after a closing quote');

  fs.writeFileSync(annotationPath,`${header.map(quote).join(',')}\n${[product.id+'"extra',quote(sourceHash),quote(product.formula_sha256),quote('yes'),quote(''),quote('note')].join(',')}\n`);
  expectFailure(run(input,outputDir,annotationPath),/quote inside an unquoted field/i,'quote inside an unquoted field');

  expectFailure(runWithoutAnnotationPath(input,outputDir),/--annotations requires a value/i,'missing annotation path');

  const validRow={product_id:product.id,source_sha256:sourceHash,formula_sha256:product.formula_sha256,reviewed:'yes',flagged_ingredients:'',notes:''};
  const writeAnnotations=(rows,columns=header)=>fs.writeFileSync(annotationPath,serializeRows(columns,rows));

  writeAnnotations([{...validRow,formula_sha256:'0'.repeat(64)}]);
  expectFailure(run(input,outputDir,annotationPath),/formula_sha256 mismatch/i,'changed formula hash');

  writeAnnotations([{product_id:product.id,reviewed:'yes',flagged_ingredients:'',notes:''}],['product_id','reviewed','flagged_ingredients','notes']);
  expectFailure(run(input,outputDir,annotationPath),/missing required column.*source_sha256.*formula_sha256/i,'legacy file without hash columns');

  writeAnnotations([{...validRow,source_sha256:''}]);
  expectFailure(run(input,outputDir,annotationPath),/missing a valid source_sha256/i,'missing source hash value');

  writeAnnotations([{...validRow,formula_sha256:''}]);
  expectFailure(run(input,outputDir,annotationPath),/missing a valid formula_sha256/i,'missing formula hash value');

  writeAnnotations([{...validRow,product_id:'SRC-9999'}]);
  expectFailure(run(input,outputDir,annotationPath),/Unknown product_id SRC-9999/i,'unknown product ID');

  writeAnnotations([validRow,validRow]);
  expectFailure(run(input,outputDir,annotationPath),/Duplicate annotation row/i,'duplicate product ID');

  fs.writeFileSync(annotationPath,`${header.map(quote).join(',')}\n${quote(product.id)},${quote(sourceHash)}\n`);
  expectFailure(run(input,outputDir,annotationPath),/has 2 columns; expected 6/i,'truncated annotation row');

  fs.writeFileSync(annotationPath,`${header.map(quote).join(',')}\n${[quote(product.id),quote(sourceHash),quote(product.formula_sha256),quote('yes'),quote(''), '"unfinished note'].join(',')}\n`);
  expectFailure(run(input,outputDir,annotationPath),/unterminated quoted field.*multiline CSV fields are not supported/i,'unterminated annotation quote');

  writeAnnotations([{...validRow,reviewed:'maybe'}]);
  expectFailure(run(input,outputDir,annotationPath),/invalid reviewed value/i,'invalid reviewed value');

  const changedSource=path.join(root,'changed-source.csv');
  fs.writeFileSync(changedSource,csv+'# source revision\n');
  expectFailure(run(changedSource,outputDir,templatePath),/source_sha256 mismatch/i,'changed source CSV');

  console.log('PASS: offline annotation integrity CLI checks (100 synthetic CSV rows)');
} finally {
  fs.rmSync(root,{recursive:true,force:true});
}
