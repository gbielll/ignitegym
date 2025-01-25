import {
  VStack,
  Text,
  Icon,
  HStack,
  Heading,
  Image,
  Box,
  useToast,
  Toast,
  ToastTitle,
} from "@gluestack-ui/themed";
import { ScrollView, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native"; // Ícone de voltar
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@routes/app.routes";

import { Button } from "@components/Button";

import BodySvg from "@assets/body.svg";
import SeriesSvg from "@assets/series.svg";
import Repetitionsvg from "@assets/repetitions.svg";
import { AppError } from "@utils/AppError";
import { api } from "@services/api";
import { useEffect, useState } from "react";
import { ExerciseDTO } from "../../config/dtos/ExerciseDTO";
import { Loading } from "@components/Loading";

type RouteParamsProps = {
  //recuperar o Id ao qual envio toda vez que chamo essa rota
  exerciseId: string;
};

export function Exercise() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const route = useRoute();
  //aqui com esse .params eu recupero os paramentos que sao envioado para essa rota
  //consigo destruturar eles para recuperar
  const { exerciseId } = route.params as RouteParamsProps;

  //validar se foi carregado as informaçoes antes de exebir
  const [isLoading, setIsLoading] = useState(true);

  //carregamento do button
  const [submitRegister, setSubmitRegister] = useState(false);

  const toast = useToast();

  //estado para armazemar as informaçoes do exerciso e defino sua tipagem ele nao precisa ser um array [] pq é apenas um unico obj {}
  //ou seja nao é vários obj
  const [exercise, setExervise] = useState<ExerciseDTO>({} as ExerciseDTO);

  function handleGoBack() {
    navigation.goBack();
  }

  //recuperar os dados do exercício
  async function fetchExerciseDetails() {
    try {
      setIsLoading(true);
      //aqui eu recuro as informaçoes de cada exerciso atraves do id dele que eu passo pela rota
      //essa rota é manipulada pelo id
      const response = await api.get(`/exercises/${exerciseId}`);
      setExervise(response.data); //recupera os dados de cada exerciso epecífico pelo seu id que é passado
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível carregar os detalhes do exerciso";
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
      setIsLoading(false);
    }
  }

  //registrar no historico o exervicio
  async function handleExerciseHistoryRegister() {
    try {
      //enviar os dados desse determinado exerciso pelo id para rota
      /*se liga, nesse exemplo eu mando exercise_id: exerciseId,
         pq no servidor tem um parametro do tipo exercise_id: valor, por isso eu 
         tenho q definir o nome que esta no servidor junto com o valor q quero enviar
         para o servidor saber qual é.
         no registro de login eu nao informo o nome, ja mando direto({email,senha...}
         pq no servidor é esse mesmo nome: email:email... ai nao precisa definir*/
         setSubmitRegister(true);
      await api.post("/history", { exercise_id: exerciseId });
      toast.show({
        placement: "top",
        render: () => (
          <Toast action="success" variant="outline">
            <ToastTitle>Parabéns! Exercício salvo com sucesso!</ToastTitle>
          </Toast>
        ),
      });

      navigation.navigate('history'); //apos salvar um treino ele manda para a tela de historico
      
    } catch (error) {
      console.log(error);
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível registrar esse exercício";
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
      setSubmitRegister(false);
    }
  }

  useEffect(() => {
    fetchExerciseDetails();
  }, [exerciseId]); //garantir que busque navamente as informaçoes do id quando  mudar

  return (
    <VStack flex={1}>
      <VStack px="$8" bg="$gray500" pt="$12">
        <TouchableOpacity onPress={handleGoBack}>
          <Icon as={ArrowLeft} color="$green500" size="xl" />
        </TouchableOpacity>

        <HStack
          justifyContent="space-between"
          alignItems="center"
          mt="$4"
          mb="$8"
        >
          <Heading
            color="$gray100"
            fontFamily="$heading"
            fontSize="$lg"
            flexShrink={1} // Evita que os componentes internos empurrem uns aos outros
          >
            {exercise.name}
          </Heading>
          <HStack alignItems="center">
            <BodySvg />
            <Text color="$gray200" ml="$1" textTransform="capitalize">
              {exercise.group}
            </Text>
          </HStack>
        </HStack>
      </VStack>
      {isLoading ? (
        <Loading />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 32,
          }}
        >
          <VStack p="$8">
            <Box rounded="lg" mb={3} overflow="hidden">
              <Image
                //faço aqui o memso esquema da url para recuperar a imagem apenas com o nome
                //O defaults no Axios serve para definir regras padrão
                source={{
                  uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}`,
                }}
                alt="Exercício"
                resizeMode="cover"
                rounded="$lg"
                w="$full"
                h="$80"
              />
            </Box>
            <Box bg="$gray500" rounded="$md" pb="$4" px="$4">
              <HStack
                alignItems="center"
                justifyContent="space-around"
                mb="$6"
                mt="$5"
              >
                <HStack>
                  <SeriesSvg />
                  <Text color="$gray200" ml="$2">
                    {exercise.series} séries
                  </Text>
                </HStack>

                <HStack>
                  <Repetitionsvg />
                  <Text color="$gray200" ml="$2">
                    {exercise.repetitions} repetições
                  </Text>
                </HStack>
              </HStack>

              <Button
                title="Marcar como realizado"
                isLoading={submitRegister} //se for V o isLoading decorrete ao valor booleano do  sub,itRegister esse button será desativado
                onPress={handleExerciseHistoryRegister}
              />
            </Box>
          </VStack>
        </ScrollView>
      )}
    </VStack>
  );
}
