import { writeFileSync } from "node:fs";
// Accurate US flag (viewBox 1235x650), official colors.
const W=1235,H=650,SH=H/13; // stripe height 50
const RED="#B31942",WHITE="#FFFFFF",BLUE="#0A3161";
const cantonW=494,cantonH=SH*7; // 350
// one 5-point star, outer R, inner r, centered origin, top point up
function starPts(R,r){
  const pts=[];
  for(let i=0;i<10;i++){const rad=i%2?r:R;const a=-Math.PI/2+i*Math.PI/5;pts.push((Math.cos(a)*rad).toFixed(2)+","+(Math.sin(a)*rad).toFixed(2));}
  return pts.join(" ");
}
const star=starPts(17,7);
// star grid: 9 rows, alt 6/5
const rowsY=[]; for(let i=0;i<9;i++) rowsY.push(35+i*35);
const stars=[];
rowsY.forEach((y,ri)=>{
  if(ri%2===0){ for(let c=0;c<6;c++) stars.push([41+c*82,y]); }
  else { for(let c=0;c<5;c++) stars.push([82+c*82,y]); }
});
let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">`;
svg+=`<rect width="${W}" height="${H}" fill="${RED}"/>`;
for(let i=1;i<13;i+=2) svg+=`<rect y="${i*SH}" width="${W}" height="${SH}" fill="${WHITE}"/>`;
svg+=`<rect width="${cantonW}" height="${cantonH}" fill="${BLUE}"/>`;
svg+=`<defs><polygon id="s" points="${star}" fill="${WHITE}"/></defs>`;
stars.forEach(([x,y])=>{ svg+=`<use href="#s" x="${x}" y="${y}"/>`; });
svg+=`</svg>`;
writeFileSync("public/us-flag.svg",svg);
console.log("wrote public/us-flag.svg", svg.length, "bytes,", stars.length, "stars");
