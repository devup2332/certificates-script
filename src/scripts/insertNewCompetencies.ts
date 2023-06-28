import { client } from "../graphql/client";
import { NEW_COMPETENCIE } from "../graphql/mutations/newCompetencie";
import { v4 as uuid } from "uuid";
import { environments } from "../environments";

export const insertNewCompetencies = async () => {
  const objects = [
    {
      name: "Adaptabilidad al Cambio",
      competencies_fb: "",
      client_id: "welldex",
    },
    {
      name: "Autocontrol",
      competencies_fb: "",
      client_id: "welldex",
    },
    {
      name: "Calidad de Trabajo",
      competencies_fb: "",
      client_id: "welldex",
    },
    {
      name: "Equidad",
      competencies_fb: "",
      client_id: "welldex",
    },
    {
      name: "Lealtad y Sentido de Pertenencia",
      competencies_fb: "",
      client_id: "welldex",
    },
    {
      name: "Negociación",
      competencies_fb: "",
      client_id: "welldex",
    },
    {
      name: "Tolerancia a la Presión",
      competencies_fb: "",
      client_id: "welldex",
    },
  ];
  for (let i = 0; i < 7; i++) {
    objects[i].competencies_fb = uuid();
  }
  const response = await client.request(NEW_COMPETENCIE, {
    objects,
  });
  console.log({ response });
};
