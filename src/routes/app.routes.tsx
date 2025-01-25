import {
  createBottomTabNavigator,
  BottomTabNavigationProp,
} from "@react-navigation/bottom-tabs";
//devo importar os componentes das rotas que vou usar
import { Home } from "@screens/Home";
import { Exercise } from "@screens/Exercise";
import { Profile } from "@screens/Profile";
import { History } from "@screens/History";

//crio uma tipagem para ter flexibilidade e ainda não exporto
type AppRoutes = {
  home: undefined;
  profile: undefined;
  history: undefined;
  exercise: { exerciseId: string }; //defino que toda vez que eu chamar esse rotra terá que pssar um id para ela
};

//aqui eu exporto definindo a tipagem, eu exporto a tipagem e nao a funçao onde ta as rotas (ela eu exporto como provider e assim da acesso a todas as rotas, basta acess-ala com a tipagem)
/*A tipagem AuthNavigationRoutesProps é exportada para permitir que você use a navegação 
  tipada (com autocompletar e validação) em qualquer lugar do app.*/
export type AppNavigatorRoutesProps = BottomTabNavigationProp<AppRoutes>;

//desestruturar os que vou usar do tab da importação
//macete de colocar aqui o <AppRoutes> pra aparecer as opções que definei de rotas
const { Navigator, Screen } = createBottomTabNavigator<AppRoutes>();

//vou usar as propriedades do gluestack para personalizar os ícones
import { gluestackUIConfig } from "../../config/gluestack-ui.config";

//importar os ícones svg
import HomeSvg from "@assets/home.svg";
import HistorySvg from "@assets/history.svg";
import ProfileSvg from "@assets/profile.svg";
import { Platform } from "react-native";

export function AppRoutes() {
  //desestruturar - pegar apenas o que eu quero do componente, mas nesse caso eu pego o componente do gluestack que consigo pegar todos os estilos de gluestack
  const { tokens } = gluestackUIConfig; //lembro aqui que nesse config tem todas as estilizações
  const iconSize = tokens.space["6"]; //defino assim para usar de forma mais prática, esse space é o tamanho

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, //apagar os textos que aparecem embaixo do nome
        tabBarActiveTintColor: tokens.colors.green500, //quando eu clicar no ícone, ele fica dessa cor
        tabBarInactiveTintColor: tokens.colors.gray200, //quando o ícone não estiver selecionado, eu uso essa cor nele
        tabBarStyle: {
          //uso apenas para estilizar a barra do TAB
          backgroundColor: tokens.colors.gray500,
          borderTopWidth: 0,
          height: Platform.OS === "android" ? 56 : 96, //correção aqui com valores mais explícitos
          paddingBottom: tokens.space["8"],
          paddingTop: tokens.space["2"],
        },
      }}
    >
      <Screen
        name="home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <HomeSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <Screen
        name="history"
        component={History}
        options={{
          tabBarIcon: ({ color }) => (
            <HistorySvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <Screen //eu quero q ele nao seja mais uma menur button e sim apenas uma screen
        name="exercise"
        component={Exercise} // Tela de detalhes do exercício
        options={{
          tabBarButton: () => null, // Remove do menu
          tabBarStyle: { display: "none" }, // Esconde a barra inferior nessa tela
        }}
      />
      <Screen
        name="profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <ProfileSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
    </Navigator>
  );
}
