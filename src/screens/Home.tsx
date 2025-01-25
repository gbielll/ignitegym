import { Group } from "@components/Group";
import { HomeHeader } from "@components/HomeHeader";
import {
  Center,
  Heading,
  HStack,
  Text,
  Toast,
  useToast,
  VStack,
} from "@gluestack-ui/themed";
import { useCallback, useEffect, useState } from "react";
import { FlatList } from "react-native";
import { ExerciseCard } from "@components/ExerciseCard";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppError } from "@utils/AppError";
import { ToastTitle } from "@gluestack-ui/themed";
import { api } from "@services/api";
import { ExerciseDTO } from "../../config/dtos/ExerciseDTO";
import { Loading } from "@components/Loading";
import { AppNavigatorRoutesProps } from "@routes/app.routes";

import SkeletonContent from 'react-native-skeleton-content';

export function Home() {
  const [isLoading, setIsloading] = useState(true);
  const toast = useToast();

  //digo que vai ser um array de string minha tipagem
  const [groups, setGroups] = useState<string[]>([]);
  //sempre coloco esse [], mesmo nao estando na tipagem para dizer que é uma array
  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [groupSelected, setGroupSelected] = useState("antebraço");

  const navigation = useNavigation<AppNavigatorRoutesProps>();

  function handleOpenExerciseDetails(id: string) {
    //eu definir que essa rota ao ser chamada deve ser passar tb um id
    //esse exerciseId foi o nome do varriavel q definir ele devo passar ao chamar essa rota
    navigation.navigate("exercise", { exerciseId: id });
  }

  //buscar no servidor os grupos - get
  async function fetchGroups() {
    try {
      const response = await api.get("/groups");
      console.log(response.data);
      setGroups(response.data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível carregar os grupos musculares";
      /*action="error": Define o tipo de ação ou contexto do toast (neste caso, um erro).
        variant="outline": Aplica um estilo de borda ao contêiner.*/
      toast.show({
        placement: "top",
        render: () => (
          <Toast action="error" variant="outline">
            <ToastTitle>{title}</ToastTitle>
          </Toast>
        ),
      });
    }
  }

  //buscar os exercicios no servidor
  async function fetchExercisesByGroup() {
    try {
      setIsloading(true);
      //vou buscar de acordo com o  grupo ao qual que selecionei (cliquei), pois tem uma rota que valida atrves de id (que é o nome do grupo)
      const response = await api.get(`/exercises/bygroup/${groupSelected}`);
      setExercises(response.data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível carregar os exercicios musculares";
      /*action="error": Define o tipo de ação ou contexto do toast (neste caso, um erro).
          variant="outline": Aplica um estilo de borda ao contêiner.*/
      toast.show({
        placement: "top",
        render: () => (
          <Toast action="error" variant="outline">
            <ToastTitle>{title}</ToastTitle>
          </Toast>
        ),
      });
    } finally {
      setIsloading(false);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  //sempre renderiza ao entrar na tela, difrente do useEffect que faz isso apenas quando todo o app inicia
  //esse useCallBack anda em conjunto ele anota a referencia da função para noa rederizar ela de forma aleatoria, ou se for meio q disparado por algum evento de forma disnecessária

  useFocusEffect(
    useCallback(() => {
      fetchExercisesByGroup();
    }, [groupSelected]) //toda vez q ele mudar será chamado a função, se fosse com o useeffection isso so aconteria na prmeira carregada da tela (ou seja se eu enetrar nela de novo tepricamente ja teria sido carregada, nisso nao atualiza novamente, permanece o que ja estava)
  );

  return (
    <VStack flex={1}>
      <HomeHeader />
     
      <FlatList
        data={groups}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          //ESSE .toLowerCase() É PARA PASSAR TUDO PARA MINUSCULO - PARA MAIUSCULO : TOUPPERCASE -> cOsta === coStA
          <Group
            name={item}
            isActive={groupSelected.toLowerCase() === item.toLowerCase()}
            onPress={() => setGroupSelected(item)}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 30 }} //estilização do flatList
        style={{ marginVertical: 40, maxHeight: 44, minHeight: 44 }}
      />
      {isLoading ? (
        <Loading />
      ) : (
        <VStack flex={1} px="$8">
          <HStack justifyContent="space-between" mb="$5" alignItems="center">
            <Heading color="$gray200" fontSize="$md" fontFamily="$heading">
              Exercícios
            </Heading>
            <Text color="$gray200" fontSize="$sm" fontFamily="$body">
              {exercises.length}
            </Text>
          </HStack>

          <FlatList
            data={exercises}
            keyExtractor={(item) => item.id}
            //cuidado! devo passar o {item} para saber oq redenrizer
            renderItem={({ item }) => (
              //pasando apenas data={item} manda geral e la apenas acesso sendo data.name,.email ... para nao ter q mandar todos um por um
              //passo o id para a rota para poder acessar
              <ExerciseCard
                onPress={() => handleOpenExerciseDetails(item.id)}
                data={item}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 20,
            }}
          />

          
        </VStack>
      )}
    </VStack>
  );
}
