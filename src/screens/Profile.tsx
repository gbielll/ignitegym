import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import {
  Center,
  Heading,
  Text,
  VStack,
  onChange,
  useToast,
} from "@gluestack-ui/themed";
import { Alert, ScrollView, TouchableOpacity } from "react-native";

import { useState } from "react";

import { AppError } from "@utils/AppError";

//pegar tuddo da propriedade do import de img picker
import * as ImagePicker from "expo-image-picker";
//pega tudo de filesystem - biblioteca de validação de tamanho
import * as FileSystem from "expo-file-system";
import { ToastMessage } from "@components/ToastMassage";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { api } from "@services/api";
import { Toast } from "@gluestack-ui/themed";

type FormDataProps = {
  password?: string | null | undefined;
  old_password?: string | undefined;
  confirm_password?: string | null | undefined;
  email: string;
  name: string;
};

//criaçao dos schemas para validação
const profileShema = yup.object({
  name: yup.string().required("Informe seu nome."),
  email: yup.string().required("Informe seu email.").email("Email inválido"),
  old_password: yup.string(),
  //esse .nullable().transform((value) => !!value ? value : null), é para evitar que seja digitado um valor de uma string vazia
  //eu posso tentar limitar um valor min q ajuda tb, mas n sao todos os campos q posso definir isso
  //.nullable() valida se ha valor null ou seja, ele pode ser null
  /*.transform((value) => !!value ? value : null), transforma o value atual tranforma em booelano (se houver valor é V e seta o valor atual
  se nao ele deixa null) se for null*/
  //isso ajuda a insertar no back como null e nao como uma string vazia : underfined
  password: yup
    .string()
    .min(6, "A senha deve ter pelo menos 6 dígitos")
    .nullable()
    .transform((value) => (!!value ? value : null)),
  confirm_password: yup
    .string()
    .nullable()
    .transform((value) => (!!value ? value : null))
    //nesse yup.ref eu passo a referência do campo e um valor vazio caso nao seja valido
    .oneOf([yup.ref("password"), null], "A confirmação da senha está incorreta")
    //faz vareficição de forma condicinal, sem necesidade de ter q precionar no campo para apitar o aviso
    .when("password", {
      //valor re referencia, se nele (password) houver valor esse outro campo passar a ser obrigatório tb e n houver passworld esse outro campo é opcional tb
      //se... for algo, acesso o campo (field)
      is: (Field: any) => Field, // se houver valor dentro dele (password) ele seta o field (ouse ja, vai vser vrdadeiro) e vai pro than
      then: (
        //the : entao faça um schema com navas validações
        schema
      ) =>
        schema
          .nullable()
          .required("Informe a confirmação da senha.")
          .transform((value) => (!!value ? value : null)), //isso ajuda tb a sumir com ammensgam de eror se nao houver valor
    }),
});

export function Profile() {
  const [isUpdating, setIsUpadating] = useState(false);

  const [userPhoto, setUserPhoto] = useState("https:github.com/gbielll.png");

  //notificação de faço assim
  const toast = useToast();

  //rertonar o user do contexto- eu nao recupero os dado do usuário diretamente do banco
  // e sim do armazenamento deleo globalemnte que faço no app (claro faço isso do banco, mas eu guardo ele no amazenamento global)
  const { user, updateUserProfile } = useAuth();
  //pegas as informaçoes para editar
  //esse formState:{errors} é para recuperar os erros
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    //valores pre definidos
    defaultValues: {
      name: user.name, //esse name e email é o nome do input control o qual definir, logo com isso consigo deixar valores nele ja setado  graças ao Value,
      //por isso eu defino no field que vou usasr o value, eu defino ele quanod vou usar valores iniciais para deixar présetados
      email: user.email,
    },
    //validaçao dos campus
    //sempre veja se no schema tem todos os dados do type, se nao o resolver apita um erro
    resolver: yupResolver(profileShema),
  });

  async function handleUserPhotoSelect() {
    try {
      //retorno a img para essa variavel
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        // abrir galeria
        mediaTypes: ImagePicker.MediaTypeOptions.Images, //pegar appenas img
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true, //frame para editar
      });

      if (photoSelected.canceled) {
        return; //caso o usuário cancelar a gente finalizar
      }

      const photoURI = photoSelected.assets[0].uri; //essse assets[0] q se encontra a foto e tenho q passar junto a sua url

      if (photoURI) {
        //vou pegar as informçaõe photoURI, incluindo as que quero (pode ser q n venha, por isso eu especifico com) "as"
        const photoInfo = (await FileSystem.getInfoAsync(photoURI)) as {
          size: number;
        };

        if (photoInfo.size && photoInfo.size / 1024 / 1024 > 5) {
          return toast.show({
            placement: "top", //definir onde eu quero q a menssagem apareça
            render: (
              { id } //ele ja gera um id o render
            ) => (
              <ToastMessage
                id={id}
                title="Essa imagem é muito grande :("
                description="Escolha uma de até 5MB"
                action="error"
                onClose={() => toast.close(id)}
              />
            ),
          });
        }

        //setUserPhoto(photoURI);
        //aqui eu retorno apenas extensao da img se é png ou jpag...
        const fileExtension = photoSelected.assets[0].uri.split(".").pop();
        //crio um obj que será as informações da imagem pois será enviado um arquivo par ao back e nao todo um body
        const photoFile = {
          //esse nome do arquivo da iamgem é sempre bom coloca ro nome do usuário mais a extensao da imagem retornada
          // esse toLowerCase é para deixar tueo em minusculo
          // Nome do arquivo a ser enviado
          name: `${user.name}.${fileExtension}`.toLowerCase(),
          // Caminho para a imagem no dispositivo
          //declaro a uri da imagem, ou seja, onde ela ta salva no dispositivo do usuário, que é exramere aqueka url q eu pego
          uri: photoSelected.assets[0].uri,
          //defino o tipo da imagem - que é uma imagem.png ou jpag
          // Tipo do arquivo (ex.: image/jpeg, image/png)
          type: `image/${fileExtension}`,
        } as any; //esse as any ajuda a definir uma tipagem pro photoFile (sendo qualquer coisa tipo um var)

        //deve ser fieto um formulario, para colocar as informações, par enviar a foto pro back
        //dentro desse formulario vai contém as informaçoes que cirei a cima
        const userPhotoUploadForm = new FormData();
        //primeiro fomurlario do append é o nome do campo (deve ser igual no back) e o que vou enviar
        //o back vai receber esse valor la no campo chamado 'avatar'
        //é tipo o nome do formuario ("avatar") e os seus dados (photoFile)
        userPhotoUploadForm.append("avatar", photoFile); //crie o formulário com o nome dele ('avatar')

        //feito tadas as requisições a cima, agora posso enviar pro back
        //patch eu vou atualizar um campo específico
        //definir definir um obj com um novo cabeçalho
        //E retorno isso para um reponse que ja retorna atualiazado
        const avatarUpdateResponse = await api.patch(
          "/users/avatar",
          userPhotoUploadForm,
          {
            // Configuração do cabeçalho para envio do arquivo
            headers: {
              //Indica que o cliente (seu aplicativo) espera receber uma resposta no formato JSON.
              accept: "application/json", // Especifica que a resposta esperada da API está no formato JSON.
              //Esse formato é usado para enviar dados mistos, como arquivos e texto.
              "content-type": "multipart/form-data", // Define o tipo do conteúdo enviado como multipart/form-data, necessário para upload de arquivos.
            },
          }
        );

        //AGORA VOU SALVAR LOCALMNETE NO DISPOSITIVO

        //pego os dados de user: name, id, avatar... e deixo sepado em um estado
        const userUpdated = user;
        // retorno pra ca o avatar q já está na api - esse data e o avatar já sao os nomes definidos dos abj de dentro do back
        //aqui eu atualizdo apenas o avatar do user em userUpated, mas ele ainda continua com os outros dados do usupario,pq ue so mudei um
        userUpdated.avatar = avatarUpdateResponse.data.avatar;
        //apos fazer a alteração em cima eu passo o usuário por compelto, pq meio q ele ja ta atualizado
        updateUserProfile(userUpdated);

        toast.show({
          placement: "top", //definir onde eu quero q a menssagem apareça
          render: (
            { id } //ele ja gera um id o render
          ) => (
            <ToastMessage
              id={id}
              title="Foto atualizada"
              description="sua foto foi atualizada com sucesso! :)"
              action="success"
              onClose={() => toast.close(id)}
            />
          ),
        });
      }
    } catch (error) {
      toast.show({
        placement: "top", //definir onde eu quero q a menssagem apareça
        render: (
          { id } //ele ja gera um id o render
        ) => (
          <ToastMessage
            id={id}
            title="Erro ao atualizar imagem"
            description="não foi possível atualizar sua aimagem no momemnto :("
            action="error"
            onClose={() => toast.close(id)}
          />
        ),
      });
      console.log(error);
    }
  }

  //recuperar os dados do usuário digitado nos inputs (dado atualizados)
  async function handleProfileUpdate(data: FormDataProps) {
    try {
      setIsUpadating(true);
      //NO AMARZENTMO LOCAL VOU APENAS MUDAR O NOME, OS DEMAIS DADOS CONTINUAM IGUAL
      //pego o usuário com os dados antigp para apenas mudar o nome
      const userUpdate = user;
      //passar o novo nome do usuário
      userUpdate.name = data.name;

      //put atualiza
      //aqui eu envio name(igual do back): valor {name : data.name}
      //ou eu posso passar apenas o data(contem os dados que dejeso q sejam atualziados) (contanto que o nome dos dado de date seja igual do back)
      //se a senha for null ou undefield no back ele nao muda nada, la ja tem essa vaçidaçaõ, mudando apenas os outros camspo
      // a apartir do momento q eu mudo algo no input da senha com digtos mesmo sem ser null ai sim ele muda ao enviar
      //É AQUI NO BACK Q VAI VALIDAR SE A SENHA ANTIGA É REALMENTE A SENHA ANTIGA PARA PODER ATUALIZAR, SE NAO FOR ELE VAI RETONAR ERRO
      await api.put("/users", data);

      // Atualizo os dados do usuário, mas não retorno o objeto completo imediatamente,
      // pois ele não contém todos os dados necessários (como token e outras informações importantes).
      // No caso, estou apenas atualizando o nome do usuário.
      // Os outros dados permanecem os mesmos e são gerenciados separadamente.
      //aqui eu so to mudnando o nome pq é no banco local
      //eu mudo a senha e pah ali em cima na api quando eu mando data para a rota
      await updateUserProfile(userUpdate);

      toast.show({
        placement: "top", //definir onde eu quero q a menssagem apareça
        render: (
          { id } //ele ja gera um id o render
        ) => (
          <ToastMessage
            id={id}
            title="dados atualizados"
            description="seus dados foram atualizados com sucesso:)"
            action="success"
            onClose={() => toast.close(id)}
          />
        ),
      });
    } catch (error) {
      console.log(error);
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível carregar os exercicios musculares";
      /*action="error": Define o tipo de ação ou contexto do toast (neste caso, um erro).
          variant="outline": Aplica um estilo de borda ao contêiner.*/
      toast.show({
        placement: "top",
        render: (
          { id } //ele ja gera um id o render
        ) => (
          <ToastMessage
            id={id}
            title="Ops!"
            description="Não foi possível atualizar os dados"
            action="error"
            onClose={() => toast.close(id)}
          />
        ),
      });
    } finally {
      setIsUpadating(false);
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 36,
        }}
      >
        <Center mt="$6" px="$10">
          <UserPhoto
            source={
              //aqui ele puxa a aomagem do banco local para poder exibir a imagem, mesmo se o banco cair, pq na url ta sendo levado em conta o banco local
              user.avatar
                ? //faço a interporlaçoa da imagem pq ela é uma url complera
                { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` }
                : userPhoto
            }
            alt="Foto do usuário"
            size="xl"
          />

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text
              color="$green500"
              fontFamily="$heading"
              fontSize="$md"
              mt="$2"
              mb="$8"
            >
              Alterar foto
            </Text>
          </TouchableOpacity>

          <Center w="$full" gap="$2">
            <Controller
              control={control} //essa parte é meio q padrao
              name="name"
              //informo que vou usar para  controlar
              render={({ field: { value, onChange } }) => (
                <Input
                  placeholder="Nome"
                  bg="$gray500"
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control} //essa parte é meio q padrao
              name="email"
              //informo que vou usar para  controlar
              render={({ field: { value, onChange } }) => (
                <Input
                  placeholder="E-mail"
                  bg="$gray500"
                  isReadOnly /*desabilitar o input, ta sendo receibdo como props*/
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Center>

          <Heading
            alignSelf="flex-start"
            fontFamily="$heading"
            color="$gray200"
            fontSize="$md"
            mt="$5"
            mb="$2"
          >
            Alterar senha
          </Heading>
          <Center w="$full" gap="$2">
            <Controller
              control={control} //essa parte é meio q padrao
              name="old_password"
              //informo que vou usar para  controlar
              //nao preciso visualiar o erro da senha antiga, pq ja vai ser feita no back
              render={({ field: { onChange } }) => (
                <Input
                  placeholder="Senha antiga"
                  bg="$gray500"
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control} //essa parte é meio q padrao
              name="password"
              //informo que vou usar para  controlar
              render={({ field: { onChange } }) => (
                <Input
                  placeholder="Nova antiga"
                  bg="$gray500"
                  onChangeText={onChange}
                  errorMessage={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control} //essa parte é meio q padrao
              name="confirm_password"
              //informo que vou usar para  controlar
              render={({ field: { onChange } }) => (
                <Input
                  placeholder="Confirme a nova senha"
                  bg="$gray500"
                  onChangeText={onChange}
                  errorMessage={errors.confirm_password?.message}
                />
              )}
            />
            <Button
              title="Atualizar"
              onPress={handleSubmit(handleProfileUpdate)}
              isLoading={isUpdating}
            />
          </Center>
        </Center>
      </ScrollView>
    </VStack>
  );
}
