import { NavigationContainer, DefaultTheme } from "@react-navigation/native"
import { Box } from "@gluestack-ui/themed"
import { AuthRoutes } from "./auth.routes"
import { gluestackUIConfig } from "../../config/gluestack-ui.config"

//rotas so sign in
import { AppRoutes } from "./app.routes"
import { useContext } from "react"
import { AuthContext } from "@contexts/AuthContext"
import { useAuth } from "@hooks/useAuth"
import { Loading } from "@components/Loading"

export function Routes() {
    // É bom definir a cor de fundo no NavigationContainer,
    // pois ela será aplicada a todas as telas, já que ele é o elemento principal que renderiza as páginas.
    //isso evitar colocar tela por tela cor de fundo, posso colocar em um unico lugar
    const theme = DefaultTheme //importo ele - esse theme são config de estilização
    theme.colors.background = gluestackUIConfig.tokens.colors.gray600

    //acessarf o conteudo do contexto criado com o UseContext
    //passo dentro do useContext o conexto que criei q quero acessar os dados
    //nesse textData eu tenho acesso a toda a tipagem, dados, do contexto AuthContext
    //const textData = useContext(AuthContext)
    //console.log("Usuário logado",textData.user.name)
    
    //como eu criei um arquivo apenas para armazenar o nome do context (personalizar o nome do AuthConxt de forma masi simoels)
    //eu chamo aqui
    //esse user é da tipagem e do constexto que passo pra ca destruturado, nele se hiuver usuário é pq tem user logago
    //user.name / user.email ...
    const {user, isLoagingUserStorageDate} = useAuth()
    
    /*esse isLoagingUserStorageDate vai sempre ficar 
    alternando entre V ou F, decorrente se carregou ou não os dados no storage, no 
    componente onde eu crio ele eu faço tod a validção de qundo ele será F OU V, e aqui
    apenas retorno ele com se valor setado dentro para fazer a validação*/
    if(isLoagingUserStorageDate){
        return <Loading/> //eu criei esse compoente de loading
    }

    return (
        <Box flex={1}>
            {/*esse box é para evotar aquela tela branca q apere ao carregar a tela */}
            <NavigationContainer theme={theme}>
                { user.id ? <AppRoutes/> : <AuthRoutes/> }
            </NavigationContainer>
        </Box>
    )
}