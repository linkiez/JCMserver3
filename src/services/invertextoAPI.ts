import ListaGenerica from "../models/ListaGenerica";
import ListaGenericaItem from "../models/ListaGenericaItem";

interface IFeriadosAPI {
  date: string;
  name: string;
  type: string;
  level: string;
}

export class InvertextoAPI {
  constructor() {}

  static async feriados(): Promise<IFeriadosAPI[]> {
    const token: string | undefined = process.env.INVERTEXTO_TOKEN;
    const year = new Date().getFullYear();
    const state = "SP";

    if (token === undefined) {
      throw new Error("Invertexto token não encontrado");
    }

    const url = (add = 0) =>
      `https://api.invertexto.com/v1/holidays/${
        year + add
      }?token=${token}&state=${state}`;

    const feriadosCurrentYear = await fetch(url()).then((res) => res.json());
    const feriadosNextYear = await fetch(url(1)).then((res) => res.json());

    return feriadosCurrentYear.concat(feriadosNextYear);
  }

  static async syncFeriados() {
    const feriados = await InvertextoAPI.feriados();

    const feriadoList = await ListaGenerica.findOrCreate({
      where: {
        nome: "Feriados",
      },
    });

    const feriadoItems = feriados.map((feriado) => {
      return {
        valor: feriado.name,
        valor2: feriado.date,
        id_lista: feriadoList[0].id,
      };
    });

    for (const feriadoItem of feriadoItems) {
      await ListaGenericaItem.findOrCreate({
        where: {
          valor: feriadoItem.valor,
          valor2: feriadoItem.valor2,
          id_lista: feriadoItem.id_lista,
        },
      });
    }
  }

  static async getFeriados() {
    return await ListaGenericaItem.findAll({
      include: [
        {
          model: ListaGenerica,
          where: {
            nome: "Feriados",
          }
        },
      ],
    });
  }
}
