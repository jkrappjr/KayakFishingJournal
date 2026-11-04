'use strict';
// Source-photo pose, checked against the visible nose / line-tie end.
// Mirroring preserves the belly and hook side; tilt levels diagonal photos.
window.WVLureOrientation={
 poses:{ned:{mirror:false,tilt:0},'ned-rigged':{mirror:true,tilt:-43},plopper:{mirror:false,tilt:0},creature:{mirror:false,tilt:0},dropshot:{mirror:false,tilt:0},walking:{mirror:true,tilt:-32},popper:{mirror:false,tilt:0},buzz:{mirror:false,tilt:0},softjerk:{mirror:true,tilt:-22},crank:{mirror:false,tilt:0},lipless:{mirror:false,tilt:0},spinner:{mirror:true,tilt:24},inline:{mirror:false,tilt:0},swim:{mirror:false,tilt:0},underspin:{mirror:false,tilt:0},chatter:{mirror:true,tilt:30},hardjerk:{mirror:true,tilt:0},'hardjerk-jr':{mirror:true,tilt:0},jig:{mirror:false,tilt:0},wacky:{mirror:false,tilt:0},tube:{mirror:false,tilt:0},glide:{mirror:false,tilt:0},grub:{mirror:true,tilt:-45},grubjig:{mirror:true,tilt:-45},sticktexas:{mirror:false,tilt:0}},
 sourcePose(key){const pose=this.poses[key];if(!pose)throw Error('Missing tutorial lure orientation: '+key);return `rotate(${pose.tilt}) scale(${pose.mirror?-1:1} 1)`;},
 surfaceOffset(profile,progress,before,after){
  const walking=['walking','walking-other'].includes(profile.id),glide=profile.scene==='glide';
  if(!walking&&!glide)return {x:0,y:0};
  const dx=after.x-before.x,dy=after.y-before.y,length=Math.hypot(dx,dy)||1;
  const sway=Math.sin(progress*Math.PI*(walking?12:6))*(walking?7:13);
  return {x:-dy/length*sway,y:dx/length*sway};
 },
 travelPose(before,after,{overhead=false,defaultFacing=1}={}){
  const dx=after.x-before.x,dy=after.y-before.y,facing=Math.abs(dx)>.01?(dx<0?-1:1):defaultFacing;
  let angle=0;if(overhead&&Math.hypot(dx,dy)>.01){angle=Math.atan2(dy,dx)*180/Math.PI;if(facing<0)angle+=angle>0?-180:180;}
  return `rotate(${angle}) scale(${facing} 1)`;
 }
};
