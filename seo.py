#!/usr/bin/env python3
"""เพิ่ม canonical / Open Graph / favicon / JSON-LD ให้ทุกหน้า (รันซ้ำได้) ใช้: python3 seo.py https://โดเมน"""
import sys,glob,re
D=(sys.argv[1] if len(sys.argv)>1 else "https://phasith.vercel.app").rstrip('/')
for f in glob.glob('*.html'):
    if f=='404.html': continue
    h=open(f,encoding='utf-8').read()
    h=re.sub(r'<!--seo-->.*?<!--/seo-->','',h,flags=re.S)
    t=re.search(r'<title>(.*?)</title>',h).group(1); d=(re.search(r'name="description" content="(.*?)"',h) or [0,''])[1]
    u=D+'/'+('' if f=='index.html' else f)
    ld='{"@context":"https://schema.org","@type":"WebPage","name":"%s","url":"%s","inLanguage":"th"}'%(t.replace('"',''),u)
    blk=f'<!--seo--><link rel="canonical" href="{u}"><link rel="icon" href="favicon.svg" type="image/svg+xml"><meta property="og:title" content="{t}"><meta property="og:description" content="{d}"><meta property="og:url" content="{u}"><meta property="og:locale" content="th_TH"><meta name="theme-color" content="#0b6b53"><script type="application/ld+json">{ld}</script><!--/seo-->'
    h=h.replace('</head>',blk+'</head>',1)
    open(f,'w',encoding='utf-8').write(h)
