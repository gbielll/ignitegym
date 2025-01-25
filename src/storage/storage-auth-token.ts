//lidar com o token do usuário
import AsyncStorage from '@react-native-async-storage/async-storage';

//busca storage que criei patra o token do usário
import { AUTH_TOKEN_STORAGE } from './storage-config';



type StorageAuthTokenProps = {
  token: string;
  refresh_token: string;
}


/**
 * Diferença entre Token (Access Token) e Refresh Token:
 *
 * 1. **Access Token (Token de Acesso):**
 *    - É usado para autenticar e autorizar o acesso a recursos protegidos na API.
 *    - Geralmente tem um tempo de vida curto (minutos ou horas).
 *    - É enviado em todas as requisições às APIs protegidas, normalmente no cabeçalho da requisição: `Authorization: Bearer <token>`.
 *    - Contém informações sobre o usuário e permissões (escopo) de acesso.
 *    - Caso seja comprometido, seu impacto é limitado pelo curto tempo de expiração.
 *
 * 2. **Refresh Token:**
 *    - É usado para obter um novo access token sem que o usuário precise fazer login novamente.
 *    - Tem um tempo de vida mais longo (dias ou semanas).
 *    - Não é enviado em todas as requisições, mas apenas em uma requisição dedicada para renovar o access token (ex.: endpoint `/auth/refresh`).
 *    - Deve ser armazenado de forma segura (ex.: cookies httpOnly) devido ao seu impacto mais crítico caso seja comprometido.
 *
 * Resumindo:
 * O access token é usado para acesso direto aos recursos, enquanto o refresh token é utilizado apenas para renovar o access token quando este expira, mantendo a sessão do usuário ativa.
 */


export async function storageAuthTokenSave({token, refresh_token} : StorageAuthTokenProps){
    //salvo o token  (id) na chave que eu criei
    //quando for mais de um dado entre {} ou se está entre {} é um obj logo eu devo passar pra json
    await AsyncStorage.setItem(AUTH_TOKEN_STORAGE,JSON.stringify({token, refresh_token}));
}

//buscar o token do usuário
export async function storageAuthTokenGet(){
    const response = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE)

    //validar se há um valor dentro de response se nao reotnar um obj vazio
    //destruturo os obj de token e tb deifno a tipagem : StorageAuthTokenProps
    const {token, refresh_token}:StorageAuthTokenProps = response? JSON.parse(response) : {}
    return {token, refresh_token};
}

//apagar token do usuário

export async function storageAuthTokenRemove(){
    //aqui eu removo tudo q ta dentro dessa chave, por isso cuidado...
    await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE);
}