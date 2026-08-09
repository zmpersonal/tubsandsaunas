#!/usr/bin/env python3
import os,json,urllib.parse,urllib.request
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'data'/'electricity_rates.json'
key=os.getenv('EIA_API_KEY','').strip()
if not key:
    print('EIA_API_KEY not configured; keeping local planning rates.'); raise SystemExit(0)
base='https://api.eia.gov/v2/electricity/retail-sales/data/'
params=[('api_key',key),('frequency','monthly'),('data[]','price'),('facets[sectorid][]','RES'),('sort[0][column]','period'),('sort[0][direction]','desc'),('offset','0'),('length','5000')]
url=base+'?'+urllib.parse.urlencode(params)
req=urllib.request.Request(url,headers={'User-Agent':'TubsAndSaunasDataBot/1.0'})
try:
    with urllib.request.urlopen(req,timeout=45) as r:data=json.load(r)
    rows=data.get('response',{}).get('data',[])
    states={}
    for row in rows:
        st=row.get('stateid') or row.get('state')
        if not st or len(st)!=2 or st in states: continue
        try: states[st]=round(float(row['price'])/100,4)
        except: pass
    if states:
        current=json.loads(OUT.read_text()) if OUT.exists() else {}
        current['updated_at']=datetime.now(timezone.utc).date().isoformat();current['states']={**current.get('states',{}),**states};current['source']='U.S. EIA residential retail-sales API; dollars/kWh converted from cents/kWh';OUT.write_text(json.dumps(current,indent=2)+'\n');print(f'Updated {len(states)} state rates')
    else: print('No state rates returned; keeping existing data.')
except Exception as e:
    print('EIA refresh failed; keeping existing data:',e)
