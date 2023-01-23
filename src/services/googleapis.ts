import { google } from "googleapis";
import Orcamento from "../models/Orcamento";

export class GoogleApi {
  static async createOP(orcamento: Orcamento, createVenda: any) {
    const drive = google.drive({
      version: "v3",
      auth: process.env.GOOGLE_API_TOKEN,
    });
    const docs = google.docs({
      version: "v1",
      auth: process.env.GOOGLE_API_TOKEN,
    });

    var modelo = await drive.files.copy({
      fileId: "1aOtrFc1vJWjUZjQIScfM4pqbhjQ8Qdp27I9tOSbnpkE",
      requestBody: {
        name: `${createVenda.retorno.registros[0].registro.id} - ${orcamento?.pessoa.nome}`,
        parents: ["0AJFjsJUFds0bUk9PVA"],
      },
    });

    let doc = await docs.documents.get({ documentId: modelo.data.id! }, {});

    doc.data.body?.content?.includes({
      paragraph: {
        paragraphStyle: {},
        elements: [
          {
            textRun: {
              content:
                "F-026 Monitoramento de Processo - Ordem de Produção Rev.06",
              textStyle: { bold: true, fontSize: { magnitude: 8, unit: "PT" }, weightedFontFamily: { fontFamily: "Verdana", weight: 700, },  },
            },
          }, {
            
          },
        ],
      },
    });
  }
}
