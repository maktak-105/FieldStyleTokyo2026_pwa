import { useState, useEffect, useCallback } from 'react';

interface CompassState {
  heading: number | null;
  error: string | null;
  permissionGranted: boolean;
  needsPermissionRequest: boolean;
}

export function useCompass() {
  const [state, setState] = useState<CompassState>({
    heading: null,
    error: null,
    permissionGranted: false,
    needsPermissionRequest: typeof (DeviceOrientationEvent as any).requestPermission === 'function',
  });

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading = null;
    // iOS 
    if ((event as any).webkitCompassHeading) {
      heading = (event as any).webkitCompassHeading;
    } 
    // Android (absolute orientation needed)
    else if (event.alpha !== null) {
      // 360 - alpha gives a rough heading if absolute is true, but requires window.addEventListener('deviceorientationabsolute', ...)
      heading = 360 - event.alpha;
    }
    
    if (heading !== null) {
      setState(s => ({ ...s, heading }));
    }
  }, []);

  const requestPermission = async () => {
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setState(s => ({ ...s, permissionGranted: true, needsPermissionRequest: false, error: null }));
        } else {
          setState(s => ({ ...s, error: 'Permission denied' }));
        }
      } else {
        // Non-iOS devices
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        setState(s => ({ ...s, permissionGranted: true, needsPermissionRequest: false, error: null }));
      }
    } catch (err) {
      setState(s => ({ ...s, error: 'Error requesting permission. Must be over HTTPS.' }));
    }
  };

  useEffect(() => {
    // If permission is not strictly required to prompt, just start listening (Android/old iOS)
    if (!state.needsPermissionRequest && !state.permissionGranted) {
      window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
      setState(s => ({ ...s, permissionGranted: true }));
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener);
    };
  }, [state.needsPermissionRequest, state.permissionGranted, handleOrientation]);

  return { ...state, requestPermission };
}
