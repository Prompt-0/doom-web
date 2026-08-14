/**
 * Item & Pickup System (Medikits, Armor, Ammo, Keys, Powerups)
 */

import { Entity } from './Entity';

export type PickupType =
  | 'PICKUP_MEDIKIT'
  | 'PICKUP_STIMPACK'
  | 'PICKUP_POTION'
  | 'PICKUP_ARMOR_GREEN'
  | 'PICKUP_ARMOR_BLUE'
  | 'KEY_BLUE'
  | 'KEY_RED'
  | 'KEY_YELLOW'
  | 'PICKUP_CLIP'
  | 'PICKUP_SHELLS'
  | 'PICKUP_ROCKET'
  | 'PICKUP_CELL'
  | 'PICKUP_BERSERK'
  | 'PICKUP_SHOTGUN'
  | 'PICKUP_CHAINGUN'
  | 'PICKUP_ROCKET_LAUNCHER'
  | 'PICKUP_PLASMA_RIFLE'
  | 'PICKUP_BFG';

export class Pickup extends Entity {
  public type: PickupType;
  public bobOffset: number = 0;
  private bobPhase: number = Math.random() * Math.PI * 2;

  constructor(x: number, y: number, type: PickupType) {
    super(x, y, type, 0.3);
    this.type = type;
  }

  public update(delta: number): void {
    this.bobPhase += delta * 3.0;
    this.bobOffset = Math.sin(this.bobPhase) * 0.05;
  }
}
