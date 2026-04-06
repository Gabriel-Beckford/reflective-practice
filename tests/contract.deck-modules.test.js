const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function loadModule(relPath, windowObj) {
  const code = fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
  vm.runInNewContext(code, { window: windowObj, console, CSS: undefined });
}

(function run() {
  const windowObj = {};
  loadModule('js/deck/state/store.js', windowObj);
  loadModule('js/deck/navigation/router.js', windowObj);

  const slides = [
    { id: '1', section: 'SECTION 0: START', responseKey: null },
    { id: '2', section: 'SECTION 2: BRANCH', responseKey: 'route', routeMap: { fast: '4' } },
    { id: '3', section: 'SECTION 3: IDENTIFY THE PHASE', responseKey: 'q1', pairingId: 'p1' },
    { id: '4', section: 'SECTION 4: ALT', responseKey: null }
  ];

  const memory = new Map();
  const storage = { getItem: (k) => memory.get(k) || null, setItem: (k, v) => memory.set(k, String(v)) };
  const session = { getItem: (k) => memory.get(`s:${k}`) || null, setItem: (k, v) => memory.set(`s:${k}`, String(v)) };

  const store = windowObj.DeckModules.stateStore.createDeckStore({
    slides,
    storage,
    sessionStorage: session,
    storageKey: 'deck',
    pathwayStorageKey: 'pathway',
    sessionConnectedKey: 'connected',
    sharedResponseSlideId: '__shared__'
  });

  const state = store.loadPersistedState();
  assert.equal(state.index, 0, 'default index should be zero');

  store.saveResponse(state, '2', 'route', 'fast');
  assert.equal(store.getResponse(state, '2', 'route', ''), 'fast', 'response persists in state');
  store.persistState(state);
  const reloaded = store.loadPersistedState();
  assert.equal(reloaded.responses['2'].route, 'fast', 'response persists through storage');

  const pairedGroups = [{ pairingId: 'p1', excerptIndex: 2, questionIndex: 2 }];
  const router = windowObj.DeckModules.navigationRouter.createDeckRouter({
    slides,
    pairedGroups,
    state,
    getResponse: (slideId, fieldKey, fallback) => store.getResponse(state, slideId, fieldKey, fallback),
    isSlideIncludedByPathway: () => true,
    isCarouselModeActive: () => false,
    getPairGroupByIndex: () => null,
    findNextIncludedIndex: (idx) => Math.max(0, Math.min(idx, slides.length - 1)),
    persistState: () => {},
    onJump: () => {}
  });

  state.index = 1;
  assert.equal(router.resolveNextIndex(), 3, 'route map should resolve to mapped slide id');

  state.index = 2;
  assert.equal(router.resolvePrevIndex(), 1, 'prev index decrements in linear mode');

  router.jumpTo(99);
  assert.equal(state.index, 3, 'jump clamps to last index');

  console.log('contract matrix ok');
})();
