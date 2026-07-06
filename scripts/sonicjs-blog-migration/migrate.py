import xml.etree.ElementTree as ET, re, json, html as htmllib, datetime, hashlib

SP="/tmp/claude-0/-home-user-norcal-squarespace-updates/4a21bb88-595d-55ba-b2c2-1c1bea1f1bbd/scratchpad"
REPO="/home/user/norcal-squarespace-updates"
posts={}  # slug -> post dict

def clean_slug(raw):
    s = raw.rstrip('/').split('/')[-1].strip().lower()
    return s

def excerpt_from_html(body, fallback=""):
    if fallback: return fallback[:490]
    txt = re.sub(r'<[^>]+>', ' ', body)
    txt = htmllib.unescape(txt)
    txt = re.sub(r'\s+', ' ', txt).strip()
    return (txt[:240] + "…") if len(txt) > 240 else txt

def add(slug, title, content, author, published_iso, excerpt="", tags="", category="", source=""):
    slug = clean_slug(slug)
    if not slug or not content.strip() or not title.strip(): return False
    if slug in posts: return False
    posts[slug] = dict(slug=slug, title=title.strip()[:200], content=content.strip(),
        author=(author or "NorCal CARB Mobile")[:100], publishedAt=published_iso,
        excerpt=excerpt_from_html(content, excerpt), tags=tags[:300], category=category[:100], source=source)
    return True

# ---------- 1. WXR ----------
ns={'wp':'http://wordpress.org/export/1.2/','content':'http://purl.org/rss/1.0/modules/content/',
    'excerpt':'http://wordpress.org/export/1.2/excerpt/','dc':'http://purl.org/dc/elements/1.1/'}
tree=ET.parse(f"{SP}/wxr.xml")
skipped=[]
for it in tree.getroot().findall(".//item"):
    if it.findtext("wp:post_type","",ns)!="post": continue
    if it.findtext("wp:status","",ns)!="publish": continue
    body=it.findtext("content:encoded","",ns) or ""
    title=(it.findtext("title") or "").strip()
    slug=it.findtext("wp:post_name","",ns) or ""
    if not body.strip():
        skipped.append(("empty-body", slug or title)); continue
    date=it.findtext("wp:post_date_gmt","",ns) or it.findtext("wp:post_date","",ns) or ""
    try: iso=datetime.datetime.strptime(date,"%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception: iso=""
    author=it.findtext("dc:creator","",ns) or "NorCal CARB Mobile"
    cats=[c.text or "" for c in it.findall("category") if c.get("domain")=="category"]
    tags=[c.text or "" for c in it.findall("category") if c.get("domain")=="post_tag"]
    exc=it.findtext("excerpt:encoded","",ns) or ""
    exc=re.sub(r'<[^>]+>',' ',exc).strip()
    if not add(slug,title,body,author,iso,exc,",".join(t for t in tags if t),(cats[0] if cats else ""),"wxr"):
        skipped.append(("dup-or-invalid",slug))

# ---------- 2. current site posts ----------
import glob
for f in glob.glob(f"{REPO}/site/blog/*.html"):
    if f.endswith("index.html"): continue
    h=open(f).read()
    slug=f.split("/")[-1][:-5]
    m=re.search(r'<h1>(.*?)</h1>',h,re.S); title=htmllib.unescape(m.group(1).strip()) if m else slug
    m=re.search(r'"datePublished":\s*"([^"]+)"',h); iso=(m.group(1)+"T00:00:00Z") if m else ""
    m=re.search(r'<meta name="description" content="([^"]*)"',h); exc=htmllib.unescape(m.group(1)) if m else ""
    secs=re.findall(r'<section[^>]*>(.*?)</section>',h,re.S)
    body=""
    for s in secs:
        if '<h2' in s and 'cta-band' not in s[:80]:
            m=re.search(r'<div[^>]*>(.*)</div>\s*$',s,re.S)
            body=(m.group(1) if m else s).strip(); break
    add(slug,title,body,"NorCal CARB Mobile",iso,exc,"","","site")

# ---------- 3. squarespace zip post ----------
h=open(f"{SP}/export/i-thought-it-was-ending.html", encoding="utf-8", errors="replace").read()
m=re.search(r'<title>(.*?)</title>',h,re.S); title=htmllib.unescape(m.group(1).strip()) if m else "I thought it was ending..."
mb=re.search(r'<div class="blog-item-content e-content"[^>]*>(.*?)</div>\s*</article>',h,re.S)
if not mb: mb=re.search(r'class="entry-content[^"]*"[^>]*>(.*?)</article>',h,re.S)
md=re.search(r'datetime="(\d{4}-\d{2}-\d{2})"',h)
if mb:
    add("i-thought-it-was-ending",title,mb.group(1),"NorCal CARB Mobile",(md.group(1)+"T00:00:00Z") if md else "2026-06-01T00:00:00Z","","","","sqsp-zip")
else:
    skipped.append(("no-body-found","i-thought-it-was-ending"))

out=sorted(posts.values(), key=lambda p: p["publishedAt"])
json.dump(out, open(f"{SP}/manifest.json","w"), indent=1)
print("total posts:", len(out))
print("skipped:", skipped)
for p in out: print(p["publishedAt"][:10], f'{len(p["content"]):6d}b', p["slug"][:70])
