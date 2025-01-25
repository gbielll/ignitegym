import { Toast, ToastTitle, useToast, VStack } from "@gluestack-ui/themed";
import { ScreenHeader } from "@components/ScreenHeader";
import { HistoryCard } from "@components/HistoryCard";
import { useCallback, useState } from "react";
import { SectionList } from "react-native";
import { Heading, Text } from "@gluestack-ui/themed";
import { AppError } from "@utils/AppError";
import { api } from "@services/api";
import { useFocusEffect } from "@react-navigation/native";
import { HistoryByDayDTO } from "../../config/dtos/HistoryByDayDTO";
import { Loading } from "@components/Loading";

export function History() {
  //estado para saber se está carregando os dados
  const [isLoading, setIsLoading] = useState(true);
  //defino a tipagem
  const [exercises, setExercises] = useState<HistoryByDayDTO[]>([]);

  const toast = useToast();

  //buscar as informaçoes do back
  async function fetchHistory() {
    try {

      setIsLoading(true);
      //buscando as informaçoes da api, eu nao preciso informar o usuario logado
      //pq na api eu ja fiz a authenticaçao do token do usuário. logo ja sabem qual dos dados retonar aqui de qual usuário
      /*Quando você faz a requisição api.get('/history'), o 
      token do usuário logado já está incluído no cabeçalho da requisição 
      (Authorization: Bearer <token>).*/
      /*A API usa esse token para identificar quem está fazendo a requisição e 
      retorna os dados desse usuário específico.*/

      const response = await api.get('/history');
      setExercises(response.data);
    } catch (error) {
      console.log(error);
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível carregar o histórico";
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
      setIsLoading(false)
    }
  }

  //sempre renderiza ao entrar na tela, difrente do useEffect que faz isso apenas quando todo o app inicia
  //esse useCallBack anda em conjunto ele anota a referencia da função para noa rederizar ela de forma aleatoria, ou se for meio q disparado por algum evento de forma disnecessária

  useFocusEffect(
    useCallback(() => {

      fetchHistory();
    }, []) //toda vez q ele mudar será chamado a função, se fosse com o useeffection isso so aconteria na prmeira carregada da tela (ou seja se eu enetrar nela de novo tepricamente ja teria sido carregada, nisso nao atualiza novamente, permanece o que ja estava)
  );

  return (
    <VStack flex={1}>
      <ScreenHeader title="Histórico de exercício" />

      {isLoading ? (
        <Loading />
      ) : (
        <SectionList
          sections={exercises} //pego os dados que criei em frome de array
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            <HistoryCard data={item} />}
          //esse comando que separa as seções {de acorco com oq especifico dentro} do sectionList e mostras tb os titles
          renderSectionHeader={({ section }) => (
            <Heading
              color="$gray200"
              fontSize="$md"
              mt="$10"
              mb="$3"
              fontFamily="$heading"
            >
              {section.title}
            </Heading>
          )}
          style={{ paddingHorizontal: 32 }}
          contentContainerStyle={
            //se a lista for vazia, entao eu faço (pq se eu usar o ?, eu tenho q fazer uma cond :)
            exercises.length === 0 && {
              flex: 1,
              justifyContent: "center",
            }
          }
          //caso n tenha nada na lista
          ListEmptyComponent={() => <Text>Não há nada na lista ainda</Text>}
        />
      )}
    </VStack>
  );
}

