"""Orbit dashboard demo markup (animated by assets/orbit-demo.js). Mirrors the Operations-style app UI at 1240x720."""
from html import escape as esc

NAV=['Overview','Campaigns','Calendar','Audience','Content','Reports']
KPIS=[('Active campaigns','48','','+6 this week'),('Posts scheduled','23','','Across 4 channels'),('Avg. brief to launch','6.2',' days','Down from 11 days'),('Revenue influenced','84260','$','Auto-reported weekly')]
COLS=[('Brief',[('Velora Launch','CMP-2291',12),('Auren Spring','CMP-2290',8)]),
      ('Creative',[('Ink Void Drop','CMP-2284',34)]),
      ('Live',[('Northline Care','CMP-2279',68),('Atelier Autumn','CMP-2271',81)]),
      ('Results',[('Off Hours Tee','CMP-2266',100)])]
BARS=[38,52,44,61,58,72,66,80,74,88,84,100]

def job(name,ref,pct,hot=False):
    return ('<div class="oj%s"><span>%s</span><div class="ob"><i style="width:%d%%"></i></div><div class="om"><span>%s</span><span class="op">%d %%</span></div></div>'
            %(' hot' if hot else '',esc(name),pct,ref,pct))

def orbit_ui(interactive=False):
    nav=''.join('<div class="uon%s" data-v="%d"><span class="uoi"></span>%s</div>'%(' is-active' if i==0 else '',i,esc(n)) for i,n in enumerate(NAV))
    kp=''
    for lab,val,suf,dl in KPIS:
        pre='$' if suf=='$' else ''
        sfx=suf if suf not in('$','') else ''
        kp+=('<div class="oc2"><div class="ol">%s</div><div class="obig" data-to="%s" data-pre="%s" data-suf="%s"><span>0</span></div><div class="uod">%s</div></div>'%(esc(lab),val,pre,sfx,esc(dl)))
    cols=''
    for i,(h,js) in enumerate(COLS):
        items=''
        if i==0:items+=job('Kong Tattoo Care','CMP-2294',10,True)
        items+=''.join(job(*j) for j in js)
        cols+='<div class="uoc" data-c="%d"><div class="och"><span>%s</span><span class="cnt">%d</span></div>%s</div>'%(i,esc(h),len(js)+(1 if i==0 else 0),items)
    bars=''.join('<i style="--h:%d%%"></i>'%h for h in BARS)
    return ('<div class="ou%s" data-orbit><div class="ou-in"><div class="ui">'%(' ou-int' if interactive else '')+
        '<aside class="us"><div class="ulogo"><img src="assets/favicon-48.png" alt="" width="24" height="24">Orbit</div>'+nav+'<div class="uteam"><span class="uav">PR</span>Your team</div></aside>'
        '<div class="um"><div class="ut"><div><div class="uh">Overview</div><div class="usub">Every campaign, in one place</div></div><div class="urow"><div class="usearch">&#8981; Search campaigns, clients, reports</div><span class="upill">+ New campaign</span></div></div>'
        '<div class="ukp">'+kp+'</div>'
        '<div class="ulow"><div class="ucols">'+cols+'</div><div class="oc2 uch"><div class="ol">Leads generated · last 12 weeks</div><div class="obig" data-to="312"><span>0</span></div><div class="ubars">'+bars+'</div></div></div></div>'
        '</div></div></div>')
