import { Button as GluestackButton, Text, ButtonSpinner } from "@gluestack-ui/themed"
import { ComponentProps } from "react"

// Este tipo é usado para adicionar mais tipos personalizados além dos que já existem no componente.
// Aqui, estamos pegando as propriedades padrão do GluestackButton e adicionando a propriedade "title".
/*Isso é útil porque evita que você tenha que 
reescrever os tipos manualmente e reduz o risco 
de erro se as props do componente mudarem futuramente. */

/*ComponentProps: Esta é uma utility 
type do TypeScript, que ajuda a extrair 
automaticamente o tipo de props de um componente.*/
/*typeof GluestackButton: Passa para ComponentProps o tipo do próprio GluestackButton, 
indicando que queremos as props que ele usa. */
// com o & - Essas são as novas props que estamos adicionando:
type Props = ComponentProps<typeof GluestackButton> & {
    title: string;
    variant?: "solid" | "outline";
    isLoading?: boolean;
};


//caso nao seja informado os valores eu deixe um padrao
export function Button({ title, variant="solid", isLoading = false, ...rest }: Props) {
    return (
        <GluestackButton
            w="$full"
            h="$14"
            bg={variant === "outline" ? "transparent" : "$green700"}
            borderWidth={ variant === "outline" ? "$1" : "$0"}
            borderColor="$green500"
            rounded="$sm" //bordar arrendodadas
            $active-bg={ variant === "outline" ? "$gray500" : "$green500"} //quando eu clicar no button - igual o hover - posso colcoar como um obj para adcionar mais coisas

            disabled={isLoading} //button desabiltado até ser clicado
            {...rest}
    

        >
            {isLoading ? (
                <ButtonSpinner  color = "$white"/>
            ) :
                (<Text color={variant === "outline" ? "$green700" : "$white" } fontFamily="$heading" fontSize="$sm"> {title} </Text>)
            }
        </GluestackButton>
    )
}