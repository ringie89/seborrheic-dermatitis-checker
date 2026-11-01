#!/usr/bin/env python3
"""Generate reproducible SYNTHETIC complete INCI lists, not commercial product data.
These are manually labelled regression fixtures, not clinical truth or Sezia live outputs.
"""
import json,random
from pathlib import Path
rng=random.Random(20261101)
base=['Aqua','Glycerin','Pentylene Glycol','Panthenol','Niacinamide','Sodium Benzoate','Citric Acid','Allantoin','Sodium Chloride','Sodium Hyaluronate','Hydroxyethylcellulose','Xanthan Gum','Disodium EDTA','Betaine','Phenoxyethanol','Potassium Sorbate','Squalane','Dimethicone','Urea','Zinc PCA','Propylene Glycol Dicaprylate/Dicaprate','Ethylhexylglycerin','Cetearyl Alcohol','Stearyl Alcohol','Caprylic/Capric Triglyceride','Glyceryl Caprylate','Glyceryl Caprate','Coco-Glucoside','Coconut Alkanes','Petrolatum','Sodium Laureth Sulfate','Piroctone Olamine','Ketoconazole','Diethylhexyl Malate','Isostearyl Neopentanoate','C12-15 Alkyl Benzoate','Ceramide NP','Salicylic Acid','Butylene Glycol','Ceteareth-20','Parfum','Limonene','Sodium Lauryl Sulfate','Methylisothiazolinone','Alcohol Denat.','Cocamidopropyl Betaine','Tea Tree Oil']
category={
3:['Oleic Acid','Lauric Acid','Stearic Acid','Myristic Acid','Palmitic Acid','Cocos Nucifera Oil','Olea Europaea Fruit Oil','Butyrospermum Parkii Butter','Helianthus Annuus Seed Oil','Cera Alba','Galactomyces Ferment Filtrate','Ricinus Communis Seed Oil','Argania Spinosa Kernel Oil'],
2:['Glyceryl Stearate','Glyceryl Oleate','Glyceryl Stearate Citrate','Polysorbate 80','Sorbitan Olivate','Ethylhexyl Palmitate','PEG-40 Hydrogenated Castor Oil','Glycol Distearate','Isopropyl Myristate','Hydrogenated Palm Glycerides Citrate'],
1:['Lactobacillus Ferment Filtrate','Saccharomyces Ferment Lysate','Sodium Cocoamphoacetate','Sodium Lauroyl Sarcosinate','Sodium C14-16 Olefin Sulfonate','Sodium Methyl Cocoyl Taurate']}
# Neutral comparator deliberately includes confusing names that must NOT get incorrectly flagged.
# Propylene Glycol Dicaprylate/Dicaprate has no C11-C24 fatty acid tail.
records=[]
for i in range(100):
    bucket=i//25
    core=['Aqua','Glycerin'] + rng.sample([x for x in base if x not in ('Aqua','Glycerin')], rng.randrange(9,16))
    # Basic controls 1-25, high 26-50, medium 51-75, low 76-100.
    expected=[]
    if bucket:
        rated={1:3,2:2,3:1}[bucket]
        expected=rng.sample(category[rated], rng.choice([1,1,2]))
        for value in expected:core.insert(rng.randrange(2,len(core)),value)
    records.append({'id':f'SYN-{i+1:03d}', 'type':'synthetic', 'label':'Synthetic INCI challenge '+str(i+1), 'inci':', '.join(core), 'expected':{n:{1:3,2:2,3:1}[bucket] for n in expected}, 'expected_max':{0:0,1:3,2:2,3:1}[bucket]})
path=Path(__file__).with_name('synthetic_100.json')
path.write_text(json.dumps(records,indent=2,ensure_ascii=False)+'\n')
print('Generated',len(records),'controlled synthetic cases at',path)
