import { useContext } from "react";

import { AuthContext } from "@contexts/AuthContext";


//isso tudo para simplificar os nomes de contexto
export function useAuth(){
    const context = useContext(AuthContext)

    return context
}