import axios from "axios";
import { environments } from "../environments";

export const getLevelsPerInstance = async (instance: string) => {
  try {
    const { data } = await axios.get(
      `${environments.VOLDEMORT_API}/lxp/levels/${instance}`,
      {
        headers: {
          Authorization: `Bearer ${environments.TOKENVOLDEMORT}`,
        },
      },
    );
    return data.data;
  } catch (err) {
    console.log({ err });
  }
};
