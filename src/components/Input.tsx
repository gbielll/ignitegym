import { Input as GluestackInput, InputField, FormControl, FormControlErrorText, FormControlError } from "@gluestack-ui/themed"
//cmo o gluesctack se eu for usar um input eu devo definir
//dois tipos  - um que é o conteiner dele (criar ele normal e seu estilo) e o outro
//que é o InputField que é o componente q será digitado (muda oq ta dentro - como texto digitado)

import { ComponentProps } from "react"

//esse ComponentProps ajuda a extrair para props (os componentes do tipo 'InputField' poderia ser outro)
//pq sem ele eu teria q fazer manuealemnte
/*type InputFieldProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};*/
//como nao quero fazer assim, apenas pegar os componentes ja existente em InputField eu uso o 
//componentProps para isso

type Props = ComponentProps<typeof InputField> & {
    errorMessage?: string | null //deixeo opcional pq nem sempre vau ter error - vou receber a mensagem de erro
    isInvalid?: boolean // esse IsInavalid é para validar o input, para depois mudar a cor
    isReadOnly?: boolean //eu vou deixar ele como falso, pq so vou aabilitar ele (pra nao deixar ninguem digitar nada no input) quando eu passar o valor true ou chamr ele (por isso opcional)
}

export function Input({ isReadOnly = false, errorMessage = null, isInvalid = false, ...rest }: Props) {

    //esse !! torna o valor bolleano - V OU F, no caso ambas as variáveis
    //sendo vazio é F, com valor dentro é V
    const invalid = !!errorMessage || isInvalid

    return (
        <FormControl isInvalid={invalid} mb="$4" w="$full">
            <GluestackInput
                isInvalid={isInvalid} //esse isInvalid ja é uma propriedade do gluestack, ams ai eu fiz uma prop com o mesmo  nome
                h="$14"
                borderWidth="$0"
                borderRadius="$md"
                $focus={{ //igual o hover quando clica em cima
                    borderWidth: 1,
                    borderColor: invalid ? "$red500" : "$gray500"
                }}
                $invalid={{ //esse invalid é comando padrao da tag
                    borderWidth: 1,
                    borderColor: "$red500"
                }}
                isReadOnly={isReadOnly}
                opacity={isReadOnly ? 0.5 : 1} //condição caso haja isReadOnly (desabilitar, se ele for v)
            //dasabilita a possibilidade de digitar no input
            >
                <InputField
                    px="$4"
                    bg="$gray600"
                    color="$white"
                    fontFamily="$body"
                    placeholderTextColor="$gray300"
                    {...rest} />
            </GluestackInput>
            <FormControlError>
                <FormControlErrorText color="$red600">
                    {errorMessage}
                </FormControlErrorText>
            </FormControlError>
        </FormControl>
    )
}


/*
balela
<FormControlError>: Serve como um 
contêiner para mensagens de erro, 
aparecendo apenas quando há um erro 
relacionado ao campo do formulário. 
Ele garante que o erro seja exibido de 
forma organizada e estilizada junto ao 
campo que apresenta o problema.

<FormControlErrorText>: Especificamente, 
exibe o texto da mensagem de erro. Ele pode 
mostrar mensagens como "Campo obrigatório" ou 
"Formato inválido". É um subcomponente que estiliza 
o texto de erro para que o usuário saiba exatamente 
qual é o problema.
*/