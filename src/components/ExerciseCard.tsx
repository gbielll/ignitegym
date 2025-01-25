import { Heading, HStack, Image, Text, VStack, Icon } from "@gluestack-ui/themed";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { ChevronRight } from "lucide-react-native"
import { CheckCheck } from "lucide";
import { ExerciseDTO } from "../../config/dtos/ExerciseDTO";
import { api } from "@services/api";

//eses icones do lucide nao da para personalizar de cara, por isso tenho que colocar ele dentro da tag icon e passar ele dentro dela para estilizar o 'icon' pra assim afetar no icones do vector

//falo que essa tipagem será do tipo TouchableOpacityProps
//so passando as propriedades padrões do TouchableOpacityProps : fica estático, preciso passar outros dados caso eu queira 
type Props = TouchableOpacityProps & {
  data: ExerciseDTO
}
//dessa forma passando apenas o 'data' com uma tipagem ja definida 
//nao preicp definir namente aqui, basta apenas acessar com data.varivel


export function ExerciseCard({ data,...rest }: Props) {
    return (
        <TouchableOpacity {...rest}>
            <HStack bg="$gray500" alignItems="center" p="$2" pr="$4" rounded="$md" mb="$3">

                <Image
                    source={{ 
                       //aqui tem uma particularidade, pq tipo a url da img tem o url do servidor o https  e no final o nome, por isso o pessoal salva no banco apenas o nome da imagem    
                       //aqui eu passo a url do servidor e seu o restante alem de passar no final o nome dda imagem 
                       uri: `${api.defaults.baseURL}/exercise/thumb/${data.thumb}`
                    }}// essa imagem n ta aparecendo

                    alt="Imagem do exercício"

                    w="$16"
                    h="$16"
                    rounded="$md"
                    mr="$4"
                    resizeMode="cover"
                />

                <VStack flex={1}>
                    <Heading fontSize="$lg" color="$white" fontFamily="$heading" >
                        {data.name}
                    </Heading>
                    <Text fontSize="$sm" color="$gray200" mt="$1" numberOfLines={2} /*limyte de linhas, apos isso ele coloca os ... */>{data.series} séries x {data.repetitions} repetições</Text>
                </VStack>
                <Icon as={ChevronRight} color="$gray300"/>
            </HStack>
        </TouchableOpacity>
    )
}