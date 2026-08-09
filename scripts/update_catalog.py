#!/usr/bin/env python3
import json, re, html, urllib.request, urllib.error
from pathlib import Path
from datetime import datetime, timezone
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'data'/'catalog.json'
COLLECTIONS=[('sauna','https://inhousewellness.com/collections/saunas/products.json?limit=250'),('cold-plunge','https://inhousewellness.com/collections/cold-plunge/products.json?limit=250')]
UA='Mozilla/5.0 (compatible; TubsAndSaunasDataBot/1.0; +https://tubsandsaunas.com/methodology/)'
def get_json(url):
    req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json'})
    with urllib.request.urlopen(req,timeout=30) as r:return json.load(r)
def num(v):
    try:return float(v)
    except:return None
def guess_brand(p):
    return p.get('vendor') or 'Unknown'
def capacity(text):
    m=re.search(r'\b(\d{1,2})\s*[- ]?person\b',text,re.I);return int(m.group(1)) if m else None
def voltage(text):
    vals=re.findall(r'\b(120|220|240)V\b',text,re.I)
    if '240' in vals or '220' in vals:return 240
    if '120' in vals:return 120
    return None
def setting(text):
    t=text.lower()
    if 'indoor/outdoor' in t or 'indoor & outdoor' in t:return 'both'
    if 'outdoor' in t:return 'outdoor'
    if 'indoor' in t:return 'indoor'
    return 'both'
def fit(cat,text):
    t=text.lower()
    if cat=='cold-plunge': return 'compact' if ('barrel' in t or 'inflatable' in t) else 'premium'
    c=capacity(text)
    if c and c<=2:return 'compact'
    if 'outdoor' in t:return 'backyard'
    return 'family'
def convert(cat,p):
    variants=p.get('variants') or []
    live=[v for v in variants if v.get('available',True)] or variants
    prices=[num(v.get('price')) for v in live if num(v.get('price')) is not None]
    price=min(prices) if prices else None
    body=html.unescape(re.sub('<[^>]+>',' ',p.get('body_html') or ''))
    text=(p.get('title','')+' '+body)
    handle=p.get('handle','')
    return {'category':cat,'name':p.get('title','').strip(),'brand':guess_brand(p),'price':price,'url':f'https://inhousewellness.com/products/{handle}','capacity':capacity(text),'indoor_outdoor':setting(text),'voltage':voltage(text),'fit':fit(cat,text)}
def main():
    old=json.loads(OUT.read_text()) if OUT.exists() else {'items':[]}
    items=[];errors=[]
    for cat,url in COLLECTIONS:
        try:
            data=get_json(url)
            products=data.get('products',[])
            items.extend(convert(cat,p) for p in products if p.get('title'))
        except Exception as e: errors.append(f'{cat}: {e}')
    if not items:
        print('No live products fetched; retaining starter catalog.')
        if errors: print('\n'.join(errors))
        return
    dedup={x['url']:x for x in items}
    payload={'updated_at':datetime.now(timezone.utc).date().isoformat(),'source':'InHouse Wellness public Shopify collection data','items':list(dedup.values())}
    OUT.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+'\n')
    print(f'Wrote {len(dedup)} products')
    if errors: print('Partial errors:',*errors,sep='\n- ')
if __name__=='__main__':main()
