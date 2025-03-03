export function spCode() {
  return `
    let audio = input();
    let pointerDown = input();
    
    setMaxIterations(5);
    let s = getSpace();
    let r = getRayDirection();
    
    let n1 = noise(r * 4 + vec3(0, audio, vec3(0, audio, audio))*.5);
    let n = noise(s + vec3(0, 0, audio+time*.01) + n1);
    
    metal(n*.2+.3);
    shine(n*.1+.2);
    
    color(normal * .05 + vec3(0, 0, .3));
    displace(mouse.x * 1, mouse.y * 2, 0);
    boxFrame(vec3(2), abs(n) * .1 + .04);
    mixGeo(pointerDown);
    sphere(n * .5 + .8);
  `;
} 