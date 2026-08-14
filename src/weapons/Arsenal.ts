/**
 * DOOM Weapon System & Arsenal Definitions
 */

export type WeaponId =
  | 'FIST'
  | 'CHAINSAW'
  | 'PISTOL'
  | 'SHOTGUN'
  | 'SUPER_SHOTGUN'
  | 'CHAINGUN'
  | 'ROCKET_LAUNCHER'
  | 'PLASMA_RIFLE'
  | 'BFG_9000';

export type AmmoType = 'NONE' | 'BULLETS' | 'SHELLS' | 'ROCKETS' | 'CELLS';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  slot: number; // 1 to 7
  ammoType: AmmoType;
  ammoCost: number;
  refireTime: number; // in seconds
  idleSprite: string;
  fireSprite: string;
  flashDuration: number;
  soundFire: string;
}

export class Arsenal {
  public static readonly WEAPONS: Record<WeaponId, WeaponDef> = {
    FIST: {
      id: 'FIST',
      name: 'FIST',
      slot: 1,
      ammoType: 'NONE',
      ammoCost: 0,
      refireTime: 0.38,
      idleSprite: 'WEAPON_FIST_IDLE',
      fireSprite: 'WEAPON_FIST_PUNCH',
      flashDuration: 0.15,
      soundFire: 'DSCLAW',
    },
    CHAINSAW: {
      id: 'CHAINSAW',
      name: 'CHAINSAW',
      slot: 1,
      ammoType: 'NONE',
      ammoCost: 0,
      refireTime: 0.12,
      idleSprite: 'WEAPON_FIST_IDLE',
      fireSprite: 'WEAPON_FIST_PUNCH',
      flashDuration: 0.08,
      soundFire: 'DSSAWFUL',
    },
    PISTOL: {
      id: 'PISTOL',
      name: 'PISTOL',
      slot: 2,
      ammoType: 'BULLETS',
      ammoCost: 1,
      refireTime: 0.34,
      idleSprite: 'WEAPON_PISTOL_IDLE',
      fireSprite: 'WEAPON_PISTOL_FIRE',
      flashDuration: 0.1,
      soundFire: 'DSPISTOL',
    },
    SHOTGUN: {
      id: 'SHOTGUN',
      name: 'SHOTGUN',
      slot: 3,
      ammoType: 'SHELLS',
      ammoCost: 1,
      refireTime: 0.85,
      idleSprite: 'WEAPON_SHOTGUN_IDLE',
      fireSprite: 'WEAPON_SHOTGUN_FIRE',
      flashDuration: 0.18,
      soundFire: 'DSSHOTGN',
    },
    SUPER_SHOTGUN: {
      id: 'SUPER_SHOTGUN',
      name: 'SUPER SHOTGUN',
      slot: 3,
      ammoType: 'SHELLS',
      ammoCost: 2,
      refireTime: 1.15,
      idleSprite: 'WEAPON_SSG_IDLE',
      fireSprite: 'WEAPON_SSG_FIRE',
      flashDuration: 0.22,
      soundFire: 'DSSG',
    },
    CHAINGUN: {
      id: 'CHAINGUN',
      name: 'CHAINGUN',
      slot: 4,
      ammoType: 'BULLETS',
      ammoCost: 1,
      refireTime: 0.1,
      idleSprite: 'WEAPON_CHAINGUN_IDLE',
      fireSprite: 'WEAPON_CHAINGUN_FIRE',
      flashDuration: 0.06,
      soundFire: 'DSPISTOL',
    },
    ROCKET_LAUNCHER: {
      id: 'ROCKET_LAUNCHER',
      name: 'ROCKET LAUNCHER',
      slot: 5,
      ammoType: 'ROCKETS',
      ammoCost: 1,
      refireTime: 0.65,
      idleSprite: 'WEAPON_ROCKET_IDLE',
      fireSprite: 'WEAPON_ROCKET_IDLE',
      flashDuration: 0.15,
      soundFire: 'DSFIRRKT',
    },
    PLASMA_RIFLE: {
      id: 'PLASMA_RIFLE',
      name: 'PLASMA RIFLE',
      slot: 6,
      ammoType: 'CELLS',
      ammoCost: 1,
      refireTime: 0.11,
      idleSprite: 'WEAPON_PLASMA_IDLE',
      fireSprite: 'WEAPON_PLASMA_IDLE',
      flashDuration: 0.08,
      soundFire: 'DSPLASMA',
    },
    BFG_9000: {
      id: 'BFG_9000',
      name: 'BFG 9000',
      slot: 7,
      ammoType: 'CELLS',
      ammoCost: 40,
      refireTime: 1.35,
      idleSprite: 'WEAPON_BFG_IDLE',
      fireSprite: 'WEAPON_BFG_IDLE',
      flashDuration: 0.35,
      soundFire: 'DSBFG',
    },
  };
}
