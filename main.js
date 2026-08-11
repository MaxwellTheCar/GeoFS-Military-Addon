// ==UserScript==
// @name         GeoFS Military Addon for 4
// @namespace    https://geo-fs.com/
// @version      0.0.1.6
// @description  Military addon. for better GeoFS military experience
// @author       Maxwell_The_Cat
// @match        https://www.geo-fs.com/geofs.php*
// @match        https://beta.geo-fs.com/geofs.php*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function waitForGeofs(cb) {
    const t = setInterval(() => {
      if (
        window.geofs && geofs.aircraft && geofs.aircraft.instance &&
        geofs.api && geofs.api.viewer &&
        window.Cesium && Cesium.SceneTransforms &&
        window.ui && window.multiplayer && multiplayer.contrailEmitters
      ) { clearInterval(t); cb(); }
    }, 500);
  }

  waitForGeofs(init);

  function init() {
    console.log('%c[Missile Addon v9.5] Ready.', 'color:lime;font-family:monospace');

    const BASE = 'https://raw.githubusercontent.com/amrsherif2422011-cloud/REALADDONMODELS/main/';

    function lodUrls(name) {
      return [
        `${BASE}${name}.glb`,
        `${BASE}${name}-LOD1.glb`,
        `${BASE}${name}-LOD2.glb`,
        `${BASE}${name}-LOD3.glb`,
        `${BASE}${name}-LOD4.glb`,
      ];
    }

    // ── Missile definitions ───────────────────────────────────────────────
    const MISSILE_DEFS = [
      { name: 'AIM-9',   counter: 'flares', lod: lodUrls('AIM-9')   },
      { name: 'AIM-9C',  counter: 'chaff',  lod: lodUrls('AIM-9C')  },
      { name: 'AIM-120', counter: 'chaff',  lod: lodUrls('AIM-120') },
      { name: 'R-27EA',  counter: 'chaff',  lod: lodUrls('R-27EA')  },
      { name: 'R-27R',   counter: 'chaff',  lod: lodUrls('R-27R')   },
      { name: 'R-27T',   counter: 'flares', lod: lodUrls('R-27T')   },
      { name: 'R-33',    counter: 'chaff',  lod: lodUrls('R-33')    },
      { name: 'R-73',    counter: 'flares', lod: lodUrls('R-73')    },
      { name: 'R-77',    counter: 'chaff',  lod: lodUrls('R-77')    },
    ];

    // LOD distance thresholds (metres from camera)
    const LOD_DISTS = [150, 400, 1000, 3000]; // LOD0<150, LOD1<400, LOD2<1000, LOD3<3000, hidden>=3000
    const LOD_PERF_CAP = 50; // if >50 models below 400m, bump LOD0->1, LOD1->2

    // ── Aircraft hardpoint configs ────────────────────────────────────────
    const AIRCRAFT_HARDPOINTS = {
      '18': { // Su-35
        maxMissiles: 14, maxTypes: 3,
        slots: [
          { r:  2.8, f: -1,   u: 0,    hasPylon: true  },
          { r:  4.0, f: -2,   u: 0,    hasPylon: true  },
          { r:  5.2, f: -2.5, u: 0,    hasPylon: true  },
          { r: -2.8, f: -1,   u: 0,    hasPylon: true  },
          { r: -4.0, f: -2,   u: 0,    hasPylon: true  },
          { r: -5.2, f: -2.5, u: 0,    hasPylon: true  },
          { r:  7.2, f: -2.0, u: 0,    hasPylon: false },
          { r: -7.2, f: -2.0, u: 0,    hasPylon: false },
          { r:  1.2, f:  0,   u: -1,   hasPylon: false },
          { r: -1.2, f:  0,   u: -1,   hasPylon: false },
          { r:  1.2, f: -5,   u: -1,   hasPylon: false },
          { r: -1.2, f: -5,   u: -1,   hasPylon: false },
          { r:  0.4, f:  1,   u: -0.5, hasPylon: false },
          { r: -0.4, f:  1,   u: -0.5, hasPylon: false },
        ],
      },
      '7': { // F-16
        maxMissiles: 6, maxTypes: 3,
        slots: [
          { r:  2.5, f: -0.5, u: -0.2, hasPylon: true  },
          { r:  4.0, f: -2,   u: -0.2, hasPylon: true  },
          { r: -2.5, f: -0.5, u: -0.2, hasPylon: true  },
          { r: -4.0, f: -2,   u: -0.2, hasPylon: true  },
          { r:  5.3, f: -2,   u: 0,    hasPylon: false },
          { r: -5.3, f: -2,   u: 0,    hasPylon: false },
        ],
      },
      '27': { // F/A-18
        maxMissiles: 8, maxTypes: 3,
        slots: [
          { r:  2.5, f: -1,   u: -0.5,    hasPylon: true  },
          { r:  4.2, f: -1.5, u: -0.5,    hasPylon: true  },
          { r:  5.8, f: -2,   u: -0.5,    hasPylon: true  },
          { r: -2.5, f: -1,   u: -0.5,    hasPylon: true  },
          { r: -4.2, f: -1.5, u: -0.5,    hasPylon: true  },
          { r: -5.8, f: -2,   u: -0.5,    hasPylon: true  },
          { r:  6.9, f: -2.5, u: -0.25,    hasPylon: false },
          { r: -6.9, f: -2.5, u: -0.25,    hasPylon: false },
        ],
      },
      '29': { // Rafale
        maxMissiles: 6, maxTypes: 3,
        slots: [
          { r:  2.2, f: -1.5, u: -0.5,    hasPylon: true  },
          { r:  3.8, f: -2,   u: -0.53,    hasPylon: true  },
          { r: -2.2, f: -1.5, u: -0.5,    hasPylon: true  },
          { r: -3.8, f: -2,   u: -0.53,    hasPylon: true  },
          { r:  5.1, f: -3,   u: -0.25,    hasPylon: false },
          { r: -5.1, f: -3,   u: -0.25,    hasPylon: false },
        ],
      },
    };

    // ── Loadout state ─────────────────────────────────────────────────────
    let loadout = [
      { ...MISSILE_DEFS.find(m => m.name === 'AIM-120'), count: 5 },
      { ...MISSILE_DEFS.find(m => m.name === 'R-77'),    count: 5 },
      { ...MISSILE_DEFS.find(m => m.name === 'R-73'),    count: 4 },
    ];
    let activeSlotIdx = 0;

    function getFlatLoadout() {
      const flat = [];
      loadout.forEach(slot => { for (let i = 0; i < slot.count; i++) flat.push(slot); });
      return flat;
    }

    function getNextMissile() {
      if (loadout[activeSlotIdx] && loadout[activeSlotIdx].count > 0) return loadout[activeSlotIdx];
      for (const slot of loadout) { if (slot.count > 0) return slot; }
      return null;
    }

    function consumeMissile() {
      let slot = loadout[activeSlotIdx];
      if (!slot || slot.count === 0) slot = loadout.find(s => s.count > 0);
      if (!slot) return;
      slot.count--;

      for (let i = hpSlots.length - 1; i >= 0; i--) {
        if (hpSlots[i].missile && hpSlots[i].missile.name === slot.name) {
          hpSlots[i].missile = null;
          hpSlots[i].lods.forEach(m => { if (m) m.show = false; });
          break;
        }
      }
      if (slot.count === 0) {
        loadout = loadout.filter(s => s.count > 0);
        activeSlotIdx = Math.min(activeSlotIdx, loadout.length - 1);
      }
    }

    function totalMissiles() { return loadout.reduce((s, slot) => s + slot.count, 0); }

    function cycleSlot(dir) {
      if (loadout.length === 0) return;
      activeSlotIdx = (activeSlotIdx + dir + loadout.length) % loadout.length;
      activeMissile = loadout[activeSlotIdx];
      updateHUD();
      showNotif(`Selected: ${activeMissile.name}`, '#00ff41');
    }

    // ── Hardpoint model system ────────────────────────────────────────────
    // Each slot has 5 LOD models preloaded + 1 pylon
    // hpSlots[i] = { lods: [model0..4], pylon, missile: ref or null }
    let hpSlots = [];

    function getHPConfig() {
      return AIRCRAFT_HARDPOINTS[geofs.aircraft.instance.id] || null;
    }

    function createPylonPrimitive(callback) {
      Cesium.Model.fromGltfAsync({
        url: 'https://raw.githubusercontent.com/amrsherif2422011-cloud/REALADDONMODELS/main/hardpoints.glb',
        minimumPixelSize: 32,
        maximumScale: 500,
        modelMatrix: Cesium.Matrix4.IDENTITY.clone(),
      }).then(model => {
        geofs.api.viewer.scene.primitives.add(model);
        callback(model);
      }).catch(() => callback(null));
    }

    function rebuildHardpointModels() {
      // Destroy existing
      hpSlots.forEach(slot => {
        slot.lods.forEach(m => { try { geofs.api.viewer.scene.primitives.remove(m); } catch(e) {} });
        if (slot.pylon) try { geofs.api.viewer.scene.primitives.remove(slot.pylon); } catch(e) {}
      });
      hpSlots = [];

      const cfg = getHPConfig();
      if (!cfg) return;

      const flat = getFlatLoadout();

      cfg.slots.forEach((slotCfg, i) => {
        const missile = flat[i] || null;
        const slotObj = { lods: [], pylon: null, missile, cfg: slotCfg, activeLod: -1 };

        // Pylon — async GLB load via callback
        if (slotCfg.hasPylon) {
          createPylonPrimitive(model => { slotObj.pylon = model; });
        }
        if (missile && missile.lod) {
          missile.lod.forEach((url, li) => {
            Cesium.Model.fromGltfAsync({
              url,
              minimumPixelSize: 32,
              maximumScale: 500,
              modelMatrix: Cesium.Matrix4.IDENTITY.clone(),
            }).then(model => {
              model.show = false;
              geofs.api.viewer.scene.primitives.add(model);
              slotObj.lods[li] = model;
            });
          });
        }

        hpSlots[i] = slotObj;
      });
    }

    // ── Frame callback — LOD + position update ────────────────────────────
    geofs.api.addFrameCallback(function() {
      const cfg = getHPConfig();
      if (!cfg) return;

      const lla    = geofs.aircraft.instance.llaLocation;
      const origin = Cesium.Cartesian3.fromDegrees(lla[1], lla[0], lla[2]);
      const enuToEcef = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
      const wr     = geofs.aircraft.instance.object3d.worldRotation;

      const rE = Cesium.Cartesian3.normalize(Cesium.Matrix4.multiplyByPointAsVector(enuToEcef, new Cesium.Cartesian3(wr[0][0], wr[0][1], wr[0][2]), new Cesium.Cartesian3()), new Cesium.Cartesian3());
      const fE = Cesium.Cartesian3.normalize(Cesium.Matrix4.multiplyByPointAsVector(enuToEcef, new Cesium.Cartesian3(wr[1][0], wr[1][1], wr[1][2]), new Cesium.Cartesian3()), new Cesium.Cartesian3());
      const uE = Cesium.Cartesian3.normalize(Cesium.Matrix4.multiplyByPointAsVector(enuToEcef, new Cesium.Cartesian3(wr[2][0], wr[2][1], wr[2][2]), new Cesium.Cartesian3()), new Cesium.Cartesian3());

      const rot = new Cesium.Matrix3(
        rE.x, fE.x, uE.x,
        rE.y, fE.y, uE.y,
        rE.z, fE.z, uE.z
      );

      const cam    = geofs.api.viewer.scene.camera;
      const camPos = cam.position;
      const camDir = cam.direction;

      let below400 = 0;
      hpSlots.forEach(slot => {
        if (!slot.missile) return;
        const o = slot.cfg;
        const wx = origin.x + rE.x*o.r + fE.x*o.f + uE.x*o.u;
        const wy = origin.y + rE.y*o.r + fE.y*o.f + uE.y*o.u;
        const wz = origin.z + rE.z*o.r + fE.z*o.f + uE.z*o.u;
        const dx = wx - camPos.x, dy = wy - camPos.y, dz = wz - camPos.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < 400) below400++;
      });
      const perfBump = below400 > LOD_PERF_CAP ? 1 : 0;

      hpSlots.forEach(slot => {
        const o = slot.cfg;
        const wx = origin.x + rE.x*o.r + fE.x*o.f + uE.x*o.u;
        const wy = origin.y + rE.y*o.r + fE.y*o.f + uE.y*o.u;
        const wz = origin.z + rE.z*o.r + fE.z*o.f + uE.z*o.u;
        const translation = new Cesium.Cartesian3(wx, wy, wz);
        const mat = Cesium.Matrix4.fromRotationTranslation(rot, translation);

        if (slot.pylon) slot.pylon.modelMatrix = mat;
        if (!slot.missile || slot.lods.length === 0) return;

        const dx   = wx - camPos.x, dy = wy - camPos.y, dz = wz - camPos.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        const dotX = dx/dist, dotY = dy/dist, dotZ = dz/dist;
        const dot  = dotX*camDir.x + dotY*camDir.y + dotZ*camDir.z;
        const behindCamera = dot < -0.1;

        if (dist >= 3000 || behindCamera) {
          slot.lods.forEach(m => { if (m) m.show = false; });
          return;
        }

        let lodIdx = 4;
        if      (dist < LOD_DISTS[0]) lodIdx = 0;
        else if (dist < LOD_DISTS[1]) lodIdx = 1;
        else if (dist < LOD_DISTS[2]) lodIdx = 2;
        else if (dist < LOD_DISTS[3]) lodIdx = 3;

        if (lodIdx < 2) lodIdx = Math.min(lodIdx + perfBump, 4);

        slot.lods.forEach((m, li) => {
          if (!m) return;
          if (li === lodIdx) {
            m.show = true;
            m.modelMatrix = mat;
          } else {
            m.show = false;
          }
        });
      });
    });

    rebuildHardpointModels();

    // ── Constants ─────────────────────────────────────────────────────────
    const RANGE_M       = 50000;
    const MISSILE_SPEED = 8000 * 1000 / 3600;
    const FIRE_COOLDOWN = 10000;
    const LOCK_PX       = 200;

    // ── State ─────────────────────────────────────────────────────────────
    let armed           = false;
    let lockedPlayer    = null;
    let activeMissile   = loadout[0] || null;
    let blinkTimer      = null;
    let outerBlinkTimer = null;
    let scanRAF         = null;
    let nosePos         = { x: 0, y: 0 };
    let lastFireTime    = 0;

    // ── Audio ─────────────────────────────────────────────────────────────
    const SOUND_URL = 'https://raw.githubusercontent.com/amrsherif2422011-cloud/missile-launch/main/freesound_community-missile-firing-fl-106655.mp3';
    let launchAudioBuffer = null;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    fetch(SOUND_URL)
      .then(r => r.arrayBuffer())
      .then(ab => audioCtx.decodeAudioData(ab))
      .then(buf => { launchAudioBuffer = buf; })
      .catch(e => console.warn('[Missile Addon] Could not load launch sound:', e));

    function playLaunchSound() {
      if (!launchAudioBuffer) return;
      try {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const src = audioCtx.createBufferSource();
        src.buffer = launchAudioBuffer;
        src.connect(audioCtx.destination);
        src.start(0);
      } catch (e) {}
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    function isOnScreen(p) {
      return p && p.x >= 0 && p.y >= 0 &&
             p.x <= window.innerWidth && p.y <= window.innerHeight;
    }

    function getLivePosition(id) {
      try {
        const user = multiplayer.users && multiplayer.users[id];
        if (user && user.referencePoint && user.referencePoint.lla) {
          const lla = user.referencePoint.lla;
          if (lla[0] && lla[1]) return { lat: lla[0], lon: lla[1], altMeters: lla[2] || 3000 };
        }
        return null;
      } catch (e) { return null; }
    }

    function getPlayerLLA(marker, id) {
      if (id) { const live = getLivePosition(id); if (live) return live; }
      try {
        const ll = marker._marker._latlng;
        if (!ll) return null;
        const label = marker.label || '';
        const flM   = label.match(/FL(\d+)/);
        const ftM   = label.match(/([\d.]+)ft/);
        const altM  = flM ? parseInt(flM[1]) * 100 * 0.3048
                    : ftM ? parseFloat(ftM[1]) * 0.3048 : 3000;
        return { lat: ll.lat, lon: ll.lng, altMeters: altM };
      } catch (e) { return null; }
    }

    function getCallsign(marker) {
      const label = marker.label || '';
      return label.split('<br/>')[0].replace(/<[^>]+>/g, '').trim() || 'UNKNOWN';
    }

    function haversineM(lat1, lon1, lat2, lon2) {
      const R    = 6371000;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a    = Math.sin(dLat/2)**2 +
                   Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
                   Math.sin(dLon/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    function getNoseScreenPos() {
      try {
        const scene  = geofs.api.viewer.scene;
        const lla    = geofs.aircraft.instance.llaLocation;
        const wr     = geofs.aircraft.instance.object3d.worldRotation;
        const origin = Cesium.Cartesian3.fromDegrees(lla[1], lla[0], lla[2]);
        const enu    = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
        const fE = Cesium.Cartesian3.normalize(
          Cesium.Matrix4.multiplyByPointAsVector(enu,
            new Cesium.Cartesian3(wr[1][0], wr[1][1], wr[1][2]),
            new Cesium.Cartesian3()),
          new Cesium.Cartesian3()
        );
        const nosePoint = new Cesium.Cartesian3(
          origin.x + fE.x * 500000,
          origin.y + fE.y * 500000,
          origin.z + fE.z * 500000
        );
        const screen = Cesium.SceneTransforms.worldToWindowCoordinates(scene, nosePoint);
        if (!screen || isNaN(screen.x) || isNaN(screen.y)) return null;
        return screen;
      } catch (e) { return null; }
    }

    function getPlayerScreenPos(marker, id) {
      try {
        const lla = getPlayerLLA(marker, id);
        if (!lla) return null;
        return Cesium.SceneTransforms.worldToWindowCoordinates(
          geofs.api.viewer.scene,
          Cesium.Cartesian3.fromDegrees(lla.lon, lla.lat, lla.altMeters)
        ) || null;
      } catch (e) { return null; }
    }

    function screenDist(a, b) {
      return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }

    function findClosestToNose(np) {
      const markers = window.ui && ui.playerMarkers;
      if (!markers || !np) return null;
      const myLLA = geofs.aircraft.instance.llaLocation;
      let best = null, bestSD = LOCK_PX;
      Object.entries(markers).forEach(([id, marker]) => {
        if (!marker || !marker._marker) return;
        const lla = getPlayerLLA(marker, id);
        if (!lla) return;
        if (haversineM(myLLA[0], myLLA[1], lla.lat, lla.lon) > RANGE_M) return;
        const sp = getPlayerScreenPos(marker, id);
        if (!sp) return;
        const sd = screenDist(sp, np);
        if (sd < bestSD) { bestSD = sd; best = { id, callsign: getCallsign(marker), marker }; }
      });
      return best;
    }

    // ── Missile smoke ─────────────────────────────────────────────────────
    function fireMissileSmoke(startLLA, target, onImpact) {
      const anchor = { lla: [startLLA[0], startLLA[1], startLLA[2], 0, 0, 0] };
      let speed    = 1500;
      const MAX_SPEED = MISSILE_SPEED;
      const ACCEL     = 250;

      const emitter = new geofs.fx.ParticleEmitter(Object.assign({},
        multiplayer.contrailEmitters[1], {
          anchor, duration: 99999999, rate: 0.08, life: 10000,
          size: [8, 22], startOpacity: 1.0, endOpacity: 0.0,
        }
      ));

      const viewer = geofs.api.viewer;
      let curLat = startLLA[0], curLon = startLLA[1], curAlt = startLLA[2];

      const missileEntity = viewer.entities.add({
        position: new Cesium.CallbackProperty(
          () => Cesium.Cartesian3.fromDegrees(curLon, curLat, curAlt), false),
        orientation: new Cesium.CallbackProperty(() => {
          try {
            const live = getLivePosition(target.id);
            const tLat = live ? live.lat       : curLat;
            const tLon = live ? live.lon       : curLon;
            const tAlt = live ? live.altMeters : curAlt;
            const from = Cesium.Cartesian3.fromDegrees(curLon, curLat, curAlt);
            const to   = Cesium.Cartesian3.fromDegrees(tLon, tLat, tAlt);
            const dir  = Cesium.Cartesian3.normalize(
              Cesium.Cartesian3.subtract(to, from, new Cesium.Cartesian3()),
              new Cesium.Cartesian3());
            const up   = new Cesium.Cartesian3(0, 0, 1);
            const axis = Cesium.Cartesian3.normalize(
              Cesium.Cartesian3.cross(up, dir, new Cesium.Cartesian3()),
              new Cesium.Cartesian3());
            const angle = Math.acos(Math.max(-1, Math.min(1, Cesium.Cartesian3.dot(up, dir))));
            if (Cesium.Cartesian3.magnitude(axis) < 0.0001) return Cesium.Quaternion.IDENTITY;
            return Cesium.Quaternion.fromAxisAngle(axis, angle);
          } catch(e) { return Cesium.Quaternion.IDENTITY; }
        }, false),
        cylinder: {
          length: 5.0, topRadius: 0.12, bottomRadius: 0.22,
          material: Cesium.Color.fromCssColorString('#dddddd'), outline: false,
        },
      });

      const TICK_MS = 50;
      let finished  = false;

      const moveInterval = setInterval(() => {
        if (finished) return;
        speed = Math.min(MAX_SPEED, speed + ACCEL * (TICK_MS / 1000));
        const stepM = speed * (TICK_MS / 1000);
        const live  = getLivePosition(target.id);
        const tLat  = live ? live.lat       : curLat;
        const tLon  = live ? live.lon       : curLon;
        const tAlt  = live ? live.altMeters : curAlt;
        const distM = haversineM(curLat, curLon, tLat, tLon);

        if (distM < stepM * 2) {
          finished = true;
          clearInterval(moveInterval);
          try { viewer.entities.remove(missileEntity); } catch(e) {}
          try { emitter.rate = 0; } catch(e) {}
          setTimeout(() => { try { emitter.destroy(); } catch(e) {} }, 10000);
          onImpact();
          return;
        }
        const ratio = stepM / Math.max(distM, 1);
        curLat += (tLat - curLat) * ratio;
        curLon += (tLon - curLon) * ratio;
        curAlt += (tAlt - curAlt) * ratio;
        anchor.lla[0] = curLat; anchor.lla[1] = curLon; anchor.lla[2] = curAlt;
      }, TICK_MS);

      setTimeout(() => {
        if (!finished) {
          finished = true; clearInterval(moveInterval);
          try { viewer.entities.remove(missileEntity); } catch(e) {}
          try { emitter.rate = 0; } catch(e) {}
          setTimeout(() => { try { emitter.destroy(); } catch(e) {} }, 10000);
        }
      }, 60000);
    }

    // ── UI: Reticle ───────────────────────────────────────────────────────
    const reticle = document.createElement('div');
    Object.assign(reticle.style, {
      position: 'fixed', width: '40px', height: '40px',
      border: '2px solid rgba(255,255,255,0.8)', borderRadius: '50%',
      pointerEvents: 'none', display: 'none',
      zIndex: '999999', transform: 'translate(-50%, -50%)',
    });

    const reticleOuter = document.createElement('div');
    Object.assign(reticleOuter.style, {
      position: 'fixed', width: '70px', height: '70px',
      border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: '50%',
      pointerEvents: 'none', display: 'none',
      zIndex: '999998', transform: 'translate(-50%, -50%)',
    });

    const lockLabel = document.createElement('div');
    Object.assign(lockLabel.style, {
      position: 'absolute', top: '46px', left: '50%',
      transform: 'translateX(-50%)', color: 'white',
      fontSize: '10px', fontFamily: 'monospace',
      whiteSpace: 'nowrap', display: 'none',
    });
    reticle.appendChild(lockLabel);
    document.body.appendChild(reticleOuter);
    document.body.appendChild(reticle);

    // ── UI: HUD ───────────────────────────────────────────────────────────
    const hud = document.createElement('div');
    Object.assign(hud.style, {
      position: 'fixed', top: '80px', right: '16px',
      background: 'rgba(0,0,0,0.95)', border: '1px solid #00ff41',
      color: '#00ff41',
      fontFamily: '"OCR A Extended", "Lucida Console", monospace',
      fontSize: '12px', padding: '10px 14px',
      zIndex: '999999', pointerEvents: 'none',
      lineHeight: '1.7', display: 'none', minWidth: '220px',
      textShadow: '0 0 6px rgba(0,255,65,0.4)',
    });
    document.body.appendChild(hud);

    // ── UI: ARM button ────────────────────────────────────────────────────
    const armBtn = document.createElement('button');
    Object.assign(armBtn.style, {
      position: 'fixed', top: '80px', right: '16px',
      background: '#001a00', border: '2px solid #00ff41',
      color: '#00ff41',
      fontFamily: '"OCR A Extended", "Lucida Console", monospace',
      fontSize: '14px', fontWeight: 'bold',
      padding: '10px 24px', zIndex: '999999', cursor: 'pointer',
      letterSpacing: '2px', display: 'none',
      textShadow: '0 0 8px rgba(0,255,65,0.6)',
      boxShadow: '0 0 10px rgba(0,255,65,0.2)',
    });
    armBtn.textContent = '◈ ARM LOADOUT';
    document.body.appendChild(armBtn);

    // ── UI: Loadout panel ─────────────────────────────────────────────────
    const armPanel = document.createElement('div');
    Object.assign(armPanel.style, {
      position: 'fixed', top: '80px', right: '16px',
      background: 'rgba(0,0,0,0.95)', border: '1px solid #00ff41',
      color: '#00ff41',
      fontFamily: '"OCR A Extended", "Lucida Console", monospace',
      fontSize: '12px', padding: '12px 16px',
      zIndex: '999999', display: 'none', minWidth: '280px',
      textShadow: '0 0 6px rgba(0,255,65,0.4)',
    });
    document.body.appendChild(armPanel);

    function buildArmPanel() {
      const cfg  = getHPConfig();
      if (!cfg) return;
      const maxM = cfg.maxMissiles;
      const maxT = cfg.maxTypes;
      const used = totalMissiles();

      let html = `<div style="margin-bottom:10px;letter-spacing:1px;font-size:13px">◈ LOADOUT — ${used}/${maxM} | MAX ${maxT} TYPES</div>`;

      loadout.forEach((slot, si) => {
        html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">`;
        html += `<select id="ls-name-${si}" style="background:#001a00;border:1px solid #00ff41;color:#00ff41;font-size:11px;padding:3px;flex:1">`;
        MISSILE_DEFS.forEach(m => {
          html += `<option value="${m.name}" ${m.name === slot.name ? 'selected' : ''}>${m.name}</option>`;
        });
        html += `</select>`;
        html += `<input id="ls-cnt-${si}" type="number" min="0" max="${maxM}" value="${slot.count}"
          style="width:44px;background:#001a00;border:1px solid #00ff41;color:#00ff41;font-size:11px;padding:3px;text-align:center">`;
        html += `<button id="ls-del-${si}" style="background:#001a00;border:1px solid #ff4444;color:#ff4444;font-size:10px;padding:2px 8px;cursor:pointer">✕</button>`;
        html += `</div>`;
      });

      if (loadout.length < maxT) {
        html += `<button id="ls-add" style="background:#001a00;border:1px solid #00ff41;color:#00ff41;font-size:10px;padding:3px 10px;cursor:pointer;margin-bottom:8px">+ ADD TYPE</button>`;
      }

      html += `<div style="display:flex;gap:8px;margin-top:8px">`;
      html += `<button id="ls-confirm" style="background:#003300;border:1px solid #00ff41;color:#00ff41;font-size:12px;padding:5px 16px;cursor:pointer;letter-spacing:1px;flex:1">CONFIRM</button>`;
      html += `<button id="ls-close" style="background:#001a00;border:1px solid #555;color:#555;font-size:12px;padding:5px 16px;cursor:pointer">✕</button>`;
      html += `</div>`;
      html += `<div id="ls-err" style="color:#ff4444;font-size:10px;margin-top:6px;display:none"></div>`;

      armPanel.innerHTML = html;

      loadout.forEach((_, si) => {
        document.getElementById(`ls-del-${si}`).addEventListener('click', () => {
          loadout.splice(si, 1);
          activeSlotIdx = Math.min(activeSlotIdx, loadout.length - 1);
          buildArmPanel();
        });
      });

      const addBtn = document.getElementById('ls-add');
      if (addBtn) addBtn.addEventListener('click', () => {
        if (loadout.length < maxT) {
          const taken = loadout.map(s => s.name);
          const next  = MISSILE_DEFS.find(m => !taken.includes(m.name));
          if (next) { loadout.push({ ...next, count: 0 }); buildArmPanel(); }
        }
      });

      document.getElementById('ls-confirm').addEventListener('click', () => {
        const err = document.getElementById('ls-err');
        const newLoadout = [];
        let total = 0, valid = true;

        loadout.forEach((_, si) => {
          const name  = document.getElementById(`ls-name-${si}`).value;
          const count = parseInt(document.getElementById(`ls-cnt-${si}`).value) || 0;
          const def   = MISSILE_DEFS.find(m => m.name === name);
          if (def) { newLoadout.push({ ...def, count }); total += count; }
        });

        const types = newLoadout.filter(s => s.count > 0).length;
        if (total > maxM)      { err.textContent = `MAX ${maxM} MISSILES`; err.style.display = 'block'; valid = false; }
        else if (types > maxT) { err.textContent = `MAX ${maxT} TYPES`;    err.style.display = 'block'; valid = false; }
        else if (total === 0)  { err.textContent = 'NO MISSILES LOADED';   err.style.display = 'block'; valid = false; }

        if (valid) {
          loadout = newLoadout.filter(s => s.count > 0);
          activeSlotIdx = 0;
          activeMissile = loadout[0] || null;
          rebuildHardpointModels();
          updateHUD();
          armPanel.style.display = 'none';
          showNotif('✔ LOADOUT CONFIRMED', '#00ff41');
        }
      });

      document.getElementById('ls-close').addEventListener('click', () => {
        armPanel.style.display = 'none';
      });
    }

    armBtn.addEventListener('click', () => {
      buildArmPanel();
      armPanel.style.display = armPanel.style.display === 'none' ? 'block' : 'none';
    });

    setInterval(() => {
      const ac = geofs.aircraft.instance;
      const onGround = !ac.airborne && ac.groundContact;
      const stopped  = ac.groundSpeed < 1;
      const show = onGround && stopped;

      if (show) {
        const hudBottom = hud.style.display !== 'none'
          ? hud.getBoundingClientRect().bottom + 8
          : 80;
        armBtn.style.top     = hudBottom + 'px';
        armBtn.style.display = 'block';
        if (armPanel.style.display === 'block') {
          armPanel.style.top = (hudBottom + armBtn.offsetHeight + 8) + 'px';
        }
      } else {
        armBtn.style.display   = 'none';
        armPanel.style.display = 'none';
      }
    }, 300);

    // ── UI: Target Destroyed ──────────────────────────────────────────────
    function showTargetDestroyed() {
      const banner = document.createElement('div');
      Object.assign(banner.style, {
        position: 'fixed', top: '58px', left: '50%',
        transform: 'translateX(-50%)', color: '#d93030',
        fontFamily: 'Arial Narrow, Arial, sans-serif',
        fontSize: '13px', fontWeight: 'bold',
        letterSpacing: '2px', textTransform: 'uppercase',
        textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff',
        zIndex: '999999', pointerEvents: 'none',
        opacity: '1', transition: 'opacity 0.6s ease', whiteSpace: 'nowrap',
      });
      banner.textContent = 'TARGET DESTROYED';
      document.body.appendChild(banner);
      setTimeout(() => { banner.style.opacity = '0'; }, 2000);
      setTimeout(() => { banner.remove(); }, 2700);
    }

    // ── UI helpers ────────────────────────────────────────────────────────
    function setColor(c) {
      reticle.style.borderColor      = c;
      reticleOuter.style.borderColor = c;
      lockLabel.style.color          = c;
    }

    function startBlink() {
      let v = true, vo = true;
      blinkTimer      = setInterval(() => { v  = !v;  reticle.style.opacity      = v  ? '0.8' : '0'; }, 500);
      outerBlinkTimer = setInterval(() => { vo = !vo; reticleOuter.style.opacity = vo ? '1'   : '0'; }, 750);
    }

    function stopBlink() {
      clearInterval(blinkTimer); clearInterval(outerBlinkTimer);
      reticle.style.opacity = '0.8'; reticleOuter.style.opacity = '1';
    }

    function lockOn(player) {
      lockedPlayer = player;
      lockLabel.textContent   = `LOCKED: ${player.callsign}`;
      lockLabel.style.display = 'block';
      stopBlink();
      reticle.style.borderColor      = 'red';
      reticleOuter.style.borderColor = 'rgba(255,0,0,0.35)';
      lockLabel.style.color          = 'red';
      updateHUD();
    }

    function unlock() {
      lockedPlayer = null;
      lockLabel.style.display = 'none';
      setColor('white'); startBlink(); updateHUD();
    }

    function updateHUD() {
      if (!armed) { hud.style.display = 'none'; return; }
      hud.style.display = 'block';
      const m     = activeMissile || getNextMissile();
      const now   = Date.now();
      const cd    = Math.max(0, Math.ceil((lastFireTime + FIRE_COOLDOWN - now) / 1000));
      const myLLA = geofs.aircraft.instance.llaLocation;
      let nearby  = 0;
      Object.entries(ui.playerMarkers || {}).forEach(([id, mk]) => {
        if (!mk || !mk._marker) return;
        const lla = getPlayerLLA(mk, id);
        if (lla && haversineM(myLLA[0], myLLA[1], lla.lat, lla.lon) <= RANGE_M) nearby++;
      });

      const loadoutStr = loadout.map((s, i) =>
        i === activeSlotIdx
          ? `<b style="color:#fff">▶${s.name}×${s.count}</b>`
          : `<span style="color:#00aa30">${s.name}×${s.count}</span>`
      ).join(' ');

      hud.innerHTML =
        `<b>◈ WEAPON SYSTEM</b><br>` +
        `Missile : <b>${m ? m.name : 'NONE'}</b><br>` +
        `Counter : <b>${m ? m.counter.toUpperCase() : '--'}</b><br>` +
        `Nearby  : <b>${nearby} (&lt;${RANGE_M/1000}km)</b><br>` +
        `<span style="font-size:10px">${loadoutStr}</span><br>` +
        (cd > 0 ? `Cooldown: <b style="color:orange">${cd}s</b><br>` : '') +
        (lockedPlayer
          ? `Lock    : <b style="color:red">● ${lockedPlayer.callsign}</b>`
          : `Lock    : <span style="color:#555">aim at nearby plane</span>`) +
        `<br><span style="color:#555">[L] disarm [Q] cycle [SHIFT] missile [ENTER] guns</span>`;
    }

    function showNotif(text, color) {
      const n = document.createElement('div');
      Object.assign(n.style, {
        position: 'fixed', top: '130px', left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)', color: color || 'white',
        fontFamily: 'monospace', fontSize: '13px',
        padding: '6px 18px', borderRadius: '3px',
        border: `1px solid ${color || 'white'}`,
        zIndex: '999999', pointerEvents: 'none', transition: 'opacity 0.5s',
      });
      n.textContent = text;
      document.body.appendChild(n);
      setTimeout(() => { n.style.opacity = '0'; }, 2400);
      setTimeout(() => { n.remove(); }, 3000);
    }

    // ── Fire sequence ─────────────────────────────────────────────────────
    function fireSequence() {
      if (!lockedPlayer) { showNotif('No lock — aim at a plane within range.', 'red'); return; }
      const now    = Date.now();
      const cdLeft = Math.ceil((lastFireTime + FIRE_COOLDOWN - now) / 1000);
      if (cdLeft > 0) { showNotif(`⏳ Wait ${cdLeft}s before firing again.`, 'orange'); return; }

      const missile = getNextMissile();
      if (!missile) { showNotif('NO MISSILES', 'red'); return; }

      activeMissile = missile;
      const target  = lockedPlayer;
      lastFireTime  = now;

      playLaunchSound();
      consumeMissile();
      updateHUD();

      const myLLA = [...geofs.aircraft.instance.llaLocation];
      fireMissileSmoke(myLLA, target, () => {
        const live = getLivePosition(target.id);
        spawnExplosion(
          live ? live.lat       : myLLA[0],
          live ? live.lon       : myLLA[1],
          live ? live.altMeters : myLLA[2]
        );
        showTargetDestroyed();
        activeMissile = getNextMissile();
        unlock(); updateHUD();
      });
    }

    // ── Toggle arm ────────────────────────────────────────────────────────
    function toggleArm() {
      armed = !armed;
      if (armed) {
        activeMissile = getNextMissile();
        reticle.style.display      = 'block';
        reticleOuter.style.display = 'block';
        lockLabel.style.display    = 'none';
        lockedPlayer = null;
        setColor('white'); startBlink(); updateHUD(); startScan();
        showNotif(`Armed: ${activeMissile ? activeMissile.name : 'NO MISSILES'}`, 'white');
      } else {
        reticle.style.display      = 'none';
        reticleOuter.style.display = 'none';
        hud.style.display          = 'none';
        stopBlink(); stopScan();
        lockedPlayer = null; activeMissile = null;
      }
    }

    // ── Scan loop ─────────────────────────────────────────────────────────
    function startScan() {
      if (scanRAF) return;
      let hudTick = 0;
      const tick = () => {
        if (!armed) { scanRAF = null; return; }
        const sp = getNoseScreenPos();
        if (sp) {
          nosePos = sp;
          reticle.style.left      = sp.x + 'px';
          reticle.style.top       = sp.y + 'px';
          reticleOuter.style.left = sp.x + 'px';
          reticleOuter.style.top  = sp.y + 'px';
        }
        const p = findClosestToNose(sp || nosePos);
        if (p && !lockedPlayer) { lockOn(p); }
        if (lockedPlayer) {
          const lsp = getPlayerScreenPos(lockedPlayer.marker, lockedPlayer.id);
          if (!isOnScreen(lsp)) unlock();
        } else if (!p && lockedPlayer) {
          const myLLA = geofs.aircraft.instance.llaLocation;
          const lla   = getPlayerLLA(lockedPlayer.marker, lockedPlayer.id);
          if (!lla || haversineM(myLLA[0], myLLA[1], lla.lat, lla.lon) > RANGE_M) unlock();
        }
        if (++hudTick > 60) { hudTick = 0; updateHUD(); }
        scanRAF = requestAnimationFrame(tick);
      };
      scanRAF = requestAnimationFrame(tick);
    }

    function stopScan() {
      if (scanRAF) { cancelAnimationFrame(scanRAF); scanRAF = null; }
    }

    // ── Keys ──────────────────────────────────────────────────────────────
    document.addEventListener('keydown', e => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'l' || e.key === 'L')           { e.preventDefault(); toggleArm(); }
      if (e.key === 'Shift' && armed)                { e.preventDefault(); fireSequence(); }
      if ((e.key === 'q' || e.key === 'Q') && armed) { e.preventDefault(); cycleSlot(1); }
      if (e.key === 'Enter')                         { e.preventDefault(); startGuns(); }
    });
    document.addEventListener('keyup', e => {
      if (e.key === 'Enter') stopGuns();
    });

    showNotif('🎯 GeoFS Military Addon v9.5 — L: arm | Q: cycle | SHIFT: missile | ENTER: guns', 'white');

    // ── GUN SYSTEM ────────────────────────────────────────────────────────
    const GUN_RATE    = 40;   // rounds per second
    const GUN_RANGE   = 1000; // metres before drop starts
    const GUN_FLOOR   = 3;    // metres AGL to disappear (≈10ft)
    let gunFiring     = false;
    let gunInterval   = null;

    let gunSmokeEmitter = null;

    function getGunMuzzleAnchor() {
      const lla = geofs.aircraft.instance.llaLocation;
      const wr  = geofs.aircraft.instance.object3d.worldRotation;
      const origin = Cesium.Cartesian3.fromDegrees(lla[1], lla[0], lla[2]);
      const enu = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
      const fE  = Cesium.Cartesian3.normalize(
        Cesium.Matrix4.multiplyByPointAsVector(enu, new Cesium.Cartesian3(wr[1][0], wr[1][1], wr[1][2]), new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
      );
      const muzzle = new Cesium.Cartesian3(
        origin.x + fE.x * 4,
        origin.y + fE.y * 4,
        origin.z + fE.z * 4
      );
      const carto = Cesium.Cartographic.fromCartesian(muzzle);
      return [
        Cesium.Math.toDegrees(carto.latitude),
        Cesium.Math.toDegrees(carto.longitude),
        carto.height,
      ];
    }

    const tracerCollection = new Cesium.PolylineCollection();
    geofs.api.viewer.scene.primitives.add(tracerCollection);

    function spawnTracer() {
      const ac  = geofs.aircraft.instance;
      const lla = ac.llaLocation;
      const wr  = ac.object3d.worldRotation;
      const origin = Cesium.Cartesian3.fromDegrees(lla[1], lla[0], lla[2]);
      const enu    = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
      const fE = Cesium.Cartesian3.normalize(
        Cesium.Matrix4.multiplyByPointAsVector(enu,
          new Cesium.Cartesian3(wr[1][0], wr[1][1], wr[1][2]),
          new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
      );

      const SPEED      = 1500; // m/s
      const TICK       = 16;   // ms
      const stepM      = SPEED * (TICK / 1000);
      const TRACER_LEN = 12;   // metres

      let hX = origin.x + fE.x * 6;
      let hY = origin.y + fE.y * 6;
      let hZ = origin.z + fE.z * 6;
      let distTravelled = 0;

      const line = tracerCollection.add({
        positions: [new Cesium.Cartesian3(hX,hY,hZ), new Cesium.Cartesian3(hX,hY,hZ)],
        width: 2,
        material: Cesium.Material.fromType('PolylineGlow', {
          glowPower: 0.25,
          color: Cesium.Color.fromCssColorString('#ff9955'),
        }),
      });

      const tick = setInterval(() => {
        distTravelled += stepM;
        hX += fE.x * stepM;
        hY += fE.y * stepM;
        hZ += fE.z * stepM;

        if (distTravelled > GUN_RANGE) {
          const excess   = distTravelled - GUN_RANGE;
          const dropRate = 9.8 * Math.pow(excess / SPEED, 1.5);
          hZ -= dropRate * stepM;
        }

        const carto = Cesium.Cartographic.fromCartesian(new Cesium.Cartesian3(hX, hY, hZ));
        if (carto.height < GUN_FLOOR || distTravelled > 3500) {
          clearInterval(tick);
          tracerCollection.remove(line);
          return;
        }

        line.positions = [
          new Cesium.Cartesian3(hX - fE.x*TRACER_LEN, hY - fE.y*TRACER_LEN, hZ - fE.z*TRACER_LEN),
          new Cesium.Cartesian3(hX, hY, hZ),
        ];
        const alpha = Math.max(0.2, 1 - distTravelled / 2500);
        line.material = Cesium.Material.fromType('PolylineGlow', {
          glowPower: 0.25,
          color: new Cesium.Color(1, 0.6, 0.33, alpha),
        });
      }, TICK);
    }

    function startGuns() {
      if (gunFiring) return;
      gunFiring = true;

      try {
        const mLLA = getGunMuzzleAnchor();
        const anchor = { lla: [...mLLA, 0, 0, 0] };
        gunSmokeEmitter = new geofs.fx.ParticleEmitter(Object.assign({},
          multiplayer.contrailEmitters[1], {
            anchor,
            duration:     99999999,
            rate:         0.15,
            life:         400,
            size:         [1, 3],
            startOpacity: 0.7,
            endOpacity:   0.0,
          }
        ));
        gunInterval = setInterval(() => {
          if (!gunFiring) return;
          const mLLA2 = getGunMuzzleAnchor();
          anchor.lla[0] = mLLA2[0];
          anchor.lla[1] = mLLA2[1];
          anchor.lla[2] = mLLA2[2];
          spawnTracer();
        }, 1000 / GUN_RATE);
      } catch(e) {
        gunInterval = setInterval(spawnTracer, 1000 / GUN_RATE);
      }
    }

    function stopGuns() {
      if (!gunFiring) return;
      gunFiring = false;
      clearInterval(gunInterval);
      gunInterval = null;
      if (gunSmokeEmitter) {
        try { gunSmokeEmitter.rate = 0; } catch(e) {}
        setTimeout(() => { try { gunSmokeEmitter.destroy(); } catch(e) {} gunSmokeEmitter = null; }, 1000);
      }
    }

    // ── RADAR — FIGHTER B-SCOPE WITH VHS ────────────────────────────────────
    const RANGES_NM = [40, 80, 160, 320];
    let rangeIdx = 1;
    let radarVis = true;
    let sweepX = 0;
    let sweepDir = 1;
    const SWEEP_SPEED = 1.4;
    const AZ_HALF = 60;
    let radarBlipPaint = {};
    let radarFrameCount = 0;
    let vhsNoisePhase = 0;
    let vhsTearActive = false, vhsTearY = 0, vhsTearH = 0, vhsTearShift = 0, vhsTearLife = 0;
    let vhsFloatBand = { y: 0, alpha: 0.05, speed: 0.4 };
    let radarMode = 'RWS'; // flips to STT for the frame a lock is drawn
    const barCount = 4;

    const radarContainer = document.createElement('div');
    Object.assign(radarContainer.style, {
      position: 'fixed', bottom: '20px', left: '20px',
      zIndex: '99999', fontFamily: 'monospace', userSelect: 'none',
      background: '#000',
      padding: '12px',
      border: '1px solid #1a3a1a',
    });
    document.body.appendChild(radarContainer);

    const radarHeader = document.createElement('div');
    Object.assign(radarHeader.style, {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      color: '#00cc44', fontSize: '11px', letterSpacing: '1.5px',
      marginBottom: '6px', borderBottom: '1px solid #0a2a0a',
      paddingBottom: '5px', cursor: 'move',
    });
    radarHeader.innerHTML =
      `<span>AN/APG-77 &#9632; B-SCOPE</span>` +
      `<div style="display:flex;gap:6px;align-items:center">` +
      `<span id="rdr-range" style="color:#00cc44;font-size:10px">80NM</span>` +
      `<button id="rdr-rng-btn" style="background:#001a00;border:1px solid #00aa33;color:#00cc44;font-family:monospace;font-size:9px;padding:2px 7px;cursor:pointer;letter-spacing:1px">RNG</button>` +
      `<button id="rdr-tog-btn" style="background:#001a00;border:1px solid #00aa33;color:#00cc44;font-family:monospace;font-size:9px;padding:2px 7px;cursor:pointer;letter-spacing:1px">HID</button>` +
      `</div>`;
    radarContainer.appendChild(radarHeader);

    // RW/RH describe the scope PLOT area only. The canvas itself is taller,
    // leaving room below the plot for the bezel readout rows — that extra
    // strip is included in applyVHS() so the text gets the same tape treatment.
    const RW = 360, RH = 300;
    const BEZEL_H = 46;
    const CANVAS_W = RW, CANVAS_H = RH + BEZEL_H;

    const radarCanvas = document.createElement('canvas');
    radarCanvas.width = CANVAS_W; radarCanvas.height = CANVAS_H;
    radarCanvas.style.display = 'block';
    radarContainer.appendChild(radarCanvas);
    const rctx = radarCanvas.getContext('2d');

    const radarFooter = document.createElement('div');
    Object.assign(radarFooter.style, {
      display: 'flex', justifyContent: 'space-between',
      color: '#00aa33', fontSize: '10px', letterSpacing: '1px',
      marginTop: '5px', borderTop: '1px solid #0a2a0a', paddingTop: '4px',
    });
    radarFooter.innerHTML = `<span id="rdr-count">0 CONTACTS</span><span id="rdr-alt">ALT: --</span>`;
    radarContainer.appendChild(radarFooter);

    function azToX(az) { return ((az + AZ_HALF) / (AZ_HALF * 2)) * RW; }
    function rangeToY(f) { return RH - f * RH; }

    function getContactAzRange(lla, myLLA) {
      const dLat = lla.lat - myLLA[0];
      const dLon = lla.lon - myLLA[1];
      const cosLat = Math.cos(myLLA[0] * Math.PI / 180);
      const northM = dLat * 111320;
      const eastM  = dLon * 111320 * cosLat;
      const hdgRad = (geofs.aircraft.instance.htr[0] || 0) * Math.PI / 180;
      const fwd  =  northM * Math.cos(hdgRad) + eastM * Math.sin(hdgRad);
      const rgt  = -northM * Math.sin(hdgRad) + eastM * Math.cos(hdgRad);
      const distM = Math.sqrt(northM*northM + eastM*eastM);
      const azDeg = Math.atan2(rgt, Math.max(fwd, 1)) * 180 / Math.PI;
      return { az: azDeg, distM };
    }

    // Stable fake squawk per contact id, so it doesn't flicker frame to frame
    const squawkCache = {};
    function getSquawk(id) {
      if (!squawkCache[id]) {
        squawkCache[id] = (1000 + Math.abs(
          id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
        ) % 7000).toString().padStart(4, '0');
      }
      return squawkCache[id];
    }

    function updateBScopeBlips() {
      const myLLA = geofs.aircraft.instance.llaLocation;
      const rangeM = RANGES_NM[rangeIdx] * 1852;
      const now = performance.now();
      Object.entries(multiplayer.users || {}).forEach(([id, u]) => {
        const lla = u.referencePoint && u.referencePoint.lla;
        if (!lla || !lla[0]) return;
        const contact = { lat: lla[0], lon: lla[1] };
        const { az, distM } = getContactAzRange(contact, myLLA);
        if (distM > rangeM || Math.abs(az) > AZ_HALF) return;
        const px = azToX(az);
        const py = rangeToY(distM / rangeM);
        if (Math.abs(px - sweepX) < 16) {
          radarBlipPaint[id] = {
            x: px, y: py,
            callsign: (u.callsign || '----').substring(0, 7),
            alt: lla[2] || 0,
            locked: lockedPlayer && lockedPlayer.id === id,
            paintTime: now,
          };
        }
      });
    }

    function drawBezel(rangeNM) {
      rctx.fillStyle = '#004400'; rctx.font = '9px Courier New';

      rctx.textAlign = 'left';
      rctx.fillText('OPR', 4, 10);
      rctx.fillText('C11', 4, 20);
      rctx.fillText(radarMode, 34, 10);
      rctx.textAlign = 'right';
      rctx.fillText('SIL', RW - 46, 10);
      rctx.fillText('ERASE', RW - 4, 10);
      rctx.textAlign = 'left';

      for (let k = 0; k < barCount; k++) {
        const by = 26 + k * 9;
        rctx.strokeStyle = '#006600';
        rctx.beginPath(); rctx.moveTo(0, by); rctx.lineTo(6, by); rctx.stroke();
      }
      rctx.fillStyle = '#004400';
      rctx.fillText(barCount + 'BAR', 2, 26 + barCount * 9 + 10);

      rctx.fillText('\u2191', RW - 14, RH * 0.3);
      rctx.fillText('\u2193', RW - 14, RH * 0.6);
      rctx.fillText('RSET', RW - 30, RH * 0.75);
      rctx.fillText('NCTR', RW - 30, RH * 0.85);

      const hdg = Math.round(geofs.aircraft.instance.htr[0] || 0);
      const spdKts = Math.round((geofs.aircraft.instance.groundSpeed || 0) * 1.94384);
      const mach = (geofs.aircraft.instance.trueSpeed
        ? geofs.aircraft.instance.trueSpeed / 340.3
        : 0).toFixed(2);
      const alt = Math.round(geofs.aircraft.instance.llaLocation[2] * 3.28084);

      rctx.fillStyle = '#004400';
      rctx.fillText(`BRA ${String(hdg).padStart(3,'0')}\u00B0/${rangeNM}`, 4, RH + 22);
      rctx.fillText('MODE', RW * 0.32, RH + 22);
      rctx.fillText(`CHAN ${((geofs.aircraft.instance.id || 1) * 3 % 20) + 1}`, RW * 0.55, RH + 22);
      rctx.fillText('DATA', RW - 40, RH + 22);
      rctx.fillText(`M ${mach}`, 4, RH + 34);
      rctx.fillText(`${spdKts}KT`, RW * 0.32, RH + 34);
      rctx.fillText(`${alt}FT`, RW * 0.55, RH + 34);
      rctx.fillText(barCount + 'B/' + rangeNM + 'NM', RW - 60, RH + 34);
    }

    function drawBlipRich(id, b, alpha, now) {
      rctx.globalAlpha = alpha;
      const myAlt = geofs.aircraft.instance.llaLocation[2];
      const dAlt = b.alt - myAlt;
      const altSym = dAlt > 500 ? '\u25B2' : dAlt < -500 ? '\u25BC' : '\u2500';

      if (b.locked) {
        radarMode = 'STT';
        const blink = Math.sin(now / 180) > 0;
        rctx.strokeStyle = '#ff3333'; rctx.lineWidth = 1;
        rctx.strokeRect(b.x - 9, b.y - 6, 18, 12);
        if (blink) {
          rctx.save();
          rctx.translate(b.x, b.y);
          rctx.rotate(Math.PI / 4);
          rctx.strokeRect(-4, -4, 8, 8);
          rctx.restore();
        }
        rctx.fillStyle = '#ff5555';
        rctx.fillRect(b.x - 2, b.y - 2, 4, 4);

        const closure = Math.round(
          (geofs.aircraft.instance.groundSpeed || 0) * 1.94384 * 0.7 + 120
        );
        rctx.globalAlpha = alpha * 0.9;
        rctx.fillStyle = '#ff8888'; rctx.font = '9px Courier New';
        rctx.fillText(b.callsign, b.x + 12, b.y - 6);
        rctx.fillText(altSym + ' ' + getSquawk(id), b.x + 12, b.y + 4);
        rctx.fillText('CLO ' + closure, b.x + 12, b.y + 14);
      } else {
        rctx.fillStyle = '#00ff55';
        rctx.fillRect(b.x - 3, b.y - 2, 6, 4);
        rctx.globalAlpha = alpha * 0.9;
        rctx.fillStyle = '#00cc44'; rctx.font = '9px Courier New';
        rctx.fillText(b.callsign, b.x + 6, b.y - 3);
        rctx.fillText(altSym, b.x + 6, b.y + 7);
      }
      rctx.globalAlpha = 1;
    }

    function applyVHS() {
      const CW = CANVAS_W, CH = CANVAS_H;
      const imageData = rctx.getImageData(0, 0, CW, CH);
      const d = imageData.data;

      // Floating band drift
      vhsFloatBand.y += vhsFloatBand.speed;
      if (vhsFloatBand.y > CH + 20) {
        vhsFloatBand.y = -20;
        vhsFloatBand.alpha = 0.04 + Math.random() * 0.07;
        vhsFloatBand.speed = 0.3 + Math.random() * 0.5;
      }
      const bTop = Math.round(vhsFloatBand.y);
      const bH   = 6 + (Math.random() * 4) | 0;
      for (let y = Math.max(0, bTop); y < Math.min(CH, bTop + bH); y++) {
        const shift = ((Math.random() - 0.5) * 8) | 0;
        if (shift > 0) {
          for (let x = CW - 1; x >= shift; x--) {
            const dst = (y * CW + x) * 4, src = (y * CW + x - shift) * 4;
            d[dst] = d[src]; d[dst+1] = d[src+1]; d[dst+2] = d[src+2];
          }
        } else if (shift < 0) {
          for (let x = 0; x < CW + shift; x++) {
            const dst = (y * CW + x) * 4, src = (y * CW + x - shift) * 4;
            d[dst] = d[src]; d[dst+1] = d[src+1]; d[dst+2] = d[src+2];
          }
        }
      }

      // Tape tear
      if (!vhsTearActive && Math.random() < 0.008) {
        vhsTearActive = true;
        vhsTearY = (Math.random() * CH * 0.8 + CH * 0.1) | 0;
        vhsTearH = (3 + Math.random() * 12) | 0;
        vhsTearShift = ((Math.random() - 0.5) * 22) | 0;
        vhsTearLife  = 4 + (Math.random() * 6) | 0;
      }
      if (vhsTearActive) {
        for (let y = vhsTearY; y < Math.min(CH, vhsTearY + vhsTearH); y++) {
          const s = vhsTearShift + ((Math.random() - 0.5) * 3) | 0;
          if (s > 0) {
            for (let x = CW - 1; x >= s; x--) {
              const dst = (y * CW + x) * 4, src = (y * CW + x - s) * 4;
              d[dst] = d[src]; d[dst+1] = d[src+1]; d[dst+2] = d[src+2];
            }
          } else if (s < 0) {
            for (let x = 0; x < CW + s; x++) {
              const dst = (y * CW + x) * 4, src = (y * CW + x - s) * 4;
              d[dst] = d[src]; d[dst+1] = d[src+1]; d[dst+2] = d[src+2];
            }
          }
        }
        vhsTearLife--;
        if (vhsTearLife <= 0) vhsTearActive = false;
      }

      // Chromatic aberration (animated, content-gated so it hugs bright edges)
      for (let y = 0; y < CH; y++) {
        const aberr = 3 + (Math.sin(vhsNoisePhase + y * 0.05) + 1) * 1.5 | 0;
        for (let x = aberr; x < CW; x++) {
          const i = (y * CW + x) * 4;
          const src = (y * CW + x - aberr) * 4;
          if (d[i] + d[i+1] + d[i+2] > 30) {
            d[i] = Math.min(255, d[src] + 40);
          }
        }
      }

      // Scanline dimming
      for (let y = 0; y < CH; y += 2) {
        for (let x = 0; x < CW; x++) {
          const i = (y * CW + x) * 4;
          d[i] = d[i] * 0.88 | 0; d[i+1] = d[i+1] * 0.88 | 0; d[i+2] = d[i+2] * 0.88 | 0;
        }
      }

      // Phosphor speckle
      const noiseCount = 60 + (Math.random() * 40) | 0;
      for (let n = 0; n < noiseCount; n++) {
        const x = (Math.random() * CW) | 0, y = (Math.random() * CH) | 0;
        const i = (y * CW + x) * 4;
        const v = (Math.random() * 40) | 0;
        d[i] = Math.min(255, d[i] + v);
        d[i+1] = Math.min(255, d[i+1] + v * 2);
        d[i+2] = Math.min(255, d[i+2] + v);
      }

      // Brightness flutter
      if (Math.random() < 0.06) {
        const f = 0.82 + Math.random() * 0.2;
        for (let i = 0; i < d.length; i += 4) {
          d[i] = d[i] * f | 0; d[i+1] = d[i+1] * f | 0; d[i+2] = d[i+2] * f | 0;
        }
      }

      vhsNoisePhase += 0.04;
      rctx.putImageData(imageData, 0, 0);
    }

    function radarTick(ts) {
      if (!radarVis) { requestAnimationFrame(radarTick); return; }
      radarFrameCount++;
      if (radarFrameCount % 8 === 0) updateBScopeBlips();

      rctx.fillStyle = '#000a00';
      rctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Grid
      rctx.strokeStyle = '#001a00'; rctx.lineWidth = 0.5;
      const rangeNM = RANGES_NM[rangeIdx];
      for (let i = 1; i <= 4; i++) {
        const y = RH - (i / 4) * RH;
        rctx.beginPath(); rctx.moveTo(0, y); rctx.lineTo(RW, y); rctx.stroke();
        rctx.fillStyle = '#004400'; rctx.font = '9px Courier New';
        rctx.fillText(Math.round(rangeNM * i / 4) + '', 3, y - 2);
      }
      for (let az = -AZ_HALF; az <= AZ_HALF; az += 20) {
        const x = azToX(az);
        rctx.beginPath(); rctx.moveTo(x, 0); rctx.lineTo(x, RH); rctx.stroke();
        rctx.fillStyle = '#004400'; rctx.font = '9px Courier New'; rctx.textAlign = 'center';
        rctx.fillText((az > 0 ? '+' : '') + az + '°', x, RH - 3);
        rctx.textAlign = 'left';
      }

      // Sweep afterglow + line
      const sweepGrad = rctx.createLinearGradient(sweepX - 30, 0, sweepX, 0);
      sweepGrad.addColorStop(0, 'rgba(0,180,50,0)');
      sweepGrad.addColorStop(1, 'rgba(0,220,60,0.09)');
      rctx.fillStyle = sweepGrad;
      rctx.fillRect(sweepX - 30, 0, 30, RH);
      rctx.strokeStyle = '#00cc44'; rctx.lineWidth = 1;
      rctx.beginPath(); rctx.moveTo(sweepX, 0); rctx.lineTo(sweepX, RH); rctx.stroke();

      // Blips — reset mode to RWS unless a lock is drawn this frame
      radarMode = 'RWS';
      const now = performance.now();
      Object.entries(radarBlipPaint).forEach(([id, b]) => {
        const age = (now - b.paintTime) / 1000;
        if (age > 4) { delete radarBlipPaint[id]; return; }
        const alpha = Math.max(0, 1 - age / 4);
        drawBlipRich(id, b, alpha, now);
      });

      // Own ship marker
      rctx.strokeStyle = '#ffffff'; rctx.lineWidth = 1;
      rctx.strokeRect(RW/2 - 3, RH - 5, 6, 4);
      rctx.beginPath(); rctx.moveTo(RW/2, RH - 5); rctx.lineTo(RW/2, RH - 12); rctx.stroke();

      // Bezel readouts (drawn before applyVHS so they get the tape treatment)
      drawBezel(rangeNM);

      sweepX += SWEEP_SPEED * sweepDir;
      if (sweepX >= RW) { sweepX = RW; sweepDir = -1; }
      if (sweepX <= 0)  { sweepX = 0;  sweepDir =  1; }

      applyVHS();

      // Footer updates (HTML, outside the VHS-affected canvas)
      document.getElementById('rdr-count').textContent =
        Object.keys(radarBlipPaint).length + ' CONTACT' +
        (Object.keys(radarBlipPaint).length !== 1 ? 'S' : '');
      document.getElementById('rdr-alt').textContent =
        'ALT: ' + Math.round(geofs.aircraft.instance.llaLocation[2] * 3.28084) + 'FT';

      requestAnimationFrame(radarTick);
    }

    document.getElementById('rdr-rng-btn').addEventListener('click', () => {
      rangeIdx = (rangeIdx + 1) % RANGES_NM.length;
      document.getElementById('rdr-range').textContent = RANGES_NM[rangeIdx] + 'NM';
      radarBlipPaint = {};
    });
    document.getElementById('rdr-tog-btn').addEventListener('click', () => {
      radarVis = !radarVis;
      radarCanvas.style.display  = radarVis ? 'block' : 'none';
      radarFooter.style.display  = radarVis ? 'flex'  : 'none';
      document.getElementById('rdr-tog-btn').textContent = radarVis ? 'HID' : 'SHW';
    });

    // Drag
    let rdrDrag = false, rdrDX = 0, rdrDY = 0;
    radarHeader.addEventListener('mousedown', e => {
      rdrDrag = true;
      rdrDX = e.clientX - radarContainer.offsetLeft;
      rdrDY = e.clientY - (window.innerHeight - radarContainer.offsetHeight - parseInt(radarContainer.style.bottom || 20));
    });
    document.addEventListener('mousemove', e => {
      if (!rdrDrag) return;
      radarContainer.style.left   = (e.clientX - rdrDX) + 'px';
      radarContainer.style.bottom = 'auto';
      radarContainer.style.top    = (e.clientY - rdrDY) + 'px';
    });
    document.addEventListener('mouseup', () => { rdrDrag = false; });
    document.addEventListener('keydown', e => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'Backspace') {
        radarVis = !radarVis;
        radarCanvas.style.display  = radarVis ? 'block' : 'none';
        radarFooter.style.display  = radarVis ? 'flex'  : 'none';
        document.getElementById('rdr-tog-btn').textContent = radarVis ? 'HID' : 'SHW';
      }
    });

    vhsFloatBand.y = Math.random() * CANVAS_H;
    requestAnimationFrame(radarTick);

    // ── EXPLOSION ─────────────────────────────────────────────────────────
    function spawnExplosion(lat, lon, alt) {
      const scene = geofs.api.viewer.scene;

      const worldPos = Cesium.Cartesian3.fromDegrees(lon, lat, alt);

      function getScreenXY() {
        const sp = Cesium.SceneTransforms.worldToWindowCoordinates(scene, worldPos);
        return sp || null;
      }

      const smokeCanvas = document.createElement('canvas');
      const fireCanvas  = document.createElement('canvas');
      const sctx = smokeCanvas.getContext('2d');
      const fctx  = fireCanvas.getContext('2d');

      const overlay = document.createElement('canvas');
      overlay.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:99996;';
      overlay.width  = smokeCanvas.width  = fireCanvas.width  = window.innerWidth;
      overlay.height = smokeCanvas.height = fireCanvas.height = window.innerHeight;
      document.body.appendChild(overlay);
      const octx = overlay.getContext('2d');

      function rand(a, b) { return a + Math.random() * (b - a); }

      const sp0 = getScreenXY();
      if (!sp0) { overlay.remove(); return; }
      const cx = sp0.x, cy = sp0.y;

      const smoke = [];
      for (let i = 0; i < 70; i++) {
        const angle = rand(0, Math.PI * 2);
        const spd   = rand(5, 80);
        const dark  = rand(0, 1);
        smoke.push({
          x: cx + rand(-6,6), y: cy + rand(-6,6),
          vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd - rand(10,50),
          r: rand(8,22), maxR: rand(35,120),
          life: rand(1.8,3.4), delay: i*0.018 + rand(0,0.08),
          cr: (14+dark*22)|0, cg: (11+dark*17)|0, cb: (8+dark*12)|0,
          alpha: rand(0.7,0.95),
        });
      }

      const fire = [];
      for (let i = 0; i < 55; i++) {
        const angle = rand(0, Math.PI*2);
        const spd   = rand(10,90);
        const tier  = rand(0,1);
        let fr, fg, fb;
        if      (tier < 0.15) { fr=255; fg=250; fb=220; }
        else if (tier < 0.45) { fr=255; fg=rand(140,200)|0; fb=20; }
        else if (tier < 0.75) { fr=240; fg=rand(60,100)|0;  fb=0;  }
        else                  { fr=160; fg=30; fb=0; }
        fire.push({
          x: cx+rand(-4,4), y: cy+rand(-4,4),
          vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd - rand(20,60),
          r: rand(6,20), maxR: rand(20,65),
          life: rand(0.3,0.85), delay: rand(0,0.04),
          fr, fg, fb,
        });
      }

      const embers = [];
      for (let i = 0; i < 70; i++) {
        const angle = rand(-Math.PI, 0) + rand(-0.4,0.4);
        const spd   = rand(50,400);
        embers.push({
          x: cx, y: cy,
          vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd,
          life: rand(0.25,1.1), delay: rand(0,0.03),
          w: rand(0.6,1.8), hot: Math.random() > 0.4,
        });
      }

      const debris = [];
      for (let i = 0; i < 12; i++) {
        const angle = rand(-Math.PI,0) + rand(-0.6,0.6);
        const spd   = rand(30,180);
        debris.push({
          x: cx, y: cy,
          vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd,
          life: rand(0.8,2.0), delay: rand(0,0.05),
          size: rand(2,5),
        });
      }

      const startTs = performance.now();
      let lastTs    = startTs;

      function drawBlob(c2, x, y, r, cr, cg, cb, a) {
        c2.beginPath();
        c2.arc(x, y, Math.max(1,r), 0, Math.PI*2);
        c2.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
        c2.fill();
      }

      function frame(now) {
        const t  = (now - startTs) / 1000;
        const dt = Math.min((now - lastTs) / 1000, 0.05);
        lastTs   = now;

        octx.clearRect(0, 0, overlay.width, overlay.height);

        sctx.clearRect(0, 0, overlay.width, overlay.height);
        let anySmoke = false;
        smoke.forEach(sp => {
          const lt = t - sp.delay; if (lt < 0) return;
          const prog = lt / sp.life; if (prog >= 1) return;
          anySmoke = true;
          sp.x += sp.vx*dt; sp.y += sp.vy*dt;
          sp.vx *= 0.972; sp.vy = sp.vy*0.972 - 2.2*dt*60;
          sp.r = Math.min(sp.r + dt*32, sp.maxR);
          const a = prog < 0.07 ? prog/0.07 : Math.max(0, 1-(prog-0.07)/0.93);
          drawBlob(sctx, sp.x, sp.y, sp.r, sp.cr, sp.cg, sp.cb, a*sp.alpha);
        });
        if (anySmoke) {
          octx.save();
          octx.filter = 'blur(14px)';
          octx.drawImage(smokeCanvas, 0, 0);
          octx.filter = 'none';
          octx.globalAlpha = 0.55;
          octx.drawImage(smokeCanvas, 0, 0);
          octx.globalAlpha = 1;
          octx.restore();
        }

        fctx.clearRect(0, 0, overlay.width, overlay.height);
        fire.forEach(fp => {
          const lt = t - fp.delay; if (lt < 0) return;
          const prog = lt / fp.life; if (prog >= 1) return;
          fp.x += fp.vx*dt; fp.y += fp.vy*dt;
          fp.vx *= 0.96; fp.vy = fp.vy*0.96 + 8*dt*60;
          fp.r = Math.min(fp.r + dt*55, fp.maxR);
          const a = prog < 0.1 ? prog/0.1 : Math.max(0, 1-(prog-0.1)/0.9);
          drawBlob(fctx, fp.x, fp.y, fp.r, fp.fr, fp.fg, fp.fb, a*0.85);
        });
        octx.save();
        octx.globalCompositeOperation = 'screen';
        octx.filter = 'blur(8px)';
        octx.drawImage(fireCanvas, 0, 0);
        octx.filter = 'none';
        octx.globalAlpha = 0.7;
        octx.drawImage(fireCanvas, 0, 0);
        octx.globalAlpha = 1;
        octx.globalCompositeOperation = 'source-over';
        octx.restore();

        embers.forEach(em => {
          const lt = t - em.delay; if (lt < 0) return;
          const prog = lt / em.life; if (prog >= 1) return;
          em.vy += 220*dt; em.vx *= 0.988; em.vy *= 0.988;
          em.x += em.vx*dt; em.y += em.vy*dt;
          const a = prog < 0.08 ? prog/0.08 : Math.max(0, 1-(prog-0.08)/0.92);
          octx.save();
          octx.globalCompositeOperation = 'screen';
          octx.beginPath();
          octx.moveTo(em.x - em.vx*0.016, em.y - em.vy*0.016);
          octx.lineTo(em.x, em.y);
          octx.strokeStyle = em.hot
            ? `rgba(255,245,180,${a})`
            : `rgba(255,${(100+Math.random()*80)|0},10,${a*0.8})`;
          octx.lineWidth = em.w;
          octx.lineCap = 'round';
          octx.stroke();
          octx.globalCompositeOperation = 'source-over';
          octx.restore();
        });

        debris.forEach(db => {
          const lt = t - db.delay; if (lt < 0) return;
          const prog = lt / db.life; if (prog >= 1) return;
          db.vy += 180*dt; db.vx *= 0.99;
          db.x += db.vx*dt; db.y += db.vy*dt;
          octx.beginPath();
          octx.arc(db.x, db.y, db.size, 0, Math.PI*2);
          octx.fillStyle = `rgba(80,60,40,${Math.max(0,1-prog)*0.9})`;
          octx.fill();
        });

        if (t < 0.3) {
          const sp = t / 0.3;
          octx.beginPath();
          octx.arc(cx, cy, sp*80, 0, Math.PI*2);
          octx.strokeStyle = `rgba(255,200,100,${(1-sp)*0.3})`;
          octx.lineWidth = 1.5*(1-sp);
          octx.stroke();
        }

        if (t < 0.55) {
          const intensity = Math.max(0, 7 - t*13);
          const vp = document.querySelector('.geofs-viewport') || document.body;
          vp.style.transform = `translate(${(Math.random()-.5)*intensity}px,${(Math.random()-.5)*intensity}px)`;
          if (t > 0.5) vp.style.transform = '';
        }

        if (!anySmoke && t > 1.5) {
          overlay.remove();
          return;
        }
        requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    }

  }
})();
