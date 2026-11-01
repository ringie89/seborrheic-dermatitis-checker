/*
 * the checker INCI rules — self-contained, no dependencies.
 * Malassezia/seborrheic-dermatitis-only conservative screening; NOT a clinical diagnosis.
 * Source links and limitations: README.md.
 * To extend a category, add names to the corresponding add(...) list.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.InciRules = api;
})(typeof window !== 'undefined' ? window : undefined, function () {
  'use strict';

  const SOURCES = Object.freeze({
    fatty: 'https://www.sezia.co/ingredients/fatty-acids',
    lipids: 'https://www.sezia.co/ingredients/lipids',
    esters: 'https://www.sezia.co/ingredients/esters',
    ferment: 'https://www.sezia.co/ingredients/high-sensitivity',
    galactomyces: 'https://www.sezia.co/ingredients/galactomyces',
    unsure: 'https://www.sezia.co/ingredients/unverified',
    research: 'https://pubmed.ncbi.nlm.nih.gov/34304284/',
    research2025: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12416284/',
    treatment: 'https://www.aad.org/public/diseases/a-z/seborrheic-dermatitis-treatment',
    science: 'https://simpleskincarescience.com/pityrosporum-folliculitis-treatment-malassezia-cure/',
    squaleneMechanism: 'https://pubmed.ncbi.nlm.nih.gov/36789756/',
    cosmeticIngredientStudy: 'https://doi.org/10.3390/cosmetics6030045',
    cosmeticIngredientSupplement: 'https://mdpi-res.com/d_attachment/cosmetics/cosmetics-06-00045/article_deploy/cosmetics-06-00045-s001.pdf?version=1564647082'
  });

  const GROUP = Object.freeze({
    fatty: {rating: 3, name: 'Long-chain fatty acid', reason: 'C11–C24 fatty acid: conservatively flagged in strict Malassezia screening. Actual effects depend on the yeast species, dose, and formulation.', basis: 'Mechanistic concern / precaution', source: SOURCES.fatty},
    lipid: {rating: 3, name: 'Oil, butter, or wax', reason: 'Often contains long-chain lipids. Flagged as a precaution in strict Malassezia routines, although not every botanical oil is proven to worsen dermatitis.', basis: 'Precaution / lipid profile', source: SOURCES.lipids},
    ester: {rating: 2, name: 'Fatty acid ester', reason: 'Contains a long-chain fatty acid component. Some esters may be broken down by Malassezia lipases; whether this particular ingredient is usable is not established.', basis: 'Mechanistic concern / precaution', source: SOURCES.esters},
    phospholipid: {rating: 2, name: 'Complex lipid', reason: 'A complex lipid containing fatty acid components. A conservative flag, not proof that it triggers dermatitis.', basis: 'Precaution', source: SOURCES.research},
    galactomyces: {rating: 3, name: 'Galactomyces', reason: 'A yeast-derived ingredient is included as a strict-screening precaution. Direct clinical evidence that it worsens seborrheic dermatitis is insufficient.', basis: 'Conservative precaution / uncertain', source: SOURCES.galactomyces},
    ferment: {rating: 1, name: 'Ferment — uncertain Malassezia relevance', reason: 'Some non-lipid ferments are included in a cautious microbiome-related category. A direct effect on Malassezia or seborrheic dermatitis has not been established. Included only in strict mode.', basis: 'Malassezia link uncertain / precaution', source: SOURCES.ferment},
    salt: {rating: 1, name: 'Unverified Malassezia-related salt', reason: 'This type of fatty-acid-derived salt or acyl compound is treated as unverified. Whether it supplies usable fatty acids to Malassezia or worsens seborrheic dermatitis is unknown. Included only in strict mode.', basis: 'Unverified Malassezia concern', source: SOURCES.unsure},
    mechanistic: {rating: 1, name: 'Preliminary Malassezia mechanism', reason: 'A non-peer-reviewed 2026 preprint reports a single-strain in-vitro hyphal signal with Squalene; published studies link Squalene oxidation products to dandruff models. This does not show that a cosmetic product containing Squalene causes seborrheic dermatitis. Included only in strict mode.', basis: 'Preliminary mechanism / uncertain', source: SOURCES.squaleneMechanism},
    cetearylGrowth: {rating: 2, name: 'Cetearyl alcohol — experimental growth signal', reason: 'One in-vitro study observed Malassezia growth with cetearyl alcohol, especially for M. furfur. The result is strain-dependent and does not establish a clinical trigger or predict the effect of a finished product.', basis: 'Experimental in-vitro growth signal / species-specific', source: SOURCES.cosmeticIngredientSupplement},
    mineralOilUncertain: {rating: 1, name: 'Mineral oil — conflicting in-vitro result', reason: 'The supplement to one in-vitro study reports growth on paraffinum liquidum for two M. furfur strains, while the article text says no growth on paraffin-based substances. This conflicting, limited finding is included only as a low-confidence Strict flag, not evidence of a clinical trigger.', basis: 'Conflicting experimental result / Strict-only', source: SOURCES.cosmeticIngredientSupplement},
    oilunknown: {rating: 2, name: 'Oil or wax — check composition', reason: 'Looks like an oil-, wax-, or butter-based lipid. Its specific composition is not covered by the known ingredient list.', basis: 'Heuristic / unverified', source: SOURCES.lipids},
    glycerides: {rating: 2, name: 'Unspecified glyceride blend', reason: 'May contain glycerides of long-chain fatty acids. Since the fatty acid distribution is not stated, this is a formulation-dependent precaution, not a proven trigger.', basis: 'Uncertain lipid composition', source: SOURCES.lipids}
  });

  function normalize(value) {
    return String(value || '')
      .normalize('NFKC')
      .replace(/[\u2010-\u2015\u2212]/g, '-')
      .replace(/\u00a0/g, ' ')
      .toLowerCase()
      .replace(/\s*\([^)]*\)/g, '') // e.g. Aqua (Water), common label synonyms
      .replace(/^(?:(?:certified\s+)?organic|cold[ -]pressed|unrefined|refined|virgin|extra virgin)\s+/g, '') // marketing prefixes on oil labels
      .replace(/\s*\/\s*/g, '/')
      .replace(/\s*[-]\s*/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\.$/, '');
  }

  const exact = new Map();
  function add(names, group, override) {
    for (const raw of names.split('|')) {
      const item = normalize(raw);
      if (item) exact.set(item, {...GROUP[group], group, ...(override || {})});
    }
  }

  // Sezia C11–C24 examples, plus common label variants.
  add(`Undecylenic Acid|Undecanoic Acid|Lauric Acid|Dodecanoic Acid|Tridecylic Acid|Tridecanoic Acid|Myristic Acid|Tetradecanoic Acid|Pentadecylic Acid|Pentadecanoic Acid|Palmitic Acid|Hexadecanoic Acid|Palmitoleic Acid|Margaric Acid|Heptadecanoic Acid|Stearic Acid|Octadecanoic Acid|Oleic Acid|Vaccenic Acid|Elaidic Acid|Linoleic Acid|Linolelaidic Acid|Alpha-Linolenic Acid|Gamma-Linolenic Acid|Linolenic Acid|Stearidonic Acid|Nonadecylic Acid|Nonadecanoic Acid|Arachidic Acid|Eicosanoic Acid|Gondoic Acid|Dihomo-Gamma-Linolenic Acid|Mead Acid|Arachidonic Acid|Eicosapentaenoic Acid|Heneicosylic Acid|Heneicosanoic Acid|Behenic Acid|Docosanoic Acid|Erucic Acid|Docosatetraenoic Acid|Docosahexaenoic Acid|Tricosylic Acid|Tricosanoic Acid|Lignoceric Acid|Tetracosanoic Acid|Nervonic Acid|Isostearic Acid|Hydroxystearic Acid|12-Hydroxystearic Acid|Ricinoleic Acid`, 'fatty');
  add('Oleic Acid', 'fatty', {reason:'Free oleic acid (C18:1) can affect the skin barrier and cause flaking in susceptible individuals. Particularly relevant to seborrheic dermatitis, but effects depend on dose and formulation.', source:'https://pmc.ncbi.nlm.nih.gov/articles/PMC11942342/'});
  add('Undecylenic Acid', 'fatty', {reason:'This C11 fatty acid is flagged as a precaution, although it also has antifungal properties. This does not establish that it causes clinical harm.'});

  // Expanded independent, editable botanical lipid registry. Exact INCI names and common labels.
  add(`Cocos Nucifera Oil|Coconut Oil|Cocos Nucifera Seed Oil|Olea Europaea Fruit Oil|Olive Oil|Helianthus Annuus Seed Oil|Sunflower Seed Oil|Argania Spinosa Kernel Oil|Argan Oil|Prunus Amygdalus Dulcis Oil|Sweet Almond Oil|Persea Gratissima Oil|Persea Americana Oil|Avocado Oil|Butyrospermum Parkii Butter|Shea Butter|Butyrospermum Parkii (Shea) Butter|Theobroma Cacao Seed Butter|Cocoa Butter|Ricinus Communis Seed Oil|Castor Oil|Hydrogenated Castor Oil|Simmondsia Chinensis Seed Oil|Jojoba Seed Oil|Jojoba Oil|Vitis Vinifera Seed Oil|Grape Seed Oil|Sesamum Indicum Seed Oil|Sesame Seed Oil|Glycine Soja Oil|Soybean Oil|Glycine Soja (Soybean) Oil|Oenothera Biennis Oil|Evening Primrose Oil|Prunus Armeniaca Kernel Oil|Apricot Kernel Oil|Cannabis Sativa Seed Oil|Hemp Seed Oil|Macadamia Ternifolia Seed Oil|Macadamia Integrifolia Seed Oil|Macadamia Seed Oil|Oryza Sativa Bran Oil|Rice Bran Oil|Carthamus Tinctorius Seed Oil|Safflower Seed Oil|Linum Usitatissimum Seed Oil|Flaxseed Oil|Rosa Canina Fruit Oil|Rosa Canina Seed Oil|Rosehip Seed Oil|Elaeis Guineensis Oil|Palm Oil|Mangifera Indica Seed Butter|Mango Seed Butter|Mangifera Indica Seed Oil|Cera Alba|Beeswax|Cera Flava|Copernicia Cerifera Wax|Copernicia Prunifera Wax|Carnauba Wax|Euphorbia Cerifera Wax|Candelilla Wax|Lanolin|Lanolin Oil|Lanolin Wax|Hydrogenated Lanolin|Triticum Vulgare Germ Oil|Wheat Germ Oil|Punica Granatum Seed Oil|Pomegranate Seed Oil|Adansonia Digitata Seed Oil|Baobab Seed Oil|Orbignya Oleifera Seed Oil|Babassu Oil|Astrocaryum Murumuru Seed Butter|Murumuru Butter|Astrocaryum Tucuma Seed Butter|Tucuma Butter|Garcinia Indica Seed Butter|Kokum Butter|Shorea Robusta Seed Butter|Sal Butter|Salvia Hispanica Seed Oil|Chia Seed Oil|Sclerocarya Birrea Seed Oil|Marula Oil|Limnanthes Alba Seed Oil|Meadowfoam Seed Oil|Borago Officinalis Seed Oil|Borage Seed Oil|Ribes Nigrum Seed Oil|Black Currant Seed Oil|Rubus Idaeus Seed Oil|Raspberry Seed Oil|Rubus Fruticosus Seed Oil|Blackberry Seed Oil|Vaccinium Macrocarpon Seed Oil|Cranberry Seed Oil|Hippophae Rhamnoides Fruit Oil|Hippophae Rhamnoides Seed Oil|Sea Buckthorn Oil|Opuntia Ficus-Indica Seed Oil|Prickly Pear Seed Oil|Camellia Oleifera Seed Oil|Camellia Japonica Seed Oil|Camellia Sinensis Seed Oil|Camellia Seed Oil|Morinda Citrifolia Seed Oil|Moringa Oleifera Seed Oil|Moringa Oil|Azadirachta Indica Seed Oil|Neem Seed Oil|Carapa Guaianensis Seed Oil|Andiroba Seed Oil|Calophyllum Inophyllum Seed Oil|Tamanu Oil|Bertholletia Excelsa Seed Oil|Brazil Nut Oil|Corylus Avellana Seed Oil|Hazelnut Oil|Juglans Regia Seed Oil|Walnut Oil|Arachis Hypogaea Oil|Peanut Oil|Prunus Persica Kernel Oil|Peach Kernel Oil|Prunus Domestica Seed Oil|Plum Kernel Oil|Cucurbita Pepo Seed Oil|Pumpkin Seed Oil|Citrullus Lanatus Seed Oil|Watermelon Seed Oil|Cucumis Melo Seed Oil|Melon Seed Oil|Silybum Marianum Seed Oil|Milk Thistle Seed Oil|Perilla Frutescens Seed Oil|Perilla Ocymoides Seed Oil|Aleurites Moluccanus Seed Oil|Kukui Nut Oil|Brassica Campestris Seed Oil|Brassica Napus Seed Oil|Rapeseed Oil|Canola Oil|Zea Mays Germ Oil|Corn Oil|Zea Mays Oil|Cottonseed Oil|Gossypium Herbaceum Seed Oil|Gossypium Hirsutum Seed Oil|Plukenetia Volubilis Seed Oil|Sacha Inchi Oil|Euterpe Oleracea Fruit Oil|Acai Oil|Caryodendron Orinocense Seed Oil|Cacay Oil|Mauritia Flexuosa Fruit Oil|Buriti Oil|Pistacia Vera Seed Oil|Pistachio Oil|Pistacia Lentiscus Seed Oil|Balanites Aegyptiaca Kernel Oil|Caprylic/Capric/Myristic/Stearic Triglyceride|Hydrogenated Vegetable Oil|Vegetable Oil|Vegetable Butter|Vegetable Wax|Cocoa Seed Butter|Mango Butter|Shea Nut Oil|Coconut Alkanes and Coconut Oil`, 'lipid');
  // Pure hydrocarbon component "Coconut Alkanes" alone is *not* treated as oil.

  add(`Isopropyl Myristate|Isopropyl Palmitate|Isopropyl Stearate|Ethylhexyl Palmitate|Ethylhexyl Stearate|Ethylhexyl Oleate|Ethylhexyl Cocoate|Ethylhexyl Laurate|Ethylhexyl Myristate|Decyl Oleate|Decyl Stearate|Cetyl Palmitate|Cetyl Stearate|Cetyl Oleate|Cetyl Myristate|Stearyl Stearate|Stearyl Palmitate|Stearyl Oleate|Stearyl Behenate|Octyldodecyl Myristate|Octyldodecyl Stearate|Octyldodecyl Oleate|Myristyl Myristate|Myristyl Stearate|Isocetyl Stearate|Isocetyl Palmitate|Isostearyl Isostearate|Isostearyl Palmitate|Butyl Stearate|Butyl Oleate|Butyl Palmitate|C12-15 Alkyl Benzoate and Glyceryl Stearate|Glyceryl Stearate|Glyceryl Stearate SE|Glyceryl Oleate|Glyceryl Palmitate|Glyceryl Myristate|Glyceryl Laurate|Glyceryl Behenate|Glyceryl Ricinoleate|Glyceryl Isostearate|Glyceryl Dioleate|Glyceryl Distearate|Glyceryl Triacetyl Ricinoleate|Glyceryl Trioleate|Glyceryl Tristearate|Glyceryl Tripalmitate|Glyceryl Triisostearate|Glycol Stearate|Glycol Distearate|Ethylene Glycol Distearate|Glycol Oleate|Glycol Dioleate|Propylene Glycol Stearate|Propylene Glycol Isostearate|Propylene Glycol Laurate|PEG-7 Glyceryl Cocoate|PEG-40 Hydrogenated Castor Oil|PEG-60 Hydrogenated Castor Oil|PEG-100 Stearate|PEG-150 Distearate|PEG-120 Methyl Glucose Dioleate|PEG-20 Glyceryl Triisostearate|PEG-8 Beeswax|PEG-30 Dipolyhydroxystearate|PEG-6 Isostearate|PEG-8 Stearate|PEG-40 Stearate|PEG-20 Stearate|PEG-10 Oleate|Polyglyceryl-3 Methylglucose Distearate|Polyglyceryl-2 Dipolyhydroxystearate|Polyglyceryl-4 Oleate|Polyglyceryl-10 Oleate|Polyglyceryl-3 Stearate|Polyglyceryl-10 Stearate|Polyglyceryl-6 Distearate|Polyglyceryl-3 Diisostearate|Sorbitan Oleate|Sorbitan Stearate|Sorbitan Palmitate|Sorbitan Laurate|Sorbitan Isostearate|Sorbitan Sesquioleate|Sorbitan Trioleate|Sorbitan Tristearate|Sorbitan Olivate|Sorbitan Cocoate|Polysorbate 20|Polysorbate 40|Polysorbate 60|Polysorbate 65|Polysorbate 80|Polysorbate 81|Polysorbate 85|Tween 20|Tween 40|Tween 60|Tween 80|Cetearyl Olivate|Cetyl Olivate|Ethyl Olivate|Ethylhexyl Olivate|Hydrogenated Olive Oil Decyl Esters|Olive Oil PEG-7 Esters|Coco-Caprylate/Caprate and Glyceryl Stearate|Sucrose Stearate|Sucrose Laurate|Sucrose Palmitate|Sucrose Oleate|Methyl Glucose Sesquistearate|Methyl Glucose Dioleate|Pentaerythrityl Tetraisostearate|Pentaerythrityl Tetrastearate|Trimethylolpropane Triisostearate|Triisostearin|Triolein|Tristearin|Tripalmitin|Monostearin|Dioleyl Phosphate|Steareth-2 Stearate|Sorbitan Sesquistearate`, 'ester');

  add('Lecithin|Hydrogenated Lecithin|Phospholipids|Hydrogenated Phosphatidylcholine|Phosphatidylcholine|Glycolipids|Sphingolipids', 'phospholipid');
  add('Galactomyces|Galactomyces Ferment Filtrate|Galactomyces Ferment Extract|Galactomyces Filtrate Ferment', 'galactomyces');
  add('Sodium Palmitate|Potassium Palmitate|Sodium Stearate|Potassium Stearate|Sodium Oleate|Potassium Oleate|Sodium Laurate|Potassium Laurate|Sodium Myristate|Potassium Myristate|Zinc Stearate|Magnesium Stearate|Sodium Lauroyl Sarcosinate|Sodium Cocoyl Isethionate|Sodium Lauroyl Methyl Isethionate|Sodium Methyl Cocoyl Taurate|Sodium Methyl Lauroyl Taurate|Sodium Cocoyl Glutamate|Disodium Cocoyl Glutamate|Sodium Lauroyl Glutamate|Sodium Lauroyl Lactylate|Sodium Stearoyl Glutamate|Sodium Stearoyl Lactylate|Sodium Lauroyl Oat Amino Acids|Sodium C14-16 Olefin Sulfonate|Sodium Cocoamphoacetate|Sodium Cocoate|Potassium Cocoate|Sodium Palm Kernelate|Zinc Ricinoleate|Aluminum Dimyristate|Potassium Isostearate|Sodium Isostearate|Zinc Isostearate', 'salt');

  // Independently checked against Sezia's publicly printed Unverified examples
  // (2026-11-01). Low-confidence matches only: NOT clinically proven triggers.
  // Explicit names avoid interpreting a fatty-acid *salt* as a fatty-acid *ester*.
  add(`Sodium Lauryl Isethionate|Potassium Taurate|Sodium Caproyl Methyltaurate|Sodium Methyltaurate|Sodium Methyltaurate Isopalmitamide|Sodium Methyltaurine Cocoyl Methyltaurate|Sodium N-Isostearoyl Methyltaurate|Sodium Taurate|Sodium Taurine Cocoyl Methyltaurate|PEG-6 Cocamide|PEG-4 Rapeseedamide|PPG-2 Hydroxyethyl Coco/Isostearamide|Cetyl-PG Hydroxyethyl Palmitamide|Ammonium Coco Monoglyceride Sulfate|Ammonium Cocomonoglyceride Sulfate|Arginine Cocoate|Disodium Cocoamphodiacetate|Lysine Cocoate|Magnesium Cocoate|Potassium Boababate|Potassium Castorate|Potassium Hydrogenated Cocoate|Potassium Oliviate|Sodium Coco Monoglyceride Sulfate|Sodium Cocomonoglyceride Sulfate|Sodium Cocomonoglyceride Sulfonate|Sodium Hydrogenated Cocoate|Sodium Palm Glyceride Sulfonate|Sodium PEG-7 Olive Oil Carboxylate|Sodium PEG-8 Palm Glycerides Carboxylate`, 'salt');
  // Sezia prints the nonstandard spelling 'Dihomo-Y-linolenic Acid'; INCI
  // usually uses the chemically meaningful 'Dihomo-Gamma-Linolenic Acid'.
  add('Dihomo-Y-Linolenic Acid', 'fatty', {reason:'This alias is used for a C20 long-chain fatty acid; standardized ingredient names may differ. Precaution only.'});

  // Evidence-reviewed exact entries; do not infer from substrings or suffixes.
  add('Squalene', 'mechanistic');
  // Exact exceptions backed by a strain-specific in-vitro result; do not infer
  // effects for other fatty alcohols, hydrocarbons, or ingredient families.
  add('Cetearyl Alcohol', 'cetearylGrowth');
  // The source text and supplement conflict. Limit the low-confidence rule to
  // the exact tested liquid-paraffin labels; do not include petrolatum/Paraffin.
  add('Mineral Oil|Paraffinum Liquidum', 'mineralOilUncertain');
  add('C10-30 Cholesterol/Lanosterol Esters', 'ester', {
    reason:'An ester blend of cholesterol/lanosterol with C10-C30 fatty acids. The chain distribution and Malassezia availability of this specific ingredient are not established. This is a cautious 2/3 ester-category flag, not a proven dermatitis trigger.',
    basis:'Ester blend / uncertain composition',
    source:'https://kcia.or.kr/cid/search/ingd_view.php?no=3088'
  });
  add('Hydrolyzed Jojoba Esters', 'ester', {
    reason:'Hydrolyzed jojoba esters are a hydrolysate/mixture of long-chain lipid components. Their composition and availability to Malassezia are not established. This is a cautious 2/3 ester-category flag, not evidence that the ingredient worsens seborrheic dermatitis.',
    basis:'Uncertain hydrolysate / ester precaution',
    source:'https://www.cir-safety.org/sites/default/files/115_buff3f_suppl.pdf'
  });

  // Additional lipid/glyceride blends found in real INCI lists. Their precise
  // long-chain fraction cannot be inferred from the name alone.
  add('Hydrogenated Palm Glycerides Citrate|Hydrogenated Palm Glycerides|Hydrogenated Soy Glycerides|C12-18 Triglycerides|C10-18 Triglycerides|Coco-Glycerides|Olive Glycerides|Vegetable Glycerides', 'glycerides');
  add('Milk Lipids|Caprae Lac|Goat Milk|Milk', 'lipid', {reason:'Milk or milk fat may contain long-chain lipids; the actual fat content varies by ingredient and formulation.', basis:'Conservative precaution / variable composition'});

  // Do not infer feeding from the fact an INCI contains "oil", "glyceryl", "alcohol" etc.
  // Explicit whitelist prevents common false positives in the generic fallback.
  const NEUTRAL = new Set(`Aqua|Water|Glycerin|Glycerol|Butylene Glycol|Pentylene Glycol|Propanediol|Squalane|PEG-7 Caprylic/Capric Glycerides|Petrolatum|Paraffin|Ozokerite|Microcrystalline Wax|Synthetic Wax|Hydrogenated Polyisobutene|Coconut Alkanes|Isostearyl Neopentanoate|Diisostearyl Malate|Diethylhexyl Malate|Caprylic/Capric Triglyceride|Capric/Caprylic Triglyceride|Medium Chain Triglycerides|MCT Oil|Caprylic Acid|Capric Acid|Glyceryl Caprylate|Glyceryl Caprate|Coco-Caprylate|Coco-Caprylate/Caprate|Ethylhexylglycerin|Caprylyl Glycol|Cetyl Alcohol|Stearyl Alcohol|Behenyl Alcohol|Myristyl Alcohol|Arachidyl Alcohol|Dimethicone|Amodimethicone|Cyclopentasiloxane|PEG-12 Dimethicone|PEG-8 Dimethicone|PEG-40 Dimethicone|Niacinamide|Panthenol|Allantoin|Urea|Sodium Hyaluronate|Hyaluronic Acid|Ceramide NP|Ceramide AP|Ceramide EOP|Ceramide NS|Cholesterol|Sodium PCA|Betaine|Piroctone Olamine|Ketoconazole|Ciclopirox Olamine|Ciclopirox|Selenium Sulfide|Salicylic Acid|Citric Acid|Lactic Acid|Sodium Laureth Sulfate|Disodium Laureth Sulfosuccinate|Coco-Glucoside|Decyl Glucoside|Lauryl Glucoside|Phenoxyethanol|Sodium Benzoate|Potassium Sorbate|Disodium EDTA|Sodium Chloride|Zinc PCA|Zinc Pyrithione|Titanium Dioxide|Ethylhexyl Methoxycinnamate|Ethylhexyl Salicylate|Homosalate|Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine|C12-15 Alkyl Benzoate|Acrylates/C10-30 Alkyl Acrylate Crosspolymer|Carbomer|Hydroxyethylcellulose|Polyquaternium-10|Ceteareth-20|Steareth-20|Poloxamer 184|Glyceryl Glucoside`.split('|').map(normalize));

  function item(value) {
    if (!value) return '';
    return String(value)
      .replace(/^\s*(?:ingredients|inci|inhaltsstoffe|zusammensetzung)\s*[:：]\s*/i, '')
      .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '')
      .trim();
  }

  function parseIngredients(raw) {
    if (!raw || typeof raw !== 'string') return [];
    const cleaned = raw
      .replace(/^\s*(?:ingredients|inci|inhaltsstoffe|zusammensetzung)\b[^:;\n]{0,80}:\s*/i, '')
      .replace(/\s+\|\s+/g, ',') // some retailers display pipe separators
      .replace(/([A-Za-z])\|(?=[A-Za-z0-9])/g, '$1-'); // retailer text extraction may turn hyphens into pipes
    const chunks = [];
    const text = cleaned.replace(/\r\n?/g, '\n');
    let start = 0;
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '\n') {
        chunks.push(text.slice(start, i));
        start = i + 1;
        depth = 0; // Physical line breaks remain ingredient separators, even in unclosed parentheses.
        continue;
      }
      if (ch === '(') { depth++; continue; }
      if (ch === ')') { depth = Math.max(0, depth - 1); continue; }
      if (depth > 0) continue;
      if (ch === ',' && /\d/.test(text[i - 1] || '') && /\d/.test(text[i + 1] || '')) continue;
      if (ch === ',' || ch === ';' || ch === '•') {
        chunks.push(text.slice(start, i));
        start = i + 1;
      }
    }
    chunks.push(text.slice(start));
    const result = [];
    const seen = new Set();
    for (const part of chunks) {
      const value = item(part);
      const key = normalize(value);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(value);
    }
    return result;
  }

  const esterEnding = /(?:^|[\s/-])(?:[a-z0-9-]*(?:di|tri|sesqui|tetra)?(?:stearate|palmitate|oleate|linoleate|myristate|laurate|behenate|arachidate|isostearate|isopalmitate|olivate|cocoate|ricinoleate|hydroxystearate|erucate|dioleate|distearate|trioleate|tristearate|sesquistearate))$/i;
  const nonEsterPrefix = /^(?:sodium|potassium|magnesium|calcium|zinc|aluminum|aluminium|disodium|dipotassium|ammonium)\s/i;
  const acylTenside = /^(?:sodium|potassium|disodium|magnesium|calcium|ammonium)\s+(?:methyl\s+)?(?:cocoyl|lauroyl|palmitoyl|stearoyl|myristoyl|oleoyl)\b/i;
  const saltSuffix = /^(?:sodium|potassium|magnesium|calcium|zinc|aluminum|aluminium)\s+(?:stearate|palmitate|oleate|laurate|myristate|behenate|isostearate)$/i;
  // Exact raw-label aliases preserve punctuation and parenthetical text so one
  // confirmed composite label does not broaden every similarly normalized name.
  function rawAliasKey(value) {
    return String(value || '').normalize('NFKC').replace(/\u00a0/g, ' ').toLowerCase().replace(/\s+/g, ' ').trim();
  }
  const rawAliases = new Map();
  function addRawAlias(alias, reference) {
    const key = rawAliasKey(alias);
    if (!key || rawAliases.has(key)) throw new Error('Duplicate or empty raw ingredient alias: ' + alias);
    rawAliases.set(key, reference);
  }
  addRawAlias('Polysorbate-80', 'Polysorbate 80');
  addRawAlias(`Beeswax/Cera Alba/Cire d'abeille`, 'Beeswax');
  addRawAlias('Butyrospermum Parkii (Shea Butter)', 'Shea Butter');
  addRawAlias('Cera Microcristallina (Microcrystalline Wax,Cire Microcristalline)', 'Microcrystalline Wax');

  // Volatile aromatic/essential oils must NOT be flagged merely because their name contains "oil".
  // This tool does not assess nonspecific irritation or contact allergy.
  const volatileOilNames = new Set(`Mentha Piperita Oil|Mentha Arvensis Leaf Oil|Eucalyptus Globulus Leaf Oil|Lavandula Angustifolia Oil|Melaleuca Alternifolia Leaf Oil|Tea Tree Oil|Citrus Limon Peel Oil|Citrus Aurantium Dulcis Peel Oil|Citrus Bergamia Peel Oil|Rosmarinus Officinalis Leaf Oil|Thymus Vulgaris Oil|Cymbopogon Citratus Leaf Oil|Peppermint Oil|Lavender Oil|Eucalyptus Oil|Rosemary Oil|Lemon Peel Oil|Bergamot Oil|Essential Oil|Salvia Officinalis Oil|Sage Oil|Citrus Aurantium Bergamia Fruit Oil|Bergamot Fruit Oil|Citrus Aurantifolia Oil|Lime Oil|Lavandula Hybrida Oil|Lavendin Oil|Pogostemon Cablin Oil`.split('|').map(normalize));
  const volatileOilPattern = /(?:leaf|peel|flower|herb|bark|wood|needle|flower bud)\s+oil$|^(?:tea tree|peppermint|eucalyptus|lavender|rosemary|bergamot|thyme|lemon|lemongrass)\s+(?:essential\s+)?oil$|\bessential oil$/;

  function matchWhole(value) {
    const rawAlias = rawAliasKey(value);
    if (rawAliases.has(rawAlias)) {
      return {resolved:true, finding:matchWhole(rawAliases.get(rawAlias)).finding};
    }
    const key = normalize(value);
    if (!key) return {resolved:true, finding:null};
    if (exact.has(key)) return {resolved:true, finding:{...exact.get(key), match:'Exact list'}};
    if (NEUTRAL.has(key)) return {resolved:true, finding:null};
    // Only explicitly named volatile oils protect a complete slash label. The
    // broader name pattern is still useful for individual components, but it
    // must not hide a separate known ingredient elsewhere in the label.
    if (volatileOilNames.has(key)) return {resolved:true, finding:null};
    if (volatileOilPattern.test(key)) return {resolved:false, finding:null};
    if (/galactomyces/i.test(key)) return {resolved:false, finding:{...GROUP.galactomyces, group:'galactomyces', match:'Name pattern'}};
    if (/(?:^|\s)(?:ferment(?:s|ed|ation)?|ferment filtrate|ferment extract|yeast|faex|saccharomyces)(?:\b|\/)/i.test(key)) {
      if (/(?:\boil\b|\bbutter\b|\bwax\b|\bfat\b|\bolein\b|\bcera\b)/i.test(key)) {
        return {resolved:false, finding:{...GROUP.lipid, group:'lipid', rating:2, reason:'A fermented lipid-based ingredient. Its specific fatty acid composition is unknown; conservatively flagged for review.', basis:'Heuristic / precaution', match:'Name pattern'}};
      }
      return {resolved:false, finding:{...GROUP.ferment, group:'ferment', match:'Name pattern'}};
    }
    if (/^polysorbate\s*\d+$/i.test(key) || /^tween\s*\d+$/i.test(key)) return {resolved:false, finding:{...GROUP.ester, group:'ester', match:'Name pattern'}};
    if (acylTenside.test(key) || saltSuffix.test(key)) return {resolved:false, finding:{...GROUP.salt, group:'salt', match:'Name pattern'}};
    if ((/\b(?:seed|kernel|fruit|nut|bran|vegetable)\s+(?:oil|butter|wax)\b/.test(key) || /\b(?:oil|butter|wax)$/.test(key) || /^cera\b/.test(key)) && !/\b(?:mineral oil|essential oil|paraffin oil)\b/.test(key)) {
      return {resolved:false, finding:{...GROUP.oilunknown, group:'oilunknown', match:'Name pattern'}};
    }
    if (/\b(?:glycerides?|triglycerides?)$/.test(key)) return {resolved:false, finding:{...GROUP.glycerides, group:'glycerides', match:'Name pattern'}};
    if (!nonEsterPrefix.test(key) && esterEnding.test(key)) return {resolved:false, finding:{...GROUP.ester, group:'ester', match:'Name pattern'}};
    if (/\b(?:isopropyl|cetyl|stearyl|glyceryl|glycol|sorbitan|polyglyceryl|peg-\d+|ethylhexyl|octyldodecyl)\b/.test(key) && /\b(?:oleate|stearate|palmitate|myristate|laurate|behenate|isostearate|olivate|cocoate|ricinoleate)\b/.test(key)) return {resolved:false, finding:{...GROUP.ester, group:'ester', match:'Name pattern'}};
    return {resolved:false, finding:null};
  }

  function splitTopLevelSlash(value) {
    const text = String(value || '');
    const parts = [];
    let start = 0;
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '(') { depth++; continue; }
      if (ch === ')') { depth = Math.max(0, depth - 1); continue; }
      if (ch === '/' && depth === 0) {
        parts.push(text.slice(start, i).trim());
        start = i + 1;
      }
    }
    if (!parts.length) return null;
    parts.push(text.slice(start).trim());
    return parts.filter(Boolean);
  }

  function isSuppressed(finding, strict) {
    return !!finding && !strict && (finding.rating === 1 || finding.group === 'galactomyces' || finding.group === 'oilunknown');
  }

  function chooseCandidate(candidates) {
    return [...candidates].sort((a, b) =>
      b.finding.rating - a.finding.rating ||
      Number(b.exact) - Number(a.exact) ||
      Number(a.source !== 'whole') - Number(b.source !== 'whole') ||
      a.order - b.order
    )[0] || null;
  }

  function resolveForMode(value, strict) {
    const whole = matchWhole(value);
    if (whole.resolved) {
      return isSuppressed(whole.finding, strict)
        ? {finding:null, suppressed:whole.finding}
        : {finding:whole.finding, suppressed:null};
    }

    const components = splitTopLevelSlash(value);
    if (!components) {
      return isSuppressed(whole.finding, strict)
        ? {finding:null, suppressed:whole.finding}
        : {finding:whole.finding, suppressed:null};
    }

    const candidates = [];
    let order = 0;
    const addCandidate = (finding, source, label) => {
      if (!finding) return;
      const exactMatch = finding.match === 'Exact list';
      candidates.push({
        finding: source === 'component'
          ? {...finding, match:`Slash component "${label}" (${finding.match || 'Rule'})`}
          : finding,
        source,
        exact: exactMatch,
        order:order++
      });
    };

    addCandidate(whole.finding, 'whole');
    for (const component of components) {
      const result = matchWhole(component);
      addCandidate(result.finding, 'component', component);
    }

    const active = candidates.filter(candidate => !isSuppressed(candidate.finding, strict));
    if (active.length) return {finding:chooseCandidate(active).finding, suppressed:null};
    if (candidates.length) return {finding:null, suppressed:chooseCandidate(candidates).finding};
    return {finding:null, suppressed:null};
  }

  function matchOne(value) {
    return resolveForMode(value, true).finding;
  }

  function analyze(raw, options = {}) {
    const strict = options.strict !== false;
    const names = parseIngredients(raw);
    const analyzed = names.map(name => {
      const result = resolveForMode(name, strict);
      return {name, finding:result.finding, suppressed:result.suppressed};
    });
    const matches = analyzed.filter(x => !!x.finding);
    const counts = {high: matches.filter(x=>x.finding.rating===3).length, medium:matches.filter(x=>x.finding.rating===2).length, low:matches.filter(x=>x.finding.rating===1).length};
    const highest = counts.high ? 3 : counts.medium ? 2 : counts.low ? 1 : 0;
    return {ingredients:analyzed, matches, counts, highest, total:names.length, withoutMatch:names.length - matches.length, strict};
  }

  return {SOURCES, normalize, parseIngredients, matchOne, analyze, knownCount:exact.size + rawAliases.size, rawAliasCount:rawAliases.size};
});
