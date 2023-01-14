import { listasGenericas } from "./listas.js";
import sequelize from "../config/connPostgre.js";
import ListaGenerica from "../models/ListaGenerica.js";
import ListaGenericaItem from "../models/ListaGenericaItem.js";
import { usuario } from "./usuario.js";
import Usuario from "../models/Usuario.js";
import { Authentication } from "../controllers/authController.js";

export function seed() {
  seedListas();
  seedUsuario();
}

export function seedListas() {
  listasGenericas.map(async (lista: any) => {
    let listaGenericaItem = lista.lista_generica_items;

    delete lista.lista_generica_items;

    try {
      let listaGenericaCreated = await ListaGenerica.findOrCreate({
        where: lista,
      });

      if (listaGenericaItem) {
        listaGenericaItem.forEach(async (item: any) => {
          item.id_lista = listaGenericaCreated[0].id;
          await ListaGenericaItem.findOrCreate({
            where: item,
          });
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  });
}

export async function seedUsuario() {
  if (Authentication.validaSenhaNova(usuario.senha)) {
    usuario.senha = await Authentication.gerarSenhaHash(usuario.senha);
    const usuarioCreated = await Usuario.findOrCreate({
      where: { email: usuario.email },
      defaults: usuario,
    });
  }
}
