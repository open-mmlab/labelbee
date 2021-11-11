import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import resources from "./resources.json";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "cn",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
