import { VStack, Image, Center, Text, Heading, ScrollView, onChange, useToast } from '@gluestack-ui/themed'

import BackgroudImg from "@assets/background.png"
import Logo from "@assets/logo.svg"
import { Input } from '@components/Input'
import { Button } from '@components/Button'

import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup" //para erros
//controller que controla nossos inputs
import { useForm, Controller } from 'react-hook-form'

//navegação - preciso dos dois arquivos
import { AuthNavigationRoutesProps } from "@routes/auth.routes"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from '@hooks/useAuth'
import { useState } from 'react'
import { AppError } from '@utils/AppError'
import { Toast } from '@gluestack-ui/themed'
import { ToastTitle } from '@gluestack-ui/themed'

type FormDataProps = {
    email: string,
    password: string
}

const signInSchema = yup.object({
    email: yup.string().required('Informe seu e-mail').email('Informe um email válido'),
    password: yup.string().required('Informe sua senha')
})

export function SingIn() {

    //funçao do conexte de gerencialemnto global
    //destruturo o q quero passar
    const { singIn } = useAuth()

    const toast = useToast()

    const [isLoading, setIsloading] = useState(false)

    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        resolver: yupResolver(signInSchema)
    })

    //defino o tipo que foi justamente la nas rotas o type que exportei
    const navigator = useNavigation<AuthNavigationRoutesProps>()
    //ao chamar essa função ele leva a essa rota
    function handleNewAccount() {
        navigator.navigate("signUp")
    }

    async function handlesingIn({ email, password }: FormDataProps) {
        try {
            setIsloading(true)
            //função do contexto global para gerencialmento global e enviar os dados para login
            await singIn(email, password);
            console.log("Login realizado com sucesso");
        } catch (error) {
            //essa instancia é pra saber se eesse erro ja ta la, se for pq é tratado se n e´outro mesmo
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : 'Não foi posspivel entrar. Tente novamente mais tarde.'

            toast.show({
                placement: "top",
                render: () => (
                    <Toast action="error" variant="outline">
                        <ToastTitle>{title}</ToastTitle>
                    </Toast>
                ),
            });

            setIsloading(false)

        } finally {
            setIsloading(false);
        }

    }


    //todos esses comando bem como suas configurações sao do import do gluesctk
    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1/* ocupar todo o espaço */ }} showsVerticalScrollIndicator={false}>
            <VStack flex={1}>
                {/*esse VStack coloco os arquivos na vertical */}
                <Image
                    w="$full" //da propria conf do gluestack
                    h={624}
                    source={BackgroudImg}
                    defaultSource={BackgroudImg} //ele ajuda a acelara a imagem, no carregamento da imagem
                    alt="Pessoas treiando"
                    position='absolute'
                />

                <VStack flex={1} px="$10" pb="$16">


                    <Center my="$24">
                        {/*my - vertival*/}
                        <Logo />
                        <Text color="$gray100" fontSize="$sm">
                            Treine sua mente e seu corpo
                        </Text>
                    </Center>

                    <Center gap="$2">

                        {/*esse Heading é um compoente de importação de titulo*/}
                        <Heading color="$gray100">Acesse  a conta</Heading>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="E-mail"
                                    keyboardType='email-address'
                                    autoCapitalize="none" //evotar a primeira letra maiucula
                                    errorMessage={errors.email?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="Senha"
                                    secureTextEntry //ele coloca aquelas bolinhas
                                    errorMessage={errors.password?.message}
                                />
                            )}
                        />

                        <Button title="Acessar" onPress={handleSubmit(handlesingIn)} isLoading={isLoading} />
                    </Center>
                    <Center flex={1} justifyContent="flex-end" mt="$4">
                        <Text color="$gray100" fontSize="$sm" mb="$3" fontFamily="$body">
                            Ainda não tem acesso?
                        </Text>
                        <Button title="Criar conta" variant="outline" onPress={handleNewAccount} />
                    </Center>
                </VStack>
            </VStack>
        </ScrollView>
    )
}