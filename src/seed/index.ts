import { listasGenericas } from "./listas.js";
import sequelize from "../config/connMySql.js";
import ListaGenerica from "../models/ListaGenerica.js";
import ListaGenericaItem from "../models/ListaGenericaItem.js";



export function seed(){
    seedListas();
}

export function seedListas(){
    listasGenericas.map(async(lista: any)=> {
        const transaction = await sequelize.transaction();

        let listaGenericaItem = lista.lista_generica_items;

        delete lista.lista_generica_items

        try{
            let listaGenericaCreated = await ListaGenerica.findOrCreate({where: lista})

            if (listaGenericaItem) {
                listaGenericaItem.forEach(async (item: any) => {
                  item.id_lista = listaGenericaCreated[0].id;
                  await ListaGenericaItem.findOrCreate({
                    where: item
                  });
                });
              }
        } catch (error: any) {
            await transaction.rollback();
            console.log(error);
        }
    })
}
