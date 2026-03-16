import { describe, it, expect } from 'vitest';
import {
  APP_VERSION,
  APP_NAME,
  APP_DEVELOPER,
  APP_YEAR,
  APP_COPYRIGHT,
} from '../../lib/appInfo';

describe('App Info Constants', () => {
  it('should export APP_VERSION as a valid string format', () => {
    expect(APP_VERSION).toBeDefined();
    expect(typeof APP_VERSION).toBe('string');
    expect(APP_VERSION.length).toBeGreaterThan(0);
    // Optionally check if it looks like semantic versioning (x.y.z)
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should export APP_NAME as a string', () => {
    expect(APP_NAME).toBeDefined();
    expect(typeof APP_NAME).toBe('string');
    expect(APP_NAME.length).toBeGreaterThan(0);
    expect(APP_NAME).toBe('Soclean Coordinación');
  });

  it('should export APP_DEVELOPER as a string', () => {
    expect(APP_DEVELOPER).toBeDefined();
    expect(typeof APP_DEVELOPER).toBe('string');
    expect(APP_DEVELOPER.length).toBeGreaterThan(0);
    expect(APP_DEVELOPER).toBe('Leo Macaris');
  });

  it('should export APP_YEAR as a number', () => {
    expect(APP_YEAR).toBeDefined();
    expect(typeof APP_YEAR).toBe('number');
    expect(APP_YEAR).toBeGreaterThan(2000);
    expect(APP_YEAR).toBe(2026);
  });

  it('should export APP_COPYRIGHT containing APP_YEAR and APP_NAME', () => {
    expect(APP_COPYRIGHT).toBeDefined();
    expect(typeof APP_COPYRIGHT).toBe('string');
    expect(APP_COPYRIGHT).toContain(APP_YEAR.toString());
    expect(APP_COPYRIGHT).toContain(APP_NAME);
    expect(APP_COPYRIGHT).toBe(`© ${APP_YEAR} ${APP_NAME}®. Todos los derechos reservados.`);
  });
});
