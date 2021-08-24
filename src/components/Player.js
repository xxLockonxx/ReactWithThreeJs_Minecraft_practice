import React, { useEffect, useRef, useState } from 'react';
import { useSphere } from '@react-three/cannon';
import { useThree, useFrame } from 'react-three-fiber';
import { FPVControls } from './FPVControls';
import * as THREE from "three";
import { useStore } from '../hooks/useStore';

const SPEED = 5
const keys = { KeyW: "forward", KeyS: "backward", KeyA: "left", KeyD: "right", Space: "jump",}
const moveFieldByKey = (key) => keys[key]
const numbers = {    Digit1: 'dirt', Digit2: 'grass', Digit3: 'glass', Digit4: 'wood', Digit5: 'log',}
const changeTextureByNum = (num) => numbers[num]
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()
const speed = new THREE.Vector3()


const usePlayerControls = () => {
  const [movement, setMovement] = useState({ forward: false, backward: false, left: false, right: false, jump: false })
  const [setTexture] = useStore((state) => [state.setTexture]);
  useEffect(() => {
    const handleKeyDown = (e) => {
            // Movement key
            if (moveFieldByKey(e.code)) {
              setMovement((m) => ({
                ...m,
                [moveFieldByKey(e.code)]: true,
              }));
            }
            // Change texture key
            if (changeTextureByNum(e.code)) {
              setTexture(changeTextureByNum(e.code));
            }
          };
    const handleKeyUp = (e) => setMovement((m) => ({ ...m, [moveFieldByKey(e.code)]: false }))
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
    }
  }, [setTexture])
  return movement
}

export const Player = (props) => {
  const [ref, api] = useSphere(() => ({ mass: 1, type: "Dynamic", position: [0, 10, 0], ...props }))
  const { forward, backward, left, right, jump } = usePlayerControls()
  const { camera } = useThree()
  const velocity = useRef([0, 0, 0])
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [])
  useFrame((state) => {
    ref.current.getWorldPosition(camera.position)
    frontVector.set(0, 0, Number(backward) - Number(forward))
    sideVector.set(Number(left) - Number(right), 0, 0)
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(SPEED).applyEuler(camera.rotation)
    speed.fromArray(velocity.current)
    api.velocity.set(direction.x, velocity.current[1], direction.z)
    if (jump && Math.abs(velocity.current[1].toFixed(2)) < 0.05) api.velocity.set(velocity.current[0], 10, velocity.current[2])
  })
  return (
    <>
      <FPVControls />
      <mesh ref={ref} />
    </>
  );
};
