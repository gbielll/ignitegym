import { Button, Text } from "@gluestack-ui/themed"
import { ComponentProps } from "react"

type Props = ComponentProps<typeof Button> & {
    name: string
    isActive: boolean
}

export function Group({ name, isActive, ...rest }: Props) {
    return (
        <Button
            mr="$3"
            minWidth="$24"
            h="$10"
            bg="$gray600"
            rounded="$md"
            justifyContent="center"
            alignItems="center"
            borderColor="$green500"
            borderWidth={isActive ? 1 : 0}

            sx={{

                /*:active: É um pseudoclass selector 
                (seletor de pseudoclasse) do CSS que se aplica a 
                um elemento enquanto ele está sendo pressionado ou clicado. 
                No caso de um botão,*/

                ":active": {
                    borderWidth: 1
                }
            }}
            {...rest}
        >
            <Text
                color={isActive ? "$green700" : "$gray200"}
                textTransform="uppercase"
                fontSize="$xs"
                fontFamily="$heading"
            >
                {name}
            </Text>
        </Button>
    )
}