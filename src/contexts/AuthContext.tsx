import { Children, createContext, ReactNode, useEffect, useState } from "react";
import { UserDTO } from "../../config/dtos/UserDTO";
import { api } from "@services/api";

//vou poder usar esse contexto em outros lugares da aplicação, ou seja os dados de forma global
//gerencialmeento global
//devo usar um Provider no app,tsx para compatilhar esse contexto ideial de pai engloba filho

//função local onde eu armazeno os dados local do usupario
import {
  storageUserGet,
  storageUserSave,
  storageUserRemove,
} from "@storage/storage-user";
import {
  storageAuthTokenGet,
  storageAuthTokenRemove,
  storageAuthTokenSave,
} from "@storage/storage-auth-token";

//toda função que crioe em um contexto eu devo typar ela pra poder compartilhar
export type AuthContextDataProps = {
  user: UserDTO; // tipagem global, que criei em outro arquivo
  //retorno deve ser uma promisse, pois os dados nao setao reeronando no mesmo momoento (oq foi asyn de função deve ser promisse)
  singIn: (email: string, password: string) => Promise<void>; //os dados q ele vai receber tem tipagem tb
  signOut: () => Promise<void>;
  updateUserProfile: (userUpdated: UserDTO) => Promise<void>;
  isLoagingUserStorageDate: boolean;
};

//tipagem desse componente
type AuthContextProviderProps = {
  children: ReactNode;
};
//esse as tipa os valores inciaisi
export const AuthContext = createContext<AuthContextDataProps>(
  {} as AuthContextDataProps
);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserDTO>({} as UserDTO); //usuário começa como um obj vazio, esse usuario const vai ser mais usado patra validaçao de contexto pra sabser se há usuário local

  //validar se os dados no storage foram carregados
  const [isLoagingUserStorageDate, setIsLoagingUserStorageDate] =
    useState(true);

  //função para recuperar o token e autheticar ele e pegar tb o dados do usuário para armazenar no estado
  async function userAndTokenUpdate(userData: UserDTO, token: string) {
    try {
      // Configura o token de autenticação no cabeçalho padrão de todas as requisições HTTP.
      // Isso garante que o usuário seja identificado e autorizado em rotas protegidas da API (do qual eu criei).
      //Bearer significa "Portador".
      /*O cabeçalho chamado Authorization é onde você diz:
              "Ei, API, aqui está minha identidade para provar que eu posso acessar os dados!"*/
      /*Para não precisar adicionar o cabeçalho Authorization manualmente em cada requisição.
              usa-se o default*/
      //ou seja, falo pra api que esse usupario tem permisão de acessar rotas restritas.
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData); // usado para armazarno estado e validar o se está logado
    } catch (error) {
      throw error;
    }
  }

  //função para salvar o user e seu token no storage, deixo mais ogarnizado e centralizado sepradno em uma função
  async function storageUserAndTokenSave(userData: UserDTO, token: string, refresh_token: string) {
    try {
      setIsLoagingUserStorageDate(true);
      //aqui eu guardo os dados no dispositivo do usuário, pela funçao que criei: storageUserSave (em outro componenet)
      // e salvar o token tb na função que cirei em outro componente (storage)
      //salvar no banco local o user para ciclo de vida de login
      await storageUserSave(userData);
      // aqui vou slavar o token e o refresh_token que resgatei do usuário (ele pe puxado do servidor e armazenado no banco local)
      await storageAuthTokenSave({ token, refresh_token });
    } catch (error) {
      throw error;
    } finally {
      setIsLoagingUserStorageDate(false);
    }
  }

  //Enviar valores de login para api e amarzenar no storage
  async function singIn(email: string, password: string) {
    //quando o usuário faz login precisamos salvar suas informaçoes no banco local
    //e autenticar seu token
    //por isso eu chamo duas funções no if, elas servem para isso
    try {
      /*Validar se email e password correspondem a um usuário válido, um usupario criado. vou nessa rota e busco esses dados q passo como argumento.
            Retornar um  objeto com os dados necessários, como data.user e possivelmente um token de
            autenticação.*/
      const { data } = await api.post("/sessions", { email, password });

      //se existe dados retornados, ou seja, usuário logadp, por isso ele envio como áramentro os dados e rertorna logo em seguida
      //devo verificar se existe os dados desse determinado usuário e se há um token(id) tb dele e se ha um refresh_token : token com tempo de duração maior
      if (data.user && data.token && data.refresh_token) {
        // esse user (nele q ta todos os dados do usuário) ja é da api q é retornado, provavelmnte ja  tipado
        setIsLoagingUserStorageDate(true);
        console.log(data.token);
        console.log(data.password);
        //envio os dados do user e token para essa função para armazernar no banco local
        storageUserAndTokenSave(data.user, data.token, data.refresh_token);

        //pra essa função eu mando apenas os dados do usuário para validar e seu  token
        userAndTokenUpdate(data.user, data.token);
      }
      console.log(data);
    } catch (error) {
      throw `${error} - erro aqui`;
    } finally {
      setIsLoagingUserStorageDate(false);
    }
  }

  //função para sair do login
  async function signOut() {
    //devo remover seu token e seu dados do estado tb
    try {
      setIsLoagingUserStorageDate(true);
      //esse outro user vai ser usado para outra finalidades do dados do user, e nao para armazemento local
      setUser({} as UserDTO); //coloco como um obj vazio mas mesmo assim eu devo informar qual é a tipagem
      //função que remove usuário local do sistema
      await storageUserRemove();
      //funçaõ que remove o token do armazenmento do storage
      await storageAuthTokenRemove();
    } catch (error) {
      throw error;
    } finally {
      setIsLoagingUserStorageDate(false);
    }
  }

  //funcção para recuperar os ddos editados e citar no storage e no servidos
  async function updateUserProfile(userUpdated: UserDTO) {
    try {
      //salvar os dados editados no contexto do estado
      setUser(userUpdated);
      //salvar os dados atualalizados no banco lacal do dispositivo para depois validar se tem dados local ao logar
      await storageUserSave(userUpdated);
    } catch (error) {
      throw error;
    }
  }

  //recuperar o usuário logado local e token
  async function loadUserData() {
    try {
      setIsLoagingUserStorageDate(true);

      //aqui vai retonar o usuário (dados dele) do banco local
      //na const userLogged
      const userLogged = await storageUserGet();

      //recuoerando o token do usuário
      //lembre-se o storageAuthTokenGet retornar dois obj e podia ser varioas, se eu decalar a consta apenas como const name, nesse name vei ter todos os obj, eu devo destrututrar oq vou pegar
      const { token } = await storageAuthTokenGet();

      //se houver usuário e token eu insiro no estado (ate pra usar isso para saber se ele ta logado)
      if (token && userLogged) {
        //essa função de LoadUserData como ela é chamada pelo useEffeion ela valida
        //se há usupario logado, se houver ela manda para função que eu criei para armazer esses valores
        // NAO PRECISO NOVAMENTE ARMAZERNAR ESSES DADOS NO BANCO LOCAL (VISTO QUE EUJA RECUPERO ESSES VALORES AQUI MESMO NESSA FUNÇÃO), PQ ESSA FUNÇÃO PRE ENTEDENTE Q JA
        // TEM UM USUÁRIO LOGADO (LOGO ELE JA TEM SUAS INFORMAÇOES NO BANCO), basta apenas authenticat toda
        //vez q ele entra (ou quando ele faz login tb) e enviar de novo seu 'user' pra ver deixar ele logado
        userAndTokenUpdate(userLogged, token);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoagingUserStorageDate(false);
    }
  }

  //chamo a função a cima toda vez, para validar se há usuário
  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    //aqui eu mando para minha api pelo metodo que criei a função signOut (que é void)
    const subscribe = api.registerInterceptTokenManager(signOut);
    //boas prática, apos realizar a operçaão em cima será limpado da memória essa função
    return () => {
      subscribe();
    };
  }, [signOut]); //toda vez q essa função mudar ou for interagida, vai entrar aqui nesse useEffect

  return (
    //todos os dados q estiverem na tipagem do contexto eu devo tb passar aqui no value para compartilhar
    <AuthContext.Provider
      value={{
        //fiz um state com os dados, compatilho o contudo de um estado
        // a tipagem ta do tipo user que é do tipo UserDTO, validar a tipagem ous eja todas as propriedades ta dentro do user
        /*aqui eu compatilhos os dados de user, todos os dados q estao nele. por isso eu passo dois valorees x:y
             diferente de passar uma função que no maximo envio apenas com solicitção de prametros*/
        user: user, //poderia ser apenas user pq tem o mesmo nome nesse outro user -> :user (ta todos os dados do usupario decorrente tb a tipagem)
        singIn, //vou compartilhar uma função pros filhoes para poder assim salvar os dados, mas nao posso esquecer de colocar ele como função na tipagem / funçao que atualiza nosso estado
        signOut,
        isLoagingUserStorageDate,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
