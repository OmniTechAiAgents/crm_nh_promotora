import { FgtsConsulta } from "../modules/fgts/FgtsConsulta";

export const routesConfig = [
  {
    path: "/fgts",
    label: "FGTS",
    permission: "FGTS_VIEW",
    showInMenu: true,
    element: <FgtsConsulta />
  }
];
