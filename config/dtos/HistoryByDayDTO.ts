import { HistoryDTO } from "./HistoryDTO";
//aqui eu psearia a typagem do date para poder ter uma flexbilidade melhor
//alem do mais no flatList eu vou usar esses dados
export type HistoryByDayDTO = {
    title: string;
    data: HistoryDTO[];
};