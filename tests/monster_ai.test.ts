import { describe, it, expect } from 'vitest';
import { Bestiary } from '../src/entities/Bestiary';

describe('Monster Bestiary & AI Finite State Machine', () => {

  it('should spawn monsters with authentic stats', () => {
    const imp = Bestiary.spawn('imp', 10.0, 10.0);
    expect(imp.stats.name).toBe('Imp');
    expect(imp.health).toBe(60);
    expect(imp.state).toBe('IDLE');

    const baron = Bestiary.spawn('baron', 12.0, 12.0);
    expect(baron.stats.name).toBe('Baron of Hell');
    expect(baron.health).toBe(1000);
  });

  it('should take damage, trigger pain state, and die/gib', () => {
    const imp = Bestiary.spawn('imp', 10.0, 10.0);
    imp.takeDamage(20);
    expect(imp.health).toBe(40);

    // Fatal damage -> Death
    const killed = imp.takeDamage(40);
    expect(killed).toBe(true);
    expect(imp.isAlive).toBe(false);
  });

  it('should switch targets and initiate monster infighting when damaged by another monster', () => {
    const imp1 = Bestiary.spawn('imp', 5.0, 5.0);
    const imp2 = Bestiary.spawn('imp', 6.0, 5.0);

    // imp1 attacks imp2
    imp2.takeDamage(10, imp1);
    expect(imp2.currentTarget).toBe(imp1);
    expect(['CHASE', 'PAIN']).toContain(imp2.state);
  });
});
