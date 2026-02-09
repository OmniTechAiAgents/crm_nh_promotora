import FgtsConsulta from "../modules/fgts/FgtsConsulta";
import CreateUser from "../pages/CreateUsers";

export const routesConfig = [
  {
    path: "/fgts",
    label: "FGTS",
    permission: "FGTS_VIEW",
    showInMenu: true,
    element: <FgtsConsulta />
  },
  {
    path: "/registro",
    label: "Criar Usuário",
    permission: "FGTS_VIEW",
    showInMenu: true,
    element: <CreateUser />
  }
];
