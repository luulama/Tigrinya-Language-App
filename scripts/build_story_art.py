"""Original, local SVG picture-book scenes. No downloaded assets or fonts."""
from pathlib import Path
import json
import html
import math

root = Path(__file__).resolve().parents[1]
out = root / 'stories/assets'
out.mkdir(parents=True, exist_ok=True)

def g(x, y, scale, body, rotate=0):
    return f'<g transform="translate({x} {y}) rotate({rotate}) scale({scale})">{body}</g>'

def stars():
    return ''.join(f'<path d="M{x-4} {y}h8m-4-4v8" stroke="#fff0c6" stroke-width="2" opacity=".7"/>' for x,y in [(97,91),(203,160),(331,72),(477,130),(606,65),(834,137),(885,71)])

def moon(x=760,y=130,r=66):
    return f'<circle cx="{x}" cy="{y}" r="{r*1.5}" fill="#fff0c6" opacity=".05"/><circle cx="{x}" cy="{y}" r="{r}" fill="url(#moon)"/><circle cx="{x-18}" cy="{y-15}" r="8" fill="#d7bc8c" opacity=".2"/><circle cx="{x+17}" cy="{y+22}" r="12" fill="#d7bc8c" opacity=".16"/>'

def hills(a='#3f6574',b='#244954'):
    return f'<path d="M0 365Q180 215 390 350T960 300V640H0Z" fill="{a}"/><path d="M0 475Q215 333 470 458T960 397V640H0Z" fill="{b}"/>'

def ground(color='#36574f'):
    return f'<path d="M0 560Q220 475 480 540T960 510V640H0Z" fill="{color}"/>'

def sprigs(x,y,s=1,color='#a5c4a0'):
    return g(x,y,s,f'<path d="M0 80Q-14 31 8 0M-1 62Q-32 49-33 30M0 40Q33 29 35 10" fill="none" stroke="{color}" stroke-width="6" stroke-linecap="round"/><ellipse cx="-22" cy="43" rx="18" ry="8" transform="rotate(38 -22 43)" fill="{color}"/><ellipse cx="22" cy="25" rx="20" ry="8" transform="rotate(-35 22 25)" fill="{color}"/>')

def tree(x,y,s=1,color='#6a9a83'):
    return g(x,y,s,f'<path d="M-24 240Q-6 80-37-20L5-41Q14 88 40 240Z" fill="#976d59"/><path d="M1 94L-91 9M11 65L92-32" fill="none" stroke="#976d59" stroke-width="20" stroke-linecap="round"/><path d="M-8 201L5 148M-14 110L-4 95" stroke="#b58c70" stroke-width="6" stroke-linecap="round"/>'+''.join(f'<ellipse cx="{a}" cy="{b}" rx="{rx}" ry="{ry}" fill="{color}"/>' for a,b,rx,ry in [(-80,-38,83,65),(65,-61,91,66),(-14,-104,89,68),(8,-21,117,65)])+'<path d="M-126-42Q-63-112-7-124M32-119Q105-108 126-68" fill="none" stroke="#d5e7a3" stroke-width="8" stroke-linecap="round" opacity=".35"/>')

def flower(x,y,s=1,color='#f2d487'):
    return g(x,y,s,'<path d="M0 0Q-12 40 0 76" stroke="#80a88a" stroke-width="7" fill="none"/><ellipse cx="17" cy="47" rx="21" ry="9" transform="rotate(-30 17 47)" fill="#80a88a"/>'+''.join(f'<ellipse cx="0" cy="-17" rx="12" ry="20" transform="rotate({a})" fill="{color}"/>' for a in range(0,360,60))+'<circle r="12" fill="#ce9359"/>')

def child(x,y,s=1,coat='#d98472',skin='#a96e50',pose='rest',adult=False):
    arms = '<path d="M-31 6Q-64 29-57 57M33 6Q58 28 61 49" fill="none" stroke="'+skin+'" stroke-width="18" stroke-linecap="round"/>'
    if pose == 'up': arms = f'<path d="M-30 9Q-56-17-60-48M33 8Q64-13 67-41" fill="none" stroke="{skin}" stroke-width="18" stroke-linecap="round"/>'
    if pose == 'hold': arms = f'<path d="M-31 5Q-62 29-5 38M30 6Q60 27 13 38" fill="none" stroke="{skin}" stroke-width="18" stroke-linecap="round"/>'
    hair = '#d3cec5' if adult else '#293538'
    return g(x,y,s,f'<ellipse cy="124" rx="57" ry="11" fill="#172d33" opacity=".12"/><path d="M-19 70L-25 118M18 70L25 118" stroke="#3c5365" stroke-width="21" stroke-linecap="round"/><path d="M-43 85Q-42-7-20-14H21Q45-2 43 85Z" fill="{coat}"/><path d="M-24 25H24M-24 40H24" stroke="#fff5db" stroke-width="3" opacity=".35"/>{arms}<circle cy="-51" r="39" fill="{skin}"/><path d="M-38-48Q-48-103 3-98Q45-95 38-42L25-63Q-8-58-21-76Z" fill="{hair}"/><circle cx="-12" cy="-48" r="3.4" fill="#293538"/><circle cx="14" cy="-48" r="3.4" fill="#293538"/><path d="M-8-31Q1-23 11-32" stroke="#633d34" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M-38 121H-10M11 121H41" stroke="#3c3c43" stroke-width="13" stroke-linecap="round"/>')

def bird(x,y,s=1):
    return g(x,y,s,'<path d="M-42 20L-97 2-76 38-39 40" fill="#3d6d83"/><ellipse rx="53" ry="38" fill="#5c9caa"/><path d="M-29-1Q14-42 27 6Q3 35-29-1" fill="#95bcb7"/><circle cx="32" cy="-24" r="29" fill="#6da9b3"/><path d="M58-24L80-16 57-9" fill="#ebbd72"/><circle cx="41" cy="-28" r="4.5" fill="#263b46"/><circle cx="42" cy="-30" r="1.3" fill="white"/><path d="M-5 35L-7 49M12 35L14 49" stroke="#b8875b" stroke-width="4" stroke-linecap="round"/><path d="M-13 9L9 4M-8 18L11 13" stroke="#c0d3be" stroke-width="3" stroke-linecap="round"/>')

def cat(x,y,s=1):
    return g(x,y,s,'<path d="M-46 45Q-132 38-110-33Q-100-65-87-33" fill="none" stroke="#c68051" stroke-width="26" stroke-linecap="round"/><ellipse cy="26" rx="60" ry="62" fill="#d99e6c"/><path d="M-35 71L-43 99M25 71L40 99" stroke="#d99e6c" stroke-width="25" stroke-linecap="round"/><path d="M4-55L-15-103-42-54M58-50L86-91 87-27" fill="#ce8f60"/><ellipse cx="33" cy="-24" rx="58" ry="44" fill="#e2aa79"/><path d="M1-39L10-16M22-54L27-30M45-56L43-34" stroke="#b5724c" stroke-width="8" stroke-linecap="round"/><circle cx="20" cy="-22" r="4" fill="#35423c"/><circle cx="62" cy="-22" r="4" fill="#35423c"/><path d="M34-10L46-10 40-3Z" fill="#946655"/><path d="M20 0L-7-3M21 9L-3 14M57 0L86-1M56 9L84 17" stroke="#765b49" stroke-width="2" stroke-linecap="round"/>')

def goat(x,y,s=1,sheep=False):
    wool = ''.join(f'<circle cx="{cx}" cy="{cy}" r="31" fill="#f2ecd8"/>' for cx,cy in [(-40,-5),(-2,-22),(33,-2),(-22,25),(17,29)]) if sheep else '<ellipse rx="73" ry="49" fill="#f2ecd8"/>'
    horns = '' if sheep else '<path d="M55-61Q40-105 56-113M73-65Q81-108 69-120" fill="none" stroke="#bcaa8e" stroke-width="12" stroke-linecap="round"/>'
    return g(x,y,s,'<path d="M-43 30L-47 90M-5 37L-1 90M25 30L33 87" stroke="#c9bd9d" stroke-width="14" stroke-linecap="round"/>'+wool+horns+'<path d="M53-40L24-68 35-27M84-38L116-55 98-18" fill="#e5dcc5"/><ellipse cx="70" cy="-24" rx="31" ry="45" fill="#e7dfcc"/><circle cx="78" cy="-32" r="4" fill="#374b4c"/><path d="M67 3Q78 9 83 1" fill="none" stroke="#918674" stroke-width="3" stroke-linecap="round"/>')

def fox(x,y,s=1):
    return g(x,y,s,'<path d="M-38 47Q-151 58-133-30Q-93-27-52 7" fill="#c96e4e"/><path d="M-128-27Q-137 3-113 26L-93-15Z" fill="#efe4cc"/><ellipse cx="-4" cy="26" rx="57" ry="61" fill="#d7855c"/><path d="M-20 35L-32 94M30 39L43 93" stroke="#9b5a46" stroke-width="18" stroke-linecap="round"/><path d="M-19-35L-25-106 13-72M42-68L85-112 82-30" fill="#d7855c"/><path d="M-10-67L-13-91 4-73M58-73L74-93 71-65" fill="#7e534d"/><path d="M-22-40Q28-78 84-42L53 14Q22 36-7 8Z" fill="#df9669"/><path d="M-11-15L31 12 74-15 51 18Q28 35 5 14Z" fill="#f6ead3"/><circle cx="12" cy="-31" r="4" fill="#2d4148"/><circle cx="55" cy="-31" r="4" fill="#2d4148"/><path d="M23 6L39 6 31 14Z" fill="#384349"/>')

def elephant(x,y,s=1):
    return g(x,y,s,'<path d="M-98 65L-106 134M-43 75L-40 140M45 75L51 139M86 66L91 130" stroke="#94a5ab" stroke-width="40" stroke-linecap="round"/><ellipse cy="15" rx="134" ry="88" fill="#a9b8bd"/><path d="M-128-1Q-175-32-177 20" fill="none" stroke="#95a9ae" stroke-width="13" stroke-linecap="round"/><circle cx="91" cy="-42" r="77" fill="#aabac1"/><ellipse cx="51" cy="-32" rx="48" ry="62" fill="#c0c5c5"/><path d="M139-5Q170 82 207 46" fill="none" stroke="#aabac1" stroke-width="43" stroke-linecap="round"/><path d="M166 54L184 62" stroke="#869da6" stroke-width="4"/><circle cx="120" cy="-51" r="5" fill="#334d59"/><path d="M122-15Q130-7 141-16" fill="none" stroke="#6e8997" stroke-width="3" stroke-linecap="round"/>')

def boat(x,y,s=1,red=True):
    a,b,c=('#d87c6a','#b35e59','#efab87') if red else ('#b58b61','#816849','#d1ae7a')
    return g(x,y,s,f'<path d="M-120 0L-74 73H76L121 0Z" fill="{a}"/><path d="M-120 0L-12 24 76 73H-74Z" fill="{b}"/><path d="M-120 0L-12-91 2 0 121 0-12 24Z" fill="{c}"/><path d="M-12-91L-12 24 2 0Z" fill="{a}"/><path d="M-93 78Q0 94 99 75" stroke="#d3e1ce" stroke-width="5" fill="none" opacity=".7"/>')

def house(x,y,s=1):
    return g(x,y,s,'<path d="M-120-7H120V147H-120Z" fill="#ded5b8"/><path d="M-149-7L0-124 151-7Z" fill="#b66e60"/><path d="M-117-10L0-99 119-10" stroke="#de9a80" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M-25 146V57Q0 34 25 57V146" fill="#71695f"/><rect x="55" y="34" width="39" height="48" rx="8" fill="#f6d991"/><path d="M74 34V81M55 58H94" stroke="#98836a" stroke-width="5"/><rect x="-95" y="34" width="39" height="48" rx="8" fill="#f6d991"/>')

def star(x,y,s=1):
    points=' '.join(f'{math.cos(-math.pi/2+i*math.pi/5)*(48 if i%2==0 else 22):.1f},{math.sin(-math.pi/2+i*math.pi/5)*(48 if i%2==0 else 22):.1f}' for i in range(10))
    return g(x,y,s,f'<circle r="78" fill="#ffe7a1" opacity=".09"/><polygon points="{points}" fill="url(#moon)"/>')

def waves():
    return ''.join(f'<path d="M{x} {y}q40-13 80 0t80 0" fill="none" stroke="#b5d9d0" stroke-width="4" opacity=".25"/>' for x,y in [(0,425),(430,463),(180,566),(670,555)])

def scene(index):
    if index==0:
        return stars()+moon(690,116,64)+hills('#365363','#233d4b')+house(775,370,.85)+ground('#263f43')+'<ellipse cx="400" cy="548" rx="192" ry="34" fill="#7b9ba0"/><ellipse cx="422" cy="545" rx="44" ry="13" fill="#f0dcb0"/>'+cat(282,414,1.05)+'<path d="M358 509Q410 484 446 515" fill="none" stroke="#e5d5ae" stroke-width="3"/>'+sprigs(45,505,1.2)
    if index==1:
        return moon(775,110,43)+hills('#86a294','#526f72')+'<path d="M410 340Q160 414 383 510Q550 576 355 640H728Q829 526 556 443Q431 406 612 340Z" fill="#84bbc0"/>'+tree(86,272,1.1)+child(758,412,.72)+child(862,424,.57,'#6f91a0')+boat(456,466,.85)+'<path d="M366 440L551 398" stroke="#8e715a" stroke-width="13" stroke-linecap="round"/>'+sprigs(185,524,1.1)
    if index==2:
        return stars()+moon(820,92,46)+tree(176,347,1.25,'#365e68')+'<path d="M350 325Q315 265 369 243Q413 185 458 222Q514 187 558 240Q623 250 605 306Q476 340 350 325Z" fill="#a8b8c4" opacity=".9"/>'+bird(468,262,1.0)+star(559,208,.65)+star(680,90,.28)+ground('#253b48')+'<path d="M85 354Q146 411 220 356Q202 441 111 417Z" fill="#a88a66"/><path d="M104 376L200 395M106 397L208 376" stroke="#d2b790" stroke-width="5"/>'
    if index==3:
        return hills('#899b88','#4d786e')+'<path d="M0 440Q470 355 960 470V640H0Z" fill="#75a9af"/>'+waves()+'<path d="M133 424Q460 175 818 404L786 467Q475 267 165 481Z" fill="#b6b59d"/><path d="M150 418Q470 204 800 399" stroke="#e8dfbd" stroke-width="19" fill="none"/>'+goat(290,301,1.13)+bird(621,337,.75)+'<path d="M600 355L639 359 659 344M615 365L652 366" stroke="#c8c796" stroke-width="5"/>'+sprigs(39,510,1.2)
    if index==4:
        return '<rect x="0" y="340" width="960" height="300" fill="#8a7371"/><circle cx="610" cy="265" r="210" fill="#edcf99" opacity=".16"/>'+child(191,352,1.2,'#c59070',pose='hold')+'<path d="M335 436Q459 397 559 449Q683 397 829 428L810 537Q677 510 559 557Q451 509 339 523Z" fill="#4f788b"/><path d="M351 423Q459 389 559 439V534Q456 495 350 508Z" fill="#f6eacf"/><path d="M559 439Q675 386 812 416L800 509Q679 493 559 534Z" fill="#fff2d3"/>'+tree(616,313,.39,'#90b394')+tree(737,316,.31,'#718f85')+bird(578,260,.8)+'<path d="M447 390Q398 295 465 220Q508 175 556 173" stroke="#d9c4a0" stroke-width="4" stroke-dasharray="6 12" fill="none"/>'
    if index==5:
        return '<path d="M65 0L264 640H358L248 0M589 0L485 640H650L788 0" fill="#a5d7cf" opacity=".09"/>'+ground('#235b69')+sprigs(100,365,2,'#4d8892')+sprigs(820,300,2.5,'#548b85')+'<g transform="translate(450 325)"><path d="M-80-10L-159-71-153 71-78 21" fill="#d99569"/><ellipse rx="109" ry="72" fill="#e2ad7a"/><path d="M-24-59Q-3-101 28-64M-36 56Q-1 91 29 62" fill="#d18a69"/><path d="M-15 5Q-59-31-70 8Q-47 41-15 5" fill="#f4ce94"/><circle cx="63" cy="-18" r="8" fill="#294b57"/><circle cx="66" cy="-21" r="2.5" fill="white"/></g>'+''.join(f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r*.65}" fill="#87a8c2"/>' for x,y,r in [(360,565,31),(475,557,23),(582,546,25),(670,523,20)])+'<circle cx="613" cy="221" r="16" fill="none" stroke="#98c5ca" stroke-width="3"/><circle cx="647" cy="164" r="9" fill="none" stroke="#98c5ca" stroke-width="3"/>'
    if index==6:
        return hills('#c1b58d','#759b88')+tree(750,271,1,'#88a187')+child(219,396,.95,'#669b9b')+child(110,362,1.2,'#8d8499',adult=True)+g(480,320,1.3,'<path d="M-57 112Q-43-21 52-76Q89-50 50 37Q19 88-57 112Z" fill="#8ab7be"/><path d="M-56 111L57-91M-20 46L-25 5M8 9L53-6M-39 80L5 64" stroke="#d9e6d6" stroke-width="4" fill="none"/>')+bird(766,259,.56)+ground('#8b9c77')+sprigs(618,486,1.35,'#d5c58b')
    if index==7:
        return hills('#a4b2a1','#5d827e')+'<path d="M146 640Q267 405 758 348" stroke="#d9c9a1" stroke-width="104" fill="none"/>'+tree(788,242,.75,'#6e9988')+elephant(428,371,1.15)+bird(654,214,.78)+flower(80,486,.65)+flower(849,500,.8)+sprigs(759,495,1.2)
    if index==8:
        return hills('#a8b494','#709c8a')+'<path d="M0 527H960V640H0Z" fill="#bfa67f"/>'+child(253,389,1.17,'#6b92a3',pose='hold')+'<path d="M450 403L479 568H640L672 403Z" fill="#b97862"/><ellipse cx="561" cy="405" rx="113" ry="23" fill="#845f54"/><path d="M558 405Q531 343 562 291" stroke="#88a57c" stroke-width="12" fill="none"/><ellipse cx="534" cy="347" rx="37" ry="15" transform="rotate(35 534 347)" fill="#90b08b"/><ellipse cx="583" cy="321" rx="37" ry="16" transform="rotate(-34 583 321)" fill="#a8c19a"/>'+flower(790,401,1.1)+g(350,350,.8,'<path d="M-25 0H55V58H-25Z" fill="#739b9f"/><path d="M54 5L105-19 112-6 59 34" fill="#739b9f"/><path d="M-25 6Q-83-20-71 37Q-63 55-25 40" stroke="#739b9f" stroke-width="14" fill="none"/>')
    if index==9:
        rain=''.join(f'<path d="M{x} {y}l-6 26" stroke="#c6d9e6" stroke-width="5" stroke-linecap="round" opacity=".6"/>' for x,y in [(310,295),(402,330),(503,300),(595,344),(678,300),(358,403),(464,423),(573,405),(660,450)])
        return stars()+moon(820,120,47)+hills('#656f89','#425a70')+'<path d="M223 231Q188 175 241 141Q253 78 325 105Q373 46 440 109Q493 75 546 128Q623 102 665 162Q752 161 729 223Q585 291 223 231Z" fill="#b7bdcc"/>'+rain+ground('#39574f')+flower(302,502,.9,'#eddc9e')+flower(447,538,.75,'#e8c3b3')+flower(609,493,.9,'#dfdbe6')+house(100,369,.5)
    if index==10:
        return '<path d="M0 494L316 135 580 490Z" fill="#697591"/><path d="M356 510L674 69 960 475V640H356Z" fill="#8a8ca3"/><path d="M578 203L676 69 773 217 689 183 650 231Z" fill="#c3bac0"/>'+ground('#616f6c')+child(236,432,.9,'#b67b69',pose='up')+child(108,382,1.3,'#5e7e87',skin='#966247')+''.join(f'<path d="M{x} {y}q47 27 0 67" fill="none" stroke="#e8d2ae" stroke-width="5" stroke-linecap="round" opacity=".55"/>' for x,y in [(361,296),(407,263),(457,230)])+sprigs(770,492,1.4)
    if index==11:
        return stars()+moon(725,130,84)+hills('#47566d','#2e4b5c')+ground('#2c514e')+child(275,393,1.05,'#ce967a',pose='hold')+''.join(flower(x,y,s,'#f3edd3') for x,y,s in [(514,400,1.0),(648,483,1.2),(799,392,1.05),(420,540,.65),(115,518,.75)])+'<path d="M282 507Q405 451 459 586" stroke="#c4c7a2" stroke-width="25" fill="none" opacity=".5"/>'
    if index==12:
        return hills('#7e9c89','#496e6a')+tree(157,254,1.0,'#609080')+fox(664,428,1.17)+bird(375,265,.9)+g(489,362,1.2,'<path d="M-64 71Q-92-39 49-76Q91 4 12 64Z" fill="#a0bb8c"/><path d="M-59 71L48-74M-29 25L-53-7M-3-8L36-2" stroke="#d3d8a4" stroke-width="3" fill="none"/><path d="M-13 7V-32M-13-32L-30-43-13-53 4-43Z" stroke="#657c66" stroke-width="3" fill="none"/>')+ground('#415f52')
    if index==13:
        mane_points=(('77.0','0.0'),('66.68395609140178','38.49999999999999'),('38.50000000000001','66.68395609140177'),('4.7148901767173095e-15','77.0'),('-38.499999999999986','66.68395609140178'),('-66.68395609140178','38.49999999999999'),('-77.0','9.429780353434619e-15'),('-66.68395609140178','-38.499999999999986'),('-38.500000000000036','-66.68395609140175'),('-1.4144670530151929e-14','-77.0'),('38.50000000000001','-66.68395609140177'),('66.68395609140175','-38.500000000000036'))
        mane=''.join(f'<circle cx="{cx}" cy="{cy}" r="34" fill="#b78754"/>' for cx,cy in mane_points)
        lion=g(337,430,1.05,'<ellipse cx="-61" cy="22" rx="139" ry="68" fill="#d1a061"/>'+mane+'<circle r="66" fill="#dbb578"/><path d="M-35-3Q-22 8-7-3M10-3Q24 8 38-3" stroke="#67544a" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M-8 18H12L2 28Z" fill="#846348"/><ellipse cx="-102" cy="74" rx="63" ry="16" fill="#dabb86"/>')
        return moon(815,117,46)+tree(228,248,1.35,'#516f6a')+ground('#516e5a')+'<path d="M480 640Q610 449 960 439" fill="none" stroke="#a4a68a" stroke-width="74"/>'+lion+goat(724,419,.75)+bird(623,367,.54)+''.join(g(x,y,.6,'<ellipse rx="33" ry="13" transform="rotate(-30)" fill="#a8bd8c"/>') for x,y in [(560,590),(608,536),(663,503),(726,476)])
    if index==14:
        return '<path d="M0 341H960V640H0Z" fill="#6998a7"/>'+moon(760,108,52)+'<ellipse cx="661" cy="388" rx="221" ry="66" fill="#ddc89b"/>'+tree(677,253,.7,'#86a99c')+flower(739,381,.55)+waves()+boat(289,479,1.5,False)+child(273,426,.58,'#cb9179',pose='hold')+child(365,403,.7,'#7b8296',adult=True)+bird(565,365,.45)
    if index==15:
        return '<rect x="60" y="80" width="840" height="430" rx="30" fill="#f2dfb5"/><path d="M510 343Q567 194 656 243L688 202 716 237 758 207 759 299Q655 357 510 343Z" fill="#bba58d" opacity=".7"/><path d="M551 406L590 324 607 359 634 330 642 409Z" fill="#bba58d" opacity=".7"/><rect y="510" width="960" height="130" fill="#766b72"/>'+child(300,422,.9,'#d38c78',pose='up')+child(429,451,.72,'#779ba1',pose='up')+'<path d="M790 320L750 446H905L868 320Z" fill="#ddbc85"/><path d="M825 445V530M792 531H861" stroke="#695f62" stroke-width="12" stroke-linecap="round"/>'
    if index==16:
        return moon(760,113,46)+hills('#75858b','#446565')+tree(599,230,1.0,'#668d7e')+fox(358,431,1.22)+goat(835,422,.76,True)+'<path d="M642 189Q680 229 665 282" stroke="#ac9771" stroke-width="5" fill="none"/><path d="M631 278Q630 235 667 235Q702 235 704 278L719 304H614Z" fill="url(#moon)"/><ellipse cx="668" cy="306" rx="53" ry="12" fill="#c79e65"/><circle cx="667" cy="316" r="8" fill="#ad8654"/>'+ground('#456251')
    if index==17:
        return '<rect y="372" width="960" height="268" fill="#667b7a"/>'+child(227,309,.95,'#6d9a9d',pose='hold')+child(708,309,.95,'#b5846d',pose='hold')+'<ellipse cx="477" cy="458" rx="345" ry="104" fill="#b48d6b"/><path d="M244 433L456 390 516 442 493 509 293 517Z" fill="#f0dfb6"/><path d="M531 406L687 427 657 507 522 495 539 449Z" fill="#efdcad"/><path d="M314 470Q372 403 420 461T605 466" fill="none" stroke="#a98b75" stroke-width="8" stroke-dasharray="8 9"/><path d="M381 450L400 416 421 453Z" fill="#81988c"/><circle cx="566" cy="448" r="16" fill="#83a3ad"/>'+g(318,412,.4,'<ellipse rx="35" ry="17" fill="#92ad83"/>')+boat(658,379,.4)+flower(97,297,.6)
    if index==18:
        return moon(811,109,40)+'<path d="M0 328Q272 257 480 389T960 334V640H0Z" fill="#d1b482"/><path d="M0 428Q250 371 545 421T960 370V640H0Z" fill="#b89976"/><path d="M0 590Q326 361 741 582T960 559V640H0Z" fill="#577b70"/>'+fox(335,452,.9)+goat(623,430,.92)+bird(575,232,.83)+star(692,88,.23)+sprigs(65,519,1.1,'#c8c09a')
    return stars()+moon(813,111,61)+hills('#46546d','#30495b')+house(742,330,.85)+'<path d="M-40 649Q138 430 397 518T765 457" fill="none" stroke="#f4d58e" stroke-width="38" opacity=".75"/><path d="M-40 649Q138 430 397 518T765 457" fill="none" stroke="#fff0bd" stroke-width="8"/>'+child(267,395,1.0,'#d48c75')+bird(484,269,.65)+boat(497,481,.48)+cat(717,403,.34)+sprigs(71,483,1.1)

palettes=[('#172d48','#536371'),('#c3c8b3','#9fb7b0'),('#203651','#576e87'),('#c8c9b1','#a8b7a1'),('#55617f','#9f91a3'),('#174b66','#397e8f'),('#b8c3a2','#d8c695'),('#b6c3b1','#c9c4a6'),('#bdc9ad','#e2d2a8'),('#354b70','#8a8ca0'),('#b4bbc3','#e5cda8'),('#192f4c','#536277'),('#9fb6aa','#aebaa1'),('#53697e','#a1a99b'),('#b7b6bc','#e1bca5'),('#3a465f','#9b8290'),('#4c617c','#a9a993'),('#526c82','#b7c0b0'),('#8a92a7','#e2bd96'),('#21334f','#69717b')]
data=json.loads((root/'stories/content/collection.json').read_text())
for n,story in enumerate(data['stories']):
    a,b=palettes[n]
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640" role="img" aria-labelledby="title desc"><title id="title">{html.escape(story['editorialTitle'])}</title><desc id="desc">{html.escape(story['alt'])}</desc><metadata>Original project artwork. Scene {n+1}; no third-party assets.</metadata><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient><radialGradient id="moon"><stop stop-color="#fff4cd"/><stop offset="1" stop-color="#e6cc93"/></radialGradient></defs><path fill="url(#sky)" d="M0 0H960V640H0Z"/>{scene(n)}<path d="M25 615Q260 603 478 620T939 608" stroke="#f4e3be" stroke-width="2" opacity=".12" fill="none"/></svg>'''
    (out/(story['id']+'.svg')).write_text(svg)
print(f'Built {len(data["stories"])} dedicated original SVG story illustrations.')
