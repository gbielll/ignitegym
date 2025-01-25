import { Heading, HStack, Text, VStack, Icon } from "@gluestack-ui/themed";
import { UserPhoto } from "./UserPhoto";
import { LogOut } from "lucide-react-native"
import { useAuth } from "@hooks/useAuth";
import userPhotoDefault from '@assets/userPhotoDefault.png'
import { TouchableOpacity } from "react-native";
import { api } from "@services/api";

export function HomeHeader() {
    const { user, signOut } = useAuth(); //importar do meu contexto
    return (
        <HStack bg="$gray500" pt="$16" pb="$5" px="$8" alignItems="center" gap="$4" >
            <UserPhoto
                //validação para saber se há avatar, ou seja tela de perfil
                source={user.avatar 
                    //faço a interporlaçoa da imagem pq ela é uma url complera
                    ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } 
                    : userPhotoDefault}
                alt="Imagem do usuário"
                w="$16"
                h="$16"
            />
            <VStack flex={1}>
                <Text color="$gray100" fontSize="$sm">
                    Olá,
                </Text>
                <Heading color="$gray100" fontSize="$md">{user.name}</Heading>
            </VStack>
            <TouchableOpacity onPress={signOut}>
                <Icon as={LogOut} color="$gray200" size="xl" />
            </TouchableOpacity>

        </HStack>
    )
}