export function spCode() {
  // Define the input function on the global object before the shader code runs
  if (typeof window !== 'undefined' && !window.hasOwnProperty('input')) {
    (window as any).input = function(startValue = 0, minValue = 0, maxValue = 100) {
      return startValue;
    };
  }

  return `
    let audio = input();
    let pointerDown = input();
    
    setMaxIterations(5);
    let s = getSpace();
    let r = getRayDirection();
    
    let n1 = noise(r * 4 + vec3(0, audio, vec3(0, audio, audio))*.5);
    let n = noise(s + vec3(0, 0, audio+time*.01) + n1);
    
    metal(0.2);
    shine(0.2);
    
    color(normal * .05 + vec3(0, 0, .3));
    displace(mouse.x * 1, mouse.y * 1, 0);
    boxFrame(vec3(2), abs(n) * .4 + .04);
    mixGeo(pointerDown);
    sphere(n * .5 + .8);
  `;
} 