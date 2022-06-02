export type ListaGenericaType = {
  id?: number;
  nome?: string;
  ListaGenericaItem?: Array<ListaGenericaItemType>;
  deletedAt?: Date;
  updateAt?: Date;
  createAt?: Date;
};

export type ListaGenericaItemType = {
  id?: number;
  valor?: string;
  deletedAt?: Date;
  updateAt?: Date;
  createAt?: Date;
  id_lista?: number;
};
