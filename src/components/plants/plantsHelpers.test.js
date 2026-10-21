import {
  buildStageChange,
  getAmbienteSystemVolume,
  getAmbientPlants,
  getInitialPlantSelection,
  getNextStage,
  getRdwcGroups,
  isGrowingPlant,
  isHarvestedPlant,
  isRdwcAmbiente,
  sortNutrientsByOrder,
} from './plantsHelpers';

const ambientes = {
  rdwc3: { number: '3', rdwc: true, systemVolume: 100 },
  rdwc4: { number: '4', rdwc: true },
  normal2: { number: '2' },
};

const activePlants = [
  { id: 'p1', name: 'AK-47 1', ambienteId: 'rdwc3', etapa: 'Vegetativo', potVolume: 20 },
  { id: 'p2', name: 'AK-47 2', ambienteId: 'rdwc3', etapa: 'Vegetativo', potVolume: 20 },
  { id: 'p3', name: 'AK-47 3', ambienteId: 'rdwc3', etapa: 'Secado', potVolume: 20 },
  { id: 'p4', name: 'OG 1', ambienteId: 'normal2', etapa: 'Floracion', potVolume: 10 },
  { id: 'p5', name: 'OG 2', ambienteId: 'rdwc4', etapa: 'Curado', potVolume: 15 },
  { id: 'p6', name: 'OG 3', ambienteId: 'rdwc4', etapa: 'Vegetativo', potVolume: 15 },
  { id: 'p7', name: 'Suelta', etapa: 'Vegetativo' },
];

describe('estado de cosecha', () => {
  it('considera cosechadas las etapas de secado, curado y enfrascado', () => {
    expect(isHarvestedPlant({ etapa: 'Secado' })).toBe(true);
    expect(isHarvestedPlant({ etapa: 'Curado' })).toBe(true);
    expect(isHarvestedPlant({ etapa: 'Enfrascado' })).toBe(true);
    expect(isHarvestedPlant({ etapa: 'Floracion' })).toBe(false);
    expect(isHarvestedPlant(null)).toBe(false);
  });

  it('isGrowingPlant es el complemento de isHarvestedPlant', () => {
    expect(isGrowingPlant({ etapa: 'Vegetativo' })).toBe(true);
    expect(isGrowingPlant({ etapa: 'Curado' })).toBe(false);
    expect(isGrowingPlant(null)).toBe(false);
  });

  it('el paso de Lavado de Raices a Secado marca el inicio de la cosecha', () => {
    expect(getNextStage('Lavado de Raices')).toEqual({
      newStage: 'Secado',
      dateField: 'inicioSecado',
    });
  });

  it('Secado sigue a Curado y Curado es terminal', () => {
    expect(getNextStage('Secado')).toEqual({
      newStage: 'Curado',
      dateField: 'inicioCurado',
    });
    expect(getNextStage('Curado')).toBeNull();
  });

  it('al pasar a Secado saca la planta del ambiente', () => {
    expect(
      buildStageChange('Lavado de Raices', getNextStage('Lavado de Raices'), '10/10/2026')
    ).toEqual({
      etapa: 'Secado',
      inicioSecado: '10/10/2026',
      ambienteId: null,
    });
  });

  it('al pasar a Curado mantiene la planta fuera del ambiente y setea finalSecado', () => {
    expect(buildStageChange('Secado', getNextStage('Secado'), '20/10/2026')).toEqual({
      etapa: 'Curado',
      inicioCurado: '20/10/2026',
      finalSecado: '20/10/2026',
      ambienteId: null,
    });
  });

  it('en etapas de cultivo no toca el ambiente', () => {
    expect(buildStageChange('Vegetativo', getNextStage('Vegetativo'), '01/10/2026')).toEqual({
      etapa: 'Floracion',
      inicioFloracion: '01/10/2026',
    });
  });

  it('sin siguiente etapa no arma update', () => {
    expect(buildStageChange('Curado', null, '01/10/2026')).toBeNull();
  });
});

describe('RDWC', () => {
  it('detecta solo los ambientes con la bandera activa', () => {
    expect(isRdwcAmbiente(ambientes, 'rdwc3')).toBe(true);
    expect(isRdwcAmbiente(ambientes, 'normal2')).toBe(false);
    expect(isRdwcAmbiente(ambientes, undefined)).toBe(false);
    expect(isRdwcAmbiente(null, 'rdwc3')).toBe(false);
  });

  it('agrupa las plantas en cultivo por ambiente RDWC y excluye las cosechadas', () => {
    expect(getRdwcGroups(activePlants, ambientes)).toEqual({
      rdwc3: ['p1', 'p2'],
      rdwc4: ['p6'],
    });
  });

  it('usa el volumen manual del sistema cuando está cargado', () => {
    expect(getAmbienteSystemVolume(ambientes.rdwc3, [activePlants[0], activePlants[1]])).toBe(100);
  });

  it('si falta el volumen manual, suma los potVolume de las plantas', () => {
    expect(getAmbienteSystemVolume(ambientes.rdwc4, [activePlants[4], activePlants[5]])).toBe(30);
  });

  it('devuelve 0 si no hay volumen manual ni macetas', () => {
    expect(getAmbienteSystemVolume(ambientes.rdwc4, [])).toBe(0);
    expect(getAmbienteSystemVolume(null, [])).toBe(0);
  });

  it('precarga todo el RDWC pero excluye las cosechadas', () => {
    const selection = getInitialPlantSelection(activePlants, ambientes, 'p1');
    expect([...selection]).toEqual(['p1', 'p2']);
  });

  it('precarga solo la planta de origen si no es RDWC', () => {
    const selection = getInitialPlantSelection(activePlants, ambientes, 'p4');
    expect([...selection]).toEqual(['p4']);
  });

  it('si la planta de origen está cosechada, no arrastra el bloque RDWC', () => {
    const selection = getInitialPlantSelection(activePlants, ambientes, 'p3');
    expect([...selection]).toEqual(['p3']);
  });

  it('sin planta de origen no selecciona nada', () => {
    expect(getInitialPlantSelection(activePlants, ambientes, null).size).toBe(0);
  });
});

describe('getAmbientPlants', () => {
  it('mantiene el comportamiento original sin excludeHarvested', () => {
    expect(getAmbientPlants(activePlants, 'p1').map((p) => p.id)).toEqual(['p1', 'p2', 'p3']);
    expect(getAmbientPlants(activePlants, null)).toBe(activePlants);
  });

  it('excluye las cosechadas cuando se pide', () => {
    expect(
      getAmbientPlants(activePlants, 'p1', { excludeHarvested: true }).map((p) => p.id)
    ).toEqual(['p1', 'p2']);
  });

  it('si el origen está cosechado, devuelve solo esa planta', () => {
    expect(
      getAmbientPlants(activePlants, 'p3', { excludeHarvested: true }).map((p) => p.id)
    ).toEqual(['p3']);
  });

  it('sin origen y con excludeHarvested devuelve todas las que están en cultivo', () => {
    expect(
      getAmbientPlants(activePlants, null, { excludeHarvested: true }).map((p) => p.id)
    ).toEqual(['p1', 'p2', 'p4', 'p6', 'p7']);
  });
});

describe('orden manual de nutrientes', () => {
  it('ordena por el campo order', () => {
    const nutrients = [
      { id: 'c', order: 2 },
      { id: 'a', order: 0 },
      { id: 'b', order: 1 },
    ];
    expect(sortNutrientsByOrder(nutrients).map((n) => n.id)).toEqual(['a', 'b', 'c']);
  });

  it('deja al final los que todavía no tienen order, sin alterar su orden relativo', () => {
    const nutrients = [
      { id: 'nuevo1' },
      { id: 'a', order: 1 },
      { id: 'nuevo2' },
      { id: 'b', order: 0 },
    ];
    expect(sortNutrientsByOrder(nutrients).map((n) => n.id)).toEqual(['b', 'a', 'nuevo1', 'nuevo2']);
  });

  it('no muta el array original', () => {
    const nutrients = [{ id: 'b', order: 1 }, { id: 'a', order: 0 }];
    sortNutrientsByOrder(nutrients);
    expect(nutrients.map((n) => n.id)).toEqual(['b', 'a']);
  });
});
