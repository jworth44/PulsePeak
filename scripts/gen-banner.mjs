import { writeFileSync } from "node:fs";
const W=1200,H=160;
const RED="#B31942",WHITE="#FFFFFF",BLUE="#0A3161",NAVY="#0a1a3a";
const SH=H/13;
function starPts(cx,cy,R,r){let p=[];for(let i=0;i<10;i++){const rad=i%2?r:R;const a=-Math.PI/2+i*Math.PI/5;p.push((cx+Math.cos(a)*rad).toFixed(1)+","+(cy+Math.sin(a)*rad).toFixed(1));}return p.join(" ");}
// a flag block of width fw at x-offset ox, mirrored if mir
function flag(ox,fw,mir){
  let g=`<g${mir?` transform="translate(${2*ox+fw},0) scale(-1,1)"`:""}>`;
  g+=`<rect x="${ox}" y="0" width="${fw}" height="${H}" fill="${RED}"/>`;
  for(let i=1;i<13;i+=2) g+=`<rect x="${ox}" y="${(i*SH).toFixed(1)}" width="${fw}" height="${SH.toFixed(1)}" fill="${WHITE}"/>`;
  const cw=fw*0.42, ch=SH*7;
  g+=`<rect x="${ox}" y="0" width="${cw.toFixed(1)}" height="${ch.toFixed(1)}" fill="${BLUE}"/>`;
  // stars grid 5x4
  for(let r=0;r<5;r++)for(let c=0;c<(r%2?4:5);c++){const sx=ox+cw*( (r%2?1.5:1)+c*2)/10.5;const sy=ch*(1+r*2)/11;g+=`<polygon points="${starPts(sx,sy,ch*0.06,ch*0.024)}" fill="${WHITE}"/>`;}
  g+=`</g>`;
  return g;
}
let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">`;
s+=`<defs>`;
s+=`<linearGradient id="fadeL" x1="0" x2="1"><stop offset="0" stop-color="${NAVY}" stop-opacity="0"/><stop offset="0.7" stop-color="${NAVY}" stop-opacity="0.55"/><stop offset="1" stop-color="${NAVY}" stop-opacity="1"/></linearGradient>`;
s+=`<linearGradient id="fadeR" x1="1" x2="0"><stop offset="0" stop-color="${NAVY}" stop-opacity="0"/><stop offset="0.7" stop-color="${NAVY}" stop-opacity="0.55"/><stop offset="1" stop-color="${NAVY}" stop-opacity="1"/></linearGradient>`;
s+=`<linearGradient id="ctr" x1="0" x2="1"><stop offset="0" stop-color="${NAVY}" stop-opacity="0"/><stop offset="0.28" stop-color="${NAVY}" stop-opacity="0.6"/><stop offset="0.72" stop-color="${NAVY}" stop-opacity="0.6"/><stop offset="1" stop-color="${NAVY}" stop-opacity="0"/></linearGradient>`;
s+=`</defs>`;
s+=`<rect width="${W}" height="${H}" fill="${NAVY}"/>`;
s+=flag(0,360,false);
s+=`<rect x="0" y="0" width="480" height="${H}" fill="url(#fadeL)"/>`;
s+=flag(840,360,true);
s+=`<rect x="${W-480}" y="0" width="480" height="${H}" fill="url(#fadeR)"/>`;
// center darkening band so the tagline stays legible over the stripes
s+=`<rect width="${W}" height="${H}" fill="url(#ctr)"/>`;
// center text
s+=`<text x="${W/2}" y="70" text-anchor="middle" font-family="'Arial Black',Arial,sans-serif" font-weight="800" font-size="44" letter-spacing="1" fill="#ffffff">STRONGER EVERY DAY. BUILT IN AMERICA.</text>`;
s+=`<text x="${W/2}" y="108" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="20" letter-spacing="6" fill="#dfe6f2">DISCIPLINE <tspan fill="#e11d2f">&#9733;</tspan> CONSISTENCY <tspan fill="#e11d2f">&#9733;</tspan> STRENGTH</text>`;
s+=`</svg>`;
writeFileSync("public/us-banner.svg",s);
console.log("wrote public/us-banner.svg",s.length,"bytes");
