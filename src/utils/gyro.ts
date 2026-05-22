'use strict';

export type Tilt = { yaw: number; pitch: number; roll: number };

export class GyroStabilizer {
  private yaw = 0;
  private pitch = 0;
  private readonly alpha = 0.12;
  private last: Tilt = { yaw: 0, pitch: 0, roll: 0 };

  updateFromDevice(e: DeviceOrientationEvent): Tilt {
    const gamma = e.gamma ?? 0;
    const beta = e.beta ?? 0;
    const targetYaw = gamma * 0.8;
    const targetPitch = beta * 0.6;

    this.yaw = this.yaw * (1 - this.alpha) + targetYaw * this.alpha;
    this.pitch = this.pitch * (1 - this.alpha) + targetPitch * this.alpha;

    this.last = { yaw: this.yaw, pitch: this.pitch, roll: e.alpha ?? 0 };
    return this.last;
  }

  get(): Tilt {
    return this.last;
  }
}

