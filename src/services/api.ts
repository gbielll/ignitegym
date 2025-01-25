import { storageAuthTokenGet, storageAuthTokenSave } from "@storage/storage-auth-token";
import { AppError } from "@utils/AppError";
import axios, { AxiosError, AxiosInstance } from "axios";
import { ChartNetwork } from "lucide-react-native";

type SignOut = () => void; //funçao

//tipagem da fila
type PromiseType = {
  //função para quando for receber um novo token
  onSucces: (token: string) => void;
  //função para receitar a requisção, qunaod ela falhar
  //esse tipagem AxiosError é do proprio axios
  onFailure: (error: AxiosError) => void;
};

//crio uma tipagem baseada em uma tipagem do proprio axio que tem varios informaçoes dentro
type APIInstanceProps = AxiosInstance & {
  //crio uma função para gerenciar a intercptação do token
  //vai ser uma função que recebe outra função
  //recebo o metodo de singOut do tipo SignOut (tipo de uma função)
  /*Isso significa que qualquer função que você passar como signOut deve ser uma função que:
    Não aceita nenhum parâmetro.
    Não retorna nada (void).*/
  // alem disso essa função princial que recebe essa outra função devo tb definir o tipo de retorno dela q é void
  registerInterceptTokenManager: (signOut: SignOut) => () => void;
};

//base do servidor que não muda
const api = axios.create({
  baseURL: "http://192.168.1.116:3333",
}) as APIInstanceProps; //deifno aqui a tipagem tb da minha api, podendo assim acessar os dados dessa tipagem

//crio uma filha e informo o tipo dela
let failedQueue: Array<PromiseType> = [];
let isRefreshing = false;

// AQUI EU DESLOGO O USUÁRIO CASO ELE NAO CONSIGA OBTER UM TOKEN ATUALIZADO (PRA QUE TB A APLOCAÇÃO NAO FIQUE MOSTRADNO ERRO E SIM JA DESLOQUE O USER)
//tenho acesso ao metedo (funçao) de signOut (essa função é enviada pra ca pela tipagem a cima)
//essa requiççao é chamada a partir do momento que o signOut é mudado(ele pode mudar tb caso o token caia por algum motivo e suma tb as informaçoes do sotrage, nisso eu valido se é erro 401) (ele ta no contexto em um useEffect)
api.registerInterceptTokenManager = (signOut) => {
  //possa a referencia das solitaçõe sda api pra um variável - interceptTokenManager
  const interceptTokenManager =
    //se for V/SUcesso eu retorno padrao a response, se for erro eu faço uma validação
    //se esse erro é realmente tradada no back e passo ela para o construtur q eu criei para receber esses erros
    api.interceptors.response.use(
      (response) => response,
      /*defino com asyn pq o resquestError é uma função*/ async (
        requestError
      ) => {
        //validar se o erro é decorrente de um token invalido ou inspirado
        //se o erro for de 401 logo é erro relacioando ao token nao autorizado ( que pode ser por token invalido ou inpirado)
        if (requestError?.response?.status === 401) {
          //se en trou aqui entao ja tem um 'requestError.response' por isso nao uso o ? neles
          //aqui voi ver se ha um data com uma menssagem igual ao que eu coloco entre ''
          if (
            requestError.response.data?.menssage === "token.expired" ||
            requestError.response.data?.menssage === "token.invalid"
          ) {
            // se ele entrou aqui, vamo busvcar por um refrech_token
            //recupero o refresh_token so usuário que logo apos ser retornado do servidor foi armazenado no banco local
            const { refresh_token } = await storageAuthTokenGet();

            //se mesmo assim nao existir um refresh token eu deslogo o usupario e retorno o resquestError
            if (!refresh_token) {
              signOut();
              return Promise.reject(requestError);
            }

            //aqui dentro ta todas as informaçoes da requisção q foi feita, graças ao requestError.config
            const originalResquestConfig = requestError.config;

            //na primeira vez q passar por aqui, esse isRefreshing vai ser F, como eu defirnir e nao vai entrar aqui, pass do if e seta o isRefreshing como V e ai sim entra
            //ou seja, so entra aqui quando for solicitado um novo token
            if (isRefreshing) {
              return new Promise((resolve, reject) => {
                //trabalha com dois retornos um resolve e um reject
                failedQueue.push({
                  // esse push é adcionar, ou seja, vou adcionar na fila q criei
                  // A fila "failedQueue" é um array de funções de tratamento, que podem armazenar múltiplos casos de sucesso (onSuccess) ou falha (onFailure).
                  // Isso significa que várias requisições falhadas podem ser armazenadas e processadas em sequência,
                  onSucces: (token: string) => {
                    //se der sucesso eu adciono um novo token na autorização
                    originalResquestConfig.headers = {
                      Authorization: `Bearer ${token}`,
                    };
                    //aqui com a estrura da Promisse se eu certo ele retona a nova requisição, mesmo se dar errado ele vai retonar esse resolver, por isso seria bom um trycatch aqui para validar e retonar um reject caso precisse
                    resolve(api(originalResquestConfig)); // se houve sucesos ele rertorna um resolve ja com o novo token atualizado
                  },
                  onFailure: (error: AxiosError) => {
                    reject(error); // se dar erro eu rejeito a requisção
                  },
                });
              });
            }

            //na segunda vez q houver essa requição eu ja vou ter ele como V
            isRefreshing = true;

            return new Promise(async (resolve, reject) => {
              try {
                //busco pelo token atualizado, em uma rota so pra atualização
                //envio tb o refresh_token que eu recuperi do revidor e armazenei no dispositivo do usuário
                //retorno tudo isso no data, ele vai ser retorno o novo token o refresh_token e todas as outras informaçoes 
                const { data } = await api.post('/sessions/refresh-token', { refresh_token });
                console.log("TOKEN ATUALIZADO: ", data)

                //vou salvar o novo token esse novo token no storage
                //esse token continua o mesmo, pq so mudei o refresh_token qunado eu retorno da api
                await storageAuthTokenSave({ token: data.token, refresh_token: data.refresh_token });


                //precisa finalizar o fluxo, reenviar as requisições
                if (originalResquestConfig.data) {
                  originalResquestConfig.data = JSON.parse(originalResquestConfig.data)
                }
                //atualizar o cabeçalho
                originalResquestConfig.headers = {
                  Authorization: `Bearer ${data.token}`,
                };
                //atualizar a api
                api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`


                failedQueue.forEach(request => {
                  request.onSucces(data.token)
                })
                resolve(api(originalResquestConfig))

              } catch (error: any) {
                // A linha abaixo percorre todas as requisições que falharam (armazenadas na fila "failedQueue")
                // e chama a função "onFailure" de cada uma delas, passando o erro ocorrido como parâmetro.
                // Isso permite que cada requisição falhada saiba o que deu errado e tome a ação necessária
                // (por exemplo, exibir uma mensagem de erro ou realizar algum outro tratamento).
                //ou seja ele vai pecorrer a funçao de erro que é so uma mais pode haver inumeros erros
                failedQueue.forEach((request) => {
                  request.onFailure(error);
                });

                //com isso deslogo o usupario e rejeito o erro 
                signOut();
                reject(error)
              } finally {
                //se passar por aqui ja tem um token atualizado, logo eu desabilito o isRefreshing
                isRefreshing = false;
                //e limpor tb a fila de requisção
                failedQueue = [];
              }
            });
          }

          //se nao entrar no if em cima logo nao é relacionado ao erro de invalido ou inspirado, logo a gente desloga ele da aplição para fazer um novo registro ou login para obter um novo token
          //essa função a gente passou ela pro registerInterceptTokenManager, ela é de la do contexto
          signOut();
        }

        //VALIDAÇÃO DE ERROS TRATADOS RELACIONADO AO TOKEN
        if (requestError.response && requestError.response.data) {
          return Promise.reject(
            new AppError(requestError.response.data.message)
          ); //passo o erro para a função de erro que criei
        } else {
          //mensasgem de erro nao tratatda pelo back, genérica
          return Promise.reject(requestError);
        }
      }
    );

  //apor terminar de usar deu um eject para finalizar, nesse eject eu passo o interceptTokenManager (onde nele ta toda a refrfencia de requiçãpo de erro da api)
  return () => {
    api.interceptors.response.eject(interceptTokenManager);
  };
};

/*api.interceptors.request.use((config)=>{ 
    //no config tenho todos os paramento da requisição se der certo
    console.log("INTERCEPTOR",config) //vai retonar todos os dados
    return config;
}, (error)=>{
     //no config tenho todos os paramento da requisição se der erro
     return Promise.reject(error) //ele rejeita a requisição  e retonar pra quem solicita
})*/
//retorno de erro da propria aplicação em si / da api
//fluxo - recebe a requisção e retonar para quem solicitou, logo o return é importente
/*api.interceptors.response.use((response )=>{
    console.log('INTERCEPTOR RESPONSE',response)
    return response;
},(error)=>{
    console.log("INTERCPTOR RESPNDE ERROR =>", error)
    return Promise.reject(error)
})*/

export { api };
