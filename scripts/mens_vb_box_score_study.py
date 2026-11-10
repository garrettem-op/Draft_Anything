#!/usr/bin/env python3
"""2025 men's volleyball score concentration study: 25 NCAA + 25 VNL matches.

Run: pip install requests beautifulsoup4
     python scripts/mens_vb_box_score_study.py

Only validated real match results are accepted. Refuse incomplete research.
Produces 100 team box scores, ~1000 player rows and reproducible quantiles.
"""
import csv,json,random,re,statistics,time
from pathlib import Path
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup
UA={'User-Agent':'Mozilla/5.0 (compatible; DraftAnythingResearch/1.0)'}
NCAA=[
 'https://longbeachstate.com/sports/mens-volleyball/schedule/2025',
 'https://pepperdinewaves.com/sports/mens-volleyball/schedule/2025'
]
VNL='https://voleinfo.com/matches/mens-volleyball-nations-league-2025-match-{}'
OUT=Path('data/research')
def txt(el):return re.sub(r'\s+',' ',el.get_text(' ',strip=True)).strip()
def get(url):
    last=None
    for attempt in range(3):
        try:
            r=requests.get(url,headers=UA,timeout=25);r.raise_for_status()
            if len(r.content)<3000:raise ValueError('page too short')
            return BeautifulSoup(r.text,'html.parser')
        except Exception as ex:
            last=ex;time.sleep(.5+attempt)
    raise ValueError(str(last))
def n(s):
    m=re.search(r'-?\d+(?:\.\d+)?',str(s))
    return float(m.group()) if m else None
def p(name,role,pts,k,ace,blk,attempts,ba=None):
    if not name or any(x is None for x in (pts,k,ace,blk,attempts)):return None
    x=dict(name=name,position=role,points=float(pts),kills=int(k),aces=int(ace),
        block_points=float(blk),attack_attempts=int(attempts))
    if ba is not None:x['block_assists']=int(ba)
    if min(x['points'],x['kills'],x['aces'],x['block_points'])<0:return None
    if abs(x['points']-x['kills']-x['aces']-x['block_points'])>.05:return None
    return x
def role(v):
    for k,r in [('libero','L'),('middle blocker','MB'),('outside hitter','OH'),
                ('opposite','OPP'),('setter','S')]:
        if k in v.lower():return r
    return 'unknown'
def vnl(soup,url):
    h=soup.find('h1')
    if not h or ' vs ' not in txt(h):raise ValueError('no match title')
    teams={}
    for table in soup.select('table'):
        header=txt(table.find('thead') or table)[:280].upper()
        if not all(x in header for x in ['PTS','ATK','BLK']):continue
        current=None
        for tr in table.select('tr'):
            cells=tr.find_all(['th','td'],recursive=False)
            match=re.match(r'^([A-Z]{3})\s+\d+\s+with recorded actions',txt(tr))
            if match:
                current=match.group(1);teams.setdefault(current,[])
                continue
            if not current or len(cells)<6:continue
            fields=list(map(txt,cells))
            if not re.fullmatch(r'\d+',fields[2]):continue
            attack=re.match(r'^(\d+)\s*/\s*(\d+)',fields[3])
            block=re.search(r'(\d+)\s*pts?',fields[5],re.I)
            if not attack or not block:continue
            points=int(fields[2]);kills,attempts=map(int,attack.groups());blocks=int(block.group(1))
            links=[a for a in cells[0].find_all('a') if '/players/' in a.get('href','')]
            name=txt(links[-1]) if links else fields[0]
            for ending in ['libero','middle blocker','outside hitter','opposite','setter']:
                name=re.sub(r'\s*'+ending+r'\s*$','',name,flags=re.I)
            rec=p(name,role(fields[0]),points,kills,points-kills-blocks,blocks,attempts)
            if rec:teams[current].append(rec)
        if len(teams)==2:break
    if len(teams)!=2:raise ValueError('two VNL player sections not found')
    m=re.search(r'([0-3])\s+SETS\s+([0-3])',txt(soup))
    if not m:raise ValueError('no sets score')
    sets=sum(map(int,m.groups()))
    return dict(id='vnl-'+url.rsplit('-',1)[-1],competition='VNL 2025',url=url,sets=sets,
                teams=[dict(team=k,players=v) for k,v in teams.items()])
def ncaa(soup,url):
    h=next((h for h in soup.find_all(['h2','h3','h1']) if re.search(r'\s+vs\.?\s+|-VS-',txt(h),re.I)),None)
    if not h:raise ValueError('NCAA matchup missing')
    teams=[]
    for table in soup.select('table'):
        head=txt(table.find('thead') or table)[:450].lower()
        if not all(k in head for k in ['attack','serve','block','pts']):continue
        players=[]
        for row in table.select('tr'):
            c=[txt(x) for x in row.find_all('td',recursive=False)]
            if len(c)<18:continue
            name=re.sub(r'^\d+\s+','',c[1])
            if not name or 'total' in name.lower() or name.upper() in ('TEAM','TM'):continue
            k,sa,bs,ba,pts,att=n(c[3]),n(c[9]),n(c[11]),n(c[12]),n(c[-1]),n(c[5])
            if any(x is None for x in [k,sa,bs,ba,pts,att]):continue
            item=p(name,'unknown',pts,k,sa,bs+ba/2,att,ba)
            if item:players.append(item)
        if len(players)<6:continue
        prev=table.find_previous(['h2','h3'])
        teams.append(dict(team=txt(prev)[:75] if prev else 'Unknown',players=players))
    if len(teams)!=2:raise ValueError('NCAA player tables: '+str(len(teams)))
    sets=0
    for table in soup.select('table')[:4]:
        headings=[txt(h) for h in table.select('th')]
        count=sum(bool(re.fullmatch('[1-5]',h)) for h in headings)
        if 3<=count<=5:sets=count;break
    if not sets:raise ValueError('NCAA set count not found')
    return dict(id='ncaa-'+url.rsplit('/',1)[-1],competition='NCAA 2025',url=url,sets=sets,teams=teams)
def validate(m):
    if m['sets'] not in (3,4,5) or len(m['teams'])!=2:raise ValueError('invalid sets/teams')
    for team in m['teams']:
        players=team['players'];total=sum(x['points'] for x in players)
        if len(players)<6 or not 18<=total<=145:raise ValueError('incomplete team '+team['team'])
        if len({x['name'] for x in players})!=len(players):raise ValueError('duplicate player')
        if max(x['points'] for x in players)<8:raise ValueError('top scorer too low')
    return m
def gini(values):
    v=sorted(values);n=len(v);total=sum(v)
    return (2*sum((i+1)*x for i,x in enumerate(v))/(n*total)-(n+1)/n) if total else 0
def quantiles(v):
    a=sorted(v)
    def q(p):
        j=(len(a)-1)*p;i=int(j)
        return round(a[i]+(a[min(i+1,len(a)-1)]-a[i])*(j-i),4)
    return {str(int(p*100)):q(p) for p in (0,.25,.5,.75,.9,1)}
def run():
    OUT.mkdir(parents=True,exist_ok=True)
    errors=[];matches=[];seen=set()
    rng=random.Random(20251110)
    # Two different NCAA programs avoid oversampling only one national finalist.
    for source,quota in zip(NCAA,[12,13]):
        session=get(source)
        urls=[]
        for anchor in session.select('a[href]'):
            if not re.search(r'box\s*score',txt(anchor),re.I):continue
            url=urljoin(source,anchor['href'])
            if '/stats/2025/' not in url or url in urls:continue
            # Exclude direct LBSU/Pepperdine meetings to avoid counting one match twice.
            if ('longbeachstate.com' in source and 'pepperdine' in url.lower()) or (
                'pepperdinewaves.com' in source and 'long-beach' in url.lower()):continue
            urls.append(url)
        rng.shuffle(urls)
        accepted=0
        for url in urls:
            if accepted>=quota:break
            try:
                m=validate(ncaa(get(url),url))
                if m['url'] not in seen:matches.append(m);seen.add(m['url']);accepted+=1
            except Exception as exc:errors.append(dict(url=url,error=str(exc)))
    ids=list(range(1,121));rng.shuffle(ids)
    for index in ids:
        if sum(x['competition']=='VNL 2025' for x in matches)>=25:break
        url=VNL.format(index)
        try:
            m=validate(vnl(get(url),url))
            if url not in seen:matches.append(m);seen.add(url)
        except Exception as exc:errors.append(dict(url=url,error=str(exc)))
    counts={competition:sum(x['competition']==competition for x in matches)
            for competition in ['NCAA 2025','VNL 2025']}
    (OUT/'mens-vb-audit-status.json').write_text(json.dumps(dict(valid=counts,errors=errors),indent=2)+'\n')
    if counts!={'NCAA 2025':25,'VNL 2025':25}:
        raise RuntimeError('50-match study incomplete: '+str(counts)+'; see audit status')
    (OUT/'mens-vb-2025-matches.json').write_text(json.dumps(matches,indent=2,ensure_ascii=False)+'\n')
    players=[];teams=[]
    for match in matches:
        for t in match['teams']:
            for x in t['players']:
                players.append(dict(match_id=match['id'],competition=match['competition'],
                     url=match['url'],sets=match['sets'],team=t['team'],**x))
            score=sorted((x['points'] for x in t['players']),reverse=True)
            total=sum(score)
            teams.append(dict(match_id=match['id'],competition=match['competition'],
                url=match['url'],sets=match['sets'],team=t['team'],total_player_points=total,
                top_scorer=score[0],top_share=round(score[0]/total,6),
                top_two_share=round(sum(score[:2])/total,6),gini=round(gini(score),6),
                scorers=sum(x>0 for x in score)))
    for filename,records in [('mens-vb-2025-players.csv',players),('mens-vb-2025-teams.csv',teams)]:
        with (OUT/filename).open('w',newline='') as f:
            writer=csv.DictWriter(f,fieldnames=list(dict.fromkeys(k for x in records for k in x)))
            writer.writeheader();writer.writerows(records)
    results=dict(matches=len(matches),teams=len(teams),players=len(players),
        quartiles={k:quantiles([x[k] for x in teams])
                   for k in ('top_share','top_two_share','gini','top_scorer','total_player_points')},
        balanced_rate=round(sum(x['top_share']<.25 for x in teams)/len(teams),4),
        dominant_rate=round(sum(x['top_share']>.35 for x in teams)/len(teams),4),
        sources={'NCAA':'Long Beach State official 2025 match box scores',
                 'VNL':'Volleyball World player stats mirrored by VoleInfo'})
    (OUT/'mens-vb-2025-results.json').write_text(json.dumps(results,indent=2)+'\n')
    print(json.dumps(results,indent=2))
if __name__=='__main__':run()
