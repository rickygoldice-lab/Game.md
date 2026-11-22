import * as THREE from 'three';

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x08091a, 0.006);
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();
const DURATION = 110;
const temp = new THREE.Object3D();

scene.add(new THREE.HemisphereLight(0x829cff, 0x120b18, 1.2));
const key = new THREE.DirectionalLight(0xffffff, 4);
key.position.set(-12, 24, 18); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048); scene.add(key);

const groundMat = new THREE.MeshStandardMaterial({ color:0x15131d, roughness:.75, metalness:.15 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(500,500), groundMat);
ground.rotation.x=-Math.PI/2; ground.position.y=-2.2; ground.receiveShadow=true; scene.add(ground);

function debris(count=180) {
  const mat = new THREE.MeshStandardMaterial({color:0x25222b, roughness:.9});
  const geo = new THREE.DodecahedronGeometry(1,0);
  const mesh = new THREE.InstancedMesh(geo,mat,count);
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2, r=8+Math.random()*75;
    temp.position.set(Math.cos(a)*r,-1.8+Math.random()*2,Math.sin(a)*r);
    const s=.3+Math.random()*2.8; temp.scale.set(s,s*.55,s); temp.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);
    temp.updateMatrix(); mesh.setMatrixAt(i,temp.matrix);
  }
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
}
debris();

function building(x,z,h,w=7) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({color:0x171923, roughness:.8, metalness:.1});
  const main = new THREE.Mesh(new THREE.BoxGeometry(w,h,w*.72),mat); main.position.y=h/2-2.2; main.castShadow=true; main.receiveShadow=true; g.add(main);
  const winMat = new THREE.MeshBasicMaterial({color:0x54628a});
  for(let y=1;y<h;y+=2.2){
    for(let side=-1;side<=1;side+=2){
      const win=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.7),winMat); win.position.set(side*(w/2+.01),y-2.2,0); win.rotation.y=side*Math.PI/2; g.add(win);
    }
  }
  g.position.set(x,0,z); scene.add(g);
}
for(let i=-5;i<=5;i++) building(i*16+(i%2)*4,-35-Math.abs(i)*2,12+Math.abs(i%3)*7,7+(Math.abs(i)%3));

function limb(radius,length,material) {
  const g=new THREE.Group();
  const geo=new THREE.CapsuleGeometry(radius,length,5,10);
  const m=new THREE.Mesh(geo,material); m.castShadow=true; g.add(m); return g;
}

function makeFighter(kind) {
  const g=new THREE.Group();
  const skin=new THREE.MeshStandardMaterial({color:kind?'0xe7b99e':'0xf1c9ad',roughness:.5});
  const cloth=new THREE.MeshStandardMaterial({color:kind?0x14131b:0x101529,roughness:.7,metalness:.08});
  const accent=new THREE.MeshStandardMaterial({color:kind?0x7a1726:0x284f8a,roughness:.45,emissive:kind?0x220000:0x07152e,emissiveIntensity:.5});
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(1.15,2.7,8,12),cloth); torso.position.y=3.3; torso.castShadow=true; g.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.85,24,18),skin); head.position.y=6.05; head.scale.set(1,.95,1); head.castShadow=true; g.add(head);
  if(!kind){
    const hairMat=new THREE.MeshStandardMaterial({color:0xe9edf5,roughness:.45});
    for(let i=0;i<12;i++){const cone=new THREE.Mesh(new THREE.ConeGeometry(.24,.95,7),hairMat); const a=i/12*Math.PI*2; cone.position.set(Math.cos(a)*.48,6.75+Math.random()*0.25,Math.sin(a)*.36); cone.rotation.z=-Math.cos(a)*.7; cone.rotation.x=Math.sin(a)*.3; g.add(cone);}
    const band=new THREE.Mesh(new THREE.BoxGeometry(1.75,.28,.55),new THREE.MeshStandardMaterial({color:0x090a10,roughness:.25})); band.position.set(0,6.15,.72); g.add(band);
  } else {
    const hairMat=new THREE.MeshStandardMaterial({color:0xd8a0a0,roughness:.5});
    for(let i=0;i<8;i++){const cone=new THREE.Mesh(new THREE.ConeGeometry(.28,.9,7),hairMat); const a=i/8*Math.PI*2; cone.position.set(Math.cos(a)*.48,6.72,Math.sin(a)*.36); cone.rotation.z=-Math.cos(a)*.45; g.add(cone);}
    for(let i=-1;i<=1;i+=2){const mark=new THREE.Mesh(new THREE.BoxGeometry(.08,.32,.03),accent); mark.position.set(i*.25,6.05,.83); g.add(mark);}
  }
  const legs=[];
  for(const x of [-.58,.58]){const leg=limb(.48,2.1,cloth); leg.position.set(x,.2,0); g.add(leg); legs.push(leg);}
  const arms=[];
  for(const x of [-1.35,1.35]){const arm=limb(.38,2.4,cloth); arm.position.set(x,3.45,0); arm.rotation.z=x<0?.12:-.12; g.add(arm); arms.push(arm);}
  g.userData={arms,legs,skin,cloth,accent}; g.scale.setScalar(1.45);
  return g;
}

const gojo=makeFighter(false), sukuna=makeFighter(true);
gojo.position.set(-4,0,0); sukuna.position.set(4,0,0); scene.add(gojo,sukuna);

function glowSphere(color,radius,opacity=1) {
  const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false});
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,32,16),mat); scene.add(mesh); return mesh;
}

const blue=glowSphere(0x42aaff,3,.1); blue.visible=false;
const red=glowSphere(0xff264f,3,.1); red.visible=false;
const purple=glowSphere(0xca54ff,2,.1); purple.visible=false;

function lineParticles(count,color,life=.8) {
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(count*3); geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const mat=new THREE.PointsMaterial({color,size:.16,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false});
  const pts=new THREE.Points(geo,mat); pts.userData={life,age:0,velocity:[]}; scene.add(pts);
  for(let i=0;i<count;i++){pts.userData.velocity.push(new THREE.Vector3((Math.random()-.5)*.5,(Math.random()-.5)*.5,(Math.random()-.5)*.5));}
  return pts;
}
const particles=lineParticles(650,0x68aaff,1);

function energyAura(fighter,color) {
  const aura=glowSphere(color,4.3,.05); aura.position.copy(fighter.position); return aura;
}
const auraGojo=energyAura(gojo,0x49aaff), auraSukuna=energyAura(sukuna,0xff4a72);

function shake(amount) {
  camera.position.x+=(Math.random()-.5)*amount;
  camera.position.y+=(Math.random()-.5)*amount;
}

function lookAtObject(a){camera.lookAt(a.position.x,a.position.y+4,a.position.z)}

function animate() {
  requestAnimationFrame(animate);
  let t=clock.getElapsedTime(); t=t%DURATION;

  if(t<12){
    camera.position.set(Math.sin(t*.12)*18,7+Math.sin(t*.2),22-Math.cos(t*.12)*10); lookAtObject(gojo.position.z?new THREE.Object3D():sukuna);
    sukuna.position.set(4,0,0); gojo.position.set(-4+Math.sin(t*.5)*.2,0,0);
  } else if(t<38){
    const x=Math.sin(t*.7)*10;
    camera.position.set(x,7,16); camera.lookAt(0,3.5,0);
    gojo.position.x=-2+Math.sin(t*2.5)*1.5; sukuna.position.x=3+Math.sin(t*2.3)*1.2;
    gojo.userData.arms[0].rotation.x=Math.sin(t*5)*.8; sukuna.userData.arms[1].rotation.x=Math.sin(t*5+.4)*.9;
  } else if(t<58){
    camera.position.set(-10+Math.sin(t)*3,8,13); camera.lookAt(0,4,0);
    blue.visible=t>40&&t<47; blue.position.set(-1,2,0); blue.scale.setScalar(.7+Math.sin(t*8)*.15);
    red.visible=t>47&&t<53; red.position.set(0,4,1); red.scale.setScalar(.8+(t-47)*.35);
    purple.visible=t>53; purple.position.set(0,4,0); purple.scale.setScalar(1+(t-53)*.9);
  } else if(t<82){
    scene.fog.density=t>62&&t<72?.018:.006;
    camera.position.set(Math.sin(t*.25)*20,12,18); camera.lookAt(0,5,0);
    purple.visible=t>58&&t<64;
    if(t>64&&t<72) shake(.08);
  } else if(t<105){
    const clash=t>88;
    camera.position.set(clash?Math.sin(t*2)*12:8,7+Math.cos(t)*2,14);
    camera.lookAt(0,4,0);
    purple.visible=clash; purple.position.set(0,4,0); purple.scale.setScalar(clash?3+(t-88)*.15:1);
    red.visible=clash&&t<96;
  } else {
    camera.position.set(0,6,18+Math.sin(t*.3)*2); camera.lookAt(0,4,0);
    purple.visible=true; purple.scale.setScalar(8+Math.sin(t*3)*.5);
    if(t>106) shake(.15);
  }

  auraGojo.position.copy(gojo.position); auraGojo.position.y+=4;
  auraSukuna.position.copy(sukuna.position); auraSukuna.position.y+=4;
  auraGojo.scale.setScalar(1+Math.sin(t*3)*.08); auraSukuna.scale.setScalar(1+Math.sin(t*3+.5)*.08);
  gojo.userData.legs[0].rotation.z=Math.sin(t*3)*.12; sukuna.userData.legs[1].rotation.z=Math.sin(t*3+.5)*.12;

  const pp=particles.geometry.attributes.position.array;
  for(let i=0;i<pp.length;i+=3){
    pp[i]+=particles.userData.velocity[i/3].x*.22;
    pp[i+1]+=particles.userData.velocity[i/3].y*.22;
    pp[i+2]+=particles.userData.velocity[i/3].z*.22;
  }
  particles.geometry.attributes.position.needsUpdate=true;

  renderer.render(scene,camera);
}

addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight)});
animate();
