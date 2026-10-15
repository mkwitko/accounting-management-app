import { Configs } from "@/src/data/default-configs";
import { FindMe201, GetAllPreparos200Item, GetSessao200Item } from "@/src/http/generated/api.schemas";
import { differenceInDays } from "date-fns";
import {
  COMMON_FORMATS,
  MergeRange,
  SHEET_COLORS,
  SHEET_DIMENSIONS,
  createBorderRequest,
  createDimensionRequest,
  createFormatRequest,
} from "../lib/sheets-formatting";
import {
  createFullWidthMerge,
  createHeaderWithIcon,
  createRowMerges,
} from "../lib/sheets-utils";

export default function useResultadosSheets(configs: Configs) {
  const handleGetResultadosData = ({ preparos, sessoes, user }: {
    preparos: GetAllPreparos200Item[]
    sessoes: GetSessao200Item[]
    user: FindMe201
  }) => {
    // Sessoes
    const primeiraSessao =
      sessoes && sessoes.length > 0
        ? new Date(sessoes[0].data)
        : new Date();
    const derradeiraSessao =
      sessoes && sessoes.length > 0
        ? new Date(sessoes[sessoes.length - 1].data)
        : new Date();
    const diferencaDias = differenceInDays(primeiraSessao, derradeiraSessao);
    const totalSessoes = sessoes?.length ?? 0;
    const mediaSessoesAno = Math.round((totalSessoes / diferencaDias) * 365);

    // Pessoas
    const totalPessoas = (sessoes ?? []).reduce(
      (sum, s) => sum + Number(s.pessoas ?? 0),
      0
    );
    const mediaPessoasPorSessao = Math.round(
      totalPessoas / (totalSessoes || 1)
    );

    // Vegetal
    const totalVegetalConsumido = (sessoes ?? []).reduce(
      (sum, s) => sum + Number(s.quantidadeVegetal ?? 0),
      0
    );
    const mediaVegetalPorSessao = totalVegetalConsumido / (totalSessoes || 1);
    const mediaVegetalPorPessoa = Math.round(
      (totalVegetalConsumido / (totalPessoas || 1)) * 1000
    );

    // Preparo
    const totalPreparos = preparos?.length ?? 0;
    const totalVegetalPreparado = (preparos ?? []).reduce(
      (sum, p) => sum + Number(p.producaoLitros ?? 0),
      0
    );
    const mediaLitrosPreparados = totalVegetalPreparado / (totalPreparos || 1);

    // Mariri
    const totalMariri = (preparos ?? []).reduce(
      (sum, p) => sum + Number(p.mariri?.pesoKg ?? 0),
      0
    );
    const totalPesMariri = (preparos ?? []).reduce(
      (sum, p) => sum + Number(p.mariri?.unidades ?? 0),
      0
    );
    const pesoMedioMariri = totalMariri / (totalPesMariri || 1);
    const maririPorVegetal = totalMariri / (totalVegetalPreparado || 1);

    // Chacrona
    const totalChacrona = (preparos ?? []).reduce(
      (sum, p) => sum + Number(p.chacrona?.pesoKg ?? 0),
      0
    );
    const totalPesChacrona = (preparos ?? []).reduce(
      (sum, p) => sum + Number(p.chacrona?.unidades ?? 0),
      0
    );
    const pesoMedioChacrona = totalChacrona / (totalPesChacrona || 1);
    const chacronaPorVegetal = totalChacrona / (totalVegetalPreparado || 1);

    // Lenha
    const totalFornalhaAcesa = (preparos ?? []).reduce(
      (sum, p) => sum + Number(p.lenha?.tempoFornalhaAcesa ?? 0),
      0
    );
    const tempoMedioFornalha = totalFornalhaAcesa / (totalPreparos || 1);

    const totalLenha = (preparos ?? []).reduce(
      (sum, p) => sum + Number(p.lenha?.quantidadeM2 ?? 0),
      0
    );
    const consumoLenhaPorTempo = totalLenha / (totalFornalhaAcesa || 1);
    const consumoLenhaPorVegetal = totalLenha / (totalVegetalPreparado || 1);

    // ==================== CÁLCULOS ====================
    const METADE_DIAMETRO_TOPO = configs.DIAMETRO_TOPO / 2;
    const METADE_DIAMETRO_BASE = configs.DIAMETRO_BASE / 2;
    const CRESCIMENTO_ANUAL_DECIMAL = 1 + configs.CRESCIMENTO_ANUAL / 100;

    const VOLUME_LENHA_M3 =
      Math.round(
        Math.PI *
          (configs.ALTURA_TRONCO / 3) *
          (METADE_DIAMETRO_BASE ** 2 +
            METADE_DIAMETRO_BASE * METADE_DIAMETRO_TOPO +
            METADE_DIAMETRO_TOPO ** 2) *
          10
      ) / 10;

    // Cálculos derivados
    const mediaVegetalAno = Math.round(
      (mediaSessoesAno * mediaPessoasPorSessao * mediaVegetalPorPessoa) / 1000
    );

    const plantioMaririPorAno = Math.round(
      (mediaVegetalAno * maririPorVegetal * CRESCIMENTO_ANUAL_DECIMAL) /
        pesoMedioMariri
    );
    const plantioChacronaPorAno = Math.round(
      (mediaVegetalAno * chacronaPorVegetal * CRESCIMENTO_ANUAL_DECIMAL) /
        pesoMedioChacrona
    );
    const plantioLenhaPorAno = Math.round(
      mediaVegetalAno * consumoLenhaPorVegetal * CRESCIMENTO_ANUAL_DECIMAL
    );
    const areaMariri = Math.round(
      plantioMaririPorAno *
        configs.M2_POR_MARIRI *
        configs.ANOS_PARA_COLHEITA_MARIRI
    );
    const areaChacrona = Math.round(
      plantioChacronaPorAno * configs.M2_POR_CHACRONA
    );
    const arvoresPorAno = Math.round(plantioLenhaPorAno / VOLUME_LENHA_M3);
    const areaLenha = Math.round(
      arvoresPorAno *
        configs.M2_POR_ARVORE_LENHA *
        configs.ANOS_PARA_COLHEITA_ARVORE
    );

    // ==================== DADOS DA PLANILHA ====================
    const data: (string | null)[][] = [
      // LINHA 0: Título principal
      [
        createHeaderWithIcon(
          "chart",
          `Análise de Dados • ${user?.nucleo?.nome}`
        ),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],

      // LINHA 1: Espaçamento
      [null, null, null, null, null, null, null, null],

      // LINHA 2: Seção "Consumo de Vegetal"
      [
        createHeaderWithIcon("plant", "CONSUMO DE VEGETAL"),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],

      // LINHA 3: Headers do Consumo de Vegetal
      [
        createHeaderWithIcon("arrow", "Média de Vegetal"),
        null,
        createHeaderWithIcon("calendar", "Média de Sessões"),
        null,
        createHeaderWithIcon("people", "Média de Pessoas"),
        null,
        createHeaderWithIcon("droplet", "Vegetal / Pessoa"),
        null,
      ],

      // LINHA 4: Valores do Consumo de Vegetal
      [
        `${mediaVegetalAno} litros/ano`,
        null,
        `${mediaSessoesAno} sessões/ano`,
        null,
        `${mediaPessoasPorSessao} pessoas/sessão`,
        null,
        `${mediaVegetalPorPessoa} ml`,
        null,
      ],

      // LINHA 5: Espaçamento
      [null, null, null, null, null, null, null, null],

      // LINHA 6: Seção "Dados dos Preparos"
      [
        createHeaderWithIcon("flask", "DADOS DOS PREPAROS"),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],

      // LINHA 7: Headers dos Preparos (linha 1)
      [
        createHeaderWithIcon("plant", "Mariri / Vegetal"),
        null,
        createHeaderWithIcon("leaf", "Chacrona / Vegetal"),
        null,
        createHeaderWithIcon("scale", "Peso Médio Mariri"),
        null,
        createHeaderWithIcon("scale", "Peso Médio Chacrona"),
        null,
      ],

      // LINHA 8: Valores dos Preparos (linha 1)
      [
        `${maririPorVegetal.toFixed(2)} kg/litro`,
        null,
        `${chacronaPorVegetal.toFixed(2)} kg/litro`,
        null,
        `${pesoMedioMariri.toFixed(2)} kg/pé`,
        null,
        `${pesoMedioChacrona.toFixed(2)} kg/pé`,
        null,
      ],

      // LINHA 9: Headers dos Preparos (linha 2)
      [
        createHeaderWithIcon("fire", "Tempo Médio Fornalha"),
        null,
        createHeaderWithIcon("bottle", "Litros Preparados"),
        null,
        createHeaderWithIcon("wood", "Consumo Lenha/Tempo"),
        null,
        createHeaderWithIcon("wood", "Consumo Lenha/Vegetal"),
        null,
      ],

      // LINHA 10: Valores dos Preparos (linha 2)
      [
        `${tempoMedioFornalha.toFixed(1)} horas/prep.`,
        null,
        `${mediaLitrosPreparados.toFixed(1)} litros/prep.`,
        null,
        `${consumoLenhaPorTempo.toFixed(1)} m³/hora`,
        null,
        `${consumoLenhaPorVegetal.toFixed(2)} m³/litro`,
        null,
      ],

      // LINHA 11: Espaçamento
      [null, null, null, null, null, null, null, null],

      // LINHA 12: Seção "Dados para Planejamento"
      [
        createHeaderWithIcon("pin", "DADOS PARA PLANEJAMENTO"),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],

      // LINHA 13: Subtitle com margem de crescimento
      [
        `Projeção com margem de ${configs.CRESCIMENTO_ANUAL}% de crescimento anual`,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],

      // LINHA 14: Headers do Planejamento
      [
        createHeaderWithIcon("plant", "Plantio de Mariri"),
        null,
        createHeaderWithIcon("leaf", "Chacronal"),
        null,
        createHeaderWithIcon("wood", "Lenha"),
        null,
        createHeaderWithIcon("tree", "Exemplo: Eucalipto"),
        null,
      ],

      // LINHA 15: Valores do Planejamento
      [
        `${plantioMaririPorAno} mariri/ano`,
        null,
        `${plantioChacronaPorAno} pés no total`,
        null,
        `${plantioLenhaPorAno} m³/ano`,
        null,
        `${arvoresPorAno} eucaliptos/ano`,
        null,
      ],

      // LINHA 16: Espaçamento
      [null, null, null, null, null, null, null, null],

      // LINHA 17: Headers das Áreas
      [
        createHeaderWithIcon("ruler", "Área Ideal Mariri"),
        null,
        createHeaderWithIcon("ruler", "Área Ideal Chacronal"),
        null,
        createHeaderWithIcon("ruler", "Área Lenha"),
        null,
        null,
        null,
      ],

      // LINHA 18: Valores das Áreas
      [
        `${areaMariri.toLocaleString()} m²`,
        null,
        `${areaChacrona.toLocaleString()} m²`,
        null,
        `${areaLenha.toLocaleString()} m²`,
        null,
        null,
        null,
      ],

      // LINHA 19: Espaçamento
      [null, null, null, null, null, null, null, null],

      // LINHAS 20-24: Considerações
      [
        createHeaderWithIcon("pin", "Considerações Mariri:"),
        null,
        createHeaderWithIcon("pin", "Considerações Chacrona:"),
        null,
        createHeaderWithIcon("pin", "Considerações Lenha:"),
        null,
        null,
        null,
      ],
      [
        `• ${configs.M2_POR_MARIRI}m² para cada pé`,
        null,
        `• ${configs.M2_POR_CHACRONA}m² para cada pé de chacrona`,
        null,
        `• ${configs.M2_POR_ARVORE_LENHA}m²/eucalipto plantado`,
        null,
        null,
        null,
      ],
      [
        `• ${configs.ANOS_PARA_COLHEITA_MARIRI} anos entre plantio e colheita`,
        null,
        "• Colheita 1 vez por ano em cada pé",
        null,
        `• Corte a cada ${configs.ANOS_PARA_COLHEITA_ARVORE} anos`,
        null,
        null,
        null,
      ],
      [
        "• Cálculo baseado no consumo de Vegetal/ano com 20% de acréscimo e rendimento dos preparos",
        null,
        "• Cálculo baseado no consumo de Vegetal/ano com 20% de acréscimo e rendimento dos preparos",
        null,
        `• Volume de ${VOLUME_LENHA_M3}m³ de lenha por árvore`,
        null,
        null,
        null,
      ],
      [
        null,
        null,
        null,
        null,
        "• Cálculo baseado no consumo de Vegetal/ano com 20% de acréscimo e rendimento dos preparos",
        null,
        null,
        null,
      ],
    ];

    const merges: MergeRange[] = [
      // Título e espaçamentos
      createFullWidthMerge(0, 8),
      createFullWidthMerge(1, 8),
      createFullWidthMerge(2, 8),
      createFullWidthMerge(5, 8),
      createFullWidthMerge(6, 8),
      createFullWidthMerge(11, 8),
      createFullWidthMerge(12, 8),
      createFullWidthMerge(13, 8),
      createFullWidthMerge(16, 8),
      createFullWidthMerge(19, 8),

      // Headers e valores - usando createRowMerges para simplificar
      ...createRowMerges(3, [
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7],
      ]),
      ...createRowMerges(4, [
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7],
      ]),
      ...createRowMerges(7, [
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7],
      ]),
      ...createRowMerges(8, [
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7],
      ]),
      ...createRowMerges(9, [
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7],
      ]),
      ...createRowMerges(10, [
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7],
      ]),
      ...createRowMerges(14, [
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7],
      ]),
      ...createRowMerges(15, [
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7],
      ]),
      ...createRowMerges(17, [
        [0, 1],
        [2, 3],
        [4, 5],
      ]),
      ...createRowMerges(18, [
        [0, 1],
        [2, 3],
        [4, 5],
      ]),

      // Considerações (merge vertical)
      { startRow: 20, endRow: 24, startColumn: 0, endColumn: 1 },
      { startRow: 20, endRow: 24, startColumn: 2, endColumn: 3 },
      { startRow: 20, endRow: 24, startColumn: 4, endColumn: 5 },
    ];

    const getFormattingRequests = (sheetId: number) => {
      const requests = [
        // Título principal
        createFormatRequest(sheetId, 0, 1, 0, 8, COMMON_FORMATS.title),

        // Espaçamentos
        createFormatRequest(sheetId, 1, 2, 0, 8, COMMON_FORMATS.spacing),
        createFormatRequest(sheetId, 5, 6, 0, 8, COMMON_FORMATS.spacing),
        createFormatRequest(sheetId, 11, 12, 0, 8, COMMON_FORMATS.spacing),
        createFormatRequest(sheetId, 16, 17, 0, 8, COMMON_FORMATS.spacing),
        createFormatRequest(sheetId, 19, 20, 0, 8, COMMON_FORMATS.spacing),

        // Seções
        createFormatRequest(sheetId, 2, 3, 0, 8, COMMON_FORMATS.sectionHeader),
        createFormatRequest(sheetId, 6, 7, 0, 8, COMMON_FORMATS.sectionHeader),
        createFormatRequest(
          sheetId,
          12,
          13,
          0,
          8,
          COMMON_FORMATS.sectionHeader
        ),

        // Subtitle
        createFormatRequest(sheetId, 13, 14, 0, 8, COMMON_FORMATS.subtitle),

        // Headers
        createFormatRequest(sheetId, 3, 4, 0, 8, COMMON_FORMATS.columnHeader),
        createFormatRequest(sheetId, 7, 8, 0, 8, COMMON_FORMATS.columnHeader),
        createFormatRequest(sheetId, 9, 10, 0, 8, COMMON_FORMATS.columnHeader),
        createFormatRequest(sheetId, 14, 15, 0, 8, COMMON_FORMATS.columnHeader),
        createFormatRequest(sheetId, 17, 18, 0, 8, COMMON_FORMATS.columnHeader),

        // Valores
        createFormatRequest(sheetId, 4, 5, 0, 8, COMMON_FORMATS.valueCell),
        createFormatRequest(sheetId, 8, 9, 0, 8, COMMON_FORMATS.valueCellAlt),
        createFormatRequest(sheetId, 10, 11, 0, 8, COMMON_FORMATS.valueCellAlt),
        createFormatRequest(sheetId, 15, 16, 0, 8, COMMON_FORMATS.valueCell),
        createFormatRequest(sheetId, 18, 19, 0, 8, COMMON_FORMATS.valueCellAlt),

        // Considerações
        createFormatRequest(sheetId, 20, 25, 0, 8, COMMON_FORMATS.notes),

        // Bordas externas
        createBorderRequest(sheetId, 0, 25, 0, 8, {
          top: { style: "SOLID", width: 2, color: SHEET_COLORS.darkGreen },
          bottom: { style: "SOLID", width: 2, color: SHEET_COLORS.darkGreen },
          left: { style: "SOLID", width: 2, color: SHEET_COLORS.darkGreen },
          right: { style: "SOLID", width: 2, color: SHEET_COLORS.darkGreen },
          innerHorizontal: {
            style: "SOLID",
            width: 1,
            color: SHEET_COLORS.lightGray,
          },
          innerVertical: {
            style: "SOLID",
            width: 1,
            color: SHEET_COLORS.lightGray,
          },
        }),

        // Bordas entre seções
        createBorderRequest(sheetId, 1, 2, 0, 8, {
          bottom: {
            style: "SOLID",
            width: 2,
            color: SHEET_COLORS.primaryGreen,
          },
        }),
        createBorderRequest(sheetId, 5, 6, 0, 8, {
          bottom: {
            style: "SOLID",
            width: 2,
            color: SHEET_COLORS.primaryGreen,
          },
        }),
        createBorderRequest(sheetId, 11, 12, 0, 8, {
          bottom: {
            style: "SOLID",
            width: 2,
            color: SHEET_COLORS.primaryGreen,
          },
        }),
        createBorderRequest(sheetId, 16, 17, 0, 8, {
          bottom: {
            style: "SOLID",
            width: 2,
            color: SHEET_COLORS.primaryGreen,
          },
        }),
        createBorderRequest(sheetId, 19, 20, 0, 8, {
          bottom: {
            style: "SOLID",
            width: 2,
            color: SHEET_COLORS.primaryGreen,
          },
        }),

        // Dimensões de colunas
        createDimensionRequest(
          sheetId,
          "COLUMNS",
          0,
          8,
          SHEET_DIMENSIONS.columnWidth
        ),

        // Dimensões de linhas
        createDimensionRequest(
          sheetId,
          "ROWS",
          0,
          1,
          SHEET_DIMENSIONS.rowHeights.title
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          2,
          3,
          SHEET_DIMENSIONS.rowHeights.section
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          6,
          7,
          SHEET_DIMENSIONS.rowHeights.section
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          12,
          13,
          SHEET_DIMENSIONS.rowHeights.section
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          13,
          14,
          SHEET_DIMENSIONS.rowHeights.subtitle
        ),

        // Espaçamentos
        createDimensionRequest(
          sheetId,
          "ROWS",
          1,
          2,
          SHEET_DIMENSIONS.rowHeights.spacing
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          5,
          6,
          SHEET_DIMENSIONS.rowHeights.spacing
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          11,
          12,
          SHEET_DIMENSIONS.rowHeights.spacing
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          16,
          17,
          SHEET_DIMENSIONS.rowHeights.spacing
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          19,
          20,
          SHEET_DIMENSIONS.rowHeights.spacing
        ),

        // Headers
        createDimensionRequest(
          sheetId,
          "ROWS",
          3,
          4,
          SHEET_DIMENSIONS.rowHeights.header
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          7,
          8,
          SHEET_DIMENSIONS.rowHeights.header
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          9,
          10,
          SHEET_DIMENSIONS.rowHeights.header
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          14,
          15,
          SHEET_DIMENSIONS.rowHeights.header
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          17,
          18,
          SHEET_DIMENSIONS.rowHeights.header
        ),

        // Valores
        createDimensionRequest(
          sheetId,
          "ROWS",
          4,
          5,
          SHEET_DIMENSIONS.rowHeights.value
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          8,
          9,
          SHEET_DIMENSIONS.rowHeights.value
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          10,
          11,
          SHEET_DIMENSIONS.rowHeights.value
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          15,
          16,
          SHEET_DIMENSIONS.rowHeights.value
        ),
        createDimensionRequest(
          sheetId,
          "ROWS",
          18,
          19,
          SHEET_DIMENSIONS.rowHeights.value
        ),

        // Considerações
        createDimensionRequest(
          sheetId,
          "ROWS",
          20,
          25,
          SHEET_DIMENSIONS.rowHeights.notes
        ),
      ];

      return requests;
    };

    return {
      data,
      merges,
      getFormattingRequests,
    };
  };

  return {
    handleGetResultadosData,
  };
}
