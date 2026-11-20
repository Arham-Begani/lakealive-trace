from pathlib import Path
import math, json, re, shutil, sys
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from xml.sax.saxutils import escape
from PIL import Image, ImageOps, ImageDraw
import fitz
from content import SEGMENTS,SHOTS,RULES,PLATFORM,EVENT,EPA
P=Path(__file__).resolve().parent
# Preserve the app component; simplify only unsupported decorative SVG effects.
svg=(P/'assets/prototype-map.svg').read_text()
svg=svg.replace('<rect width="800" height="560" fill="url(#grid)"/>','').replace('fill="url(#lake)"','fill="#b8d8cd"').replace(' filter="url(#pin-shadow)"','')
(P/'assets/prototype-map-for-deck.svg').write_text(svg)
mapdoc=fitz.open(P/'assets/prototype-map-for-deck.svg')
mapdoc[0].get_pixmap(matrix=fitz.Matrix(2,2)).save(str(P/'assets/prototype-map.png'))
for name,path in [('Sans','open-sans/OpenSans-Regular.ttf'),('Bold','open-sans/OpenSans-Semibold.ttf'),('Italic','open-sans/OpenSans-Italic.ttf'),('Serif','dejavu/DejaVuSerif.ttf')]:
    pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/'+path))
C={'paper':'#f7f6f0','ink':'#193f35','muted':'#617366','line':'#d5dbcf','light':'#e8eee1','water':'#b8d8cd','accent':'#ad512f','white':'#ffffff'}
W,H=960,540
issues=[]
def col(n):return HexColor(C.get(n,n))
def rect(x,y,w,h,fill='paper',stroke=None,r=0):
    c.setFillColor(col(fill));c.setStrokeColor(col(stroke or fill))
    if r:c.roundRect(x,H-y-h,w,h,r,fill=1,stroke=bool(stroke))
    else:c.rect(x,H-y-h,w,h,fill=1,stroke=bool(stroke))
def line(x1,y1,x2,y2,color='line',width=1):
    c.setStrokeColor(col(color));c.setLineWidth(width);c.line(x1,H-y1,x2,H-y2)
def txt(text,x,y,size=18,font='Sans',color='ink'):
    c.setFillColor(col(color));c.setFont(font,size);c.drawString(x,H-y-size,text)
    width=pdfmetrics.stringWidth(text,font,size)
    if x+width>W-20:issues.append(('text overflow',text,x+width))
def para(text,x,y,w,size=18,font='Sans',color='ink',leading=None,maxh=None):
    st=ParagraphStyle('p',fontName=font,fontSize=size,leading=leading or size*1.43,textColor=col(color),spaceAfter=0)
    p=Paragraph(text,st);pw,ph=p.wrap(w,H)
    if maxh is not None and ph>maxh:issues.append(('paragraph overflow',text,ph,maxh))
    if y+ph>H-25:issues.append(('page overflow',text,y+ph))
    p.drawOn(c,x,H-y-ph);return ph

def footer(n,label='Synthetic prototype. Not field validated.'):
    line(48,H-40,W-48,H-40)
    txt('trace.',48,H-29,10,'Bold');txt(label,103,H-29,9,'Sans','muted');txt(f'{n:02d}',W-65,H-29,10,'Sans','muted')
def page(n,title,sub=None):
    rect(0,0,W,H)
    para(title,48,40,860,34,'Serif',leading=41,maxh=86)
    if sub:para(sub,48,137,855,15,color='muted',maxh=42)
    footer(n)
def disc(x,y,r,fill='ink',text=None,size=18):
    c.setFillColor(col(fill));c.circle(x,H-y,r,fill=1,stroke=0)
    if text:
        c.setFillColor(col('white'));c.setFont('Bold',size)
        c.drawCentredString(x,H-y-size*.32,text)
def newpage():c.showPage()

c=canvas.Canvas(str(P/'Trace-pitch-deck.pdf'),pagesize=(W,H))
c.setTitle('Trace by LakeAlive | Xylem Water Quality');c.setAuthor('Arham Begani; prepared with AI assistance')
# 1
rect(0,0,W,H)
txt('trace.',48,35,58,'Serif')
txt('BY LAKEALIVE',54,111,11,'Bold','muted')
para('Every sample should answer a better question.',48,164,410,36,'Serif',leading=45)
para('Inspectable next-sample planning for a limited water-monitoring budget.',50,327,390,18,leading=27)
txt('Arham Begani',50,420,18,'Bold')
txt('Solo / High School / Water Quality',50,449,13,color='muted')
c.drawImage(str(P/'assets/prototype-map.png'),470,H-77-315,width=450,height=315,mask='auto')
para('Prototype map component. Decorative effects simplified.<br/>Fictional network. Schematic, not geographic data.',484,411,420,11,color='muted')
footer(1);newpage()
#2
page(2,'A downstream signal leaves an upstream decision.','Intended user: a community monitoring coordinator with limited sampling capacity.')
para('Which observation could change the explanation?',48,218,360,29,'Serif',leading=37)
para('Access may be uncertain. Readings may be coarse. An early conclusion can outlive the evidence that supported it.',48,344,350,17,color='muted',maxh=110)
line(444,205,444,453)
txt('4',493,203,92,'Serif');para('illustrative test credits<br/>in the demo',585,239,300,20,'Bold')
line(493,333,907,333)
para('Trace connects the next sampling choice to the alternatives it can distinguish.',493,360,410,22,leading=31)
newpage()
#3
page(3,'The case changes with each reading.','One reproducible example from the current model: A signal upstream.')
xs=[49,273,497,721]
data=[('Starting evidence','7','0 credits spent','Reference + lake entry'),('West sample','3','1 credit spent','0.045-0.105 mg/L as P'),('North sample','2','2 credits spent','0.62-0.68 mg/L as P'),('East sample','1','3 credits spent','0.045-0.105 mg/L as P')]
for i,(title,n,sp,bands) in enumerate(data):
    x=xs[i];txt(title,x,212,15,'Bold');txt(n,x,248,76,'Serif');txt('explanations fit',x,339,13,color='muted');txt(sp,x,371,13,'Bold');txt(bands,x,400,11,color='muted')
    if i<3:line(x+194,220,x+194,421)
para('The remaining explanation is North. Agreement with this finite model does not prove a source.',49,449,855,14,'Bold')
newpage()
#4
page(4,'Every recommendation has an inspectable reason.','Eight branch combinations. Interval overlap. Explicit budget and access constraints.')
items=[('01','Retain compatible explanations','Each current, unflagged interval must overlap the explanation’s predicted band.'),('02','Compare feasible locations','Choose the smallest worst-case remaining set. Tie-break by cost, then site ID.'),('03','Reconsider after evidence changes','A new reading, correction or access change recomputes the next decision.')]
y=209
for n,t,b in items:
    disc(67,y+16,19,text=n,size=12);txt(t,104,y-2,18,'Bold');para(b,104,y+26,480,14,color='muted',leading=20,maxh=45);y+=86
line(636,204,636,465)
para('The planner never receives the hidden scenario answer.',677,217,230,24,'Serif',leading=31)
para('Separate simulator<br/>Local JavaScript<br/>No runtime API calls',677,367,230,14,leading=23)
newpage()
#5
page(5,'A useful system must be able to stop.','In the contradictory scenario, the final cross-check challenges the whole model.')
txt('0',47,204,123,'Serif','accent');para('compatible explanations<br/>after the East cross-check',159,254,295,20,'Bold',leading=29)
para('“The evidence does not fit.”',49,365,427,24,'Serif',leading=31)
para('Recheck timing, methods and assumptions. Do not attribute a source.',49,414,416,15,color='muted',maxh=55)
line(511,208,511,462)
para('Corrections remain visible',552,216,348,22,'Bold')
para('Revise or flag a reading. Pause advice while retaining the earlier version. Export the full case for review.',552,264,348,16,color='muted',maxh=95)
para('Important limit',552,369,348,16,'Bold','accent')
para('An unmodeled cause can mimic a listed branch. Trace cannot detect every wrong model.',552,399,348,15,leading=22,maxh=64)
newpage()
#6
page(6,'The evidence is synthetic and reproducible.','72 equally weighted cases per policy. 29 automated tests pass in the documented app snapshot.')
cols=[48,242,426,590,746];widths=[194,184,164,156,166]
headers=['Policy','Compatible\nsingletons','Checks still\npending*','Unresolved\ncases','Mean test\ncredits']
for x,w,t in zip(cols,widths,headers):para(t.replace('\n','<br/>'),x+10,205,w-17,13,'Bold',leading=18)
line(48,251,912,251,'ink',1)
rows=[['Trace','29','3','43','1.736'],['Fixed A-B-C-J','29','3','43','2.014'],['Exact random','22.5','3.5','49.5','2.155']]
for j,row in enumerate(rows):
    y=268+j*48
    if j==0:rect(48,y-5,864,43,'light')
    for x,value in zip(cols,row):txt(value,x+10,y,16,'Bold' if j==0 else 'Sans')
    line(48,y+38,912,y+38)
para('*Pending checks are included in the singleton column. Random values are weighted expectations.',48,423,860,10.5,color='muted',leading=15)
para('Means include unresolved cases and early stops. Same-model fixtures do not show field accuracy or real cost savings.',48,451,860,12,'Bold',leading=18)
newpage()
#7
page(7,'A credible pilot starts with a validated model.','Intended benefit: a coordinator can explain the next test and hand over an understandable case.')
phase=[(48,'1','Co-design the protocol','Work with monitoring specialists on comparable measurements, real access and actual costs.'),(353,'2','Validate under control','Test known outcomes, changing conditions and causes outside the hypothesis set.'),(658,'3','Study the decisions','Measure whether users recognize uncertainty, explain recommendations and recover from corrections.')]
for x,n,t,b in phase:
    disc(x+20,227,20,'ink',n,15);para(t,x,275,245,23,'Serif',leading=30,maxh=65);para(b,x,354,245,15,color='muted',leading=22,maxh=100)
para('Proposed work. No recruited pilot partner, user study or environmental outcome is claimed.',48,459,860,12,'Bold')
newpage()
#8
page(8,'Arham Begani','Solo participant. High School track. Challenge: Water Quality.')
para('Working prototype',48,210,372,21,'Bold')
para('HTML, CSS, JavaScript and SVG.<br/>One offline file. No API key.<br/>Node.js build and automated tests.',48,253,372,16,leading=25)
para('Testing boundary',48,358,372,18,'Bold')
para('Chromium flow and narrow layouts checked. Native backup restore, physical touch and other browser engines remain unverified.',48,395,372,14,leading=21,maxh=75)
line(455,207,455,467)
para('Assistance and provenance',497,210,410,21,'Bold')
para('ChatGPT/Codex assisted ideation, implementation, testing, interface design and these submission materials. Trace was implemented in a separate repository. Agent review is not independent scientific validation.',497,253,410,14,leading=21,maxh=122)
para('Context: adaptive sampling is established practice. The prototype uses fictional bands and does not model transport or dilution.',497,373,410,13,color='muted',leading=19,maxh=59)
for label,url,x in [('EPA: data considerations',EPA,497),('Event requirements',RULES,718)]:
    txt(label,x,449,11,'Bold');c.linkURL(url,(x,H-466,x+190,H-445),relative=0,thickness=0)
c.save()
# Recording guide: readable A4 pages, local only.
W,H=595.276,841.89
c=canvas.Canvas(str(P/'Trace-recording-guide.pdf'),pagesize=(W,H));c.setTitle('Trace recording guide | 3 minutes 40 seconds');c.setAuthor('Prepared for Arham Begani with AI assistance')
def guideheader(n,title,subtitle):
    rect(0,0,W,H);txt('trace. / RECORDING GUIDE',44,31,11,'Bold','muted')
    para(title,44,67,W-88,27,'Serif',leading=34,maxh=72)
    para(subtitle,44,146,W-88,11,color='muted',leading=17,maxh=60)
    footer(n,'Local preparation. Video not yet recorded.')
for page_num,segments in enumerate([SEGMENTS[:4],SEGMENTS[4:]],1):
    guideheader(page_num,'English narration', 'Read only the paragraph text. Target 3:40 total. 458 words; rehearse at a natural pace. Timings include short pauses and screen transitions.')
    y=212
    for time,title,text in segments:
        txt(time+'  '+title,y= y,x=44,size=11,font='Bold',color='accent')
        height=para(escape(text),44,y+26,W-88,12.1,leading=18.3)
        y+=height+52
    if y>H-45:issues.append(('guide page too long',page_num,y))
    newpage()
for page_num,shots in enumerate([SHOTS[:4],SHOTS[4:]],3):
    guideheader(page_num,'Shot list and exact actions','Use the real Trace.html app. All demonstration data are synthetic. Record the interaction, then cut only dead time; never fabricate a result.')
    y=211
    for time,title,action in shots:
        txt(time+'  '+title,44,y,11,'Bold','accent')
        ht=para(escape(action),44,y+25,W-88,11.6,leading=17.4)
        y+=ht+51
    if page_num==4:
        line(44,y,W-44,y)
        para('<b>Before exporting:</b> close notifications, use readable browser zoom, keep simulation labels visible, check your audio, include team/track/challenge and assistance, and verify the final duration is 3:00-4:00. The pitch PDF is supporting material; the video should show actual interaction.',44,y+17,W-88,10.6,leading=15.8,maxh=88)
    if y>H-45:issues.append(('shot page too long',page_num,y))
    newpage()
c.save()
shutil.copyfile(P.parent.parent/'dist/index.html',P/'Trace.html')
# Render every PDF page for visual review. Static document rendering, not browser QA.
for stem in ['Trace-pitch-deck','Trace-recording-guide']:
    doc=fitz.open(P/(stem+'.pdf'))
    tiles=[]
    for i,page in enumerate(doc):
        page.get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save(str(P/'qa'/f'{stem}-{i+1:02d}.png'))
        image=Image.open(P/'qa'/f'{stem}-{i+1:02d}.png').convert('RGB')
        image.thumbnail((760,620))
        tile=Image.new('RGB',(780,650),'#d4d9d1');tile.paste(image,((780-image.width)//2,14));
        ImageDraw.Draw(tile).text((18,630),f'{stem} / {i+1}',fill='#183f35');tiles.append(tile)
    columns=2;rows=math.ceil(len(tiles)/columns)
    contact=Image.new('RGB',(columns*780,rows*650),'white')
    for i,t in enumerate(tiles):contact.paste(t,((i%columns)*780,(i//columns)*650))
    contact.save(P/'qa'/f'{stem}-contact.jpg',quality=90)
    text='\n'.join(page.get_text() for page in doc)
    (P/'qa'/f'{stem}-extracted.txt').write_text(text)
    print(stem, len(doc),'pages',len(text),'text characters')
(P/'qa/layout-check.json').write_text(json.dumps({'overflowChecks':issues},indent=2))
if issues:
    print('LAYOUT ISSUES:',issues);sys.exit(1)
print('Local layout checks passed.')
