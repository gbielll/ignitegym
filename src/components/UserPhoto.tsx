import {Image} from "@gluestack-ui/themed"
import { ComponentProps } from "react"

// Utilizando ComponentProps para obter automaticamente o tipo das props do componente Image.
// Isso evita a necessidade de definir manualmente as props do tipo toda vez.
type Props = ComponentProps<typeof Image>;

// Como não conheço todas as propriedades do componente Image, uso ...rest para capturar automaticamente qualquer prop adicional passada para ele.
export function UserPhoto({...rest}:Props){
    return <Image rounded="$full" borderWidth="$2" borderColor="$gray400"  backgroundColor="$gray500" {...rest}/>
}