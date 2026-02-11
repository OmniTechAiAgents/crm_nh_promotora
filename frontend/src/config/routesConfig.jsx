import FgtsConsulta from "../modules/fgts/FgtsConsulta";
import CreateUser from "../pages/CreateUsers";
import FgtsEsteira from "../modules/fgts/FgtsEsteira";
export const routesConfig = [
  {
    path: "/fgts",
    label: "Consultar FGTS",
    permission: "FGTS_VIEW",
    showInMenu: true,
    element: <FgtsConsulta />
  },
  {
    path: "/registro",
    label: "Criar Usuário",
    permission: "USER_MANAGE",
    showInMenu: true,
    element: <CreateUser />
  },
  {
  path: "/fgts/esteira",
  label: "Esteira FGTS",
  permission: "FGTS_VIEW",
  showInMenu: true,
  element: <FgtsEsteira />
}

];
