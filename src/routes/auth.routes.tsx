import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { SingUp } from "@screens/sign-up copy";
import { SingIn } from "@screens/sign-in";

type AuthRoutes = {
  signIn: undefined; //tem q ser o mesmo nome ali no Scree name - pq oq referencia é essa rota é o component={SingIn}
  signUp: undefined;
};

// Exporto as rotas para poder utilizá-las em outros lugares.
// Crio o tipo de navegação para as rotas de autenticação e defino suas propriedades com NativeStackNavigationProp.
//eu vou expotar esse type pra acessar nos outros arquivos para assim eu mexer na rota
export type AuthNavigationRoutesProps = NativeStackNavigationProp<AuthRoutes>;

//eu posso colcocar o <AuthRoutes> aqui so para quando
//eu for colocar o nome nas screen aparecer as opções
//apenas uma vantagem
const { Navigator, Screen } = createNativeStackNavigator<AuthRoutes>();

export function AuthRoutes() {
  //chat, pq eu nao expoto essa função? e sim a de cima do type ? como aquele type ta relaciono a essa funçao?
  return (
    <Navigator screenOptions={{ headerShown: false }}>
      <Screen name="signIn" component={SingIn} />

      <Screen name="signUp" component={SingUp} />
    </Navigator>
  );
}
