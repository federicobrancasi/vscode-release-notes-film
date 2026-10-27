import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PERSPECTIVE, Pose} from './pose';

/** The window plane: its children are laid out in window px and moved by the pose, in perspective. */
export const Plane: React.FC<{pose: Pose; children: React.ReactNode}> = ({pose, children}) => (
  <AbsoluteFill style={{perspective: PERSPECTIVE, perspectiveOrigin: '960px 540px'}}>
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 1280,
        height: 720,
        transformOrigin: `${pose.cx}px ${pose.cy}px`,
        transform: `translate(${pose.fx - pose.cx}px, ${pose.fy - pose.cy}px) rotateX(${pose.rx}deg) rotateY(${pose.ry}deg) rotateZ(${pose.rz}deg) scale(${pose.s})`,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);
