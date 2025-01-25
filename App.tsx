import { StyleSheet, View } from 'react-native';
import {
  useFonts,
  Roboto_700Bold,
  Roboto_400Regular
} from '@expo-google-fonts/roboto';
import { StatusBar } from 'react-native';

//tudo oq é provider vai prover para geral seus componentes internos. Por isso ele sempre deve ta englobando geral
//com esse import eu posso estilzar de forma direta os componentes sem usar o style
import { Center, GluestackUIProvider, Text } from '@gluestack-ui/themed'
//isso prover os estilos costumizados que eu cirei na pasta config aí eu deixeo na tag do
//provider para prover essa config para todos
import { config } from './config/gluestack-ui.config';
import { Loading } from '@components/Loading';
import { Routes } from '@routes/index';
import { AuthContextProvider } from '@contexts/AuthContext';

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_700Bold, Roboto_400Regular });
  return (
    <GluestackUIProvider config={config}>
      <StatusBar
        barStyle="light-content" // deixo branco os icondes
        backgroundColor="transparent" // tira a cor de fundo
        translucent //macete para poder visualizar os icones e deixar a cor da aplicação de fundo
      />
      <AuthContextProvider>
        {fontsLoaded ? <Routes /> : <Loading />}
      </AuthContextProvider>

    </GluestackUIProvider>
  );
}