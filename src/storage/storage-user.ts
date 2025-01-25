import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserDTO } from "../../config/dtos/UserDTO"; //TIPAGEM
import { USER_STORAGE } from "./storage-config";


//metodo que salva
export async function storageUserSave(user:UserDTO){
    //saou salvar  'JSON.stringify(user)' na chave que criei, eu tenho q transformar e um tipo de string json
    await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));

}


//metodo que busca as informações do usuário
export async function  storageUserGet(){
    //EU PASSO A CHAVE, pq nele q ta os dados q consigo retornar
    const storage = await AsyncStorage.getItem(USER_STORAGE)
    
    //validaçao para saber se há obj dentro de storage, ja faço a tipagem tb, se não houver eu retorno um obj vazio
    const user: UserDTO = storage ? JSON.parse(storage) :{}; //mesmo eu retonando um on=bj vazio, ele ja deixa de acordo com a tipagem q declarei

   return user
}


//metodo para remover o usuário do storage, para fazer ele deslogar
export async function storageUserRemove(){
    //eu removo a apartir da chave, pois nela ta o usuário *cuidado em bancos com mais coisas pq dessa forma remove tudo de dentro*
    await AsyncStorage.removeItem(USER_STORAGE)
}